export enum LeadStatus {
    NEW_LEAD = "New Lead",
    CONTACTED = "Contacted",
    ENGAGED = "Engaged",
    QUALIFIED = "Qualified",
    PROPOSAL_SENT = "Proposal Sent",
    NEGOTIATION = "Negotiation",
    WON = "Won",
    LOST = "Lost"
}

export interface Lead {
    id?: string;
    created_at?: string;

    // Partner 1
    partner1_first_name?: string;
    partner1_last_name?: string;
    partner1_gender?: string;

    // Partner 2
    partner2_first_name?: string;
    partner2_last_name?: string;
    partner2_gender?: string;

    // Contact
    email: string;
    phone?: string;

    // Wedding Details
    wedding_date?: string;
    guest_count?: number;
    budget_range?: string;
    location_preference?: string;

    // Meta
    status: LeadStatus;
    referral_source?: string;
    services_needed?: string[]; // Array of strings in DB
    message?: string;
    notes?: string; // Internal notes
}
