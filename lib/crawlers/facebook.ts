// import { sleep } from "../utils/sleep.js";
// import Crawler from "./crawler.js";

// function shuffleArray(array) {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
// }

// class Facebook extends Crawler {

//     constructor(config) {
//         super(config)
//     }

//     name = "Facebook"

//     async login(credentials) {
//         await sleep(3000)
//         await this.page.goto('https://facebook.com')
//         await sleep(3000)
//         await this.acceptCookies()
//         await this.page.waitForSelector('[data-testid="royal_email"]')
//         await this.page.type('[data-testid="royal_email"]', credentials.email)
//         await this.page.waitForSelector('[data-testid="royal_pass"]')
//         await this.page.type('[data-testid="royal_pass"]', credentials.password)
//         await sleep(3000)
//         await this.page.click('[data-testid="royal_login_button"]')
//         await this.page.waitForNavigation()
//         await sleep(5000)
//         await this.page.keyboard.press('Backspace');
//         this.isLoggedIn = true
//     }

//     async acceptCookies() {
//         await this.page.waitForSelector('body > div._10.uiLayer._4-hy._3qw > div._59s7._9l2g > div > div > div > div > div:nth-child(3) > div.x1exxf4d.x13fuv20.x178xt8z.x1l90r2v.x1pi30zi.x1swvt13 > div > div:nth-child(2) > div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3')
//         await this.page.click('body > div._10.uiLayer._4-hy._3qw > div._59s7._9l2g > div > div > div > div > div:nth-child(3) > div.x1exxf4d.x13fuv20.x178xt8z.x1l90r2v.x1pi30zi.x1swvt13 > div > div:nth-child(2) > div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3')
//     }

//     async restrictedDialog() {
//         console.log('accountis is restricted'.red);
//         throw ''
//     }

//     // ---------------- GROUPS --------------------

//     async scrollGroups() {
//         for (let index = 0; index < 40; index++) {
//             await this.page.evaluate(() => document.querySelector('html').scrollBy(0, 10000))
//             await sleep(1000)
//         }
//     }

//     // --- joining group

//     async joinGroups(q, option = {}) {
//         await this.page.goto("https://www.facebook.com/groups/search/groups_home/?" + new URLSearchParams({ q }))
//         await sleep(3000)
//         await this.scrollGroups()
//         if (option.fast === true) {
//             const buttons = await this.page.$$('[role="feed"] [role="article"] [role="button"]')
//             for (const button of buttons) {
//                 await button.click()
//                 await this.dialogJoinGroup()
//             }
//         } else {
//             const urls = await this.page.$$eval('[role="feed"] [role="article"] a[role="presentation"]', as => as.map(a => a.href))
//             for (const url of urls) {
//                 await this.joinGroup(url)
//             }
//         }
//     }

//     async joinGroup(url) {

//         const page = await this.browser.newPage()
//         await page.goto(url)
//         await sleep(5000)

//         try {
//             const joinGroupButtons = await page.$$('[aria-label="Rejoindre le groupe"]')
//             for (const joinGroupButton of joinGroupButtons) {
//                 await joinGroupButton.click().catch(() => { })
//             }
//             await this.dialogJoinGroup()
//         } catch (error) {

//         }

//     }

//     async dialogJoinGroup() {
//         await this.page.waitForSelector('[role="dialog"] label > [role="presentation"]', { timeout: 5000 })
//             .then(async () => {
//                 const consentButtons = await this.page.$$('[role="dialog"] label > [role="presentation"]')
//                 consentButtons = consentButtons.slice(-1)[0]
//                 await consentButtons.click('[role="dialog"] label > [role="presentation"]')
//                 await sleep(5000)
//                 await this.page.click('[role="dialog"] [aria-label="Envoyer"]')
//                 console.log('+1 group join'.green);
//                 await sleep(5000)
//                 await this.page.waitForSelector('[role="dialog"] label > [role="presentation"]', { timeout: 5000 })
//                     .then(async () => {
//                         console.log('err group join'.red);
//                         await this.page.click('[role="dialog"] [aria-label="Fermer"]')
//                         await sleep(5000)
//                         await this.page.click('[role="dialog"] [aria-label="Quitter"]')
//                     }).catch(() => { })
//             }).catch(() => { })
//     }

//     // --- unjoining group

//     async unJoinGroups(url) {
//         await this.page.goto(url)
//         await sleep(3000)
//         await this.scrollGroups()
//         const urls = await this.page.$$eval('[role="feed"] [role="article"] a[role="presentation"]', as => as.map(a => a.href))
//         for (const url of urls) {
//             await this.unJoinGroup(url)
//         }
//     }

//     async unJoinGroup(url) {
//         try {
//             const page = await this.browser.newPage()
//             await page.goto(url + "members")
//             await sleep(5000)

//             const buttons = await this.page.$$(`[role="button"]`)
//             const b = await buttons.find(async button => await button?.ariaLabel === 'Membre')
//             console.log(b);
//             await b.click({ modifiers: ['Control'] })
//             await b.click({ modifiers: ['Control'] })
//             await b.$('*').then(async r => await r.click())
//             await b.$('*').then(async r => await r.click())

//             // await this.page.click('[aria-label="Plus d’actions de groupe pour Tom Zpc"]', { delay: 1000 })
//             // await this.page.waitForSelector('[aria-label="Membre"]').then(async () => {
//             //     console.log('menu show');
//             //     await this.page.$$('[role="menu"] [role="menuitem"]').then(async menuitems => {
//             //         await menuitems.slice(-1)[0].click()
//             //         await this.page.sleep(1000)
//             //         await this.page.click('[aria-label="Quitter le groupe"]')
//             //         await this.page.sleep(1000)
//             //         console.log('+1 leave group'.green, url);
//             //     })
//             // }).catch(() => {
//             //     console.log("no member button".red);
//             // })
//         } catch (error) {
//             console.log('error leav group'.red, url);
//         }
//     }

