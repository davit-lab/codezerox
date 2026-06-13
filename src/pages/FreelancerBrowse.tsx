import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import SEOHead from "@/components/SEOHead";
import { useFreelancerProfiles } from "@/hooks/useFreelancers";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import freelancersHeroBgDefault from "@/assets/freelancers-hero-bg.jpg";
import { useHeroBanner } from "@/hooks/useHeroBanners";

const AVAILABILITY_COLORS: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  busy: 'bg-red-500/20 text-red-300 border-red-500/30',
  open_to_offers: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
};
const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'ხელმისაწვდომი',
  busy: 'დაკავებული',
  open_to_offers: 'ღია შეთავაზებებისთვის'
};
const EXPERIENCE_LABELS: Record<string, string> = {
  junior: 'Junior', mid: 'Mid-Level', senior: 'Senior', lead: 'Lead / Expert'
};
const EXPERIENCE_COLORS: Record<string, string> = {
  junior: 'text-sky-400', mid: 'text-blue-400', senior: 'text-purple-400', lead: 'text-amber-400'
};

const SKILL_COLORS = [
'bg-sky-500/10 text-sky-300 border-sky-500/20',
'bg-violet-500/10 text-violet-300 border-violet-500/20',
'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
'bg-rose-500/10 text-rose-300 border-rose-500/20',
'bg-amber-500/10 text-amber-300 border-amber-500/20',
'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'];


