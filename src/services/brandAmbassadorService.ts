import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BrandAsset {
    id: string;
    created_at: string;
    created_by_user_id: string;
    reference_image_urls: string[];
    location: string;
    clothing: string;
    aspect_ratio: string;
    avatar_image_url?: string;
    avatar_prompt?: string;
    consent_confirmed: boolean;
    status: 'draft' | 'processing' | 'ready' | 'failed';
}

export interface BrandScript {
    id: string;
    created_at: string;
    asset_id: string;
    service: string;
    tone: string;
    script_text: string;
    script_word_count: number;
    status: 'ready' | 'failed';
}

export const brandAmbassadorService = {
    async uploadReferenceImages(files: File[], userId: string): Promise<string[]> {
        const paths: string[] = [];

        // Create a unique folder ID for this batch (optimistically)
        // In a real app we might create the DB row first, but here we can just use a timestamp-random ID for the folder
        const batchId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = file.name.split('.').pop();
            // Organize by User ID for better structure
            const path = `brand-ambassador/reference/${userId}/${batchId}/img${i + 1}.${fileExt}`;

            if (!file) continue;

            const { error } = await supabase.storage
                .from('vv-private')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error(`Upload error for ${file.name}:`, error);
                // "Failed to fetch" often means bucket doesn't exist or CORS/Network issue.
                throw new Error(`Failed to upload ${file.name}: ${error.message}. (Check if vv-private bucket exists and RLS allows public uploads)`);
            }

            // Get the signed URL (since it's a private bucket)
            // For processing we need a signed URL. For storage in DB we store the PATH.
            // But for simplicity in this demo, let's store the path and generate signed URLs on read.
            paths.push(path);
        }

        return paths;
    },

    async createAsset(data: Partial<BrandAsset>) {
        const { data: asset, error } = await supabase
            .from('vv_brand_ambassador_assets')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return asset;
    },

    async getAssets() {
        // Since we enabled RLS, this naturally filters to the user's Assets
        const { data, error } = await supabase
            .from('vv_brand_ambassador_assets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BrandAsset[];
    },

    async deleteAsset(id: string) {
        // DB delete (cascades scripts)
        const { error } = await supabase
            .from('vv_brand_ambassador_assets')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Note: Storage cleanup would typically be a separate trigger or manual process
        // We'll skip complex storage deletion for now to keep it simple.
    },

    async updateAsset(id: string, updates: Partial<BrandAsset>) {
        const { data, error } = await supabase
            .from('vv_brand_ambassador_assets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async saveScript(data: Partial<BrandScript>) {
        const { data: script, error } = await supabase
            .from('vv_brand_ambassador_scripts')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return script;
    },

    async getSignedUrl(path: string) {
        const { data, error } = await supabase.storage
            .from('vv-private')
            .createSignedUrl(path, 3600); // 1 hour validity

        if (error) throw error;
        return data.signedUrl;
    }
};
