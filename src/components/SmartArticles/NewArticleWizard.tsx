import { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, FireIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { generateAdvancedArticle, GeneratedArticleResult } from '../../services/geminiArticleService';
import { articleRepository } from '../../services/articleRepository';
import { supabase } from '../../services/supabaseClient';

interface NewArticleWizardProps {
    onBack: () => void;
    onComplete: () => void;
}

export default function NewArticleWizard({ onBack, onComplete }: NewArticleWizardProps) {
    const [step, setStep] = useState<'config' | 'generating' | 'review'>('config');

    // Config State
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(1);
    const [wordCount, setWordCount] = useState(3000);
    const [tone, setTone] = useState('Luxurious & Professional');
    const [audience, setAudience] = useState('Engaged Couples in USA/Canada');

    // Suggestions State
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Generation State
    const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticleResult[]>([]);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const handleSuggestTopics = async () => {
        setLoadingSuggestions(true);
        try {
            // Dynamically import to avoid circular dependency issues if any, though here it is fine.
            const { generateTrendingTopics } = await import('../../services/geminiArticleService');
            const topics = await generateTrendingTopics();
            setSuggestedTopics(topics);
        } catch (e) {
            console.error(e);
            alert("Failed to get suggestions.");
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic) return alert("Please enter a topic");

        setStep('generating');
        setGeneratedArticles([]);
        setLogs([]);
        setProgress(0);

        const results: GeneratedArticleResult[] = [];

        try {
            for (let i = 0; i < count; i++) {
                setLogs(prev => [...prev, `Generating article ${i + 1} of ${count}: "${topic}" variation...`]);

                // Slight variation in prompt for bulk to avoid duplicates if same topic
                const variationTopic = count > 1 ? `${topic} - Variation ${i + 1}` : topic;

                const result = await generateAdvancedArticle({
                    topic: variationTopic,
                    wordCountTarget: wordCount,
                    tone,
                    audience
                });

                results.push(result);
                setGeneratedArticles(prev => [...prev, result]);
                setProgress(((i + 1) / count) * 100);
                setLogs(prev => [...prev, `Completed article ${i + 1}.`]);
            }

            setStep('review');
        } catch (error) {
            console.error(error);
            alert("Generation failed. See console.");
            setStep('config');
        }
    };

    const handleSaveAll = async () => {
        if (!confirm(`Save ${generatedArticles.length} articles to database?`)) return;

        // Fetch categories to map string -> ID
        const categories = await articleRepository.fetchCategories();

        let userId: string | undefined;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;

        // Fallback if no user session
        if (!userId) {
            console.warn("No active session found. Attempting fallback...");
            const { data: authors } = await supabase.from('vv_authors').select('id').limit(1);
            if (authors && authors.length > 0) {
                userId = authors[0].id;
                console.log("Fallback author used:", userId);
            } else {
                // Last resort: Hardcoded ID for 'Vallarta Vows Editorial Team'
                // This ensures save works even if fetching authors fails
                userId = 'adb0e342-a810-4223-8a05-2697c79bc4fd';
                console.log("Hardcoded fallback author used:", userId);
            }
        }

        if (!userId) return alert("System Error: Could not determine Author Identity.");

        let savedCount = 0;
        const errors: string[] = [];

        for (const art of generatedArticles) {
            try {
                // Find category ID or default to first
                const cat = categories.find(c => c.name.toLowerCase().includes(art.suggestedCategory.toLowerCase())) || categories[0];

                // Ensure unique slug by appending random suffix
                const baseSlug = art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                const { error } = await supabase.from('vv_articles').insert({
                    title: art.title,
                    slug: uniqueSlug,
                    status: 'draft',
                    wp_status: 'not_published',
                    author_id: userId,
                    primary_category_id: cat?.id,
                    word_count: art.contentHtml.split(/\s+/).length,
                    content_html: art.contentHtml + `\n\n<div class="cta-box">${art.cta}</div>`,
                    seo_title: art.title,
                    meta_description: art.metaDescription,
                    featured_image_prompt: art.imagePrompt,
                    hashtags: art.hashtags,
                    excerpt: art.metaDescription
                });

                if (error) {
                    console.error('Insert Error:', error);
                    errors.push(`Failed to save "${art.title}": ${error.message}`);
                } else {
                    savedCount++;
                }
            } catch (err: any) {
                console.error('Save Loop Error:', err);
                errors.push(`Exception saving "${art.title}": ${err.message}`);
            }
        }

        if (errors.length > 0) {
            alert(`Saved ${savedCount} articles.\nErrors:\n${errors.join('\n')}`);
        } else {
            alert(`Successfully saved ${savedCount} articles!`);
        }

        onComplete();
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">New Smart Article Campaign</h1>
                        <p className="text-gray-500">Generate high-ranking GEO content in bulk.</p>
                    </div>
                </div>

                {/* Config Step */}
                {step === 'config' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Core Topic / Keyword</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={e => setTopic(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-lg p-3"
                                            placeholder="e.g. Destination Weddings in Puerto Vallarta"
                                        />
                                        <button
                                            onClick={handleSuggestTopics}
                                            disabled={loadingSuggestions}
                                            className="whitespace-nowrap px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 flex items-center gap-2"
                                        >
                                            <SparklesIcon className={`h-5 w-5 ${loadingSuggestions ? 'animate-spin' : ''}`} />
                                            {loadingSuggestions ? 'Analyzing...' : 'Suggest Trending'}
                                        </button>
                                    </div>

                                    {/* Suggested Topics Chips */}
                                    {suggestedTopics.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 animate-fadeIn">
                                            {suggestedTopics.map((t, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setTopic(t)}
                                                    className="text-xs bg-gray-100 hover:bg-primary hover:text-white text-gray-700 py-1 px-3 rounded-full transition-colors border border-gray-200"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Article Count (1-5)</label>
                                        <select
                                            value={count}
                                            onChange={e => setCount(Number(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                        >
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Target Word Count</label>
                                        <select
                                            value={wordCount}
                                            onChange={e => setWordCount(Number(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                        >
                                            <option value={2000}>2,000 Words</option>
                                            <option value={3000}>3,000 Words (Recommended)</option>
                                            <option value={4000}>4,000 Words (Deep Dive)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tone</label>
                                    <input
                                        type="text"
                                        value={tone}
                                        onChange={e => setTone(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                    <input
                                        type="text"
                                        value={audience}
                                        onChange={e => setAudience(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <h3 className="flex items-center gap-2 font-bold text-purple-900 mb-4">
                                    <SparklesIcon className="h-5 w-5" />
                                    AI Power Settings
                                </h3>
                                <ul className="space-y-3 text-sm text-purple-800">
                                    <li className="flex gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                                        <span>Generative Engine Optimization (GEO) applied automatically.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                                        <span>Auto-generates Metadata & Schema structures.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                                        <span>Includes 10 viral hashtags & Image Prompts.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                                        <span>Conversion-focused CTA integration.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleGenerate}
                                className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2"
                            >
                                <SparklesIcon className="h-5 w-5" />
                                Start Generation
                            </button>
                        </div>
                    </div>
                )}

                {/* Generation Step */}
                {step === 'generating' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <FireIcon className="h-16 w-16 text-orange-500 mx-auto animate-pulse" />
                        <h2 className="text-2xl font-bold mt-4">Generating Content...</h2>
                        <p className="text-gray-500 mt-2">This may take 1-2 minutes per article for high-quality output.</p>

                        <div className="w-full bg-gray-200 rounded-full h-4 mt-8 overflow-hidden">
                            <div
                                className="bg-primary h-4 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mt-2">{Math.round(progress)}% Complete</p>

                        <div className="mt-8 text-left bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                            {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                        </div>
                    </div>
                )}

                {/* Review Step */}
                {step === 'review' && (
                    <div className="space-y-8">
                        {generatedArticles.map((article, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <span className="font-mono text-xs text-gray-500">Article {idx + 1}</span>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Ready to Save</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-700">Details</p>
                                            <ul className="mt-1 space-y-1 text-gray-600">
                                                <li><strong>Category:</strong> {article.suggestedCategory}</li>
                                                <li><strong>Focus KW:</strong> {article.focusKeyword}</li>
                                                <li><strong>Word Count:</strong> ~{article.contentHtml.split(' ').length}</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm bg-gray-50 p-3 rounded-lg">
                                            <p className="font-semibold text-gray-700 mb-1">Meta Description</p>
                                            <p className="text-gray-600 italic">"{article.metaDescription}"</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Image Prompt</p>
                                        <div className="bg-gray-900 text-gray-300 p-3 rounded text-xs font-mono">
                                            {article.imagePrompt}
                                        </div>
                                    </div>

                                    <details className="group">
                                        <summary className="flex cursor-pointer items-center gap-2 text-primary font-medium">
                                            <ArrowPathIcon className="h-4 w-4 group-open:rotate-180 transition-transform" />
                                            View Content Preview
                                        </summary>
                                        <div className="mt-4 prose prose-pink max-w-none bg-gray-50 p-6 rounded-lg border border-gray-100">
                                            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
                                            <div className="mt-4 p-4 bg-white border border-pink-200 rounded-lg shadow-sm">
                                                <p className="text-center font-bold text-gray-900">CTA PREVIEW:</p>
                                                <p className="text-center text-primary">{article.cta}</p>
                                            </div>
                                            <div className="mt-4">
                                                <p className="font-bold text-xs text-gray-500 uppercase tracking-wide">Hashtags</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {article.hashtags.map(t => <span key={t} className="text-blue-600 text-sm">{t}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end gap-4 sticky bottom-8">
                            <button
                                onClick={() => setStep('config')}
                                className="px-6 py-3 bg-white text-gray-700 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-50"
                            >
                                Discard & Restart
                            </button>
                            <button
                                onClick={handleSaveAll}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <CheckCircleIcon className="h-5 w-5" />
                                Save All to Database
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
