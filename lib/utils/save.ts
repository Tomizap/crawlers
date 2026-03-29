import { supabase } from "../config/supabase.js"

type SaveOptions = {
    type: string
    dest: string
}

export async function saveItem(item: any = {}, opts?: SaveOptions) {

    const {
        type = "companies",
        dest = "supabase"
    } = opts || {}

    item.scrapped_at = new Date(Date.now())

    switch (type) {

        case 'companies':

            if (!!!item.email && !!!item.phone) {
                console.log("Skipping item with no contact information".red, item.name)
                return
            }

            const filter: any = {}
            if (item.email) filter.email = item.email
            if (item.phone) filter.phone = item.phone

            if (dest === "supabase") {

                const { data, error } = await supabase
                    .from('companies')
                    .upsert(item, { onConflict: item.email ? 'email' : undefined })
                    .match(filter)
                    .select()
                    .single()

                if (error) {
                    if (error.code === "23505") {

                    } else {
                        console.log('Error upserting item'.red, item.name || item.id || item._id, error);
                    }
                } else {
                    // console.log(`✅ Item upserted: ${item.name || item.id || item._id}`);
                    return data
                }

            }

            break;

        case 'jobs':

            if (dest === "supabase") {

                const { data, error } = await supabase
                    .from('jobs')
                    .upsert(item)
                    .match({
                        name: item.name,
                        company: item.company
                    })
                    .select()
                    .single()

                if (error) {
                    console.log('Error upserting item'.red, item.name || item.id || item._id, error.message || error);
                } else {
                    // console.log(`✅ Item upserted: ${item.name || item.id || item._id}`);
                    return data

                }

            }

            break;

    }

    return item

}