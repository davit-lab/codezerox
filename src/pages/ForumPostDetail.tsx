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
        <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f2fb 0%,#f8f7ff 60%,#eff6ff 100%)', paddingTop: '88px', paddingBottom: '48px' }}>
          <div style={{ maxWidth: '740px', margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8eaf6', padding: '40px', textAlign: 'center', color: '#888' }}>
              <Loader2 style={{ width: '28px', height: '28px', margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#6366f1' }} />
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
        <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f2fb 0%,#f8f7ff 60%,#eff6ff 100%)', paddingTop: '88px', paddingBottom: '48px' }}>
          <div style={{ maxWidth: '740px', margin: '0 auto', padding: '24px 16px', textAlign: 'center', color: '#888' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8eaf6', padding: '40px' }}>პოსტი ვერ მოიძებნა</div>
          </div>
        </main>
      </>
    );
  }

  const authorName = post.profile?.full_name || 'CodeZero User';
  const authorAvatar = post.profile?.avatar_url;
  const liked = post.user_liked ?? false;

  const CATS: Record<string, { color: string; bg: string; label: string }> = {
    programming: { color: '#2563eb', bg: '#dbeafe', label: 'კოდი' },
    design: { color: '#be185d', bg: '#fce7f3', label: 'დიზაინი' },
    business: { color: '#d97706', bg: '#fef3c7', label: 'ბიზნესი' },
    help: { color: '#059669', bg: '#d1fae5', label: 'დახმარება' },
  };
  const cs = CATS[post.category] ?? { color: '#6366f1', bg: '#eef2ff', label: post.category };
  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e8eaf6', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' } as const;

  return (
    <>
      <SEOHead title={post.title} description={post.content.slice(0, 120)} path={`/forums/${id}`} />
      <Atmosphere />
      <Header />

      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f2fb 0%,#f8f7ff 60%,#eff6ff 100%)', paddingTop: '88px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Back */}
          <button onClick={() => navigate('/forums')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontWeight: '600', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', width: 'fit-content', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            ფორუმი
          </button>

          {/* Post card */}
          <article style={{ ...card, overflow: 'hidden', borderLeft: `5px solid ${cs.color}` }}>
            <div style={{ padding: '22px 22px 16px' }}>
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                {authorAvatar ? (
                  <img src={authorAvatar} alt={authorName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8eaf6' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: getAvatarColor(authorName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#111' }}>{authorName}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>CodeZero Academy · {formatTime(post.created_at)}</div>
                </div>
                <span style={{ padding: '5px 14px', borderRadius: '20px', background: cs.bg, color: cs.color, fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                  {cs.label}
                </span>
              </div>

              {/* Title & Content */}
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111', marginBottom: '14px', lineHeight: '1.4', letterSpacing: '-0.3px' }}>{post.title}</h1>
              <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>{post.content}</p>

              {/* Media */}
              {post.image_url && (
                <img src={post.image_url} alt="" style={{ width: '100%', borderRadius: '12px', marginTop: '18px', display: 'block', border: '1px solid #e8eaf6' }} />
              )}
              {post.video_url && (
                <video src={post.video_url} controls style={{ width: '100%', borderRadius: '12px', marginTop: '18px', display: 'block' }} />
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '18px' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '12px', color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: '10px', fontWeight: '500' }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            {((post.likes_count ?? 0) > 0 || comments.length > 0) && (
              <div style={{ padding: '8px 22px', borderTop: '1px solid #f0f2fb', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {(post.likes_count ?? 0) > 0 && (
                    <><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ThumbsUp style={{ width: '9px', height: '9px', color: '#fff' }} />
                    </div> {post.likes_count} მოწონება</>
                  )}
                </div>
                <div>{comments.length > 0 && `${comments.length} კომენტარი`} {(post.views_count ?? 0) > 0 && `· ${post.views_count} ნახვა`}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ borderTop: '1px solid #f0f2fb', display: 'flex', padding: '3px 8px', gap: '2px' }}>
              {[
                { icon: ThumbsUp, label: 'მოწონება', active: liked, action: () => { if (!user) { navigate('/auth'); return; } toggleLike.mutate({ postId: id!, liked }); } },
                { icon: MessageSquare, label: 'კომენტარი', active: false, action: () => document.getElementById('comment-input')?.focus() },
                { icon: Send, label: 'გაზიარება', active: false, action: () => { navigator.clipboard?.writeText(window.location.href); toast.success('ბმული დაკოპირდა'); } },
              ].map(({ icon: Icon, label, active, action }) => (
                <button key={label} onClick={action}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? '#6366f1' : '#888', fontSize: '13px', fontWeight: active ? '700' : '500', transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f4ff'; e.currentTarget.style.color = '#6366f1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#6366f1' : '#888'; }}>
                  <Icon style={{ width: '17px', height: '17px' }} />
                  {label}
                </button>
              ))}
            </div>
          </article>

          {/* Comments */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2fb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare style={{ width: '16px', height: '16px', color: '#6366f1' }} />
              <h2 style={{ fontWeight: '700', fontSize: '15px', color: '#111', margin: 0 }}>კომენტარები</h2>
              {comments.length > 0 && <span style={{ fontSize: '12px', color: '#fff', background: '#6366f1', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>{comments.length}</span>}
            </div>

            {/* Write comment */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2fb', display: 'flex', gap: '12px' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8eaf6' }} />
              ) : (
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: getAvatarColor(displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <textarea id="comment-input" value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitComment(); }}
                  placeholder={user ? "კომენტარის დაწერა... (Ctrl+Enter)" : "კომენტარისთვის შედი სისტემაში"}
                  disabled={!user} rows={2}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '2px solid #e8eaf6', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#fafafe', color: '#111', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.background = '#fafafe'; }}
                />
                {user && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button onClick={handleSubmitComment} disabled={!commentText.trim() || createComment.isPending}
                      style={{ padding: '9px 22px', borderRadius: '22px', border: 'none', background: commentText.trim() ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#e8eaf6', color: commentText.trim() ? '#fff' : '#a5b4fc', fontWeight: '700', fontSize: '13px', cursor: commentText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s', boxShadow: commentText.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
                      {createComment.isPending ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '13px', height: '13px' }} />}
                      გაგზავნა
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment list */}
            {commentsLoading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                <Loader2 style={{ width: '24px', height: '24px', margin: '0 auto 10px', animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                იტვირთება...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#aaa' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>💬</div>
                <div style={{ fontWeight: '600', color: '#888', marginBottom: '4px' }}>კომენტარები არ არის</div>
                <div style={{ fontSize: '13px' }}>იყავი პირველი!</div>
              </div>
            ) : (
              <div>
                {comments.map((comment, i) => {
                  const cName = comment.profile?.full_name || 'CodeZero User';
                  const cAvatar = comment.profile?.avatar_url;
                  const isOwn = user?.id === comment.author_id;
                  return (
                    <div key={comment.id}
                      style={{ padding: '16px 22px', borderBottom: i < comments.length - 1 ? '1px solid #f0f2fb' : 'none', display: 'flex', gap: '12px' }}>
                      {cAvatar ? (
                        <img src={cAvatar} alt={cName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8eaf6' }} />
                      ) : (
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: getAvatarColor(cName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                          {cName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>{cName}</span>
                            <span style={{ fontSize: '11px', color: '#bbb' }}>{formatTime(comment.created_at)}</span>
                          </div>
                          {isOwn && (
                            <button onClick={() => handleDeleteComment(comment.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'color 0.12s' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}>
                              <Trash2 style={{ width: '13px', height: '13px' }} />
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
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
