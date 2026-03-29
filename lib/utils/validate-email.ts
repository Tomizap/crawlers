import validator from 'validator';
import dns from 'dns/promises';
import net from 'net';
import disposableDomains from 'disposable-email-domains' with { type: 'json' };
import { getEnv } from '../config/env.js';

import { PingEmail } from 'ping-email';
import { freeEmailProviders, genericUsernames } from '../constants/index.js';
const pingEmail = new PingEmail({
    port: 25, // Default SMTP port
    fqdn: getEnv('SMTP_HOST'), // Fully Qualified Domain Name of your SMTP server
    sender: getEnv('SMTP_USER'), // Email address to use as the sender in SMTP checks,
    timeout: 10000, // Time in milliseconds to wait for a response from the SMTP server
    attempts: 3, // Number of attempts to verify the email address
});

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const SUSPICIOUS_LOCAL_REGEX = /^\.|\.$|\.{2,}|[^\x20-\x7E]/;

const SMTP_TIMEOUT_MS = 5000;

// Score weights — orientés B2B (on pénalise free providers)
const WEIGHTS = {
    validFormat: 0.15,
    hasMx: 0.20,
    mxReachable: 0.10,
    smtpAccepted: 0.20,
    notDisposable: 0.10,
    notGeneric: 0.05,
    notFreeProvider: 0.08, // pénalité B2B forte
    notCatchAll: 0.07,
    hasSpf: 0.03,
    hasDmarc: 0.02,
};

const smtpConfigs = [
    {
        port: 25,
        fqdn: getEnv('SMTP_HOST'),
        sender: getEnv('SMTP_USER'),
        timeout: 8000,
        attempts: 1,
    },
    {
        port: 587,
        fqdn: getEnv('SMTP_HOST'),
        sender: getEnv('SMTP_USER'),
        timeout: 8000,
        attempts: 1,
    },
    {
        port: 465,
        fqdn: getEnv('SMTP_HOST'),
        sender: getEnv('SMTP_USER'),
        timeout: 8000,
        attempts: 1,
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise l'email selon les règles du provider.
 * Gmail : supprime les points et les +alias.
 * Outlook/Hotmail : supprime les +alias uniquement.
 */
function normalizeEmail(email: string) {
    const [local, domain] = email.toLowerCase().split('@');

    if (['gmail.com', 'googlemail.com'].includes(domain)) {
        const cleaned = local.split('+')[0].replace(/\./g, '');
        return `${cleaned}@gmail.com`; // googlemail → gmail
    }

    if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
        const cleaned = local.split('+')[0];
        return `${cleaned}@${domain}`;
    }

    return `${local}@${domain}`;
}

/**
 * Résout les MX et retourne la liste triée par priorité (du plus prioritaire au moins).
 * Retourne [] si aucun MX ou erreur DNS.
 */
async function resolveMxSorted(domain: string) {
    try {
        const records = await dns.resolveMx(domain);
        return records.sort((a, b) => a.priority - b.priority);
    } catch {
        return [];
    }
}

/**
 * Vérifie qu'on peut ouvrir une connexion TCP sur le port 25 du MX principal.
 * Retourne true/false.
 */
function checkMxReachable(mxHost: string, timeoutMs = SMTP_TIMEOUT_MS) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host: mxHost, port: 25 });
        const timer = setTimeout(() => {
            socket.destroy();
            resolve(false);
        }, timeoutMs);

        socket.on('connect', () => {
            clearTimeout(timer);
            socket.destroy();
            resolve(true);
        });

        socket.on('error', () => {
            clearTimeout(timer);
            resolve(false);
        });
    });
}

/**
 * Détecte si le domaine est catch-all :
 * envoie un SMTP ping vers une adresse aléatoire improbable.
 * - true  → catch-all confirmé
 * - false → non catch-all
 * - null  → impossible à déterminer (erreur / timeout)
 */
async function detectCatchAll(domain: string) {
    const fakeEmail = `zzz-noreply-${Date.now()}-x@${domain}`;
    try {
        const result = await pingEmail.ping(fakeEmail);
        return result.success === true;
    } catch {
        return null;
    }
}

/**
 * Vérifie la présence d'un enregistrement SPF (TXT commençant par "v=spf1").
 */
async function checkSpf(domain: string) {
    try {
        const records = await dns.resolveTxt(domain);
        return records.flat().some((r) => r.startsWith('v=spf1'));
    } catch {
        return false;
    }
}

/**
 * Vérifie la présence d'un enregistrement DMARC (_dmarc.<domain>).
 */
async function checkDmarc(domain: string) {
    try {
        const records = await dns.resolveTxt(`_dmarc.${domain}`);
        return records.flat().some((r) => r.startsWith('v=DMARC1'));
    } catch {
        return false;
    }
}

/**
 * Calcule le qualityScore à partir des flags du résultat.
 * Chaque flag contribue à hauteur de son poids uniquement s'il est positivement validé.
 * isCatchAll === null → neutre (0), pas de pénalité ni de bonus.
 */
