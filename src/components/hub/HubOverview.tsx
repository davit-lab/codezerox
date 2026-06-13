import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHubProjects, HubProject } from '@/hooks/useHubProjects';
import { useOnlineUsers } from '@/hooks/useCommunityChat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Flame, TrendingUp, Users, FolderGit2, MessageCircle, Code2,
  BookOpen, Trophy, ArrowRight, Heart, Eye,
  Terminal, Lightbulb, GraduationCap, Star, Layers, Award, Target,
  Gift, Copy, Clock,
} from 'lucide-react';
import { useUserXPBalance, useActiveXPPromos, useRedeemXP, XP_TIERS } from '@/hooks/useUserXP';

const QUICK_ACTIONS = [
  { id: 'projects', icon: FolderGit2, label: 'პროექტები', desc: 'დადე ნამუშევარი', color: 'bg-purple-600' },
  { id: 'chat', icon: MessageCircle, label: 'ჩატი', desc: 'წერე და უპასუხე', color: 'bg-blue-600' },
  { id: 'snippets', icon: Code2, label: 'სნიპეტები', desc: 'კოდის ნაწყვეტები', color: 'bg-emerald-600' },
  { id: 'resources', icon: BookOpen, label: 'რესურსები', desc: 'ლინკები და roadmap', color: 'bg-amber-600' },
  { id: 'challenges', icon: Trophy, label: 'გამოწვევები', desc: 'კოდინგ ამოცანები', color: 'bg-rose-600' },
];

