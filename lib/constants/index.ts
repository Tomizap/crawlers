export const genericUsernames = new Set([

    // contact / communication
    'contact', 'info', 'hello', 'hi', 'bonjour', 'welcome',

    // direction
    'direction', 'management', 'office', 'team',

    // général
    'admin', 'administrator', 'root', 'system',

    // support / service client
    'support', 'help', 'helpdesk', 'service', 'customerservice', 'client', 'clients',

    // commercial / business
    'sales', 'commercial', 'business', 'biz', 'bd', 'growth', 'partnership', 'partners',

    // marketing
    'marketing', 'communication', 'press', 'media', 'newsletter',

    // technique
    'webmaster', 'web', 'tech', 'it', 'dev', 'developer', 'engineering', 'product',

    // email générique
    'mail', 'email', 'contactus', 'inbox',

    // RH / recrutement
    'rh', 'hr', 'jobs', 'career', 'careers', 'recruitment', 'talent', 'hiring',

]);

// Url
export const socialNetworkDomains = [
    'facebook.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'youtube.com',
    'tiktok.com',
    'snapchat.com',
    'pinterest.com',
    'reddit.com',
    'tumblr.com',
    'flickr.com',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'discord.gg',
    'discord.com',
    'whatsapp.com',
    'wa.me',
    'telegram.me',
    't.me',
    'signal.org',
    'threads.net',
    'beacons.ai',
    'linktr.ee',
    'lnk.bio',
    'bio.site',
    'carrd.co'
];
export const regexExcludeUrl = [

]

