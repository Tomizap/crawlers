// import PQueue from "p-queue";
// import Crawler from "./crawler.js";
// import { sleep } from "../utils/sleep.js";
// import { searchItemData } from "../utils/search.js";
// import { saveItem } from "../utils/save.js";

// export class LaBonneAlternanceCrawler extends Crawler {

//     constructor(config) {
//         super(config)
//     }

//     name = "La bonne alternance"
//     headless = true

//     async crawlJobs(opts) {

//         const {
//             keywords = [],
//             locations = []
//         } = opts

//         const subCrawler = await new LaBonneAlternanceCrawler({ headless: this.headless, name: "Multi" })
//         subCrawler.queue = new PQueue({ concurrency: 1, interval: 3000, intervalCap: 1 })
//         await subCrawler.newBrowser({ headless: this.headless })

//         console.log((locations.length * keywords.length), 'combinations to scrape')

//         for await (const keyword of keywords)
//             for await (const location of locations) {

//                 subCrawler.queue.add(async () => {

//                     const page = await subCrawler.newPage('https://labonnealternance.apprentissage.beta.gouv.fr')

//                     if (!page) { return }

//                     try {

//                         await page.waitForNavigation({ timeout: 5000 }).catch(() => { })

//                         const formationsSelector = await page.waitForSelector('input#displayedItemTypes-Formations', { timeout: 7000 }).catch(() => false)
//                         if (!formationsSelector) { return }
//                         await page.click('input#displayedItemTypes-Formations', { timeout: 5000 }).catch(() => false)
//                         await sleep(1000)
//                         await page.type('input#metier', keyword, { delay: 100 })
//                         await sleep(1000)
//                         await page.click('div[role="presentation"] button, div[role="presentation"] li', { delay: 100 })
//                         await sleep(1000)
//                         await page.type('input#lieu', location, { delay: 100 })
//                         await sleep(1000)
//                         await page.click('div[role="presentation"] button, div[role="presentation"] li', { delay: 100 })
//                         await sleep(1000)
//                         await page.click('button[type="submit"]', { delay: 200 })
//                         await page.waitForNavigation({ timeout: 5000 }).catch(() => { })

//                         for (let index = 0; index < 50; index++) {

//                             await page.waitForSelector('h3.fr-card__title > a', { timeout: 5000 }).catch(() => { })
//                             const urlsToCrawl = (await page.$$eval('a', (links) =>
//                                 links.map(link => link.href).filter(href =>
//                                     href.includes('/emploi/')
//                                     && !href.includes('/recruteurs_lba')
//                                 )
//                             )).filter(url =>
//                                 !this.urlsCrawled.includes(url)
//                                 && !this.urlsToCrawl.includes(url)
//                                 && !this.urlsCrawled.map(u => u.split('/data')[0]).includes(url.split('/data')[0])
//                                 && !this.urlsToCrawl.map(u => u.split('/data')[0]).includes(url.split('/data')[0])
//                             )

//                             this.urlsToCrawl.push(...urlsToCrawl)

//                             await page.evaluate(() => {
//                                 document.querySelector('main > div:last-child > div:last-child > div').scrollBy(0, 500)
//                             })

//                         }

//                     } catch (error) {

//                         console.error('Error occurred while processing page crawling'.red, error)

//                     } finally {

//                         await page?.close().catch(() => { })

//                     }


//                 })

//             }

//         while (this.urlsToCrawl.length === 0) {
//             console.log('Waiting for URLs to crawl...')
//             await sleep(3000)
//         }

//         console.log(this.urlsToCrawl.length, 'URLs to crawl')

//         while (subCrawler.queue.size !== 0 && this.urlsToCrawl.length > 0) {

//             const subCrawlerSingle = new LaBonneAlternanceCrawler({ headless: this.headless, name: "Single" })
//             subCrawlerSingle.queue = new PQueue({ concurrency: 5, interval: 3000, intervalCap: 1 })
//             await subCrawlerSingle.newBrowser({ headless: this.headless })

//             await sleep(5000)

