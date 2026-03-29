import { regexExcludeEmail } from "../constants/index.js";
import { validateEmail } from "./validate-email.js";

export async function isEmailValid(email: string) {
    return regexExcludeEmail.every(re => !email.includes(re))
        && (await validateEmail(email)).qualityScore >= 0.7
}