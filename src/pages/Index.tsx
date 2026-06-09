import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
// Temporarily disabled AI Tutor Widget
// import AITutorWidget from "@/components/ai/AITutorWidget";
import BookCard from "@/components/books/BookCard";
import SEOHead from "@/components/SEOHead";
import { useBooks, useCategories } from "@/hooks/useBooks";
import { CircleDot, Flame, ArrowRight, BookOpen, Grid3X3, Star, Code, Rocket, Bookmark } from "lucide-react";

const Index = () => {
  const { data: allBooks = [] } = useBooks();
  const { data: categories = [] } = useCategories();
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  // Show popular books first, fallback to all books
  const featuredBooks = allBooks.filter((b) => b.is_popular).length > 0 ?
  allBooks.filter((b) => b.is_popular).slice(0, 6) :
  allBooks.slice(0, 6);

  return (
    <>
      <SEOHead
        path="/"
        description="ისწავლე პროგრამირება ქართულ ენაზე. პრემიუმ წიგნები, კურსები, AI ტუტორი და Code Playground დამწყები და გამოცდილი დეველოპერებისთვის."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CodeZero Academy",
          "url": siteUrl,
          "description": "პრემიუმ პროგრამირების სასწავლო პლატფორმა ქართულ ენაზე",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/books?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }} />
      
      <Atmosphere />
      <Header />
      <ChatWidget />
      {/* Temporarily disabled AI Tutor Widget */}
      {/* <AITutorWidget /> */}
      
      {/* Hero Section */}
      <section className="hero relative overflow-hidden">
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
            {/* Hero Title - removed badge */}
              
              {/* Title with enhanced animation */}
              <h1 className="hero-title">
                <span className="line animate-fade-in" style={{ animationDelay: '0.1s' }}>ისწავლე</span>
                <span className="line gold animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  პროგრამირება
                </span>
                <span className="line animate-fade-in" style={{ animationDelay: '0.3s' }}>მარტივად</span>
              </h1>
              
              <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.4s' }}>
                პრემიუმ ხარისხის სასწავლო მასალები, ექსკლუზიური წიგნები და პროფესიონალური კურსები დამწყები დეველოპერებისთვის.
              </p>
              
              {/* Enhanced CTA Buttons */}
              <div className="hero-actions animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Link
                  to="/books"
                  className="btn btn-gold btn-lg group relative overflow-hidden">
                  
                  <span className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <BookOpen className="w-5 h-5" />
                  წიგნების ნახვა
                </Link>
                <Link
                  to="/categories"
                  className="btn btn-ghost btn-lg group">
                  
                  <Grid3X3 className="w-5 h-5 group-hover:text-gold transition-colors duration-300" />
                  კატეგორიები
                </Link>
              </div>
              
              {/* Enhanced Stats with Icons */}
              <div className="hero-stats animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="hero-stat group hover:scale-105 transition-transform duration-300">
                  <div className="hero-stat-value flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold opacity-70" />
                    {allBooks.length}+
                  </div>
                  <div className="hero-stat-label">წიგნები</div>
                </div>
                <div className="hero-stat group hover:scale-105 transition-transform duration-300">
                  <div className="hero-stat-value flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-purple-400 opacity-70" />
                    {categories.length}
                  </div>
                  <div className="hero-stat-label">კატეგორიები</div>
                </div>
                





                
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="hero-visual">
              <div className="hero-card-stack">
                {[0, 1, 2].map((index) => {
                  const book = featuredBooks[index];
                  const placeholders = [
                  { title: 'React.js საფუძვლები', author: 'CodeZero Academy', badge: 'ახალი', price: '29.99 ₾', rating: 4.9, bgColor: 'rgba(95,19,202,0.15)' },
                  { title: 'TypeScript კურსი', author: 'CodeZero Academy', badge: 'პოპულარული', price: '39.99 ₾', rating: 4.8, bgColor: 'rgba(167,139,250,0.15)' },
                  { title: 'Node.js Backend', author: 'CodeZero Academy', badge: 'უფასო', price: 'უფასო', rating: 4.7, bgColor: 'rgba(52,211,153,0.15)', isFree: true }];

                  const placeholder = placeholders[index];

                  if (book) {
                    return (
                      <div
                        key={book.id}
                        className={`hero-card hero-card-${index + 1} hover:scale-105 transition-all duration-500`}
                        style={{ animationDelay: `${index * 0.15}s` }}>
                        
                        <div
                          className="hero-card-image"
                          style={{
                            background: book.cover_url ?
                            `url(${book.cover_url}) center/cover no-repeat` :
                            `var(--bg-elevated)`
                          }} />
                        
                        <div className="hero-card-content">
                          <span className="hero-card-badge">
                            {book.is_new ? 'ახალი' : book.is_popular ? 'პოპულარული' : book.is_free ? 'უფასო' : 'წიგნი'}
                          </span>
                          <h3 className="hero-card-title">{book.title}</h3>
                          <p className="hero-card-author">{book.author}</p>
                        </div>
                        <div className="hero-card-footer">
                          <span className="hero-card-price" style={book.is_free || book.price === 0 ? { color: 'var(--emerald)' } : undefined}>
                            {book.is_free || book.price === 0 ? 'უფასო' : `${book.price} ₾`}
                          </span>
                          <div className="hero-card-rating">
                            <Star className="w-4 h-4 fill-gold text-gold" />
                            {book.rating || 0}
                          </div>
                        </div>
                      </div>);

                  }

                  return (
                    <div
                      key={`placeholder-${index}`}
                      className={`hero-card hero-card-${index + 1} hover:scale-105 transition-all duration-500`}>
                      
                      <div className="hero-card-image" style={{ background: `var(--bg-elevated)` }} />
                      <div className="hero-card-content">
                        <span className="hero-card-badge">{placeholder.badge}</span>
                        <h3 className="hero-card-title">{placeholder.title}</h3>
                        <p className="hero-card-author">{placeholder.author}</p>
                      </div>
                      <div className="hero-card-footer">
                        <span className="hero-card-price" style={placeholder.isFree ? { color: 'var(--emerald)' } : undefined}>
                          {placeholder.price}
                        </span>
                        <div className="hero-card-rating">
                          <Star className="w-4 h-4 fill-gold text-gold" />
                          {placeholder.rating}
                        </div>
                      </div>
                    </div>);

                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - removed */}

      {/* Featured Books Section */}
      {featuredBooks.length > 0 &&
      <section className="section books-section relative">
          
          <div className="container relative">
            <div className="section-header">
              <div className="section-label group hover:scale-105 transition-transform duration-300">
                პოპულარული
              </div>
              <h2 className="section-title">
                გამორჩეული <span className="accent">წიგნები</span>
              </h2>
              <p className="section-subtitle">ყველაზე მოთხოვნადი სასწავლო რესურსები</p>
            </div>
            <div className="books-grid">
              {featuredBooks.map((book, index) =>
            <div
              key={book.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}>
              
                  <BookCard book={book} />
                </div>
            )}
            </div>
            <div className="text-center mt-12">
              <Link
              to="/books"
              className="inline-flex items-center gap-3 px-8 py-4 bg-bg-elevated border border-border-subtle text-text-white font-semibold rounded-xl hover:bg-bg-surface hover:border-gold/30 transition-all duration-300 group">
              
                ყველა წიგნის ნახვა
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>
      }

      {/* Categories Section */}
      {categories.length > 0 &&
      <section className="section relative">
          <div className="container">
            <div className="section-header">
              <div className="section-label">
                <Grid3X3 className="w-4 h-4" />
                კატეგორიები
              </div>
              <h2 className="section-title">
                აირჩიე შენი <span className="accent">გზა</span>
              </h2>
              <p className="section-subtitle">აღმოაჩინე სწავლის მიმართულებები</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((cat, index) =>
            <Link
              key={cat.id}
              to={`/books?category=${cat.id}`}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 transition-all duration-300 hover:border-gold/30 hover:-translate-y-1 animate-fade-in"
              style={{ textDecoration: 'none', animationDelay: `${index * 0.1}s` }}>
              
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-rounded text-2xl text-gold">
                        {cat.icon || 'folder'}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
                      {cat.name}
                    </h3>
                    
                    {/* Description */}
                    {cat.description &&
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {cat.description}
                      </p>
                }
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium text-foreground">{cat.book_count}</span>
                        წიგნი
                      </span>
                      
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-background transition-all duration-300">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </Link>
            )}
            </div>
          </div>
        </section>
      }

      {/* CTA Section - New! */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/[0.02]" />
        
        <div className="container relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            დაიწყე ახლავე
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-text-white mb-6">
            მზად ხარ <span className="text-gold">პროგრამისტი</span> გახდე?
          </h2>
          
          <p className="text-text-muted text-lg max-w-xl mx-auto mb-10">
            შემოგვიერთდი ათასობით სტუდენტს და დაიწყე პროგრამირების სწავლა დღესვე
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/books"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-bg-deep font-bold rounded-xl hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300">
              
              <Bookmark className="w-5 h-5" />
              დაიწყე სწავლა
            </Link>
            <Link
              to="/playground"
              className="inline-flex items-center gap-3 px-8 py-4 bg-bg-elevated border border-border-subtle text-text-white font-semibold rounded-xl hover:bg-bg-surface hover:border-gold/30 transition-all duration-300">
              
              <Code className="w-5 h-5" />
              Code Playground
            </Link>
          </div>
        </div>
      </section>
    </>);

};

export default Index;