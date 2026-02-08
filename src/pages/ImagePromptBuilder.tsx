import { useState } from 'react';
import { generateSocialPlatformContent, generateMarketingImagePrompt, generateImage } from '../services/geminiService';
import { PaintBrushIcon, SparklesIcon, ArrowPathIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const services = [
    'Beach Weddings',
    'LGBT Weddings',
    'Vow Renewals',
    'Cruise Ship Weddings',
    'Villa Weddings',
    'Civil Legal Weddings',
    'Beach Picnic Weddings',
    'Church Weddings'
];

const audiences = [
    'Luxury Seekers',
    'Budget Conscious',
    'Adventure Enthusiasts',
    'Intimate Elopement',
    'Traditional & Family'
];

const tones = [
    'Romantic',
    'Elegant',
    'Emotional',
    'Adventurous',
    'Timeless',
    'Warm',
    'Modern Luxury'
];

const aesthetics = [
    'Golden Hour Glow',
    'Vibrant Tropical Daylight',
    'Elegant Midnight Glow',
    'Cinematic Drama',
    'Nostalgic Vintage Film',
    'Airy & Bright Pastel'
];

const locations = [
    {
        name: "Conchas Chinas Beach",
        desc: "Famous for its natural tide pools and dramatic rock formations, this location creates mirror-like reflections of the amber sky, offering a secluded and ethereal romance perfect for soft, dreamy portraits."
    },
    {
        name: "Mirador Cerro de la Cruz",
        desc: "A high vantage point overlooking the entire Banderas Bay; during golden hour, the sun backlights the terracotta rooftops of the city and casts a warm, cinematic glow over the ocean horizon."
    },
    {
        name: "Los Arcos Marine Park (via Panga Boat)",
        desc: "Shooting from a boat in front of these massive granite arches provides a majestic silhouette against the setting sun, capturing the sparkling interplay of light on the deep blue water."
    },
    {
        name: "Los Muertos Pier",
        desc: "The modern, sail-shaped architecture creates stunning geometric shadows and leading lines, while the metal structure catches the last rays of the sun, blending urban sophistication with beach sunset vibes."
    },
    {
        name: "Playa Las Gemelas",
        desc: "A quieter, twin-cove beach with turquoise waters and fine sand that reflect the sunlight softly, framed by lush green vegetation that glows beautifully when backlit by the low sun."
    },
    {
        name: "Playa Palmares",
        desc: "Known for its pristine, uncluttered shoreline and distinct stone wall architecture, this location offers a clean, minimalist aesthetic where the golden light washes over the waves without the distraction of heavy crowds."
    }
];

const aspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export default function SocialMediaMarketing() {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // Step 1 Inputs
    const [service, setService] = useState('Beach Weddings');
    const [audience, setAudience] = useState('Luxury Seekers');
    const [tone, setTone] = useState('Romantic');
    const [location, setLocation] = useState<string>('');

    // Step 2 Inputs
    const [aesthetic, setAesthetic] = useState('Golden Hour Glow');
    const [aspectRatio, setAspectRatio] = useState('1:1');

    // Outputs
    const [socialContent, setSocialContent] = useState<any>(null);

    // Image Gen State
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    const handleGenerateContent = async () => {
        setLoading(true);
        setSocialContent(null);
        setGeneratedImage(null);
        setImagePrompt('');

        try {
            const result = await generateSocialPlatformContent({
                service,
                audience,
                tone,
                location
            });
            setSocialContent(result);
            setStep(2);
        } catch (e: any) {
            console.error("Content Gen Failed", e);
            alert(`Failed to generate content: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!socialContent) return;
        setImageLoading(true);
        setGeneratedImage(null);

        try {
            // Context from generated content
            const context = socialContent.instagram?.caption || socialContent.facebook?.post || "";

            // 1. Generate Prompt
            const prompt = await generateMarketingImagePrompt(
                context,
                service,
                audience,
                aesthetic,
                aspectRatio
            );
            setImagePrompt(prompt);

            // 2. Generate Image (Using Google Imagen 4 via Gemini API)
            // Note: The 'ultra' tier in our service now points to imagen-4.0-generate-001
            const imageUrl = await generateImage(prompt, 'ultra', aspectRatio);
            setGeneratedImage(imageUrl);

        } catch (e: any) {
            console.error("Image Gen Failed", e);
            alert(`Image generation failed: ${e.message}`);
        } finally {
            setImageLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Social Media Marketing</h1>
                    <p className="text-gray-500 mt-1">Generate high-conversion content & matching professional visuals.</p>
                </div>
                {step === 2 && (
                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary underline">
                        Start Over
                    </button>
                )}
            </div>

            {/* STEP 1: Content Generation */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Post Content Strategy
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Service</label>
                            <div className="space-y-2">
                                {services.map(s => (
                                    <label key={s} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${service === s ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="service"
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                            checked={service === s}
                                            onChange={() => setService(s)}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-900">{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2.5 bg-white border"
                                    value={audience}
                                    onChange={e => setAudience(e.target.value)}
                                >
                                    {audiences.map(a => <option key={a}>{a}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Tone</label>
                                <div className="flex flex-wrap gap-2">
                                    {tones.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${tone === t
                                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location Highlight (Optional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {locations.map(loc => (
                                    <div
                                        key={loc.name}
                                        onClick={() => setLocation(prev => prev === loc.name ? '' : loc.name)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${location === loc.name ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50'}`}
                                    >
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">{loc.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{loc.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={handleGenerateContent}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                            {loading ? 'Generating Content Strategy...' : 'Generate Social Content'}
                        </button>
                    </div>
                </div>
            )
            }

            {/* STEP 2: Review & Visuals */}
            {
                step === 2 && socialContent && (
                    <div className="space-y-8 animate-slide-up">

                        {/* Social Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SocialCard
                                platform="Facebook"
                                color="bg-[#1877F2]"
                                icon="FB"
                                content={socialContent.facebook?.post}
                                cta={socialContent.facebook?.cta}
                                hashtags={socialContent.facebook?.hashtags}
                                onCopy={copyToClipboard}
                            />
                            <SocialCard
                                platform="Instagram"
                                color="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                                icon="IG"
                                content={socialContent.instagram?.caption}
                                cta={socialContent.instagram?.cta}
                                hashtags={socialContent.instagram?.hashtags}
                                onCopy={copyToClipboard}
                            />
                            <SocialCard
                                platform="TikTok"
                                color="bg-black"
                                icon="TT"
                                content={socialContent.tiktok?.script_or_caption}
                                cta={socialContent.tiktok?.cta}
                                hashtags={socialContent.tiktok?.hashtags}
                                onCopy={copyToClipboard}
                            />
                            <SocialCard
                                platform="YouTube"
                                color="bg-[#FF0000]"
                                icon="YT"
                                content={socialContent.youtube?.description}
                                cta={socialContent.youtube?.cta}
                                hashtags={socialContent.youtube?.hashtags}
                                onCopy={copyToClipboard}
                            />
                        </div>

                        {/* Image Generation Config */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Image Generation Prompt
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Aesthetic</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {aesthetics.map(a => (
                                            <button
                                                key={a}
                                                onClick={() => setAesthetic(a)}
                                                className={`p-2 text-xs rounded-md border text-center transition-colors ${aesthetic === a
                                                    ? 'bg-teal-50 text-teal-700 border-teal-200 font-medium'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-white'
                                                    }`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                                    <div className="flex flex-wrap gap-2">
                                        {aspectRatios.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setAspectRatio(r)}
                                                className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${aspectRatio === r
                                                    ? 'bg-gray-800 text-white border-gray-800'
                                                    : 'bg-white text-gray-600 border-gray-300'
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 pt-4 border-t border-gray-200">
                                <div className="flex-1 space-y-4">
                                    <button
                                        onClick={handleGenerateImage}
                                        disabled={imageLoading}
                                        className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {imageLoading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : <PaintBrushIcon className="h-5 w-5" />}
                                        {imageLoading ? 'Generating Prompt & Image...' : 'Generate Image Prompt'}
                                    </button>

                                    {imagePrompt && (
                                        <div className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs font-mono mt-4 relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => copyToClipboard(imagePrompt)} className="text-white bg-gray-700 p-1.5 rounded hover:bg-gray-600"><ClipboardDocumentIcon className="h-4 w-4" /></button>
                                            </div>
                                            <p className="font-bold text-gray-500 mb-2">GENERATED PROMPT (MidJourney / Veo Style):</p>
                                            {imagePrompt}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    {imageLoading ? (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-[300px] flex flex-col items-center justify-center text-gray-400">
                                            <PaintBrushIcon className="h-10 w-10 animate-bounce mb-2" />
                                            <span className="text-sm">Processing...</span>
                                        </div>
                                    ) : generatedImage ? (
                                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                                            <img src={generatedImage} alt="Generated Visual" className="w-full h-auto rounded-lg object-contain" />
                                            <div className="mt-2 text-right">
                                                <a href={generatedImage} download="marketing_visual.png" target="_blank" rel="noreferrer" className="text-primary text-sm font-medium hover:underline">Download Image</a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-[300px] flex items-center justify-center text-gray-400">
                                            <span className="text-sm">Preview will appear here</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

function SocialCard({ platform, color, icon, content, cta, hashtags, onCopy }: any) {
    const fullText = `${content}\n\n${cta}\n\n${hashtags?.map((t: string) => `#${t.replace(/^#/, '').replace(/\s+/g, '')}`).join(' ')}`;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className={`${color} px-4 py-3 flex justify-between items-center text-white`}>
                <div className="flex items-center gap-2 font-bold">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{icon}</span>
                    {platform}
                </div>
                <button onClick={() => onCopy(fullText)} className="text-white/80 hover:text-white p-1">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                <div className="flex-1 whitespace-pre-wrap text-gray-700 font-medium">{content}</div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-600 whitespace-pre-line">
                    {cta}
                </div>
                <div className="text-primary text-xs font-semibold">
                    {hashtags?.map((t: string) => `#${t.replace(/^#/, '').replace(/\s+/g, '')}`).join(' ')}
                </div>
            </div>
        </div>
    );
}
