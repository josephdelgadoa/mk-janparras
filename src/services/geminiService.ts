// Switched to stable SDK for reliability
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export const setApiKey = (key: string) => {
    console.log("Setting API Key");
    try {
        genAI = new GoogleGenerativeAI(key);
    } catch (error) {
        console.error("Error evaluating GoogleGenerativeAI:", error);
    }
};

export const isConfigured = () => !!genAI;

export const getGenAI = () => genAI;

// --- Interfaces ---

export interface MarketingParams {
    service: string;
    audience: string;
    tone: string;
}

export interface BlogParams {
    topic: string;
    audience: string;
    tone: string;
    keywords: string[];
}

export interface LeadData {
    rawText: string;
}

export type ImageModelTier = 'fast' | 'pro' | 'ultra';

// --- API Functions ---

export const generateMarketingContent = async (params: MarketingParams) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    Role: Professional Wedding Marketing Specialist.
    Task: Generate social media content for Vallarta Vows.
    
    Service: ${params.service}
    Audience: ${params.audience}
    Tone: ${params.tone}
    
    Output JSON with fields:
    - facebookPost (text)
    - instagramCaption (text with hashtags)
    - reelsScript (step-by-step visual/audio script)
    - imagePrompt (detailed AI image generation prompt)
  `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
};

export const generateBlogArticle = async (params: BlogParams) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    Role: Professional SEO Content Writer.
    Task: Write a blog article for Vallarta Vows (Luxury Wedding Planner in Puerto Vallarta).
    
    Topic: ${params.topic}
    Audience: ${params.audience}
    Tone: ${params.tone}
    Keywords: ${params.keywords.join(", ")}
    
    Structure (Winner's Structure):
    1. H1 Title
    2. TL;DR Capsule (summary)
    3. HTML Body (semantic HTML tags, h2, h3, p, ul)
    4. Meta Description
    5. Social Snippets (Twitter/FB)
    
    Output JSON.
  `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
};

export const analyzeLead = async (leadText: string) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    Role: Senior Wedding Sales Consultant.
    Task: Analyze this incoming lead inquiry.
    
    Lead Text: "${leadText}"
    
    Output JSON:
    - leadScore (0-100)
    - budgetEstimate (string range)
    - salesStrategy (brief advice)
    - draftedResponse (email draft)
    - winProbability (percentage string)
  `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
};

// Replaces the placeholder with actual Imagen 3 API call
export const generateImage = async (prompt: string, tier: ImageModelTier = 'fast', aspectRatio: string = "1:1"): Promise<string> => {
    if (!genAI) throw new Error("Gemini API not configured");

    console.log(`Generating image with tier: ${tier}, AR: ${aspectRatio}`);

    try {
        if (tier === 'ultra') {
            // --- IMAGEN 3/4 (REST API) ---
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key missing");

            const model = "imagen-4.0-generate-001"; // Or imagen-3.0-generate-001
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

            const payload = {
                instances: [{ prompt: prompt }],
                parameters: { sampleCount: 1, aspectRatio: aspectRatio }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Imagen API Error (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (data.predictions && data.predictions.length > 0 && data.predictions[0].bytesBase64Encoded) {
                return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            }
            throw new Error("No image data in Imagen response: " + JSON.stringify(data));

        } else if (tier === 'pro') {
            // --- GEMINI 3 PRO IMAGE PREVIEW (Direct) ---
            // Direct generation as requested by user
            const modelName = 'gemini-3-pro-image-preview';
            console.log(`Using Model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `Generate a photorealistic image of: ${prompt}` }] }],
            });

            const response = result.response;
            if (response.candidates && response.candidates.length > 0) {
                const parts = response.candidates[0].content.parts;
                const imagePart = parts.find(p => p.inlineData);

                if (imagePart && imagePart.inlineData) {
                    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                }
            }
            throw new Error(`No image returned from ${modelName}. Response: ${JSON.stringify(response)}`);

        } else {
            // 'fast' fallback
            const modelName = 'gemini-2.0-flash-exp';
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `Generate a photorealistic image of: ${prompt}` }] }],
            });

            const response = result.response;
            if (response.candidates && response.candidates.length > 0) {
                const parts = response.candidates[0].content.parts;
                const imagePart = parts.find(p => p.inlineData);
                if (imagePart && imagePart.inlineData) {
                    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                }
            }
            throw new Error("No image returned from Flash model.");
        }

    } catch (e: any) {
        console.error("Gemini Image Gen Failed:", e);
        throw new Error(e.message || "Image generation failed");
    }
};

