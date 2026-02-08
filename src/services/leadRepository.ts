import { supabase } from './supabaseClient';
import { Lead, LeadStatus } from '../types';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

export const leadRepository = {
    async fetchLeads(options?: {
        limit?: number;
        cursor?: string; // creating_at timestamp
        status?: string;
        searchQuery?: string;
    }): Promise<{ leads: Lead[]; count: number | null; nextCursor: string | null }> {
        const limit = options?.limit || 50;

        // Base query
        // Only fetch count on first page (no cursor) to avoid partial counts on partitioned queries
        let query = supabase
            .from('leads')
            .select('*', { count: options?.cursor ? undefined : 'exact' });

        // Apply Status Filter
        if (options?.status && options.status !== 'All') {
            query = query.eq('status', options.status);
        }

        // Apply Search Filter
        if (options?.searchQuery) {
            const q = options.searchQuery.toLowerCase();
            query = query.or(`partner1_first_name.ilike.%${q}%,partner1_last_name.ilike.%${q}%,email.ilike.%${q}%`);
        }

        // Apply Cursor (Pagination)
        if (options?.cursor) {
            query = query.lt('created_at', options.cursor);
        }

        // Apply Order and Limit
        query = query
            .order('created_at', { ascending: false })
            .limit(limit + 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching leads:', error);
            throw error;
        }

        const rawLeads = data as Lead[];
        const hasMore = rawLeads.length > limit;
        const leads = hasMore ? rawLeads.slice(0, limit) : rawLeads;
        const lastDate = leads[leads.length - 1]?.created_at;
        const nextCursor = hasMore && lastDate ? lastDate : null;

        return { leads, count, nextCursor };
    },

    async fetchDashboardMetrics(): Promise<{
        recentLeads: Lead[];
        activeCount: number;
        activeContactedCount: number;
        upcomingCount: number;
        bookedCount: number;
        totalCount: number;
        monthlyGrowth: { created_at: string }[];
    }> {
        // 1. Fetch Recent Leads (5)
        const { data: recentLeads } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // 2. Fetch Active Count (Not Lost/Won)
        const { count: activeCount } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .neq('status', LeadStatus.LOST)
            .neq('status', LeadStatus.WON);

        // 2b. Fetch "Contacted" Count
        const { count: contactedCount } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('status', LeadStatus.CONTACTED);

        // 3. Fetch Upcoming Weddings Count
        const MAX_DATE = new Date();
        MAX_DATE.setFullYear(MAX_DATE.getFullYear() + 5); // Safety cap
        const { count: upcomingCount } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .gte('wedding_date', new Date().toISOString());

        // 4. Fetch Booked (Won) Count and Total for Conversion
        const { count: bookedCount } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('status', LeadStatus.WON);

        const { count: totalCount } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true });

        // 5. Fetch Monthly Data (Last 6 months created_at)
        // We only need created_at to bucket them. 
        // We can limit this query if db gets huge, but for now fetching last 6 months created_at is fine.
        const SIX_MONTHS_AGO = new Date();
        SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

        const { data: monthlyData } = await supabase
            .from('leads')
            .select('created_at')
            .gte('created_at', SIX_MONTHS_AGO.toISOString());

        return {
            recentLeads: (recentLeads as Lead[]) || [],
            activeCount: activeCount || 0,
            activeContactedCount: contactedCount || 0,
            upcomingCount: upcomingCount || 0,
            bookedCount: bookedCount || 0,
            totalCount: totalCount || 0,
            monthlyGrowth: (monthlyData as any[]) || []
        };
    },

    async createLead(lead: Partial<Lead>): Promise<Lead> {
        // Ensure status is set
        const newLead = { ...lead, status: lead.status || LeadStatus.NEW_LEAD };

        const { data, error } = await supabase
            .from('leads')
            .insert([newLead])
            .select()
            .single();

        if (error) {
            console.error('Error creating lead:', error);
            throw error;
        }

        return data as Lead;
    },

    async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating lead:', error);
            throw error;
        }

        return data as Lead;
    },

    async deleteLead(id: string): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting lead:', error);
            throw error;
        }
    }
};
