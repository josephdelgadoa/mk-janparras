import { useState } from 'react';
import { generateLocations, generateStoryboard, generateImage } from '../services/geminiService';
import { CameraIcon, MapPinIcon, FilmIcon, SparklesIcon, ArrowPathIcon, SwatchIcon, UserIcon } from '@heroicons/react/24/outline';

const steps = [
    { id: 1, name: 'Vibe & Concept' },
    { id: 2, name: 'Reference Portraits' },
    { id: 3, name: 'Location Scouting' },
    { id: 4, name: 'Storyboard' }
];

const groomOutfits = ["Classic Black Tuxedo", "Navy Blue Suit", "Beige Linen Suit", "Charcoal Grey Suit", "Forest Green Velvet Jacket"];
const brideOutfits = ["Lace Mermaid Gown", "Satin Ballgown", "Boho Chiffon Dress", "Modern Silk Slip Dress", "Vintage Lace A-Line"];
const aspectRatios = ["16:9", "4:3", "1:1", "9:16"];

// Advanced Profile Data
const ethnicities = ["Latino/Hispanic", "Caucasian/European", "North American", "Asian", "Black/African American", "Mediterranean"];
const ages = ["Early 20s", "Late 20s", "Mid 30s", "Late 30s", "Early 40s"];
const hairColors = ["Dark Brown", "Black", "Blonde", "Light Brown", "Auburn"];
const eyeColors = ["Brown", "Hazel", "Blue", "Green"];

