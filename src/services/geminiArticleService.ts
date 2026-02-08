import { getGenAI } from './geminiService';

export interface AdvancedArticleParams {
    topic: string;
    wordCountTarget: number; // e.g., 3000
    tone: string;
    audience: string;
    keywords?: string[];
}

export interface GeneratedArticleResult {
    title: string;
    contentHtml: string;
    metaDescription: string;
    focusKeyword: string;
    hashtags: string[];
    imagePrompt: string;
    suggestedCategory: string; // "Weddings", "Venues", etc.
    cta: string;
}

export const generateAdvancedArticle = async (params: AdvancedArticleParams): Promise<GeneratedArticleResult> => {
    const genAI = getGenAI();
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ROLE: World-Class SEO Content Strategist & Writer (GEO Expert).
    TASK: Write a comprehensive, high-ranking blog article for Vallarta Vows (Puerto Vallarta Wedding Planner).
    
    INPUTS:
    - Topic: "${params.topic}"
    - Target Audience: "${params.audience}"
    - Tone: "${params.tone}"
    - Target Word Count: ${params.wordCountTarget} words.
    - Focus Keywords: ${params.keywords?.join(', ')}

    REQUIREMENTS:
    1. **Generative Engine Optimization (GEO)**: Structure content to be cited by AI answers (Perplexity, Gemini, ChatGPT). Use clear headings, listicles, and direct answer definitions.
    2. **SEO**: High keyword density (natural), semantic HTML tags (h1-h4).
    3. **Depth**: Go deep. Cover "People Also Ask", budget breakdowns, logistics, and pros/cons.
    4. **Engagement**: Short paragraphs, bucket brigades, expert authority.

    OUTPUT JSON STRUCTURE (Strict):
    {
        "title": "Click-worthy, SEO-optimized title (H1)",
        "metaDescription": "155-160 chars, persuasive, includes keyword",
        "focusKeyword": "Primary SEO keyword used",
        "hashtags": ["#tag1", "#tag2", ... 10 tags],
        "suggestedCategory": "One of: Venues, Planning, Budget, Inspiration, Legal",
        "imagePrompt": "Detailed AI prompt for a photorealistic featured image (Puerto Vallarta vibe, no text)",
        "cta": "Persuasive call-to-action to book a consultation",
        "contentHtml": "The full article body in semantic HTML. NO <html> or <body> tags. Start with <h2>. Use <ul>/<li> for lists. Use <strong> for emphasis. Include a 'Key Takeaways' table if relevant."
    }
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const responseText = result.response.text();
        // Simple cleanup if MD block exists
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error: any) {
        console.error("Advanced Article Gen Error:", error);
        throw new Error(`Article Generation Failed: ${error.message}`);
    }
};

export const generateTrendingTopics = async (): Promise<string[]> => {
    const genAI = getGenAI();
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ROLE: Elite Wedding SEO Strategist.
    TASK: Identify 10 high-traffic, trending search topics for "Destination Weddings in Puerto Vallarta" based on behavior from the last 2 months.

    CRITERIA:
    - Focus on "Winner" keywords (high volume, high intent).
    - Include mix of broad (e.g., "Best Venues 2026") and specific queries (e.g., "Legal requirements for US citizens").
    - Look for trends like "Micro-weddings", "Eco-friendly", "LGBTQ+ Vows", "Luxury Villas".

    OUTPUT JSON:
    {
        "topics": [
            "Topic 1",
            "Topic 2",
            ...
        ]
    }
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned);
        return data.topics || [];
    } catch (error: any) {
        console.error("Topic Generation Error:", error);
        return [
            "Puerto Vallarta Wedding Packages 2026",
            "Best Sunset Wedding Venues PV",
            "Legal Requirements for Marriage in Mexico",
            "LGBTQ+ Destination Weddings Puerto Vallarta",
            "All-Inclusive vs Private Villa Weddings",
            "Luxury Catholic Church Weddings PV",
            "Beach Wedding Costs Breakdown 2025",
            "Romantic Elopement Spots Puerto Vallarta",
            "Wedding Photography Trends Mexico",
            "Guest Activities for Wedding Weekends"
        ];
    }
};
