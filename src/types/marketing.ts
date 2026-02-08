export type WeddingService =
    | 'Beach Weddings'
    | 'LGBT Weddings'
    | 'Vow Renewals'
    | 'Cruise Ship Weddings'
    | 'Villa Weddings'
    | 'Civil Legal Weddings'
    | 'Beach Picnic Weddings'
    | 'Church Weddings';

export type AudienceType =
    | 'Luxury Seekers'
    | 'Budget Conscious'
    | 'Adventure Enthusiasts'
    | 'Intimate Elopement'
    | 'Traditional & Family';

export type MarketingTone =
    | 'Romantic & Dreamy'
    | 'Modern & Chic'
    | 'Adventurous & Fun'
    | 'Elegant & Timeless'
    | 'High-Energy Party'
    | 'Electric Dance Floor'
    | 'Guest-Centric & Communal'
    | 'Candid Documentary';

export type ImageAesthetic =
    | 'Golden Hour Glow'
    | 'Vibrant Tropical Daylight'
    | 'Elegant Midnight Glow'
    | 'Cinematic Drama'
    | 'Nostalgic Vintage Film'
    | 'Airy & Bright Pastel';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type PhotoType = 'Drone Aerial' | 'Beach View' | 'Top Venues';

export type VenueType =
    | 'Luxury Beachfront Resort'
    | 'Private Oceanfront Villa'
    | 'Romantic Cliffside Terrace'
    | 'Boutique Jungle Hideaway'
    | 'Modern Rooftop with Bay View'
    | 'Elegant Hacienda-Style Estate'
    | 'Intimate Beach Ceremony Spot'
    | 'Yacht / Marina Celebration'
    | 'Garden Courtyard Venue'
    | 'All-Inclusive Wedding Resort';

export type LocationScene = 'Luxury Office' | 'Beach at Sunset' | 'Tropical Garden' | 'Modern Villa' | 'Private Villa';
export type ClothingStyle = 'Casual Chic' | 'Formal Suit' | 'Boho Chic' | 'Summer Linen';
export type BrandVoiceTone = 'Warm Luxury' | 'Friendly Expert' | 'Elegant & Minimal' | 'Confident & Premium';

export interface MarketingInputs {
    service: WeddingService | string; // Allow free text for service_focus
    audience: AudienceType;
    tone: MarketingTone | BrandVoiceTone;
    imageAesthetic: ImageAesthetic; // Can be ignored in Brand Ambassador mode
    aspectRatio: AspectRatio;
    photoType: PhotoType; // Can be ignored in Brand Ambassador mode
    venueStyle?: VenueType;

    // Brand Ambassador Specific
    isBrandAmbassador?: boolean;
    referenceImages?: string[]; // Base64 strings
    locationScene?: LocationScene;
    clothingStyle?: ClothingStyle;
    language?: 'English' | 'Spanish';
}

export interface PlatformContent {
    copy?: string; // Facebook/Insta
    script?: string; // TikTok/YouTube
    cta: string;
    hashtags: string[];
    onscreenText?: string[]; // TikTok only
}

export interface MarketingOutputs {
    facebook: PlatformContent;
    instagram: PlatformContent;
    tiktok: PlatformContent;
    youtube: PlatformContent;
}

export interface ImagePromptOutput {
    prompt: string;
}

export interface GeneratedMarketingContent {
    inputs: MarketingInputs;
    outputs: MarketingOutputs;
    imagePrompt: ImagePromptOutput;
}
