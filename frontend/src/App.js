import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

import '@/App.css';
import useLenis from '@/hooks/useLenis';
import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import Marquee from '@/components/site/Marquee';
import Manifesto from '@/components/site/Manifesto';
import Signature from '@/components/site/Signature';
import Specials from '@/components/site/Specials';
import ChefServices from '@/components/site/ChefServices';
import Gallery from '@/components/site/Gallery';
import Reviews from '@/components/site/Reviews';
import Contact from '@/components/site/Contact';
import FAQNewsletter from '@/components/site/FAQNewsletter';
import Footer from '@/components/site/Footer';
import FloatingActions from '@/components/site/FloatingActions';

function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'dark';
        return localStorage.getItem('palaniyappa-theme') || 'dark';
    });
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('palaniyappa-theme', theme);
    }, [theme]);
    return [theme, setTheme];
}

function Site() {
    useLenis();
    const [theme, setTheme] = useTheme();

    useEffect(() => {
        document.title = 'Palaniyappa Mess · Authentic Chettinad Cuisine · Pudukkottai';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute(
                'content',
                'Palaniyappa Mess, Pudukkottai — authentic Chettinad and Tamil Nadu non-veg cuisine. Chicken biryani, mutton chukka, fish fry, parotta, seafood & meals.'
            );
        }
    }, []);

    return (
        <div className="App relative bg-background text-foreground">
            <Header theme={theme} setTheme={setTheme} />
            <main>
                <Hero />
                <Marquee />
                <Manifesto />
                <Signature />
                <Specials />
                <ChefServices />
                <Gallery />
                <Reviews />
                <Contact />
                <FAQNewsletter />
            </main>
            <Footer />
            <FloatingActions />
            <Toaster
                position="bottom-center"
                theme={theme}
                toastOptions={{
                    classNames: {
                        toast: 'bg-background text-foreground border border-border font-body',
                    },
                }}
            />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Site />} />
                <Route path="*" element={<Site />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
