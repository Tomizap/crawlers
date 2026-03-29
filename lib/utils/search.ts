import tldts from 'tldts';
import { fetchHTML } from './fetch.js';
import { extractContactUrls, extractEmailsFromHtml, extractPhonesFromHtml, extractUrlsFromHtml } from './extract.js';
import { isEmailValid } from './validate.js';
import { genericUsernames, regexExcludeEmail, socialNetworkDomains } from '../constants/index.js';
import { Company } from '../types/company.js';
import { formatPhone } from './format.js';
import insee, { labelNaf } from '../config/insee.js';
import axios from 'axios';
import { Contact } from '../types/contact.js';

// ─── helpers ────────────────────────────────────────────────────────────────

const normalize = (s: string) => s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ").trim()

const computeVat = (siren: string): string =>
    `FR${((12 + 3 * (parseInt(siren) % 97)) % 97).toString().padStart(2, "0")}${siren}`

// ─── address ────────────────────────────────────────────────────────────────

export async function searchCompanyAddress(company: Partial<Company>): Promise<void> {

    const applyAddress = (address: string) => {
        company.address = company.address ?? address
        const match = address.match(/^(.+),\s*(\d{5})\s+(.+)$/)
        if (match) {
            company.zip = company.zip ?? match[2].trim()
            company.city = company.city ?? match[3].trim()
            company.county_code = company.county_code ?? match[2].slice(0, 2)
            company.country = company.country ?? "FR"
        } else {
            const zipMatch = address.match(/\b(\d{5})\b/)
            if (zipMatch) {
                company.zip = company.zip ?? zipMatch[1]
                company.county_code = company.county_code ?? zipMatch[1].slice(0, 2)
                company.country = company.country ?? "FR"
                const afterZip = address.split(zipMatch[1])[1]?.trim()
                company.city = company.city ?? afterZip ?? null
            }
        }
    }

    // 1. parser l'adresse existante
    if (company.address) {
        applyAddress(company.address)
        return
    }

    // 2. recherche-entreprises.api.gouv.fr
    if (company.name) {
        try {
            const response = await axios.get(
                `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(company.name)}&page=1&per_page=1`
            )
            const r = response.data?.results?.[0]
            const siege = r?.siege
            if (siege) {
                applyAddress([siege.adresse, siege.code_postal, siege.libelle_commune].filter(Boolean).join(", "))
                company.siret = company.siret ?? siege.siret ?? null
                company.siren = company.siren ?? r.siren ?? siege.siret?.slice(0, 9) ?? null
                company.naf_code = company.naf_code ?? r.activite_principale ?? null
                company.naf_label = company.naf_label ?? r.libelle_activite_principale ?? null
                company.legal_form = company.legal_form ?? r.nature_juridique ?? null
                company.employees_count = company.employees_count ?? r.tranche_effectif_salarie ?? null
                if (company.siren) company.vat_number = company.vat_number ?? computeVat(company.siren)
                return
            }
        } catch { }
    }

    // 3. gmap_url
    if (company.gmap_url) {
        try {
            const html = await fetchHTML(company.gmap_url)
            const match = html.match(/"(\d+[^"]+,\s*\d{5}\s+[^"]+)"/)
            if (match) { applyAddress(match[1]); return }
        } catch { }
    }

    // 4. pagesjaunes_url
    if (company.pagesjaunes_url) {
        try {
            const html = await fetchHTML(company.pagesjaunes_url)
            const match = html.match(/(\d+[^<]+,\s*\d{5}\s+[A-Za-zÀ-ÿ\s-]+)/)
            if (match) { applyAddress(match[1].trim()); return }
        } catch { }
    }

    // 5. site web
    if (company.website_url) {
        const base = company.website_url.startsWith("http") ? company.website_url : `https://${company.website_url}`
        for (const path of ["", "/contact", "/a-propos", "/mentions-legales"]) {
            try {
                const html = await fetchHTML(`${base}${path}`)
                const match = html.match(/(\d+[^<\n]{5,40},\s*\d{5}\s+[A-Za-zÀ-ÿ\s-]{2,30})/)
                if (match) { applyAddress(match[1].trim()); return }
            } catch { }
        }
    }
}

// ─── siret + enrichissement légal ───────────────────────────────────────────