export const chatWithAdvisor = async (history: any[], message: string) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        systemInstruction: `
        You are Robin's AI Assistant at Vallarta Vows, a luxury wedding planning agency in Puerto Vallarta.
        
        **Your Personality:**
        - You are 100% human-like, warm, friendly, and enthusiastic. Never say "I am an AI".
        - Use emojis occasionally ✨.
        - Be conversational and empathetic. If they share a love story, react to it! 💖
        
        **Your Goal:**
        - Guide the user through a natural conversation to understand their dream wedding.
        - Your **PRIMARY OBJECTIVE** after helping them is to get them to book a Zoom meeting with Robin using this link: **[https://calendly.com/vallartavows/30min]**
        
        **Information to Collect (PRIORITY - Get this early):**
        1. **Bride & Groom Names:** First Name and Last Name for BOTH partners.
        2. **Contact Info:** Email Address and Phone Number.
        
        **Secondary Information (Collect naturally):**
        3. **The Big Day:** Estimated wedding date.
        4. **Guest Count:** Approximate number of guests.
        5. **Budget:** Estimated budget range (USD).
        6. **Referral:** How did they hear about us?
        
        **Fallback / Technical Issues:**
        - If the user cannot use the Calendly link for any reason, instruct them to send their details directly to:
          - Email: **robin@vallartavows.com**
          - WhatsApp: **+52 322 170 3027**
        
        **Flow:**
        - Start by welcoming them warmly.
        - prioritize asking for their Names (Bride & Groom) and Contact Info early in the chat.
        - Once you have the key details, suggested the Zoom call: [https://calendly.com/vallartavows/30min].
        - "Reflecting your love story is our passion. Let's make it official! Schedule a quick chat with Robin here: [https://calendly.com/vallartavows/30min]"
        
        **Safety:**
        - If asked about specific vendor pricing, give ranges but explain that Robin handles custom quotes.
        - If asked about legality or contracts, refer them to the consultation.
        `
    });

    const chat = model.startChat({
        history: history, // Expects standard Gemini history format
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
};

export const generateLocations = async (vibe: string) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    Role: Professional Wedding Photographer / Location Scout in Puerto Vallarta.
    Task: Suggest 6 specific, real photoshoot locations in Puerto Vallarta matching the vibe: "${vibe}".
    
    Output JSON array of objects:
    [
      { "name": "Location Name", "description": "Brief description why it fits" }
    ]
  `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
};

export const generateStoryboard = async (location: string, vibe: string) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    Role: Cinematic Director.
    Task: Create a 6-shot storyboard for a wedding couple photoshoot.
    Location: ${location}
    Vibe: ${vibe}
    
    Output JSON array of text strings describing each shot visually.
  `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
};

export const generateNewsletter = async (subject: string, points: string) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    Role: Professional Copywriter.
    Task: Write a newsletter for Vallarta Vows subscribers.
    Subject/Theme: ${subject}
    Key Points to Cover: ${points}
    
    Output JSON with:
    - subjectLine (catchy)
    - htmlContent (formatted body)
  `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
};

export const parseLeadFromText = async (rawText: string) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({
        // Switched to 'gemini-1.5-pro' to resolve 404 on Flash
        model: "gemini-1.5-pro",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Role: Data Entry Specialist.
    Task: Extract structured lead data from the following unstructured text (email or notes).
    
    Text: "${rawText}"
    
    Output JSON compatible with this TypeScript Lead interface:
    {
        partner1_first_name?: string;
        partner1_last_name?: string;
        partner1_gender?: string; // "Bride", "Groom", "Non-Binary"
        partner2_first_name?: string;
        partner2_last_name?: string;
        partner2_gender?: string;
        email: string; // REQUIRED
        phone?: string;
        wedding_date?: string; // Format YYYY-MM-DD if possible
        guest_count?: number;
        budget_range?: string;
        location_preference?: string;
        referral_source?: string;
        services_needed?: string[]; // e.g. ["Ceremony", "Reception", "Photography"]
        message?: string; // Any extra context or the original message body
    }

    Return strictly JSON.
    `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const textResponse = result.response.text();
    // Clean potential markdown code blocks (```json ... ```)
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);
};

// Helper to extract JSON from text
const extractJSON = (text: string) => {
    try {
        // First try standard cleaning (remove markdown)
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        // If that fails, try to find the first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(text.substring(start, end + 1));
        }
        throw e;
    }
};

