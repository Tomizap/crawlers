// import PQueue from "p-queue";
// import Crawler from "./crawler.js";
// import { sleep } from "../utils/sleep.js";
// import { searchItemData } from "../utils/search.js";
// import { saveItem } from "../utils/save.js";

// class PagesJaunes extends Crawler {

//     constructor(config) {
//         super(config)
//     }

//     name = "PagesJaunes"
//     headless = true

//     async acceptCookies() {

//         await sleep(5000)

//         // Chercher le bouton dans tous les frames
//         for (const frame of this.page.frames()) {
//             try {
//                 await frame.waitForSelector('button', { timeout: 2000 });
//                 const clicked = await frame.evaluate(() => {
//                     const buttons = Array.from(document.querySelectorAll('button'));
//                     const btn = buttons.find(b => b.textContent.trim().includes('Tout Accepter'));
//                     if (btn) { btn.click(); return true; }
//                     return false;
//                 });
//                 if (clicked) {
//                     console.log('✅ Accepté dans le frame :', frame.url());
//                     break;
//                 }
//             } catch (e) { }
//         }
//     }

//     async crawlCompanies(opts) {

//         const {
//             keywords = [],
//             locations = []
//         } = opts

//         const subCrawler = await new PagesJaunes({ headless: this.headless, name: "Multi" }).newBrowser()
//         subCrawler.queue = new PQueue({ concurrency: 1 })
//         await subCrawler.newPage('https://www.pagesjaunes.fr/')
//         await subCrawler.acceptCookies()
//         await subCrawler.page.close()

//         const subCrawlerSingle = await new PagesJaunes({ headless: this.headless, name: "Single" }).newBrowser()
//         subCrawlerSingle.queue = new PQueue({ concurrency: 3, interval: 3000, intervalCap: 1 })
//         await subCrawlerSingle.newPage('https://www.pagesjaunes.fr/')
//         await subCrawlerSingle.acceptCookies()
//         await subCrawlerSingle.page.close()

//         console.log((locations.length * keywords.length), 'combinations to scrape')

//         for (const location of locations)

//             for (const keyword of keywords) {

//                 // this.queue.add(async () => {
//                 const page = await subCrawler.newPage('https://www.pagesjaunes.fr/')

//                 try {

//                     const inputQuoiQui = await page.$('input#quoiqui')
//                     await inputQuoiQui.type(keyword, { 'delay': 100 })

//                     await sleep(1000)

//                     const inputOu = await page.$('input#ou')
//                     await inputOu.type(location, { 'delay': 100 })

//                     // Fermer le bouton X de la popup Google One Tap
//                     try {
//                         await page.waitForSelector('#credential_picker_container', { timeout: 2000 });
//                         await page.evaluate(() => {
//                             const container = document.getElementById('credential_picker_container');
//                             if (container) container.remove();
//                         });
//                         console.log('✅ Popup Google supprimée');
//                     } catch (e) {
//                         console.log('Pas de popup Google détectée');
//                     }

//                     await page.click('button#findId', { 'delay': 200 })
//                     await page.waitForNavigation({ timeout: 3000 }).catch(() => { })

//                     try {

//                         await page.waitForSelector('ul.bi-list li.bi-generic', { 'timeout': 3000 })
//                         const lis = await page.$$('ul.bi-list li.bi-generic')

//                         for (const li of lis) {

//                             try {
//                                 await li.waitForSelector('.btn_tel', { timeout: 3000 })
//                                 await li.$('.btn_tel').then(el => el.click())

//                                 let item = {
//                                     pagesjaunes_url: await li.$eval("a.bi-denomination", el => 'https://www.pagesjaunes.fr' + el.getAttribute('href')).catch(() => { }),
//                                     name: await li.$eval("h3", el => el.textContent.trim()),
//                                     sector: await li.$eval(".bi-activity-unit", el => el.textContent.trim().replace(/[\s\t\n]+\+\d+$/i, "")).catch(() => { }),
//                                     phone: await li.$eval(".bi-fantomas-display .annonceur, .number-contact",
//                                         el => el.textContent.replaceAll(/\D/g, "")
//                                     ).catch(() => { }),
//                                     address: await li.$eval(".bi-address ",
//                                         el => el.textContent
//                                             .replaceAll('Voir le plan', '')
//                                             .replaceAll('Site web', '')
//                                             .replaceAll('\n', '')
//                                             .trim()
//                                     ).catch(() => { }),
//                                 }

//                                 if (item.pagesjaunes_url !== 'https://www.pagesjaunes.fr#')

//                                     subCrawlerSingle.queue.add(async () => {

//                                         const itemPage = await subCrawlerSingle.newPage(item.pagesjaunes_url)

//                                         try {

//                                             // sleep(3000)

//                                             // await sleep(5000)
//                                             await itemPage.waitForSelector(".lvs-container a", { timeout: 10000 }).catch(() => { })
//                                             item.website_url = await itemPage.$eval(".lvs-container a", el =>
//                                                 el.textContent.includes('facebook.com')
//                                                     || el.textContent.includes('linkedin.com')
//                                                     || el.textContent.includes('instagram.com')
//                                                     || el.textContent.includes('tiktok.com')
//                                                     || el.textContent.includes('solocal.com')
//                                                     ? undefined
//                                                     : el.textContent
//                                             )
//                                                 .catch(() => { })

//                                             await searchItemData(item)

//                                             console.log("Crawled Pages Jaunes Company:".green, item);

//                                             await saveItem(item)

//                                         } catch (error) {

//                                             console.log("crawlCompaniesPageError".red, error)

//                                         } finally {

//                                             await itemPage?.close().catch(() => { })

//                                         }

//                                     })

//                             } catch { continue }

//                         }

//                         // await subCrawlerSingle.queue.onIdle()

//                     } catch (error) {

//                         console.log("crawlCompaniesPagesError".red, error)

//                     }

//                     // await this.page.click('a#pagination-next')

//                 } catch (error) {

//                     console.log("crawlCompaniesListPageError".red, error)

//                 } finally {

//                     await page?.close().catch(() => { })

//                 }

//             }

//         // })

//     }

// }

// export default PagesJaunes