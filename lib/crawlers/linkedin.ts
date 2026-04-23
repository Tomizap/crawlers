import { Cookie, ElementHandle } from "puppeteer";
import { sleep, sleepRandom } from "../../packages/lib/utils/sleep.js";
import { CrawlerConfig } from "../types/crawler.js";
import Crawler from "./crawler.js";
import { newPage } from "../../packages/lib/utils/browser.js";

export class LinkedinCrawler extends Crawler {

    constructor(config?: CrawlerConfig) { super(config) }

    name = "La bonne alternance"

    async login(opts: {
        credentials?: {
            auth?: {
                email: string,
                password: string
            }
            cookies?: Cookie[],
            headers?: {
                "li_at"?: string
            }
        }
    }) {

        const browser = this.browser ?? (await this.newBrowser({
            headless: this.headless
        })).browser

        if (!browser) { return }

        if ((await browser?.cookies())?.find((cookie) => cookie.name === 'li_at')) {
            return
        }

        const page = await newPage({ browser })

        await page.goto("https://www.linkedin.com/login", { waitUntil: 'networkidle2' })

        await sleep(5000)

        await page.type('#username', opts.credentials?.auth?.email || '')
        await sleep(3000)

        await page.type('#password', opts.credentials?.auth?.password || '')
        await sleep(3000)

        await page.click('button[type="submit"]', { delay: 200 })

        await page.close()

        return this

    }

    // --------------- JOBS ------------------

    async listJobs(url: string) {

    }

    async searchJobs(url: string) {

    }

    async scrapJobs(url: string) {

    }

    async applyJobs() {

    }

    async dialogApplyJob() {



    }

    // --------------- POSTS ------------------

    // --------------- JOBS ------------------

    // --------------- COMPANIES ------------------

    // --------------- GROUPS ------------------

    // --------------- PEOPLES ------------------

    async listPeoples(opts?: {
        debug?: boolean
        url?: string
    }) {

        const page = await this.newPage(opts?.url)

        const listItemsEls = await page.$$('[role="listitem"]')

        for (const listItemsEl of listItemsEls) {

            this.urlsToCrawl.push()

        }

    }

    async connectPeoples(opts?: {
        debug?: boolean
        url?: string
        message?: string | null
    }) {

        const page = await this.newPage(opts?.url)

        await page.waitForSelector('[role="listitem"] a')
        const listItemsEls = await page.$$('[role="listitem"]')

        for (const listItemsEl of listItemsEls) {

            await listItemsEl.$$eval('div > a figure ~ div ~ div a', async (links) => {

                console.log('links', links)

                for (const link of links) {

                    if (link.href.includes('/preload/search-custom-invite')) {

                        const handleButton = await page.evaluateHandle(() => {
                            const host = document.querySelector('#interop-outlet');
                            const buttons = host?.shadowRoot?.querySelectorAll('button');
                            return buttons?.[buttons.length - 1]
                        });
                        const buttonEl = handleButton.asElement() as ElementHandle<Element> | null;
                        if (!buttonEl) throw new Error('No element found');

                        await buttonEl.click();

                        const handleTextArea = await page.evaluateHandle(() => {
                            const host = document.querySelector('#interop-outlet');
                            return host?.shadowRoot?.querySelector('textarea');
                        });
                        const textAreaEl = handleTextArea.asElement() as ElementHandle<Element> | null;
                        if (!textAreaEl) throw new Error('No element found');

                    } else if (link.href.includes('/messaging/compose')) {



                    }

                }

            })

        }

        // const listItemsLinksEls = await page.$$('[role="listitem"] > div > a figure ~ div ~ div a')

        // for (const listItemsLinkEl of listItemsLinksEls) {



        //     const href = await listItemsLinkEl.getProperty('href')

        //     if (href.includes('/preload/search-custom-invite')) {

        //     } else if (href.includes('/preload/search-custom-invite')) (

        //     )

        // }

    }

} 