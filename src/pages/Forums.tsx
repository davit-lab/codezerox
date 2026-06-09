import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { Search, Plus, MessageSquare, ThumbsUp, Eye, Clock, TrendingUp, Flame, Code, Palette, Briefcase, HelpCircle, Calendar, User, Tag } from "lucide-react";
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

  const handleCreatePost = () => {
    if (!user) {
      toast.error('პოსტის შექმნისთვის საჭიროა ავტორიზაცია');
      navigate('/auth');
      return;
    }
    toast.info('პოსტის შექმნა მალე იქნება ხელმისაწვდომი');
  };

  return (
    <>
      <SEOHead title="ფორუმები" description="მონაწილეთ საზოგადოებაში და გააზიარეთ ცოდნა" path="/forums" />
      <Atmosphere />
      <Header />
      
      <main className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                ფორუმები
              </h1>
              <p className="text-white/60 text-lg">
                გააზიარეთ ცოდნა და დააკავშირეთ საზოგადოებას
              </p>
            </div>
            <button
              onClick={handleCreatePost}
              className="mt-4 md:mt-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              ახალი პოსტი
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ძებნა პოსტებში..."
                className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-lg outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Posts Grid */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-amber-500/30 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/forums/${post.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Author Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: getAvatarColor(post.author) }}
                  >
                    {post.author.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isHot && (
                        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          პოპულარული
                        </span>
                      )}
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-white/60 text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-lg bg-white/10 text-white/50 text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-white/40 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/40 text-lg">პოსტები ვერ მოიძებნა</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Forums;
