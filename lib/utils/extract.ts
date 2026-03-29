
import * as cheerio from "cheerio";
import { formatPhone } from "./format.js";
import { emailRegex, phoneRegex } from "../constants/regex.js";
import { regexExcludePhone, socialNetworkDomains } from "../constants/index.js";

export function extractEmailsFromHtml(html = '') {
    const matches = html.match(emailRegex)?.filter((v) => !socialNetworkDomains.includes(v.split('@')[1])) || [];
    return [...new Set(matches)]
}

export function extractContactUrls(html = '', baseUrl?: string) {
    const $ = cheerio.load(html);
    const links: string[] = [];
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href")?.toLowerCase();
        if (socialNetworkDomains.includes(href?.split('@')[1] || "zzzzzzzzzzzzzz")) return;
        if (href?.includes("contact")) {
            // Normalise le lien (relatif ou absolu)
            if (href?.startsWith("http")) links.push(href);
            else links.push(new URL(href || '', baseUrl).href);
        }
    });
    return [...new Set(links)]; // supprime les doublons
}

export function extractUrlsFromHtml(html = '') {
    const $ = cheerio.load(html || '')
    const links: string[] = []
    $('.result__url').each((_, el) => {
        const href = $(el).text().trim()
        if (href) links.push(href.startsWith('http') ? href : `https://${href}`)
    })
    return [...new Set(links)]; // supprime les doublons
}

export function extractPhonesFromHtml(html = '') {
    const $ = cheerio.load(html)
    $('script, style, noscript').remove()
    const text = $.root().text()
    const matches = text.match(phoneRegex) || []
    return [...new Set(
        matches
            .map(formatPhone)
            .filter(phone => !regexExcludePhone.some(exclude => phone.includes(exclude)))
    )]
}