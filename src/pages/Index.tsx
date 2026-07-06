import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import BookCard from "@/components/books/BookCard";
import SEOHead from "@/components/SEOHead";
import CodeEditorMock from "@/components/home/CodeEditorMock";
import TechStackMarquee from "@/components/home/TechStackMarquee";
import LearningRoadmap from "@/components/home/LearningRoadmap";
import AchievementStats from "@/components/home/AchievementStats";
import { useBooks, useCategories } from "@/hooks/useBooks";
import { ArrowRight, BookOpen, Code, Rocket, Bookmark } from "lucide-react";

const Index = () => {
  const { data: allBooks = [] } = useBooks();
  const { data: categories = [] } = useCategories();
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const featuredBooks =
    allBooks.filter((b) => b.is_popular).length > 0
      ? allBooks.filter((b) => b.is_popular).slice(0, 6)
      : allBooks.slice(0, 6);

  return (
    <>
      <SEOHead
        path="/"
        description="ისწავლე პროგრამირება ქართულ ენაზე. პრემიუმ წიგნები, კურსები, AI ტუტორი და Code Playground დამწყები და გამოცდილი დეველოპერებისთვის."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CodeZero Academy",
          url: siteUrl,
          description: "პრემიუმ პროგრამირების სასწავლო პლატფორმა ქართულ ენაზე",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}/books?search={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <Atmosphere />
      <Header />
      <ChatWidget />

      {/* Hero */}
      <section className="hero relative overflow-hidden">
        <div className="container">
          <div className="hero-code-layout">
            <div className="hero-text">
              <div className="hero-mono-line">learn --language=ka --level=any</div>

              <h1 className="hero-title">
                <span className="line animate-fade-in" style={{ animationDelay: "0.1s" }}>ისწავლე</span>
                <span className="line gold animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  პროგრამირება
                </span>
                <span className="line animate-fade-in" style={{ animationDelay: "0.3s" }}>მარტივად</span>
              </h1>

              <p className="hero-subtitle animate-fade-in" style={{ animationDelay: "0.4s" }}>
                პრემიუმ ხარისხის სასწავლო მასალები, ექსკლუზიური წიგნები და პროფესიონალური კურსები დამწყები დეველოპერებისთვის.
              </p>

              <div className="hero-actions animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <Link to="/books" className="btn btn-gold btn-lg">
                  <BookOpen className="w-5 h-5" />
                  წიგნების ნახვა
                </Link>
                <Link to="/playground" className="btn btn-ghost btn-lg">
                  <Code className="w-5 h-5" />
                  Playground
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <CodeEditorMock />
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack marquee */}
      <TechStackMarquee />

      {/* Learning roadmap */}
      <LearningRoadmap />

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="section books-section">
          <div className="container">
            <div className="section-header-split">
              <div>
                <div className="eyebrow">
                  <span className="material-symbols-rounded text-[14px]">local_fire_department</span>
                  // featured
                </div>
                <h2>
                  გამორჩეული <span className="text-gold">წიგნები</span>
                </h2>
              </div>
              <Link to="/books" className="view-all">
                ყველა წიგნი
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="books-grid">
              {featuredBooks.map((book, index) => (
                <div key={book.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievement stats band */}
      <AchievementStats books={allBooks.length} categories={categories.length} />

      {/* CTA */}
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
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-bg-deep font-bold rounded-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <Bookmark className="w-5 h-5" />
              დაიწყე სწავლა
            </Link>
            <Link
              to="/playground"
              className="inline-flex items-center gap-3 px-8 py-4 bg-bg-elevated border border-border-subtle text-text-white font-semibold rounded-xl hover:bg-bg-surface hover:border-gold/30 transition-all duration-300"
            >
              <Code className="w-5 h-5" />
              Code Playground
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
