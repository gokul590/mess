import { useState } from 'react';
import { GALLERY } from '@/data/menu';
import { FadeInUp } from './RevealText';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

export default function Gallery() {
    const [open, setOpen] = useState(null);
    return (
        <section
            id="gallery"
            data-testid="gallery-section"
            className="relative py-24 md:py-40 border-t border-border"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
                        <div className="max-w-3xl">
                            <span className="overline text-accent mb-4 block">06 — Gallery</span>
                            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                What our <span className="italic text-primary">kitchen</span> looks like.
                            </h2>
                        </div>
                        <span className="overline text-muted-foreground">Click any image to enlarge</span>
                    </div>
                </FadeInUp>

                <div className="masonry" data-testid="gallery-grid">
                    {GALLERY.map((g, i) => (
                        <FadeInUp key={i} delay={(i % 6) * 0.04}>
                            <button
                                onClick={() => setOpen(g)}
                                data-testid={`gallery-item-${i}`}
                                className="dish-frame block w-full overflow-hidden rounded-sm bg-muted"
                                style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '4/5' : '1/1' }}
                            >
                                <img
                                    src={g.src}
                                    alt={g.alt}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        </FadeInUp>
                    ))}
                </div>
            </div>

            <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
                <DialogContent className="max-w-5xl bg-background border-border p-0 overflow-hidden">
                    <VisuallyHidden.Root>
                        <DialogTitle>{open?.alt || 'Gallery image'}</DialogTitle>
                        <DialogDescription>Enlarged view of {open?.alt || 'gallery image'}</DialogDescription>
                    </VisuallyHidden.Root>
                    {open && (
                        <img src={open.src} alt={open.alt} className="w-full h-auto max-h-[85vh] object-contain" />
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