export default function PhotoshootStudio() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [couple, setCouple] = useState('');
    const [vibe, setVibe] = useState('Dreamy Golden Hour');
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [storyboard, setStoryboard] = useState<string[]>([]);

    // Advanced Character Profiles
    const [groomProfile, setGroomProfile] = useState<any>({});
    const [brideProfile, setBrideProfile] = useState<any>({});
    const [portraitRenders, setPortraitRenders] = useState<{ groom?: string; bride?: string }>({});
    const [generatingPortraits, setGeneratingPortraits] = useState(false);

    // Settings
    const [aspectRatio, setAspectRatio] = useState('16:9');

    // Per-shot render state
    const [renders, setRenders] = useState<Record<number, string>>({});
    const [renderingShots, setRenderingShots] = useState<Record<number, boolean>>({});

    const generateRandomProfile = (type: 'groom' | 'bride', minAgeIndex: number = 0) => {
        const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];

        // Filter ages based on minAgeIndex
        const availableAges = ages.slice(minAgeIndex);
        const age = availableAges[Math.floor(Math.random() * availableAges.length)];

        const hair = hairColors[Math.floor(Math.random() * hairColors.length)];
        const eyes = eyeColors[Math.floor(Math.random() * eyeColors.length)];
        const outfit = type === 'groom'
            ? groomOutfits[Math.floor(Math.random() * groomOutfits.length)]
            : brideOutfits[Math.floor(Math.random() * brideOutfits.length)];

        return {
            ethnicity, age, hair, eyes, outfit,
            description: `${age} ${ethnicity} ${type === 'groom' ? 'male' : 'female'}, ${hair} hair, ${eyes} eyes, wearing ${outfit}`
        };
    };

    const randomizeProfiles = () => {
        // Generate Bride first
        const bride = generateRandomProfile('bride');

        // Find her age index to set as minimum for Groom
        const brideAgeIndex = ages.indexOf(bride.age);

        // Generate Groom with constraint (Groom age >= Bride age)
        const groom = generateRandomProfile('groom', brideAgeIndex);

        setBrideProfile(bride);
        setGroomProfile(groom);
        setPortraitRenders({}); // Reset portraits on re-roll
    };

    // Handlers
    const handleVibeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!groomProfile.description) {
            randomizeProfiles();
        }

        // Move to Portrait Generation
        setCurrentStep(2);
        setLoading(false);
    };

    const generatePortraits = async () => {
        setGeneratingPortraits(true);
        try {
            // Generate Groom
            if (!portraitRenders.groom) {
                const groomPrompt = `Portrait of a ${groomProfile.description}, ${vibe} style. Close up facial portrait, high definition, detailed texture, 8k, photorealistic.`;
                const groomUrl = await generateImage(groomPrompt, 'ultra', '3:4');
                setPortraitRenders(prev => ({ ...prev, groom: groomUrl }));
            }

            // Generate Bride
            if (!portraitRenders.bride) {
                const bridePrompt = `Portrait of a ${brideProfile.description}, ${vibe} style. Close up facial portrait, high definition, detailed texture, 8k, photorealistic.`;
                const brideUrl = await generateImage(bridePrompt, 'ultra', '3:4');
                setPortraitRenders(prev => ({ ...prev, bride: brideUrl }));
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate portraits.");
        } finally {
            setGeneratingPortraits(false);
        }
    };

    const goToScouting = async () => {
        setLoading(true);
        try {
            const locs = await generateLocations(vibe);
            setLocations(locs);
            setCurrentStep(3);
        } catch (e) {
            console.error(e);
            alert("Failed to generate locations.");
        } finally {
            setLoading(false);
        }
    }

    const handleLocationSelect = async (loc: any) => {
        setSelectedLocation(loc);
        setLoading(true);
        try {
            const shots = await generateStoryboard(loc.name, vibe);
            setStoryboard(shots);
            setCurrentStep(4);
        } catch (e) {
            console.error(e);
            alert("Failed to generate storyboard.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateShot = async (index: number, shotDescription: string) => {
        setRenderingShots(prev => ({ ...prev, [index]: true }));
        try {
            // Construct consistent prompt using detailed profiles
            const prompt = `Wedding photo of ${couple}. 
            Groom: ${groomProfile.description}. 
            Bride: ${brideProfile.description}. 
            Vibe: ${vibe}. Location: ${selectedLocation.name}. 
            Shot: ${shotDescription}. 
            High definition, photorealistic, ${aspectRatio} cinematic shot.`;

            const imageUrl = await generateImage(prompt, 'ultra', aspectRatio);
            setRenders(prev => ({ ...prev, [index]: imageUrl }));
        } catch (e) {
            console.error(e);
            alert("Failed to generate shot.");
        } finally {
            setRenderingShots(prev => ({ ...prev, [index]: false }));
        }
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const dataURItoBlob = (dataURI: string) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const handleDownload = async (url: string, index: number, format: 'png' | 'jpg', prefix: string = 'shot') => {
        const filename = `vallarta-vows-${prefix}-${index + 1}.${format}`;
        let blob: Blob | null = null;

        try {
            if (format === 'jpg') {
                // Convert to JPG using canvas (Promisified)
                blob = await new Promise<Blob | null>((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = url;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            resolve(null);
                            return;
                        }

                        // Draw white background for JPG
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);

                        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                        resolve(dataURItoBlob(jpgDataUrl));
                    };
                    img.onerror = () => resolve(null);
                });
            } else {
                // PNG
                blob = dataURItoBlob(url);
            }

            if (!blob) throw new Error("Failed to create blob");

            // Try File System Access API for "Save As" dialog
            // @ts-ignore - Modern API
            if (window.showSaveFilePicker) {
                try {
                    // @ts-ignore
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'Image File',
                            accept: { [format === 'jpg' ? 'image/jpeg' : 'image/png']: ['.' + format] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return; // Success!
                } catch (pickerError) {
                    // User cancelled or API error -> Fallback
                    console.warn("File picker cancelled or failed, falling back to auto-download:", pickerError);
                }
            }

            // Fallback to standard anchor download
            downloadBlob(blob, filename);

        } catch (e) {
            console.error("Download failed:", e);
            alert("Failed to download image.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-primary">Photoshoot Studio</h1>
                <div className="flex gap-2">
                    {currentStep > 1 && (
                        <button onClick={() => window.location.reload()} className="text-sm text-gray-500 hover:text-gray-900 border px-3 py-1 rounded">
                            Start Over
                        </button>
                    )}
                </div>
            </div>

            {/* Stepper */}
            <nav aria-label="Progress" className="mb-10">
                <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                    {steps.map((step) => (
                        <li key={step.name} className="md:flex-1">
                            <div className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${currentStep >= step.id ? 'border-primary' : 'border-gray-200'}`}>
                                <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-gray-500'}`}>Step {step.id}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Step 1: Vibe */}
            {currentStep === 1 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-xl mx-auto">
                    <form onSubmit={handleVibeSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Couple Names</label>
                            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                value={couple} onChange={e => setCouple(e.target.value)} placeholder="e.g. Maya & Leo" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Photoshoot Vibe</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                value={vibe} onChange={e => setVibe(e.target.value)}
                            >
                                <option>Dreamy Golden Hour</option>
                                <option>Old Hollywood Glamour</option>
                                <option>Bohemian Jungle</option>
                                <option>Urban Chic</option>
                                <option>Cinematic Editorial</option>
                            </select>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Consistent Characters (Randomized)</span>
                                <button type="button" onClick={randomizeProfiles} className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    <SwatchIcon className="h-3 w-3" /> Re-roll Traits
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md space-y-2">
                                <p><strong>Groom:</strong> {groomProfile.description || '(Will generate on start)'}</p>
                                <p><strong>Bride:</strong> {brideProfile.description || '(Will generate on start)'}</p>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-pink-700 disabled:opacity-50">
                            Create Profiles & Start
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Portraits */}
            {currentStep === 2 && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-2xl font-serif font-bold text-gray-900">Reference Portraits</h2>
                        <p className="text-gray-500 mt-2">Generating detailed profiles to ensure consistency across all shots.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Groom */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <UserIcon className="h-6 w-6 text-gray-400" />
                                <h3 className="font-bold text-gray-900">Groom Profile</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 h-10">{groomProfile.description}</p>
                            <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
                                {portraitRenders.groom ? (
                                    <>
                                        <img src={portraitRenders.groom} alt="Groom Portrait" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => handleDownload(portraitRenders.groom!, 0, 'jpg', 'groom')} className="bg-white text-gray-900 px-3 py-1 rounded text-xs font-bold">Download JPG</button>
                                        </div>
                                    </>
                                ) : (
                                    generatingPortraits ? <ArrowPathIcon className="animate-spin h-8 w-8 text-gray-400" /> : <UserIcon className="h-16 w-16 text-gray-300" />
                                )}
                            </div>
                        </div>

                        {/* Bride */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <UserIcon className="h-6 w-6 text-gray-400" />
                                <h3 className="font-bold text-gray-900">Bride Profile</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 h-10">{brideProfile.description}</p>
                            <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
                                {portraitRenders.bride ? (
                                    <>
                                        <img src={portraitRenders.bride} alt="Bride Portrait" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => handleDownload(portraitRenders.bride!, 0, 'jpg', 'bride')} className="bg-white text-gray-900 px-3 py-1 rounded text-xs font-bold">Download JPG</button>
                                        </div>
                                    </>
                                ) : (
                                    generatingPortraits ? <ArrowPathIcon className="animate-spin h-8 w-8 text-gray-400" /> : <UserIcon className="h-16 w-16 text-gray-300" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        {!portraitRenders.groom && (
                            <button onClick={generatePortraits} disabled={generatingPortraits} className="px-6 py-3 bg-primary text-white rounded-lg shadow-md font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2">
                                {generatingPortraits ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : <CameraIcon className="h-5 w-5" />}
                                Generate Portraits
                            </button>
                        )}
                        {portraitRenders.groom && (
                            <button onClick={goToScouting} className="px-6 py-3 bg-secondary text-white rounded-lg shadow-md font-medium hover:bg-teal-700 flex items-center gap-2">
                                Looks Good! Start Scouting &rarr;
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* Step 3: Locations */}
            {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold font-serif">Suggested Locations for "{vibe}"</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {locations.map((loc, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-primary cursor-pointer transition-all" onClick={() => handleLocationSelect(loc)}>
                                <MapPinIcon className="h-8 w-8 text-secondary mb-3" />
                                <h3 className="font-bold text-gray-900">{loc.name}</h3>
                                <p className="text-sm text-gray-500 mt-2">{loc.description}</p>
                                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                                    Select Location &rarr;
                                </div>
                            </div>
                        ))}
                    </div>
                    {loading && (
                        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                            <ArrowPathIcon className="animate-spin h-10 w-10 text-primary" />
                        </div>
                    )}
                </div>
            )}
            {/* Step 4: Storyboard & Generation */}
            {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold font-serif">Storyboard: {selectedLocation?.name}</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Featuring: {groomProfile.description} & {brideProfile.description}
                            </p>
                        </div>

                        {/* Aspect Ratio Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">Format:</span>
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary py-1.5 pl-3 pr-8 bg-gray-50"
                            >
                                {aspectRatios.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {storyboard.map((shot, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                                {/* Text Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Shot Concept</h3>
                                            <p className="text-gray-600 mt-1 leading-relaxed">{shot}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleGenerateShot(idx, shot)}
                                        disabled={renderingShots[idx] || !!renders[idx]}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium
                                            ${renders[idx]
                                                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary'
                                            }
                                        `}
                                    >
                                        {renderingShots[idx] ? (
                                            <>
                                                <ArrowPathIcon className="animate-spin h-4 w-4" />
                                                Generating...
                                            </>
                                        ) : renders[idx] ? (
                                            <>
                                                <SparklesIcon className="h-4 w-4" />
                                                Generated
                                            </>
                                        ) : (
                                            <>
                                                <CameraIcon className="h-4 w-4" />
                                                Generate Visual
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Image Preview Area */}
                                <div className={`relative w-full md:w-1/2 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden
                                    ${aspectRatio === '9:16' ? 'aspect-[9/16] md:w-1/3' : aspectRatio === '1:1' ? 'aspect-square md:w-1/3' : 'aspect-video'}
                                    transition-all duration-300
                                `}>
                                    {renders[idx] ? (
                                        <div className="group relative w-full h-full">
                                            <img
                                                src={renders[idx]}
                                                alt={`Shot ${idx + 1}`}
                                                className="w-full h-full object-cover animate-fade-in"
                                            />
                                            {/* Overlay for Download */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDownload(renders[idx], idx, 'png')}
                                                    className="bg-white/90 hover:bg-white text-gray-900 px-3 py-1.5 rounded shadow-lg transform transition-transform hover:scale-105 text-xs font-bold"
                                                >
                                                    PNG
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(renders[idx], idx, 'jpg')}
                                                    className="bg-white/90 hover:bg-white text-gray-900 px-3 py-1.5 rounded shadow-lg transform transition-transform hover:scale-105 text-xs font-bold"
                                                >
                                                    JPG
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400 p-4">
                                            {renderingShots[idx] ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <ArrowPathIcon className="animate-spin h-8 w-8 text-primary" />
                                                    <span className="text-xs">Creating ultra-realistic {aspectRatio} render...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 opacity-50">
                                                    <FilmIcon className="h-12 w-12" />
                                                    <span className="text-sm">No visual yet</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
