import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const WA = '919942933912';
const WA_MSG = encodeURIComponent(
    'Vanakkam! I want to order from Palaniyappa Mess. Please share today’s menu and prices.'
);

export default function FloatingActions() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 600);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const backToTop = () => {
        if (window.__lenis) window.__lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <a
                href={`https://wa.me/${WA}?text=${WA_MSG}`}
                target="_blank"
                rel="noreferrer"
                data-testid="whatsapp-fab"
                aria-label="Order on WhatsApp"
                className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg pulse-ring hover:scale-105 transition-transform"
            >
                <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
                    <path d="M19.11 17.28c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.9-2.16-.24-.57-.48-.49-.65-.5h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.02 2.82 1.17 3.02c.14.19 2.01 3.06 4.87 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.13-.26-.21-.55-.35Zm-5.24 7.16h-.01c-1.73 0-3.42-.47-4.9-1.35l-.35-.21-3.63.96.97-3.55-.23-.36a10.15 10.15 0 0 1-1.56-5.42c0-5.6 4.56-10.16 10.17-10.16 2.72 0 5.28 1.06 7.2 2.98a10.1 10.1 0 0 1 2.98 7.19c0 5.6-4.55 10.16-10.14 10.16Zm8.65-18.81A12.1 12.1 0 0 0 13.87 2C7.15 2 1.67 7.48 1.67 14.2c0 2.15.56 4.24 1.63 6.09L1.5 26.5l6.35-1.67a12.14 12.14 0 0 0 6.02 1.53h.01c6.72 0 12.19-5.48 12.19-12.2 0-3.26-1.27-6.32-3.55-8.61Z" />
                </svg>
            </a>

            {show && (
                <button
                    onClick={backToTop}
                    data-testid="back-to-top"
                    aria-label="Back to top"
                    className="fixed bottom-5 left-5 md:bottom-8 md:left-8 z-40 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                    <ArrowUp size={18} />
                </button>
            )}
        </>
    );
}