export const searchCompanySiret = async (company: Partial<Company>): Promise<void> => {

    await searchCompanyAddress(company)

    const name = company.name ?? ""
    const zip = company.zip ?? ""
    const city = company.city ?? ""
    const phone = company.phone?.replace(/\D/g, "") ?? ""

    const isMatch = (resultName: string, resultZip: string): boolean => {
        const n1 = normalize(resultName)
        const n2 = normalize(name)
        return (n1.includes(n2.slice(0, 12)) || n2.includes(n1.slice(0, 12))) && (!zip || resultZip === zip)
    }

    const applyFromResult = (r: any, source: "gouv" | "insee" | "pappers") => {
        if (source === "gouv") {
            company.siret = company.siret ?? r.siege?.siret ?? null
            company.siren = company.siren ?? r.siren ?? r.siege?.siret?.slice(0, 9) ?? null
            company.trade_name = company.trade_name ?? r.nom_commercial ?? null
            company.naf_code = company.naf_code ?? r.activite_principale ?? null
            company.naf_label = company.naf_label ?? r.libelle_activite_principale ?? null
            company.employees_count = company.employees_count ?? r.tranche_effectif_salarie ?? null
            company.creation_date = company.creation_date ?? (r.date_creation ? new Date(r.date_creation) : null)
            company.legal_form = company.legal_form ?? r.nature_juridique ?? null
            company.latitude = company.latitude ?? r.siege?.latitude ?? null
            company.longitude = company.longitude ?? r.siege?.longitude ?? null
        }
        if (source === "insee") {
            company.siret = company.siret ?? r.siret ?? null
            company.siren = company.siren ?? r.siret?.slice(0, 9) ?? null
            company.naf_code = company.naf_code ?? r.uniteLegale?.activitePrincipaleUniteLegale ?? null
            company.trade_name = company.trade_name ?? r.uniteLegale?.denominationUsuelle1UniteLegale ?? null
            company.creation_date = company.creation_date ?? (r.uniteLegale?.dateCreationUniteLegale ? new Date(r.uniteLegale.dateCreationUniteLegale) : null)
            company.employees_count = company.employees_count ?? r.uniteLegale?.trancheEffectifsUniteLegale ?? null
        }
        if (source === "pappers") {
            company.siret = company.siret ?? r.siege?.siret ?? null
            company.siren = company.siren ?? r.siren ?? null
            company.trade_name = company.trade_name ?? r.nom_commercial ?? null
            company.naf_code = company.naf_code ?? r.code_naf ?? null
            company.naf_label = company.naf_label ?? r.libelle_code_naf ?? null
            company.share_capital = company.share_capital ?? r.capital ?? null
            company.creation_date = company.creation_date ?? (r.date_creation ? new Date(r.date_creation) : null)
            company.legal_form = company.legal_form ?? r.forme_juridique ?? null
            company.employees_count = company.employees_count ?? r.effectif ?? null
            company.annual_revenue = company.annual_revenue ?? r.chiffre_affaires ?? null
        }
        if (company.siren) company.vat_number = company.vat_number ?? computeVat(company.siren)
    }

    // 1. recherche-entreprises.api.gouv.fr
    try {
        const response = await axios.get(
            `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(name)}&code_postal=${zip}&page=1&per_page=5`
        )
        const match = (response.data?.results ?? []).find((r: any) =>
            isMatch(r.nom_raison_sociale ?? "", r.siege?.code_postal ?? "")
        )
        if (match) { applyFromResult(match, "gouv"); return }
    } catch { }

    // 2. INSEE Sirene
    try {
        const q = `denominationUniteLegale:"${name}" AND codePostalEtablissement:"${zip}"`
        const response = await insee.get(`/api-sirene/3.11/siret?q=${encodeURIComponent(q)}&nombre=5`)
        const match = (response.data?.etablissements ?? []).find((e: any) =>
            isMatch(e.uniteLegale?.denominationUniteLegale ?? "", e.adresseEtablissement?.codePostalEtablissement ?? "")
        )
        if (match) { applyFromResult(match, "insee"); return }
    } catch { }

    // 3. Annuaire entreprises
    try {
        const response = await axios.get(
            `https://annuaire-entreprises.data.gouv.fr/api/v3/search?terme=${encodeURIComponent(`${name} ${city}`)}&code_postal=${zip}&page=1`
        )
        const match = (response.data?.results ?? []).find((r: any) =>
            isMatch(r.nom_complet ?? "", r.siege?.code_postal ?? "")
        )
        if (match) { applyFromResult(match, "gouv"); return }
    } catch { }

    // 4. INSEE par téléphone
    if (phone) {
        try {
            const response = await insee.get(
                `/api-sirene/3.11/siret?q=${encodeURIComponent(`numeroTelephoneEtablissement:"${phone}"`)}&nombre=1`
            )
            const e = response.data?.etablissements?.[0]
            if (e) { applyFromResult(e, "insee"); return }
        } catch { }
    }

    // 5. Pappers
    if (process.env.PAPPERS_API_KEY) {
        try {
            const response = await axios.get(
                `https://api.pappers.fr/v2/recherche?q=${encodeURIComponent(name)}&code_postal=${zip}&par_page=5&api_token=${process.env.PAPPERS_API_KEY}`
            )
            const match = (response.data?.resultats ?? []).find((r: any) =>
                isMatch(r.nom_entreprise ?? "", r.siege?.code_postal ?? "")
            )
            if (match) { applyFromResult(match, "pappers"); return }
        } catch { }
    }
}

