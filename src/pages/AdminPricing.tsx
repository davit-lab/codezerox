import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePricing, useUpdatePrice, PricingItem } from '@/hooks/usePricing';
import { toast } from 'sonner';
import { Save, Tag } from 'lucide-react';

const AdminPricing = () => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { data: items = [], isLoading: loading } = usePricing();
  const update = useUpdatePrice();
  const [draft, setDraft] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate('/');
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    const d: Record<string, number> = {};
    items.forEach((i: PricingItem) => { d[i.key] = Number(i.amount_gel); });
    setDraft(d);
  }, [items]);

  const handleSave = async (item: PricingItem) => {
    const amount = draft[item.key];
    if (isNaN(amount) || amount < 0) {
      toast.error('არასწორი ფასი');
      return;
    }
    try {
      await update.mutateAsync({ key: item.key, amount_gel: amount });
      toast.success(`${item.label} განახლდა`);
    } catch (e: any) {
      toast.error(e.message || 'შეცდომა');
    }
  };

  return (
    <AdminLayout title="ფასების მართვა" titleIcon="payments">
      {loading ? (
        <p className="text-muted-foreground">იტვირთება...</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.key} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-base">{item.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.description || item.key}</p>
                <code className="text-[10px] text-muted-foreground/60">{item.key}</code>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={draft[item.key] ?? ''}
                    onChange={(e) => setDraft({ ...draft, [item.key]: Number(e.target.value) })}
                    className="w-32 h-10 px-3 pr-8 bg-muted/30 border border-border rounded-lg text-right font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₾</span>
                </div>
                <button
                  onClick={() => handleSave(item)}
                  disabled={update.isPending}
                  className="h-10 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> შენახვა
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPricing;
