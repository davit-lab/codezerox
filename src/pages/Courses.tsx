import { Link } from "react-router-dom";
import { useState } from "react";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import SEOHead from "@/components/SEOHead";
import { useCourses, Course } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useMySubscriptions } from "@/hooks/useCourseSubscription";

const difficultyLabels: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: "დამწყები", color: "#4ade80", bg: "rgba(74, 222, 128, 0.1)" },
  intermediate: { label: "საშუალო", color: "#facc15", bg: "rgba(250, 204, 21, 0.1)" },
  advanced: { label: "მოწინავე", color: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },
};

const CourseCard = ({ course, index }: { course: Course; index: number }) => {
  const { user } = useAuth();
  const { data: subscriptions = [] } = useMySubscriptions();
  const { addCourseItem, isCourseInCart } = useCart();

  const activeSub = subscriptions.find(
    (s: any) => s.course_id === course.id && new Date(s.expires_at) > new Date()
  );
  const inCart = isCourseInCart(course.id);
  const diff = difficultyLabels[course.difficulty || "beginner"] || difficultyLabels.beginner;

  return (
    <Link
      to={`/course/${course.id}`}
      className="group relative block overflow-hidden rounded-[var(--radius-xl)] transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Outer glow on hover */}
      <div
        className="absolute -inset-1 rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl -z-10"
        style={{ background: 'rgba(95,19,202,0.2)' }}
      />

      {/* Card body */}
      <div
        className="relative overflow-hidden rounded-[var(--radius-xl)] border transition-all duration-500"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Hover border overlay */}
        <div className="absolute inset-0 rounded-[var(--radius-xl)] border opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" style={{ borderColor: 'var(--border-accent)' }} />

        {/* Full-bleed image with cinematic overlay */}
        <div className="relative h-56 overflow-hidden">
          {course.cover_url ? (
            <img
              src={course.cover_url}
              alt={course.title}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
              <span className="material-symbols-rounded text-7xl opacity-20" style={{ color: 'var(--gold)' }}>terminal</span>
            </div>
          )}

          <div className="absolute inset-0 bg-[var(--bg-card)]/80" />
          <div className="absolute inset-0 bg-[var(--gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top badges row */}
          <div className="absolute top-4 inset-x-4 flex items-start justify-between z-10">
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest backdrop-blur-xl"
              style={{ background: `${diff.bg}`, color: diff.color, border: `1px solid ${diff.color}25`, boxShadow: `0 4px 12px ${diff.color}15` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: diff.color }} />
              {diff.label}
            </span>

            {activeSub && (
              <span className="inline-flex items-center gap-1.5 rounded-lg backdrop-blur-xl px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                აქტიური
              </span>
            )}
          </div>

          {/* Bottom info chips on image */}
          <div className="absolute bottom-4 inset-x-4 flex items-center gap-2 z-10">
            {course.total_chapters > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-semibold backdrop-blur-xl"
                style={{ background: 'rgba(0,0,0,0.55)', color: 'var(--text-primary)' }}>
                <span className="material-symbols-rounded text-xs" style={{ color: 'var(--gold)' }}>menu_book</span>
                {course.total_chapters} თავი
              </div>
            )}
            {course.duration_hours && (
              <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-semibold backdrop-blur-xl"
                style={{ background: 'rgba(0,0,0,0.55)', color: 'var(--text-primary)' }}>
                <span className="material-symbols-rounded text-xs" style={{ color: 'var(--sapphire)' }}>schedule</span>
                {course.duration_hours} სთ
              </div>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="relative p-6 pt-4">
          {/* Subtle shine line */}
          <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'var(--gold)' }} />

          <h3 className="text-[1.1rem] font-bold leading-snug line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-[var(--gold-light)]" style={{ color: 'var(--text-primary)' }}>
            {course.title}
          </h3>

          {course.description && (
            <p className="text-[0.8rem] leading-relaxed line-clamp-2 mb-5" style={{ color: 'var(--text-secondary)' }}>
              {course.description}
            </p>
          )}

          {/* Price + Action row */}
          <div className="flex items-center justify-between gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold" style={{ color: 'var(--gold)' }}>{course.monthly_price}₾</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/თვე</span>
            </div>

            {activeSub ? (
              <span
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(95,19,202,0.3)]"
                style={{ background: 'var(--gold)', color: 'white' }}
              >
                <span className="material-symbols-rounded text-sm">play_arrow</span>
                გაგრძელება
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 border group-hover:border-[var(--border-accent)] group-hover:bg-[var(--bg-hover)]"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                onClick={(e) => {
                  if (!inCart && user) {
                    e.preventDefault();
                    addCourseItem(course);
                  }
                }}
              >
                <span className="material-symbols-rounded text-sm" style={{ color: 'var(--gold)' }}>
                  {inCart ? 'check_circle' : 'arrow_forward'}
                </span>
                {inCart ? 'კალათაშია' : 'ნახე კურსი'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const Courses = () => {
  const { data: courses = [], isLoading } = useCourses();

  return (
    <>
      <SEOHead title="კურსები" description="აღმოაჩინე კიბერუსაფრთხოების კურსები ქართულ ენაზე." path="/courses" />
      <Atmosphere /><Header /><ChatWidget />

      <main className="pt-36 pb-20 min-h-screen">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--gold)' }} />
              <div className="absolute left-1/4 top-10 w-[200px] h-[200px] rounded-full blur-[80px] opacity-10" style={{ background: 'var(--amethyst)' }} />
              <div className="absolute right-1/4 top-5 w-[150px] h-[150px] rounded-full blur-[60px] opacity-10" style={{ background: 'var(--sapphire)' }} />
            </div>

            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm"
              style={{ background: 'var(--gold-glow)', border: '1px solid var(--border-accent)', color: 'var(--gold-light)' }}>
              <span className="material-symbols-rounded text-sm">school</span>
              კიბერუსაფრთხოების კურსები
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ისწავლე{' '}
              <span className="relative inline-block">
                <span style={{ color: 'var(--gold)' }}>კიბერუსაფრთხოება</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5.5C47.5 2 152.5 2 199 5.5" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
              თვიური გამოწერით მიიღე წვდომა პროფესიონალურ კურსებზე — თეორიული მასალა, პრაქტიკული სავარჯიშოები და სერტიფიკაცია
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span className="material-symbols-rounded text-lg" style={{ color: 'var(--gold)' }}>school</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{courses.length} კურსი</span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span className="material-symbols-rounded text-lg" style={{ color: 'var(--emerald)' }}>library_books</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {courses.reduce((acc, c) => acc + c.total_chapters, 0)}+ თავი
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span className="material-symbols-rounded text-lg" style={{ color: 'var(--sapphire)' }}>verified</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>სერტიფიკატი</span>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <div className="absolute inset-0 blur-xl opacity-30" style={{ background: 'var(--gold)' }} />
                <span className="material-symbols-rounded text-5xl animate-spin relative" style={{ color: 'var(--gold)' }}>progress_activity</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>კურსები იტვირთება...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: 'var(--bg-elevated)' }}>
                <span className="material-symbols-rounded text-4xl" style={{ color: 'var(--text-muted)' }}>school</span>
              </div>
              <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>კურსები მალე დაემატება</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>ახალი კურსები მზადდება, მალე ხელმისაწვდომი იქნება</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Courses;