//             const batch = this.urlsToCrawl.slice(0, 200) // ← splice au lieu de slice pour retirer les URLs du tableau

//             for (const url of batch) {

//                 subCrawlerSingle.queue.add(async () => {

//                     let company = {}
//                     let job = {}

//                     // ✅ Vérifier que le browser est toujours ouvert avant de créer une page
//                     let subPage
//                     try {
//                         subPage = await subCrawlerSingle.newPage()
//                         if (!subPage) throw new Error('newPage returned undefined')
//                         await subPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
//                     } catch (err) {
//                         console.log('Erreur création page:'.red, err.message)
//                         return // ← sortir proprement sans crash
//                     }

//                     try {

//                         await subPage.waitForSelector('script#job-posting-schema ~ div div div div')
//                         const sections = await subPage.$$('script#job-posting-schema ~ div')

//                         const descriptionSection = sections[0]
//                         let companySection = sections[3]
//                         let companyName = await companySection.$$eval('a', els => els[els.length - 1].textContent).catch(() => { })
//                         if (companyName === "l'outil de simulation 1jeune1solution") {
//                             companySection = sections[2]
//                             companyName = await companySection.$$eval('a', els => els[els.length - 1].textContent).catch(() => { })
//                         }

//                         if (!!!companyName || (companyName && companyName === "")) {
//                             console.log('no company name'.red)
//                             return
//                         }

//                         const address = await companySection.$$eval('p', els => els[1].textContent.split(':')[1].trim()).catch(() => { })
//                         const city = address?.split(/\d{5}/)[1]?.trim()
//                         const zip = address?.match(/\d{5}/)[0]

//                         Object.assign(job, {
//                             labonnealternance_url: subPage.url(),
//                             name: await subPage.$eval('h3#detail-header', (el) => el.textContent).catch(() => { }),
//                             address,
//                             city,
//                             zip,
//                             description: await descriptionSection.$$eval('p', (els) => els[els.length - 1].textContent).catch(() => { }),
//                             source: "La Bonne Alternance"
//                         })

//                         const companyDetails = await companySection.$$('p')
//                         let sector
//                         let phone
//                         if (companyDetails.length === 5) {
//                             sector = await companySection.$$eval('p', els => els[els.length - 2].textContent.split(':')[1].trim()).catch(() => { })
//                             phone = await companySection.$$eval('p', els => els[els.length - 1].textContent.split(':')[1].trim()).catch(() => { })
//                         } else if (companyDetails.length === 4) {
//                             sector = await companySection.$$eval('p', els => els[els.length - 1].textContent.split(':')[1].trim()).catch(() => { })
//                         }

//                         Object.assign(company, {
//                             name: companyName,
//                             address,
//                             sector,
//                             phone,
//                             address,
//                             city,
//                             zip,
//                         })

//                         // console.log('Company:', company)
//                         // console.log('Job:', job)

//                         await searchItemData(company)

//                         console.log("Crawled La Bonne Alternance Company:".green, company);

//                         const companyCreated = await saveItem(company)

//                         if (!companyCreated) {
//                             console.log('Failed to create company'.red)
//                             return
//                         }

//                         await saveItem({
//                             ...job,
//                             company: companyCreated.id
//                         }, {
//                             type: 'jobs'
//                         })

//                     } catch (error) {

//                         console.log('Error occurred while processing URL:'.red, error)

//                     } finally {

//                         await this.urlsCrawled.push(url)
//                         this.urlsToCrawl = await this.urlsToCrawl.filter((u) => u !== url)
//                         console.log(`Crawled progress: ${this.urlsCrawled.length}/${this.urlsToCrawl.length}/${subCrawler.queue.size}`.green)

//                         await subPage?.close().catch((err) => {
//                             console.log('Error closing subPage'.red, err.message || err)
//                         })

//                     }

//                 })

//             }

//             // ✅ Attendre que TOUTE la queue soit terminée avant de fermer le browser
//             await subCrawlerSingle.queue.onIdle()
//             await subCrawlerSingle.browser.close()

//         }

//     }

// } 