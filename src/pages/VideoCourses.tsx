import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { useVideoCourses, VideoCourse } from "@/hooks/useVideoCourses";
import { useVideoEnrollment } from "@/hooks/useVideoCourses";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const difficultyMap: Record<string, { label: string; color: string }> = {
  beginner:     { label: "დამწყები",  color: "#4ade80" },
  intermediate: { label: "საშუალო",  color: "#facc15" },
  advanced:     { label: "მოწინავე", color: "#f87171" },
};

const formatDuration = (secs: number) => {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h} სთ ${m} წთ` : `${m} წთ`;
};

const CourseCard = ({ course, index }: { course: VideoCourse; index: number }) => {
  const diff = difficultyMap[course.difficulty] ?? difficultyMap.beginner;

  return (
    <Link
      to={`/video-courses/${course.id}`}
      className="group relative block"
      style={{ animationDelay: `${index * 60}ms`, textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg -z-10"
        style={{ background: 'rgba(212,168,83,0.15)' }}
      />

      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-1"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
          style={{ borderColor: 'var(--border-accent)' }} />

        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ height: '200px' }}>
          {course.cover_url ? (
            <img
              src={course.cover_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)' }}>
              <span className="material-symbols-rounded opacity-20 text-7xl" style={{ color: 'var(--gold)' }}>
                play_circle
              </span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />

          {/* Badge top-left */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur-md"
              style={{ background: `${diff.color}22`, color: diff.color, border: `1px solid ${diff.color}44` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.color }} />
              {diff.label}
            </span>
          </div>

          {/* Play icon bottom right */}
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md"
              style={{ background: 'var(--gold)', color: 'black' }}>
              <span className="material-symbols-rounded text-lg">play_arrow</span>
            </div>
          </div>

          {/* Category tag bottom left */}
          {course.category && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-primary)' }}>
                {course.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold leading-snug line-clamp-2 mb-2 transition-colors duration-200 group-hover:text-[var(--gold-light)]"
            style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {course.title}
          </h3>

          {course.short_description && (
            <p className="text-sm leading-relaxed line-clamp-2 mb-4"
              style={{ color: 'var(--text-secondary)' }}>
              {course.short_description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-baseline gap-1">
              {course.price_gel > 0 ? (
                <>
                  <span className="text-xl font-extrabold" style={{ color: 'var(--gold)' }}>
                    {course.price_gel}₾
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  უფასო
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: 'var(--text-muted)' }}>
              <span className="material-symbols-rounded text-base" style={{ color: 'var(--sapphire)' }}>
                play_lesson
              </span>
              ვიდეო კურსი
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CATEGORIES = ['ყველა', 'პროგრამირება', 'ვებ-დიზაინი', 'კიბერუსაფრთხოება', 'მონაცემთა ბაზები', 'DevOps', 'სხვა'];

const VideoCourses = () => {
  const { data: courses = [], isLoading } = useVideoCourses();
  const [activeCategory, setActiveCategory] = useState('ყველა');
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c => {
    const matchCat = activeCategory === 'ყველა' || c.category === activeCategory;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.short_description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <SEOHead
        title="ვიდეო კურსები — CodeZero Academy"
        description="სხვადასხვა ვიდეო კურსები პროგრამირებაში — ისწავლე საკუთარ ტემპში ნებისმიერ დროს."
      />
      <Atmosphere />
      <Header />

      <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="text-center mb-14 relative">
            <div className="absolute inset-0 -z-10 pointer-events-none">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[500px] h-[280px] rounded-full blur-[100px] opacity-15"
                style={{ background: 'var(--gold)' }} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
              style={{ background: 'var(--gold-glow)', border: '1px solid var(--border-accent)', color: 'var(--gold-light)' }}>
              <span className="material-symbols-rounded text-sm">smart_display</span>
              ვიდეო კურსები
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 tracking-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              ისწავლე{' '}
              <span style={{ color: 'var(--gold)' }}>ნებისმიერ დროს</span>
            </h1>

            <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10"
              style={{ color: 'var(--text-secondary)' }}>
              კომპაქტური ვიდეო ლექციები, პრაქტიკული დავალებები და შენი პროგრესის ავტომატური შენახვა.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {[
                { icon: 'play_circle', label: `${courses.length} კურსი`, color: 'var(--gold)' },
                { icon: 'task_alt', label: 'დავალებები', color: 'var(--emerald)' },
                { icon: 'history', label: 'პროგრეს ჩანაწერი', color: 'var(--sapphire)' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <span className="material-symbols-rounded text-lg" style={{ color: s.color }}>{s.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-lg"
                style={{ color: 'var(--text-muted)' }}>search</span>
              <input
                type="text"
                placeholder="კურსის ძებნა..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeCategory === cat ? 'var(--gold)' : 'var(--bg-elevated)',
                  color: activeCategory === cat ? 'black' : 'var(--text-secondary)',
                  border: `1px solid ${activeCategory === cat ? 'var(--gold)' : 'var(--border-subtle)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Course grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} style={{ height: '340px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
                style={{ background: 'var(--bg-elevated)' }}>
                <span className="material-symbols-rounded text-4xl" style={{ color: 'var(--text-muted)' }}>
                  smart_display
                </span>
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {courses.length === 0 ? 'ვიდეო კურსები მალე დაემატება' : 'კურსი ვერ მოიძებნა'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {courses.length === 0
                  ? 'ახალი კურსები მზადდება — მალე ხელმისაწვდომი იქნება'
                  : 'სხვა საძიებო სიტყვა სცადე ან კატეგორია შეცვალე'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
};

export default VideoCourses;