// ─── url ────────────────────────────────────────────────────────────────────

export async function searchCompanyUrl(company: Partial<Company>) {

    const location = company.city || company.address || ''
    if (!company.name || !location) return company

    const excludes = [
        ...socialNetworkDomains,
        'pagesjaunes.fr', 'societe.com', 'pappers.fr', 'annuaire.com',
        'kompass.com', 'manageo.fr', 'verif.com', 'leboncoin.fr',
        'indeed.fr', 'welcometothejungle.com', 'glassdoor.fr',
    ].map(d => `-site:${d}`).join(' ')

    const query = `${company.name} ${location} site officiel ${excludes}`

    for (const url of [
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=fr-fr&k1=-1&kp=-2`,
        `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=FR&setlang=FR&count=5`,
        `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=fr&hl=fr&num=5`,
    ]) {
        try {
            const html = await fetchHTML(url)
            const links = extractUrlsFromHtml(html)
            const website = links?.find(link => !socialNetworkDomains.some(b => link.includes(b)))
            if (website) {
                company.website_url = website
                // tenter d'en déduire des réseaux sociaux
                for (const link of links ?? []) {
                    if (link.includes("facebook.com") && !company.facebook_url) company.facebook_url = link
                    if (link.includes("instagram.com") && !company.instagram_url) company.instagram_url = link
                    if (link.includes("linkedin.com") && !company.linkedin_url) company.linkedin_url = link
                    if (link.includes("twitter.com") || link.includes("x.com")) company.twitter_url = company.twitter_url ?? link
                    if (link.includes("tiktok.com") && !company.tiktok_url) company.tiktok_url = link
                    if (link.includes("youtube.com") && !company.youtube_url) company.youtube_url = link
                }
                return company
            }
        } catch { }
    }

    return company
}

// ─── email ───────────────────────────────────────────────────────────────────

export async function searchCompanyEmail(company: Partial<Company>) {
    try {

        if (company.website_url) {
            const domain = tldts.getDomain(company.website_url)
            if (domain) {
                // tester les emails génériques courants
                for (const username of genericUsernames) {
                    const email = `${username}@${domain}`
                    if (await isEmailValid(email)) {
                        company.email = email
                        return company
                    }
                }
                // scraper le site
                const email = await searchCompanyEmailByUrl(`https://${domain}`)
                if (email && await isEmailValid(email)) {
                    company.email = email
                    return company
                }
            }
        }

        // fallback : search
        await searchCompanyEmailBySearch(company)

    } catch { }
    return company
}

async function searchCompanyEmailByUrl(url: string): Promise<string | null> {
    try {
        const html = await fetchHTML(url)
        const emails = extractEmailsFromHtml(html)
        if (emails.length > 0) return emails[0]

        for (const contactUrl of extractContactUrls(html, url)) {
            try {
                const contactEmails = extractEmailsFromHtml(await fetchHTML(contactUrl))
                for (const email of contactEmails) {
                    if (await isEmailValid(email)) {
                        return email
                    }
                }
                if (contactEmails.length > 0) return contactEmails[0]
            } catch { }
        }
    } catch { }
    return null
}

