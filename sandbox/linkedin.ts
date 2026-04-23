import { Cookie } from 'puppeteer'
import { LinkedinCrawler } from '../lib/crawlers/linkedin.js'
import { CrawlerConfig } from '../lib/types/crawler.js'

const cookie = {
    name: 'li_at',
    value: "AQEFAHQBAAAAABvHswUAAAGcL3FdLQAAAZ2bHULsTgAAF3VybjpsaTptZW1iZXI6NzY4Mjk2NDM0jDQPORBiHQkQ0Q7V4HK2AcB2-2a8SdPRofZvg9UteyIFcxpOciXfv91aymfpJaQnXroAFVdv3tM9Kx54QCD7by95kQfqwkMavu-NPb-zmcOGJRNEbV5M95qJs1CgSYnNchFBMNIbaupnkv2biVO4jh36qJODHNSCJ03aPyV-T1Mzjnu6L6HDzwvg1176w2vtJkmJuA",
} as any as Cookie

const linkedinCrawler = new LinkedinCrawler({
    headless: false
} as CrawlerConfig)

await linkedinCrawler.login({
    credentials: {
        auth: {
            email: "zaptom.pro@gmail.com",
            password: "K#doLUyQ54NjXo"
        }
    }
})

await linkedinCrawler.connectPeoples({
    debug: true,
    url: "https://www.linkedin.com/search/results/people/",
    message: "Hello, I would like to connect with you!"
})