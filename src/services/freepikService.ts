
export type FreepikModel =
    | 'fast' // Classic Fast ?
    | 'imagen-3'
    | 'flux-dev'
    | 'flux-pro-1.1'
    | 'mystic'
    | 'seedream'
    | 'seedream-4'
    | 'seedream-4-edit'
    | 'seedream-4.5'
    | 'seedream-4.5-edit'
    | 'nano-banana-pro';

export const FREEPIK_MODELS: { id: FreepikModel; name: string }[] = [
    { id: 'mystic', name: 'Mystic (High Fidelity)' },
    { id: 'imagen-3', name: 'Google Imagen 3' },
    { id: 'flux-dev', name: 'Flux 2.0 (Dev)' }, // Assuming Flux 2.0 maps to dev/pro
    { id: 'seedream-4', name: 'Seedream 4' },
    { id: 'seedream-4.5', name: 'Seedream 4.5' },
    { id: 'fast', name: 'Classic Fast (Nano Banana?)' }, // Placeholder matching user request
    { id: 'nano-banana-pro', name: 'Nano Banana Pro (Ultra Realistic)' },
];

const MODEL_ENDPOINTS: Record<string, string> = {
    'mystic': 'https://api.freepik.com/v1/ai/mystic',
    'flux-dev': 'https://api.freepik.com/v1/ai/text-to-image/flux-dev',
    'flux-pro-1.1': 'https://api.freepik.com/v1/ai/text-to-image/flux-pro-v1-1', // Corrected versioning
    'imagen-3': 'https://api.freepik.com/v1/ai/imagen-3', // Trying short path similar to classic-fast/mystic
    'seedream-4': 'https://api.freepik.com/v1/ai/text-to-image/seedream-v4',
    'seedream-4.5': 'https://api.freepik.com/v1/ai/text-to-image/seedream-v4-5',
    'fast': 'https://api.freepik.com/v1/ai/classic-fast',
    'seedream': 'https://api.freepik.com/v1/ai/text-to-image/seedream',
    'nano-banana-pro': 'https://api.freepik.com/v1/ai/mystic', // Mapping to Mystic for Ultra Realistic quality
};

export const generateFreepikImage = async (prompt: string, modelId: FreepikModel = 'mystic', aspectRatio: string = 'square'): Promise<string> => {
    // We now use the Google Web App as a proxy because Freepik doesn't support CORS for browser requests.
    const proxyUrl = import.meta.env.VITE_GOOGLE_WEB_APP_URL;
    const apiKey = import.meta.env.VITE_FREEPIK_API_KEY; // User provided key

    if (!proxyUrl) throw new Error("Google Web App URL not configured");
    // We don't throw for missing apiKey immediately, just in case proxy has a fallback, but we should pass it if present.

    const endpoint = MODEL_ENDPOINTS[modelId] || MODEL_ENDPOINTS['mystic'];

    // Map Ratio to Freepik Specific Formats (Required for Flux, etc.)
    // Allowed: 'square_1_1', 'classic_4_3', 'traditional_3_4', 'widescreen_16_9', 
    // 'social_story_9_16', 'standard_3_2', 'portrait_2_3', 'horizontal_2_1', 'vertical_1_2', 'social_post_4_5'

    const RATIO_MAP: Record<string, string> = {
        '1:1': 'square_1_1',
        '4:3': 'classic_4_3',
        '3:4': 'traditional_3_4',
        '16:9': 'widescreen_16_9',
        '9:16': 'social_story_9_16'
        // Fallbacks for potential future additions
    };

    const payload = {
        prompt: prompt,
        aspect_ratio: RATIO_MAP[aspectRatio] || 'square_1_1'
    };

    try {
        // Call our Google Apps Script Proxy
        const response = await fetch(proxyUrl, {
            method: 'POST',
            body: JSON.stringify({
                type: 'generate_image',
                endpoint: endpoint,
                apiKey: apiKey, // Pass user key to proxy
                payload: payload
            })
            // No headers needed for GAS usually, sending plain text/json body
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Proxy Network Error: ${err}`);
        }

        const json = await response.json();

        // Check GAS Wrapper Response
        if (json.result === 'error') {
            // If Freepik returned an error inside the proxy
            throw new Error(`Freepik API Error via Proxy (${endpoint}): ${json.message || JSON.stringify(json.data)}`);
        }

        // Extract Data from Freepik Response (nested in json.data)
        const freepikData = json.data;

        if (freepikData.data && freepikData.data.task_id) {
            // Async flow (Mystic/Nano Banana)
            const taskId = freepikData.data.task_id;
            console.log(`Async Task Initiated: ${taskId}. Polling for result...`);

            // Poll for result
            const maxAttempts = 30; // 60 seconds
            for (let i = 0; i < maxAttempts; i++) {
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s

                const statusUrl = `${endpoint}/${taskId}`;

                // Call Proxy for Status
                const statusRes = await fetch(proxyUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'generate_image',
                        endpoint: statusUrl,
                        apiKey: apiKey, // Pass user key
                        payload: {}
                    })
                });

                if (!statusRes.ok) throw new Error("Status check failed");
                const statusJson = await statusRes.json();

                if (statusJson.result === 'error') throw new Error(`Status API Error: ${statusJson.message || JSON.stringify(statusJson)}`);

                const statusData = statusJson.data; // Wrapper

                // Check specific status structure for Mystic
                // Response: { data: { status: "COMPLETED", generated: [ ... ] } }
                const innerData = statusData.data || {};

                if (innerData.status === 'COMPLETED' && innerData.generated && innerData.generated.length > 0) {
                    // Mystic returns a URL or Base64 in 'generated' array?
                    // Usually Mystic returns just the URL or object in generated? 
                    // Let's assume it returns { url: ... } or base64 string directly?
                    // Or generated[0] is the base64/url.
                    // The error message showed "generated": [] so it's an array.

                    const resultItem = innerData.generated[0];
                    if (resultItem.base64) return `data:image/png;base64,${resultItem.base64}`;
                    if (resultItem.url) return resultItem.url;
                    return resultItem; // Fallback if it's a direct string
                }

                if (innerData.status === 'FAILED') {
                    throw new Error("Image generation task failed");
                }

                console.log(`Polling attempt ${i + 1}: ${innerData.status || 'Unknown'}`);
            }
            throw new Error("Async generation timed out");
        }

        // Standard Sync Checks
        if (freepikData.data && freepikData.data[0] && freepikData.data[0].base64) {
            return `data:image/png;base64,${freepikData.data[0].base64}`;
        }
        if (freepikData.data && freepikData.data[0] && freepikData.data[0].url) {
            return freepikData.data[0].url;
        }
        if (freepikData.generated && freepikData.generated[0]) {
            return freepikData.generated[0];
        }
        if (freepikData.data && freepikData.data.generated && freepikData.data.generated[0]) {
            return freepikData.data.generated[0];
        }

        throw new Error(`No valid image data received. Keys: ${Object.keys(freepikData).join(', ')}. Data: ${JSON.stringify(freepikData).substring(0, 200)}...`);

    } catch (error) {
        console.error("Freepik Generation Failed:", error);
        throw error;
    }
};
