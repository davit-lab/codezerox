import { Link, useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShoppingCart, Trash2, X, BookOpen, Coins, ArrowRight, Gift, ShieldCheck, Sparkles } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, creditItems, removeItem, removeCreditPackage, clearCart, getTotal, getCreditTotal, getGrandTotal, getItemCount } = useCart();

  const handleCheckout = () => {
    if (!user) {
      toast.error("გთხოვთ შეხვიდეთ სისტემაში შეძენისთვის");
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };

  const totalItems = getItemCount();
  const hasItems = items.length > 0;
  const hasCredits = creditItems.length > 0;

  return (
    <>
      <Atmosphere />
      <Header />
      {/* <ChatWidget /> */}
      <main className="pt-28 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">შეკვეთა</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">კალათა</h1>
              {totalItems > 0 && (
                <p className="text-muted-foreground text-sm mt-2">{totalItems} პროდუქტი</p>
              )}
            </div>
            {totalItems > 0 && (
              <button 
                onClick={clearCart}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">გასუფთავება</span>
              </button>
            )}
          </div>

          {totalItems === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold mb-2">კალათა ცარიელია</h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
                დაათვალიერე კოლექცია და აღმოაჩინე საინტერესო პროდუქტები
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  to="/books" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-muted/50 text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  წიგნები
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              <div className="space-y-6">
                {/* Books */}
                {hasItems && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">წიგნები</span>
                      <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{items.length}</span>
                    </div>
                    <div className="divide-y divide-border">
                      {items.map((item, idx) => (
                        <div key={`${item.book.id}-${idx}`} className="flex items-center gap-4 p-4 sm:p-5 hover:bg-muted/5 transition-colors">
                          <Link to={`/books/${item.book.id}`} className="flex-shrink-0">
                            <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-lg overflow-hidden bg-muted/20">
                              {item.book.cover_url ? (
                                <img src={item.book.cover_url} alt={item.book.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/books/${item.book.id}`} className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-1">
                              {item.book.title}
                            </Link>
                            <p className="text-muted-foreground text-xs mt-0.5">{item.book.author}</p>
                            {item.giftInfo && (
                              <p className="text-purple-400 text-xs mt-1 flex items-center gap-1">
                                <Gift className="w-3 h-3" /> საჩუქარი → {item.giftInfo.recipientName}
                              </p>
                            )}
                            {!item.giftInfo && item.book.pages && (
                              <p className="text-muted-foreground/60 text-xs mt-1">{item.book.pages} გვერდი</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {item.book.is_free ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-lg">
                                <Gift className="w-3 h-3" /> უფასო
                              </span>
                            ) : (
                              <span className="font-bold text-base">{item.book.price.toFixed(2)} ₾</span>
                            )}
                          </div>
                          <button 
                            onClick={() => removeItem(item.book.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credits */}
                {hasCredits && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                      <Coins className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-sm">AI კრედიტები</span>
                    </div>
                    <div className="divide-y divide-border">
                      {creditItems.map((item) => (
                        <div key={item.package.id} className="flex items-center gap-4 p-4 sm:p-5 hover:bg-muted/5 transition-colors">
                          <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base">{item.package.name}</div>
                            <p className="text-purple-400/70 text-xs mt-0.5">{item.package.credits} კრედიტი</p>
                          </div>
                          <span className="font-bold text-base flex-shrink-0">{item.package.price_gel.toFixed(2)} ₾</span>
                          <button 
                            onClick={() => removeCreditPackage(item.package.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Summary */}
              <div className="lg:sticky lg:top-28 self-start">
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="font-bold text-lg">შეკვეთის ჯამი</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      {hasItems && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">წიგნები × {items.length}</span>
                          <span>{getTotal().toFixed(2)} ₾</span>
                        </div>
                      )}
                      {hasCredits && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">AI კრედიტები</span>
                          <span>{getCreditTotal().toFixed(2)} ₾</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">ჯამი</span>
                        <span className="text-2xl font-bold text-primary">{getGrandTotal().toFixed(2)} ₾</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center gap-2.5 h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-base mt-2"
                    >
                      გადახდაზე გადასვლა
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground/50 text-xs pt-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>უსაფრთხო გადახდა</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link to="/books" className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border text-sm font-medium rounded-xl hover:bg-muted/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    წიგნები
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Cart;
