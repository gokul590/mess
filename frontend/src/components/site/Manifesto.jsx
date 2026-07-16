import { FadeInUp } from './RevealText';

const CHAPTERS = [
    {
        n: '01',
        title: 'The Heritage',
        body: 'Recipes carried down through Chettinad kitchens — hand-pounded masalas, seasoned iron pans, and the patience of slow fire. Every dish here is a memory served warm.',
        image: 'https://images.unsplash.com/photo-1602237514002-c2d8ae2da393?w=1200&q=85',
    },
    {
        n: '02',
        title: 'The Spices',
        body: 'Star anise, kalpasi, marati moggu, dried red chillies — we source whole spices from Karaikudi and roast them fresh, twice a day. Nothing pre-ground. Nothing shortcut.',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=85',
    },
    {
        n: '03',
        title: 'The Craft',
        body: 'Our biryani rests in a sealed clay handi over dying embers for exactly 47 minutes. Fish is scored the traditional Kongu way. Parottas are flipped by hand on cast iron.',
        image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&q=85',
    },
];

const HIGHLIGHTS = [
    'Authentic Taste',
    'Fresh Ingredients',
    'Family Restaurant',
    'Hygienic Kitchen',
    'Affordable Prices',
    'Fast Service',
];

export default function Manifesto() {
    return (
        <section
            id="manifesto"
            data-testid="manifesto-section"
            className="relative py-24 md:py-40 grain"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <div className="flex items-center gap-4 mb-10">
                        <span className="overline text-accent">Manifesto</span>
                        <span className="h-px w-16 bg-border" />
                    </div>
                </FadeInUp>

                <FadeInUp delay={0.05}>
                    <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight max-w-5xl">
                        Welcome to <span className="italic text-primary">Palaniyappa</span>.
                        A mess that <span className="italic">refuses</span> to be ordinary.
                    </h2>
                </FadeInUp>

                <FadeInUp delay={0.1}>
                    <p className="mt-8 md:mt-12 max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground font-light">
                        Serving authentic Tamil Nadu non-vegetarian cuisine with traditional recipes and rich flavors.
                        Freshly prepared biryani, Chettinad chicken, mutton dishes, seafood, and homemade meals — made
                        with premium ingredients, cooked the way our grandmothers cooked.
                    </p>
                </FadeInUp>

                <div className="mt-20 md:mt-32 space-y-24 md:space-y-40">
                    {CHAPTERS.map((c, i) => (
                        <FadeInUp key={c.n} delay={i * 0.05}>
                            <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center ${i % 2 ? 'md:[direction:rtl]' : ''}`}>
                                <div className="md:col-span-6 [direction:ltr]">
                                    <div className="dish-frame relative aspect-[4/5] rounded-sm overflow-hidden bg-muted">
                                        <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="md:col-span-6 [direction:ltr]">
                                    <div className="flex items-baseline gap-4 mb-6">
                                        <span className="font-display text-6xl md:text-7xl text-accent">{c.n}</span>
                                        <span className="h-px flex-1 bg-border" />
                                    </div>
                                    <h3 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
                                        {c.title}
                                    </h3>
                                    <p className="mt-6 text-base md:text-lg text-muted-foreground font-light max-w-lg leading-relaxed">
                                        {c.body}
                                    </p>
                                </div>
                            </div>
                        </FadeInUp>
                    ))}
                </div>

                {/* Highlights strip */}
                <FadeInUp>
                    <div className="mt-24 md:mt-32 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-6 border-t border-border pt-12">
                        {HIGHLIGHTS.map((h, i) => (
                            <div key={h} className="flex flex-col gap-2">
                                <span className="overline text-accent">{String(i + 1).padStart(2, '0')}</span>
                                <span className="font-display text-2xl leading-tight">{h}</span>
                            </div>
                        ))}
                    </div>
                </FadeInUp>
            </div>
        </section>
    );
}