export interface SocialContentParams {
    service: string;
    audience: string;
    tone: string;
    location?: string;
}

export const generateSocialPlatformContent = async (params: SocialContentParams) => {
    if (!genAI) throw new Error("Gemini API not configured");

    console.log("Generating social content with params:", params);

    // Use the user's available preview model
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    🎯 SYSTEM ROLE
    You are a Luxury Wedding Marketing AI Agent specialized in destination weddings in Puerto Vallarta, Mexico.
    
    🧩 MODULE OBJECTIVE
    Generate high-quality promotional posts.

    INPUTS:
    - Wedding Service: ${params.service}
    - Target Audience: ${params.audience}
    - Marketing Tone: ${params.tone}
    ${params.location ? `- Specific Location: ${params.location}` : ''}

    ✍️ CONTENT REQUIREMENTS
    - Write persuasive, emotionally engaging copy.
    - Match tone: ${params.tone}.
    - Highlight service: ${params.service}.
    ${params.location ? `- Highlight the unique features of ${params.location}.` : ''}
    - 4 distinct posts (FB, IG, TikTok, YouTube).

    📌 CTA (MUST BE EXACT):
    At Vallarta Vows, we design weddings that feel real, personal, and effortlessly beautiful.
    👉 Plan your destination wedding with us
    📲 🇺🇸 WhatsApp USA: +1 (646) 216-8516
    📲 🇲🇽 WhatsApp Mexico: +52 322-170-3027
    🌐 vallartavows.com
    📧 info@vallartavows.com

    🔖 HASHTAGS
    - EXACTLY 10 hashtags.
    - NO emojis in hashtags.
    - RETURN ONLY THE TEXT (e.g. "wedding", NOT "#wedding"). Do not include the '#' symbol.
    - MULTI-WORD TAGS MUST BE JOINED (e.g. "PuertoVallarta", NOT "Puerto Vallarta").

    OUTPUT JSON FORMAT:
    {
        "facebook": { "post": "...", "cta": "...", "hashtags": [...] },
        "instagram": { "caption": "...", "cta": "...", "hashtags": [...] },
        "tiktok": { "script_or_caption": "...", "cta": "...", "hashtags": [...] },
        "youtube": { "description": "...", "cta": "...", "hashtags": [...] }
    }
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        return extractJSON(result.response.text());
    } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        throw new Error(`AI Generation Failed: ${error.message}`);
    }
};

export const generateMarketingImagePrompt = async (
    socialContext: string,
    service: string,
    audience: string,
    aesthetic: string,
    aspectRatio: string
) => {
    if (!genAI) throw new Error("Gemini API not configured");

    // Use the user's available preview model
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    🎨 STEP 2 — IMAGE GENERATION PROMPT

    INPUTS:
    - Context: ${socialContext}
    - Aesthetic: ${aesthetic}
    - Aspect Ratio: ${aspectRatio}
    - Service: ${service}
    - Audience: ${audience}

    Requirements:
    - Ultra-realistic, Puerto Vallarta vibe.
    - No text, no logos.
    - Match the aesthetic: ${aesthetic}.
    
    OUTPUT:
    - Return ONLY the final prompt string.
    - Append aspect ratio: "--ar ${aspectRatio.replace(':', ':')}"
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        return result.response.text().trim();
    } catch (error: any) {
        console.error("Gemini Image Prompt Error:", error);
        throw new Error(`Prompt Polish Failed: ${error.message}`);
    }
};

export const generateArticleImagePrompt = async (
    title: string,
    content: string
) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    ROLE: Art Director for a Luxury Wedding Blog.
    TASK: Create a detailed AI image generation prompt for the following blog article.
    
    Article Title: "${title}"
    Excerpt/Content: "${content.substring(0, 500)}..."

    REQUIREMENTS:
    - Photorealistic, cinematic, bright, and airy.
    - Puerto Vallarta wedding vibe (beach, luxury, tropical).
    - No text in the image.
    - Focus on the mood and subject matter of the title.

    OUTPUT:
    - Return ONLY the prompt string.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        return result.response.text().trim();
    } catch (error: any) {
        console.error("Gemini Article Prompt Error:", error);
        throw new Error(`Article Prompt Gen Failed: ${error.message}`);
    }
};