//     // --- group post

//     async groupsPost(q, post) {
//         await this.scrollGroups(q)
//         const urls = await this.page.$$eval('[role="feed"] [role="article"] a[role="presentation"]', as => as.map(a => a.href))
//         console.log(urls);
//         for (const url of shuffleArray(urls).slice(0, 40)) {
//             await this.groupPost(url, post)
//         }
//     }

//     async groupPost(url, post = {}) {

//         const page = await this.browser.newPage()
//         await page.goto(url)
//         await sleep(5000)

//         // try {
//         //     const joinGroupButtons = await page.$$('[aria-label="Rejoindre le groupe"]')
//         //     for (const joinGroupButton of joinGroupButtons) {
//         //         await joinGroupButton.click().catch(() => { })
//         //     }
//         //     await this.dialogJoinGroup()
//         // } catch (error) {

//         // }

//         await page.waitForSelector('span.x1emribx + [role="button"]')
//             .then(async () => {
//                 await page.click('span.x1emribx + [role="button"]')
//                 await page.waitForSelector('form[method="POST"] [role="textbox"]')
//                 await page.click('form[method="POST"] [role="textbox"]')
//                 if (typeof (post.message || '') === 'string') {
//                     await page.type('form[method="POST"] [role="textbox"]', post.message)
//                 } else {
//                     await page.type('form[method="POST"] [role="textbox"]', post.message[Math.floor(Math.random() * post.message.length)])
//                 }
//                 await sleep(3000)
//                 await page.click('[aria-label="Publier"]')
//                 await this.dialogJoinGroup()
//                 console.log('+1 group post'.green);
//             }).catch(() => { })

//         await page.close()

//     }

//     // ---------------- PEOPLE --------------------

//     async messageToFriends(message) {

//     }

//     async addFriends(q) {

//     }

//     // ---------------- POSTS ---------------------

//     async likePost(url) {

//     }

//     async comentPost(url, comment) {

//     }

//     // ---------------- COMMENTS ---------------------

//     async commentPagePosts(url, comment) {

//     }

//     async commentPagePosts(url, comment) {

//     }

//     async commentPagesPosts(query, comment) {

//     }

//     async commentGroupPosts(url, comment) {

//     }

//     async commentGroupsPosts(query, comment) {

//     }

// }

// // -----------------------------------------

// const crawler = new Facebook()
// await crawler.newBrowser()
// await crawler.login({ email: 'zaptom.pro@gmail.com', password: 'PAWW5dBV2ram!Z.' })
// await crawler.page.goto('https://www.facebook.com/groups/search/groups_home/?q=soir%C3%A9e%20lyon')
// // await crawler.joinGroups('soirée lyon')
// await crawler.groupsPost('soirée lyon', {
//     message: [
//         `Rendez-vous le 4 octobre au We Event Area de Lyon 😈\n
//          https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `
//          🔥 On se retrouve le 4 octobre au We Event Area de Lyon pour une soirée de folie ! 😎\n
//         👉 Ne manque pas l'Undercore avec Hysta & D-Frek : https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz
//          `,
//         `💥 Préparez-vous pour le 4 octobre ! We Event Area, Lyon, ça va trembler !\n
// 🎧 Hysta & D-Frek seront là pour vous faire vibrer : https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `🚨 Le 4 octobre, ça se passe au We Event Area de Lyon !
// Une soirée explosive avec Hysta & D-Frek qui va marquer les esprits !
// 🔗 https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `Le 4 octobre, c’est LA date à ne pas manquer 🔥 !\n
// 📍 We Event Area, Lyon : soyez prêts pour Hysta & D-Frek.\n
// 🌐 https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `⚡️ RDV le 4 octobre à Lyon pour une soirée de dingue !\n
// We Event Area, avec Hysta & D-Frek au programme 🎶\n
// ➡️ https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `🔊 Grosse ambiance prévue le 4 octobre au We Event Area de Lyon !\n
// Ne ratez pas Hysta & D-Frek pour une nuit inoubliable 🌙\n
// 🎟️ https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `C'est officiel, le 4 octobre sera épique à Lyon ! 😈\n
// 📍 We Event Area, avec Hysta & D-Frek derrière les platines : https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `⚠️ Save the date : 4 octobre, We Event Area, Lyon !\n
// Une soirée Undercore explosive avec Hysta & D-Frek :\n
// 👉 https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `🌟 Le 4 octobre approche à grands pas ! Soyez au We Event Area de Lyon !\n
// Hysta & D-Frek préparent une nuit qui va tout changer !\n
// 🔗 https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`,
//         `🔥 Prêts pour la soirée de l'année le 4 octobre ?\n
// Rendez-vous à Lyon, We Event Area, avec Hysta & D-Frek aux commandes !\n
// 🎫 https://shotgun.live/fr/events/undercore-invite-hysta-d-frek-more?utm_source=tz`
//     ]
// })
// // await crawler.unJoinGroups(`https://www.facebook.com/groups/search/groups?q=rencontre&filters=eyJteV9ncm91cHM6MCI6IntcIm5hbWVcIjpcIm15X2dyb3Vwc1wiLFwiYXJnc1wiOlwiXCJ9In0%3D`)

// // -----------------------------------------

// export default Facebook