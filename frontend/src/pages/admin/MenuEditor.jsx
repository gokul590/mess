import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Save, Loader2, Image as ImageIcon, EyeOff, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatApiError } from '@/context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Reusable editable card for dishes and specials
function EditableItem({ item, fields, endpoint, testid, onSaved }) {
    const [draft, setDraft] = useState(item);
    const [saving, setSaving] = useState(false);

    useEffect(() => { setDraft(item); }, [item]);

    const dirty = fields.some((f) => draft[f.key] !== item[f.key]);

    const save = async () => {
        setSaving(true);
        try {
            const patch = {};
            fields.forEach((f) => {
                if (draft[f.key] !== item[f.key]) patch[f.key] = f.type === 'number' ? Number(draft[f.key]) : draft[f.key];
            });
            if (Object.keys(patch).length === 0) { setSaving(false); return; }
            const { data } = await axios.patch(`${API}/${endpoint}/${item.id}`, patch);
            toast.success(`${item.name || item.title} updated`);
            onSaved?.(data);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async () => {
        setSaving(true);
        try {
            const { data } = await axios.patch(`${API}/${endpoint}/${item.id}`, { active: !item.active });
            toast.success(data.active ? 'Now visible on site' : 'Hidden from site');
            onSaved?.(data);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            data-testid={`${testid}-${item.id}`}
            className={`border border-border rounded-sm p-5 flex flex-col md:flex-row gap-5 ${item.active ? '' : 'opacity-60'}`}
        >
            <div className="w-full md:w-40 shrink-0">
                <div className="aspect-square overflow-hidden rounded-sm bg-muted border border-border relative">
                    {draft.image ? (
                        <img src={draft.image} alt={item.name || item.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon size={24} />
                        </div>
                    )}
                </div>
                <button
                    onClick={toggleActive}
                    data-testid={`toggle-active-${item.id}`}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 h-9 rounded-full border border-border hover:border-accent text-xs"
                >
                    {item.active ? <><Eye size={12}/> Visible</> : <><EyeOff size={12}/> Hidden</>}
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                {fields.map((f) => (
                    <div key={f.key} className={`flex flex-col gap-1.5 ${f.cols || 'md:col-span-3'}`}>
                        <Label className="overline text-muted-foreground text-[10px]">{f.label}</Label>
                        {f.type === 'textarea' ? (
                            <Textarea
                                data-testid={`field-${f.key}-${item.id}`}
                                rows={2}
                                value={draft[f.key] ?? ''}
                                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                                className="text-sm bg-transparent border border-border rounded-sm px-3 py-2 focus-visible:ring-0 focus-visible:border-primary"
                            />
                        ) : (
                            <Input
                                data-testid={`field-${f.key}-${item.id}`}
                                type={f.type || 'text'}
                                value={draft[f.key] ?? ''}
                                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                                className="text-sm bg-transparent border border-border rounded-sm px-3 h-9 focus-visible:ring-0 focus-visible:border-primary"
                            />
                        )}
                    </div>
                ))}
                <div className="md:col-span-6 flex justify-end pt-1">
                    <Button
                        onClick={save}
                        disabled={!dirty || saving}
                        data-testid={`save-${item.id}`}
                        className="rounded-full h-9 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed px-5"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin mr-2"/> : <Save size={14} className="mr-2"/>}
                        {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

const DISH_FIELDS = [
    { key: 'name', label: 'Name', cols: 'md:col-span-3' },
    { key: 'tamil', label: 'Tamil Name', cols: 'md:col-span-3' },
    { key: 'category', label: 'Category', cols: 'md:col-span-2' },
    { key: 'price', label: 'Price (₹)', type: 'number', cols: 'md:col-span-2' },
    { key: 'sort_order', label: 'Order', type: 'number', cols: 'md:col-span-2' },
    { key: 'image', label: 'Image URL', cols: 'md:col-span-6' },
    { key: 'desc', label: 'Description', type: 'textarea', cols: 'md:col-span-6' },
];

const SPECIAL_FIELDS = [
    { key: 'title', label: 'Title', cols: 'md:col-span-4' },
    { key: 'tag', label: 'Tag', cols: 'md:col-span-2' },
    { key: 'price', label: 'Price (₹)', type: 'number', cols: 'md:col-span-2' },
    { key: 'sort_order', label: 'Order', type: 'number', cols: 'md:col-span-2' },
    { key: 'image', label: 'Image URL', cols: 'md:col-span-6' },
    { key: 'desc', label: 'Description', type: 'textarea', cols: 'md:col-span-6' },
];

export function DishesEditor() {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/admin/dishes`);
            setDishes(data);
        } catch (err) {
            toast.error('Could not load dishes');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const onSaved = (updated) => {
        setDishes((prev) => prev.map((d) => d.id === updated.id ? updated : d));
    };

    if (loading) {
        return <div className="py-16 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2"/> Loading…</div>;
    }
    return (
        <div className="space-y-4" data-testid="dishes-editor">
            {dishes.map((d) => (
                <EditableItem key={d.id} item={d} fields={DISH_FIELDS} endpoint="admin/dishes" testid="dish-edit" onSaved={onSaved} />
            ))}
        </div>
    );
}

export function SpecialsEditor() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/admin/specials`);
            setItems(data);
        } catch (err) {
            toast.error('Could not load specials');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const onSaved = (updated) => {
        setItems((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    };

    if (loading) {
        return <div className="py-16 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2"/> Loading…</div>;
    }
    return (
        <div className="space-y-4" data-testid="specials-editor">
            {items.map((s) => (
                <EditableItem key={s.id} item={s} fields={SPECIAL_FIELDS} endpoint="admin/specials" testid="special-edit" onSaved={onSaved} />
            ))}
        </div>
    );
}
