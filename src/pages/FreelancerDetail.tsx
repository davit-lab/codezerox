import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import freelancersHeroBg from "@/assets/freelancers-hero-bg.jpg";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { useFreelancerProfile } from "@/hooks/useFreelancers";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrGetConversation } from "@/hooks/useDirectChat";
import { useFreelancerReviews, useFreelancerAverageRating, useCreateFreelancerReview, useDeleteFreelancerReview } from "@/hooks/useFreelancerReviews";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, ArrowLeft, DollarSign, MessageCircle, Globe, Github, Globe2, Briefcase, Star, Trash2, Send } from "lucide-react";

const AVAILABILITY_COLORS: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  busy: 'bg-red-500/20 text-red-300 border-red-500/40',
  open_to_offers: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};
const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'ხელმისაწვდომი', busy: 'დაკავებული', open_to_offers: 'ღია შეთავაზებებისთვის',
};
const EXPERIENCE_LABELS: Record<string, string> = {
  junior: 'Junior', mid: 'Mid-Level', senior: 'Senior', lead: 'Lead / Expert',
};
const EXPERIENCE_COLORS: Record<string, string> = {
  junior: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  mid: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  senior: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  lead: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};
const SKILL_COLORS = [
  'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
];

const StarRatingInput = ({ rating, onRate, size = 24 }: { rating: number; onRate: (r: number) => void; size?: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} type="button" onClick={() => onRate(s)} className="transition-transform hover:scale-110">
        <Star className={`w-${size === 24 ? 6 : 5} h-${size === 24 ? 6 : 5} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      </button>
    ))}
  </div>
);

const StarRatingDisplay = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} style={{ width: size, height: size }} className={`${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
    ))}
  </div>
);

const FreelancerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: freelancer, isLoading } = useFreelancerProfile(id || '');
  const createConvo = useCreateOrGetConversation();
  const { data: reviews, isLoading: reviewsLoading } = useFreelancerReviews(id || '');
  const { average, count } = useFreelancerAverageRating(id || '');
  const createReview = useCreateFreelancerReview();
  const deleteReview = useDeleteFreelancerReview();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const myReview = reviews?.find(r => r.user_id === user?.id);

  const handleMessage = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!freelancer) return;
    try {
      const convoId = await createConvo.mutateAsync(freelancer.user_id);
      navigate(`/chat?c=${convoId}`);
    } catch { toast.error("შეტყობინების გაგზავნა ვერ მოხერხდა"); }
  };

  const handleSubmitReview = async () => {
    if (!user) { navigate('/auth'); return; }
    if (reviewRating === 0) { toast.error("აირჩიეთ რეიტინგი"); return; }
    try {
      await createReview.mutateAsync({ profile_id: id!, rating: reviewRating, review_text: reviewText });
      setReviewRating(0);
      setReviewText("");
      toast.success("შეფასება დაემატა!");
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "თქვენ უკვე შეაფასეთ ეს ფრილანსერი" : "შეფასება ვერ მოხერხდა");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync({ id: reviewId, profileId: id! });
      toast.success("შეფასება წაიშალა");
    } catch { toast.error("წაშლა ვერ მოხერხდა"); }
  };

  if (isLoading) {
    return (<><Atmosphere /><Header /><main className="pt-32 pb-20 min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></main></>);
  }
  if (!freelancer) {
    return (<><Atmosphere /><Header /><main className="pt-32 pb-20 min-h-screen"><div className="container max-w-3xl mx-auto px-4 text-center"><p className="text-muted-foreground text-lg">ფრილანსერი ვერ მოიძებნა</p></div></main></>);
  }

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4">
          <Link to="/freelancers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> ფრილანსერები
          </Link>

          {/* Profile Header */}
          <div className="relative bg-card/70 backdrop-blur-md border border-border/30 rounded-2xl overflow-hidden mb-6">
            <div className="relative h-36 overflow-hidden">
              <img src={freelancersHeroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-card/50" />
            </div>
            <div className="px-6 md:px-8 pb-6 -mt-14">
              <div className="flex flex-col md:flex-row items-start gap-5">
                <Avatar className="w-28 h-28 ring-4 ring-card shadow-2xl">
                  {freelancer.avatar_url ? <AvatarImage src={freelancer.avatar_url} className="object-cover" /> : null}
                  <AvatarFallback className="bg-primary/15 text-primary font-bold text-3xl">
                    {freelancer.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-2 md:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-black">{freelancer.full_name}</h1>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${AVAILABILITY_COLORS[freelancer.availability]}`}>
                        {AVAILABILITY_LABELS[freelancer.availability]}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${EXPERIENCE_COLORS[freelancer.experience_level] || 'bg-muted/20'}`}>
                        {EXPERIENCE_LABELS[freelancer.experience_level] || freelancer.experience_level}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">{freelancer.title || 'ფრილანსერი'}</p>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {freelancer.hourly_rate != null && (
                      <div className="flex items-center gap-1 text-primary font-bold text-xl">
                        <DollarSign className="w-5 h-5" />{freelancer.hourly_rate}<span className="text-sm font-normal text-muted-foreground">/სთ</span>
                      </div>
                    )}
                    {count > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRatingDisplay rating={average} size={18} />
                        <span className="text-sm text-muted-foreground">{average} ({count})</span>
                      </div>
                    )}
                    {freelancer.languages && freelancer.languages.length > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Globe2 className="w-4 h-4" /> {freelancer.languages.join(', ')}
                      </div>
                    )}
                  </div>

                  {user && user.id !== freelancer.user_id && (
                    <button onClick={handleMessage} disabled={createConvo.isPending}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20">
                      {createConvo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                      შეტყობინება
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {freelancer.bio && (
            <div className="bg-card/70 backdrop-blur-md border border-border/30 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" /> შესახებ
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{freelancer.bio}</p>
            </div>
          )}

          {/* Skills */}
          {freelancer.skills && freelancer.skills.length > 0 && (
            <div className="bg-card/70 backdrop-blur-md border border-border/30 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" /> უნარები და ტექნოლოგიები
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {freelancer.skills.map((s, i) => (
                  <span key={s} className={`px-4 py-2 rounded-xl text-sm font-medium border ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {freelancer.projects && freelancer.projects.length > 0 && (
            <div className="bg-card/70 backdrop-blur-md border border-border/30 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" /> პორტფოლიო ({freelancer.projects.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {freelancer.projects.map(p => (
                  <div key={p.id} className="bg-muted/10 rounded-2xl overflow-hidden border border-border/20 hover:border-border/40 transition-all group">
                    {p.image_url ? (
                      <div className="relative overflow-hidden">
                        <img src={p.image_url} alt={p.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-base mb-1.5">{p.title}</h3>
                      {p.description && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{p.description}</p>}
                      <div className="flex gap-3">
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                            <Globe className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium">
                            <Github className="w-3.5 h-3.5" /> Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-card/70 backdrop-blur-md border border-border/30 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-400 rounded-full" />
              შეფასებები {count > 0 && <span className="text-muted-foreground font-normal text-sm">({count})</span>}
            </h2>

            {/* Write review form */}
            {user && user.id !== freelancer.user_id && !myReview && (
              <div className="bg-muted/10 border border-border/20 rounded-xl p-5 mb-6">
                <p className="text-sm font-medium mb-3">შეაფასეთ ეს ფრილანსერი</p>
                <StarRatingInput rating={reviewRating} onRate={setReviewRating} />
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="დაწერეთ შეფასება (არასავალდებულო)..."
                  className="w-full mt-3 bg-background/50 border border-border/30 rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={createReview.isPending || reviewRating === 0}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {createReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  გაგზავნა
                </button>
              </div>
            )}

            {/* Reviews list */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="flex gap-4 bg-muted/10 rounded-xl p-4 border border-border/10">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {r.reviewer_avatar ? <AvatarImage src={r.reviewer_avatar} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                        {r.reviewer_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{r.reviewer_name}</span>
                          <StarRatingDisplay rating={r.rating} size={14} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString('ka-GE')}
                          </span>
                          {user?.id === r.user_id && (
                            <button onClick={() => handleDeleteReview(r.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {r.review_text && <p className="text-sm text-muted-foreground">{r.review_text}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-6">ჯერ შეფასებები არ არის</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default FreelancerDetail;
