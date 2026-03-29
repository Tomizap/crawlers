// import { sleep } from "../utils/sleep.js";
// import Crawler from "./crawler.js";

// class WelcomeToTheJungle extends Crawler {

//     constructor(config) {
//         super(config)
//     }

//     name = "WelcomeToTheJungle"

//     async login() {
//         await this.page.waitForSelector('[data-testid="not-logged-visible-login-button"]')
//         await this.page.click('[data-testid="not-logged-visible-login-button"]')
//         await this.page.waitForSelector('[data-testid="login-field-email"]')
//         await this.page.type('[data-testid="login-field-email"]', 'mathieu.attane@outlook.com')
//         await this.page.waitForSelector('[data-testid="login-field-password"]')
//         await this.page.type('[data-testid="login-field-password"]', 'Luciole2004_+')
//         await this.page.click('[data-testid="login-button-submit"]')
//         await sleep(5000)
//     }

//     async acceptCookies() {
//     }

//     async applyJobs(url, options) {

//         await this.page.goto(url)
//         const urls = await this.page.$$eval('[origin="jobs-home"] a', as => as.map(a => a.href))
//         for (const url of urls) {
//             await this.applyJob(url)
//         }

//     }

//     async applyJob(url, options = {}) {

//         const applier = options.applier || {}
//         const page = await this.browser.newPage()
//         await page.goto(url)
//         await page.waitForSelector('button[data-testid="job_header-button-apply"]').then(async () => {
//             await page.click('button[data-testid="job_header-button-apply"]')
//             await sleep(1000)
//             await page.click('input#terms')
//             await this.sleepRandom()
//             await page.click('input#consent')
//             await this.sleepRandom()
//             await page.click('button#apply-form-submit')
//         })

//     }

// }

// const crawler = new WelcomeToTheJungle()
// await crawler.newBrowser()
// await crawler.login()
// await crawler.applyJobs(`https://www.welcometothejungle.com/fr/jobs?refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Boffices.state%5D%5B%5D=%C3%8Ele-de-France&query=%C3%A9v%C3%A8nementiel&page=1&aroundQuery=%C3%8Ele-de-France%2C%20France`)

// export default WelcomeToTheJungle