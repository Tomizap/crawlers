import PQueue from "p-queue";
import { sleep, sleepRandom } from "../../packages/utils/sleep.js";
import { saveItem } from "../../packages/crud/save.js";
import { withTimeout } from "../../packages/utils/utils.js";
import { Company } from "../../packages/types/company.js";
import { GoogleCrawler } from "./google.js";
import { Page } from "puppeteer";
import { formatCompany } from "../../packages/utils/format.js";
import { CrawlerConfig } from "../types/crawler.js";
import { searchCompanyData, searchCompanyContacts } from "../../packages/search/company.js";
import { searchContactData } from "../../packages/search/contact.js";

export class GoogleMapCrawler extends GoogleCrawler {

    constructor(config: CrawlerConfig) { super(config) }

    name = "GoogleMapCrawler"
    headless = true

    async crawl(urls: string[]) {

        if (!urls || urls.length === 0) return

        const subCrawler = await new GoogleMapCrawler({ headless: this.headless, name: "Multi" }).newBrowser()
        subCrawler.queue = new PQueue({ concurrency: 1 })
        await subCrawler.newPage(urls[0])
        await subCrawler.acceptCookies()
        await subCrawler.page?.close()

        for (const url of urls) {

            subCrawler.queue.add(async () => {

                let page: Page | null = null

                try {

                    // console.log('Crawling URL:', url)
                    page = await subCrawler.newPage(url)

                    await page.waitForSelector('div[role="feed"]')

                    let maxSameCount = 0
                    for (let index = 0; index < 30; index++) {

                        await sleepRandom(500, 1000)

                        await page.evaluate(() => {
                            document.querySelector('div[role="feed"]')?.scrollBy(0, 99999);
                        })
                        if ((await page.$('[role="feed"] p.fontBodyMedium')) !== null) break
                        // await this.sleepRandom()

                        let hrefs = await page.$$eval('[role="feed"] a.hfpxzc', (as) => as.map(a => a.href))
                        hrefs = hrefs.filter(url =>
                            !this.urlsCrawled.includes(url)
                            && !this.urlsToCrawl.includes(url)
                            && !this.urlsCrawled.map(u => u.split('/data')[0]).includes(url.split('/data')[0])
                            && !this.urlsToCrawl.map(u => u.split('/data')[0]).includes(url.split('/data')[0])
                        )
                        this.urlsToCrawl.push(...hrefs.map(u => u.split('?')[0]))

                        if (hrefs.length === 0) {
                            maxSameCount++
                            // console.log('Same last item count:'.yellow, maxSameCount);
                        } else {
                            maxSameCount = 0;
                        }
                        if (maxSameCount > 10) {
                            console.log('Max same item count reached'.red, url)
                            break
                        }

                        if (await page.$('[role="feed"] p.fontBodyMedium') !== null) break

                    }

                } catch (error: any) {

                    console.log("CrawlGmapPlacesError".red, error.message || error, ' - ', url);

                } finally {

                    await page?.close().catch((err) => {
                        console.log('Error closing subPage'.red, err.message || err);
                    })

                }

            })

        }

        subCrawler.queue.onIdle().then(() => {
            subCrawler.browser?.close().catch(() => {
                console.log('error to close subCrawler browser')
            })
        })

        while (this.urlsToCrawl.length === 0) {
            console.log('Waiting for URLs to crawl...')
            await sleep(3000)
        }

        const subQueue = new PQueue({ concurrency: 3 })

        while (this.urlsToCrawl.length > 0) {

            console.log(this.urlsToCrawl.length, 'URLs to crawl')

            const subCrawlerSingle = new GoogleMapCrawler({ headless: this.headless, name: "Single" })
            subCrawlerSingle.queue = new PQueue({ concurrency: 5, interval: 5000, intervalCap: 1 })
            await subCrawlerSingle.newPage(urls[0])
            await subCrawlerSingle.acceptCookies()
            await subCrawlerSingle.page?.close()

            for (const url of this.urlsToCrawl.slice(0, 200)) {

                subCrawlerSingle.queue.add(async () => {

                    let company: Partial<Company> = {}
                    let subPage: Page | null = null

                    try {

                        subPage = await subCrawlerSingle.newPage().catch(() => {
                            console.log('Error creating subPage', url)
                            return null
                        });
                        if (!subPage) return;

                        await withTimeout(
                            (async () => {

                                await subPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })

                                company.gmap_url = (await subPage.url()).split('?')[0]

                                if (await subPage.waitForSelector('[role="main"] [data-item-id="address"]', { timeout: 10000 }).catch(() => null) === null) {
                                    // console.log('no gmap address'.red)
                                    return
                                }

                                const mainTag = await subPage.$$('[role="main"]').then(ms => ms[-1] || ms[0])
                                company = formatCompany({
                                    ...company,
                                    name: await mainTag.$eval('h1', el => el.textContent),
                                    phone: await mainTag.$eval(
                                        '[data-tooltip="Copier le numéro de téléphone"] .fontBodyMedium',
                                        el => el.textContent.replace(/[a-zA-Z\s\.\-]/gi, '').replace('+33', '0')
                                    ).catch(_ => null),
                                    website_url: await mainTag.$eval('[data-item-id="authority"] .fontBodyMedium', el => el.textContent).catch(_ => null),
                                    address: await mainTag.$eval('[data-item-id="address"] .fontBodyMedium', el => el.textContent).catch(_ => null),
                                    sector: await mainTag.$eval('button.DkEaL ,[jsaction="pane.wfvdle18.category"]', el => el.textContent).catch(_ => null),
                                })

                                await searchCompanyData(company)

                            })(),  // toute la logique dans une fonction
                            120000,
                            url
                        )

                    } catch (error: any) {

                        console.log("CrawlGmapPlacesSubPageError".red, error.message || error);

                    } finally {

                        this.urlsCrawled.push(url)
                        this.urlsToCrawl = this.urlsToCrawl.filter((u) => u !== url)
                        console.log(`Crawled progress: ${this.urlsCrawled.length}/${this.urlsToCrawl.length}/${subCrawler.queue.size}`.green);

                        await subPage?.close().catch((err) => {
                            console.log('Error closing subPage'.red, err.message || err);
                        })

                    }

                })

            }

            await subCrawlerSingle.queue.onIdle()
            await subCrawlerSingle.browser?.close().catch(() => {
                console.log('error to close subCrawlerSingle browser')
            })

        }

        await subCrawler.queue.onIdle()
        await subCrawler.browser?.close().catch(() => {
            console.log('error to close subCrawler browser')
        })

        await subQueue.onIdle()

    }

} 