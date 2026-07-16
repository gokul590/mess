import { useMemo, useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { DISHES, CATEGORIES } from '@/data/menu';
import { FadeInUp } from './RevealText';
import { motion, AnimatePresence } from 'framer-motion';

const WA_NUM = '919942933912';

function orderLink(dish) {
    const msg = encodeURIComponent(
        `Vanakkam! I'd like to order: ${dish.name} (₹${dish.price}) from Palaniyappa Mess.`
    );
    return `https://wa.me/${WA_NUM}?text=${msg}`;
}

export default function Signature() {
    const [cat, setCat] = useState('All');
    const [q, setQ] = useState('');

    const filtered = useMemo(() => {
        return DISHES.filter((d) =>
            (cat === 'All' || d.category === cat) &&
            (q.trim() === '' || d.name.toLowerCase().includes(q.toLowerCase()) || d.category.toLowerCase().includes(q.toLowerCase()))
        );
    }, [cat, q]);

    return (
        <section
            id="menu"
            data-testid="menu-section"
            className="relative py-24 md:py-40 border-t border-border grain"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mb-16">
                    <FadeInUp className="md:col-span-7">
                        <span className="overline text-accent mb-4 block">02 — Signature Dishes</span>
                        <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                            The <span className="italic text-primary">menu</span>, treated <br /> like a story.
                        </h2>
                    </FadeInUp>
                    <FadeInUp className="md:col-span-5">
                        <div className="flex items-center gap-3 border-b border-border pb-3">
                            <Search size={18} className="text-muted-foreground" />
                            <input
                                data-testid="menu-search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search biryani, chukka, meals…"
                                className="w-full bg-transparent outline-none text-base placeholder:text-muted-foreground"
                            />
                        </div>
                    </FadeInUp>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2 mb-12" data-testid="menu-filters">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCat(c)}
                            data-testid={`filter-${c.toLowerCase()}`}
                            className={`rounded-full px-4 md:px-5 h-9 text-xs md:text-sm tracking-wide border transition-colors ${
                                cat === c
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'bg-transparent text-foreground/70 border-border hover:border-foreground hover:text-foreground'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((d, i) => (
                            <motion.article
                                key={d.id}
                                layout
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.6, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                data-testid={`dish-${d.id}`}
                                className="group flex flex-col"
                            >
                                <div className="dish-frame relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                                    <img
                                        src={d.image}
                                        alt={d.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
                                        <span className="overline text-foreground">{d.category}</span>
                                    </div>
                                    <div className="absolute bottom-3 right-3 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full">
                                        <span className="text-sm tracking-tight font-medium">₹{d.price}</span>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-col gap-2">
                                    <div className="flex items-baseline justify-between gap-4">
                                        <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-tight">
                                            {d.name}
                                        </h3>
                                        <span className="font-display italic text-sm text-muted-foreground shrink-0">
                                            {d.tamil}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {d.desc}
                                    </p>
                                    <a
                                        href={orderLink(d)}
                                        target="_blank"
                                        rel="noreferrer"
                                        data-testid={`order-${d.id}`}
                                        className="mt-2 group/btn inline-flex items-center gap-1.5 self-start overline text-foreground hover:text-accent transition-colors"
                                    >
                                        Order on WhatsApp
                                        <ArrowUpRight size={14} className="transition-transform group-hover/btn:rotate-45" />
                                    </a>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground font-display italic text-2xl">
                        Nothing found — try a different word.
                    </div>
                )}
            </div>
        </section>
    );
}
