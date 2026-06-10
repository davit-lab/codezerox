import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { useForumPosts, useCreateForumPost, useToggleForumLike, useMyForumPostCount } from "@/hooks/useForumPosts";
import { useFriends, useSendFriendRequest, usePendingRequests, useAcceptFriendRequest, useDeclineFriendRequest } from "@/hooks/useFriends";
import { useAllProfiles } from "@/hooks/useUsers";
import { Search, Plus, MessageSquare, ThumbsUp, Share2, Send, TrendingUp, Flame, Tag, Bookmark, MoreHorizontal, X, Loader2, UserPlus, User, ChevronRight, Bell, Image, FileText, MapPin, Briefcase, ChevronDown, Video, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Forums = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "programming" });
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [userDisplayCount, setUserDisplayCount] = useState(6);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: friends } = useFriends();
  const { data: pendingRequests } = usePendingRequests();
  const sendFriendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const { data: posts = [], isLoading } = useForumPosts();
  const { data: myPostCount = 0 } = useMyForumPostCount(user?.id);
  const createPost = useCreateForumPost();
  const toggleLikeMutation = useToggleForumLike();
  const { data: allProfiles = [] } = useAllProfiles();

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.tags.some(tag => tag.toLowerCase().includes(q));
  });

  const filteredUsers = allProfiles.filter(u => 
    u.user_id !== user?.id &&
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFriend = (userId: string) => {
    return friends?.some(f => f.friend_id === userId);
  };

  const isPending = (userId: string) => {
    return pendingRequests?.some(r => r.requester_id === userId);
  };

  const handleSendFriendRequest = async (userId: string) => {
    if (userId === user?.id) return;
    try {
      await sendFriendRequest.mutateAsync(userId);
      toast.success('მეგობრობის მოთხოვნა გაგზავნილია');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('მოთხოვნის გაგზავნა ვერ მოხერხდა');
    }
  };

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

  const toggleSave = (id: string) => {
    setSavedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleToggleLike = (postId: string, userLiked: boolean) => {
    if (!user) { navigate('/auth'); return; }
    toggleLikeMutation.mutate({ postId, liked: userLiked });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, '');
      if (tag && !postTags.includes(tag) && postTags.length < 5) {
        setPostTags(prev => [...prev, tag]);
      }
      setTagInput("");
    } else if (e.key === 'Backspace' && !tagInput && postTags.length > 0) {
      setPostTags(prev => prev.slice(0, -1));
    }
  };

  const handleMediaUpload = async (file: File, type: 'image' | 'video') => {
    if (!user) return;
    setUploadingMedia(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('forum-media').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('forum-media').getPublicUrl(path);
      setMediaPreview({ url: urlData.publicUrl, type });
    } catch (err: any) {
      toast.error(type === 'image' ? 'ფოტოს ატვირთვა ვერ მოხერხდა' : 'ვიდეოს ატვირთვა ვერ მოხერხდა');
      console.error(err);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("სათაური და შინაარსი სავალდებულოა");
      return;
    }
    const finalTags = tagInput.trim() ? [...postTags, tagInput.trim().replace(/^#/, '')] : postTags;
    try {
      await createPost.mutateAsync({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        tags: finalTags,
        image_url: mediaPreview?.type === 'image' ? mediaPreview.url : null,
        video_url: mediaPreview?.type === 'video' ? mediaPreview.url : null,
      });
      toast.success("პოსტი გამოქვეყნდა!");
      setShowModal(false);
      setNewPost({ title: "", content: "", category: "programming" });
      setPostTags([]);
      setTagInput("");
      setMediaPreview(null);
    } catch {
      toast.error("პოსტის შექმნა ვერ მოხერხდა");
    }
  };

  const trendingTopics = [
    { tag: "React", posts: filteredPosts.filter(p => p.tags.includes("React")).length || 0 },
    { tag: "Python", posts: filteredPosts.filter(p => p.tags.includes("Python")).length || 0 },
    { tag: "TypeScript", posts: filteredPosts.filter(p => p.tags.includes("TypeScript")).length || 0 },
    { tag: "UI/UX", posts: filteredPosts.filter(p => p.tags.includes("UI/UX")).length || 0 },
    { tag: "Freelancing", posts: filteredPosts.filter(p => p.tags.includes("Freelancing")).length || 0 },
  ];

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'სტუმარი';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <SEOHead title="ფორუმები" description="მონაწილეთ საზოგადოებაში და გააზიარეთ ცოდნა" path="/forums" />
      <Atmosphere />
      <Header />

      {/* Create Post Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: '700', fontSize: '18px', color: '#000' }}>პოსტის შექმნა</h2>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#f3f2ef', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#e8e6e3')} onMouseLeave={e => (e.currentTarget.style.background = '#f3f2ef')}>
                <X style={{ width: '18px', height: '18px', color: '#666' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getAvatarColor(displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '18px', flexShrink: 0 }}>
                    {avatarLetter}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#000' }}>{displayName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>CodeZero Academy წევრი</div>
                </div>
              </div>

              {/* Title */}
              <input
                value={newPost.title}
                onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                placeholder="სათაური *"
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box', color: '#000', background: '#fff', fontWeight: '600', transition: 'border-color 0.15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0a66c2')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
              />

              {/* Content */}
              <div style={{ position: 'relative' }}>
                <textarea
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  placeholder="რის გაზიარება გსურთ?"
                  rows={6}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', color: '#000', background: '#fff', lineHeight: '1.6', transition: 'border-color 0.15s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0a66c2')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
                />
                <div style={{ position: 'absolute', right: '10px', bottom: '10px', fontSize: '11px', color: '#999' }}>
                  {newPost.content.length}/2000
                </div>
              </div>

              {/* Category Pills */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>კატეგორია</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { id: 'programming', name: 'პროგრამირება', color: '#1d4ed8', bg: '#dbeafe' },
                    { id: 'design', name: 'დიზაინი', color: '#be185d', bg: '#fce7f3' },
                    { id: 'business', name: 'ბიზნესი', color: '#d97706', bg: '#fef3c7' },
                    { id: 'help', name: 'დახმარება', color: '#059669', bg: '#d1fae5' },
                  ].map((cat) => {
                    const isActive = newPost.category === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setNewPost(p => ({ ...p, category: cat.id }))}
                        style={{
                          padding: '8px 16px', borderRadius: '24px', border: isActive ? '2px solid ' + cat.color : '1.5px solid ' + cat.bg,
                          background: isActive ? cat.color : cat.bg, color: isActive ? '#fff' : cat.color,
                          fontWeight: isActive ? '700' : '600', fontSize: '13px', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Chips */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ტეგები ({postTags.length}/5)</div>
                <div style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e0e0e0', background: '#f9f9f9', minHeight: '44px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', transition: 'border-color 0.15s' }}
                  onClick={e => { if (e.currentTarget === e.target) (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}
                >
                  {postTags.map((tag, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: '16px', background: '#0a66c2', color: '#fff', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      #{tag}
                      <button onClick={() => setPostTags(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '0', display: 'flex', alignItems: 'center', fontSize: '12px' }}
                      >
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={postTags.length === 0 ? "დაწერე ტეგი და დააჭირე Enter-ს..." : ""}
                    style={{ flex: 1, minWidth: '100px', padding: '6px 4px', border: 'none', outline: 'none', fontSize: '14px', color: '#000', background: 'transparent', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Enter ან comma (,) ტეგის დასამატებლად</div>
              </div>

              {/* Media Upload */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>მედია</div>
                {!mediaPreview ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => imageInputRef.current?.click()} disabled={uploadingMedia}
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px dashed #c9cdd2', background: '#f9f9f9', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', fontWeight: '600' }}>
                      {uploadingMedia ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : <Image style={{ width: '20px', height: '20px' }} />}
                      ფოტო
                    </button>
                    <button onClick={() => videoInputRef.current?.click()} disabled={uploadingMedia}
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px dashed #c9cdd2', background: '#f9f9f9', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', fontWeight: '600' }}>
                      {uploadingMedia ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : <Video style={{ width: '20px', height: '20px' }} />}
                      ვიდეო
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                    {mediaPreview.type === 'image' ? (
                      <img src={mediaPreview.url} alt="preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <video src={mediaPreview.url} controls style={{ width: '100%', maxHeight: '300px', display: 'block' }} />
                    )}
                    <button onClick={() => setMediaPreview(null)}
                      style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                )}
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f, 'image'); }} />
                <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f, 'video'); }} />
              </div>

              {/* Submit */}
              <button
                onClick={handleCreatePost}
                disabled={createPost.isPending || !newPost.title.trim() || !newPost.content.trim()}
                style={{
                  padding: '14px', borderRadius: '28px', border: 'none',
                  background: newPost.title.trim() && newPost.content.trim() ? '#0a66c2' : '#e0e0e0',
                  color: newPost.title.trim() && newPost.content.trim() ? '#fff' : '#999',
                  fontWeight: '700', fontSize: '15px', cursor: newPost.title.trim() && newPost.content.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s',
                }}
              >
                {createPost.isPending ? <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: '18px', height: '18px' }} />}
                გამოქვეყნება
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh', backgroundColor: '#f3f2ef', paddingTop: '88px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1128px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}
          className="lg:grid-cols-[280px_1fr_300px]"
        >

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block space-y-3">
            {/* Profile Card */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              <div style={{ height: '60px', background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)' }} />
              <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #fff', margin: '-36px auto 8px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: getAvatarColor(displayName), border: '3px solid #fff', margin: '-36px auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                    {avatarLetter}
                  </div>
                )}
                <div style={{ fontWeight: '600', fontSize: '16px', color: '#000', marginBottom: '2px' }}>{displayName}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>CodeZero Academy წევრი</div>
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#0a66c2' }}>{myPostCount}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>პოსტი</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#0a66c2' }}>{posts.length}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>ყველა</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#0a66c2' }}>{posts.reduce((s, p) => s + (p.likes_count ?? 0), 0)}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>მოწ.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Friend Requests */}
            {pendingRequests && pendingRequests.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '16px' }}>
                <div style={{ padding: '0 4px 12px', fontSize: '13px', fontWeight: '700', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell style={{ width: '16px', height: '16px', color: '#0a66c2' }} />
                  მეგობრობის მოთხოვნები ({pendingRequests.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingRequests.map(req => {
                    const reqProfile = allProfiles.find(p => p.user_id === req.requester_id);
                    const reqName = reqProfile?.full_name || 'მომხმარებელი';
                    return (
                      <div key={req.friendship_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: '#f9f9f9' }}>
                        {reqProfile?.avatar_url ? (
                          <img src={reqProfile.avatar_url} alt={reqName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(reqName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                            {reqName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#000' }}>{reqName}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>გიგზავნის მეგობრობის მოთხოვნას</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => acceptRequest.mutate(req.friendship_id)}
                            disabled={acceptRequest.isPending}
                            style={{ padding: '6px 14px', borderRadius: '16px', border: 'none', background: '#0a66c2', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                            {acceptRequest.isPending ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : 'დათანხმება'}
                          </button>
                          <button onClick={() => declineRequest.mutate(req.friendship_id)}
                            disabled={declineRequest.isPending}
                            style={{ padding: '6px 14px', borderRadius: '16px', border: '1.5px solid #e0e0e0', background: '#fff', color: '#666', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            {declineRequest.isPending ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : 'უარყოფა'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Cards */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '16px' }}>
              <div style={{ padding: '0 4px 12px', fontSize: '13px', fontWeight: '700', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>მომხმარებლები</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {filteredUsers.slice(0, userDisplayCount).map((u) => {
                  const friendStatus = isFriend(u.user_id);
                  const pending = isPending(u.user_id);
                  
                  return (
                    <div
                      key={u.user_id}
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1.5px solid #e5e7eb',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => navigate(`/user/${u.user_id}`)}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#0a66c2')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                    >
                      {/* Gradient background effect */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', opacity: 0.1 }} />
                      
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        {u.avatar_url ? (
                          <img 
                            src={u.avatar_url} 
                            alt={u.full_name} 
                            style={{ 
                              width: '72px', 
                              height: '72px', 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              border: '3px solid #fff',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }} 
                          />
                        ) : (
                          <div style={{ 
                            width: '72px', 
                            height: '72px', 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${getAvatarColor(u.full_name || 'U')} 0%, ${getAvatarColor(u.full_name || 'U')}99 100%)`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold', 
                            color: '#fff', 
                            fontSize: '28px',
                            border: '3px solid #fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            {u.full_name?.charAt(0) || 'U'}
                          </div>
                        )}
                        
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          <div style={{ fontWeight: '700', fontSize: '15px', color: '#000', marginBottom: '4px' }}>
                            {u.full_name || 'უცნობი მომხმარებელი'}
                          </div>
                          
                          {u.bio && (
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', lineHeight: '1.4' }}>
                              {u.bio}
                            </div>
                          )}
                          
                          {u.location && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', color: '#999' }}>
                              <MapPin style={{ width: '12px', height: '12px' }} />
                              {u.location}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                          {friendStatus ? (
                            <div style={{ 
                              padding: '8px 20px', 
                              borderRadius: '24px', 
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                              color: '#fff', 
                              fontSize: '13px', 
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}>
                              მეგობარი
                            </div>
                          ) : pending ? (
                            <div style={{ 
                              padding: '8px 20px', 
                              borderRadius: '24px', 
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                              color: '#fff', 
                              fontSize: '13px', 
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                            }}>
                              მოთხოვნა
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSendFriendRequest(u.user_id); }}
                              style={{ 
                                padding: '8px 20px', 
                                borderRadius: '24px', 
                                background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)', 
                                color: '#fff', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: '13px', 
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(10, 102, 194, 0.3)',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                              <UserPlus style={{ width: '14px', height: '14px' }} />
                              დამატება
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                  <User style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontSize: '14px' }}>მომხმარებლები ვერ მოიძებნა</div>
                </div>
              )}
              {filteredUsers.length > userDisplayCount && (
                <button
                  onClick={() => setUserDisplayCount(prev => prev + 6)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: '#f3f2ef', color: '#0a66c2', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e8e6e3')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f3f2ef')}
                >
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                  მეტის ნახვა ({filteredUsers.length - userDisplayCount} დარჩა)
                </button>
              )}
            </div>
          </aside>

          {/* ── CENTER FEED ── */}
          <div className="space-y-3">

            {/* Search bar (mobile) */}
            <div className="lg:hidden" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#666' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ძებნა პოსტებში..."
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '20px', border: '1px solid #e0e0e0', fontSize: '14px', outline: 'none', background: '#f3f2ef', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Create Post Box */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: getAvatarColor(displayName),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0,
                  }}>
                    {avatarLetter}
                  </div>
                )}
                <button
                  onClick={() => user ? setShowModal(true) : navigate('/auth')}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: '24px',
                    border: '1px solid #c9cdd2', background: '#fff',
                    textAlign: 'left', color: '#666', fontSize: '14px',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f2ef')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  გააზიარეთ პოსტი, სტატია ან განახლება...
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                {[
                  { icon: Image, label: 'სურათი', color: '#70b5f9' },
                  { icon: MessageSquare, label: 'ვიდეო', color: '#7fc15e' },
                  { icon: FileText, label: 'სტატია', color: '#e06847' },
                ].map(({ icon: Icon, label, color }: any) => (
                  <button key={label} onClick={() => !user ? navigate('/auth') : setShowModal(true)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontSize: '13px', fontWeight: '600', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f3f2ef')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon style={{ width: '18px', height: '18px', color }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
              <span style={{ fontSize: '12px', color: '#666', fontWeight: '600', whiteSpace: 'nowrap' }}>დალაგება: ახალი</span>
              <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </div>

            {/* Posts */}
            {isLoading ? (
              [1,2,3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e0e0' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '14px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px', width: '40%' }} />
                      <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '4px', width: '25%' }} />
                    </div>
                  </div>
                  <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', width: '80%' }} />
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                <div style={{ fontWeight: '600', marginBottom: '6px' }}>პოსტები ვერ მოიძებნა</div>
                <div style={{ fontSize: '13px' }}>პირველი იყავი — შექმენი ახალი პოსტი!</div>
              </div>
            ) : filteredPosts.map((post) => {
              const authorName = post.profile?.full_name || 'CodeZero User';
              const authorAvatar = post.profile?.avatar_url;
              const liked = post.user_liked ?? false;
              const saved = savedPosts.has(post.id);
              const isHot = (post.likes_count ?? 0) >= 5 || (post.views_count ?? 0) >= 50;
              return (
                <article key={post.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Post Header */}
                  <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: getAvatarColor(authorName),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0,
                        }}>
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#000', lineHeight: '1.3' }}>{authorName}</div>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>CodeZero Academy • {formatTime(post.created_at)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {isHot && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#e25950', fontWeight: '600' }}>
                              <Flame style={{ width: '11px', height: '11px' }} /> ტრენდი
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => toggleSave(post.id)}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved ? '#0a66c2' : '#666' }}
                      >
                        <Bookmark style={{ width: '18px', height: '18px', fill: saved ? '#0a66c2' : 'none' }} />
                      </button>
                      <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        <MoreHorizontal style={{ width: '18px', height: '18px' }} />
                      </button>
                    </div>
                  </div>

                  {/* Post Body */}
                  <div style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => navigate(`/forums/${post.id}`)}>
                    <h3 style={{ fontWeight: '600', fontSize: '15px', color: '#000', marginBottom: '6px', lineHeight: '1.4' }}>{post.title}</h3>
                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>

                    {/* Media */}
                    {post.image_url && (
                      <img src={post.image_url} alt="" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px', display: 'block' }} />
                    )}
                    {post.video_url && (
                      <video src={post.video_url} controls style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', marginTop: '12px', display: 'block' }} />
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '13px', color: '#0a66c2', cursor: 'pointer' }}>#{tag}</span>
                    ))}
                  </div>

                  {/* Reaction counts */}
                  <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#666' }}>
                      {(post.likes_count ?? 0) > 0 && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#0a66c2' }}>
                            <ThumbsUp style={{ width: '10px', height: '10px', color: '#fff' }} />
                          </div>
                          {post.likes_count}
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {(post.comments_count ?? 0) > 0 && `${post.comments_count} კომენტარი`}
                      {(post.comments_count ?? 0) > 0 && (post.views_count ?? 0) > 0 && ' • '}
                      {(post.views_count ?? 0) > 0 && `${post.views_count} ნახვა`}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid #e0e0e0', margin: '0 16px' }} />

                  {/* Action buttons */}
                  <div style={{ padding: '4px 8px', display: 'flex', gap: '2px' }}>
                    {[
                      { icon: ThumbsUp, label: 'მოწონება', active: liked, action: () => handleToggleLike(post.id, liked), activeColor: '#0a66c2' },
                      { icon: MessageSquare, label: 'კომენტარი', active: false, action: () => navigate(`/forums/${post.id}`), activeColor: '#0a66c2' },
                      { icon: Share2, label: 'გაზიარება', active: false, action: () => toast.success('ბმული დაკოპირდა'), activeColor: '#0a66c2' },
                      { icon: Send, label: 'გაგზავნა', active: false, action: () => toast.info('გაგზავნა'), activeColor: '#0a66c2' },
                    ].map(({ icon: Icon, label, active, action, activeColor }: any) => (
                      <button key={label} onClick={action}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '10px 4px', borderRadius: '8px', border: 'none', background: 'transparent',
                          cursor: 'pointer', color: active ? activeColor : '#666',
                          fontSize: '13px', fontWeight: active ? '700' : '600', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f3f2ef')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon style={{ width: '18px', height: '18px', fill: active ? activeColor : 'none', stroke: active ? activeColor : 'currentColor' }} />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden lg:block space-y-3">
            {/* Search */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#666' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ძებნა..."
                  style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: '20px', border: '1px solid #e0e0e0', fontSize: '14px', outline: 'none', background: '#f3f2ef', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Trending */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '15px', color: '#000' }}>ტრენდული თემები</h3>
                <TrendingUp style={{ width: '16px', height: '16px', color: '#0a66c2' }} />
              </div>
              {trendingTopics.map((topic, i) => (
                <div key={topic.tag}
                  onClick={() => setSearchQuery(topic.tag)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer', borderBottom: i < trendingTopics.length - 1 ? '1px solid #f3f2ef' : 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#000' }}>#{topic.tag}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{topic.posts} პოსტი</div>
                  </div>
                  <Tag style={{ width: '14px', height: '14px', color: '#0a66c2' }} />
                </div>
              ))}
            </div>

            {/* New Post CTA */}
            <div style={{ background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>გააზიარეთ თქვენი ცოდნა</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>დაეხმარეთ სხვა სტუდენტებს</div>
              <button
                onClick={() => user ? setShowModal(true) : navigate('/auth')}
                style={{ padding: '8px 20px', borderRadius: '20px', border: '1.5px solid #fff', background: 'transparent', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0a66c2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
              >
                <Plus style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                ახალი პოსტი
              </button>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
};

export default Forums;
