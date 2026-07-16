import { FadeInUp } from './RevealText';
import { ArrowUpRight } from 'lucide-react';

const WA = '919942933912';
const wa = (m) => `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;

const SERVICES = [
    {
        n: '01',
        title: 'Catering Services',
        body: 'Weddings, seemantham, corporate lunches — we bring the Chettinad kitchen to you. Minimum 40 pax.',
        cta: 'Enquire',
        msg: 'I would like to enquire about catering with Palaniyappa Mess.',
    },
    {
        n: '02',
        title: 'Family Hall Booking',
        body: 'Private, air-conditioned hall for 60 guests. Reserved server, banana-leaf plating available.',
        cta: 'Reserve Hall',
        msg: 'I would like to book the family hall at Palaniyappa Mess.',
    },
    {
        n: '03',
        title: 'Birthday & Functions',
        body: 'Custom biryani buckets, live parotta counter, festive lighting. We host up to 100 guests.',
        cta: 'Plan Party',
        msg: 'I would like to plan a birthday/function at Palaniyappa Mess.',
    },
];

export default function ChefServices() {
    return (
        <section
            data-testid="chef-services"
            className="relative py-24 md:py-40 bg-[#0C0A09] text-[#F7F5F0] overflow-hidden"
        >
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <img
                    src="https://images.unsplash.com/photo-1602237514002-c2d8ae2da393?w=2000&q=85"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0C0A09]/85" />
            </div>
            <div className="relative max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <div className="max-w-3xl">
                        <span className="overline text-[#D4AF37] mb-4 block">05 — Chef’s Table &amp; Services</span>
                        <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                            More than a mess. <br />
                            <span className="italic text-[#D4AF37]">A whole occasion.</span>
                        </h2>
                        <p className="mt-8 text-base md:text-lg text-white/70 font-light max-w-xl">
                            From an intimate anniversary dinner to a 200-guest wedding, our chef’s table brings the same
                            hand-pounded masalas, the same slow fire, and the same generous plating.
                        </p>
                    </div>
                </FadeInUp>

                <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {SERVICES.map((s, i) => (
                        <FadeInUp key={s.n} delay={i * 0.08}>
                            <div
                                data-testid={`service-${i}`}
                                className="group relative border-t border-white/15 pt-8 h-full flex flex-col"
                            >
                                <span className="font-display text-6xl text-[#D4AF37] leading-none">{s.n}</span>
                                <h3 className="font-display text-3xl md:text-4xl mt-6 leading-tight">{s.title}</h3>
                                <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed flex-1">
                                    {s.body}
                                </p>
                                <a
                                    href={wa(s.msg)}
                                    target="_blank"
                                    rel="noreferrer"
                                    data-testid={`service-cta-${i}`}
                                    className="mt-8 inline-flex items-center gap-2 group/btn text-[#D4AF37] hover:text-white transition-colors"
                                >
                                    <span className="overline">{s.cta}</span>
                                    <ArrowUpRight size={14} className="transition-transform group-hover/btn:rotate-45" />
                                </a>
                            </div>
                        </FadeInUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
