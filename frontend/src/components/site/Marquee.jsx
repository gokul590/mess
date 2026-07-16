export default function Marquee() {
    const items = [
        'Palaniyappa Mess',
        'Est · 1980',
        'Authentic Chettinad',
        'Since Generations',
        'Seeraga Samba Biryani',
        'Nattu Kozhi Curry',
        'Mutton Chukka',
        'Pudukkottai · Tamil Nadu',
        'Fire · Coconut · Pepper',
    ];
    const track = [...items, ...items];
    return (
        <section
            data-testid="marquee"
            className="relative border-y border-border py-8 md:py-12 overflow-hidden bg-secondary/40"
        >
            <div className="flex whitespace-nowrap animate-marquee will-change-transform">
                {track.map((t, i) => (
                    <span
                        key={i}
                        className="font-display italic text-4xl md:text-6xl lg:text-7xl text-foreground/90 tracking-tight"
                    >
                        {t}
                        <span className="ticker-dot" />
                    </span>
                ))}
            </div>
        </section>
    );
}
