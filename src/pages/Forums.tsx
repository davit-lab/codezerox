import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { useForumPosts, useCreateForumPost, useToggleForumLike, useMyForumPostCount } from "@/hooks/useForumPosts";
import { useFriends, useSendFriendRequest, usePendingRequests, useSentRequests, useAcceptFriendRequest, useDeclineFriendRequest } from "@/hooks/useFriends";
import { useAllProfiles } from "@/hooks/useUsers";
import { Search, Plus, MessageSquare, ThumbsUp, Share2, Send, TrendingUp, Flame, Tag, Bookmark, X, Loader2, UserPlus, Bell, Image, FileText, ChevronDown, Video } from "lucide-react";
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: friends } = useFriends();
  const { data: pendingRequests } = usePendingRequests();
  const { data: sentRequests } = useSentRequests();
  const sendFriendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const { data: posts = [], isLoading } = useForumPosts();
  const { data: myPostCount = 0 } = useMyForumPostCount(user?.id);
  const createPost = useCreateForumPost();
  const toggleLikeMutation = useToggleForumLike();
  const { data: allProfiles = [] } = useAllProfiles();

  const filteredPosts = posts.filter(post => {
    if (activeCategory !== 'all' && post.category !== activeCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.tags.some(tag => tag.toLowerCase().includes(q));
  });

  const filteredUsers = allProfiles.filter(u =>
    u.user_id !== user?.id &&
    (!searchQuery || u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isFriend = (userId: string) => {
    return friends?.some(f => f.friend_id === userId);
  };

  const isPending = (userId: string) => {
    return pendingRequests?.some(r => r.requester_id === userId);
  };

  const isSentRequest = (userId: string) => {
    return sentRequests?.some(r => r.target_user_id === userId);
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
    { tag: "React", count: posts.filter(p => p.tags.includes("React")).length },
    { tag: "Python", count: posts.filter(p => p.tags.includes("Python")).length },
    { tag: "TypeScript", count: posts.filter(p => p.tags.includes("TypeScript")).length },
    { tag: "UI/UX", count: posts.filter(p => p.tags.includes("UI/UX")).length },
    { tag: "Freelancing", count: posts.filter(p => p.tags.includes("Freelancing")).length },
  ];

  const CATS = [
    { id: 'all', label: 'ყველა', color: '#6366f1', bg: '#eef2ff' },
    { id: 'programming', label: 'კოდი', color: '#2563eb', bg: '#dbeafe' },
    { id: 'design', label: 'დიზაინი', color: '#be185d', bg: '#fce7f3' },
    { id: 'business', label: 'ბიზნესი', color: '#d97706', bg: '#fef3c7' },
    { id: 'help', label: 'დახმარება', color: '#059669', bg: '#d1fae5' },
  ];

  const catStyle = (id: string) => CATS.find(c => c.id === id) ?? { color: '#555', bg: '#f3f4f6', label: id };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'სტუმარი';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e8eaf6', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' } as const;

  return (
    <>
      <SEOHead title="ფორუმები" description="მონაწილეთ საზოგადოებაში და გააზიარეთ ცოდნა" path="/forums" />
      <Atmosphere />
      <Header />

      {/* Create Post Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,15,40,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '18px', border: '2px solid rgba(255,255,255,0.4)' }}>{avatarLetter}</div>
                )}
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{displayName}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>ახალი პოსტი</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(90vh - 88px)', overflowY: 'auto' }}>

              {/* Title */}
              <input
                value={newPost.title}
                onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                placeholder="სათაური *"
                style={{ padding: '13px 16px', borderRadius: '12px', border: '2px solid #e8eaf6', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box', color: '#111', background: '#fafafe', fontWeight: '600', transition: 'border-color 0.15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e8eaf6')}
              />

              {/* Content */}
              <div style={{ position: 'relative' }}>
                <textarea
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  placeholder="რის გაზიარება გსურთ?"
                  rows={5}
                  style={{ padding: '13px 16px', borderRadius: '12px', border: '2px solid #e8eaf6', fontSize: '14px', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', color: '#111', background: '#fafafe', lineHeight: '1.6', transition: 'border-color 0.15s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e8eaf6')}
                />
                <div style={{ position: 'absolute', right: '12px', bottom: '10px', fontSize: '11px', color: '#aaa' }}>
                  {newPost.content.length}/2000
                </div>
              </div>

              {/* Category Pills */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>კატეგორია</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATS.filter(c => c.id !== 'all').map((cat) => {
                    const isActive = newPost.category === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setNewPost(p => ({ ...p, category: cat.id }))}
                        style={{ padding: '8px 18px', borderRadius: '24px', border: isActive ? 'none' : '1.5px solid ' + cat.color + '55', background: isActive ? cat.color : cat.bg, color: isActive ? '#fff' : cat.color, fontWeight: isActive ? '700' : '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Chips */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>ტეგები ({postTags.length}/5)</div>
                <div style={{ padding: '8px 12px', borderRadius: '12px', border: '2px solid #e8eaf6', background: '#fafafe', minHeight: '44px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}
                  onClick={e => { if (e.currentTarget === e.target) (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}
                >
                  {postTags.map((tag, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: '16px', background: '#6366f1', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      #{tag}
                      <button onClick={() => setPostTags(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '0', display: 'flex', alignItems: 'center' }}
                      ><X style={{ width: '11px', height: '11px' }} /></button>
                    </span>
                  ))}
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                    placeholder={postTags.length === 0 ? "ტეგი + Enter..." : ""}
                    style={{ flex: 1, minWidth: '80px', padding: '4px', border: 'none', outline: 'none', fontSize: '13px', color: '#111', background: 'transparent', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>მედია</div>
                {!mediaPreview ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => imageInputRef.current?.click()} disabled={uploadingMedia}
                      style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px dashed #c7d2fe', background: '#eef2ff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s' }}>
                      {uploadingMedia ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : <Image style={{ width: '20px', height: '20px' }} />}
                      ფოტო
                    </button>
                    <button onClick={() => videoInputRef.current?.click()} disabled={uploadingMedia}
                      style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px dashed #c7d2fe', background: '#eef2ff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s' }}>
                      {uploadingMedia ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : <Video style={{ width: '20px', height: '20px' }} />}
                      ვიდეო
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                    {mediaPreview.type === 'image' ? (
                      <img src={mediaPreview.url} alt="preview" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <video src={mediaPreview.url} controls style={{ width: '100%', maxHeight: '240px', display: 'block' }} />
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
                  background: newPost.title.trim() && newPost.content.trim() ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#e8eaf6',
                  color: newPost.title.trim() && newPost.content.trim() ? '#fff' : '#a5b4fc',
                  fontWeight: '700', fontSize: '15px', cursor: newPost.title.trim() && newPost.content.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s', boxShadow: newPost.title.trim() && newPost.content.trim() ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                {createPost.isPending ? <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: '18px', height: '18px' }} />}
                გამოქვეყნება
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f2fb 0%,#f8f7ff 60%,#eff6ff 100%)', paddingTop: '88px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1148px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}
          className="lg:grid-cols-[270px_1fr_290px]"
        >

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Profile Card */}
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ height: '64px', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)' }} />
              <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #fff', margin: '-36px auto 8px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: getAvatarColor(displayName), border: '3px solid #fff', margin: '-36px auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                    {avatarLetter}
                  </div>
                )}
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#111', marginBottom: '2px' }}>{displayName}</div>
                <div style={{ fontSize: '12px', color: '#8b8fa8', marginBottom: '14px' }}>CodeZero Academy</div>
                <div style={{ borderTop: '1px solid #e8eaf6', paddingTop: '12px', display: 'flex', justifyContent: 'space-around' }}>
                  {[{ val: myPostCount, lbl: 'პოსტი' }, { val: posts.length, lbl: 'სულ' }, { val: posts.reduce((s, p) => s + (p.likes_count ?? 0), 0), lbl: 'მოწ.' }].map(({ val, lbl }) => (
                    <div key={lbl} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: '#6366f1' }}>{val}</div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Friend Requests */}
            {pendingRequests && pendingRequests.length > 0 && (
              <div style={{ ...card, padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                  <Bell style={{ width: '14px', height: '14px' }} />
                  მოთხოვნები ({pendingRequests.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingRequests.map(req => {
                    const rp = allProfiles.find(p => p.user_id === req.requester_id);
                    const rn = rp?.full_name || 'მომხმარებელი';
                    return (
                      <div key={req.friendship_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '12px', background: '#fafafe', border: '1px solid #e8eaf6' }}>
                        {rp?.avatar_url ? (
                          <img src={rp.avatar_url} alt={rn} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: getAvatarColor(rn), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                            {rn.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rn}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>მოთხოვნა გამოგიგზავნა</div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => acceptRequest.mutate(req.friendship_id)} disabled={acceptRequest.isPending}
                            style={{ padding: '5px 12px', borderRadius: '14px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>✓</button>
                          <button onClick={() => declineRequest.mutate(req.friendship_id)} disabled={declineRequest.isPending}
                            style={{ padding: '5px 10px', borderRadius: '14px', border: '1.5px solid #e0e0e0', background: '#fff', color: '#888', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* People you may know — compact rows */}
            <div style={{ ...card, padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>მომხმარებლები</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredUsers.slice(0, userDisplayCount).map((u) => {
                  const friendStatus = isFriend(u.user_id);
                  const sentReq = isSentRequest(u.user_id);
                  const receivedReq = isPending(u.user_id);
                  return (
                    <div key={u.user_id}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 6px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.12s' }}
                      onClick={() => navigate(`/user/${u.user_id}`)}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f5f4ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.full_name || ''} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getAvatarColor(u.full_name || 'U'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '14px', flexShrink: 0 }}>
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || 'უცნობი'}</div>
                        {u.bio && <div style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>}
                      </div>
                      {friendStatus ? (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', flexShrink: 0 }}>✓</span>
                      ) : sentReq ? (
                        <span style={{ fontSize: '10px', color: '#888', background: '#f3f4f6', padding: '3px 8px', borderRadius: '10px', flexShrink: 0 }}>გაგ.</span>
                      ) : receivedReq ? (
                        <button onClick={e => { e.stopPropagation(); const req = pendingRequests?.find(r => r.requester_id === u.user_id); if (req) acceptRequest.mutate(req.friendship_id); }}
                          style={{ fontSize: '10px', color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', flexShrink: 0 }}>+ მიღება</button>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); handleSendFriendRequest(u.user_id); }}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <UserPlus style={{ width: '13px', height: '13px' }} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px', color: '#aaa', fontSize: '13px' }}>ვერ მოიძებნა</div>
              )}
              {filteredUsers.length > userDisplayCount && (
                <button onClick={() => setUserDisplayCount(p => p + 6)}
                  style={{ width: '100%', marginTop: '8px', padding: '8px', borderRadius: '10px', border: 'none', background: '#eef2ff', color: '#6366f1', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <ChevronDown style={{ width: '14px', height: '14px' }} />
                  კიდევ {Math.min(6, filteredUsers.length - userDisplayCount)}
                </button>
              )}
            </div>
          </aside>

          {/* ── CENTER FEED ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Mobile search */}
            <div className="lg:hidden" style={{ ...card, padding: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#a5b4fc' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძებნა..."
                  style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '12px', border: '2px solid #e8eaf6', fontSize: '14px', outline: 'none', background: '#fafafe', boxSizing: 'border-box', color: '#111' }} />
              </div>
            </div>

            {/* Create Post Box */}
            <div style={{ ...card, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8eaf6' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getAvatarColor(displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                    {avatarLetter}
                  </div>
                )}
                <button onClick={() => user ? setShowModal(true) : navigate('/auth')}
                  style={{ flex: 1, padding: '11px 18px', borderRadius: '24px', border: '2px solid #e8eaf6', background: '#fafafe', textAlign: 'left', color: '#aaa', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.background = '#f5f4ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.background = '#fafafe'; }}
                >
                  გააზიარეთ პოსტი, სტატია ან სიახლე...
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid #e8eaf6', paddingTop: '10px' }}>
                {[{ icon: Image, label: 'სურათი', color: '#818cf8' }, { icon: Video, label: 'ვიდეო', color: '#34d399' }, { icon: FileText, label: 'სტატია', color: '#f97316' }].map(({ icon: Icon, label, color }: any) => (
                  <button key={label} onClick={() => !user ? navigate('/auth') : setShowModal(true)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontSize: '13px', fontWeight: '600', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f4ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Icon style={{ width: '17px', height: '17px', color }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category tabs */}
            <div style={{ ...card, padding: '10px 14px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {CATS.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    style={{ padding: '6px 16px', borderRadius: '20px', border: isActive ? 'none' : '1.5px solid #e8eaf6', cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? '700' : '500', background: isActive ? cat.color : '#fff', color: isActive ? '#fff' : '#555', transition: 'all 0.15s', boxShadow: isActive ? `0 2px 8px ${cat.color}44` : 'none' }}>
                    {cat.label}
                  </button>
                );
              })}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#aaa' }}>{filteredPosts.length} პოსტი</span>
            </div>

            {/* Posts */}
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ ...card, padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e8eaf6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '13px', background: '#e8eaf6', borderRadius: '6px', marginBottom: '8px', width: '40%' }} />
                      <div style={{ height: '11px', background: '#f0f2fb', borderRadius: '6px', width: '25%' }} />
                    </div>
                  </div>
                  <div style={{ height: '15px', background: '#e8eaf6', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '13px', background: '#f0f2fb', borderRadius: '6px', width: '75%' }} />
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div style={{ ...card, padding: '56px 24px', textAlign: 'center', color: '#aaa' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>💬</div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#555', marginBottom: '6px' }}>პოსტები ვერ მოიძებნა</div>
                <div style={{ fontSize: '13px' }}>პირველი იყავი — შექმენი ახალი პოსტი!</div>
              </div>
            ) : filteredPosts.map((post) => {
              const authorName = post.profile?.full_name || 'CodeZero User';
              const authorAvatar = post.profile?.avatar_url;
              const liked = post.user_liked ?? false;
              const saved = savedPosts.has(post.id);
              const isHot = (post.likes_count ?? 0) >= 5 || (post.views_count ?? 0) >= 50;
              const cs = catStyle(post.category);
              return (
                <article key={post.id}
                  style={{ ...card, overflow: 'hidden', borderLeft: `4px solid ${cs.color}`, transition: 'box-shadow 0.15s, transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${cs.color}22`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Header */}
                  <div style={{ padding: '16px 16px 0 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8eaf6' }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getAvatarColor(authorName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#111' }}>{authorName}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          CodeZero · {formatTime(post.created_at)}
                          {isHot && <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}><Flame style={{ width: '10px', height: '10px' }} />ტრენდი</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', background: cs.bg, color: cs.color, fontSize: '11px', fontWeight: '700' }}>{cs.label}</span>
                      <button onClick={() => toggleSave(post.id)}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved ? '#6366f1' : '#bbb' }}>
                        <Bookmark style={{ width: '16px', height: '16px', fill: saved ? '#6366f1' : 'none' }} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '12px 16px 10px 14px', cursor: 'pointer' }} onClick={() => navigate(`/forums/${post.id}`)}>
                    <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#111', marginBottom: '6px', lineHeight: '1.45' }}>{post.title}</h3>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="" style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', borderRadius: '10px', marginTop: '12px', display: 'block' }} />}
                    {post.video_url && <video src={post.video_url} controls style={{ width: '100%', maxHeight: '380px', borderRadius: '10px', marginTop: '12px', display: 'block' }} />}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div style={{ padding: '0 16px 10px 14px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {post.tags.map(tag => (
                        <span key={tag} onClick={() => setSearchQuery(tag)} style={{ fontSize: '12px', color: '#6366f1', background: '#eef2ff', padding: '2px 9px', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' }}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  {((post.likes_count ?? 0) > 0 || (post.comments_count ?? 0) > 0) && (
                    <div style={{ padding: '0 16px 8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#888' }}>
                        {(post.likes_count ?? 0) > 0 && (
                          <><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ThumbsUp style={{ width: '9px', height: '9px', color: '#fff' }} />
                          </div> {post.likes_count}</>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {(post.comments_count ?? 0) > 0 && `${post.comments_count} კომენტარი`}
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #f0f2fb', margin: '0 12px' }} />

                  {/* Actions */}
                  <div style={{ padding: '3px 8px', display: 'flex', gap: '2px' }}>
                    {[
                      { icon: ThumbsUp, label: 'მოწონება', active: liked, action: () => handleToggleLike(post.id, liked) },
                      { icon: MessageSquare, label: 'კომენტარი', active: false, action: () => navigate(`/forums/${post.id}`) },
                      { icon: Share2, label: 'გაზიარება', active: false, action: () => navigator.clipboard?.writeText(window.location.origin + '/forums/' + post.id).then(() => toast.success('ბმული დაკოპირდა')).catch(() => toast.error('ვერ დაკოპირდა')) },
                    ].map(({ icon: Icon, label, active, action }: any) => (
                      <button key={label} onClick={action}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '10px 4px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? '#6366f1' : '#888', fontSize: '12px', fontWeight: active ? '700' : '500', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f5f4ff'; e.currentTarget.style.color = '#6366f1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#6366f1' : '#888'; }}>
                        <Icon style={{ width: '16px', height: '16px' }} />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden lg:block" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Search */}
            <div style={{ ...card, padding: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#a5b4fc' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძებნა..."
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '12px', border: '2px solid #e8eaf6', fontSize: '13px', outline: 'none', background: '#fafafe', boxSizing: 'border-box', color: '#111', transition: 'border-color 0.15s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e8eaf6')} />
              </div>
            </div>

            {/* Trending */}
            <div style={{ ...card, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '14px', color: '#111' }}>ტრენდული</h3>
                <TrendingUp style={{ width: '15px', height: '15px', color: '#6366f1' }} />
              </div>
              {trendingTopics.map((topic, i) => (
                <div key={topic.tag} onClick={() => setSearchQuery(topic.tag)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 8px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.12s', borderBottom: i < trendingTopics.length - 1 ? '1px solid #f0f2fb' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f4ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#111' }}>#{topic.tag}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>{topic.count} პოსტი</div>
                  </div>
                  <Tag style={{ width: '13px', height: '13px', color: '#6366f1' }} />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#a855f7 100%)', padding: '24px', textAlign: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>💡</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>გააზიარეთ ცოდნა</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px', lineHeight: '1.5' }}>დაეხმარეთ სხვა სტუდენტებს საკუთარი გამოცდილებით</div>
              <button onClick={() => user ? setShowModal(true) : navigate('/auth')}
                style={{ padding: '10px 24px', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6366f1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}>
                <Plus style={{ width: '13px', height: '13px', display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
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
