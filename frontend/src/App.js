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
import DishCarousel from '@/components/site/DishCarousel';
import Specials from '@/components/site/Specials';
import ChefServices from '@/components/site/ChefServices';
import Gallery from '@/components/site/Gallery';
import Reviews from '@/components/site/Reviews';
import Contact from '@/components/site/Contact';
import FAQNewsletter from '@/components/site/FAQNewsletter';
import Footer from '@/components/site/Footer';
import FloatingActions from '@/components/site/FloatingActions';
import InstagramFeed from '@/components/site/InstagramFeed';
import LoadingScreen from '@/components/site/LoadingScreen';
import AdminPage from '@/pages/Admin';
import { AuthProvider } from '@/context/AuthContext';
import { I18nProvider } from '@/context/I18nContext';

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

function Site({ theme, setTheme }) {
    useLenis();

    useEffect(() => {
        document.title = 'Palaniyappa Mess · Est. 1980 · Authentic Chettinad · Pudukkottai';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute(
                'content',
                'Palaniyappa Mess, Pudukkottai — since 1980. Authentic Chettinad and Tamil Nadu non-veg cuisine. Chicken biryani, mutton chukka, fish fry, parotta, seafood & meals.'
            );
        }
    }, []);

    return (
        <>
            <LoadingScreen />
            <Header theme={theme} setTheme={setTheme} />
            <main>
                <Hero />
                <Marquee />
                <Manifesto />
                <Signature />
                <DishCarousel />
                <Specials />
                <ChefServices />
                <Gallery />
                <Reviews />
                <Contact />
                <InstagramFeed />
                <FAQNewsletter />
            </main>
            <Footer />
            <FloatingActions />
        </>
    );
}

function Shell({ children }) {
    const [theme, setTheme] = useTheme();
    return (
        <div className="App relative bg-background text-foreground">
            {typeof children === 'function' ? children({ theme, setTheme }) : children}
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
        <AuthProvider>
            <I18nProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Shell>{({ theme, setTheme }) => <Site theme={theme} setTheme={setTheme} />}</Shell>} />
                        <Route path="/admin" element={<Shell><AdminPage /></Shell>} />
                        <Route path="*" element={<Shell>{({ theme, setTheme }) => <Site theme={theme} setTheme={setTheme} />}</Shell>} />
                    </Routes>
                </BrowserRouter>
            </I18nProvider>
        </AuthProvider>
    );
}

export default App;
