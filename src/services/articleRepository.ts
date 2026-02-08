import { supabase } from './supabaseClient';
import { marked } from 'marked';

export interface Article {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    wp_status: 'not_published' | 'queued' | 'publishing' | 'published' | 'failed';
    author_id: string;
    primary_category_id: string;
    word_count: number;
    created_at: string;
    published_at?: string;

    // WordPress Sync
    wp_post_id?: number;
    wp_permalink?: string;
    wp_last_published_at?: string;
    wp_last_error?: string;

    // Detailed fields
    content_md?: string;
    content_html?: string;
    excerpt?: string;
    seo_title?: string;
    meta_description?: string;
    featured_image_prompt?: string;

    // Joined data
    author?: { display_name: string };
    primary_category?: { name: string; slug: string };
}

export const articleRepository = {
    async fetchArticles(options?: {
        status?: string;
        category_id?: string;
        search?: string;
    }) {
        let query = supabase
            .from('vv_articles')
            .select(`
                *,
                author:vv_authors(display_name),
                primary_category:vv_categories!primary_category_id(name, slug)
            `)
            .order('created_at', { ascending: false });

        if (options?.status && options.status !== 'All') {
            query = query.eq('status', options.status);
        }

        if (options?.category_id && options.category_id !== 'All') {
            query = query.eq('primary_category_id', options.category_id);
        }

        if (options?.search) {
            query = query.ilike('title', `%${options.search}%`);
        }

        const { data, error } = await query;
        console.log('[SmartArticles] fetchArticles result:', { data, error });
        if (error) throw error;
        return data as Article[];
    },

    async fetchCategories() {
        const { data, error } = await supabase
            .from('vv_categories')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as { id: string, name: string, slug: string }[];
    },

    async getArticle(id: string) {
        const { data, error } = await supabase
            .from('vv_articles')
            .select(`
                *,
                author:vv_authors(*),
                primary_category:vv_categories!primary_category_id(*),
                secondary_category:vv_categories!secondary_category_id(*)
            `)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as Article;
    },

    async updateArticle(id: string, updates: Partial<Article>) {
        const { data, error } = await supabase
            .from('vv_articles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Article;
    },

    // --- HELPER: Get or Create WP Category ---
    async getOrCreateWpCategory(categoryName: string, categorySlug: string, authHeader: string, baseUrl: string): Promise<number | null> {
        try {
            // 1. Search for existing
            const searchUrl = `${baseUrl}/categories?slug=${categorySlug}`;
            const searchRes = await fetch(searchUrl, {
                method: 'GET',
                headers: { 'Authorization': `Basic ${authHeader}` }
            });
            const found = await searchRes.json();

            if (Array.isArray(found) && found.length > 0) {
                console.log(`[WP Sync] Found existing category: ${found[0].name} (${found[0].id})`);
                return found[0].id;
            }

            // 2. Create if not found
            console.log(`[WP Sync] Creating category: ${categoryName}`);
            const createRes = await fetch(`${baseUrl}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authHeader}`
                },
                body: JSON.stringify({
                    name: categoryName,
                    slug: categorySlug
                })
            });

            if (!createRes.ok) {
                const err = await createRes.json();
                console.warn('[WP Sync] Failed to create category:', err);
                return null; // Fail gracefully, post will be 'Uncategorized'
            }

            const newCat = await createRes.json();
            return newCat.id;

        } catch (e) {
            console.error('[WP Sync] Category sync error:', e);
            return null;
        }
    },

    async publishToWordPress(id: string) {
        // 1. Get Article Data
        const article = await this.getArticle(id);
        if (!article) throw new Error('Article not found');

        // 2. Check Credentials
        // 2. Check Credentials
        const wpUrl = import.meta.env.VITE_WORDPRESS_URL;
        const wpUser = import.meta.env.VITE_WORDPRESS_USERNAME;
        const wpAppPass = import.meta.env.VITE_WORDPRESS_APP_PASSWORD;

        if (!wpUrl || !wpUser || !wpAppPass) {
            console.error('Missing WP Credentials', { wpUrl, wpUser, hasPass: !!wpAppPass });
            alert(`Missing Credentials in .env: URL=${!!wpUrl}, User=${!!wpUser}, Pass=${!!wpAppPass}`);
            return;
        }

        console.log('[WP Debug] Creds Loaded:', {
            wpUrl,
            wpUser,
            isDev: import.meta.env.DEV
        });

        // 3. Mark as Publishing
        await this.updateArticle(id, { wp_status: 'publishing' } as any);

        try {
            // Prepare Auth & Endpoint
            const cleanPass = wpAppPass.replace(/\s/g, '');
            const auth = btoa(`${wpUser}:${cleanPass}`);

            // Construct API Base properly
            // Safely strip /wp-admin and trailing slashes to ensure we hit the site root
            const siteRoot = wpUrl.replace(/\/wp-admin\/?$/, '').replace(/\/+$/, '');
            const apiBase = `${siteRoot}/wp-json/wp/v2`;
            const postsEndpoint = `${apiBase}/posts`;

            console.log(`[SmartArticles] Publishing to ${postsEndpoint}`);

            // 4. Content Conversion (Markdown -> HTML)
            let finalContent = article.content_html;
            if (article.content_md) {
                console.log('[SmartArticles] Converting Markdown to HTML...');
                finalContent = await marked(article.content_md);
            }

            // 5. Category Sync
            let categoryIds: number[] = [];
            if (article.primary_category) {
                const catId = await this.getOrCreateWpCategory(
                    article.primary_category.name,
                    article.primary_category.slug,
                    auth,
                    apiBase
                );
                if (catId) categoryIds.push(catId);
            }

            // 6. Send to WordPress
            const response = await fetch(postsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                },
                body: JSON.stringify({
                    title: article.title,
                    content: finalContent,
                    status: 'publish',
                    slug: article.slug,
                    categories: categoryIds // Attach synced ID
                })
            });

            if (!response.ok) {
                let errorMessage = `WP API Failed: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMessage = errorData.message;
                } catch (e) { /* ignore */ }
                throw new Error(errorMessage);
            }

            const wpData = await response.json();

            // 7. Success - Update Supabase
            await this.updateArticle(id, {
                wp_status: 'published',
                wp_post_id: wpData.id,
                wp_permalink: wpData.link,
                wp_last_published_at: new Date().toISOString()
            } as any);

            alert(`Success! Published to: ${wpData.link}`);
            return wpData;

        } catch (error: any) {
            console.error('WordPress Publish Error:', error);
            alert(`Publish Failed: ${error.message}`);

            await this.updateArticle(id, {
                wp_status: 'failed',
                wp_last_error: error.message
            } as any);

            throw error;
        }
    }
};
