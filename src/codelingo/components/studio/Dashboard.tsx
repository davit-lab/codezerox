// import Avatar from '../Avatar';
// import LearningCoach from '../LearningCoach';
// import {useState} from 'react';
// import {Check,LockKeyhole,Play,ArrowRight,BookOpen,Target,Star,Code2} from 'lucide-react';
// import {lessons,modules} from '../../lib/curriculum';
// import {canOpen,dayKey} from '../../lib/progress';
// import {skillLabs,labKey} from '../../lib/skill-labs';
// import {terms} from '../../lib/terms';
// import type {Progress} from '../../lib/types';
// export default function Dashboard({p}:{p:Progress}){const next=lessons.find(item=>!p.completed.includes(item.id));const [unit,setUnit]=useState(next?.module??7);const today=dayKey(new Date(),p.profile.timezone);const activity=new Set([...(p.daily[today]??[]).map(String),...(p.studio?.activity[today]??[])]).size;const dailyTerm=terms[Math.floor(Date.parse(today+'T12:00:00Z')/86400000)%terms.length];const labDone=skillLabs.filter(lab=>p.studio?.completed.includes(labKey(lab.id))).length;
//  const unitLessons=lessons.filter(x=>x.module===unit);const unitDone=unitLessons.filter(x=>p.completed.includes(x.id)).length; return <div className="learning-home"><div className="simple-heading"><span className="learning-label">შენი ყოველდღიური პრაქტიკა</span><h1>{p.profile.name?p.profile.name+', ':''}დღეს ერთი ნაბიჯით წინ.</h1><p>პატარა გაკვეთილები. საკუთარი კოდი. გასაგები შედეგი.</p></div><LearningCoach message="გამარჯობა, მე ნიკო ვარ. გზაზე თითო გაკვეთილში იდეას გაიგებ, ნაწილებს დაალაგებ და კოდს აამუშავებ. თუ პირველად იწყებ, ჯერ საიტის აგების გზამკვლევს გაეცანი."/><a href="#onboarding" className="text-button intro-replay">ნიკოსთან დასაწყისის გამეორება →</a><a href="#blueprint" className="beginner-start"><span><strong>პირველად იწყებ?</strong><small>12 თავი · ვების მუშაობა, გვერდების დაგეგმვა და გამოქვეყნება</small></span><ArrowRight/></a><div className="learn-layout"><section className="learning-map"><label className="unit-picker">აირჩიე თავი<select value={unit} onChange={event=>setUnit(Number(event.target.value))}>{modules.map((module,i)=><option value={i} key={i}>{i+1}. {module.title}</option>)}</select></label><div className="unit-banner"><div><span>თავი {unit+1} / 8</span><h2>{modules[unit].title}</h2><div className="unit-meter" aria-label={`დასრულებულია ${unitDone} / ${unitLessons.length}`}><i><b style={{'--fill':unitDone/unitLessons.length} as React.CSSProperties}/></i><span>{unitDone}/{unitLessons.length}</span></div></div><BookOpen size={30}/></div><div className="path-nodes">{lessons.filter(lesson=>lesson.module===unit).map((lesson,i)=>{const done=p.completed.includes(lesson.id),open=canOpen(lesson.id,p),current=next?.id===lesson.id;return <div className={'path-stop '+(current?'current ':'')+(done?'done ':'')+(!open?'locked':'')} key={lesson.id} style={{'--shift':[0,52,82,52,0,-38][i]+'px','--i':i} as React.CSSProperties}>{current&&<span className="start-label">აქ გააგრძელე</span>}<a className="path-node" href={open?'#lesson/'+lesson.id:undefined} aria-disabled={!open} aria-label={lesson.title+(open?'':' — ჯერ დახურულია')}>{done?<Check size={30}/>:current?<Avatar value={p.profile.learner?.avatar} className="path-learner" label="შენ აქ ხარ"/>:!open?<LockKeyhole size={24}/>:i===5?<Star size={30}/>:<Play size={28}/>}</a><span className="path-caption"><small>გაკვეთილი {lesson.id} · 3 სავარჯიშო</small><strong>{lesson.title}</strong></span></div>})}</div><div className="unit-footer"><button className="outline-button" disabled={unit===0} onClick={()=>setUnit(unit-1)}>წინა თავი</button><button className="outline-button" disabled={unit===7} onClick={()=>setUnit(unit+1)}>შემდეგი თავი <ArrowRight size={16}/></button></div></section><aside className="learning-side"><section className="learning-panel daily-mission"><div className="panel-title"><Target/><h2>დღის პატარა მიზანი</h2></div><p>დაასრულე ერთი გაკვეთილი ან პროექტის ეტაპი.</p><progress value={Math.min(1,activity)} max={1}/><strong>{activity?'მიზანი შესრულებულია':'დღეს ჯერ არ დასრულებულა'}</strong><a href={'#lesson/'+(next?.id??1)} className="button">{activity?'გააგრძელე სწავლა':'დაწყება'} <ArrowRight size={17}/></a></section><section className="learning-panel"><div className="panel-title"><Code2/><h2>ახალი უნარები</h2></div><p>18 დამატებითი გაკვეთილი: HTML, CSS და JavaScript.</p><div className="mini-progress">{labDone}/18 დასრულებული</div><a href="#skills" className="outline-button">პრაქტიკის გზა <ArrowRight size={16}/></a></section><section className="learning-panel"><div className="panel-title"><BookOpen/><h2>ერთი ტერმინი დღეს</h2></div><h3>{dailyTerm.name}</h3><p>{dailyTerm.definition}</p><a href="#terms" className="text-button">{terms.length} ტერმინის ცნობარი <ArrowRight size={16}/></a></section><a className="project-shortcut" href="#studio/publish/1"><span>ახალი პროექტი</span><strong>გამოაქვეყნე შენი საიტი</strong><small>6 ეტაპი · ZIP-დან GitHub Pages-მდე</small><ArrowRight size={20}/></a></aside></div></div>
// }
import React, { useMemo, useState } from "react";
import "./Dashboard.css";

