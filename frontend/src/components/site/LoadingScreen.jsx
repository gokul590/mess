import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium initial page-load: masked wordmark + progress bar
export default function LoadingScreen() {
    const [gone, setGone] = useState(false);

    useEffect(() => {
        // Only show on first mount, hide after ~1.9s
        const t = setTimeout(() => setGone(true), 1900);
        // Prevent scroll during intro
        document.documentElement.style.overflow = 'hidden';
        return () => {
            clearTimeout(t);
            document.documentElement.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (gone) document.documentElement.style.overflow = '';
    }, [gone]);

    return (
        <AnimatePresence>
            {!gone && (
                <motion.div
                    data-testid="loading-screen"
                    initial={{ y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 1.1, ease: [0.85, 0, 0.15, 1] }}
                    className="fixed inset-0 z-[100] bg-[#0C0A09] text-[#F7F5F0] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Subtle spice image behind */}
                    <div className="absolute inset-0 opacity-25">
                        <img
                            src="https://images.unsplash.com/photo-1602237514002-c2d8ae2da393?w=1600&q=80"
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#0C0A09]/70" />
                    </div>

                    <div className="relative flex flex-col items-center">
                        <motion.span
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.6 }}
                            className="overline text-[#D4AF37] mb-6"
                        >
                            Est · 1980 · Pudukkottai
                        </motion.span>

                        <div className="overflow-hidden">
                            <motion.h1
                                initial={{ y: '105%' }}
                                animate={{ y: '0%' }}
                                transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tight text-center"
                            >
                                Palaniyappa
                            </motion.h1>
                        </div>
                        <div className="overflow-hidden -mt-2">
                            <motion.h1
                                initial={{ y: '105%' }}
                                animate={{ y: '0%' }}
                                transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="font-display italic text-6xl md:text-8xl leading-[0.9] tracking-tight text-[#D4AF37] text-center"
                            >
                                Mess.
                            </motion.h1>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-10 relative w-56 h-px bg-white/15 overflow-hidden">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ delay: 0.4, duration: 1.3, ease: 'easeInOut' }}
                                className="absolute inset-0 bg-[#D4AF37]"
                            />
                        </div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="mt-4 overline text-white/50"
                        >
                            Kindling the fire…
                        </motion.span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
