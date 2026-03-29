// import Crawler from "./crawler.js";

// class Linkedin extends Crawler {

//     name = "La bonne alternance"

//     async login(credentials = {}) {
//         if (credentials.authcookie) {
//             await this.page.setCookie({
//                 name: 'li_at',
//                 value: credentials.authcookie
//             })
//             await this.sleepRandom()
//             await this.page.reload()
//             await this.page.waitForNavigation()
//         } else {

//         }
//     }

//     // --------------- JOBS ------------------

//     async listJobs(url) {

//     }

//     async searchJobs(url) {

//     }

//     async scrapJobs(url) {

//     }

//     async applyJobs() {

//     }

//     async dialogApplyJob() {



//     }

//     // --------------- POSTS ------------------

//     // --------------- JOBS ------------------

//     // --------------- COMPANIES ------------------

//     // --------------- GROUPS ------------------

//     // --------------- PEOPLES ------------------

// }

// const applier = {
//     name: "Tom ZAPICO",
//     email: "zaptom.pro@gmail.com",
//     phone: "0665774180"
// }

// const crawler = new Linkedin()
// await crawler.newBrowser()
// await crawler.login({ authcookie: `AQEFARABAAAAABCHRq0AAAGR4Il9cQAAAZIElgawTgAAs3VybjpsaTplbnRlcnByaXNlQXV0aFRva2VuOmVKeGpaQUFDTnYyZ1MyRDZmY0lrTUwweU9Jb1J4QkR4NHBrR1p2Qm1xMWN4c0FBQW5DVUd2UT09XnVybjpsaTplbnRlcnByaXNlUHJvZmlsZToodXJuOmxpOmVudGVycHJpc2VBY2NvdW50OjEwMzc2NDY5MCwxMTYzNTExMjIpXnVybjpsaTptZW1iZXI6NzY4Mjk2NDM0DsfNtk8v30AA2enDlxDY1jgrYNvwwbn_SlPlGd0CqdVvmGeEVRt_D6RSo18X1v3VlaE2MI5cs0vXia-JFK9-Wk5dEbBLXCYBmjDdclwWLsqAq3MQ4tQG1SyoBngChR4tu7ufdNUcm2UArEFQSZjGLYI8nUxzUhnjrFbtXZOQi5KX9BG5QgZpEByAkeN4_hh6UDAMSQ` })
// await crawler.applyJobs('')

// export default Linkedin