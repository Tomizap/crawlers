import { Cookie } from "puppeteer"

export type CrawlerConfig = {
    name?: string,
    headless?: boolean
    credentials?: {
        cookies?: Cookie[]
    }
}