type ValidateEmailResult = {
    email: string | null;
    normalizedEmail: string | null;
    validFormat: boolean;
    hasSuspiciousFormat: boolean;
    hasMx: boolean;
    mxReachable: boolean;
    primaryMx: string | null;
    smtpCheck: boolean | null;
    isCatchAll: boolean | null;
    isDisposable: boolean;
    isGeneric: boolean;
    isFreeProvider: boolean;
    hasSpf: boolean;
    hasDmarc: boolean;
    domain: string | null;
    localPart: string | null;
    qualityScore: number;
}
function computeScore(result: ValidateEmailResult) {
    return (
        (result.validFormat ? WEIGHTS.validFormat : 0) +
        (result.hasMx ? WEIGHTS.hasMx : 0) +
        (result.mxReachable ? WEIGHTS.mxReachable : 0) +
        (result.smtpCheck === true ? WEIGHTS.smtpAccepted : 0) +
        (!result.isDisposable ? WEIGHTS.notDisposable : 0) +
        (!result.isGeneric ? WEIGHTS.notGeneric : 0) +
        (!result.isFreeProvider ? WEIGHTS.notFreeProvider : 0) +
        (result.isCatchAll === false ? WEIGHTS.notCatchAll : 0) +
        (result.hasSpf ? WEIGHTS.hasSpf : 0) +
        (result.hasDmarc ? WEIGHTS.hasDmarc : 0)
    );
}

// ---------------------------------------------------------------------------
// Fonction principale
// --------------------------------------------------------------------------- 

export async function validateEmail(email: string) {

    const result: ValidateEmailResult = {
        email,
        normalizedEmail: null,
        validFormat: false,
        hasSuspiciousFormat: false,
        hasMx: false,
        mxReachable: false,
        primaryMx: null,
        smtpCheck: null,
        isCatchAll: null,
        isDisposable: false,
        isGeneric: false,
        isFreeProvider: false,
        hasSpf: false,
        hasDmarc: false,
        domain: null,
        localPart: null,
        qualityScore: 0,
    }

    // 1. Format de base
    result.validFormat = validator.isEmail(email);
    if (!result.validFormat) return result; // score = 0, on sort tôt

    // 2. Découpage + normalisation
    const [local, domain] = email.toLowerCase().split('@');
    result.domain = domain;
    result.localPart = local;
    result.normalizedEmail = normalizeEmail(email);

    // 3. Syntaxe localPart stricte (double point, point en début/fin, chars non-ASCII)
    result.hasSuspiciousFormat = SUSPICIOUS_LOCAL_REGEX.test(local);

    // 4. MX records (triés par priorité)
    const mxRecords = await resolveMxSorted(domain);
    result.hasMx = mxRecords.length > 0;
    if (!result.hasMx) {
        result.qualityScore = computeScore(result);
        return result; // Sans MX, inutile d'aller plus loin
    }
    result.primaryMx = mxRecords[0].exchange;

    // 5. Joignabilité TCP du MX principal (port 25)
    result.mxReachable = await checkMxReachable(result.primaryMx) as boolean;
    if (!result.mxReachable) {
        // SMTP timeout → considéré comme invalide (choix B2B)
        result.qualityScore = computeScore(result);
        return result;
    }

    // 6. Adresse jetable
    result.isDisposable = disposableDomains.includes(domain);

    // 7. Utilisateur générique
    result.isGeneric = genericUsernames.has(local);

    // 8. Free provider (pénalisé en B2B)
    result.isFreeProvider = freeEmailProviders.has(domain);

    // ---------------------------------------------------------------------------
    // Helper : tente un SMTP ping sur un port donné
    // Retourne true/false/null (null = erreur réseau, pas un rejet clair)
    // ---------------------------------------------------------------------------

    async function trySMTPPing(email: string, config: typeof smtpConfigs[number]) {
        const pinger = new PingEmail(config);
        try {
            const result = await pinger.ping(email);
            return { success: true, accepted: result, port: config.port };
        } catch (err: any) {
            // On distingue un rejet explicite (550, 551...) d'un échec réseau
            const isExplicitReject = err?.message?.match(/^5[0-9]{2}/);
            return {
                success: false,
                accepted: null,
                port: config.port,
                explicitReject: !!isExplicitReject,
                error: err?.message,
            };
        }
    }

    // ---------------------------------------------------------------------------
    // 9. SMTP ping avec fallback 25 → 587 → 465
    // ---------------------------------------------------------------------------

    let smtpResult = null;

    for (const config of smtpConfigs) {
        const attempt = await trySMTPPing(email, config);
        // console.log(`SMTP check port ${attempt.port} for ${email}:`, attempt);

        if (attempt.success) {
            // Le serveur a répondu → on a un résultat fiable, on s'arrête
            smtpResult = attempt.accepted?.valid === true && attempt.accepted.success === true;
            break;
        }

        if (attempt.explicitReject) {
            // Code 5xx = rejet définitif (adresse inconnue), inutile d'essayer d'autres ports
            smtpResult = false;
            // console.log(`Explicit SMTP reject on port ${attempt.port}, stopping fallback.`);
            break;
        }

        // Sinon : timeout ou erreur réseau → on tente le port suivant
        // console.log(`Port ${attempt.port} unreachable, trying next fallback...`);
    }

    // Si aucun port n'a répondu → invalide en B2B
    result.smtpCheck = smtpResult ?? false;

    // 10. Catch-all (seulement si SMTP a répondu positivement)
    if (result.smtpCheck === true) {
        result.isCatchAll = await detectCatchAll(domain);
    }

    // 11. SPF + DMARC (en parallèle pour gagner du temps)
    [result.hasSpf, result.hasDmarc] = await Promise.all([
        checkSpf(domain),
        checkDmarc(domain),
    ]);

    // 12. Score final
    result.qualityScore = computeScore(result);

    return result;
}