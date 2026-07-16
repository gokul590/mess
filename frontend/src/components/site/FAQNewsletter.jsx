import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FAQS } from '@/data/menu';
import { FadeInUp } from './RevealText';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FAQNewsletter() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const subscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await axios.post(`${API}/newsletter`, { email });
            toast.success('You’re on the list', {
                description: 'Weekly specials & festival menus, no spam.',
            });
            setEmail('');
        } catch (err) {
            if (err.response?.status === 429) {
                toast.error('Too many submissions. Please try again later.');
            } else {
                toast.error('Could not subscribe. Try a different email.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            data-testid="faq-newsletter"
            className="relative py-24 md:py-40 border-t border-border bg-secondary/30"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <FadeInUp className="lg:col-span-7">
                    <span className="overline text-accent mb-4 block">09 — Frequently Asked</span>
                    <h2 className="font-display text-4xl md:text-6xl leading-[0.95] tracking-tight mb-10">
                        The <span className="italic text-primary">quiet</span> questions.
                    </h2>
                    <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
                        {FAQS.map((f, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                                <AccordionTrigger data-testid={`faq-q-${i}`} className="font-display text-xl md:text-2xl text-left hover:no-underline py-6">
                                    <span className="flex items-baseline gap-4">
                                        <span className="text-accent font-body text-sm">{String(i + 1).padStart(2, '0')}</span>
                                        {f.q}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground leading-relaxed pl-10 pr-6 pb-6">
                                    {f.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </FadeInUp>

                <FadeInUp className="lg:col-span-5">
                    <div className="lg:sticky lg:top-32 border border-border rounded-sm p-8 md:p-10 bg-background">
                        <span className="overline text-accent mb-4 block">Newsletter</span>
                        <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4">
                            Weekly specials, <span className="italic">delivered warm.</span>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Festival menus, weekend biryani buckets, chef’s picks. One thoughtful email a week.
                        </p>
                        <form onSubmit={subscribe} className="flex gap-2" data-testid="newsletter-form">
                            <Input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                data-testid="newsletter-email"
                                className="flex-1 bg-transparent border-0 border-b border-border rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-primary"
                            />
                            <Button type="submit" disabled={loading} data-testid="newsletter-submit" className="rounded-full bg-primary hover:bg-primary/90 h-11 px-6">
                                {loading ? '…' : 'Subscribe'}
                            </Button>
                        </form>
                    </div>
                </FadeInUp>
            </div>
        </section>
    );
}
