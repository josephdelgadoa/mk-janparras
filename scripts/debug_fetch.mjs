
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
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

    // 1. Fetch vv_articles ONLY (no joins)
    const { data: rawData, error: rawError } = await supabase
        .from('vv_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    if (rawError) {
        console.error("Raw Fetch Error:", rawError);
    } else {
        console.log(`Raw Fetch Success! Found ${rawData.length} articles.`);
        if (rawData.length > 0) {
            console.log("Sample Raw Article (Snippet):", rawData[0].title, rawData[0].status, "CatID:", rawData[0].primary_category_id, "AuthorID:", rawData[0].author_id);
        }
    }

    // 2. Fetch with Joins (SmartArticles Logic)
    const { data, error } = await supabase
        .from('vv_articles')
        .select(`
            *,
            author:vv_authors(display_name),
            primary_category:vv_categories!primary_category_id(name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error("Join Fetch Error:", error);
    } else {
        console.log(`Join Fetch Success! Found ${data.length} articles.`);
        if (data.length > 0) {
            const a = data[0];
            console.log("Sample Joined Article:", {
                title: a.title,
                author: a.author,
                category: a.primary_category
            });
        }
    }
}

testFetch();