async function searchCompanyEmailBySearch(company: Partial<Company>) {
    const location = company.city || company.address || ''
    const query = `email contact ${company.name} ${location}`
    for (const url of [
        `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=${encodeURIComponent(`${company.name} ${location}`)}&univers=pagesjaunes`,
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=fr-fr`,
        `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=FR&setlang=FR&count=5`,
        `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=fr&hl=fr&num=5`,
    ]) {
        try {
            const emails = extractEmailsFromHtml(await fetchHTML(url))
            for (const email of emails) {
                if (await isEmailValid(email)) {
                    return email
                }
            }
        } catch { }
    }
    return null
}

// ─── phone ───────────────────────────────────────────────────────────────────

export async function searchCompanyPhone(company: Partial<Company>) {

    // 1. site web
    if (company.website_url) {
        const result = await searchCompanyPhoneByUrl(company.website_url)
        if (result) {
            company.phone = formatPhone(result)
            return
        }
    }

    // 2. search
    const result = await searchCompanyPhoneBySearch(company)
    if (result) company.phone = formatPhone(result)
}

async function searchCompanyPhoneByUrl(url: string): Promise<string | null> {
    try {
        const html = await fetchHTML(url)
        const phones = extractPhonesFromHtml(html)
        if (phones.length > 0) return phones[0]
    } catch { }
    return null
}

async function searchCompanyPhoneBySearch(company: Partial<Company>): Promise<string | null> {
    const location = company.city || company.address || ''
    const query = `téléphone ${company.name} ${location}`
    for (const url of [
        `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=${encodeURIComponent(`${company.name} ${location}`)}&univers=pagesjaunes`,
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=fr-fr`,
        `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=FR&setlang=FR&count=5`,
        `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=fr&hl=fr&num=5`,
    ]) {
        try {
            const phones = extractPhonesFromHtml(await fetchHTML(url))
            if (phones?.length > 0) return phones[0]
        } catch { }
    }
    return null
}

// ─── contacts ────────────────────────────────────────────────────────────────

