import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, UtensilsCrossed, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatApiError } from '@/context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUSES = [
    { key: 'pending', label: 'Pending', className: 'border-muted-foreground text-muted-foreground' },
    { key: 'confirmed', label: 'Confirmed', className: 'border-accent text-accent' },
    { key: 'seated', label: 'Seated', className: 'border-primary text-primary' },
    { key: 'cancelled', label: 'Cancelled', className: 'border-destructive text-destructive' },
];

export function StatusBadge({ status }) {
    const s = STATUSES.find((x) => x.key === status) || STATUSES[0];
    return (
        <Badge variant="outline" className={s.className} data-testid={`status-badge-${status}`}>
            {s.label}
        </Badge>
    );
}

/**
 * Inline status control for a reservation row.
 * On click, PATCHes /api/reservations/{id}/status and calls onUpdated(updated).
 */
export function StatusControl({ reservation, onUpdated }) {
    const [busy, setBusy] = useState(null);

    const change = async (next) => {
        if (next === (reservation.status || 'pending')) return;
        setBusy(next);
        try {
            const { data } = await axios.patch(`${API}/reservations/${reservation.id}/status`, { status: next });
            onUpdated?.(data);
            toast.success(`Marked as ${next}`);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || 'Update failed');
        } finally {
            setBusy(null);
        }
    };

    const current = reservation.status || 'pending';
    const icons = { confirmed: CheckCircle2, seated: UtensilsCrossed, cancelled: XCircle, pending: Clock };

    return (
        <div className="flex flex-wrap gap-1.5" data-testid={`status-control-${reservation.id}`}>
            {STATUSES.map((s) => {
                const Icon = icons[s.key];
                const active = current === s.key;
                return (
                    <button
                        key={s.key}
                        onClick={() => change(s.key)}
                        disabled={!!busy}
                        data-testid={`set-status-${s.key}-${reservation.id}`}
                        className={`inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs tracking-wide border transition-colors disabled:opacity-50 ${
                            active
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-transparent text-foreground/70 border-border hover:border-foreground'
                        }`}
                    >
                        {busy === s.key ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
                        {s.label}
                    </button>
                );
            })}
        </div>
    );
}
