import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FadeInUp } from './RevealText';
import { useI18n } from '@/context/I18nContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyR = { name: '', phone: '', email: '', guests: 2, date: '', time: '19:30', occasion: '', message: '' };
const emptyC = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
    const { t } = useI18n();
    const [tab, setTab] = useState('reserve');
    const [r, setR] = useState(emptyR);
    const [c, setC] = useState(emptyC);
    const [loading, setLoading] = useState(false);

    const submitReservation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/reservations`, { ...r, guests: Number(r.guests) });
            toast.success(t('form.reserveSuccess'), { description: t('form.reserveSuccessDesc') });
            setR(emptyR);
        } catch (err) {
            if (err.response?.status === 429) {
                toast.error(t('form.rateLimitError'));
            } else {
                toast.error('Could not reserve. Please try again or call us.');
            }
        } finally {
            setLoading(false);
        }
    };

    const submitContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/contact`, c);
            toast.success(t('form.contactSuccess'), { description: t('form.contactSuccessDesc') });
            setC(emptyC);
        } catch (err) {
            if (err.response?.status === 429) {
                toast.error(t('form.rateLimitError'));
            } else {
                toast.error('Could not send. Please try WhatsApp or call.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputCls =
        'bg-transparent border-0 border-b border-border rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-primary focus:outline-none';

    return (
        <section
            id="contact"
            data-testid="contact-section"
            className="relative py-24 md:py-40 border-t border-border"
        >
            <div id="reservation" className="max-w-7xl mx-auto px-6 md:px-12">
                <FadeInUp>
                    <span className="overline text-accent mb-4 block">08 — Reserve &amp; Contact</span>
                    <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-4xl">
                        Come, share a <span className="italic text-primary">meal</span> with us.
                    </h2>
                </FadeInUp>

                <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Info + Map */}
                    <FadeInUp className="lg:col-span-5">
                        <div className="space-y-10">
                            <div>
                                <div className="overline text-muted-foreground mb-3">Address</div>
                                <div className="flex gap-3 items-start">
                                    <MapPin size={18} className="text-accent mt-1" />
                                    <p className="font-display text-2xl leading-tight">
                                        Palaniyappa Mess <br />
                                        Pudukkottai, Tamil Nadu
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="overline text-muted-foreground mb-2">Phone</div>
                                    <a href="tel:+919942933912" data-testid="contact-phone" className="inline-flex items-center gap-2 hover:text-accent">
                                        <Phone size={14} /> +91 99429 33912
                                    </a>
                                </div>
                                <div>
                                    <div className="overline text-muted-foreground mb-2">Email</div>
                                    <a href="mailto:info@palaniyappamess.com" data-testid="contact-email" className="inline-flex items-center gap-2 hover:text-accent">
                                        <Mail size={14} /> info@palaniyappamess.com
                                    </a>
                                </div>
                                <div className="col-span-2">
                                    <div className="overline text-muted-foreground mb-2">Opening Hours</div>
                                    <div className="inline-flex items-center gap-2">
                                        <Clock size={14} className="text-accent" /> Mon–Sun · 7:00 AM – 11:00 PM
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-sm overflow-hidden border border-border aspect-[4/3]">
                                <iframe
                                    title="Palaniyappa Mess Map"
                                    src="https://www.google.com/maps?q=Pudukkottai,+Tamil+Nadu&output=embed"
                                    className="w-full h-full"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    data-testid="map-embed"
                                />
                            </div>
                        </div>
                    </FadeInUp>

                    {/* Forms */}
                    <FadeInUp className="lg:col-span-7">
                        <div className="flex gap-2 mb-8 border-b border-border">
                            {[{ k: 'reserve', l: 'Reserve a Table' }, { k: 'contact', l: 'Contact' }].map((t) => (
                                <button
                                    key={t.k}
                                    onClick={() => setTab(t.k)}
                                    data-testid={`tab-${t.k}`}
                                    className={`relative pb-3 px-1 mr-6 overline transition-colors ${
                                        tab === t.k ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t.l}
                                    {tab === t.k && (
                                        <span className="absolute bottom-[-1px] left-0 right-0 h-px bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {tab === 'reserve' ? (
                            <form onSubmit={submitReservation} className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="reservation-form">
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Full Name</Label>
                                    <Input required data-testid="r-name" className={inputCls} value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Phone</Label>
                                    <Input required data-testid="r-phone" className={inputCls} value={r.phone} onChange={(e) => setR({ ...r, phone: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Email (optional)</Label>
                                    <Input type="email" data-testid="r-email" className={inputCls} value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Guests</Label>
                                    <Input required type="number" min={1} max={50} data-testid="r-guests" className={inputCls} value={r.guests} onChange={(e) => setR({ ...r, guests: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Date</Label>
                                    <Input required type="date" data-testid="r-date" className={inputCls} value={r.date} onChange={(e) => setR({ ...r, date: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Time</Label>
                                    <Input required type="time" data-testid="r-time" className={inputCls} value={r.time} onChange={(e) => setR({ ...r, time: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Occasion (optional)</Label>
                                    <Input data-testid="r-occasion" className={inputCls} placeholder="Birthday, anniversary…" value={r.occasion} onChange={(e) => setR({ ...r, occasion: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Notes</Label>
                                    <Textarea data-testid="r-message" rows={3} className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" value={r.message} onChange={(e) => setR({ ...r, message: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <Button type="submit" disabled={loading} data-testid="r-submit" className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8">
                                        {loading ? 'Reserving…' : 'Reserve Table'} <ArrowUpRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={submitContact} className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="contact-form">
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Name</Label>
                                    <Input required data-testid="c-name" className={inputCls} value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Email</Label>
                                    <Input required type="email" data-testid="c-email" className={inputCls} value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Phone</Label>
                                    <Input data-testid="c-phone" className={inputCls} value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Subject</Label>
                                    <Input data-testid="c-subject" className={inputCls} value={c.subject} onChange={(e) => setC({ ...c, subject: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <Label className="overline text-muted-foreground">Message</Label>
                                    <Textarea required rows={5} data-testid="c-message" className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" value={c.message} onChange={(e) => setC({ ...c, message: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <Button type="submit" disabled={loading} data-testid="c-submit" className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8">
                                        {loading ? 'Sending…' : 'Send Message'} <ArrowUpRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </form>
                        )}
                    </FadeInUp>
                </div>
            </div>
        </section>
    );
}
