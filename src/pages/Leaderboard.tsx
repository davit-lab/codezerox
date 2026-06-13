import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useLeaderboard, useMyXP, useXPHistory, getLevelTitle, getLevelProgress, getActionLabel } from "@/hooks/useXP";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SEOHead from "@/components/SEOHead";
import heroBgDefault from "@/assets/leaderboard-hero-bg.jpg";
import { useHeroBanner } from "@/hooks/useHeroBanners";
import podiumBg from "@/assets/lb-podium-bg.jpg";
import medalGold from "@/assets/medal-gold.png";
import medalSilver from "@/assets/medal-silver.png";
import medalBronze from "@/assets/medal-bronze.png";
import lvlBeginner from "@/assets/lvl-beginner.png";
import lvlStudent from "@/assets/lvl-student.png";
import lvlApprentice from "@/assets/lvl-apprentice.png";
import lvlCoder from "@/assets/lvl-coder.png";
import lvlEngineer from "@/assets/lvl-engineer.png";
import lvlExpert from "@/assets/lvl-expert.png";
import lvlMaster from "@/assets/lvl-master.png";
import lvlLegend from "@/assets/lvl-legend.png";

const XP_RULES = [
  { action: "წიგნის შეძენა", xp: 50, icon: "shopping_cart", color: "#FFD700", desc: "ნებისმიერი წიგნის შეძენისას" },
  { action: "რევიუ დაწერა", xp: 30, icon: "rate_review", color: "#FF6B6B", desc: "წიგნზე შეფასების დატოვება" },
  { action: "Hub პროექტი", xp: 40, icon: "folder", color: "#4ECDC4", desc: "საკუთარი პროექტის გაზიარება" },
  { action: "კომუნიტი შეტყობინება", xp: 5, icon: "chat", color: "#A78BFA", desc: "კომუნიტიში აქტიურობა" },
  { action: "ბლოგის კომენტარი", xp: 10, icon: "comment", color: "#60A5FA", desc: "ბლოგ პოსტზე კომენტარი" },
];

const MEDAL_IMAGES = [medalGold, medalSilver, medalBronze];