const FreelancerBrowse = () => {
  const { data: freelancers = [], isLoading } = useFreelancerProfiles();
  const { user } = useAuth();
  const { data: bannerData } = useHeroBanner("freelancers");
  const freelancersHeroBg = bannerData?.image_url || freelancersHeroBgDefault;
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [availFilter, setAvailFilter] = useState<string | null>(null);
  const [expFilter, setExpFilter] = useState<string | null>(null);
  const [minRate, setMinRate] = useState<number | "">("");
  const [maxRate, setMaxRate] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    freelancers.forEach((f) => f.skills?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [freelancers]);

  const filtered = useMemo(() => {
    return freelancers.filter((f) => {
      if (search && !f.full_name?.toLowerCase().includes(search.toLowerCase()) && !f.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (availFilter && f.availability !== availFilter) return false;
      if (expFilter && f.experience_level !== expFilter) return false;
      if (skillFilter.length > 0 && !skillFilter.some((s) => f.skills?.includes(s))) return false;
      if (minRate !== "" && (f.hourly_rate || 0) < minRate) return false;
      if (maxRate !== "" && (f.hourly_rate || 0) > maxRate) return false;
      return true;
    });
  }, [freelancers, search, skillFilter, availFilter, expFilter, minRate, maxRate]);

  const activeFilterCount = [skillFilter.length > 0, !!availFilter, !!expFilter, minRate !== "", maxRate !== ""].filter(Boolean).length;

  const clearFilters = () => {setSkillFilter([]);setAvailFilter(null);setExpFilter(null);setMinRate("");setMaxRate("");};

  return (
    <>
      <SEOHead
        title="ფრილანსერები"
        description="იპოვე პროფესიონალი დეველოპერები, დიზაინერები და სხვა IT სპეციალისტები თქვენი პროექტისთვის."
        path="/freelancers"
      />
      <Atmosphere />
      <Header />
      <ChatWidget />
      <main className="page-content">
        <div className="container">

          {/* ═══ Hero — same pattern as Leaderboard ═══ */}
          <section className="lb2-hero" style={{ backgroundImage: `url(${freelancersHeroBg})` }}>
            <div className="lb2-hero-overlay" />
            <div className="lb2-hero-content">
              <span className="section-badge">
                <span className="material-symbols-rounded">group</span>
                ფრილანსერების მარკეტი
              </span>
              <h1 className="lb2-hero-title">იპოვე პროფესიონალი</h1>
              <p className="lb2-hero-subtitle">დეველოპერები, დიზაინერები და სხვა სპეციალისტები მზად არიან თქვენი პროექტისთვის</p>
              <div className="lb2-hero-stats">
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{freelancers.length}</span>
                  <span className="lb2-hero-stat-label">ფრილანსერი</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">
                    {new Set(freelancers.flatMap((f) => f.skills || [])).size}
                  </span>
                  <span className="lb2-hero-stat-label">ტექნოლოგია</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">
                    {freelancers.filter((f) => f.availability === 'available').length}
                  </span>
                  <span className="lb2-hero-stat-label">ხელმისაწვდომი</span>
                </div>
              </div>
            </div>
          </section>

          {/* Search + Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1 w-full group">
              <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground group-focus-within:text-primary transition-colors">search</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ძიება სახელით, სპეციალობით..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-lg shadow-black/5" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setShowFilters(!showFilters)}
              className="relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 h-14 bg-card/70 backdrop-blur-xl border border-border/40 rounded-2xl text-sm font-medium hover:bg-muted/40 transition-all shadow-lg shadow-black/5">
                <span className="material-symbols-rounded text-lg">tune</span>
                ფილტრები
                {activeFilterCount > 0 &&
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    {activeFilterCount}
                  </span>
                }
              </button>
              {user &&
              <Link to="/freelancer/edit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/25">
                  <span className="material-symbols-rounded text-lg">person_add</span>
                  ჩემი პროფილი
                </Link>
              }
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters &&
          <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-6 mb-8 space-y-5 animate-in slide-in-from-top-2 duration-300 shadow-xl shadow-black/5">
              {/* Skills */}
              <div>
                <label className="text-sm font-bold mb-3 block text-foreground/80 flex items-center gap-2">
                  <span className="material-symbols-rounded text-primary text-base">code</span>
                  უნარები / ტექნოლოგიები
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) =>
                <button key={skill} onClick={() => setSkillFilter((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill])}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${skillFilter.includes(skill) ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-muted/15 text-muted-foreground border-border/30 hover:bg-muted/30 hover:border-border/50'}`}>
                      {skill}
                    </button>
                )}
                  {allSkills.length === 0 && <span className="text-xs text-muted-foreground/60">ჯერ არავის აქვს უნარები მითითებული</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-bold mb-3 block text-foreground/80 flex items-center gap-2">
                    <span className="material-symbols-rounded text-emerald-400 text-base">circle</span>
                    ხელმისაწვდომობა
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(AVAILABILITY_LABELS).map(([key, label]) =>
                  <button key={key} onClick={() => setAvailFilter(availFilter === key ? null : key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${availFilter === key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/15 text-muted-foreground hover:bg-muted/30'}`}>
                        {label}
                      </button>
                  )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold mb-3 block text-foreground/80 flex items-center gap-2">
                    <span className="material-symbols-rounded text-violet-400 text-base">workspace_premium</span>
                    გამოცდილება
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(EXPERIENCE_LABELS).map(([key, label]) =>
                  <button key={key} onClick={() => setExpFilter(expFilter === key ? null : key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${expFilter === key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/15 text-muted-foreground hover:bg-muted/30'}`}>
                        {label}
                      </button>
                  )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold mb-3 block text-foreground/80 flex items-center gap-2">
                    <span className="material-symbols-rounded text-amber-400 text-base">payments</span>
                    საათობრივი ტარიფი ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={minRate} onChange={(e) => setMinRate(e.target.value ? Number(e.target.value) : "")}
                  placeholder="მინ" className="w-full h-11 px-3 rounded-xl border border-border/40 bg-muted/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <span className="text-muted-foreground text-sm">—</span>
                    <input type="number" value={maxRate} onChange={(e) => setMaxRate(e.target.value ? Number(e.target.value) : "")}
                  placeholder="მაქს" className="w-full h-11 px-3 rounded-xl border border-border/40 bg-muted/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 &&
            <button onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors pt-1">
                  <span className="material-symbols-rounded text-sm">close</span> ფილტრების გასუფთავება
                </button>
            }
            </div>
          }

          {/* Results Count */}
          {!isLoading &&
          <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                ნაპოვნია <span className="font-bold text-foreground">{filtered.length}</span> ფრილანსერი
              </p>
            </div>
          }

          {/* Grid */}
          {isLoading ?
          <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-primary" />
                <span className="material-symbols-rounded absolute inset-0 flex items-center justify-center text-primary text-2xl">group</span>
              </div>
              <p className="text-muted-foreground animate-pulse text-sm">იტვირთება...</p>
            </div> :
          filtered.length === 0 ?
          <div className="text-center py-28">
              <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-muted/15 flex items-center justify-center">
                <span className="material-symbols-rounded text-5xl text-muted-foreground/30">person_search</span>
              </div>
              <p className="text-lg font-bold text-muted-foreground mb-1">ფრილანსერები ვერ მოიძებნა</p>
              <p className="text-sm text-muted-foreground/60">სცადეთ სხვა საძიებო სიტყვა ან ფილტრი</p>
              {activeFilterCount > 0 &&
            <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">ფილტრების გასუფთავება</button>
            }
            </div> :

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((f, i) =>
            <Link key={f.id} to={`/freelancer/${f.id}`}
            className="group relative bg-card/60 backdrop-blur-xl border border-border/20 rounded-3xl p-6 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1.5"
            style={{ animationDelay: `${i * 50}ms` }}>
                  
                  {/* Hover glow - flat */}
                  <div className="absolute inset-0 rounded-3xl bg-primary/0 group-hover:bg-primary/5 transition-all duration-500" />

                  {/* Status indicator */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${f.availability === 'available' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : f.availability === 'busy' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-5">
                      <Avatar className="w-16 h-16 ring-2 ring-border/10 group-hover:ring-primary/30 transition-all duration-500 shadow-xl">
                        {f.avatar_url ? <AvatarImage src={f.avatar_url} className="object-cover" /> : null}
                        <AvatarFallback className="bg-primary/15 text-primary font-black text-xl">
                          {f.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h2 className="font-bold text-base truncate group-hover:text-primary transition-colors duration-300">{f.full_name}</h2>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{f.title || 'ფრილანსერი'}</p>
                        <span className={`text-xs font-semibold mt-1.5 inline-block ${EXPERIENCE_COLORS[f.experience_level] || 'text-muted-foreground'}`}>
                          {EXPERIENCE_LABELS[f.experience_level] || f.experience_level}
                        </span>
                      </div>
                    </div>

                    {/* Languages */}
                    {f.languages && f.languages.length > 0 &&
                <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground/80">
                        <span className="material-symbols-rounded text-sm">language</span>
                        <span className="truncate">{f.languages.join(' · ')}</span>
                      </div>
                }

                    {/* Rate & Availability */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/20">
                      <span className={`text-[11px] px-3 py-1.5 rounded-full border font-medium ${AVAILABILITY_COLORS[f.availability] || 'bg-muted/20 text-muted-foreground'}`}>
                        {AVAILABILITY_LABELS[f.availability] || f.availability}
                      </span>
                      {f.hourly_rate != null &&
                  <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-black text-primary">${f.hourly_rate}</span>
                          <span className="text-xs text-muted-foreground/60">/სთ</span>
                        </div>
                  }
                    </div>

                    {/* Skills */}
                    {f.skills && f.skills.length > 0 &&
                <div className="flex flex-wrap gap-1.5">
                        {f.skills.slice(0, 4).map((s, si) =>
                  <span key={s} className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${SKILL_COLORS[si % SKILL_COLORS.length]}`}>
                            {s}
                          </span>
                  )}
                        {f.skills.length > 4 &&
                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-muted/10 text-muted-foreground border border-border/15 font-medium">
                            +{f.skills.length - 4}
                          </span>
                  }
                      </div>
                }
                  </div>
                </Link>
            )}
            </div>
          }
        </div>
      </main>
    </>);

};

export default FreelancerBrowse;
