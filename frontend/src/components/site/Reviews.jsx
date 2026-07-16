import { Star } from 'lucide-react';
import { REVIEWS } from '@/data/menu';
import { FadeInUp } from './RevealText';

export default function Reviews() {
    return (
        <section
            data-testid="reviews-section"
            className="relative py-24 md:py-40 border-t border-border bg-secondary/30"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <div className="flex items-end justify-between gap-8 flex-wrap mb-16">
                        <div className="max-w-3xl">
                            <span className="overline text-accent mb-4 block">07 — Reviews</span>
                            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                In our guests’ <span className="italic text-primary">own words.</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1 text-accent">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                                ))}
                            </div>
                            <span className="overline">4.9 · 1,200+ Reviews</span>
                        </div>
                    </div>
                </FadeInUp>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
                    {REVIEWS.map((r, i) => (
                        <FadeInUp key={i} delay={i * 0.05}>
                            <figure
                                data-testid={`review-${i}`}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex gap-1 text-accent">
                                    {[...Array(5)].map((_, s) => (
                                        <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                                    ))}
                                </div>
                                <blockquote className="font-display italic text-3xl md:text-4xl leading-tight text-foreground">
                                    “{r.quote}”
                                </blockquote>
                                <figcaption className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display text-primary">
                                        {r.author[0]}
                                    </span>
                                    <div>
                                        <div className="font-medium">{r.author}</div>
                                        <div className="overline text-muted-foreground">{r.role}</div>
                                    </div>
                                </figcaption>
                            </figure>
                        </FadeInUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
