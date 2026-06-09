import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useCreditPackages, useUserCredits, useHasPurchasedBook } from "@/hooks/useCredits";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Coins, BookOpen, ShoppingCart, Check, Crown, Info, Plus, Sparkles, Zap, MessageCircle, Brain } from "lucide-react";

const Credits = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: packages = [], isLoading: packagesLoading } = useCreditPackages();
  const { data: userCredits } = useUserCredits();
  const { data: hasPurchased } = useHasPurchasedBook();
  const { addCreditPackage, isCreditInCart, creditItems } = useCart();

  if (authLoading || packagesLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-32 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <p className="text-muted-foreground">იტვირთება...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!hasPurchased) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-32 pb-20 min-h-screen">
          <div className="container max-w-lg mx-auto px-4 text-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-purple-500/15 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">AI ტუტორის კრედიტები</h1>
                <p className="text-muted-foreground mb-8">
                  AI ტუტორი ხელმისაწვდომია მხოლოდ წიგნის შეძენის შემდეგ
                </p>
                <button 
                  onClick={() => navigate('/books')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5" />
                  წიგნების ნახვა
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handleAddToCart = (pkg: typeof packages[0]) => {
    addCreditPackage(pkg);
    toast.success(`${pkg.name} კალათაში დაემატა!`, {
      action: {
        label: 'კალათა',
        onClick: () => navigate('/cart'),
      },
    });
  };

  const currentCreditInCart = creditItems[0]?.package;
  const packageIcons = [Zap, Sparkles, Crown];

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="pt-24 md:pt-32 pb-32 md:pb-24 min-h-screen overflow-x-hidden">
        <div className="container relative max-w-5xl mx-auto px-3 md:px-4">
          
          {/* Hero Section */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-semibold tracking-wider uppercase mb-6">
              <Brain className="w-3.5 h-3.5" />
              AI ტუტორი
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight break-words">
              <span className="text-purple-400">AI</span> კრედიტები
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-lg max-w-lg mx-auto mb-8 leading-relaxed break-words">
              შეიძინე კრედიტები და ისაუბრე AI ტუტორთან — პერსონალიზებული სწავლა ნებისმიერ დროს
            </p>
            
            {/* Balance Card */}
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-purple-500/15 rounded-2xl blur-xl opacity-60" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl px-6 md:px-10 py-4 md:py-6 flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-3xl md:text-5xl font-bold text-purple-400 tabular-nums">{userCredits?.credits ?? 0}</div>
                  <div className="text-muted-foreground text-xs md:text-sm mt-0.5">შენი კრედიტები</div>
                </div>
              </div>
            </div>

          </div>

          {/* Features Row */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-14">
            {[
              { icon: MessageCircle, label: 'უსაზღვრო საუბარი', desc: 'AI ტუტორთან' },
              { icon: Zap, label: 'მყისიერი პასუხი', desc: 'წამებში' },
              { icon: Brain, label: 'პერსონალიზებული', desc: 'სწავლა' },
            ].map((f, i) => (
              <div key={i} className="text-center p-3 md:p-5 rounded-xl bg-card/50 border border-border/50">
                <f.icon className="w-5 h-5 md:w-6 md:h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xs md:text-sm font-medium text-foreground">{f.label}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {packages.map((pkg, index) => {
              const isInCart = isCreditInCart(pkg.id);
              const PackageIcon = packageIcons[index] || Coins;
              
              return (
                <div 
                  key={pkg.id} 
                  className={`relative group ${pkg.is_popular ? 'lg:-mt-3 lg:mb-3' : ''}`}
                >
                  {/* Popular Badge */}
                  {pkg.is_popular && (
                    <>
                      <div className="absolute -inset-[1px] bg-primary/40 rounded-2xl" />
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-4 py-1 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider shadow-lg shadow-primary/30">
                          პოპულარული
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className={`relative h-full bg-card/80 backdrop-blur-sm border rounded-2xl p-5 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    pkg.is_popular 
                      ? 'border-transparent shadow-lg shadow-primary/10' 
                      : isInCart 
                        ? 'border-emerald-500/50 shadow-emerald-500/10' 
                        : 'border-border hover:border-purple-500/30 hover:shadow-purple-500/5'
                  }`}>
                    
                    {/* Icon + Name */}
                    <div className="text-center mb-6 pt-2">
                      <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        pkg.is_popular 
                          ? 'bg-primary/10' 
                          : 'bg-purple-500/10'
                      }`}>
                        <PackageIcon className={`w-7 h-7 md:w-8 md:h-8 ${pkg.is_popular ? 'text-primary' : 'text-purple-400'}`} />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{pkg.name}</h3>
                      <p className="text-muted-foreground text-xs md:text-sm">{pkg.description}</p>
                    </div>
                    
                    {/* Credits Amount */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1.5">
                        <span className={`text-4xl md:text-5xl font-bold tabular-nums ${pkg.is_popular ? 'text-primary' : 'text-purple-400'}`}>
                          {pkg.credits}
                        </span>
                        <span className="text-muted-foreground text-sm">კრედიტი</span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-border/50">
                      <div className="text-2xl md:text-3xl font-bold text-foreground">{pkg.price_gel}₾</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {(pkg.price_gel / pkg.credits).toFixed(2)}₾ / კრედიტი
                      </div>
                    </div>
                    
                    {/* Action */}
                    {isInCart ? (
                      <button 
                        onClick={() => navigate('/cart')}
                        className="w-full flex items-center justify-center gap-2 py-3.5 md:py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl hover:bg-emerald-500/15 transition-all text-sm md:text-base"
                      >
                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                        კალათაშია
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(pkg)}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 md:py-4 font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base ${
                          pkg.is_popular 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' 
                            : 'bg-accent border border-border text-foreground hover:border-purple-500/30'
                        }`}
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        კალათაში დამატება
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-card/50 border border-border/50 rounded-full text-muted-foreground text-sm">
              <Info className="w-4 h-4 text-purple-400" />
              1 კრედიტი = 1 შეტყობინება AI ტუტორთან
            </div>
          </div>

          {/* Cart Reminder - Fixed Bottom Bar */}
          {currentCreditInCart && (
            <div className="fixed bottom-4 left-3 right-3 md:left-auto md:right-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-50 max-w-lg mx-auto">
              <div className="relative">
                <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg opacity-75" />
                <div className="relative bg-card/95 backdrop-blur-md border border-primary/40 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-2xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-semibold truncate text-sm md:text-base">{currentCreditInCart.name}</div>
                    <div className="text-muted-foreground text-xs md:text-sm">
                      {currentCreditInCart.credits} კრედიტი • {currentCreditInCart.price_gel}₾
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 flex-shrink-0 text-sm md:text-base"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">კალათა</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </>
  );
};

export default Credits;
