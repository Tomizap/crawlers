import { GoogleMapCrawler } from '../lib/crawlers/google-map.js'
import { shuffleArray } from "../lib/utils/utils.js";

const config = {
    headless: false,
}


const keywords = shuffleArray([
    // Commerce / Vente
    "magasin prêt à porter",
    "boutique vêtements",
    "magasin chaussures",
    "magasin décoration",
    "magasin ameublement",
    "boutique accessoires",
    "magasin cosmétique",
    "parfumerie",
    "boutique téléphonie",
    "magasin multimédia",
    "magasin électroménager",
    "commerce de détail",
    "franchise commerce",
    "point de vente",
    "boutique centre commercial",

    // Grande distribution / alimentaire
    "supermarché",
    "hypermarché",
    "supérette",
    "magasin bio",
    "épicerie",
    "boulangerie",
    "pâtisserie",
    "chocolaterie",
    "fromagerie",
    "primeur",

    // Immobilier / assurance / banque
    "agence immobilière",
    "gestion locative",
    "syndic de copropriété",
    "courtier immobilier",
    "assurance",
    "agence assurance",
    "banque",
    "courtier crédit",

    // Administratif / services B2B
    "cabinet comptable",
    "expert comptable",
    "cabinet conseil",
    "centre de formation",
    "organisme de formation",
    "agence intérim",
    "cabinet recrutement",
    "société de services",
    "prestataire de services",
    "externalisation administrative",

    // Marketing / digital
    "agence marketing",
    "agence communication",
    "agence digitale",
    "agence web",
    "marketing digital",
    "community manager",
    "agence publicité",
    "startup marketing",
    "e-commerce",
    "site e-commerce",

    // Support / administratif terrain
    "secrétariat",
    "secrétariat médical",
    "centre d'appel",
    "call center",
    "service client",
    "relation client",
    "back office",
    "gestion administrative"
]);
const locations = shuffleArray([
    // Paris
    "Paris 8e 75008",
    "Paris 9e 75009",
    "Paris 10e 75010",
    "Paris 11e 75011",
    "Paris 12e 75012",
    "Paris 13e 75013",
    "Paris 14e 75014",
    "Paris 15e 75015",
    "Paris 16e 75016",
    "Paris 17e 75017",
    "Paris 18e 75018",
    "Paris 19e 75019",
    "Paris 20e 75020",

    // 92
    "Boulogne-Billancourt 92100",
    "Nanterre 92000",
    "Courbevoie 92400",
    "Colombes 92700",
    "Asnières-sur-Seine 92600",
    "Rueil-Malmaison 92500",
    "Levallois-Perret 92300",
    "Issy-les-Moulineaux 92130",
    "Clamart 92140",
    "Clichy 92110",

    // 93
    "Saint-Denis 93200",
    "Montreuil 93100",
    "Aubervilliers 93300",
    "Aulnay-sous-Bois 93600",
    "Drancy 93700",
    "Noisy-le-Grand 93160",
    "Pantin 93500",
    "Bobigny 93000",
    "Rosny-sous-Bois 93110",

    // 94
    "Créteil 94000",
    "Vitry-sur-Seine 94400",
    "Ivry-sur-Seine 94200",
    "Saint-Maur-des-Fossés 94100",
    "Champigny-sur-Marne 94500",
    "Villejuif 94800",
    "Maisons-Alfort 94700",
    "Alfortville 94140",

    // 91
    "Évry-Courcouronnes 91000",
    "Corbeil-Essonnes 91100",
    "Massy 91300",
    "Savigny-sur-Orge 91600",
    "Sainte-Geneviève-des-Bois 91700",
    "Palaiseau 91120",
    "Athis-Mons 91200",
    "Brunoy 91800",

    // 95
    "Argenteuil 95100",
    "Cergy 95000",
    "Sarcelles 95200",
    "Garges-lès-Gonesse 95140",
    "Franconville 95130",
    "Herblay 95220",
    "Taverny 95150",
    "Bezons 95870",

    // 77
    "Meaux 77100",
    "Chelles 77500",
    "Melun 77000",
    "Pontault-Combault 77340",
    "Savigny-le-Temple 77176",
    "Torcy 77200",
    "Champs-sur-Marne 77420",
    "Lagny-sur-Marne 77400",
    "Ozoir-la-Ferrière 77330",

    // 78
    "Versailles 78000",
    "Sartrouville 78500",
    "Mantes-la-Jolie 78200",
    "Saint-Germain-en-Laye 78100",
    "Poissy 78300",
    "Conflans-Sainte-Honorine 78700",
    "Les Mureaux 78130",
    "Plaisir 78370",
    "Trappes 78190"
]);
const frenchDepartments = shuffleArray([
    "01 Ain", "02 Aisne", "03 Allier", "04 Alpes-de-Haute-Provence",
    "05 Hautes-Alpes", "06 Alpes-Maritimes", "07 Ardèche", "08 Ardennes",
    "09 Ariège", "10 Aube", "11 Aude", "12 Aveyron", "13 Bouches-du-Rhône",
    "14 Calvados", "15 Cantal", "16 Charente", "17 Charente-Maritime",
    "18 Cher", "19 Corrèze", "2A Corse-du-Sud", "2B Haute-Corse",
    "21 Côte-d'Or", "22 Côtes-d'Armor", "23 Creuse", "24 Dordogne",
    "25 Doubs", "26 Drôme", "27 Eure", "28 Eure-et-Loir",
    "29 Finistère", "30 Gard", "31 Haute-Garonne", "32 Gers",
    "33 Gironde", "34 Hérault", "35 Ille-et-Vilaine", "36 Indre",
    "37 Indre-et-Loire", "38 Isère", "39 Jura", "40 Landes",
    "41 Loir-et-Cher", "42 Loire", "43 Haute-Loire", "44 Loire-Atlantique",
    "45 Loiret", "46 Lot", "47 Lot-et-Garonne", "48 Lozère",
    "49 Maine-et-Loire", "50 Manche", "51 Marne", "52 Haute-Marne",
    "53 Mayenne", "54 Meurthe-et-Moselle", "55 Meuse", "56 Morbihan",
    "57 Moselle", "58 Nièvre", "59 Nord", "60 Oise",
    "61 Orne", "62 Pas-de-Calais", "63 Puy-de-Dôme", "64 Pyrénées-Atlantiques",
    "65 Hautes-Pyrénées", "66 Pyrénées-Orientales", "67 Bas-Rhin", "68 Haut-Rhin",
    "69 Rhône", "70 Haute-Saône", "71 Saône-et-Loire", "72 Sarthe",
    "73 Savoie", "74 Haute-Savoie", "75 Paris", "76 Seine-Maritime",
    "77 Seine-et-Marne", "78 Yvelines", "79 Deux-Sèvres", "80 Somme",
    "81 Tarn", "82 Tarn-et-Garonne", "83 Var", "84 Vaucluse",
    "85 Vendée", "86 Vienne", "87 Haute-Vienne", "88 Vosges",
    "89 Yonne", "90 Territoire de Belfort", "91 Essonne", "92 Hauts-de-Seine",
    "93 Seine-Saint-Denis", "94 Val-de-Marne", "95 Val-d'Oise",
]);
const batteryB2BKeywords = shuffleArray([

    // 🔥 Distribution / Grossistes (TOP PRIORITÉ)
    "grossiste batteries professionnel",
    "distributeur batteries B2B",
    "fournisseur batteries industriel",
    "importateur batteries Europe",
    // "wholesale battery distributor",
    // "bulk battery supplier",
    // "battery distributor Europe",

    // 🏭 Industrie / OEM
    // "fabricant équipement batterie",
    // "intégrateur solutions batterie",
    // "OEM battery supplier",
    // "battery pack manufacturer B2B",
    // "custom battery manufacturer",

    // ⚡ Énergie / stockage
    // "stockage énergie batterie entreprise",
    // "battery energy storage system supplier",
    // "fournisseur batterie solaire professionnel",
    // "installateur stockage énergie industriel",

    // 🚚 Logistique / manutention
    // "batterie chariot élévateur fournisseur",
    // "forklift battery supplier",
    // "batterie flotte véhicules entreprise",
    // "fleet battery management company",

    // 🚗 Automobile B2B (attention → filtrer les petits garages)
    "distributeur pièces moto batterie grossiste",
    "centrale achat pièces moto",
    "moto parts wholesaler battery",
    "pièces détachées moto grossiste",

    // ⚙️ BTP / engins / heavy duty
    // "batterie engins chantier fournisseur",
    // "heavy equipment battery supplier",
    // "batterie poids lourd fournisseur",

    // 🔋 Lithium / tech avancée
    // "fournisseur batterie lithium B2B",
    // "battery lithium distributor Europe",
    // "industrial lithium battery supplier",

    // ♻️ Reconditionnement (souvent gros volumes)
    // "reconditionnement batterie industriel",
    // "battery refurbishment company B2B",
    // "battery recycling industrial partner"
]);

// urls
const urls = []
const GoogleCrawler = new GoogleMapCrawler(config)
for (const keyword of batteryB2BKeywords) {
    for (const location of frenchDepartments) {
        urls.push(`https://www.google.com/maps/search/${keyword.replaceAll(' ', '+')}+${location.replaceAll(' ', '+')}`)
        // urls.push(`https://www.google.com/maps/search/${encodeURIComponent(keyword.replaceAll(' ', '+'))}+${encodeURIComponent(location.replaceAll(' ', '+'))}`)
    }
}

// --- Google Maps
await GoogleCrawler.crawl(shuffleArray(urls))
console.log("Crawl completed".green);
await GoogleCrawler?.browser?.close()

// --- Page jaunes
// const PagesJaunesCrawler = new PagesJaunes(config);
// await PagesJaunesCrawler.crawlCompanies({ keywords, locations });
// PagesJaunesCrawler.log("Crawl completed".green);
// await PagesJaunesCrawler.closeBrowser()

// --- La bonne Alternance
// const LaBonneAlternance = new LaBonneAlternanceCrawler(config);
// await LaBonneAlternance.crawlJobs({ keywords, locations });

