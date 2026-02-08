import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { ChevronRightIcon, ChevronLeftIcon, ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, SparklesIcon, PresentationChartLineIcon, ChatBubbleBottomCenterTextIcon, CodeBracketIcon, CameraIcon, EnvelopeIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

export default function WebPresentation() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { id: 'intro', title: 'Introduction' },
        { id: 'problem', title: 'The Problem' },
        { id: 'solution', title: 'The Solution' },

        // Module Deep Dives (Matching Sidebar Order)
        { id: 'dashboard', title: 'Module: Ops Dashboard' },
        { id: 'crm', title: 'Module: CRM & Leads' },
        { id: 'wp-form', title: 'Module: WP Form Gen' },
        { id: 'chatbot', title: 'Module: AI Chatbot' },
        { id: 'photoshoot', title: 'Module: Photoshoot Studio' },
        { id: 'smart-articles', title: 'Module: Smart Articles' },
        { id: 'email', title: 'Module: Email Marketing' },
        { id: 'brand-ambassador', title: 'Module: Brand Ambassador' },
        { id: 'social-media', title: 'Module: Social Media' },

        { id: 'comparison', title: 'Competitive Advantage' },
        { id: 'metrics', title: 'Why We Win' },
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="h-screen w-full bg-slate-900 text-white overflow-hidden flex flex-col items-center justify-center relative font-sans">
            {/* Navigation Controls */}
            <div className="absolute bottom-8 z-50 flex gap-4 items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <button onClick={prevSlide} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <div className="text-sm font-medium tracking-widest text-white/80">
                    SLIDE {currentSlide + 1} / {slides.length}
                </div>
                <button onClick={nextSlide} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full max-w-6xl px-12 h-[80vh] flex flex-col justify-center"
                >
                    {currentSlide === 0 && <TitleSlide />}
                    {currentSlide === 1 && <ProblemSlide />}
                    {currentSlide === 2 && <SolutionSlide />}

                    {/* Module Slides - Sidebar Order */}

                    {/* 1. Ops Dashboard */}
                    {currentSlide === 3 && <ModuleDetailSlide
                        title="Ops Dashboard"
                        subtitle="Business Intelligence Center"
                        status="Live"
                        desc="The command center for your entire operation. Gain real-time visibility into active leads, upcoming wedding dates, and revenue growth. Features AI-driven 'Conversion Advice' that analyzes your pipeline and suggests immediate actions to close more deals."
                        icon={ChartBarIcon}
                        color="indigo"
                    />}

                    {/* 2. CRM & Leads */}
                    {currentSlide === 4 && <ModuleDetailSlide
                        title="CRM & Leads"
                        subtitle="Pipeline & Client Management"
                        status="Live"
                        desc="A streamlined, Kanban-style interface for managing the entire client lifecycle. Track leads from 'New' to 'Won', view detailed client history, and execute one-click email actions directly from the dashboard. Eliminates the need for external tools like HubSpot or Salesforce."
                        icon={UserGroupIcon}
                        color="blue"
                    />}

                    {/* 3. WP Form Gen */}
                    {currentSlide === 5 && <ModuleDetailSlide
                        title="WP Form Gen"
                        subtitle="Custom Integration Factory"
                        status="Live"
                        desc="Bridging the gap between WordPress and your backend. Automatically generates the exact HTML, CSS, and Google Apps Script needed to power custom lead capture forms. Ensures every submission instantly syncs with your CRM and database without manual data entry."
                        icon={CodeBracketIcon}
                        color="orange"
                    />}

                    {/* 4. AI Chatbot */}
                    {currentSlide === 6 && <ModuleDetailSlide
                        title="AI Chatbot"
                        subtitle="24/7 Intelligent Support"
                        status="Live"
                        desc="Your always-on customer service agent. Capable of answering complex FAQs about venues, pricing, and availability. It captures lead details, qualifies prospects based on your criteria, and books consultations while you sleep."
                        icon={ChatBubbleBottomCenterTextIcon}
                        color="teal"
                    />}

                    {/* 5. Photoshoot Studio */}
                    {currentSlide === 7 && <ModuleDetailSlide
                        title="Photoshoot Studio"
                        subtitle="Visual Concept Storyboarding"
                        status="Beta"
                        desc="A powerful visualizer for wedding concepts. Generates hyper-realistic location previews, shot lists, and mood boards. Helps clients 'see' their big day before signing a contract, significantly increasing conversion rates for high-ticket weddings."
                        icon={CameraIcon}
                        color="pink"
                    />}

                    {/* 6. Smart Articles */}
                    {currentSlide === 8 && <ModuleDetailSlide
                        title="Smart Articles"
                        subtitle="GEO & SEO Content Engine"
                        status="Live"
                        desc="Dominate search results with Generative Engine Optimization (GEO). This module autonomously researches high-intent keywords, drafts authoritative blog content, and optimizes it to answer complex user queries, driving organic traffic without an agency."
                        icon={SparklesIcon}
                        color="emerald"
                    />}

                    {/* 7. Email Marketing */}
                    {currentSlide === 9 && <ModuleDetailSlide
                        title="Email Marketing"
                        subtitle="Automated Nurturing Sequences"
                        status="Live"
                        desc="Keep your leads warm with zero effort. Features a drag-and-drop builder to create beautiful, branded email templates. Orchestrate automated nurturing sequences that deliver the right message at the right time, moving prospects through the funnel."
                        icon={EnvelopeIcon}
                        color="cyan"
                    />}

                    {/* 8. Brand Ambassador */}
                    {currentSlide === 10 && <ModuleDetailSlide
                        title="Brand Ambassador"
                        subtitle="AI Personnel & Identity"
                        status="Live"
                        desc="Ensure consistency across every channel. Upload reference photos and brand guidelines to generate an infinite supply of on-brand marketing assets. Creates a unified voice and visual identity that scales with your business."
                        icon={UserGroupIcon}
                        color="purple"
                    />}

                    {/* 9. Social Media Marketing */}
                    {currentSlide === 11 && <ModuleDetailSlide
                        title="Social Media"
                        subtitle="Viral Content Generator"
                        status="Live"
                        desc="Your complete social media production team. Generates persuasive, viral-ready captions and hashtags tailored for Instagram and TikTok. Pairs copy with custom-generated visual assets to keep your feed active and engaging."
                        icon={PaintBrushIcon}
                        color="rose"
                    />}

                    {currentSlide === 12 && <ComparisonSlide />}
                    {currentSlide === 13 && <MetricsSlide />}
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-8 left-8 z-50 opacity-90">
                <div className="h-10 w-auto bg-black/50 rounded-lg p-1.5 border border-white/10 backdrop-blur-sm">
                    <img src="/assets/nexasphere_logo.png" alt="NexaSphere" className="h-full w-auto object-contain rounded" />
                </div>
            </div>

            {/* Branding Footer - Text (Right) */}
            <div className="absolute bottom-8 right-8 z-50 opacity-90">
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Prepared by</p>
                    <p className="text-sm text-white font-bold">Joseph Delgado</p>
                    <p className="text-xs text-indigo-400">CEO NexaSphere</p>
                </div>
            </div>

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
    );
}

