// import Crawler from "./crawler.js";

// class Indeed extends Crawler {

//     constructor(config) {
//         super(config)
//     }

//     name = "Indeed"

//     async crawl(url) {

//         await this.newBrowser({ url })

//         await this.acceptCookies()

//         if (url.includes('/offres/recherche')) {

//             this.type = 'jobs'

//             await this.crawlJobs()

//         }

//     }

//     async crawlJobs() {

//         while (true) {
//             try {
//                 await this.page.waitForSelector('#zoneAfficherPlus button', { timeout: 3000 })
//                 await this.page.click('#zoneAfficherPlus button')
//             } catch (error) {
//                 break
//             }
//         }
//         const items = await this.page.$$eval('li.result a', links => links.map(l => { return { links: { website: l.href } } }))
//         console.log(`${items.length} item found`);
//         items.map(async item => {
//             await this.crawlJob(item)
//         })

//     }

//     async crawlJob(item) {
//         const page = await this.browser.newPage()
//         await page.goto(item.links.website)
//         await page.waitForSelector('[itemprop="title"]')
//         item.title = await page.$eval('[itemprop="title"]', el => el.textContent)
//         item.location = await page.$eval('[itemprop="address"]', el => el.textContent)
//         item.description = await page.$eval('[itemprop="description"]', el => el.textContent)
//         await page.close()
//         return item
//     }

// }

// export default Indeed