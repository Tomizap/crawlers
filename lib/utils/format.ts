import { Company } from "../types/company.js"

export const formatString = (str = '') => {
    return str.trim().replace(/\s+/g, '')
}

export const formatAddress = (address = "") => {
    return {
        adresse: address.trim(),
        street_address: address.trim().split(',')[0]?.trim() || "",
        zip: address.trim().match(/\b\d{5}\b/)?.[0] || "",
        city: address.trim().split(',')[1]?.replace(/\d/g, "")?.trim() || "",
        county_code: address.trim().match(/\b\d{5}\b/)?.[0]?.slice(0, 2) || "",
        number: address.trim().match(/\d+/)?.[0] || "",
    }
}

export const formatUrl = (url = "") => {
    let formatted = url.trim();
    if (!formatted.match(/^https?:\/\//)) {
        formatted = "https://" + formatted;
    }
    return formatted;
}

export const formatPhone = (phone = "") => {
    let formatted = phone
        .trim()
        .replace(/^\+33/, '0')
        .replaceAll(/\D/g, '');
    return formatted;
}

export const formatSiret = (siret = '') => {
    let formatted = siret.trim().replace(/\s+/g, '').replace(/[\.\-]/g, '');
    return formatted
}

export const formatEmail = (email = '') => {
    let formatted = formatString(email).replace('mailto:', "")
    return formatted
}

export const formatCompany = (company: Company) => {
    if (company.email) company.email = formatEmail(company.email);
    if (company.phone) company.phone = formatPhone(company.phone);
    if (company.siret) company.siret = formatSiret(company.siret);
    return company;
}