import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import BookCard from "@/components/books/BookCard";
import SEOHead from "@/components/SEOHead";
import { useBooks, useCategories } from "@/hooks/useBooks";
import { useActiveBundles, BookBundle } from "@/hooks/useBookBundles";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { Package, Percent, ArrowRight, ShoppingCart } from "lucide-react";

const BundleBanner = ({ bundle }: { bundle: BookBundle }) => {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();

  const items = bundle.items || [];
  const totalPrice = items.reduce((s, i) => s + (i.book?.price || 0), 0);
  const discount = bundle.discount_type === 'percentage'
    ? totalPrice * (bundle.discount_value / 100)
    : Math.min(bundle.discount_value, totalPrice);
  const finalPrice = Math.max(0, totalPrice - discount);

  const handleAddAll = () => {
    items.forEach(item => {
      if (item.book && !item.book.is_free && !isInCart(item.book.id)) {
        addItem(item.book as any);
      }
    });
    navigate('/cart');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-base text-foreground">{bundle.title}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Percent className="w-3 h-3" />
              {bundle.discount_type === 'percentage' ? `${bundle.discount_value}%` : `${bundle.discount_value}₾`} ფასდაკლება
            </span>
          </div>
          {bundle.description && (
            <p className="text-xs text-muted-foreground mb-2">{bundle.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex -space-x-2">
              {items.slice(0, 5).map(item => (
                <div key={item.id} className="w-8 h-10 rounded border-2 border-background bg-muted/30 overflow-hidden" title={item.book?.title}>
                  {item.book?.cover_url ? (
                    <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">წიგნი</div>
                  )}
                </div>
              ))}
              {items.length > 5 && (
                <div className="w-8 h-10 rounded border-2 border-background bg-muted/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  +{items.length - 5}
                </div>
              )}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground line-through mr-2">{totalPrice.toFixed(2)}₾</span>
              <span className="text-primary font-bold text-base">{finalPrice.toFixed(2)}₾</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleAddAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all flex-shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          ყველას დამატება
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const Books = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price_asc" | "price_desc">("newest");
  const [showFree, setShowFree] = useState(false);

  const { data: books = [], isLoading } = useBooks({
    search: searchQuery,
    categoryId: categoryFilter || undefined,
    isFree: showFree || undefined,
    sortBy,
  });
  
  const { data: categories = [] } = useCategories();
  const { data: activeBundles = [] } = useActiveBundles();

  return (
    <>
      <SEOHead
        title="პროგრამირების წიგნები"
        description="აღმოაჩინე პრემიუმ პროგრამირების წიგნები ქართულ ენაზე. React, TypeScript, Node.js, Python და სხვა ტექნოლოგიები."
        path="/books"
      />
      <Atmosphere />
      <Header />
      <ChatWidget />
      
      <main className="pt-36 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 -z-10 bg-gold/5 blur-3xl" />
            
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-accent border border-gold/20 rounded-full text-xs font-semibold tracking-widest uppercase text-gold mb-6">
              <span className="material-symbols-rounded text-sm">library_books</span>
              ბიბლიოთეკა
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-5 tracking-tight break-words">
              ყველა <span className="text-gold">წიგნი</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed break-words">
              აღმოაჩინე საუკეთესო პროგრამირების რესურსები დეველოპერებისთვის
            </p>
          </div>

          {/* Category Pills */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCategoryFilter("")}
                className={`group relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  !categoryFilter 
                    ? 'bg-gold text-background shadow-lg shadow-gold/25' 
                    : 'bg-card border border-border/50 text-muted-foreground hover:border-gold/30 hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-base">apps</span>
                  ყველა
                </span>
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`group relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    categoryFilter === cat.id 
                      ? 'bg-gold text-background shadow-lg shadow-gold/25' 
                      : 'bg-card border border-border/50 text-muted-foreground hover:border-gold/30 hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-base">{cat.icon || 'folder'}</span>
                    {cat.name}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      categoryFilter === cat.id 
                        ? 'bg-background/20 text-background' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {cat.book_count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all cursor-pointer"
                >
                  <option value="newest">უახლესი</option>
                  <option value="popular">პოპულარული</option>
                  <option value="price_asc">ფასი: დაბალი</option>
                  <option value="price_desc">ფასი: მაღალი</option>
                </select>
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg pointer-events-none">
                  sort
                </span>
                <span className="material-symbols-rounded absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Free Only Toggle */}
              <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 cursor-pointer hover:border-gold/30 transition-all group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showFree}
                    onChange={(e) => setShowFree(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border/50 rounded-full peer-checked:bg-gold transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-foreground rounded-full shadow transition-transform peer-checked:translate-x-4 peer-checked:bg-background" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  მხოლოდ უფასო
                </span>
              </label>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              <span className="text-gold font-semibold">{books.length}</span> წიგნი ნაპოვნია
            </div>
          </div>

          {/* Active Bundle Discounts */}
          {activeBundles.length > 0 && (
            <div className="space-y-4 mb-10">
              {activeBundles.filter(b => (b.items?.length || 0) >= 2).map(bundle => (
                <BundleBanner key={bundle.id} bundle={bundle} />
              ))}
            </div>
          )}

          {/* Books Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-gold" />
                <span className="material-symbols-rounded absolute inset-0 flex items-center justify-center text-gold text-2xl">
                  menu_book
                </span>
              </div>
              <p className="text-muted-foreground animate-pulse">იტვირთება...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center">
                <span className="material-symbols-rounded text-5xl text-muted-foreground">search_off</span>
              </div>
              <div>
                <p className="text-lg text-foreground font-medium mb-1">წიგნები ვერ მოიძებნა</p>
                <p className="text-sm text-muted-foreground">სცადეთ სხვა ფილტრები ან კატეგორია</p>
              </div>
              <button
                onClick={() => {
                  setCategoryFilter("");
                  setShowFree(false);
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
              >
                ფილტრების გასუფთავება
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Books;