type Course = {
  id: string;
  name: string;
  description: string;
  level: string;
  duration: string;
  progress: number;
  color: string;
  icon: string;
};

type DashboardProps = {
  username: string;
  streak: number;
  xp: number;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  dailyGoalCompleted: number;
  dailyGoal: number;
  courses: Course[];
  currentCourse?: Course;
  onNavigate?: (page: string) => void;
  onContinue?: (course: Course) => void;
  onOpenCourse?: (course: Course) => void;
  onUpgrade?: () => void;
};

export default function Dashboard({
  username,
  streak,
  xp,
  overallProgress,
  completedLessons,
  totalLessons,
  dailyGoalCompleted,
  dailyGoal,
  courses,
  currentCourse,
  onNavigate,
  onContinue,
  onOpenCourse,
  onUpgrade,
}: DashboardProps) {
  const [activePage, setActivePage] = useState("Home");
  const [search, setSearch] = useState("");

  const navigation = [
    { name: "Home", icon: "⌂" },
    { name: "Lessons", icon: "▤" },
    { name: "Practice", icon: "▷" },
    { name: "Challenges", icon: "♜" },
    { name: "Leaderboard", icon: "▥" },
    { name: "Profile", icon: "♙" },
    { name: "Settings", icon: "⚙" },
  ];

  const popularCourses = useMemo(
    () =>
      courses.filter((course) =>
        course.name.toLowerCase().includes(search.toLowerCase())
      ),
    [courses, search]
  );

  const progress = Math.min(100, Math.max(0, overallProgress));
  const goalProgress =
    dailyGoal > 0
      ? Math.min(100, (dailyGoalCompleted / dailyGoal) * 100)
      : 0;

  const navigate = (page: string) => {
    setActivePage(page);
    onNavigate?.(page);
  };

  return (
    <div className="cl-dashboard">

      {/* SIDEBAR */}
      <aside className="cl-sidebar">

        <div className="cl-brand">
          <span className="cl-brand-icon">&lt;/&gt;</span>
          <span>Codelingo</span>
        </div>

        <nav className="cl-navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`cl-nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => navigate(item.name)}
            >
              <span className="cl-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="cl-premium">
          <div className="cl-premium-icon">♛</div>
          <h3>Go Premium</h3>
          <p>Unlock more lessons, challenges and rewards!</p>
          <button onClick={onUpgrade}>Upgrade</button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="cl-main">

        {/* TOPBAR */}
        <header className="cl-topbar">

          <div className="cl-search">
            <span>⌕</span>
            <input
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cl-top-actions">
            <button className="cl-notification" aria-label="Notifications">
              ♧
              <i />
            </button>

            <div className="cl-user">
              <div className="cl-avatar">👨🏻‍💻</div>
              <span>⌄</span>
            </div>
          </div>

        </header>

        <div className="cl-content">

          {/* WELCOME BANNER */}
          <section className="cl-welcome">

            <div className="cl-welcome-content">
              <span className="cl-eyebrow">YOUR CODING JOURNEY STARTS HERE</span>

              <h1>
                Welcome to
                <span>Codelingo!</span>
              </h1>

              <p>Learn to code. One step at a time.</p>

              <button
                className="cl-primary-button"
                onClick={() =>
                  currentCourse && onContinue?.(currentCourse)
                }
              >
                Start Learning <span>→</span>
              </button>
            </div>

            <div className="cl-mascot">
              <div className="cl-mascot-spark">✦</div>
              <div className="cl-mascot-head">
                <div className="cl-hair" />
                <div className="cl-eyes">
                  <i />
                  <i />
                </div>
                <div className="cl-mouth" />
              </div>
              <div className="cl-mascot-body" />
              <div className="cl-laptop">
                <span>&lt;/&gt;</span>
              </div>
              <div className="cl-code-decoration">&lt;/&gt;</div>
            </div>

          </section>

          {/* CONTINUE LEARNING */}
          <section className="cl-section">

            <div className="cl-section-heading">
              <h2>Continue Learning</h2>
              <button onClick={() => navigate("Lessons")}>
                View all →
              </button>
            </div>

            {currentCourse ? (
              <div className="cl-continue-card">

                <div className="cl-course-icon">
                  {currentCourse.icon}
                </div>

                <div className="cl-course-details">
                  <h3>{currentCourse.name}</h3>
                  <p>{currentCourse.description}</p>

                  <div className="cl-progress-row">
                    <div className="cl-progress-track">
                      <div
                        className="cl-progress-fill"
                        style={{
                          width: `${currentCourse.progress}%`,
                        }}
                      />
                    </div>
                    <strong>{currentCourse.progress}%</strong>
                  </div>
                </div>

                <button
                  className="cl-continue-button"
                  onClick={() => onContinue?.(currentCourse)}
                >
                  Continue →
                </button>

              </div>
            ) : (
              <div className="cl-empty">
                No course in progress yet. Start your first lesson!
              </div>
            )}

          </section>

          {/* POPULAR COURSES */}
          <section className="cl-section">

            <div className="cl-section-heading">
              <h2>Popular Lessons</h2>
              <button onClick={() => navigate("Lessons")}>
                Explore all →
              </button>
            </div>

            <div className="cl-courses-grid">
              {popularCourses.map((course) => (
                <button
                  className="cl-course-card"
                  key={course.id}
                  onClick={() => onOpenCourse?.(course)}
                >
                  <div
                    className="cl-course-cover"
                    style={{ background: course.color }}
                  >
                    <span>{course.icon}</span>
                  </div>

                  <div className="cl-card-info">
                    <h3>{course.name}</h3>
                    <p>
                      {course.level} · {course.duration}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {popularCourses.length === 0 && (
              <div className="cl-empty">No matching lessons found.</div>
            )}

          </section>

        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="cl-rightbar">

        {/* STREAK */}
        <section className="cl-widget cl-streak">

          <div className="cl-widget-title">
            <span className="cl-fire">🔥</span>
            <h3>Your Streak</h3>
            <span className="cl-widget-arrow">›</span>
          </div>

          <div className="cl-streak-number">
            {streak} <span>days</span>
          </div>

          <div className="cl-week">
            {"MTWTFSS".split("").map((day, index) => (
              <div key={index}>
                <span>{day}</span>
                <i className={index < 6 ? "completed" : ""}>
                  {index < 6 ? "✓" : ""}
                </i>
              </div>
            ))}
          </div>

        </section>

        {/* PROGRESS */}
        <section className="cl-widget">

          <div className="cl-widget-title">
            <span className="cl-widget-icon">▥</span>
            <h3>Your Progress</h3>
          </div>

          <div className="cl-progress-widget">

            <div
              className="cl-progress-circle"
              style={{
                background: `conic-gradient(#8952f5 ${progress}%, #343044 ${progress}% 100%)`,
              }}
            >
              <div>{progress}%</div>
            </div>

            <div className="cl-progress-text">
              <strong>Overall Completion</strong>
              <span>
                {completedLessons} / {totalLessons} lessons
              </span>
            </div>

          </div>

        </section>

        {/* DAILY GOAL */}
        <section className="cl-widget cl-goal">

          <div className="cl-widget-title">
            <span className="cl-goal-icon">🎯</span>
            <h3>Today's Goal</h3>
          </div>

          <div className="cl-goal-text">
            <strong>Complete {dailyGoal} lessons</strong>
            <span>
              {dailyGoalCompleted >= dailyGoal ? "✓" : " "}
            </span>
          </div>

          <div className="cl-progress-track">
            <div
              className="cl-progress-fill"
              style={{ width: `${goalProgress}%` }}
            />
          </div>

          <div className="cl-goal-count">
            {dailyGoalCompleted} / {dailyGoal}
          </div>

          <div className="cl-success">
            <span>🎉</span>
            <div>
              <strong>Keep going!</strong>
              <p>Every lesson makes you better.</p>
            </div>
            <span>›</span>
          </div>

        </section>

        {/* XP */}
        <section className="cl-widget cl-xp">
          <div className="cl-widget-title">
            <span className="cl-xp-icon">⚡</span>
            <h3>Your Experience</h3>
          </div>
          <strong>{xp.toLocaleString()} XP</strong>
          <p>Keep learning to earn more XP!</p>
        </section>

      </aside>

    </div>
  );
}
