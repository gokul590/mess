import { Instagram, ArrowUpRight } from 'lucide-react';
import { FadeInUp } from './RevealText';
import { GALLERY } from '@/data/menu';

const HANDLE = '@palaniyappa.mess';
const IG_URL = 'https://instagram.com';

// Curated 8 tiles that visually feel like an IG grid
const TILES = GALLERY.slice(0, 8);

export default function InstagramFeed() {
    return (
        <section
            id="instagram"
            data-testid="instagram-section"
            className="relative py-24 md:py-40 border-t border-border"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <div className="flex items-end justify-between gap-8 flex-wrap mb-16">
                        <div className="max-w-3xl">
                            <span className="overline text-accent mb-4 block">10 — On the Grid</span>
                            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                Follow us on <span className="italic text-primary">Instagram.</span>
                            </h2>
                            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl font-light">
                                Behind-the-flame moments, festival plates, and the occasional biryani close-up.
                                Tag us <span className="text-accent">{HANDLE}</span> when you visit.
                            </p>
                        </div>
                        <a
                            href={IG_URL}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="instagram-follow-btn"
                            className="group inline-flex items-center gap-2 rounded-full border border-border hover:border-accent px-6 h-12 transition-colors"
                        >
                            <Instagram size={16} className="text-accent" />
                            <span className="overline">Follow · {HANDLE}</span>
                            <ArrowUpRight size={14} className="transition-transform group-hover:rotate-45" />
                        </a>
                    </div>
                </FadeInUp>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3" data-testid="instagram-grid">
                    {TILES.map((t, i) => (
                        <FadeInUp key={i} delay={(i % 4) * 0.05}>
                            <a
                                href={IG_URL}
                                target="_blank"
                                rel="noreferrer"
                                data-testid={`ig-tile-${i}`}
                                className="dish-frame group relative block aspect-square overflow-hidden rounded-sm bg-muted"
                            >
                                <img
                                    src={t.src}
                                    alt={t.alt}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[#0C0A09]/0 group-hover:bg-[#0C0A09]/70 transition-colors duration-500 flex items-center justify-center">
                                    <Instagram
                                        size={28}
                                        className="text-[#F7F5F0] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                </div>
                            </a>
                        </FadeInUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