export const generateBrandAvatarPrompt = async (
    imageUrls: string[],
    location: string,
    clothing: string,
    aspectRatio: string
) => {
    if (!genAI) throw new Error("Gemini API not configured");

    console.log("Generating brand avatar prompt...");
    // Use gemini-3-pro-preview to match Photoshoot Studio module (User Request)
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    // Fetch images and convert to base64
    const imageParts = await Promise.all(imageUrls.map(async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        // Browser-compatible ArrayBuffer to Base64 conversion
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = window.btoa(binary);

        return {
            inlineData: {
                data: base64,
                mimeType: "image/jpeg" // Adjust if needed
            }
        };
    }));

    const prompt = `
    ROLE: Expert AI Art Director.
    TASK: Analyze these 3 reference photos of Robin Manoogian.
    GOAL: Create a highly detailed image generation prompt to recreate her consistent brand avatar.

    SETTINGS:
    - Location: ${location}
    - Clothing: ${clothing}
    - Aspect Ratio: ${aspectRatio}

    OUTPUT JSON ONLY:
    {
      "avatar_prompt": "...",
      "alt_text": "...",
      "style_notes": "..."
    }

    RULES for 'avatar_prompt':
    - Start with: "Hyper-realistic portrait of..."
    - **CRITICAL**: You MUST accurately describe her specific facial features from the photos. Reference her eye shape/color, nose shape, lip shape, face structure, and hair color/style exactly.
    - Mention distinctive details (e.g., smile lines, specific hair texture, age indicators) to ensure likeness.
    - Specify the environment: ${location}.
    - Specify the outfit: ${clothing}.
    - Lighting: Professional, soft, cinematic.
    - Camera: 85mm lens, f/1.8, high resolution, 8k.
    - NO text, NO logos.
    - Append aspect ratio: "--ar ${aspectRatio.replace(':', ':')}"
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [...imageParts, { text: prompt }] }]
        });
        return extractJSON(result.response.text());
    } catch (error: any) {
        console.error("Gemini Avatar Prompt Error:", error);
        throw new Error(`Avatar Prompt Failed: ${error.message}`);
    }
};

export const generateBrandVoiceScript = async (
    service: string,
    tone: string,
    wordCountTarget: string = "75-95"
) => {
    if (!genAI) throw new Error("Gemini API not configured");

    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ROLE: Expert Copywriter & Brand Voice Specialist.
    PERSONA: Robin Manoogian (Founder of Vallarta Vows).
    TONE: ${tone} (Warm, Confident, Professional).
    SERVICE: ${service}.

    TASK: Write a 30-second voiceover script for a marketing video.

    CONSTRAINTS:
    - Word Count: ${wordCountTarget} words (Strict).
    - Duration: ~30 seconds.
    - Must mention: "Puerto Vallarta".
    - Avoid exaggerated claims.

    OUTPUT JSON ONLY:
    {
      "script": "...",
      "word_count": 0,
       "cta": {
        "website": "vallartavows.com",
        "whatsapp_usa": "{{WHATSAPP_USA}}",
        "whatsapp_mx": "{{WHATSAPP_MX}}"
      }
    }
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        return extractJSON(result.response.text());
    } catch (error: any) {
        console.error("Gemini Script Gen Error:", error);
        throw new Error(`Script Gen Failed: ${error.message}`);
    }
};

export const generateAvatarFromReferences = async (
    imageUrls: string[],
    textPrompt: string,
    aspectRatio: string
) => {
    if (!genAI) throw new Error("Gemini API not configured");
    console.log("Generating identity-locked avatar...", { aspectRatio });

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    // Fetch images and convert to base64
    const imageParts = await Promise.all(imageUrls.map(async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = window.btoa(binary);
        return {
            inlineData: {
                data: base64,
                mimeType: "image/jpeg"
            }
        };
    }));

    const finalPrompt = `
    TASK: Generate a photorealistic, high-fidelity avatar of the person shown in the provided reference images.
    
    CRITICAL REQUIREMENTS:
    1. IDENTITY LOCK: The face, skin tone, hair texture, and facial structure MUST be 100% identical to the reference photos. Do not beautify or alter the identity.
    2. SCENE: ${textPrompt}
    
    Output a single high-quality image.
    `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [...imageParts, { text: finalPrompt }] }]
    });

    const response = result.response;
    if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        const imagePart = parts.find(p => p.inlineData);
        if (imagePart && imagePart.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
    }
    throw new Error(`No image returned from gemini-3-pro-image-preview. Response: ${JSON.stringify(response)}`);
};
