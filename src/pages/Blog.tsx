import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useBlogPosts } from "@/hooks/useBlog";
import SEOHead from "@/components/SEOHead";
import { getBlogCoverImageUrl } from "@/lib/blog-images";

const Blog = () => {
  const { data: posts = [], isLoading, isError, refetch } = useBlogPosts();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter(p => p.tags?.includes(activeTag));
  }, [posts, activeTag]);

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);
  const featuredCoverUrl = getBlogCoverImageUrl(featured?.cover_url);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ka-GE", {
      year: "numeric", month: "long", day: "numeric",
    });

  const getReadingTime = (content: string) => {
    const words = content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <>
      <SEOHead title="ბლოგი — სტატიები და სიახლეები" description="წაიკითხეთ საინტერესო სტატიები პროგრამირების, ტექნოლოგიებისა და კარიერის შესახებ" />
      <Atmosphere />
      <Header />
      <main className="page-content editorial-blog">
        <div className="container editorial-container">
          <section className="editorial-heading">
            <div className="editorial-heading-rule">
              <span>CODEZERO / JOURNAL</span>
            </div>
            <h1>ცოდნა იზრდება,<br /><em>როცა მას აზიარებ.</em></h1>
            <p>ისტორიები კოდზე, სწავლაზე და იმ ადამიანებზე, რომლებიც ტექნოლოგიას ქმნიან.</p>
            <div className="editorial-heading-foot">
              <span>საზოგადოების ჟურნალი</span>
              <span>{posts.length} სტატია</span>
            </div>
          </section>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="blog-tags-filter editorial-tags">
              <button
                className={`blog-filter-tag ${!activeTag ? 'active' : ''}`}
                onClick={() => setActiveTag(null)}
              >
                ყველა
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`blog-filter-tag ${activeTag === tag ? 'active' : ''}`}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Posts */}
          {isLoading ? (
            <div className="blog-loading">
              <div className="blog-featured-skeleton">
                <div className="skeleton-cover" style={{ height: 320 }} />
                <div className="skeleton-text" />
                <div className="skeleton-text short" />
              </div>
              {[1, 2].map(i => (
                <div key={i} className="blog-card-skeleton">
                  <div className="skeleton-cover" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text short" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="blog-empty" role="alert">
              <span className="material-symbols-rounded" style={{ fontSize: 56, color: "var(--text-muted)" }}>cloud_off</span>
              <p>სტატიების ჩატვირთვა ვერ მოხერხდა.</p>
              <button className="blog-filter-tag active" onClick={() => void refetch()} style={{ marginTop: 16 }}>
                თავიდან ცდა
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="blog-empty">
              <span className="material-symbols-rounded" style={{ fontSize: 64, color: "var(--text-muted)" }}>article</span>
              <p>{activeTag ? `"${activeTag}" ტეგით სტატიები ვერ მოიძებნა` : 'ჯერ სტატიები არ არის გამოქვეყნებული'}</p>
              {activeTag && (
                <button className="blog-filter-tag active" onClick={() => setActiveTag(null)} style={{ marginTop: 16 }}>
                  ფილტრის გასუფთავება
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <>
                <div className="editorial-section-label">
                  <span>EDITOR'S PICK</span>
                  <span>01 / {String(filteredPosts.length).padStart(2, "0")}</span>
                </div>
                <Link to={`/blog/${featured.slug}`} className="blog-featured-card editorial-featured">
                  <div className="blog-featured-image">
                    {featuredCoverUrl ? (
                      <img src={featuredCoverUrl} alt={featured.title} loading="lazy" />
                    ) : (
                      <div className="blog-featured-placeholder">
                        <span className="material-symbols-rounded">article</span>
                      </div>
                    )}
                    <div className="blog-featured-overlay" />
                  </div>
                  <div className="blog-featured-content">
                    <span className="editorial-featured-kicker">რჩეული სტატია</span>
                    {featured.tags && featured.tags.length > 0 && (
                      <div className="blog-card-tags">
                        {featured.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="blog-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="blog-featured-title">{featured.title}</h2>
                    {featured.excerpt && <p className="blog-featured-excerpt">{featured.excerpt}</p>}
                    <div className="blog-featured-meta">
                      <span>{formatDate(featured.published_at || featured.created_at)}</span>
                      <span>·</span>
                      <span>{getReadingTime(featured.content)} წთ კითხვა</span>
                      <span>·</span>
                      <span>{featured.views} ნახვა</span>
                    </div>
                    <span className="editorial-read-link">
                      წაიკითხე სტატია
                      <span className="material-symbols-rounded">arrow_forward</span>
                    </span>
                  </div>
                </Link>
                </>
              )}

              {/* Rest of Posts */}
              {rest.length > 0 && (
                <>
                <div className="editorial-section-label editorial-latest-label">
                  <span>ბოლო პუბლიკაციები</span>
                  <span>{String(rest.length).padStart(2, "0")} ARTICLES</span>
                </div>
                <div className="blog-grid editorial-grid">
                  {rest.map(post => (
                    <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card editorial-card">
                      <div className="blog-card-cover">
                        {getBlogCoverImageUrl(post.cover_url) ? (
                          <img src={getBlogCoverImageUrl(post.cover_url)!} alt={post.title} loading="lazy" />
                        ) : (
                          <span className="material-symbols-rounded" aria-hidden="true">auto_stories</span>
                        )}
                      </div>
                      <div className="blog-card-body">
                        {post.tags && post.tags.length > 0 && (
                          <div className="blog-card-tags">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="blog-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        <h2 className="blog-card-title">{post.title}</h2>
                        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                        <div className="blog-card-meta">
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                          <span>·</span>
                          <span>{getReadingTime(post.content)} წთ</span>
                          <span>·</span>
                          <span>{post.views} ნახვა</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Blog;
