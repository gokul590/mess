import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInUp } from './RevealText';

const VIDEO_ID = 'MgAp2MIWDKA';
const THUMB = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

export default function VideoStory() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <section
                data-testid="video-story"
                className="relative py-24 md:py-40 border-t border-border bg-secondary/30 overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <FadeInUp>
                        <div className="max-w-3xl">
                            <span className="overline text-accent mb-4 block">Watch · Chef’s Reel</span>
                            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                Ninety seconds <br />
                                inside our <span className="italic text-primary">kitchen.</span>
                            </h2>
                            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl font-light">
                                Fire, coconut, curry leaf, the clatter of the tawa. A brief glimpse of the craft that
                                goes into every plate we serve.
                            </p>
                        </div>
                    </FadeInUp>

                    <FadeInUp delay={0.1}>
                        <button
                            onClick={() => setOpen(true)}
                            data-testid="video-play-btn"
                            aria-label="Play chef's kitchen video"
                            className="dish-frame group mt-14 md:mt-20 block w-full aspect-video overflow-hidden rounded-sm bg-[#0C0A09] relative"
                        >
                            <img
                                src={THUMB}
                                alt="Palaniyappa Mess kitchen"
                                loading="lazy"
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09]/10 via-transparent to-[#0C0A09]/70" />

                            {/* Play button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#D4AF37] text-[#0C0A09] flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    <span className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-40 group-hover:animate-ping" />
                                    <Play size={32} fill="currentColor" strokeWidth={0} className="ml-1.5 relative" />
                                </span>
                            </div>

                            {/* Bottom caption strip */}
                            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between text-[#F7F5F0]">
                                <div>
                                    <div className="overline text-[#D4AF37] mb-1">01:32 · HD</div>
                                    <div className="font-display italic text-2xl md:text-3xl">
                                        The Palaniyappa Kitchen
                                    </div>
                                </div>
                                <div className="hidden md:block overline">
                                    Est · 1980 · Pudukkottai
                                </div>
                            </div>
                        </button>
                    </FadeInUp>
                </div>
            </section>

            <AnimatePresence>
                {open && (
                    <motion.div
                        data-testid="video-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[80] bg-[#0C0A09]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
                        onClick={() => setOpen(false)}
                    >
                        <button
                            aria-label="Close video"
                            data-testid="video-close-btn"
                            onClick={() => setOpen(false)}
                            className="absolute top-6 right-6 md:top-8 md:right-8 w-11 h-11 rounded-full border border-white/30 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-5xl aspect-video rounded-sm overflow-hidden shadow-2xl bg-black"
                        >
                            <iframe
                                data-testid="video-iframe"
                                title="Palaniyappa Mess — Kitchen reel"
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
