import { supabase } from "../packages/lib/config/supabase.js";
import { saveItem } from "../packages/lib/crud/save.js";
import { validateCompany } from "../packages/lib/validator/company.js";

const companies = await supabase.from('companies').select().neq('email', null).then(r => r.data || []);

for (const element of companies) {
    const company = await validateCompany(element);
    await saveItem(company, { debug: true });
}