
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log("Testing Fetch Articles...");

    const { data, error } = await supabase
        .from('vv_articles')
        .select(`
            *,
            author:vv_authors(display_name),
            primary_category:vv_categories!primary_category_id(name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Fetch Error:", error);
    } else {
        console.log(`Success! Found ${data.length} articles.`);
        if (data.length > 0) {
            console.log("Sample Article:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("Table appears empty (or RLS hiding rows).");
        }
    }
}

testFetch();
