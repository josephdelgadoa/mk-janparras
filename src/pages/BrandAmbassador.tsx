import { useState, useRef } from 'react';
import { brandAmbassadorService, BrandAsset, BrandScript } from '../services/brandAmbassadorService';
import { generateBrandAvatarPrompt, generateBrandVoiceScript, generateAvatarFromReferences } from '../services/geminiService';
import { authService } from '../services/authService';
import {
    CloudArrowUpIcon,
    UserCircleIcon,
    SparklesIcon,
    TrashIcon,
    CheckCircleIcon,
    PhotoIcon,
    MicrophoneIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const services = [
    'Beach Weddings', 'LGBT Weddings', 'Vow Renewals', 'Cruise Ship Weddings',
    'Villa Weddings', 'Civil Legal Weddings', 'Beach Picnic Weddings', 'Church Weddings'
];

const locations = [
    { id: 'Office', icon: '🏢' },
    { id: 'Restaurant', icon: '🍽️' },
    { id: 'Living Room', icon: '🛋️' },
    { id: 'Wedding Venue', icon: '💒' },
    { id: 'Beach', icon: '🏖️' }
];

const clothes = ['Business Summer Casual', 'Summer Dress Clothes', 'Elegant Clothes'];
const aspectRatios = ['1:1', '4:5', '9:16', '16:9'];

export default function BrandAmbassador() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Data
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    // Settings
    const [location, setLocation] = useState('Office');
    const [clothing, setClothing] = useState('Business Summer Casual');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [consent, setConsent] = useState(false);

    // Generated Asset
    const [asset, setAsset] = useState<BrandAsset | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    // Script Gen
    const [selectedService, setSelectedService] = useState(services[0]);
    const [tone, setTone] = useState('Warm & Elegant');
    const [generatedScript, setGeneratedScript] = useState<BrandScript | null>(null);

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (files.length + newFiles.length > 3) {
                alert("Maximum 3 images allowed.");
                return;
            }
            setFiles(prev => [...prev, ...newFiles]);

            // Generate previews
            newFiles.forEach(f => {
                const url = URL.createObjectURL(f);
                setPreviews(prev => [...prev, url]);
            });
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Step 2 -> 3: Create Asset & Generate Avatar Prompt
    const handleGenerateAvatar = async () => {
        if (!consent) {
            setError("Please confirm consent to proceed.");
            return;
        }
        if (files.length !== 3) {
            setError("Please upload exactly 3 reference images.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error("User not authenticated");

            // 1. Upload Images
            const paths = await brandAmbassadorService.uploadReferenceImages(files, user.id);

            // 2. Create Asset Record
            const newAsset = await brandAmbassadorService.createAsset({
                created_by_user_id: user.id,
                reference_image_urls: paths,
                location,
                clothing,
                aspect_ratio: aspectRatio,
                consent_confirmed: true,
                status: 'processing'
            });

            if (!newAsset) throw new Error("Failed to create asset record");

            // 3. Generate Prompt (using signed URLs)
            const signedUrls = await Promise.all(paths.map(p => brandAmbassadorService.getSignedUrl(p)));
            const promptData = await generateBrandAvatarPrompt(signedUrls, location, clothing, aspectRatio);

            // 4. Generate Image (using strict Identity Lock with Gemini 3 Pro)
            // We pass the signed source URLs directly to the model + the descriptive prompt
            const generatedImageUrl = await generateAvatarFromReferences(signedUrls, promptData.avatar_prompt, aspectRatio);

            // 5. Update Asset
            const updatedAsset = await brandAmbassadorService.updateAsset(newAsset.id, {
                avatar_prompt: promptData.avatar_prompt,
                avatar_image_url: generatedImageUrl, // Storing data URI for now, ideally upload back to storage
                status: 'ready'
            });

            setAsset(updatedAsset);
            setStep(3); // Move to Preview

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to generate avatar");
        } finally {
            setLoading(false);
        }
    };

    // Step 3 -> 4: Generate Script
    const handleGenerateScript = async () => {
        if (!asset) return;
        setLoading(true);

        try {
            const result = await generateBrandVoiceScript(selectedService, tone);

            const newScript = await brandAmbassadorService.saveScript({
                asset_id: asset.id,
                service: selectedService,
                tone,
                script_text: result.script,
                script_word_count: result.word_count || 0,
                status: 'ready'
            });

            setGeneratedScript(newScript);

        } catch (e: any) {
            console.error(e);
            alert("Failed to generate script");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Brand Ambassador Toolkit</h1>
                    <p className="text-gray-500 mt-1">Generate consistent marketing assets featuring Robin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Step 1: Upload */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 1 ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-gray-200 opacity-60'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
                            <h2 className="font-bold text-gray-900">1. Reference Photos</h2>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload 3 photos</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-md overflow-hidden relative group">
                                            {previews[i] ? (
                                                <>
                                                    <img src={previews[i]} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removeFile(i)}
                                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                                    >
                                                        <TrashIcon className="h-3 w-3" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300 text-xs">Slot {i + 1}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {files.length === 3 && (
                                    <div className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 p-2 rounded">
                                        <CheckCircleIcon className="h-4 w-4" /> 3 Images Ready
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Settings */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 2 || (step === 1 && files.length === 3) ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-gray-200 opacity-60'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <UserCircleIcon className="h-5 w-5 text-gray-400" />
                            <h2 className="font-bold text-gray-900">2. Avatar Settings</h2>
                        </div>

                        {/* Allow settings only if files are uploaded or moving forward */}
                        {(step >= 1) && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Location</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {locations.map(l => (
                                            <button
                                                key={l.id}
                                                onClick={() => setLocation(l.id)}
                                                className={`p-2 rounded border text-xs flex flex-col items-center gap-1 transition-colors ${location === l.id ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}
                                            >
                                                <span className="text-lg">{l.icon}</span>
                                                {l.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Clothing</label>
                                    <select
                                        value={clothing}
                                        onChange={(e) => setClothing(e.target.value)}
                                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    >
                                        {clothes.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                                    <div className="flex gap-2">
                                        {aspectRatios.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setAspectRatio(r)}
                                                className={`px-3 py-1 rounded border text-xs font-medium ${aspectRatio === r ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consent}
                                            onChange={e => setConsent(e.target.checked)}
                                            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <span className="text-xs text-gray-500">
                                            I confirm I have permission to use these images to generate a marketing avatar.
                                        </span>
                                    </label>
                                </div>

                                {step < 3 && (
                                    <button
                                        onClick={handleGenerateAvatar}
                                        disabled={loading || !consent || files.length !== 3}
                                        className="w-full py-2.5 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                                        Generate Avatar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Preview / Results */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AVATAR RESULT */}
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
                        <h2 className="text-xl font-bold font-serif mb-6">Generated Avatar</h2>

                        {asset?.avatar_image_url ? (
                            <div className="flex-1 flex flex-col items-center">
                                <div className="relative group max-w-md w-full rounded-lg overflow-hidden shadow-lg">
                                    <img src={asset.avatar_image_url} alt="Generated Avatar" className="w-full h-auto" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a href={asset.avatar_image_url} download="robin-avatar.png" className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                                            Download Image
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-6 w-full max-w-md">
                                    <button onClick={() => setShowPrompt(!showPrompt)} className="text-xs text-gray-500 hover:text-primary underline mb-2">
                                        {showPrompt ? 'Hide Prompt' : 'Show AI Prompt'}
                                    </button>
                                    {showPrompt && (
                                        <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-600 border border-gray-100">
                                            {asset.avatar_prompt}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                {loading ? (
                                    <>
                                        <ArrowPathIcon className="h-10 w-10 animate-spin text-primary mb-3" />
                                        <p>Analyzing photos & generating avatar...</p>
                                    </>
                                ) : (
                                    <>
                                        <UserCircleIcon className="h-16 w-16 mb-2 opacity-20" />
                                        <p>Upload reference photos to start</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SCRIPT GENERATOR (Only shows after avatar is ready) */}
                    {asset && (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                            <div className="flex items-center gap-2 mb-6">
                                <MicrophoneIcon className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold font-serif">Voice Script Generator</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Promoted Service</label>
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    >
                                        {services.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice Tone</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Warm & Elegant', 'Friendly & Casual', 'Luxury & Premium'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTone(t)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${tone === t ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateScript}
                                disabled={loading}
                                className="w-full md:w-auto px-6 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
                            >
                                {loading ? <ArrowPathIcon className="animate-spin h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                                Generate 30s Script
                            </button>

                            {generatedScript && (
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative group">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedScript.script_text)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-primary p-2 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy Script"
                                    >
                                        <ClipboardDocumentIcon className="h-5 w-5" />
                                    </button>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Script ({generatedScript.script_word_count} words)</h3>
                                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium">
                                        {generatedScript.script_text}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-lg border border-red-200 max-w-md animate-slide-up">
                    <p className="font-bold text-sm">Error</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-400 hover:text-red-700">&times;</button>
                </div>
            )}
        </div>
    );
}
