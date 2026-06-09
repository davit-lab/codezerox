import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { useCart } from "@/hooks/useCart";
import { useCreateCoursePurchase } from "@/hooks/useCourses";
import { useCreateSubscription } from "@/hooks/useCourseSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { usePurchaseCredits } from "@/hooks/useCredits";
import { useBankPayment, BankProvider } from "@/hooks/useBankPayment";
import { useSpendCredits } from '@/hooks/useSiteCredits';
import SiteCreditsWidget from '@/components/credits/SiteCreditsWidget';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Lock, BookOpen, Coins, ShieldCheck,
  GraduationCap, CheckCircle, CreditCard, Loader2, Tag, X,
  Sparkles, ChevronRight, Package, ChevronDown, Building2, Percent, Gift
} from "lucide-react";
import { useActiveBundles, calculateBundleDiscount } from "@/hooks/useBookBundles";

interface PromoDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { items, creditItems, courseItems, getTotal, getCreditTotal, getCourseTotal, getGrandTotal, clearCart, getItemCount } = useCart();
  const createCoursePurchase = useCreateCoursePurchase();
  const createSubscription = useCreateSubscription();
  const createPurchase = useCreatePurchase();
  const purchaseCredits = usePurchaseCredits();
  const { activeProviders, hasBankProviders, initiatePayment, processing: bankProcessing, PROVIDER_LABELS } = useBankPayment();
  const spendCredits = useSpendCredits();
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"flitt" | "bog" | "tbc">("flitt");

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [useSiteCredits, setUseSiteCredits] = useState(false); // Temporarily disabled
  const [siteCreditsAmount, setSiteCreditsAmount] = useState(0); // Temporarily disabled


  const { data: activeBundles = [] } = useActiveBundles();

  const total = getGrandTotal();
  const hasPaidItems = total > 0;
  const hasBooks = items.length > 0;
  const hasCredits = creditItems.length > 0;
  const hasCourses = courseItems.length > 0;

  // Auto-detect bundle discount
  const cartBookIds = items.map(i => i.book.id);
  const bundleMatch = calculateBundleDiscount(activeBundles, cartBookIds);
  const bundleDiscount = bundleMatch?.savings || 0;

  const getPromoDiscountAmount = () => {
    if (!promoDiscount) return 0;
    const afterBundle = total - bundleDiscount;
    if (promoDiscount.type === 'percentage') return afterBundle * (promoDiscount.value / 100);
    return Math.min(promoDiscount.value, afterBundle);
  };

  const promoDiscountAmount = getPromoDiscountAmount();
  const discountAmount = bundleDiscount + promoDiscountAmount;
  const subtotalAfterDiscount = Math.max(0, total - discountAmount);
  const finalTotal = Math.max(0, subtotalAfterDiscount - (useSiteCredits ? siteCreditsAmount : 0)); // Temporarily disabled credits

  if (!user) { navigate("/auth"); return null; }
  if (getItemCount() === 0 && !paymentComplete) { navigate("/cart"); return null; }

  const applyPromoCode = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', { _code: code });
      const promo = Array.isArray(data) ? data[0] : null;
      if (error || !promo) { setPromoError("პრომოკოდი არ მოიძებნა ან ვადაგასულია"); return; }
      setPromoDiscount({ code: promo.code, type: promo.discount_type as 'percentage' | 'fixed', value: Number(promo.discount_value) });
      setPromoInput("");
      setPromoOpen(false);
      toast.success("პრომოკოდი გააქტიურდა!");
    } catch { setPromoError("შეცდომა"); } finally { setPromoLoading(false); }
  };

  const removePromo = () => { setPromoDiscount(null); setPromoError(null); };

  const handleBankPayment = async (provider: BankProvider) => {
    try {
      if (finalTotal <= 0) {
        if (useSiteCredits && siteCreditsAmount > 0) {
          const ok = await spendCredits.mutateAsync({
            amount: siteCreditsAmount,
            reason: 'Checkout (credits only)',
            refId: `checkout_credits_only_${Date.now()}`,
          });
          if (!ok) {
            toast.error('კრედიტის ჩამოჭრა ვერ მოხერხდა');
            return;
          }
        }
        await handleFreeCheckout(useSiteCredits && siteCreditsAmount > 0);
        return;
      }

      const paymentItems = [
        ...items.filter(i => !i.book.is_free).map(i => ({
          name: i.book.title,
          price: i.book.price,
          type: "book" as const,
          book_id: i.book.id,
        })),
        ...creditItems.map(i => ({
          name: i.package.name,
          price: i.package.price_gel,
          type: "credit_package" as const,
          package_id: i.package.id,
          credits: i.package.credits,
        })),
        ...courseItems.map(i => ({
          name: i.course.title + ' (1 თვე)',
          price: i.course.monthly_price,
          type: "course" as const,
          course_id: i.course.id,
        })),
      ];
      await initiatePayment(
        provider,
        paymentItems,
        discountAmount || undefined,
        useSiteCredits ? siteCreditsAmount : undefined,
      );
      // User will be redirected to bank payment page
    } catch (err: any) {
      toast.error(err?.message || "გადახდა ვერ მოხერხდა");
    }
  };

  const handleFreeCheckout = async (skipCreditItems = false) => {
    setProcessing(true);
    try {
      for (const item of items) {
        if (item.giftInfo) {
          const { error: purchaseError } = await supabase.from('purchases').insert({ user_id: item.giftInfo.recipientId, book_id: item.book.id });
          if (purchaseError && !purchaseError.message?.includes("duplicate")) throw purchaseError;
          await supabase.from('gifts').insert({
            sender_id: user!.id,
            recipient_id: item.giftInfo.recipientId,
            gift_type: 'book',
            book_id: item.book.id,
            is_anonymous: item.giftInfo.isAnonymous,
            message: item.giftInfo.message || null,
          });
        } else {
          await createPurchase.mutateAsync(item.book.id);
        }
      }
      // Skip credit items if they were already covered by site credits
      if (!skipCreditItems) {
        for (const item of creditItems) { await purchaseCredits.mutateAsync(item.package.id); }
      }
      for (const item of courseItems) { try { await createSubscription.mutateAsync({ courseId: item.course.id, months: 1 }); } catch (e: any) { if (!e.message?.includes("duplicate")) throw e; } }
      clearCart();
      toast.success("შეძენა წარმატებით დასრულდა!");
      navigate("/my-books");
    } catch (error: any) {
      toast.error(error.message?.includes("duplicate") ? "უკვე შეძენილია" : "შეძენა ვერ მოხერხდა");
    } finally { setProcessing(false); }
  };

  const itemCount = getItemCount();

  // Success view
  if (paymentComplete) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-28 pb-20 min-h-screen">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-card border border-border rounded-2xl p-10 text-center relative overflow-hidden">
              {/* Success accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
              
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">გადახდა წარმატებულია!</h2>
              <p className="text-muted-foreground text-sm mb-6">თქვენი შეძენა წარმატებით დასრულდა.</p>
              {transactionId && (
                <div className="bg-muted/20 rounded-lg px-4 py-2.5 mb-8 inline-block">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ტრანზაქცია</span>
                  <p className="text-xs font-mono text-foreground mt-0.5">{transactionId}</p>
                </div>
              )}
              <div className="flex flex-col gap-2.5">
                <Link to="/my-books" className="flex items-center justify-center gap-2 h-12 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors">
                  <BookOpen className="w-4 h-4" /> ჩემი წიგნები
                </Link>
                <Link to="/books" className="flex items-center justify-center gap-2 h-12 bg-muted/30 text-foreground rounded-xl font-medium hover:bg-muted/50 transition-colors">
                  კატალოგი
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">გადახდა</h1>
              <p className="text-muted-foreground text-sm">{itemCount} პროდუქტი</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">კალათა</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-primary font-semibold">გადახდა</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-muted-foreground/50">დასრულება</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-6 order-2 lg:order-1">
              {hasPaidItems && finalTotal > 0 ? (
                <>
                  {hasBankProviders && (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-border">
                        <h3 className="font-semibold text-sm">გადახდის მეთოდი</h3>
                      </div>
                      <div className="p-4 grid gap-2">
                        {activeProviders.includes("flitt") && (
                          <button
                            onClick={() => setPaymentMethod("flitt")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                              paymentMethod === "flitt"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                                : "border-border hover:border-border/80"
                            }`}
                          >
                            <CreditCard className={`w-5 h-5 ${paymentMethod === "flitt" ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex-1">
                              <span className="text-sm font-medium">ბარათით გადახდა (Flitt)</span>
                              <p className="text-xs text-muted-foreground">Visa, MasterCard — ლარით</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "flitt" ? "border-primary" : "border-muted-foreground/30"}`}>
                              {paymentMethod === "flitt" && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </button>
                        )}
                        {activeProviders.includes("bog") && (
                          <button
                            onClick={() => setPaymentMethod("bog")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                              paymentMethod === "bog"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                                : "border-border hover:border-border/80"
                            }`}
                          >
                            <Building2 className={`w-5 h-5 ${paymentMethod === "bog" ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex-1">
                              <span className="text-sm font-medium">საქართველოს ბანკი</span>
                              <p className="text-xs text-muted-foreground">პირდაპირი გადახდა ლარით</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bog" ? "border-primary" : "border-muted-foreground/30"}`}>
                              {paymentMethod === "bog" && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </button>
                        )}
                        {activeProviders.includes("tbc") && (
                          <button
                            onClick={() => setPaymentMethod("tbc")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                              paymentMethod === "tbc"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                                : "border-border hover:border-border/80"
                            }`}
                          >
                            <Building2 className={`w-5 h-5 ${paymentMethod === "tbc" ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex-1">
                              <span className="text-sm font-medium">თიბისი ბანკი</span>
                              <p className="text-xs text-muted-foreground">პირდაპირი გადახდა ლარით</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "tbc" ? "border-primary" : "border-muted-foreground/30"}`}>
                              {paymentMethod === "tbc" && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                      {paymentMethod === "flitt" ? <CreditCard className="w-5 h-5 text-primary" /> : <Building2 className="w-5 h-5 text-primary" />}
                      <h3 className="font-semibold">
                        {paymentMethod === "flitt" ? "ბარათით გადახდა" : paymentMethod === "bog" ? "საქართველოს ბანკი" : "თიბისი ბანკი"}
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        გადახდის ღილაკზე დაჭერის შემდეგ გადამისამართდებით უსაფრთხო გადახდის გვერდზე.
                      </p>
                      <button
                        onClick={() => handleBankPayment(paymentMethod)}
                        disabled={bankProcessing}
                        className="w-full flex items-center justify-center gap-2.5 h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 text-base"
                      >
                        {bankProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <><Lock className="w-4 h-4" /> გადახდა — {finalTotal.toFixed(2)} ₾</>
                        )}
                      </button>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground/40 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>256-bit SSL • უსაფრთხო გადახდა</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">უფასო პროდუქტები</h3>
                  <p className="text-muted-foreground text-sm mb-6">გადახდა არ არის საჭირო</p>
                  <button onClick={() => handleFreeCheckout()} disabled={processing}
                    className="w-full flex items-center justify-center gap-2.5 h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 text-base">
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> მიიღეთ უფასოდ</>}
                  </button>
                </div>
              )}
            </div>

            {/* Right - Order summary */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-28 self-start space-y-4">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">შეკვეთა</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{itemCount} ერთეული</span>
                </div>

                {/* Items list */}
                <div className="p-5 space-y-3">
                  {hasBooks && items.map((item, idx) => (
                    <div key={`${item.book.id}-${idx}`} className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded bg-muted/20 overflow-hidden flex-shrink-0">
                        {item.book.cover_url ? (
                          <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-3 h-3 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{item.book.title}</span>
                        {item.giftInfo && (
                          <span className="text-[10px] text-purple-400 flex items-center gap-1">
                            <Gift className="w-2.5 h-2.5" /> საჩუქარი → {item.giftInfo.recipientName}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium flex-shrink-0 ${item.book.is_free ? 'text-emerald-400' : ''}`}>
                        {item.book.is_free ? 'უფასო' : `${item.book.price.toFixed(2)} ₾`}
                      </span>
                    </div>
                  ))}
                  {hasCredits && creditItems.map((item) => (
                    <div key={item.package.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Coins className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="text-sm truncate flex-1">{item.package.name}</span>
                      <span className="text-sm font-medium flex-shrink-0">{item.package.price_gel.toFixed(2)} ₾</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 border-t border-border space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ქვეჯამი</span>
                    <span>{total.toFixed(2)} ₾</span>
                  </div>
                  {bundleMatch && bundleDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-400 flex items-center gap-1.5">
                        <Percent className="w-3 h-3" />
                        {bundleMatch.bundle.title}
                        {bundleMatch.bundle.discount_type === 'percentage' && ` (-${bundleMatch.bundle.discount_value}%)`}
                      </span>
                      <span className="text-purple-400 font-medium">-{bundleDiscount.toFixed(2)} ₾</span>
                    </div>
                  )}
                  {promoDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        {promoDiscount.code}
                        {promoDiscount.type === 'percentage' && ` (-${promoDiscount.value}%)`}
                      </span>
                      <span className="text-emerald-400 font-medium">-{promoDiscountAmount.toFixed(2)} ₾</span>
                    </div>
                  )}
                  {/* Temporarily disabled credit system
                  {hasPaidItems && (
                    <div className="pt-2">
                      <SiteCreditsWidget
                        total={subtotalAfterDiscount}
                        apply={useSiteCredits}
                        appliedAmount={siteCreditsAmount}
                        onToggle={setUseSiteCredits}
                        onAmountChange={setSiteCreditsAmount}
                      />
                    </div>
                  )}
                  */}
                  {/* Temporarily disabled credit display
                  {useSiteCredits && siteCreditsAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Coins className="w-3 h-3" /> საიტის კრედიტი
                      </span>
                      <span className="text-amber-400 font-medium">-{siteCreditsAmount.toFixed(2)} ₾</span>
                    </div>
                  )}
                  */}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-semibold">ჯამი</span>
                    <div className="text-right">
                      {discountAmount > 0 && <span className="text-xs text-muted-foreground line-through mr-2">{total.toFixed(2)} ₾</span>}
                      <span className="text-xl font-bold text-primary">{finalTotal.toFixed(2)} ₾</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo code */}
              {hasPaidItems && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {promoDiscount ? (
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-sm font-semibold text-emerald-400">{promoDiscount.code}</span>
                        <span className="text-xs text-muted-foreground">
                          ({promoDiscount.type === 'percentage' ? `${promoDiscount.value}%` : `${promoDiscount.value} ₾`})
                        </span>
                      </div>
                      <button onClick={removePromo} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setPromoOpen(!promoOpen)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-sm hover:bg-muted/10 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Tag className="w-4 h-4" />
                          პრომოკოდი გაქვთ?
                        </span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${promoOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {promoOpen && (
                        <div className="px-5 pb-4 pt-1">
                          <div className="flex gap-2">
                            <input
                              type="text" value={promoInput}
                              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                              onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                              placeholder="კოდი"
                              className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-sm font-mono tracking-wider uppercase"
                            />
                            <button
                              onClick={applyPromoCode} disabled={promoLoading || !promoInput.trim()}
                              className="h-10 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                            >
                              {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "OK"}
                            </button>
                          </div>
                          {promoError && <p className="text-destructive text-xs mt-2">{promoError}</p>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Checkout;
