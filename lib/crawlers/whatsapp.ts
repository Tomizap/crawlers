
import { newBrowser } from "../../packages/lib/utils/browser.js";
import { extractPhones } from "../../packages/lib/utils/extract.js";
import { sleep } from "../../packages/lib/utils/sleep.js";
import { CrawlerConfig } from "../types/crawler.js";
import Crawler from "./crawler.js";
import { Page } from "puppeteer";

export class WhatsappCrawler extends Crawler {

    constructor(config: CrawlerConfig) { super(config) }

    name = "WhatsappCrawler"
    headless = false

    async extractContactsInCommunity() {

        const browser = await newBrowser({ headless: false })

        const page = await browser.newPage()

        await page.goto('https://web.whatsapp.com/')

        await sleep(120000)

        const phones = extractPhones(
            await page.content()
        )

        console.log('Extracted phones:', phones)

    }

} 