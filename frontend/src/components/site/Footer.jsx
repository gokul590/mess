import { Instagram, Facebook, Send } from 'lucide-react';

const WA = '919942933912';

export default function Footer() {
    const scrollTo = (hash) => {
        const el = document.querySelector(hash);
        if (!el) return;
        if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
        else el.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <footer
            data-testid="footer"
            className="relative bg-[#0C0A09] text-[#F7F5F0] pt-24 md:pt-32 pb-8 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
                    <div className="md:col-span-6">
                        <button onClick={() => scrollTo('#top')} className="text-left" data-testid="footer-logo">
                            <h2 className="font-display text-7xl md:text-9xl leading-[0.85] tracking-tight">
                                Palaniyappa <br />
                                <span className="italic text-[#D4AF37]">Mess.</span>
                            </h2>
                        </button>
                        <p className="mt-8 max-w-md text-white/60 font-light">
                            Authentic Chettinad and Tamil Nadu non-veg cuisine, cooked slowly, served warm.
                            Pudukkottai — <span className="text-[#D4AF37]">since 1980</span>.
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <div className="overline text-[#D4AF37] mb-6">Quick Links</div>
                        <ul className="space-y-3">
                            {['Home', 'Menu', 'Manifesto', 'Specials', 'Gallery', 'Contact'].map((l) => (
                                <li key={l}>
                                    <button
                                        onClick={() => scrollTo(l === 'Home' ? '#top' : `#${l.toLowerCase()}`)}
                                        className="hover:text-[#D4AF37] transition-colors"
                                        data-testid={`footer-nav-${l.toLowerCase()}`}
                                    >
                                        {l}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-3">
                        <div className="overline text-[#D4AF37] mb-6">Visit / Order</div>
                        <ul className="space-y-3 text-white/70">
                            <li>Pudukkottai, Tamil Nadu</li>
                            <li>Mon–Sun · 7 AM – 11 PM</li>
                            <li><a href="tel:+919942933912" className="hover:text-[#D4AF37]">+91 99429 33912</a></li>
                            <li><a href="mailto:info@palaniyappamess.com" className="hover:text-[#D4AF37]">info@palaniyappamess.com</a></li>
                        </ul>
                        <div className="flex gap-3 mt-6">
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" data-testid="social-instagram" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                                <Instagram size={16} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" data-testid="social-facebook" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                                <Facebook size={16} />
                            </a>
                            <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer" data-testid="social-whatsapp" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                                <Send size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-white/50">
                    <div>© 2026 Palaniyappa Mess · Est. 1980 · All Rights Reserved</div>
                    <div className="overline">Crafted with fire &amp; pepper · Pudukkottai</div>
                </div>
            </div>
        </footer>
    );
}
