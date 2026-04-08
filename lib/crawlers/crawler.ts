import 'colors'
import UserAgent from "user-agents";
import PQueue from 'p-queue';
import { Browser, Page } from 'puppeteer';
import { CrawlerConfig } from '../types/crawler.js';
import { newBrowser, newPage } from '../../packages/lib/utils/browser.js';

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

            this.browser = await newBrowser(opts)

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

            const page = await newPage({ browser: this.browser })

            if (url) { await page.goto(url, { waitUntil: 'networkidle2' }) }

            this.page = page

            return page

        } catch (error: any) {

            throw new Error('Failed to create new page', { cause: error })

        }

    }

}

export default Crawler