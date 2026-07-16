import { useEffect } from 'react';
import Lenis from 'lenis';

export default function useLenis() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
        });

        let rafId;
        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        // expose for anchor scroll
        window.__lenis = lenis;

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            window.__lenis = undefined;
        };
    }, []);
}
