import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
    {
        title: "Social Media Engine",
        desc: "Generate persuasive posts for Facebook, Instagram, TikTok, and YouTube with CTA + hashtags.",
        bg: "from-pink-500 to-rose-500",
        image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&q=80&w=2070"
    },
    {
        title: "Smart Articles",
        desc: "Create SEO + GEO blog articles for VallartaVows.com and export/publish to WordPress.",
        bg: "from-purple-500 to-indigo-500",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2070"
    },
    {
        title: "Brand Ambassador Toolkit",
        desc: "Create branded content featuring Robin with consistent aesthetics and messaging.",
        bg: "from-blue-500 to-cyan-500",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2038"
    },
    {
        title: "Lead Manager CRM",
        desc: "Track leads from New → Won with smart follow-ups, statuses, and notes.",
        bg: "from-emerald-500 to-teal-500",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070"
    },
    {
        title: "Analytics & Content Planner",
        desc: "Plan campaigns, measure performance, and keep your marketing organized.",
        bg: "from-orange-500 to-amber-500",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
    },
    {
        title: "AI Chatbot",
        desc: "Engage visitors 24/7 with an intelligent assistant that answers queries and captures leads.",
        bg: "from-fuchsia-500 to-purple-600",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=2000"
    }
];

export default function LoginSlider() {
    const [index, setIndex] = useState(0);

    // Auto-rotate
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden bg-gray-900 text-white flex flex-col justify-between p-12">

            {/* Background Images with Crossfade */}
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={`bg-${index}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={SLIDES[index].image}
                        alt=""
                        className="h-full w-full object-cover opacity-60"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Background Animated Gradient Overlay (Blended) */}
            <div className={`absolute inset-0 z-0 bg-gradient-to-br ${SLIDES[index].bg} opacity-80 mix-blend-multiply transition-all duration-1000`} />
            <div className={`absolute inset-0 z-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90`} />

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex items-center">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-lg"
                    >
                        <h2 className="text-4xl font-bold mb-4 font-serif tracking-tight drop-shadow-md">
                            {SLIDES[index].title}
                        </h2>
                        <p className="text-lg text-white/90 leading-relaxed font-light drop-shadow-sm">
                            {SLIDES[index].desc}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Dots */}
            <div className="relative z-10">
                <div className="flex gap-2 mb-6">
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
                <div className="text-xs text-white/60 font-mono">
                    <p>Marketing Suite by Nexa-Sphere</p>
                    <p>Copyright © 2026</p>
                </div>
            </div>

            {/* Slash Overlay Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Diagonal darker overlay for depth */}
                <div className="absolute -right-20 -bottom-40 w-[800px] h-[800px] bg-black/20 rotate-12 blur-3xl transform translate-x-1/2 translate-y-1/2 mix-blend-overlay" />
            </div>
        </div>
    );
}
