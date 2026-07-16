import { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS } from '@/data/translations';

const I18nContext = createContext(null);
const KEY = 'palaniyappa-lang';

export function I18nProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        if (typeof window === 'undefined') return 'en';
        return localStorage.getItem(KEY) || 'en';
    });

    useEffect(() => {
        localStorage.setItem(KEY, lang);
        document.documentElement.setAttribute('lang', lang);
    }, [lang]);

    const t = (key) => {
        return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
    };

    const toggle = () => setLangState((prev) => (prev === 'en' ? 'ta' : 'en'));
    const setLang = (v) => setLangState(v);

    return (
        <I18nContext.Provider value={{ lang, t, toggle, setLang }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
    return ctx;
}
