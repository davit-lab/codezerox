import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useHubChallenges,
  useJoinChallenge,
  useLeaveChallenge,
  useChallengeLeaderboard,
  HubChallenge,
} from '@/hooks/useHubChallenges';
import {
  useChallengeSubmissions,
  useMySubmission,
  useSubmitCode,
  usePickWinner,
  ChallengeSubmission,
} from '@/hooks/useChallengeSubmissions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Trophy, Clock, Users, Star, Flame, Target,
  ChevronRight, CheckCircle2, Code2, Circle,
  Calendar, Crown, Medal, Award, Send, Eye,
  Globe, Palette, Braces, Copy, Check,
} from 'lucide-react';

const DIFFICULTY_STYLES = {
  easy: { label: 'მარტივი', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Circle },
  medium: { label: 'საშუალო', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Target },
  hard: { label: 'რთული', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Flame },
};

const STATUS_STYLES = {
  active: { label: 'მიმდინარე', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  upcoming: { label: 'მალე', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  completed: { label: 'დასრულდა', color: 'text-white/40', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]', dot: 'bg-white/30' },
};

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ['text-amber-400', 'text-gray-300', 'text-amber-600'];

const HubChallenges = () => {
  const { user, isAdmin } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const { data: challenges = [], isLoading } = useHubChallenges(filter);
  const { data: leaderboard = [] } = useChallengeLeaderboard();
  const joinChallenge = useJoinChallenge();
  const leaveChallenge = useLeaveChallenge();

  const daysUntil = (date: string | null) => {
    if (!date) return '';
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 1) return `${days} დღე`;
    if (days === 1) return '1 დღე';
    if (days === 0) return 'დღეს';
    return 'დასრულდა';
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const totalParticipants = challenges.reduce((s, c) => s + c.participants_count, 0);
  const totalXP = challenges.reduce((s, c) => s + c.points, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">გამოწვევები</h2>
            <p className="text-[11px] text-white/30">{challenges.length} გამოწვევა</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          {[
            { id: 'all' as const, label: 'ყველა' },
            { id: 'active' as const, label: 'მიმდინარე' },
            { id: 'upcoming' as const, label: 'მალე' },
            { id: 'completed' as const, label: 'დასრულებული' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Challenges List */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-16">
                <Target className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">ამ კატეგორიაში გამოწვევები ჯერ არაა</p>
              </div>
            ) : (
              challenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isExpanded={expandedId === challenge.id}
                  onToggle={() => setExpandedId(expandedId === challenge.id ? null : challenge.id)}
                  user={user}
                  isAdmin={!!isAdmin}
                  daysUntil={daysUntil}
                  onJoin={() => joinChallenge.mutate(challenge.id)}
                  onLeave={() => leaveChallenge.mutate(challenge.id)}
                  isJoining={joinChallenge.isPending}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Leaderboard - real users */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">ტოპ მონაწილეები</h3>
              </div>
              <div className="p-3 space-y-1">
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-white/25 text-center py-4">ჯერ არავინაა</p>
                ) : (
                  leaderboard.map((entry, idx) => {
                    const RankIcon = idx < 3 ? RANK_ICONS[idx] : null;
                    const rankColor = idx < 3 ? RANK_COLORS[idx] : 'text-white/30';
                    return (
                      <div key={entry.user_id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                          idx < 3 ? 'bg-white/[0.03]' : 'hover:bg-white/[0.03]'
                        }`}>
                        <div className="w-8 flex items-center justify-center">
                          {RankIcon ? (
                            <RankIcon className={`w-5 h-5 ${rankColor}`} />
                          ) : (
                            <span className="text-xs font-bold text-white/30">#{idx + 1}</span>
                          )}
                        </div>
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
                          <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                            {(entry.full_name || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-xs font-medium text-white/70 truncate">
                          {entry.full_name || 'მომხმარებელი'}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{entry.total_points} XP</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">სტატისტიკა</h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'მიმდინარე', value: activeChallenges.length, color: 'text-emerald-400' },
                  { label: 'მონაწილეები', value: totalParticipants, color: 'text-blue-400' },
                  { label: 'სულ XP', value: totalXP, color: 'text-amber-400' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Challenge Card Component
const ChallengeCard = ({
  challenge, isExpanded, onToggle, user, isAdmin, daysUntil, onJoin, onLeave, isJoining,
}: {
  challenge: HubChallenge;
  isExpanded: boolean;
  onToggle: () => void;
  user: any;
  isAdmin: boolean;
  daysUntil: (d: string | null) => string;
  onJoin: () => void;
  onLeave: () => void;
  isJoining: boolean;
}) => {
  const diffStyle = DIFFICULTY_STYLES[challenge.difficulty];
  const statusStyle = STATUS_STYLES[challenge.status];
  const DiffIcon = diffStyle.icon;

  const [showEditor, setShowEditor] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [code, setCode] = useState({ html: '', css: '', js: '', notes: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [bonusXp, setBonusXp] = useState('200');
  const [feedback, setFeedback] = useState('');

  const { data: mySubmission } = useMySubmission(isExpanded ? challenge.id : null);
  const { data: submissions = [] } = useChallengeSubmissions(isExpanded && (showSubmissions || isAdmin) ? challenge.id : null);
  const submitCode = useSubmitCode();
  const pickWinner = usePickWinner();

  const handleSubmit = () => {
    if (!code.html && !code.css && !code.js) return;
    submitCode.mutate({
      challengeId: challenge.id,
      html_code: code.html,
      css_code: code.css,
      js_code: code.js,
      notes: code.notes,
    }, {
      onSuccess: () => {
        setShowEditor(false);
        setCode({ html: '', css: '', js: '', notes: '' });
      },
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePickWinner = (submissionId: string) => {
    pickWinner.mutate({
      submissionId,
      bonusXp: parseInt(bonusXp) || 200,
      feedback: feedback || undefined,
    }, {
      onSuccess: () => {
        setReviewId(null);
        setFeedback('');
        setBonusXp('200');
      },
    });
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      isExpanded ? 'border-purple-500/20 bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
    } ${challenge.status === 'completed' ? 'opacity-60' : ''}`}>

      <button onClick={onToggle} className="w-full p-4 md:p-5 text-left">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl ${diffStyle.bg} border ${diffStyle.border} flex items-center justify-center flex-shrink-0`}>
            <DiffIcon className={`w-5 h-5 ${diffStyle.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.color} flex items-center gap-1`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffStyle.bg} ${diffStyle.border} ${diffStyle.color}`}>
                {diffStyle.label}
              </span>
              <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-md">{challenge.category}</span>
            </div>
            <h3 className="font-bold text-sm text-white mb-1">{challenge.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{challenge.description}</p>

            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <Star className="w-3 h-3" /> {challenge.points} XP
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white/30">
                <Users className="w-3 h-3" /> {challenge.participants_count}
              </span>
              {challenge.deadline && (
                <span className="flex items-center gap-1 text-[11px] text-white/30">
                  <Clock className="w-3 h-3" /> {daysUntil(challenge.deadline)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-white/15 transition-transform flex-shrink-0 mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 md:px-5 pb-5 space-y-4">
          {/* Tasks */}
          <div>
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              რა უნდა გააკეთო
            </h4>
            <div className="space-y-2">
              {challenge.tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-white/40">{idx + 1}</span>
                  </div>
                  <span className="text-xs text-white/50 leading-relaxed">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Join / Leave / Status */}
          {challenge.status === 'active' && user && !challenge.user_has_joined && (
            <button
              onClick={onJoin}
              disabled={isJoining}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 transition-colors disabled:opacity-40"
            >
              <Code2 className="w-4 h-4" />
              {isJoining ? 'ერთვება...' : 'ჩაერთე'}
            </button>
          )}
          {challenge.status === 'active' && user && challenge.user_has_joined && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                ჩართული ხარ
              </div>
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                {mySubmission ? 'კოდის განახლება' : 'კოდის გაგზავნა'}
              </button>
              <button
                onClick={onLeave}
                className="text-[11px] text-white/30 hover:text-red-400 transition-colors"
              >
                გასვლა
              </button>
            </div>
          )}
          {challenge.status === 'upcoming' && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 font-medium">
              <Calendar className="w-4 h-4" />
              მალე დაიწყება
            </div>
          )}
          {challenge.status === 'completed' && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white/30">
              <CheckCircle2 className="w-4 h-4" />
              დასრულდა
            </div>
          )}

          {/* My submission status */}
          {mySubmission && !showEditor && (
            <div className={`p-3 rounded-xl border ${
              mySubmission.status === 'winner' ? 'bg-amber-500/5 border-amber-500/20' :
              mySubmission.status === 'reviewed' ? 'bg-blue-500/5 border-blue-500/20' :
              'bg-white/[0.02] border-white/[0.06]'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {mySubmission.status === 'winner' && <Crown className="w-4 h-4 text-amber-400" />}
                {mySubmission.status === 'reviewed' && <Eye className="w-4 h-4 text-blue-400" />}
                {mySubmission.status === 'submitted' && <Clock className="w-4 h-4 text-white/30" />}
                <span className={`text-xs font-bold ${
                  mySubmission.status === 'winner' ? 'text-amber-400' :
                  mySubmission.status === 'reviewed' ? 'text-blue-400' :
                  'text-white/40'
                }`}>
                  {mySubmission.status === 'winner' ? `გამარჯვებული! +${mySubmission.bonus_xp} XP` :
                   mySubmission.status === 'reviewed' ? 'გადახედულია' : 'გაგზავნილია — ელოდება გადახედვას'}
                </span>
              </div>
              {mySubmission.admin_feedback && (
                <p className="text-[11px] text-white/40 mt-1">ფიდბექი: {mySubmission.admin_feedback}</p>
              )}
            </div>
          )}

          {/* Code Editor */}
          {showEditor && challenge.user_has_joined && (
            <div className="space-y-3 p-4 rounded-xl border border-purple-500/20 bg-white/[0.02]">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                კოდის რედაქტორი
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-orange-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> HTML
                  </label>
                  <textarea
                    value={code.html}
                    onChange={e => setCode({ ...code, html: e.target.value })}
                    placeholder="<div>...</div>"
                    rows={8}
                    className="w-full px-3 py-2 bg-black/30 border border-white/[0.06] rounded-lg text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-mono leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                    <Palette className="w-3 h-3" /> CSS
                  </label>
                  <textarea
                    value={code.css}
                    onChange={e => setCode({ ...code, css: e.target.value })}
                    placeholder=".class { ... }"
                    rows={8}
                    className="w-full px-3 py-2 bg-black/30 border border-white/[0.06] rounded-lg text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-mono leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-yellow-400 flex items-center gap-1">
                    <Braces className="w-3 h-3" /> JavaScript
                  </label>
                  <textarea
                    value={code.js}
                    onChange={e => setCode({ ...code, js: e.target.value })}
                    placeholder="const fn = () => ..."
                    rows={8}
                    className="w-full px-3 py-2 bg-black/30 border border-white/[0.06] rounded-lg text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-mono leading-relaxed"
                  />
                </div>
              </div>

              <textarea
                value={code.notes}
                onChange={e => setCode({ ...code, notes: e.target.value })}
                placeholder="კომენტარი (არასავალდებულო)"
                rows={2}
                className="w-full px-3 py-2 bg-black/30 border border-white/[0.06] rounded-lg text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitCode.isPending || (!code.html && !code.css && !code.js)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitCode.isPending ? 'იგზავნება...' : mySubmission ? 'განახლება' : 'გაგზავნა'}
                </button>
              </div>
            </div>
          )}

          {/* View submissions button + admin panel */}
          {(isAdmin || challenge.status === 'completed') && (
            <button
              onClick={() => setShowSubmissions(!showSubmissions)}
              className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              <Eye className="w-3.5 h-3.5" />
              {showSubmissions ? 'დამალვა' : `ნამუშევრების ნახვა (${submissions.length})`}
            </button>
          )}

          {/* Submissions list */}
          {showSubmissions && submissions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                ნამუშევრები ({submissions.length})
              </h4>
              {submissions.map(sub => (
                <div key={sub.id} className={`rounded-xl border overflow-hidden ${
                  sub.status === 'winner' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.06] bg-white/[0.02]'
                }`}>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        {sub.profile?.avatar_url && <AvatarImage src={sub.profile.avatar_url} />}
                        <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[8px] font-bold">
                          {(sub.profile?.full_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-white/70">{sub.profile?.full_name || 'მომხმარებელი'}</span>
                      {sub.status === 'winner' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Crown className="w-3 h-3" /> გამარჯვებული
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/20">
                      {new Date(sub.created_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Code preview */}
                  <div className="px-3 pb-3 space-y-2">
                    {sub.html_code && (
                      <SubmissionCodeBlock label="HTML" code={sub.html_code} id={`${sub.id}-html`}
                        onCopy={handleCopy} copiedId={copiedId} color="text-orange-400" />
                    )}
                    {sub.css_code && (
                      <SubmissionCodeBlock label="CSS" code={sub.css_code} id={`${sub.id}-css`}
                        onCopy={handleCopy} copiedId={copiedId} color="text-blue-400" />
                    )}
                    {sub.js_code && (
                      <SubmissionCodeBlock label="JS" code={sub.js_code} id={`${sub.id}-js`}
                        onCopy={handleCopy} copiedId={copiedId} color="text-yellow-400" />
                    )}
                    {sub.notes && (
                      <p className="text-[11px] text-white/30 italic px-1">{sub.notes}</p>
                    )}
                  </div>

                  {/* Admin: pick winner */}
                  {isAdmin && sub.status === 'submitted' && (
                    <div className="px-3 pb-3">
                      {reviewId === sub.id ? (
                        <div className="space-y-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex gap-2">
                            <input
                              value={bonusXp}
                              onChange={e => setBonusXp(e.target.value)}
                              placeholder="XP"
                              className="w-20 px-2 py-1.5 bg-black/30 border border-white/[0.06] rounded-lg text-xs text-white/80 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                            />
                            <input
                              value={feedback}
                              onChange={e => setFeedback(e.target.value)}
                              placeholder="ფიდბექი (არასავალდებულო)"
                              className="flex-1 px-2 py-1.5 bg-black/30 border border-white/[0.06] rounded-lg text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePickWinner(sub.id)}
                              disabled={pickWinner.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[11px] font-semibold hover:bg-amber-500 transition-colors disabled:opacity-40"
                            >
                              <Crown className="w-3 h-3" />
                              {pickWinner.isPending ? '...' : 'გამარჯვებული'}
                            </button>
                            <button onClick={() => setReviewId(null)} className="text-[11px] text-white/30 hover:text-white/50">გაუქმება</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewId(sub.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-[11px] font-semibold hover:bg-amber-500/20 transition-colors"
                        >
                          <Award className="w-3 h-3" />
                          გამარჯვებულად არჩევა
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {showSubmissions && submissions.length === 0 && (
            <p className="text-xs text-white/25 text-center py-4">ჯერ არავის გაუგზავნია კოდი</p>
          )}
        </div>
      )}
    </div>
  );
};

// Code block for submissions view
const SubmissionCodeBlock = ({ label, code, id, onCopy, copiedId, color }: {
  label: string; code: string; id: string;
  onCopy: (code: string, id: string) => void;
  copiedId: string | null; color: string;
}) => (
  <div className="rounded-lg border border-white/[0.04] overflow-hidden">
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
      <span className={`text-[10px] font-bold ${color}`}>{label}</span>
      <button onClick={() => onCopy(code, id)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-white/30 hover:text-white/60 transition-colors">
        {copiedId === id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
      </button>
    </div>
    <pre className="p-2.5 text-[10px] text-white/50 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap bg-black/20 max-h-32">
      {code}
    </pre>
  </div>
);

export default HubChallenges;
