import { supabase } from './supabaseClient';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

export interface EmailTemplate {
    id: string;
    title: string;
    description: string;
    image: string; // mapped from image_url
    htmlContent: string; // mapped from html_content
    updatedAt?: string;
    position?: number;
}

export const templateRepository = {
    async fetchTemplates(): Promise<EmailTemplate[]> {
        console.log("Supabase fetchTemplates called");
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('position', { ascending: true }) // Sort by position first
            .order('id', { ascending: true }); // Fallback

        if (error) {
            console.error("Supabase fetchTemplates error:", error);
            throw error;
        }

        console.log("Supabase fetchTemplates data:", data);

        return data.map(record => ({
            id: record.id,
            title: record.title,
            description: record.description,
            image: record.image_url,
            htmlContent: record.html_content,
            updatedAt: record.updated_at,
            position: record.position || 0
        }));
    },

    async updateTemplate(id: string, htmlContent: string, title?: string): Promise<void> {
        console.log("Supabase updateTemplate called for ID:", id);
        const updates: any = {
            html_content: htmlContent,
            updated_at: new Date().toISOString()
        };
        if (title) {
            updates.title = title;
        }

        const { error } = await supabase
            .from('email_templates')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error("Supabase updateTemplate error:", error);
            throw error;
        }
        console.log("Supabase updateTemplate success");
    },

    async upsertTemplate(id: string, template: Partial<EmailTemplate>): Promise<void> {
        console.log("Supabase upsertTemplate called for ID:", id);

        // Check if exists first (or we could just use upsert if schema allows)
        // Since we are mapping fields, let's construct the payload
        const payload: any = {
            id: id,
            updated_at: new Date().toISOString()
        };
        if (template.title) payload.title = template.title;
        if (template.htmlContent) payload.html_content = template.htmlContent;
        if (template.description) payload.description = template.description;
        if (template.image) payload.image_url = template.image;

        const { error } = await supabase
            .from('email_templates')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error("Supabase upsertTemplate error:", error);
            throw error;
        }
        console.log("Supabase upsertTemplate success");
    },

    async updateTemplateImage(id: string, imageUrl: string): Promise<void> {
        console.log("Supabase updateTemplateImage called for ID:", id);
        const { error } = await supabase
            .from('email_templates')
            .update({
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error("Supabase updateTemplateImage error:", error);
            throw error;
        }
        console.log("Supabase updateTemplateImage success");
    },

    async updateTemplateOrder(items: { id: string; position: number }[]): Promise<void> {
        console.log("Supabase updateTemplateOrder called");

        // Supabase doesn't have a bulk update easily without RPC, so loop for now (or parallel Promise.all)
        // For small number of templates (usually < 50), parallel updates are fine.
        const promises = items.map(item =>
            supabase
                .from('email_templates')
                .update({ position: item.position })
                .eq('id', item.id)
        );

        await Promise.all(promises);
        console.log("Supabase updateTemplateOrder success");
    },

    async deleteTemplate(id: string): Promise<void> {
        console.log("Supabase deleteTemplate called for ID:", id);
        const { error } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase deleteTemplate error:", error);
            throw error;
        }
        console.log("Supabase deleteTemplate success");
    }
};
