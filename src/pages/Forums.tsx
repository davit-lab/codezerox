import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { Search, Plus, MessageSquare, ThumbsUp, Share2, Send, Code, Palette, Briefcase, HelpCircle, TrendingUp, Flame, Tag, Bookmark, MoreHorizontal, Image, Video, FileText } from "lucide-react";
import { toast } from "sonner";

const Forums = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "ყველა", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
    { id: "programming", name: "პროგრამირება", icon: Code, color: "from-blue-500 to-cyan-500" },
    { id: "design", name: "დიზაინი", icon: Palette, color: "from-pink-500 to-rose-500" },
    { id: "business", name: "ბიზნესი", icon: Briefcase, color: "from-amber-500 to-orange-500" },
    { id: "help", name: "დახმარება", icon: HelpCircle, color: "from-emerald-500 to-teal-500" },
  ];

  const mockPosts = [
    {
      id: "1",
      title: "React კომპონენტების ოპტიმიზაცია - საუკეთესო პრაქტიკები",
      content: "გავნახოთ როგორ შეგვიძლია გავაუმჯობესოთ React აპლიკაციების წარმადოება...",
      author: "გიორგი ბერიძე",
      authorAvatar: null,
      category: "programming",
      tags: ["React", "Performance", "Optimization"],
      likes: 45,
      views: 234,
      replies: 12,
      createdAt: "2024-06-09T10:30:00",
      isHot: true
    },
    {
      id: "2",
      title: "UI/UX დიზაინის ტრენდები 2024 წელს",
      content: "რა არის ახალი და პოპულარული დიზაინში ამ წელს? განვიხილოთ უახლესი ტრენდები...",
      author: "ნინო ჩხეიძე",
      authorAvatar: null,
      category: "design",
      tags: ["UI/UX", "Trends", "2024"],
      likes: 38,
      views: 189,
      replies: 8,
      createdAt: "2024-06-08T15:45:00",
      isHot: true
    },
    {
      id: "3",
      title: "როგორ დავიწყო ფრილანსინგის კარიერა?",
      content: "გავიგოთ რა სჭირდება წარმატებული ფრილანსერის გახდომას...",
      author: "დავით მამარდაშვილი",
      authorAvatar: null,
      category: "business",
      tags: ["Freelancing", "Career", "Tips"],
      likes: 67,
      views: 456,
      replies: 23,
      createdAt: "2024-06-07T09:15:00",
      isHot: true
    },
    {
      id: "4",
      title: "Python საწყისი დონე - სადიდან დავიწყო?",
      content: "დამწყებთათვის განმარტებული გზამკვლევი Python-ის შესწავლისთვის...",
      author: "ლევან კაკაბაძე",
      authorAvatar: null,
      category: "help",
      tags: ["Python", "Beginner", "Learning"],
      likes: 23,
      views: 145,
      replies: 15,
      createdAt: "2024-06-06T14:20:00",
      isHot: false
    },
    {
      id: "5",
      title: "TypeScript vs JavaScript - რას ავირჩიო?",
      content: "შევადაროთ TypeScript და JavaScript და გავიგოთ რომელი უკეთესაა თქვენი პროექტისთვის...",
      author: "მარიამ ალექსიძე",
      authorAvatar: null,
      category: "programming",
      tags: ["TypeScript", "JavaScript", "Comparison"],
      likes: 56,
      views: 312,
      replies: 18,
      createdAt: "2024-06-05T11:00:00",
      isHot: true
    },
    {
      id: "6",
      title: "Figma პლაგინები რომლებიც უნდა იცოდეთ",
      content: "განვიხილოთ საუკეთესო Figma პლაგინები რომლებიც გაადვილებს თქვენს სამუშაოს...",
      author: "ანა გიორგაძე",
      authorAvatar: null,
      category: "design",
      tags: ["Figma", "Plugins", "Productivity"],
      likes: 31,
      views: 178,
      replies: 7,
      createdAt: "2024-06-04T16:30:00",
      isHot: false
    }
  ];

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getAvatarColor = (name: string) => {
    const colors = ['#5b6abf', '#bf5b7a', '#5bab8f', '#a67bbf', '#bf8c5b', '#6b8fbf', '#8fbf5b', '#bf5b5b'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "ახლახანს";
    if (diffMins < 60) return `${diffMins} წუთის წინ`;
    if (diffHours < 24) return `${diffHours} საათის წინ`;
    if (diffDays < 7) return `${diffDays} დღის წინ`;
    return date.toLocaleDateString('ka-GE');
  };

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [newPostText, setNewPostText] = useState("");

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreatePost = () => {
    if (!user) { navigate('/auth'); return; }
    if (!newPostText.trim()) return;
    toast.success('პოსტი გამოქვეყნდა!');
    setNewPostText("");
  };

  const trendingTopics = [
    { tag: "React", posts: 142 },
    { tag: "Python", posts: 98 },
    { tag: "TypeScript", posts: 76 },
    { tag: "UI/UX", posts: 54 },
    { tag: "Freelancing", posts: 43 },
  ];

  return (
    <>
      <SEOHead title="ფორუმები" description="მონაწილეთ საზოგადოებაში და გააზიარეთ ცოდნა" path="/forums" />
      <Atmosphere />
      <Header />

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
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: getAvatarColor(user?.email || 'U'),
                  border: '3px solid #fff', margin: '-36px auto 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 'bold', color: '#fff',
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ fontWeight: '600', fontSize: '16px', color: '#000', marginBottom: '2px' }}>
                  {user?.email?.split('@')[0] || 'სტუმარი'}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>CodeZero Academy წევრი</div>
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#0a66c2' }}>24</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>პოსტი</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#0a66c2' }}>138</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>კავშირი</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#0a66c2' }}>7</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>სერტ.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Nav */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '8px 0' }}>
              <div style={{ padding: '8px 16px 4px', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>კატეგორიები</div>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 16px',
                      background: isActive ? '#e8f0fe' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      color: isActive ? '#0a66c2' : '#333',
                      fontWeight: isActive ? '600' : '400',
                      fontSize: '14px',
                      borderLeft: isActive ? '3px solid #0a66c2' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                    {cat.name}
                  </button>
                );
              })}
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
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: getAvatarColor(user?.email || 'U'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0,
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  onClick={() => !user && navigate('/auth')}
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
                  { icon: Video, label: 'ვიდეო', color: '#7fc15e' },
                  { icon: FileText, label: 'სტატია', color: '#e06847' },
                ].map(({ icon: Icon, label, color }) => (
                  <button key={label} onClick={() => !user ? navigate('/auth') : toast.info(`${label} მალე`)}
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
            {filteredPosts.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center', color: '#666' }}>
                პოსტები ვერ მოიძებნა
              </div>
            ) : filteredPosts.map((post) => {
              const liked = likedPosts.has(post.id);
              const saved = savedPosts.has(post.id);
              return (
                <article key={post.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  {/* Post Header */}
                  <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: getAvatarColor(post.author),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0,
                      }}>
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#000', lineHeight: '1.3' }}>{post.author}</div>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>CodeZero Academy • {formatTime(post.createdAt)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {post.isHot && (
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#0a66c2' }}>
                        <ThumbsUp style={{ width: '10px', height: '10px', color: '#fff' }} />
                      </div>
                      {post.likes + (liked ? 1 : 0)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {post.replies} კომენტარი • {post.views} ნახვა
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid #e0e0e0', margin: '0 16px' }} />

                  {/* Action buttons */}
                  <div style={{ padding: '4px 8px', display: 'flex', gap: '2px' }}>
                    {[
                      { icon: ThumbsUp, label: 'მოწონება', active: liked, action: () => toggleLike(post.id), activeColor: '#0a66c2' },
                      { icon: MessageSquare, label: 'კომენტარი', active: false, action: () => navigate(`/forums/${post.id}`), activeColor: '#0a66c2' },
                      { icon: Share2, label: 'გაზიარება', active: false, action: () => toast.success('ბმული დაკოპირდა'), activeColor: '#0a66c2' },
                      { icon: Send, label: 'გაგზავნა', active: false, action: () => toast.info('გაგზავნა'), activeColor: '#0a66c2' },
                    ].map(({ icon: Icon, label, active, action, activeColor }) => (
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
                onClick={handleCreatePost}
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
