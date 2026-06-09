import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBankPayment } from "@/hooks/useBankPayment";
import { toast } from "sonner";
import {
  useVideoCourse,
  useVideoCourseSections,
  useCourseLectures,
  useVideoEnrollment,
  VideoCourseSection,
  VideoLecture,
} from "@/hooks/useVideoCourses";

const difficultyMap: Record<string, { label: string; color: string; bg: string }> = {
  beginner:     { label: "დამწყები",  color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  intermediate: { label: "საშუალო",  color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  advanced:     { label: "მოწინავე", color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const formatDuration = (secs: number) => {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h} სთ ${m} წთ` : `${m} წთ`;
};

// ─── Section accordion ────────────────────────────────────────────────────────
const SectionAccordion = ({
  section, lectures, courseId, isEnrolled, defaultOpen, globalIdx,
}: {
  section: VideoCourseSection; lectures: VideoLecture[];
  courseId: string; isEnrolled: boolean;
  defaultOpen?: boolean; globalIdx: number;
}) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const navigate = useNavigate();
  const totalDur = lectures.reduce((a, l) => a + (l.duration_seconds ?? 0), 0);

  return (
    <div className="overflow-hidden rounded-xl border transition-colors"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--gold-glow)', color: 'var(--gold)', border: '1px solid var(--border-accent)' }}>
            {globalIdx + 1}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {section.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {lectures.length} ლექცია{totalDur > 0 && ` · ${formatDuration(totalDur)}`}
            </div>
          </div>
        </div>
        <span className="material-symbols-rounded flex-shrink-0 text-lg transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {lectures.length === 0 ? (
            <div className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              ლექციები ჯერ არ დამატებულა
            </div>
          ) : lectures.map((lecture, idx) => {
            const canWatch = isEnrolled || lecture.is_free_preview;
            return (
              <div
                key={lecture.id}
                onClick={() => canWatch && navigate(`/video-courses/${courseId}/watch/${lecture.id}`)}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{
                  borderBottom: idx < lectures.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: canWatch ? 'pointer' : 'default',
                  background: 'transparent',
                }}
                onMouseEnter={e => canWatch && (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Play / lock icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: canWatch ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                    border: `1px solid ${canWatch ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                  }}>
                  <span className="material-symbols-rounded text-sm"
                    style={{ color: canWatch ? 'var(--gold)' : 'var(--text-muted)' }}>
                    {canWatch ? 'play_arrow' : 'lock'}
                  </span>
                </div>

                {/* Title + description */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {idx + 1}. {lecture.title}
                  </div>
                  {lecture.description && (
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {lecture.description}
                    </div>
                  )}
                </div>

                {/* Right badges */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {lecture.is_free_preview && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                      უფასო
                    </span>
                  )}
                  {lecture.duration_seconds > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDuration(lecture.duration_seconds)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Buy / enroll button ──────────────────────────────────────────────────────
const EnrollButton = ({
  course, user, isEnrolled, paymentProcessing, firstLecture, initiatePayment,
}: any) => {
  const navigate = useNavigate();

  if (isEnrolled) {
    return (
      <button
        onClick={() => firstLecture && navigate(`/video-courses/${course.id}/watch/${firstLecture.id}`)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-opacity"
        style={{ background: 'var(--gold)', color: 'black', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <span className="material-symbols-rounded text-lg">play_arrow</span>
        სწავლის გაგრძელება
      </button>
    );
  }

  return (
    <>
      <button
        disabled={paymentProcessing}
        onClick={async () => {
          if (!user) { navigate(`/auth?next=/video-courses/${course.id}`); return; }
          if (course.price_gel <= 0) {
            try {
              const { supabase } = await import('@/integrations/supabase/client');
              await (supabase as any).from('video_enrollments').upsert(
                { user_id: user.id, course_id: course.id },
                { onConflict: 'user_id,course_id' }
              );
              toast.success('კურსზე წვდომა გახსნილია!');
              window.location.reload();
            } catch (e: any) { toast.error(e?.message); }
            return;
          }
          try {
            await initiatePayment('flitt', [{
              name: course.title, price: course.price_gel,
              type: 'video_course', course_id: course.id,
            }]);
          } catch (e: any) { toast.error(e?.message || 'გადახდა ვერ მოხერხდა'); }
        }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-opacity"
        style={{
          background: paymentProcessing ? 'var(--bg-elevated)' : 'var(--gold)',
          color: paymentProcessing ? 'var(--text-muted)' : 'black',
          border: 'none',
          cursor: paymentProcessing ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={e => !paymentProcessing && (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <span className="material-symbols-rounded text-lg">
          {paymentProcessing ? 'hourglass_empty' : 'payment'}
        </span>
        {paymentProcessing ? 'მუშავდება...' : course.price_gel > 0 ? `გადახდა — ${course.price_gel}₾` : 'უფასოდ დარეგისტრირდი'}
      </button>

      {firstLecture && (
        <button
          onClick={() => navigate(`/video-courses/${course.id}/watch/${firstLecture.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-2 transition-colors"
          style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <span className="material-symbols-rounded text-base" style={{ color: 'var(--gold)' }}>preview</span>
          უფასო ლექციის ნახვა
        </button>
      )}
    </>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const VideoCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: course, isLoading } = useVideoCourse(id ?? '');
  const { data: sections = [] } = useVideoCourseSections(id ?? '');
  const { data: allLectures = [] } = useCourseLectures(id ?? '');
  const { data: enrollment } = useVideoEnrollment(id ?? '');
  const { initiatePayment, processing: paymentProcessing } = useBankPayment();

  const isEnrolled = !!enrollment;
  const diff = difficultyMap[course?.difficulty ?? 'beginner'] ?? difficultyMap.beginner;

  const lecturesBySectionId: Record<string, VideoLecture[]> = {};
  allLectures.forEach(l => {
    if (!lecturesBySectionId[l.section_id]) lecturesBySectionId[l.section_id] = [];
    lecturesBySectionId[l.section_id].push(l);
  });

  const totalDuration = allLectures.reduce((a, l) => a + (l.duration_seconds ?? 0), 0);
  const firstLecture = allLectures.find(l => l.is_free_preview) ?? allLectures[0];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="pt-28 pb-20 min-h-screen">
          <div className="container max-w-5xl">
            <Skeleton className="h-72 rounded-2xl mb-6" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>კურსი ვერ მოიძებნა</h2>
            <Link to="/video-courses" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>← ყველა კურსი</Link>
          </div>
        </main>
      </>
    );
  }

  const ctaCard = (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      {course.cover_url && (
        <img src={course.cover_url} alt={course.title} className="w-full object-cover" style={{ height: '160px' }} />
      )}
      <div className="p-5">
        {/* Price */}
        <div className="mb-4">
          {course.price_gel > 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold" style={{ color: 'var(--gold)' }}>{course.price_gel}</span>
              <span className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>₾</span>
            </div>
          ) : (
            <span className="text-xl font-extrabold" style={{ color: '#4ade80' }}>უფასო</span>
          )}
        </div>

        <EnrollButton
          course={course} user={user} isEnrolled={isEnrolled}
          paymentProcessing={paymentProcessing} firstLecture={firstLecture}
          initiatePayment={initiatePayment}
        />

        {/* Features */}
        <div className="mt-5 flex flex-col gap-2.5">
          {[
            { icon: 'play_lesson', text: `${allLectures.length} ვიდეო ლექცია` },
            { icon: 'task_alt', text: 'პრაქტიკული დავალებები' },
            { icon: 'history', text: 'პროგრეს ჩანაწერი' },
            { icon: 'all_inclusive', text: 'მუდმივი წვდომა' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-2.5">
              <span className="material-symbols-rounded text-base" style={{ color: 'var(--gold)' }}>{f.icon}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {[
            { icon: 'signal_cellular_alt', label: 'დონე', value: diff.label },
            { icon: 'folder', label: 'სექციები', value: String(sections.length) },
            { icon: 'play_lesson', label: 'ლექციები', value: String(allLectures.length) },
            ...(totalDuration > 0 ? [{ icon: 'schedule', label: 'ხანგრძლივობა', value: formatDuration(totalDuration) ?? '' }] : []),
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="material-symbols-rounded text-sm">{s.icon}</span>{s.label}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title={`${course.title} — ვიდეო კურსი`} description={course.short_description ?? undefined} />
      <Atmosphere />
      <Header />

      <main className="min-h-screen pb-24" style={{ paddingTop: '88px' }}>
        <div className="container max-w-6xl px-4">

          {/* ── Back link ── */}
          <Link to="/video-courses"
            className="inline-flex items-center gap-1.5 text-sm mb-6 mt-4"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            ყველა კურსი
          </Link>

          {/* ══ Main grid: left=content, right=cta (desktop only) ══ */}
          <div className="grid gap-8" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
            {/* Responsive: on lg show 2 cols */}
            <div className="lg:grid lg:gap-10" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '2rem' }}>

              {/* We split into two via a flex-row on large screens using a wrapper */}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

            {/* ══ LEFT COLUMN ══════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 w-full">

              {/* ── Hero info ── */}
              <div className="relative rounded-2xl overflow-hidden mb-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                {course.cover_url && (
                  <div className="absolute inset-0 opacity-10 blur-2xl pointer-events-none"
                    style={{ backgroundImage: `url(${course.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <div className="relative p-6 md:p-8">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.category && (
                      <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: 'var(--gold-glow)', color: 'var(--gold)', border: '1px solid var(--border-accent)' }}>
                        {course.category}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full"
                      style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.color}44` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.color }} />
                      {diff.label}
                    </span>
                    {isEnrolled && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                        <span className="material-symbols-rounded text-sm">check_circle</span>
                        ჩარიცხული ხარ
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-extrabold leading-tight mb-3"
                    style={{ fontSize: 'clamp(1.6rem,4vw,2.6rem)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    {course.title}
                  </h1>

                  {/* Short description */}
                  {course.short_description && (
                    <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
                      {course.short_description}
                    </p>
                  )}

                  {/* Quick stats row */}
                  <div className="flex flex-wrap gap-4">
                    {allLectures.length > 0 && (
                      <StatPill icon="play_lesson" label={`${allLectures.length} ლექცია`} color="var(--gold)" />
                    )}
                    {sections.length > 0 && (
                      <StatPill icon="folder_open" label={`${sections.length} სექცია`} color="var(--sapphire)" />
                    )}
                    {totalDuration > 0 && (
                      <StatPill icon="schedule" label={formatDuration(totalDuration) ?? ''} color="var(--emerald)" />
                    )}
                  </div>
                </div>
              </div>

              {/* ── CTA card on MOBILE only ── */}
              <div className="lg:hidden mb-6">{ctaCard}</div>

              {/* ── Curriculum / Syllabus ── */}
              {sections.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      კურსის სილაბუსი
                    </h2>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                      {allLectures.length} ლექცია · {sections.length} სექცია
                    </span>
                  </div>

                  {/* Summary bar */}
                  <div className="flex flex-wrap gap-3 mb-4 p-4 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    {[
                      { icon: 'play_circle', label: `${allLectures.length} ვიდეო`, color: 'var(--gold)' },
                      { icon: 'lock_open', label: `${allLectures.filter(l => l.is_free_preview).length} უფასო`, color: '#4ade80' },
                      ...(totalDuration > 0 ? [{ icon: 'schedule', label: formatDuration(totalDuration) ?? '', color: 'var(--sapphire)' }] : []),
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-1.5 text-sm">
                        <span className="material-symbols-rounded text-base" style={{ color: s.color }}>{s.icon}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    {sections.map((sec, idx) => (
                      <SectionAccordion
                        key={sec.id}
                        section={sec}
                        lectures={lecturesBySectionId[sec.id] ?? []}
                        courseId={course.id}
                        isEnrolled={isEnrolled}
                        defaultOpen={idx === 0}
                        globalIdx={idx}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Full description ── */}
              {course.description && (
                <div className="rounded-2xl p-6 mb-6"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <h2 className="font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
                    კურსის შესახებ
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                    {course.description}
                  </p>
                </div>
              )}

              {/* ── What you'll learn ── */}
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>რას ისწავლი</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'ვიდეო ლექციებიდან პრაქტიკული ცოდნა',
                    'ყოველ ლექციაზე პრაქტიკული დავალებები',
                    'პროგრეს ჩანაწერი — განაგრძე ნებისმიერ დროს',
                    'სატრენინგო მასალები და ქეისები',
                  ].map(item => (
                    <div key={item} className="flex gap-2.5 items-start">
                      <span className="material-symbols-rounded text-lg flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }}>
                        check_circle
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ RIGHT COLUMN — desktop CTA (sticky) ══════════════════════════ */}
            <div className="hidden lg:block flex-shrink-0" style={{ width: '320px', position: 'sticky', top: '100px' }}>
              {ctaCard}
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

const StatPill = ({ icon, label, color }: { icon: string; label: string; color: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="material-symbols-rounded text-lg" style={{ color }}>{icon}</span>
    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

export default VideoCourseDetail;
