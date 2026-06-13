import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Tag, Percent, BadgeDollarSign, Copy, ToggleLeft, ToggleRight } from "lucide-react";

const AdminPromoCodes = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data: promoCodes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("promo_codes").insert({
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("პრომოკოდი შეიქმნა!");
      setShowForm(false);
      setCode(""); setDiscountValue(""); setMaxUses(""); setExpiresAt("");
    },
    onError: (e: any) => toast.error(e.message?.includes("duplicate") ? "ეს კოდი უკვე არსებობს" : "შეცდომა"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("promo_codes").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("პრომოკოდი წაიშალა");
    },
  });

  if (isLoading) return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  return (
    <AdminLayout title="პრომოკოდები" titleIcon="loyalty" actions={
      <button onClick={() => setShowForm(!showForm)} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus className="w-4 h-4" /> ახალი
      </button>
    }>

              {showForm && (
                <div className="bg-card/80 border border-border/30 rounded-2xl p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">კოდი</label>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="SALE50"
                        className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">ფასდაკლების ტიპი</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="percentage">პროცენტული (%)</option>
                        <option value="fixed">ფიქსირებული ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">მნიშვნელობა</label>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === "percentage" ? "50" : "5.00"}
                        className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">მაქს. გამოყენება (ცარიელი = ულიმიტო)</label>
                      <input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder="100"
                        className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">ვადა (არასავალდებულო)</label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => createMutation.mutate()}
                      disabled={!code.trim() || !discountValue || createMutation.isPending}
                      className="btn btn-gold disabled:opacity-50"
                    >
                      შექმნა
                    </button>
                    <button onClick={() => setShowForm(false)} className="btn btn-ghost">გაუქმება</button>
                  </div>
                </div>
              )}

              {loadingCodes ? (
                <p className="text-muted-foreground">იტვირთება...</p>
              ) : promoCodes.length === 0 ? (
                <p className="text-muted-foreground">პრომოკოდები არ არის</p>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map((promo: any) => (
                    <div key={promo.id} className={`bg-card/80 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${promo.is_active ? 'border-border/30' : 'border-border/10 opacity-60'}`}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${promo.discount_type === 'percentage' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {promo.discount_type === 'percentage' ? <Percent className="w-5 h-5" /> : <BadgeDollarSign className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg">{promo.code}</span>
                            <button onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("კოპირებულია!"); }} className="text-muted-foreground hover:text-foreground transition-colors">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                            <span>{promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`} ფასდაკლება</span>
                            <span>გამოყენება: {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ''}</span>
                            {promo.expires_at && <span>ვადა: {new Date(promo.expires_at).toLocaleDateString('ka-GE')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleMutation.mutate({ id: promo.id, is_active: !promo.is_active })}
                          className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          title={promo.is_active ? "გამორთვა" : "ჩართვა"}
                        >
                          {promo.is_active ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => { if (confirm("წაშალოთ პრომოკოდი?")) deleteMutation.mutate(promo.id); }}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
    </AdminLayout>
  );
};

export default AdminPromoCodes;
