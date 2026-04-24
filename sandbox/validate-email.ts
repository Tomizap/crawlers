import { supabase } from "../packages/lib/config/supabase.js";
import { isEmailValid, validateEmail } from "../packages/lib/validator/email.js";

const companies = await supabase.from('companies').select().neq('email', null).then(r => r.data || []);

for (const element of companies) {
    console.log(await isEmailValid(element.email));
}

// console.log(await validateEmail("business@tbwa-adelphi.com"));
// console.log(await validateEmail("contactallopiecesauto@gmail.com"));
// console.log(await validateEmail("info@hautemarneexpansion.fr"));
// console.log(await validateEmail("e.archimbaud@motos-store.fr"));
// console.log(await validateEmail("contact@pkroadparts.com")); 