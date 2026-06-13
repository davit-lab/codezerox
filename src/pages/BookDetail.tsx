import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import BookReviews from "@/components/reviews/BookReviews";
import SEOHead from "@/components/SEOHead";
import { useBook } from "@/hooks/useBooks";
import { usePurchase, useCreatePurchase } from "@/hooks/usePurchases";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useBookUpdates, useUpdatePurchases, useCreateUpdatePurchase } from "@/hooks/useBookUpdates";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Star, User, FileText, ArrowLeft, ShoppingCart, Download, BookOpen, Tag, Clock, TrendingUp, RefreshCw, CheckCircle, ChevronRight, Eye, Package, Percent } from "lucide-react";
import { useActiveBundles, BookBundle } from "@/hooks/useBookBundles";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  
  const { data: book, isLoading } = useBook(id!);
  const { data: purchase } = usePurchase(id!);
  const { data: readingProgress } = useReadingProgress(id!);
  const { data: bookUpdates = [] } = useBookUpdates(id!);
  const { data: updatePurchases = [] } = useUpdatePurchases(id!);
  
  const createPurchase = useCreatePurchase();
  const createUpdatePurchase = useCreateUpdatePurchase();
  const inCart = book ? isInCart(book.id) : false;
  const { data: activeBundles = [] } = useActiveBundles();

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book);
    toast.success("დაემატა კალათაში!");
  };

  const handleBuyNow = () => {
    if (!book) return;
    if (!inCart) {
      addItem(book);
    }
    navigate("/cart");
  };

  const handleGetFree = async () => {
    if (!user) {
      toast.error("გთხოვთ ჯერ შეხვიდეთ სისტემაში");
      navigate("/auth");
      return;
    }

    try {
      await createPurchase.mutateAsync(id!);
      toast.success("წიგნი დაემატა შენს ბიბლიოთეკას!");
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("ეს წიგნი უკვე გაქვს");
      } else {
        toast.error("წიგნის მიღება ვერ მოხერხდა");
      }
    }
  };

  const progressPercentage = readingProgress && book?.pages 
    ? Math.min(Math.round((readingProgress.last_page / book.pages) * 100), 100)
    : 0;

  if (isLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">იტვირთება...</p>
          </div>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Atmosphere />
        <Header />
        <div className="min-h-screen flex items-center justify-center flex-col gap-6">
          <div className="w-24 h-24 rounded-2xl bg-card flex items-center justify-center border border-border">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">წიგნი ვერ მოიძებნა</p>
          <Link 
            to="/books" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            წიგნებზე დაბრუნება
          </Link>
        </div>
      </>
    );
  }

  const isPurchased = !!purchase || book.is_free;

  const handleBuyUpdate = async (updateId: string, isFreeUpdate: boolean) => {
    if (!user) {
      toast.error("გთხოვთ ჯერ შეხვიდეთ სისტემაში");
      navigate("/auth");
      return;
    }
    try {
      await createUpdatePurchase.mutateAsync({ updateId, userId: user.id });
      toast.success(isFreeUpdate ? "განახლება დაემატა!" : "განახლება შეძენილია!");
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("ეს განახლება უკვე გაქვს");
      } else {
        toast.error("განახლების შეძენა ვერ მოხერხდა");
      }
    }
  };

  const isUpdatePurchased = (updateId: string) => {
    return updatePurchases.some(p => p.update_id === updateId);
  };

  return (
    <>
      <SEOHead
        title={book.title}
        description={book.description || `${book.title} - ${book.author}. პროგრამირების წიგნი CodeZero Academy-ზე.`}
        path={`/books/${id}`}
        image={book.cover_url || undefined}
        type="book"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          "name": book.title,
          "author": { "@type": "Person", "name": book.author },
          "description": book.description,
          "image": book.cover_url,
          "offers": {
            "@type": "Offer",
            "price": book.is_free ? "0" : String(book.price),
            "priceCurrency": "GEL"
          }
        }}
      />
      <Atmosphere />
      <Header />
      <ChatWidget />
      
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
            <Link to="/books" className="hover:text-primary transition-colors">წიგნები</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {book.category && (
              <>
                <Link to={`/books?category=${book.category.id}`} className="hover:text-primary transition-colors">
                  {book.category.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-foreground/60 truncate max-w-[200px]">{book.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[380px_1fr] gap-10 lg:gap-14 items-start">
            {/* Book Cover */}
            <div className="lg:sticky lg:top-32">
              <div className="relative group">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06] bg-card">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-24 h-24 text-primary/30" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {book.is_free && (
                        <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          უფასო
                        </span>
                      )}
                      {book.is_new && (
                        <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-primary/30">
                          <TrendingUp className="w-3 h-3" />
                          ახალი
                        </span>
                      )}
                      {book.is_popular && (
                        <span className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-rose-500/30">
                          <Star className="w-3 h-3" />
                          პოპულარული
                        </span>
                      )}
                    </div>

                    {/* Reading Progress Overlay */}
                    {isPurchased && progressPercentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="bg-background/90 backdrop-blur-md rounded-xl p-3 border border-white/[0.06]">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              პროგრესი
                            </span>
                            <span className="text-primary font-bold">{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-1.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats under cover on mobile */}
                <div className="grid grid-cols-3 gap-2 mt-4 lg:hidden">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-white/[0.06]">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-bold text-sm">{book.rating || '—'}</span>
                    <span className="text-muted-foreground text-[10px]">შეფასება</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-white/[0.06]">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-bold text-sm">{book.pages || '—'}</span>
                    <span className="text-muted-foreground text-[10px]">გვერდი</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-white/[0.06]">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-bold text-sm truncate w-full text-center text-[11px]">{book.rating_count || 0}</span>
                    <span className="text-muted-foreground text-[10px]">მკითხველი</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="space-y-8">
              {/* Category */}
              {book.category && (
                <Link 
                  to={`/books?category=${book.category.id}`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary hover:bg-primary/15 transition-all"
                >
                  <Tag className="w-3 h-3" />
                  {book.category.name}
                </Link>
              )}
              
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight tracking-tight">
                {book.title}
              </h1>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground text-base">{book.author}</span>
              </div>

              {/* Stats Row - Desktop */}
              <div className="hidden lg:flex items-center gap-5 py-5 border-y border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 rounded-lg border border-primary/15">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-base font-bold text-primary">{book.rating || '0'}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">({book.rating_count || 0} შეფასება)</span>
                </div>
                
                <div className="w-px h-6 bg-white/[0.06]" />
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <FileText className="w-4 h-4" />
                  <span>{book.pages || '—'} გვერდი</span>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">აღწერა</h3>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Purchase Card */}
              <div className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
                {/* Price Header */}
                <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">ფასი</span>
                  <span className={`text-3xl font-bold tracking-tight ${book.is_free ? 'text-emerald-400' : 'text-foreground'}`}>
                    {book.is_free ? 'უფასო' : `${book.price.toFixed(2)} ₾`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="p-6 space-y-3">
                  {isPurchased ? (
                    <Link 
                      to={`/read/${book.id}`} 
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                    >
                      <BookOpen className="w-5 h-5" />
                      წიგნის კითხვა
                      {progressPercentage > 0 && (
                        <span className="ml-1 px-2.5 py-0.5 bg-white/20 rounded-md text-sm font-semibold">
                          {progressPercentage}%
                        </span>
                      )}
                    </Link>
                  ) : book.is_free ? (
                    <button
                      onClick={handleGetFree}
                      disabled={createPurchase.isPending}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 text-white font-bold text-base rounded-xl hover:bg-emerald-500/90 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createPurchase.isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          უფასოდ მიღება
                        </>
                      )}
                    </button>
                    
                  ) : (
                    <>
                      <button
                        onClick={handleBuyNow}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        ახლავე ყიდვა — {book.price.toFixed(2)} ₾
                      </button>
                      
                      {!inCart ? (
                        <button
                          onClick={handleAddToCart}
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent border-2 border-white/10 text-foreground font-semibold rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.98]"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          კალათაში დამატება
                        </button>
                      ) : (
                        <Link 
                          to="/cart" 
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-primary/10 border-2 border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/15 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          კალათის ნახვა
                        </Link>
                      )}
                    </>
                  )}
                  {/* PREVIEW BUTTON HAS BEEN REMOVED FROM HERE */}
                </div>
              </div>

              {/* Bundle Discount Offers */}
              {(() => {
                const bookBundles = activeBundles.filter(b =>
                  b.items && b.items.some(i => i.book_id === book.id) && (b.items.length || 0) >= 2
                );
                
                if (bookBundles.length === 0) return null;
                
                return (
                  <div className="space-y-3">
                    {bookBundles.map(bundle => {
                      const otherBooks = (bundle.items || []).filter(i => i.book_id !== book.id);
                      const bundleTotal = (bundle.items || []).reduce((s, i) => s + (i.book?.price || 0), 0);
                      const savings = bundle.discount_type === 'percentage'
                        ? bundleTotal * (bundle.discount_value / 100)
                        : Math.min(bundle.discount_value, bundleTotal);
                      const finalPrice = Math.max(0, bundleTotal - savings);

                      const handleAddBundle = () => {
                        (bundle.items || []).forEach(item => {
                          if (item.book && !item.book.is_free && !isInCart(item.book.id)) {
                            addItem(item.book as any);
                          }
                        });
                        navigate('/cart');
                      };

                      return (
                        <div key={bundle.id} className="rounded-2xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
                          <div className="px-5 py-4 border-b border-purple-500/10 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4.5 h-4.5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-foreground">{bundle.title}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  <Percent className="w-2.5 h-2.5" />
                                  {bundle.discount_type === 'percentage' ? `${bundle.discount_value}%` : `${bundle.discount_value}₾`} ფასდაკლება
                                </span>
                              </div>
                              {bundle.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{bundle.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="p-5 space-y-3">
                            <p className="text-xs text-muted-foreground">
                              შეიძინე ეს წიგნი ერთად {otherBooks.length === 1 ? 'ამ წიგნთან' : `ამ ${otherBooks.length} წიგნთან`} და მიიღე ფასდაკლება:
                            </p>
                            <div className="space-y-2">
                              {otherBooks.map(item => (
                                <Link
                                  key={item.id}
                                  to={`/books/${item.book_id}`}
                                  className="flex items-center gap-3 p-2.5 rounded-xl bg-background/50 border border-white/[0.04] hover:border-purple-500/20 transition-colors"
                                >
                                  <div className="w-8 h-10 rounded-md bg-muted/30 overflow-hidden flex-shrink-0">
                                    {item.book?.cover_url ? (
                                      <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-3 h-3 text-muted-foreground/30" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium truncate block">{item.book?.title}</span>
                                    <span className="text-xs text-muted-foreground">{item.book?.author}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                                    {item.book?.is_free ? 'უფასო' : `${item.book?.price?.toFixed(2)} ₾`}
                                  </span>
                                </Link>
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                              <div className="text-sm">
                                <span className="text-muted-foreground line-through mr-2">{bundleTotal.toFixed(2)} ₾</span>
                                <span className="text-purple-400 font-bold text-lg">{finalPrice.toFixed(2)} ₾</span>
                                <span className="text-xs text-emerald-400 ml-2">(-{savings.toFixed(2)} ₾)</span>
                              </div>
                              <button
                                onClick={handleAddBundle}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-500/90 active:scale-[0.97] transition-all shadow-lg shadow-purple-500/20"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                ბანდლის შეძენა
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Back Link */}
              <Link 
                to="/books" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                წიგნებზე დაბრუნება
              </Link>

              {/* Book Updates Section */}
              {isPurchased && bookUpdates.length > 0 && (
                <div className="space-y-5 pt-6 border-t border-white/[0.06]">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2.5">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    ხელმისაწვდომი განახლებები
                  </h3>
                  <div className="space-y-3">
                    {bookUpdates.map(update => {
                      const purchased = isUpdatePurchased(update.id);
                      return (
                        <div key={update.id} className="rounded-xl bg-card border border-white/[0.06] p-5 hover:border-primary/20 transition-all">
                          <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/15">
                                  {update.version_name}
                                </span>
                                {update.is_free ? (
                                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-lg">
                                    უფასო
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                                    {update.price} ₾
                                  </span>
                                )}
                                {update.pages && update.pages > 0 && (
                                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {update.pages} გვ.
                                  </span>
                                )}
                              </div>
                              {update.description && (
                                <div className="mt-3 p-3.5 bg-background/50 rounded-lg border border-white/[0.04] padding-2">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">რა შედის:</p>
                                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                    {update.description}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 w-full sm:w-auto">
                              {purchased ? (
                                <Link
                                  to={`/read/${book.id}?update=${update.id}`}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-500/15 transition-all"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  წაკითხვა
                                </Link>
                              ) : (
                                <button
                                  onClick={() => handleBuyUpdate(update.id, update.is_free)}
                                  disabled={createUpdatePurchase.isPending}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                  {createUpdatePurchase.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : update.is_free ? (
                                    <>
                                      <Download className="w-4 h-4" />
                                      მიღება
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-4 h-4" />
                                      {update.price} ₾
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="pt-8">
                <BookReviews bookId={book.id} isFree={book.is_free} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BookDetail;