export const searchCompanyContacts = async (company: Partial<Company>): Promise<Partial<Contact>[]> => {

    const contacts: Partial<Contact>[] = []
    const seen = new Set<string>()

    const addContact = (contact: Partial<Contact>) => {
        if (!contact.first_name && !contact.last_name && !contact.email) return
        const key = `${contact.first_name ?? ""}-${contact.last_name ?? ""}-${contact.email ?? ""}`
        if (!seen.has(key)) {
            seen.add(key)
            contacts.push({ ...contact, company: company.id })
        }
    }

    const parseName = (fullName: string) => {
        const parts = fullName.trim().replace(/\s+/g, " ").split(" ")
        if (parts.length < 2) return { first_name: null, last_name: null }
        return { first_name: parts[0], last_name: parts.slice(1).join(" ") }
    }

    // 1. Pappers
    if (company.siret && process.env.PAPPERS_API_KEY) {
        try {
            const response = await axios.get(
                `https://api.pappers.fr/v2/entreprise?siret=${company.siret}&api_token=${process.env.PAPPERS_API_KEY}`,
                { timeout: 8000 }
            )
            const data = response.data
            // enrichir company en même temps
            company.share_capital = company.share_capital ?? data.capital ?? null
            company.annual_revenue = company.annual_revenue ?? data.chiffre_affaires ?? null
            company.employees_count = company.employees_count ?? data.effectif ?? null
            company.creation_date = company.creation_date ?? (data.date_creation ? new Date(data.date_creation) : null)
            company.trade_name = company.trade_name ?? data.nom_commercial ?? null
            company.description = company.description ?? data.objet_social ?? null

            for (const d of data.dirigeants ?? []) {
                if (!d.prenom && !d.nom) continue
                addContact({ first_name: d.prenom ?? null, last_name: d.nom ?? null, role: d.qualite ?? null })
            }
        } catch { }
    }

    // 2. Annuaire entreprises gouv
    if (company.siret) {
        try {
            const siren = company.siret.slice(0, 9)
            const response = await axios.get(
                `https://annuaire-entreprises.data.gouv.fr/api/v3/dirigeants/${siren}`,
                { timeout: 8000, maxRedirects: 5 }
            )
            for (const d of response.data?.dirigeants ?? []) {
                const nom = d.nom ?? d.nom_complet ?? ""
                const prenom = d.prenom ?? ""
                if (!nom && !prenom) continue
                addContact({ first_name: prenom || null, last_name: nom || null, role: d.role ?? d.qualite ?? null })
            }
        } catch { }
    }

    // 3. Societe.com
    if (company.name) {
        try {
            const searchRes = await axios.get(
                `https://www.societe.com/cgi-bin/search?champs=${encodeURIComponent(company.name)}+${company.zip ?? ""}`,
                { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 }
            )
            const companyLink = (searchRes.data as string).match(/href="(\/societe\/[^"]+\.html)"/)
            if (companyLink) {
                const pageRes = await axios.get(`https://www.societe.com${companyLink[1]}`, {
                    headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000
                })
                const blocks = [...(pageRes.data as string).matchAll(
                    /([A-ZÀÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÉÈÊËÎÏÔÙÛÜÇ\s-]{3,40})\s*<[^>]+>\s*([A-Za-zÀ-ÿ\s]{5,50}(?:gérant|président|directeur|associé|administrateur)[A-Za-zÀ-ÿ\s]*)/gi
                )]
                for (const block of blocks) {
                    const { first_name, last_name } = parseName(block[1])
                    if (first_name && last_name) {
                        addContact({ first_name, last_name, role: block[2]?.trim() ?? "Dirigeant" })
                    }
                }
            }
        } catch { }
    }

    // 4. Site web — emails nominatifs uniquement
    if (company.website_url) {
        const base = company.website_url.startsWith("http") ? company.website_url : `https://${company.website_url}`
        const genericPrefixes = ["noreply", "no-reply", "donotreply", "example", "votre@", "info@", "contact@", "accueil@", "webmaster@", "admin@", "hello@", "bonjour@"]
        for (const path of ["/contact", "/nous-contacter", "/equipe", "/team", "/mentions-legales"]) {
            try {
                const html = await fetchHTML(`${base}${path}`)
                const emails = [...html.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)]
                    .map(m => m[0].toLowerCase())
                    .filter(e => !genericPrefixes.some(p => e.includes(p)))
                for (const email of emails) {
                    const localPart = email.split("@")[0]
                    const nameParts = localPart.split(/[.\-_]/)
                    if (nameParts.length >= 2 && nameParts.every((p: string) => p.length >= 2)) {
                        addContact({
                            first_name: nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1),
                            last_name: nameParts.slice(1).join(" ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            email,
                            role: null,
                        })
                    } else {
                        addContact({ email, role: null })
                    }
                }
            } catch { }
        }
    }

    return contacts
}

// ─── orchestrateur ───────────────────────────────────────────────────────────

export async function searchCompanyData(company: Partial<Company>): Promise<Partial<Company>> {

    // 1. adresse → zip, city, county_code, country
    await searchCompanyAddress(company)

    // 2. site web → website_url + réseaux sociaux
    if (!company.website_url) await searchCompanyUrl(company)

    // 3. téléphone
    if (!company.phone) await searchCompanyPhone(company)

    // 4. email
    if (!company.email) await searchCompanyEmail(company)

    // 5. siret → siret, siren, vat_number, naf_code, naf_label, legal_form,
    //            trade_name, creation_date, employees_count, share_capital,
    //            annual_revenue, latitude, longitude
    if (!company.siret) await searchCompanySiret(company)

    // 6. siren depuis siret si pas encore dispo
    if (!company.siren && company.siret) {
        company.siren = company.siret.slice(0, 9)
    }

    // 7. vat_number depuis siren
    if (!company.vat_number && company.siren) {
        company.vat_number = computeVat(company.siren)
    }

    // 8. contacts → dirigeants avec prénom/nom + enrichissement company via Pappers
    // const contacts = await searchCompanyContacts(company)
    // console.log('contacts:', contacts)

    // 9. enriched_at
    company.enriched_at = new Date()

    return company
}