const SKILL_LEVELS = [
  { icon: Layers, label: 'დამწყები', desc: 'HTML, CSS, JS საფუძვლები', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: Award, label: 'საშუალო', desc: 'ფრეიმვორკები და პროექტები', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Target, label: 'გამოცდილი', desc: 'system design და devops', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

interface HubOverviewProps {
  onNavigate: (view: string) => void;
}

const HubOverview = ({ onNavigate }: HubOverviewProps) => {
  const { user } = useAuth();
  const { data: projects = [] } = useHubProjects('popular');
  const onlineUsers = useOnlineUsers();

  const trendingProjects = projects.slice(0, 4);
  const totalLikes = projects.reduce((sum, p) => sum + p.likes_count, 0);
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 bg-purple-900/[0.07]" />

          <div className="relative p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                {/* Online counter removed */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                  დეველოპერების
                  <span className="text-purple-400"> ჰაბი</span>
                </h1>
                <p className="text-sm md:text-base text-white/50 max-w-lg leading-relaxed">
                  პროექტები, ჩატი, სნიპეტები და გამოწვევები ერთ ადგილას.
                </p>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                  { value: projects.length, label: 'პროექტი', icon: FolderGit2, color: 'text-violet-400' },
                  { value: totalLikes, label: 'მოწონება', icon: Heart, color: 'text-rose-400' },
                  { value: totalViews, label: 'ნახვა', icon: Eye, color: 'text-blue-400' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 md:p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl backdrop-blur-sm">
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1.5`} />
                    <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] md:text-xs text-white/40 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-white">სწრაფი მოქმედებები</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group relative p-4 md:p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-200 text-left overflow-hidden hover:border-white/[0.12]"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-sm text-white mb-0.5">{action.label}</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Trending Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-white">ტრენდული პროექტები</h2>
              </div>
              <button onClick={() => onNavigate('projects')} className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                ყველა <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {trendingProjects.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
                <FolderGit2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">ჯერ არაფერია დამატებული</p>
                {user && (
                  <button onClick={() => onNavigate('projects')} className="mt-3 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl text-xs font-semibold hover:bg-purple-500/30 transition-colors">
                    პროექტის დამატება
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trendingProjects.map((project) => (
                  <TrendingProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Online Users */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">ონლაინ</h3>
                </div>
                <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-full">{onlineUsers.length}</span>
              </div>
              <div className="p-3 space-y-1 max-h-48 overflow-y-auto">
                {onlineUsers.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-3">არავინ არ არის ონლაინ</p>
                ) : (
                  onlineUsers.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-7 h-7">
                          {u.avatar && <AvatarImage src={u.avatar} />}
                          <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                            {u.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c0c10]" />
                      </div>
                      <span className="text-xs text-white/70 truncate">{u.name}</span>
                    </div>
                  ))
                )}
                {onlineUsers.length > 8 && (
                  <p className="text-[10px] text-white/30 text-center pt-1">+{onlineUsers.length - 8} სხვა</p>
                )}
              </div>
            </div>

            {/* XP Rewards */}
            <XPRewardsWidget />

            {/* Skill Levels */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">დონეები</h3>
              </div>
              <div className="p-3 space-y-2">
                {SKILL_LEVELS.map((level) => (
                  <div key={level.label} className={`flex items-center gap-3 p-3 rounded-xl ${level.bg} border ${level.border}`}>
                    <level.icon className={`w-5 h-5 ${level.color} flex-shrink-0`} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white">{level.label}</h4>
                      <p className="text-[10px] text-white/40 truncate">{level.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">რჩევა</h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-white/50 leading-relaxed">
                  დადე პროექტი და ნახე რა ეტყვიან სხვები.
                </p>
                <button
                  onClick={() => onNavigate('projects')}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  პროექტის გაზიარება
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingProjectCard = ({ project }: { project: HubProject }) => (
  <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] transition-all duration-200">
    {/* Thumbnail */}
    {project.screenshot_url ? (
      <div className="h-36 overflow-hidden bg-white/[0.03]">
        <img src={project.screenshot_url} alt={project.title} className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className="h-28 bg-white/[0.04] flex items-center justify-center">
        <Code2 className="w-8 h-8 text-white/15" />
      </div>
    )}
    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg">
      <TrendingUp className="w-3 h-3 text-orange-400" />
      <span className="text-[10px] font-bold text-white/80">{project.views}</span>
    </div>

    <div className="p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-white truncate">{project.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Avatar className="w-4 h-4">
              {project.profile?.avatar_url && <AvatarImage src={project.profile.avatar_url} />}
              <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[8px]">
                {(project.profile?.full_name || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-white/40 truncate">{project.profile?.full_name || 'ანონიმური'}</span>
          </div>
        </div>
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-[10px] font-semibold rounded-md border border-purple-500/20">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1.5 border-t border-white/[0.06]">
        <span className="flex items-center gap-1 text-[11px] text-rose-400">
          <Heart className="w-3 h-3" /> {project.likes_count}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-blue-400">
          <MessageCircle className="w-3 h-3" /> {project.comments_count}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-white/30 ml-auto">
          <Star className="w-3 h-3" />
        </span>
      </div>
    </div>
  </div>
);

// XP Rewards Widget
const XPRewardsWidget = () => {
  const { user } = useAuth();
  const { data: xpData } = useUserXPBalance();
  const { data: activePromos = [] } = useActiveXPPromos();
  const redeemXP = useRedeemXP();

  if (!user) return null;

  const balance = xpData?.balance || 0;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    import('sonner').then(m => m.toast.success('კოპირებულია!'));
  };

  const timeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'ვადა გასულია';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}სთ ${mins}წთ`;
  };

  // Filter active (non-expired, unused) promos
  const validPromos = activePromos.filter(
    p => p.is_active && p.current_uses < p.max_uses && new Date(p.expires_at) > new Date()
  );

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">XP ქულები</h3>
        </div>
        <span className="text-xs font-bold text-amber-400">{balance} XP</span>
      </div>

      <div className="p-3 space-y-2">
        {/* Progress towards tiers */}
        {XP_TIERS.map(tier => {
          const progress = Math.min(100, (balance / tier.cost) * 100);
          const canRedeem = balance >= tier.cost;
          return (
            <div key={tier.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-white/50">
                  <span className="font-bold text-white/70">{tier.cost} XP</span> → {tier.label}
                </span>
                {canRedeem ? (
                  <button
                    onClick={() => redeemXP.mutate(tier.id as '500' | '1000')}
                    disabled={redeemXP.isPending}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-40"
                  >
                    <Gift className="w-3 h-3" />
                    {redeemXP.isPending ? '...' : 'გადაცვლა'}
                  </button>
                ) : (
                  <span className="text-[10px] text-white/25">{balance}/{tier.cost}</span>
                )}
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500/60 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Active promo codes */}
        {validPromos.length > 0 && (
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider px-1">აქტიური კოდები</p>
            {validPromos.map(promo => (
              <div key={promo.code} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="flex-1 text-[11px] font-mono font-bold text-emerald-400 tracking-wider">{promo.code}</span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {timeLeft(promo.expires_at)}
                </span>
                <button
                  onClick={() => copyCode(promo.code)}
                  className="p-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info text */}
        <p className="text-[10px] text-white/25 leading-relaxed px-1 pt-1">
          გამოწვევებში მონაწილეობით აგროვებ XP-ს. გადაცვალე ფასდაკლების კოდში (48სთ ვადა).
        </p>
      </div>
    </div>
  );
};

export default HubOverview;
