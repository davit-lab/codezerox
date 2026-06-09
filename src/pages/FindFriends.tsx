import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useFriends, useSendFriendRequest, useAreFriends } from "@/hooks/useFriends";
import SEOHead from "@/components/SEOHead";
import { Search, UserPlus, Check, X, MessageCircle, MapPin, Calendar, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "sonner";

const FindFriends = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: friends } = useFriends();
  const sendFriendRequest = useSendFriendRequest();
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Mock users data - in real app, this would come from profiles table
  const mockUsers = [
    {
      id: "1",
      full_name: "გიორგი ბერიძე",
      avatar_url: null,
      bio: "ფრონტენდ დეველოპერი, React სპეციალისტი",
      location: "თბილისი, საქართველო",
      joined: "2024-01-15",
      skills: ["React", "TypeScript", "Node.js"],
      education: "თსუ",
      occupation: "დეველოპერი"
    },
    {
      id: "2",
      full_name: "ნინო ჩხეიძე",
      avatar_url: null,
      bio: "UI/UX დიზაინერი, მომწობრე ილუსტრატორი",
      location: "ბათუმი, საქართველო",
      joined: "2024-02-20",
      skills: ["Figma", "Adobe XD", "Illustrator"],
      education: "თსუ",
      occupation: "დიზაინერი"
    },
    {
      id: "3",
      full_name: "დავით მამარდაშვილი",
      avatar_url: null,
      bio: "Full-stack დეველოპერი, Python ენთუზიასტი",
      location: "ქუთაისი, საქართველო",
      joined: "2023-11-10",
      skills: ["Python", "Django", "PostgreSQL"],
      education: "ილიას სახელმწიფო უნივერსიტეტი",
      occupation: "დეველოპერი"
    },
    {
      id: "4",
      full_name: "ანა გიორგაძე",
      avatar_url: null,
      bio: "მარკეტინგის სპეციალისტი, კონტენტ კრეატორი",
      location: "რუსთავი, საქართველო",
      joined: "2024-03-05",
      skills: ["SEO", "Social Media", "Content Writing"],
      education: "თსუ",
      occupation: "მარკეტერი"
    },
    {
      id: "5",
      full_name: "ლევან კაკაბაძე",
      avatar_url: null,
      bio: "მობილური აპლიკაციების დეველოპერი",
      location: "თბილისი, საქართველო",
      joined: "2023-12-01",
      skills: ["React Native", "Flutter", "iOS"],
      education: "თსუ",
      occupation: "დეველოპერი"
    },
    {
      id: "6",
      full_name: "მარიამ ალექსიძე",
      avatar_url: null,
      bio: "მონაცემთა ანალიტიკოსი, მანქინ ლერნინგის სპეციალისტი",
      location: "თბილისი, საქართველო",
      joined: "2024-01-20",
      skills: ["Python", "TensorFlow", "SQL"],
      education: "თსუ",
      occupation: "ანალიტიკოსი"
    }
  ];

  const filteredUsers = mockUsers.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendRequest = async (userId: string) => {
    if (userId === user?.id) return;
    
    try {
      await sendFriendRequest.mutateAsync(userId);
      setPendingRequests(prev => new Set(prev).add(userId));
      toast.success('მეგობრობის მოთხოვნა გაგზავნილია');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('მოთხოვნის გაგზავნა ვერ მოხერხდა');
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#5b6abf', '#bf5b7a', '#5bab8f', '#a67bbf', '#bf8c5b', '#6b8fbf', '#8fbf5b', '#bf5b5b'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const isFriend = (userId: string) => {
    return friends?.some(f => f.friend_id === userId);
  };

  return (
    <>
      <SEOHead title="მეგობრების ძიება" description="იპოვეთ ახალი მეგობრები CodeZero Academy-ზე" path="/find-friends" />
      <Atmosphere />
      <Header />
      
      <main className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              მეგობრების <span className="text-amber-500">ძიება</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              დააკავშირეთ სხვა მოსწავლეებთან და პროფესიონალებთან
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ძებნა სახელით ან უნარებით..."
                className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-lg outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const friendStatus = isFriend(user.id);
              const isPending = pendingRequests.has(user.id);
              
              return (
                <div
                  key={user.id}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:border-amber-500/30 transition-all duration-300 hover:transform hover:scale-[1.02] group"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                      style={{ background: getAvatarColor(user.full_name) }}
                    >
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate">{user.full_name}</h3>
                      <p className="text-white/50 text-sm truncate">{user.occupation}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{user.bio}</p>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <GraduationCap className="w-4 h-4" />
                      <span>{user.education}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>შემოუერთდა {new Date(user.joined).toLocaleDateString('ka-GE')}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {friendStatus ? (
                      <button
                        className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold flex items-center justify-center gap-2"
                        disabled
                      >
                        <Check className="w-4 h-4" />
                        მეგობარი
                      </button>
                    ) : isPending ? (
                      <button
                        className="flex-1 py-3 rounded-xl bg-amber-500/20 text-amber-400 font-semibold flex items-center justify-center gap-2"
                        disabled
                      >
                        <X className="w-4 h-4" />
                        მოთხოვნა გაგზავნილია
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                      >
                        <UserPlus className="w-4 h-4" />
                        მეგობრობის მოთხოვნა
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/direct-chat?user=${user.id}`)}
                      className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/40 text-lg">მომხმარებლები ვერ მოიძებნა</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default FindFriends;
