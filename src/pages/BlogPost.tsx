import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useBlogPost, useBlogComments, useAddBlogComment, useDeleteBlogComment } from "@/hooks/useBlog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MarkdownRenderer from "@/components/ai/MarkdownRenderer";

const getReadingTime = (content: string) => {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  const { data: post, isLoading } = useBlogPost(slug!);
  const { data: comments = [] } = useBlogComments(post?.id || "");
  const addComment = useAddBlogComment();
  const deleteComment = useDeleteBlogComment();
  const [commentText, setCommentText] = useState("");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ka-GE", { year: "numeric", month: "long", day: "numeric" });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!user) { toast.error("კომენტარისთვის გაიარეთ ავტორიზაცია"); return; }
    addComment.mutate({ postId: post!.id, content: commentText.trim() }, {
      onSuccess: () => { setCommentText(""); toast.success("კომენტარი დაემატა"); },
      onError: () => toast.error("შეცდომა კომენტარის დამატებისას"),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate({ id: commentId, postId: post!.id }, {
      onSuccess: () => toast.success("კომენტარი წაიშალა"),
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("ლინკი დაკოპირდა!");
    } catch {
      toast.error("ვერ დაკოპირდა");
    }
  };

  if (isLoading) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="page-content">
          <div className="container">
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
              <div style={{ width: '40%', height: 16, background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 32 }} />
              <div style={{ width: '80%', height: 48, background: 'var(--bg-elevated)', borderRadius: 12, marginBottom: 16 }} />
              <div style={{ width: '30%', height: 16, background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 40 }} />
              <div style={{ width: '100%', height: 400, background: 'var(--bg-elevated)', borderRadius: 20 }} />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="page-content">
          <div className="container" style={{ textAlign: "center", padding: "120px 20px" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 64, color: "var(--text-muted)" }}>article</span>
            <p style={{ color: "var(--text-muted)", marginTop: 16 }}>სტატია ვერ მოიძებნა</p>
            <Link to="/blog" className="btn btn-gold" style={{ marginTop: 16 }}>ბლოგზე დაბრუნება</Link>
          </div>
        </main>
      </>
    );
  }

  const readingTime = getReadingTime(post.content);

  return (
    <>
      <SEOHead
        title={`${post.title} — ბლოგი`}
        description={post.excerpt || post.title}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt || post.title,
          "datePublished": post.published_at || post.created_at,
          "dateModified": post.updated_at || post.created_at,
          "author": {
            "@type": "Organization",
            "name": "CodeZero Academy"
          },
          "publisher": {
            "@type": "Organization",
            "name": "CodeZero Academy",
            "logo": {
              "@type": "ImageObject",
              "url": "https://read-connect-zone.lovable.app/favicon.png"
            }
          },
          "image": post.cover_url || "https://read-connect-zone.lovable.app/favicon.png",
          "url": `https://read-connect-zone.lovable.app/blog/${post.id}`
        }}
      />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container">
          <article className="blog-article">
            {/* Breadcrumb */}
            <nav className="blog-breadcrumb">
              <Link to="/blog">
                <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>home</span>
                ბლოგი
              </Link>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_right</span>
              <span>{post.title}</span>
            </nav>

            {/* Header */}
            <header className="blog-article-header">
              {post.tags && post.tags.length > 0 && (
                <div className="blog-card-tags" style={{ justifyContent: 'center' }}>
                  {post.tags.map(tag => <span key={tag} className="blog-tag">{tag}</span>)}
                </div>
              )}
              <h1 className="blog-article-title">{post.title}</h1>
              <div className="blog-article-meta">
                <span>
                  <span className="material-symbols-rounded" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>calendar_today</span>
                  {formatDate(post.published_at || post.created_at)}
                </span>
                <span>·</span>
                <span>
                  <span className="material-symbols-rounded" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>schedule</span>
                  {readingTime} წთ წასაკითხი
                </span>
                <span>·</span>
                <span>
                  <span className="material-symbols-rounded" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>visibility</span>
                  {post.views} ნახვა
                </span>
              </div>
            </header>

            {/* Cover */}
            {post.cover_url && (
              <div className="blog-article-cover">
                <img src={post.cover_url} alt={post.title} />
              </div>
            )}

            {/* Content */}
            <div className="blog-article-content">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Share & Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              margin: '48px 0',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>მოგეწონა?</span>
              <button onClick={handleShare} className="btn btn-ghost" style={{ gap: 6 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>share</span>
                გაზიარება
              </button>
              <Link to="/blog" className="btn btn-ghost" style={{ gap: 6 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
                სხვა სტატიები
              </Link>
            </div>

            {/* Comments section */}
            <section className="blog-comments-section">
              <h2 className="blog-comments-title">
                <span className="material-symbols-rounded">forum</span>
                კომენტარები ({comments.length})
              </h2>

              {/* Add comment */}
              {user ? (
                <div className="blog-comment-form">
                  <textarea
                    className="blog-comment-input"
                    placeholder="დაწერეთ კომენტარი..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <button
                    className="btn btn-gold"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || addComment.isPending}
                  >
                    <span className="material-symbols-rounded">send</span>
                    გაგზავნა
                  </button>
                </div>
              ) : (
                <div className="blog-comment-login">
                  <p>კომენტარის დასატოვებლად</p>
                  <Link to="/auth" className="btn btn-gold btn-sm">შესვლა</Link>
                </div>
              )}

              {/* Comment list */}
              <div className="blog-comment-list">
                {comments.map(comment => (
                  <div key={comment.id} className="blog-comment-item">
                    <Avatar className="blog-comment-avatar">
                      <AvatarImage src={comment.profiles?.avatar_url || ""} />
                      <AvatarFallback>{(comment.profiles?.full_name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="blog-comment-body">
                      <div className="blog-comment-header">
                        <span className="blog-comment-name">{comment.profiles?.full_name || "მომხმარებელი"}</span>
                        <span className="blog-comment-date">{formatDate(comment.created_at)}</span>
                        {(user?.id === comment.user_id || isAdmin) && (
                          <button onClick={() => handleDeleteComment(comment.id)} className="blog-comment-delete" title="წაშლა">
                            <span className="material-symbols-rounded">delete</span>
                          </button>
                        )}
                      </div>
                      <p className="blog-comment-text">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="blog-no-comments">ჯერ კომენტარები არ არის — იყავი პირველი!</p>
                )}
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
};

export default BlogPost;
