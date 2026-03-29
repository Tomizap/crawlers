import UserAgent from 'user-agents'
import got from 'got'
import puppeteer from '../config/puppeteer.js'

export async function fetchHTML(url: string) {

    if (!url || url === '') { return }

    // ─── Méthode 1 : got ──────────────────────────────────────────────────────
    try {
        const res = await got(url, {
            headers: {
                'User-Agent': new UserAgent({ deviceCategory: 'desktop' }).toString(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            },
            timeout: { request: 5000 },
            retry: { limit: 2, statusCodes: [429, 500, 502, 503] },
            decompress: true,
            followRedirect: true,
            throwHttpErrors: false
        })
        if (res.body?.length > 500) return res.body
    } catch (e: any) {
        // console.log('got failed:', e.message, url)
    }

    // ─── Méthode 2 : proxy allorigins ─────────────────────────────────────────
    try {
        const res = await got(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
            timeout: { request: 8000 },
            throwHttpErrors: false
        })
        const data = JSON.parse(res.body)
        if (data?.contents?.length > 500) return data.contents
    } catch (e: any) {
        // console.log('allorigins failed:', e.message, url)
    }

    // ─── Méthode 3 : Google Cache ─────────────────────────────────────────────
    try {
        const res = await got(`https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`, {
            headers: { 'User-Agent': new UserAgent({ deviceCategory: 'desktop' }).toString() },
            timeout: { request: 8000 },
            throwHttpErrors: false
        })
        if (res.body?.length > 500) return res.body
    } catch (e: any) {
        // console.log('google cache failed:', e.message, url)
    }

    // ─── Méthode 4 : Puppeteer ────────────────────────────────────────────────
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-notifications', '--disable-features=GoogleOneTapDesktop']
        })
        const page = await browser.newPage()
        await page.setUserAgent(new UserAgent({ deviceCategory: 'desktop' }).toString())
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
        const html = await page.content()
        await browser.close()
        if (html?.length > 500) return html
    } catch (e: any) {
        // console.log('puppeteer failed:', e.message, url)
    }

    return undefined
}