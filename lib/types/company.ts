export type CompanyStatus = 'blacklisted' | 'disqualified' | 'lead' | 'prospect'
export type CompanySize = 'solo' | 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
export type CompanyLegalForm = 'ei' | 'eirl' | 'eurl' | 'sarl' | 'sas' | 'sasu' | 'sa' | 'snc' | 'sci' | 'association' | 'other'

export type Company = {

    id: number

    // name
    name: string | null
    trade_name: null | string          // nom commercial (différent de la raison sociale)

    // status
    status: CompanyStatus

    // contact
    email: string | null
    phone: null | string
    phone_secondary: null | string

    // location
    address: null | string
    city: null | string
    zip: null | string
    county_code: null | string
    country: null | string
    latitude: null | number
    longitude: null | number

    // legal
    siret: null | string               // 14 chiffres
    siren: null | string               // 9 premiers chiffres du siret
    vat_number: null | string          // numéro TVA intracommunautaire (FR + 2 clés + siren)
    legal_form: null | CompanyLegalForm
    naf_code: null | string            // code APE/NAF ex: "4711F"
    naf_label: null | string           // libellé du code NAF
    rcs_number: null | string          // numéro RCS
    share_capital: null | number       // capital social en euros
    creation_date: null | Date         // date de création de l'entreprise

    // size
    size: null | CompanySize
    employees_count: null | number
    annual_revenue: null | number      // chiffre d'affaires en euros

    // infos
    sector: null | string
    description: null | string
    comment: null | string
    tags: null | string[]

    // dates
    enriched_at: null | Date
    created_at: null | Date
    scrapped_at: null | Date
    emailed_at: null | Date
    called_at: null | Date

    // links
    website_url: null | string
    facebook_url: null | string
    instagram_url: null | string
    linkedin_url: null | string
    twitter_url: null | string
    tiktok_url: null | string
    youtube_url: null | string
    gmap_url: null | string
    pagesjaunes_url: null | string
    pappers_url: null | string
    societe_url: null | string

}