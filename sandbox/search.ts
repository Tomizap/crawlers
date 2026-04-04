import { Company } from "../packages/types/company.js";
import { searchCompanyContacts } from "../packages/search/company.js";

const company: Partial<Company> = {
    id: 1,
    name: 'AUTOVIA PIECES',
    siret: '94471558000014',
    siren: '944715580',
    vat_number: 'FR73944715580',
    legal_form: 'sas',
    naf_code: '45.32Z',
    naf_label: 'Commerce de détail d\'équipements automobiles',
    address: 'LOCAL N4 5 RUE JOSEPH MARSAL',
    city: 'PERPIGNAN',
    zip: '66000',
    county_code: '66',
    country: 'FR',
    creation_date: new Date('2025-05-15'),
    website_url: 'https://www.autoviapieces.fr',
    status: 'lead',
    email: null,
    phone: null,
    employees_count: null,
    annual_revenue: null,
    share_capital: null,
    trade_name: null,
    description: null,
}

const contacts = await searchCompanyContacts(company, { debug: true });
console.log('contacts:', contacts);