function TitleSlide() {
    return (
        <div className="text-center space-y-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-6"
            >
                <PresentationChartLineIcon className="w-20 h-20 text-white" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-sm">
                Vallarta Vows
                <br />
                Marketing Suite
            </h1>
            <p className="text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                The Future of Wedding Planning Operations. <br />
                <span className="text-indigo-400 font-semibold">Autonomous. Intelligent. Scalable.</span>
            </p>
            <div className="pt-12">
                <span className="px-6 py-2 rounded-full border border-white/20 text-sm font-mono text-white/60 tracking-widest uppercase">
                    Confidential • 2026 Strategy
                </span>
            </div>
        </div>
    );
}

function ProblemSlide() {
    const problems = [
        { icon: CurrencyDollarIcon, title: "High CAC", desc: "Traditional ads and agencies are expensive.", color: "text-red-400" },
        { icon: ChartBarIcon, title: "Slow Content", desc: "Copywriting and photoshoots take weeks.", color: "text-orange-400" },
        { icon: UserGroupIcon, title: "Inconsistency", desc: "Brand voice and visuals vary across channels.", color: "text-yellow-400" },
    ];

    return (
        <div className="space-y-12">
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-red-500">
                The Agency Trap
            </h2>
            <p className="text-2xl text-slate-300 max-w-3xl">
                The traditional wedding marketing model is broken. It relies on expensive humans, slow processes, and yields inconsistent results.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {problems.map((p, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <p.icon className={`w-12 h-12 mb-6 ${p.color}`} />
                        <h3 className="text-2xl font-bold text-white mb-2">{p.title}</h3>
                        <p className="text-slate-400">{p.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function SolutionSlide() {
    const modules = [
        { title: "Ops Dashboard", desc: "Start Here", badge: "Live" },
        { title: "CRM & Leads", desc: "Pipeline", badge: "Live" },
        { title: "WP Form Gen", desc: "Integration", badge: "Live" },
        { title: "AI Chatbot", desc: "Support", badge: "Live" },
        { title: "Photoshoot", desc: "Visuals", badge: "Beta" },
        { title: "Smart Articles", desc: "SEO", badge: "Live" },
        { title: "Email Marketing", desc: "Nurture", badge: "Live" },
        { title: "Brand Amb.", desc: "Identity", badge: "Live" },
        { title: "Social Media", desc: "Content", badge: "Live" },
    ];

    return (
        <div className="flex gap-8 items-center h-full">
            <div className="flex-1 space-y-6">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-emerald-500">
                    The Solution: <br /> An Ecosystem
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                    We built a proprietary Compound AI System that automates the entire funnel—from content creation to lead closing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {modules.map((m, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="flex flex-col p-3 rounded-xl bg-white/5 border-l-4 border-emerald-500 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm text-white">{m.title}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wide">
                                    {m.badge}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">{m.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="flex-1 h-[500px] flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                {/* Abstract Ecosystem Graphic */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 rounded-full border-2 border-dashed border-indigo-500/30 absolute"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="w-96 h-96 rounded-full border border-indigo-500/10 absolute"
                />
                <div className="z-10 text-center">
                    <SparklesIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <div className="font-bold text-2xl">Compound AI Core</div>
                    <div className="text-slate-400 text-sm">Gemini Powered</div>
                </div>
            </div>
        </div>
    );
}

// New helper component for detail slides
function ModuleDetailSlide({ title, subtitle, status, desc, icon: Icon, color = 'emerald' }: any) {
    const colorClasses: any = {
        emerald: 'from-emerald-400 to-teal-600 shadow-emerald-500/30',
        purple: 'from-purple-400 to-indigo-600 shadow-purple-500/30',
        pink: 'from-pink-400 to-rose-600 shadow-pink-500/30',
        blue: 'from-blue-400 to-sky-600 shadow-blue-500/30',
        cyan: 'from-cyan-400 to-blue-600 shadow-cyan-500/30',
        orange: 'from-orange-400 to-red-600 shadow-orange-500/30',
        indigo: 'from-indigo-400 to-violet-600 shadow-indigo-500/30',
        teal: 'from-teal-400 to-emerald-600 shadow-teal-500/30',
        rose: 'from-rose-400 to-pink-600 shadow-rose-500/30',
    };

    const gradient = colorClasses[color] || colorClasses.emerald;

    return (
        <div className="flex items-center justify-between gap-16">
            <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-5xl font-bold text-white">{title}</h2>
                    <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-white/10 border border-white/20`}>
                        {status}
                    </span>
                </div>
                <h3 className={`text-2xl font-light text-${color}-300 opacity-90`}>
                    {subtitle}
                </h3>
                <p className="text-xl text-slate-300 leading-loose max-w-xl">
                    {desc}
                </p>
                <div className="pt-8">
                    <div className="h-1 w-32 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5 }}
                            className={`h-full bg-gradient-to-r ${gradient}`}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className={`w-96 h-96 rounded-[3rem] bg-gradient-to-br ${gradient} flex items-center justify-center relative shadow-2xl`}
                >
                    <div className="absolute inset-0 bg-black/10 rounded-[3rem] backdrop-blur-[2px]"></div>
                    <Icon className="w-40 h-40 text-white drop-shadow-xl relative z-10" />

                    {/* Decorative Elements */}
                    <div className="absolute top-8 right-8 w-4 h-4 rounded-full bg-white/50"></div>
                    <div className="absolute bottom-12 left-12 w-20 h-1 rounded-full bg-white/30"></div>
                </motion.div>
            </div>
        </div>
    );
}

function ComparisonSlide() {
    const data = [
        { subject: 'Cost', A: 100, B: 10, fullMark: 150 }, // A = Traditional, B = VV
        { subject: 'Speed', A: 20, B: 100, fullMark: 150 },
        { subject: 'Volume', A: 30, B: 100, fullMark: 150 },
        { subject: 'SEO', A: 40, B: 90, fullMark: 150 },
        { subject: 'Trust', A: 80, B: 95, fullMark: 150 },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-500">
                    Competitive Advantage
                </h2>
                <p className="text-xl text-slate-400 mt-4">Comparing us against traditional wedding planners and agencies.</p>
            </div>

            <div className="grid grid-cols-2 gap-12 h-[400px]">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h3 className="text-center font-bold text-xl mb-4 text-blue-300">Performance Radar</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#ffffff20" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Traditional" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                            <Radar name="Vallarta Vows" dataKey="B" stroke="#22c55e" strokeWidth={3} fill="#22c55e" fillOpacity={0.5} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-center">
                    <h3 className="text-center font-bold text-xl mb-8 text-blue-300">Cost vs. Content Volume</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Traditional Agency ($5k/mo)</span>
                                <span className="text-slate-400">4 posts</span>
                            </div>
                            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '10%' }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-red-500"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-bold text-white">Vallarta Vows Suite ($100/mo)</span>
                                <span className="text-emerald-400 font-bold">50+ posts</span>
                            </div>
                            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '95%' }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricsSlide() {
    const stats = [
        { label: "Content Speed", value: "100x", sub: "Faster than human" },
        { label: "Cost Reduction", value: "95%", sub: "Lower OPEX" },
        { label: "Lead Response", value: "<1m", sub: "Instant 24/7" },
    ];

    return (
        <div className="text-center space-y-16">
            <h2 className="text-6xl font-bold text-white">
                Why We Win
            </h2>
            <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: idx * 0.2 }}
                        className="p-10 rounded-3xl bg-gradient-to-b from-indigo-500/20 to-indigo-900/20 border border-indigo-500/30 backdrop-blur-xl"
                    >
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-300 mb-4">
                            {stat.value}
                        </div>
                        <div className="text-xl font-bold text-white uppercase tracking-wider mb-2">{stat.label}</div>
                        <div className="text-indigo-300 font-mono text-sm">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>
            <div className="pt-12">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-indigo-900 px-10 py-4 rounded-full font-bold text-xl shadow-xl shadow-white/10 hover:shadow-white/20 transition-all"
                >
                    View The Codebase
                </motion.button>
            </div>
        </div>
    );
}
