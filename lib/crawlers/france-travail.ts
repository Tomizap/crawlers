// import Crawler from "./crawler.js";

// class FranceTravail extends Crawler {

//     constructor(config) {
//         super(config)
//     }

//     name = "France Travail"

//     async login() {

//     }

//     async acceptCookies() {
//         await this.page.waitForSelector('.pecookies', { timeout: 5000 }).then(async () => {
//             console.log('cookies');
//             await this.page.click('.pecookies #pecookies-accept-all')
//         }).catch(() => { })
//     }

//     async crawl(url) {

//         await this.newBrowser({ url })

//         if (url.includes('beta.gouv.fr/recherche-apprentissage')) {

//             this.type = 'jobs'

//             if (url.includes('page=fiche')) {

//                 await this.crawlJob()

//             } else {

//                 await this.crawlJobs()

//             }

//         }
//         return this.data

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
//         const data = items.map(async item => {
//             const page = await this.browser.newPage()
//             await page.goto(item.links.website)
//             await page.waitForSelector('[itemprop="title"]')
//             item.title = await page.$eval('[itemprop="title"]', el => el.textContent)
//             item.location = await page.$eval('[itemprop="address"]', el => el.textContent)
//             item.description = await page.$eval('[itemprop="description"]', el => el.textContent)
//             await page.close()
//             return item
//         })
//         this.data = this.data.concat(await Promise.all(data))

//     }

//     async crawlJob() {

//     }

// }

// export default FranceTravail