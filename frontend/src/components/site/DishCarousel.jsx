import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { DISHES } from '@/data/menu';
import { FadeInUp } from './RevealText';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

const WA = '919942933912';
const featured = DISHES.filter((d) =>
    ['chicken-biryani', 'mutton-biryani', 'mutton-sukka', 'crab-masala', 'chicken-65', 'fish-fry', 'prawn-fry', 'parotta'].includes(d.id)
);

export default function DishCarousel() {
    const swiperRef = useRef(null);

    return (
        <section
            data-testid="dish-carousel"
            className="relative py-24 md:py-40 border-t border-border bg-secondary/30 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <div className="flex items-end justify-between gap-8 flex-wrap mb-16">
                        <div className="max-w-3xl">
                            <span className="overline text-accent mb-4 block">Featured · Chef’s Selection</span>
                            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                                A small <span className="italic text-primary">edit</span>. The best of the pot.
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => swiperRef.current?.slidePrev()}
                                aria-label="Previous"
                                data-testid="carousel-prev"
                                className="w-11 h-11 rounded-full border border-border hover:border-accent flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => swiperRef.current?.slideNext()}
                                aria-label="Next"
                                data-testid="carousel-next"
                                className="w-11 h-11 rounded-full border border-border hover:border-accent flex items-center justify-center transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </FadeInUp>
            </div>

            <div className="pl-6 md:pl-12">
                <Swiper
                    modules={[Autoplay, EffectCoverflow, Navigation]}
                    onSwiper={(s) => (swiperRef.current = s)}
                    slidesPerView={1.15}
                    spaceBetween={16}
                    loop
                    autoplay={{ delay: 4500, disableOnInteraction: false }}
                    breakpoints={{
                        640: { slidesPerView: 1.6, spaceBetween: 20 },
                        1024: { slidesPerView: 2.4, spaceBetween: 28 },
                        1280: { slidesPerView: 3.2, spaceBetween: 32 },
                    }}
                >
                    {featured.map((d, i) => (
                        <SwiperSlide key={d.id}>
                            <a
                                href={`https://wa.me/${WA}?text=${encodeURIComponent(`I'd like to order ${d.name} (₹${d.price})`)}`}
                                target="_blank"
                                rel="noreferrer"
                                data-testid={`carousel-slide-${d.id}`}
                                className="dish-frame group block aspect-[3/4] relative overflow-hidden rounded-sm bg-muted"
                            >
                                <img src={d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/60 to-transparent">
                                    <div className="flex items-baseline justify-between gap-3 text-[#F7F5F0]">
                                        <div>
                                            <div className="overline text-[#D4AF37] mb-1">
                                                {String(i + 1).padStart(2, '0')} · {d.category}
                                            </div>
                                            <div className="font-display text-2xl md:text-3xl leading-tight">{d.name}</div>
                                        </div>
                                        <div className="font-display text-2xl text-[#D4AF37]">₹{d.price}</div>
                                    </div>
                                    <div className="mt-3 inline-flex items-center gap-1.5 overline text-[#F7F5F0]/80 group-hover:text-[#D4AF37] transition-colors">
                                        Order on WhatsApp
                                        <ArrowUpRight size={12} className="transition-transform group-hover:rotate-45" />
                                    </div>
                                </div>
                            </a>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
