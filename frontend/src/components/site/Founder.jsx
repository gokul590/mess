import { FadeInUp } from './RevealText';
import { motion } from 'framer-motion';

const FOUNDER_IMG =
    'https://customer-assets-jai6qajn.emergentagent.net/job_tamil-feast/artifacts/jvlyj1ss_5774051b-7828-44a0-bfc7-6acc0f757884.JPG';

export default function Founder() {
    return (
        <section
            id="founder"
            data-testid="founder-section"
            className="relative py-24 md:py-40 border-t border-border overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                    {/* Portrait */}
                    <FadeInUp className="lg:col-span-5">
                        <div className="relative">
                            {/* Editorial year mark */}
                            <div className="absolute -top-6 -left-2 md:-left-6 font-display italic text-7xl md:text-9xl text-accent/25 leading-none pointer-events-none select-none">
                                1980
                            </div>

                            <motion.div
                                initial={{ scale: 0.96, opacity: 0.8 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0 dish-frame overflow-hidden rounded-sm bg-muted"
                                data-testid="founder-portrait"
                            >
                                <img
                                    src={FOUNDER_IMG}
                                    alt="Thiru. Shanmuga Palaniyappan, Founder of Palaniyappa Mess"
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                {/* Warm vignette to blend with palette */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09]/50 via-transparent to-transparent" />
                                <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.25)' }} />
                                {/* Signature badge */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                    <div className="bg-background/80 backdrop-blur px-3 py-2 rounded-sm">
                                        <div className="overline text-accent">Founder</div>
                                        <div className="font-display italic text-sm md:text-base leading-tight">
                                            Thiru. Shanmuga Palaniyappan
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </FadeInUp>

                    {/* Copy */}
                    <div className="lg:col-span-7">
                        <FadeInUp>
                            <span className="overline text-accent mb-4 block">04A — Behind the Fire</span>
                        </FadeInUp>
                        <FadeInUp delay={0.05}>
                            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
                                A visionary. <br />
                                A father. <br />
                                <span className="italic text-primary">A founder.</span>
                            </h2>
                        </FadeInUp>
                        <FadeInUp delay={0.1}>
                            <p className="mt-8 md:mt-10 text-base md:text-lg leading-relaxed text-muted-foreground font-light max-w-xl">
                                <span className="font-display italic text-foreground">Thiru. Shanmuga Palaniyappan</span> is
                                the visionary founder of Palaniyappa Mess — a name synonymous with authentic Chettinad
                                and traditional Tamil non-vegetarian cuisine in Pudukkottai.
                            </p>
                        </FadeInUp>
                        <FadeInUp delay={0.15}>
                            <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground font-light max-w-xl">
                                With a passion for quality, taste, and hospitality, he established the mess with a
                                simple mission: to serve fresh, hygienic, home-style food, prepared with traditional
                                recipes and locally-sourced ingredients.
                            </p>
                        </FadeInUp>
                        <FadeInUp delay={0.2}>
                            <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground font-light max-w-xl">
                                His dedication, hard work, and quiet commitment to every guest at every table have made
                                Palaniyappa Mess a trusted, beloved destination for food-lovers across generations.
                            </p>
                        </FadeInUp>

                        {/* Signature quote */}
                        <FadeInUp delay={0.25}>
                            <figure className="mt-12 pt-8 border-t border-border max-w-xl">
                                <blockquote className="font-display italic text-2xl md:text-3xl leading-tight text-foreground">
                                    “Cook the food you would serve your own family. The rest — the trust, the guests,
                                    the years — they follow.”
                                </blockquote>
                                <figcaption className="mt-4 flex items-center gap-3">
                                    <span className="h-px w-8 bg-accent" />
                                    <span className="overline text-muted-foreground">
                                        Thiru. Shanmuga Palaniyappan · Est. 1980
                                    </span>
                                </figcaption>
                            </figure>
                        </FadeInUp>
                    </div>
                </div>
            </div>
        </section>
    );
}
