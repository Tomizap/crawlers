
import Crawler, { CrawlerConfig } from "./crawler.js";
import { Page } from "puppeteer";

export class GoogleCrawler extends Crawler {

    constructor(config: CrawlerConfig) { super(config) }

    name = "GoogleCrawler"
    headless = true

    async acceptCookies(page?: Page) {
        if (this.states.cookies) { return };
        if (!page) { page = this.page ?? await this.newPage() };
        try {
            await page.waitForSelector('form[action="https://consent.google.com/save"]')
            await page.click('form[action="https://consent.google.com/save"]')
            await page.waitForNavigation()
            this.states.cookies = true
        } catch (error) {
            console.log('GoogleCaptchaError: '.red, error);
        }
    }

} 