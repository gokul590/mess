import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Users,
    Phone,
    Mail,
    Clock,
    ArrowLeft,
    LogOut,
    RefreshCw,
    LockKeyhole,
    Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth, formatApiError } from '@/context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ---------------- Login ----------------
function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back');
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
            <div className="hidden lg:block relative">
                <img
                    src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1600&q=85"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0C0A09]/70" />
                <div className="absolute inset-x-0 bottom-0 p-12 text-[#F7F5F0]">
                    <span className="overline text-[#D4AF37]">Admin · Est. 1980</span>
                    <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-tight">
                        Palaniyappa <br />
                        <span className="italic">Mess.</span>
                    </h1>
                    <p className="mt-6 max-w-md text-white/60 font-light">
                        Sign in to view reservations, guest messages, and newsletter subscribers.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 md:p-16">
                <form onSubmit={submit} className="w-full max-w-sm" data-testid="admin-login-form">
                    <Link to="/" className="inline-flex items-center gap-2 overline text-muted-foreground hover:text-foreground mb-12" data-testid="back-to-site">
                        <ArrowLeft size={14} /> Back to site
                    </Link>
                    <div className="flex items-center gap-2 mb-6">
                        <LockKeyhole size={18} className="text-primary" />
                        <span className="overline text-accent">Admin Sign-In</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-10">
                        Welcome <span className="italic text-primary">back.</span>
                    </h2>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <Label className="overline text-muted-foreground">Email</Label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                data-testid="login-email"
                                className="bg-transparent border-0 border-b border-border rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-primary"
                                placeholder="admin@palaniyappamess.com"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="overline text-muted-foreground">Password</Label>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                data-testid="login-password"
                                className="bg-transparent border-0 border-b border-border rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-primary"
                                placeholder="••••••••"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            data-testid="login-submit"
                            className="w-full rounded-full h-12 bg-primary hover:bg-primary/90"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------- Dashboard ----------------
function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="border border-border p-6 rounded-sm bg-background">
            <div className="flex items-center justify-between mb-4">
                <span className="overline text-muted-foreground">{label}</span>
                <Icon size={16} className="text-accent" />
            </div>
            <div className="font-display text-5xl tracking-tight">{value}</div>
        </div>
    );
}

function Empty({ label }) {
    return (
        <div className="border border-dashed border-border rounded-sm py-16 text-center text-muted-foreground font-display italic text-xl">
            <Inbox className="mx-auto mb-3 text-accent" size={22} />
            No {label} yet.
        </div>
    );
}

