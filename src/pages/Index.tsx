import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import BookCard from "@/components/books/BookCard";
import SEOHead from "@/components/SEOHead";
import { useBooks, useCategories } from "@/hooks/useBooks";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { data: allBooks = [] } = useBooks();
  const { data: categories = [] } = useCategories();
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

  // Popular books first, otherwise the newest ones
  const popular = allBooks.filter((b) => b.is_popular);
  const featuredBooks = (popular.length > 0 ? popular : allBooks).slice(0, 6);
  const shelf = featuredBooks.filter((b) => b.cover_url).slice(0, 3);
  const freeCount = allBooks.filter((b) => b.is_free || b.price === 0).length;

  return (
    <>
      <SEOHead
        path="/"
        description="ისწავლე პროგრამირება ქართულ ენაზე. პრემიუმ წიგნები, კურსები და Code Playground დამწყები და გამოცდილი დეველოპერებისთვის."
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

      <section className="home-hero">
        <div className="container">
          <div className="home-hero__grid">
            <div>
              <p className="home-hero__eyebrow">
                <strong>CodeZero Academy</strong> — პროგრამირება ქართულად
              </p>
              <h1 className="home-hero__title">
                ისწავლე პროგრამირება შენს ენაზე, შენი ტემპით
              </h1>
              <p className="home-hero__lead">
                წიგნები, კურსები და ონლაინ კოდის ედიტორი — Java-დან და Python-იდან
                React-მდე. დაიწყე ნულიდან ან გააღრმავე ის, რაც უკვე იცი.
              </p>
              <div className="home-hero__actions">
                <Link to="/books" className="btn btn-gold btn-lg">
                  წიგნების ნახვა
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/playground" className="btn btn-ghost btn-lg">
                  კოდის ედიტორი
                </Link>
              </div>

              {allBooks.length > 0 && (
                <div className="home-hero__facts">
                  <div><b>{allBooks.length}</b>წიგნი</div>
                  <div><b>{categories.length}</b>მიმართულება</div>
                  {freeCount > 0 && <div><b>{freeCount}</b>უფასო</div>}
                </div>
              )}
            </div>

            {shelf.length === 3 && (
              <div className="home-hero__shelf" aria-hidden="true">
                {shelf.map((book) => (
                  <Link key={book.id} to={`/books/${book.id}`} tabIndex={-1}>
                    <img src={book.cover_url!} alt="" loading="eager" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {featuredBooks.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="row-head">
              <div>
                <h2 className="section-title">გამორჩეული წიგნები</h2>
                <p className="section-subtitle">რასაც სტუდენტები ყველაზე ხშირად კითხულობენ</p>
              </div>
              <Link to="/books" className="row-head__link">
                ყველა წიგნი <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="home-books">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="row-head">
              <div>
                <h2 className="section-title">მიმართულებები</h2>
                <p className="section-subtitle">აირჩიე, საიდან დაიწყებ</p>
              </div>
              <Link to="/books" className="row-head__link">
                ყველა წიგნი <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="cat-list">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} to={`/books?category=${cat.id}`}>
                  <span className="material-symbols-rounded">{cat.icon || 'folder'}</span>
                  <span className="cat-list__name">
                    {cat.name}
                    {cat.description && <span className="cat-list__desc">{cat.description}</span>}
                  </span>
                  <span className="cat-list__count">{cat.book_count} წიგნი</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container">
        <div className="home-cta">
          <div>
            <h2>არ იცი, საიდან დაიწყო?</h2>
            <p>სცადე კოდის ედიტორი ბრაუზერში — რეგისტრაციის გარეშე.</p>
          </div>
          <div className="home-hero__actions">
            <Link to="/playground" className="btn btn-gold">გახსენი ედიტორი</Link>
            <Link to="/books" className="btn btn-ghost">ნახე წიგნები</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
