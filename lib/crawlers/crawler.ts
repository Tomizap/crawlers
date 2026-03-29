import 'colors'
import UserAgent from "user-agents";
import PQueue from 'p-queue';
import puppeteer from '../config/puppeteer.js';
import { Browser, Page } from 'puppeteer';

export type CrawlerConfig = {
    name?: string,
    headless?: boolean
}

class Crawler {

    name: string = 'Crawler'

    // browser
    headless = true
    page: null | Page = null
    browser: null | Browser = null

    // tools
    queue = new PQueue({ concurrency: 10, interval: 5000, intervalCap: 1 })

    // urls
    urlsToCrawl: string[] = []
    urlsCrawled: string[] = []

    // dest
    dest = ['supabase']

    // data
    data = []
    dataType = "companies"

    states = {
        loggedin: false,
        cookies: false,
    }

    constructor(config: CrawlerConfig) {
        Object.assign(this, config)
        return this
    }

    // browser
    async newBrowser(opts = {}) {

        try {

            if (this.browser) await this.browser.close().catch(() => { })

            this.browser = await puppeteer.launch({
                headless: this.headless,
                protocolTimeout: 60000,
                // executablePath: executablePath(),
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled', // ← clé principale
                    '--disable-infobars',
                    '--disable-notifications',
                    '--window-size=1366,768',
                    '--start-maximized',
                    '--disable-features=IdentityConsistency,AutofillEnableAccountWalletStorage,GoogleOneTapDesktop',
                    // '--disable-gpu',  ← retirer si possible, c'est un signal
                    // '--enable-automation', ← SUPPRIMER, c'est un flag détectable !
                ],
                defaultViewport: { width: 1366, height: 768 },
                ...opts
            });

            const context = this.browser.defaultBrowserContext();
            await context.overridePermissions('https://www.pagesjaunes.fr', [
                // Liste vide = tout refuser, y compris les notifications
            ]);
            await context.overridePermissions('https://www.google.com', [
                // Liste vide = tout refuser, y compris les notifications
            ]);
            await context.overridePermissions('https://labonnealternance.apprentissage.beta.gouv.fr', [
                // Liste vide = tout refuser, y compris les notifications
            ]);

            return this

        } catch (error: any) {

            throw new Error('Failed to create new browser', { cause: error })

        }

    }

    // page
    async newPage(url?: string) {

        try {

            if (!!!this.browser) { await this.newBrowser() }
            if (!!!this.browser) {
                throw new Error('Failed to create new browser')
            }

            const page = await this.browser.newPage();

            // Masquer navigator.webdriver
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });

                // Simuler des plugins réalistes
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });

                // Langue cohérente
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['fr-FR', 'fr', 'en-US', 'en'],
                });
            });

            // User-Agent réaliste
            await page.setUserAgent(
                new UserAgent({ deviceCategory: 'desktop' }).toString()
                //     // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            );

            // Headers cohérents
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            });

            if (url) { await page.goto(url, { waitUntil: 'networkidle2' }) }

            this.page = page

            return page

        } catch (error: any) {

            throw new Error('Failed to create new page', { cause: error })

        }

    }

}

export default Crawler