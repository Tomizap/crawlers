import { newBrowser } from "../packages/lib/utils/browser.js"
import { extractPhones } from "../packages/lib/utils/extract.js"

const browser = await newBrowser({ headless: false })

const page = await browser.newPage()

await page.goto('https://web.whatsapp.com/')

await new Promise(resolve => setTimeout(resolve, 60000))

// setTimeout(async () => {

const html = await page.$eval(
    '[role="dialog"]',
    (el) => el.innerHTML
)

const phones = extractPhones(html)

console.log('Extracted phones:', phones)

// }, 12000)

