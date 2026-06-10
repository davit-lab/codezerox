import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import {
  useForumPost,
  useForumComments,
  useCreateForumComment,
  useDeleteForumComment,
  useToggleForumLike,
} from "@/hooks/useForumPosts";
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ForumPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading: postLoading } = useForumPost(id!);
  const { data: comments = [], isLoading: commentsLoading } = useForumComments(id!);
  const createComment = useCreateForumComment();
  const deleteComment = useDeleteForumComment();
  const toggleLike = useToggleForumLike();

  const getAvatarColor = (name: string) => {
    const colors = ['#0a66c2', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2', '#be185d', '#4f46e5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "ახლახანს";
    if (diffMins < 60) return `${diffMins} წთ წინ`;
    if (diffHours < 24) return `${diffHours} სთ წინ`;
    if (diffDays < 7) return `${diffDays} დღის წინ`;
    return date.toLocaleDateString('ka-GE');
  };

  const handleSubmitComment = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({ postId: id!, content: commentText.trim() });
      setCommentText("");
      toast.success("კომენტარი დაემატა!");
    } catch {
      toast.error("კომენტარი ვერ დაემატა");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("წაშლა?")) return;
    try {
      await deleteComment.mutateAsync({ commentId, postId: id! });
      toast.success("კომენტარი წაიშალა");
    } catch {
      toast.error("წაშლა ვერ მოხერხდა");
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'სტუმარი';

  if (postLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main style={{ minHeight: '100vh', backgroundColor: '#f3f2ef', paddingTop: '88px', paddingBottom: '40px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '32px', textAlign: 'center', color: '#666' }}>
              <Loader2 style={{ width: '32px', height: '32px', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              იტვირთება...
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main style={{ minHeight: '100vh', backgroundColor: '#f3f2ef', paddingTop: '88px', paddingBottom: '40px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px', textAlign: 'center', color: '#666' }}>
            პოსტი ვერ მოიძებნა
          </div>
        </main>
      </>
    );
  }

  const authorName = post.profile?.full_name || 'CodeZero User';
  const authorAvatar = post.profile?.avatar_url;
  const liked = post.user_liked ?? false;

  const categoryColors: Record<string, { bg: string; text: string }> = {
    programming: { bg: '#dbeafe', text: '#1d4ed8' },
    design: { bg: '#fce7f3', text: '#be185d' },
    business: { bg: '#fef3c7', text: '#d97706' },
    help: { bg: '#d1fae5', text: '#059669' },
  };
  const catStyle = categoryColors[post.category] ?? { bg: '#f3f2ef', text: '#333' };

  return (
    <>
      <SEOHead title={post.title} description={post.content.slice(0, 120)} path={`/forums/${id}`} />
      <Atmosphere />
      <Header />

      <main style={{ minHeight: '100vh', backgroundColor: '#f3f2ef', paddingTop: '88px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Back */}
          <button onClick={() => navigate('/forums')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0a66c2', fontWeight: '600', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: 'fit-content' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            ფორუმი
          </button>

          {/* Post card */}
          <article style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <div style={{ padding: '20px' }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {authorAvatar ? (
                  <img src={authorAvatar} alt={authorName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getAvatarColor(authorName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#000' }}>{authorName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>CodeZero Academy • {formatTime(post.created_at)}</div>
                </div>
                <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', background: catStyle.bg, color: catStyle.text, fontSize: '12px', fontWeight: '600' }}>
                  {post.category}
                </span>
              </div>

              {/* Title & Content */}
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#000', marginBottom: '12px', lineHeight: '1.4' }}>{post.title}</h1>
              <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{post.content}</p>

              {/* Media */}
              {post.image_url && (
                <img src={post.image_url} alt="" style={{ width: '100%', borderRadius: '8px', marginTop: '16px', display: 'block' }} />
              )}
              {post.video_url && (
                <video src={post.video_url} controls style={{ width: '100%', borderRadius: '8px', marginTop: '16px', display: 'block' }} />
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '13px', color: '#0a66c2' }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ padding: '8px 20px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {(post.likes_count ?? 0) > 0 && (
                  <>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ThumbsUp style={{ width: '10px', height: '10px', color: '#fff' }} />
                    </div>
                    {post.likes_count}
                  </>
                )}
              </div>
              <div>{comments.length} კომენტარი • {post.views_count ?? 0} ნახვა</div>
            </div>

            {/* Action bar */}
            <div style={{ borderTop: '1px solid #e0e0e0', display: 'flex', padding: '4px 8px', gap: '2px' }}>
              {[
                { icon: ThumbsUp, label: 'მოწონება', active: liked, action: () => { if (!user) { navigate('/auth'); return; } toggleLike.mutate({ postId: id!, liked }); } },
                { icon: MessageSquare, label: 'კომენტარი', active: false, action: () => document.getElementById('comment-input')?.focus() },
                { icon: Send, label: 'გაზიარება', active: false, action: () => { navigator.clipboard?.writeText(window.location.href); toast.success('ბმული დაკოპირდა'); } },
              ].map(({ icon: Icon, label, active, action }) => (
                <button key={label} onClick={action}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? '#0a66c2' : '#666', fontSize: '13px', fontWeight: active ? '700' : '600', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f2ef')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {label}
                </button>
              ))}
            </div>
          </article>

          {/* Comments section */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <h2 style={{ fontWeight: '700', fontSize: '16px', color: '#000', margin: 0 }}>კომენტარები ({comments.length})</h2>
            </div>

            {/* Write comment */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={displayName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  : displayName.charAt(0).toUpperCase()
                }
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitComment(); }}
                  placeholder={user ? "კომენტარის დაწერა... (Ctrl+Enter)" : "კომენტარისთვის შედი სისტემაში"}
                  disabled={!user}
                  rows={2}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #c9cdd2', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f9f9f9', color: '#000', boxSizing: 'border-box' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#0a66c2'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#c9cdd2'; e.currentTarget.style.background = '#f9f9f9'; }}
                />
                {user && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || createComment.isPending}
                      style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: commentText.trim() ? '#0a66c2' : '#e0e0e0', color: commentText.trim() ? '#fff' : '#999', fontWeight: '600', fontSize: '14px', cursor: commentText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.15s' }}
                    >
                      {createComment.isPending ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '14px', height: '14px' }} />}
                      გაგზავნა
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment list */}
            {commentsLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                <Loader2 style={{ width: '20px', height: '20px', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                იტვირთება...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                ჯერ კომენტარები არ არის — იყავი პირველი!
              </div>
            ) : (
              <div>
                {comments.map((comment, i) => {
                  const cName = comment.profile?.full_name || 'CodeZero User';
                  const cAvatar = comment.profile?.avatar_url;
                  const isOwn = user?.id === comment.author_id;
                  return (
                    <div key={comment.id} style={{ padding: '16px 20px', borderBottom: i < comments.length - 1 ? '1px solid #f3f2ef' : 'none', display: 'flex', gap: '12px' }}>
                      {cAvatar ? (
                        <img src={cAvatar} alt={cName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(cName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                          {cName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: '#000' }}>{cName}</span>
                            <span style={{ fontSize: '12px', color: '#666' }}>{formatTime(comment.created_at)}</span>
                          </div>
                          {isOwn && (
                            <button onClick={() => handleDeleteComment(comment.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px', borderRadius: '4px' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
};

export default ForumPostDetail;
