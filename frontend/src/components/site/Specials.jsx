import { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Flame, Users, Truck, Utensils, Clock, Heart, Leaf } from 'lucide-react';
import { FadeInUp } from './RevealText';
import { SPECIALS as STATIC_SPECIALS } from '@/data/menu';

const WA_NUM = '919942933912';
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WHY = [
    { icon: Leaf, title: 'Fresh Ingredients', body: 'Local sourcing, daily deliveries.' },
    { icon: Flame, title: 'Traditional Recipes', body: 'Chettinad heritage, unchanged.' },
    { icon: Utensils, title: 'Experienced Chefs', body: 'Decades of kitchen craft.' },
    { icon: Sparkles, title: 'Clean Kitchen', body: 'Hygiene certified, open pass.' },
    { icon: Clock, title: 'Fast Service', body: 'Order to table in 15 minutes.' },
    { icon: Heart, title: 'Affordable Price', body: 'Mess prices, restaurant taste.' },
    { icon: Users, title: 'Family Friendly', body: 'Private hall & warm seating.' },
    { icon: Truck, title: 'Takeaway Available', body: 'WhatsApp your order.' },
];

function waLink(title, price) {
    const msg = encodeURIComponent(`Vanakkam! I'd like to book the "${title}" (₹${price}) at Palaniyappa Mess.`);
    return `https://wa.me/${WA_NUM}?text=${msg}`;
}

export default function Specials() {
    const [specials, setSpecials] = useState(STATIC_SPECIALS);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data } = await axios.get(`${API}/specials`);
                if (alive && Array.isArray(data) && data.length > 0) setSpecials(data);
            } catch { /* keep static fallback */ }
        })();
        return () => { alive = false; };
    }, []);

    return (
        <>
            {/* Why choose us */}
            <section
                data-testid="why-section"
                className="relative py-24 md:py-40 border-t border-border bg-secondary/30"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <FadeInUp>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mb-16">
                            <div className="md:col-span-8">
                                <span className="overline text-accent mb-4 block">03 — Why Choose Us</span>
                                <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                    Eight quiet reasons <br />
                                    people <span className="italic text-primary">keep returning.</span>
                                </h2>
                            </div>
                        </div>
                    </FadeInUp>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-14">
                        {WHY.map((w, i) => (
                            <FadeInUp key={w.title} delay={i * 0.05}>
                                <div className="flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-accent">
                                        <w.icon size={20} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div className="overline text-accent mb-2">{String(i + 1).padStart(2, '0')}</div>
                                        <h4 className="font-display text-2xl leading-tight">{w.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{w.body}</p>
                                    </div>
                                </div>
                            </FadeInUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* Today's Specials */}
            <section
                id="specials"
                data-testid="specials-section"
                className="relative py-24 md:py-40 border-t border-border"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <FadeInUp>
                        <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
                            <div className="max-w-3xl">
                                <span className="overline text-accent mb-4 block">04 — Today’s Specials</span>
                                <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                    Weekend, <span className="italic text-primary">festival</span>, chef’s picks.
                                </h2>
                            </div>
                            <span className="overline text-muted-foreground">Live · Updated Daily</span>
                        </div>
                    </FadeInUp>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {specials.map((s, i) => (
                            <FadeInUp key={s.id || s.title} delay={i * 0.08}>
                                <article
                                    data-testid={`special-${i}`}
                                    className="group relative flex flex-col h-full"
                                >
                                    <div className="dish-frame relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                                        <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover" />
                                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-accent text-accent-foreground rounded-full px-3 py-1">
                                            <Sparkles size={12} />
                                            <span className="overline">{s.tag}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex-1 flex flex-col">
                                        <h3 className="font-display text-3xl md:text-4xl leading-tight">
                                            {s.title}
                                        </h3>
                                        <p className="mt-3 text-sm text-muted-foreground max-w-md flex-1">
                                            {s.desc}
                                        </p>
                                        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
                                            <span className="font-display text-3xl text-primary">₹{s.price}</span>
                                            <a
                                                href={waLink(s.title, s.price)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="overline hover:text-accent transition-colors"
                                                data-testid={`special-order-${i}`}
                                            >
                                                Reserve →
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </FadeInUp>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
