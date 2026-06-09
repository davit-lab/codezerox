import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import SEOHead from "@/components/SEOHead";
import { useCategories } from "@/hooks/useBooks";
import heroBgDefault from "@/assets/categories-hero-bg.jpg";
import { useHeroBanner } from "@/hooks/useHeroBanners";

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { data: bannerData } = useHeroBanner("categories");
  const heroBg = bannerData?.image_url || heroBgDefault;
  const totalBooks = categories.reduce((acc, cat) => acc + (cat.book_count || 0), 0);

  return (
    <>
      <SEOHead
        title="კატეგორიები"
        description="აირჩიე პროგრამირების მიმართულება: Frontend, Backend, Mobile, DevOps და სხვა კატეგორიები."
        path="/categories"
      />
      <Atmosphere />
      <Header />
      <ChatWidget />
      
      <main className="page-content">
        <div className="container">

          {/* Hero */}
          <section className="lb2-hero" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="lb2-hero-overlay" />
            <div className="lb2-hero-content">
              <span className="section-badge">
                <span className="material-symbols-rounded">category</span>
                კატეგორიები
              </span>
              <h1 className="lb2-hero-title">აირჩიე შენი მიმართულება</h1>
              <p className="lb2-hero-subtitle">იპოვე შენთვის სასურველი სასწავლო გზა პროგრამირების სამყაროში</p>
              <div className="lb2-hero-stats">
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{categories.length}</span>
                  <span className="lb2-hero-stat-label">კატეგორია</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{totalBooks}</span>
                  <span className="lb2-hero-stat-label">სულ წიგნი</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">24/7</span>
                  <span className="lb2-hero-stat-label">წვდომა</span>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          {isLoading ? (
            <div className="lb2-loading">
              <div className="lb2-spinner" />
              <p>იტვირთება...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="lb2-empty">
              <span className="material-symbols-rounded" style={{ fontSize: 56 }}>folder_off</span>
              <p>კატეგორიები ჯერ არ არის დამატებული</p>
            </div>
          ) : (
            <div className="cat-grid">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/books?category=${category.id}`}
                  className="cat-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Icon area */}
                  <div className="cat-card-top">
                    <div className="cat-card-icon-box">
                      <span className="material-symbols-rounded">{category.icon || 'folder'}</span>
                    </div>
                    <div className="cat-card-book-count">
                      {category.book_count || 0}
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="cat-card-name">{category.name}</h3>
                  {category.description && (
                    <p className="cat-card-desc">{category.description}</p>
                  )}

                  {/* Bottom */}
                  <div className="cat-card-bottom">
                    <span className="cat-card-link-text">წიგნების ნახვა</span>
                    <span className="material-symbols-rounded cat-card-arrow">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Categories;