const Leaderboard = () => {
  const { user } = useAuth();
  const { data: leaders = [], isLoading } = useLeaderboard();
  const { data: myXP } = useMyXP();
  const { data: history = [] } = useXPHistory();
  const { data: bannerData } = useHeroBanner("leaderboard");
  const heroBg = bannerData?.image_url || heroBgDefault;
  const [tab, setTab] = useState<"leaderboard" | "history" | "rules">("leaderboard");
  const [search, setSearch] = useState("");

  const myRank = user ? leaders.findIndex(l => l.user_id === user.id) + 1 : 0;

  const filteredLeaders = useMemo(() => {
    if (!search.trim()) return leaders;
    return leaders.filter(l =>
      l.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [leaders, search]);

  const totalXP = useMemo(() => leaders.reduce((sum, l) => sum + l.total_xp, 0), [leaders]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ka-GE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <SEOHead title="Leaderboard — XP რეიტინგი" description="შეამოწმე შენი XP ქულები და რეიტინგი საუკეთესო მომხმარებლებს შორის" />
      <Atmosphere />
      <Header />
      <main className="page-content">
        <div className="container">

          {/* Hero with background image */}
          <section className="lb2-hero" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="lb2-hero-overlay" />
            <div className="lb2-hero-content">
              <span className="section-badge">
                <span className="material-symbols-rounded">emoji_events</span>
                Leaderboard
              </span>
              <h1 className="lb2-hero-title">XP რეიტინგი</h1>
              <p className="lb2-hero-subtitle">იაქტიურე პლატფორმაზე, დააგროვე XP და აიმაღლე რეიტინგი!</p>
              <div className="lb2-hero-stats">
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{leaders.length}</span>
                  <span className="lb2-hero-stat-label">მონაწილე</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{totalXP.toLocaleString()}</span>
                  <span className="lb2-hero-stat-label">სულ XP</span>
                </div>
                <div className="lb2-hero-stat-divider" />
                <div className="lb2-hero-stat">
                  <span className="lb2-hero-stat-num">{leaders[0]?.level || 0}</span>
                  <span className="lb2-hero-stat-label">მაქს. Level</span>
                </div>
              </div>
            </div>
          </section>

          {/* My XP Card */}
          {user && myXP && (
            <div className="lb2-my-card">
              <div className="lb2-my-left">
                <div className="lb2-my-level">{myXP.level}</div>
                <div className="lb2-my-details">
                  <span className="lb2-my-title">{getLevelTitle(myXP.level)}</span>
                  <span className="lb2-my-xp">{myXP.total_xp} XP</span>
                </div>
              </div>
              <div className="lb2-my-center">
                <div className="lb2-progress-track">
                  <div className="lb2-progress-fill" style={{ width: `${getLevelProgress(myXP.total_xp, myXP.level)}%` }} />
                </div>
                <span className="lb2-progress-text">{getLevelProgress(myXP.total_xp, myXP.level)}% → Level {Math.min(myXP.level + 1, 100)}</span>
              </div>
              {myRank > 0 && (
                <div className="lb2-my-rank">#{myRank}</div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="lb2-tabs">
            <button className={`lb2-tab ${tab === "leaderboard" ? "lb2-tab-active" : ""}`} onClick={() => setTab("leaderboard")}>
              <span className="material-symbols-rounded">leaderboard</span>
              რეიტინგი
            </button>
            {user && (
              <button className={`lb2-tab ${tab === "history" ? "lb2-tab-active" : ""}`} onClick={() => setTab("history")}>
                <span className="material-symbols-rounded">history</span>
                ისტორია
              </button>
            )}
            <button className={`lb2-tab ${tab === "rules" ? "lb2-tab-active" : ""}`} onClick={() => setTab("rules")}>
              <span className="material-symbols-rounded">info</span>
              წესები
            </button>
          </div>

          {/* Leaderboard Tab */}
          {tab === "leaderboard" && (
            <div className="lb2-board">
              {isLoading ? (
                <div className="lb2-loading">
                  <div className="lb2-spinner" />
                  <p>იტვირთება...</p>
                </div>
              ) : leaders.length === 0 ? (
                <div className="lb2-empty">
                  <span className="material-symbols-rounded" style={{ fontSize: 56 }}>emoji_events</span>
                  <p>ჯერ არავის აქვს XP</p>
                  <p className="lb2-empty-sub">იყავი პირველი!</p>
                </div>
              ) : (
                <>
                  {/* Top 3 Podium with background */}
                  <div className="lb2-podium-wrap" style={{ backgroundImage: `url(${podiumBg})` }}>
                    <div className="lb2-podium-wrap-overlay" />
                    <div className="lb2-podium">
                      {filteredLeaders.slice(0, 3).map((leader, idx) => (
                        <Link
                          to={`/user/${leader.user_id}`}
                          key={leader.user_id}
                          className={`lb2-podium-item lb2-podium-${idx + 1}`}
                        >
                          <img src={MEDAL_IMAGES[idx]} alt={`${idx + 1} ადგილი`} className="lb2-podium-medal-img" />
                          <Avatar className="lb2-podium-avatar">
                            <AvatarImage src={leader.profiles?.avatar_url || ""} />
                            <AvatarFallback>{(leader.profiles?.full_name || "U")[0]}</AvatarFallback>
                          </Avatar>
                          <span className="lb2-podium-name">{leader.profiles?.full_name || "მომხმარებელი"}</span>
                          <span className="lb2-podium-xp">{leader.total_xp} XP</span>
                          <span className="lb2-podium-lvl">Lvl {leader.level} · {getLevelTitle(leader.level)}</span>
                          <div className="lb2-podium-bar">
                            <div className="lb2-podium-bar-fill" style={{ width: `${getLevelProgress(leader.total_xp, leader.level)}%` }} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Search */}
                  {leaders.length > 5 && (
                    <div className="lb2-search">
                      <span className="material-symbols-rounded">search</span>
                      <input
                        type="text"
                        placeholder="მომხმარებლის ძებნა..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button onClick={() => setSearch("")} className="lb2-search-clear">
                          <span className="material-symbols-rounded">close</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* List */}
                  <div className="lb2-list">
                    {filteredLeaders.slice(3).map((leader, idx) => {
                      const globalRank = leaders.indexOf(leader) + 1;
                      return (
                        <Link to={`/user/${leader.user_id}`} key={leader.user_id}
                          className={`lb2-row ${user?.id === leader.user_id ? "lb2-row-me" : ""}`}
                          style={{ animationDelay: `${idx * 0.03}s` }}
                        >
                          <span className="lb2-row-rank">#{globalRank}</span>
                          <Avatar className="lb2-row-avatar">
                            <AvatarImage src={leader.profiles?.avatar_url || ""} />
                            <AvatarFallback>{(leader.profiles?.full_name || "U")[0]}</AvatarFallback>
                          </Avatar>
                          <div className="lb2-row-info">
                            <span className="lb2-row-name">{leader.profiles?.full_name || "მომხმარებელი"}</span>
                            <span className="lb2-row-lvl">Lvl {leader.level} · {getLevelTitle(leader.level)}</span>
                          </div>
                          <div className="lb2-row-bar">
                            <div className="lb2-row-bar-fill" style={{ width: `${getLevelProgress(leader.total_xp, leader.level)}%` }} />
                          </div>
                          <span className="lb2-row-xp">{leader.total_xp} XP</span>
                        </Link>
                      );
                    })}
                    {filteredLeaders.length === 0 && search && (
                      <div className="lb2-empty" style={{ padding: '40px 0' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 40 }}>search_off</span>
                        <p>„{search}" — არ მოიძებნა</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {tab === "history" && (
            <div className="lb2-history">
              {history.length === 0 ? (
                <div className="lb2-empty">
                  <span className="material-symbols-rounded" style={{ fontSize: 48 }}>timeline</span>
                  <p>ჯერ არ გაქვს XP ისტორია</p>
                </div>
              ) : (
                history.map((tx, i) => (
                  <div key={tx.id} className="lb2-hist-item" style={{ animationDelay: `${i * 0.03}s` }}>
                    <div className="lb2-hist-icon">
                      <span className="material-symbols-rounded">bolt</span>
                    </div>
                    <div className="lb2-hist-info">
                      <span className="lb2-hist-action">{getActionLabel(tx.action_type)}</span>
                      <span className="lb2-hist-date">{formatDate(tx.created_at)}</span>
                    </div>
                    <span className="lb2-hist-badge">+{tx.amount} XP</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Rules Tab */}
          {tab === "rules" && (
            <div className="lb2-rules">
              {/* How to earn header */}
              <div className="lb2-rules-hero" style={{ backgroundImage: `url(${podiumBg})` }}>
                <div className="lb2-rules-hero-overlay" />
                <div className="lb2-rules-hero-content">
                  <span className="material-symbols-rounded" style={{ fontSize: 48 }}>rocket_launch</span>
                  <h3>როგორ დააგროვო XP?</h3>
                  <p>აქტიურობის ყოველ ქმედებაში იმალება XP ქულები</p>
                </div>
              </div>

              {/* XP Rules Cards */}
              <div className="lb2-rules-grid">
                {XP_RULES.map((rule, i) => (
                  <div key={rule.action} className="lb2-rule" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="lb2-rule-icon" style={{ background: `${rule.color}18`, color: rule.color }}>
                      <span className="material-symbols-rounded">{rule.icon}</span>
                    </div>
                    <div className="lb2-rule-text">
                      <span className="lb2-rule-name">{rule.action}</span>
                      <span className="lb2-rule-desc">{rule.desc}</span>
                    </div>
                    <div className="lb2-rule-badge" style={{ background: `${rule.color}14`, color: rule.color, borderColor: `${rule.color}30` }}>
                      +{rule.xp}
                    </div>
                  </div>
                ))}
              </div>

              {/* Levels Journey */}
              <div className="lb2-levels-box">
                <div className="lb2-levels-header">
                  <span className="material-symbols-rounded">trending_up</span>
                  <div>
                    <h4>დონეების სისტემა</h4>
                    <p>ყოველ <strong>200 XP</strong>-ზე იმატებ 1 დონეს</p>
                  </div>
                </div>
                <div className="lb2-levels-timeline">
                  {[
                    { lvl: 1, title: "დამწყები", img: lvlBeginner },
                    { lvl: 10, title: "მოწაფე", img: lvlStudent },
                    { lvl: 20, title: "შეგირდი", img: lvlApprentice },
                    { lvl: 30, title: "კოდერი", img: lvlCoder },
                    { lvl: 50, title: "ინჟინერი", img: lvlEngineer },
                    { lvl: 70, title: "ექსპერტი", img: lvlExpert },
                    { lvl: 90, title: "მასტერი", img: lvlMaster },
                    { lvl: 100, title: "ლეგენდა", img: lvlLegend },
                  ].map((item, i) => (
                    <div key={item.lvl} className={`lb2-level-node ${item.lvl > 70 ? 'lb2-level-epic' : item.lvl > 40 ? 'lb2-level-rare' : ''}`} style={{ animationDelay: `${i * 0.08}s` }}>
                      <img src={item.img} alt={item.title} className="lb2-level-img" />
                      <span className="lb2-level-num">Lvl {item.lvl}</span>
                      <span className="lb2-level-title">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Leaderboard;
