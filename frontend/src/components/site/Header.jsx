import { useEffect, useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV = [
    { label: 'Menu', to: '#menu' },
    { label: 'Manifesto', to: '#manifesto' },
    { label: 'Specials', to: '#specials' },
    { label: 'Gallery', to: '#gallery' },
    { label: 'Contact', to: '#contact' },
];

export default function Header({ theme, setTheme }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (hash) => {
        setOpen(false);
        const el = document.querySelector(hash);
        if (!el) return;
        if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
        else el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <header
            data-testid="site-header"
            className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
                scrolled
                    ? 'bg-background/70 backdrop-blur-xl border-b border-border'
                    : 'bg-background/30 backdrop-blur-md border-b border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                <button
                    onClick={() => scrollTo('#top')}
                    className="flex items-center gap-3 group"
                    data-testid="header-logo"
                >
                    <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                        <span className="font-display text-primary-foreground text-lg leading-none">P</span>
                    </span>
                    <span className="flex flex-col leading-tight text-left">
                        <span className="font-display text-lg tracking-tight">Palaniyappa</span>
                        <span className="overline text-muted-foreground -mt-0.5">Mess · Pudukkottai</span>
                    </span>
                </button>

                <nav className="hidden lg:flex items-center gap-10">
                    {NAV.map((n) => (
                        <button
                            key={n.to}
                            onClick={() => scrollTo(n.to)}
                            className="nav-link overline text-foreground/80 hover:text-foreground"
                            data-testid={`nav-${n.label.toLowerCase()}`}
                        >
                            {n.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        aria-label="Toggle theme"
                        data-testid="theme-toggle"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-accent transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    <Button
                        onClick={() => scrollTo('#reservation')}
                        className="hidden md:inline-flex rounded-full px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
                        data-testid="header-book-btn"
                    >
                        Book a Table
                    </Button>

                    <button
                        className="lg:hidden w-10 h-10 rounded-full border border-border flex items-center justify-center"
                        onClick={() => setOpen(!open)}
                        aria-label="Menu"
                        data-testid="mobile-menu-toggle"
                    >
                        {open ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
                    <div className="px-6 py-6 flex flex-col gap-4">
                        {NAV.map((n) => (
                            <button
                                key={n.to}
                                onClick={() => scrollTo(n.to)}
                                className="text-left font-display text-3xl"
                                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                            >
                                {n.label}
                            </button>
                        ))}
                        <Button
                            onClick={() => scrollTo('#reservation')}
                            className="mt-2 rounded-full h-11 bg-primary text-primary-foreground"
                            data-testid="mobile-book-btn"
                        >
                            Book a Table
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