// Email
export const freeEmailProviders = new Set([
    // global mainstream
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.fr', 'yahoo.co.uk', 'yahoo.es', 'yahoo.de', 'yahoo.it',
    'hotmail.com', 'hotmail.fr',
    'outlook.com', 'outlook.fr',
    'live.com', 'live.fr',
    'msn.com',

    // Apple / privacy
    'icloud.com', 'me.com', 'mac.com',

    // privacy / secure email
    'protonmail.com', 'proton.me', 'pm.me',
    'tutanota.com', 'tutanota.de', 'tuta.io',

    // européens / alternatifs
    'gmx.com', 'gmx.fr', 'gmx.de',
    'mail.com',
    'web.de',
    'libero.it',
    'virgilio.it',
    'laposte.net',
    'orange.fr', // borderline (FAI mais souvent perso)
    'wanadoo.fr', // legacy Orange
    'free.fr', // FAI FR très utilisé en perso
    'sfr.fr', 'neuf.fr',

    // UK / US alternatifs
    'btinternet.com',
    'sky.com',
    'comcast.net',
    'verizon.net',
    'att.net',

    // autres gratuits populaires
    'zoho.com',
    'yandex.com', 'yandex.ru',
    'mail.ru',
    'inbox.ru',
    'bk.ru',
    'list.ru',

    // niche / jetables fréquents
    'temp-mail.org',
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'yopmail.com',
    'mailinator.com',

    // divers
    'hushmail.com',
    'runbox.com',
    'fastmail.com'
]);
export const regexExcludeEmail = [

    // socials
    ...socialNetworkDomains,

    // common
    'dpo',
    'test',
    'privacy',
    'noreply',
    'no-reply',
    'dataprotection',
    'complaints',
    'rgpd',
    "donneespersonnelles",
    "donnees-personnelles",
    "@dfa.gov.ph",
    ".gouv.fr",
    "diplomates@",
    'exemple',
    "undefined",
    "contact@demenagements-perrois.com",
    "@ac-versailles.fr",
    "@google",

    "email.com",
    "xxx.xxx",

    // specific
    "contact@luxecodemenagement.com",
    'info@bpmgroup.fr',
    'digitalsupport.fr@audi.de',
    'bmwmini@neubauer.fr',
    'support@ovh.com',
    'cs.fra@cac.mercedes-benz.com',
    'gregory.wentz@citroen.com',
    'daniel.magalhaes@vaubanmotors.fr',
    'contact@carizy.com',
    'info@jaquauto.com',
    'village@neubauer.fr',
    'ladefense@horizon.fr',
    'contact@sca14.com',
    'marketing@rousseau-automobile.fr',
    'csr@messenger-inquirer.com',
    '40toyota-chambourcy@vaubanmotors.fr',
    'superu.lechesnay.locationu@systeme-u.fr',
    'contact@neubauer.fr',
    "ford@neubauer.fr",
    "contact@fairplayauto.com",
    'homolog@jaguarlandrover.com',
    'contact@abvv.fr',
    "paris@stellantis.com",
    "service-client@bmw.fr",
    'ouest@stellantis.com',
    'direction@aramisauto.com',
    "contact@garage-groult.fr",
    "conseil@maf",
    "contact@lot-of-cars.com",
    "contact@charles-pozzi.fr",
    "nos-ateliers-volkswagencontact@fairplayauto.com",
    "condor.automobiles@orange.fr",
    "youcar95@gmail.com",
    "alexandre.chazel@renault.com",
    "france@honda-eu.com",
    "pyrenees@suzuki-paris.fr",
    "lagarenne@orange.fr",
    "service-marketing@groupejb.com",
    "thomas.mottin@rousseau-automobile.fr",
    "garage.leon-olivier@wanadoo.fr",
    "emmanuel.dr@go2roues.com",
    "gilles.gleyze@renault.com",
    "support@zecarrossery.fr",
    "autosvilliers.sport@orange.fr",
    "fernao.silveira@stellantis.com",
    "contact@garage-gouet.com",
    "automobile.dacia@daciagroup.com",
    "opel.nanterre@trujas.carwest.fr",
    "contact@heipoa.com",
    "contact@japauto.com",
    "shop-mini@horizon.fr",
    "client@rfarennes.peugeot",
    "contact-saintquentin@amc-pieces.fr",
    "matteo@drive-automobiles.fr",
    "contact@bugatti-paris.fr",
    "contact@bauerparis.fr",
    "espace-marceau@wanadoo.fr",
    "commerce.nanterre@kote-ouest.fr",
    "crcfr@ford.com.porter",
    "auto.centre45@outlook.fr",
    "atelier-epernay@ttr-auto.fr",
    "aaco06@wanadoo.fr",
    "info@fiat-lgca.com",
    "contact@sml-automobile.com",
    "gilles.gleyze@renault.com",
    "contact@entreprise-mb-auto.fr",
    "contact@loueruneauto.fr",
    "contact@zlauto.fr",
    "olivier.crance@car-lovers.com",
    "cmmotors01100@gmail.com",
    "contact@melydenautoparis.com",
    "contact@la-conciergerie-auto.com",
    "contact@rabot-auto.fr",
    "peugeotgbc@wanadoo.fr",
    "shahbaazkhatri@falconautomobiles.in",
    "garagecretaz@gmail.com",
    "contact@champ-auto.com",
    "contact@infonet.fr",
    "contact@avs-sa.com",
    "info@karmania-auto",
    "contact@vaneau.fr",
    "garagecretaz@gmail.com",
    "jepostule@renault-trucks.com",
    "mediateur@mediateur-mobilians.fr",
    "contact@garageacd.com",
    "support@cars.com",
    "contact@ophtalmonotredame.tn",
    "amgauto28@hotmail.com",
    "admin@german-retrofit.com",
    "contact@actionscooter.fr",
    "mct@mct-groupe.com",
    "contact@rsrentbox.com",
    "contact@bigdem.fr",
    "contact@scsdemenagement.fr",
    "contact@richardevents.fr",
    "speedlivraisonidf@gmail.com",
    "contact@ltdem.fr",
    "contact@bhgroupe.fr",
    "jedemenage@demenagements-jumeau.fr",
    "contact@groupewilliamb.fr",
    "essonne@lagachemobility.com",
    "contact@demenagerseul.com",
    "info@baillydem.com",
    "marcbelmas@aol.com",
    "contact@nornes.fr",
    "contact@france-armor.com",
    "contact@imove-demenagement.fr",
    "contact@fidess-demenagement.fr",
    "contact@2sage-alba.com",
    "dvd-demenagement@paris.fr",
    "contact@demenager-pas-cher.com",
    "contact@helpianos-transport.com",
    "contact@demenageurs-bretons.fr",
    "contact@bhgroupe.fr",
    "lyon@baillydem.com",
    "contact@sc2t.fr",
    "contact@huetintl.com",
    "agence45@rberton.com",
    "contact@lepetitdemenageur.fr",
    'urbanisme@velizy-villacoublay.fr',

]


// Phone
export const regexExcludePhone = [
    "0588426459",
    "0000000000"
]