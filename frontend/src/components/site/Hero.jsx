import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Utensils } from 'lucide-react';
import { RevealLines } from './RevealText';
import { useI18n } from '@/context/I18nContext';

const WA_NUM = '919942933912';
const waMsg = encodeURIComponent(
    'Vanakkam! I would like to order from Palaniyappa Mess. Please share today’s specials.'
);

export default function Hero() {
    const { t, lang } = useI18n();
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const yImg = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
    const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
    const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15]);

    const scrollTo = (hash) => {
        const el = document.querySelector(hash);
        if (!el) return;
        if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
        else el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            id="top"
            ref={ref}
            data-testid="hero-section"
            className="relative min-h-[100svh] w-full overflow-hidden grain bg-background"
        >
            {/* Parallax background image */}
            <motion.div
                style={{ y: yImg, scale }}
                className="absolute inset-0 -z-10"
            >
                <img
                    src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=2000&q=90"
                    alt="Chef flame cooking"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-background/40 dark:bg-background/70" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />
            </motion.div>

            {/* Top badges */}
            <div className="pt-28 md:pt-32 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 overline text-foreground/80">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        {t('hero.badgeLeft')}
                    </div>
                    <div className="hidden md:flex items-center gap-2 overline text-foreground/80">
                        <Utensils size={12} />
                        {t('hero.badgeRight')}
                    </div>
                </motion.div>
            </div>

            {/* Kinetic headline */}
            <motion.div
                style={{ y: yText, opacity }}
                className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24"
            >
                <h1 className="font-display text-[16vw] md:text-[13vw] lg:text-[11vw] leading-[0.9] tracking-[-0.03em] font-medium text-foreground">
                    <RevealLines
                        key={lang}
                        lines={[t('hero.line1'), t('hero.line2')]}
                        italicIdx={1}
                        delay={0.15}
                    />
                </h1>

                <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                    <div className="md:col-span-7">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.9 }}
                            className="font-display italic text-2xl md:text-3xl lg:text-4xl leading-tight text-foreground/90 max-w-2xl"
                        >
                            {t('hero.tagline1')} {t('hero.tagline2Prefix')}<br />
                            <span className="text-accent">{t('hero.tagline2Highlight')}</span>{t('hero.tagline2Suffix')} <br />
                            {t('hero.tagline3')}
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.7, duration: 0.9 }}
                        className="md:col-span-5 flex flex-col md:items-end gap-4"
                    >
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => scrollTo('#menu')}
                                className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 h-12 text-sm tracking-wide font-medium transition-transform hover:scale-[1.02]"
                                data-testid="hero-view-menu"
                            >
                                {t('hero.ctaMenu')}
                                <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
                            </button>
                            <a
                                href={`https://wa.me/${WA_NUM}?text=${waMsg}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-foreground/60 hover:border-accent px-6 h-12 text-sm tracking-wide font-medium transition-colors"
                                data-testid="hero-order-now"
                            >
                                {t('hero.ctaOrder')}
                            </a>
                        </div>
                        <button
                            onClick={() => scrollTo('#contact')}
                            className="overline text-foreground/70 hover:text-accent"
                            data-testid="hero-contact-link"
                        >
                            {t('hero.ctaContact')}
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bottom tickers */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-6 left-0 right-0 px-6 md:px-12 max-w-7xl mx-auto flex justify-between items-end text-xs md:text-sm"
            >
                <div className="max-w-xs overline text-foreground/70 hidden md:block">
                    {t('hero.scrollHint')}
                </div>
                <div className="font-display italic text-foreground/80">
                    01 <span className="text-accent">/</span> 06
                </div>
            </motion.div>
        </section>
    );
}