function fmtDate(iso) {
    try {
        return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch { return iso; }
}

function DashboardScreen() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ reservations: 0, contact_messages: 0, newsletter_subs: 0 });
    const [reservations, setReservations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [s, r, c, n] = await Promise.all([
                axios.get(`${API}/admin/stats`),
                axios.get(`${API}/reservations`),
                axios.get(`${API}/contact`),
                axios.get(`${API}/newsletter`),
            ]);
            setStats(s.data);
            setReservations(r.data);
            setMessages(c.data);
            setSubs(n.data);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || 'Could not load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Topbar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3" data-testid="admin-logo">
                            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="font-display text-primary-foreground text-base leading-none">P</span>
                            </span>
                            <span className="flex flex-col leading-tight">
                                <span className="font-display text-base">Palaniyappa · Admin</span>
                                <span className="overline text-muted-foreground -mt-0.5">Est. 1980</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden md:block overline text-muted-foreground">
                            {user?.email}
                        </span>
                        <button
                            onClick={load}
                            data-testid="refresh-btn"
                            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-accent"
                            aria-label="Refresh"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <Button
                            variant="outline"
                            onClick={logout}
                            data-testid="logout-btn"
                            className="rounded-full h-9 border-border"
                        >
                            <LogOut size={14} className="mr-2" /> Sign out
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16">
                <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                    <div>
                        <span className="overline text-accent">Dashboard</span>
                        <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[0.95] mt-2">
                            Today, at a <span className="italic text-primary">glance.</span>
                        </h1>
                    </div>
                    <span className="overline text-muted-foreground">{fmtDate(new Date().toISOString())}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12" data-testid="admin-stats">
                    <StatCard label="Reservations" value={stats.reservations} icon={Calendar} />
                    <StatCard label="Contact Messages" value={stats.contact_messages} icon={Mail} />
                    <StatCard label="Newsletter Subs" value={stats.newsletter_subs} icon={Users} />
                </div>

                <Tabs defaultValue="reservations" className="w-full">
                    <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 mb-8">
                        <TabsTrigger value="reservations" data-testid="tab-reservations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 overline">
                            Reservations
                        </TabsTrigger>
                        <TabsTrigger value="messages" data-testid="tab-messages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 overline">
                            Messages
                        </TabsTrigger>
                        <TabsTrigger value="newsletter" data-testid="tab-newsletter" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 overline">
                            Newsletter
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reservations" data-testid="content-reservations">
                        {reservations.length === 0 ? <Empty label="reservations" /> : (
                            <div className="border border-border rounded-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 overline text-muted-foreground">Guest</th>
                                                <th className="px-4 py-3 overline text-muted-foreground">Contact</th>
                                                <th className="px-4 py-3 overline text-muted-foreground">When</th>
                                                <th className="px-4 py-3 overline text-muted-foreground">Party</th>
                                                <th className="px-4 py-3 overline text-muted-foreground">Notes</th>
                                                <th className="px-4 py-3 overline text-muted-foreground">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reservations.map((r) => (
                                                <tr key={r.id} className="border-t border-border" data-testid={`res-row-${r.id}`}>
                                                    <td className="px-4 py-4">
                                                        <div className="font-medium">{r.name}</div>
                                                        {r.occasion && <div className="text-xs text-muted-foreground">{r.occasion}</div>}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs"><Phone size={12} /> {r.phone}</div>
                                                        {r.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1"><Mail size={12} /> {r.email}</div>}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-accent" /> {r.date}</div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1"><Clock size={12} /> {r.time}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="outline" className="border-accent text-accent">{r.guests} pax</Badge>
                                                    </td>
                                                    <td className="px-4 py-4 max-w-xs text-xs text-muted-foreground">{r.message || '—'}</td>
                                                    <td className="px-4 py-4 text-xs text-muted-foreground">{fmtDate(r.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="messages" data-testid="content-messages">
                        {messages.length === 0 ? <Empty label="messages" /> : (
                            <div className="space-y-4">
                                {messages.map((m) => (
                                    <div key={m.id} className="border border-border rounded-sm p-6" data-testid={`msg-${m.id}`}>
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <div className="font-display text-2xl leading-tight">{m.name}</div>
                                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {m.email}</span>
                                                    {m.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {m.phone}</span>}
                                                    {m.subject && <Badge variant="outline">{m.subject}</Badge>}
                                                </div>
                                            </div>
                                            <span className="overline text-muted-foreground">{fmtDate(m.created_at)}</span>
                                        </div>
                                        <p className="mt-4 leading-relaxed text-foreground/90">{m.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="newsletter" data-testid="content-newsletter">
                        {subs.length === 0 ? <Empty label="subscribers" /> : (
                            <div className="border border-border rounded-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 overline text-muted-foreground">Email</th>
                                            <th className="px-4 py-3 overline text-muted-foreground">Subscribed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subs.map((s) => (
                                            <tr key={s.id} className="border-t border-border" data-testid={`sub-${s.id}`}>
                                                <td className="px-4 py-3">{s.email}</td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(s.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// ---------------- Router entry ----------------
export default function AdminPage() {
    const { user } = useAuth();

    if (user === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="overline text-muted-foreground animate-pulse">Loading…</div>
            </div>
        );
    }
    if (user === false) return <LoginScreen />;
    return <DashboardScreen />;
}
