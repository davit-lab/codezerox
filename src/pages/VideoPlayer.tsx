import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Atmosphere from "@/components/layout/Atmosphere";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import {
  useVideoCourse,
  useVideoCourseSections,
  useCourseLectures,
  useVideoAssignments,
  useVideoProgress,
  useCourseProgress,
  useVideoEnrollment,
  useUpdateVideoProgress,
  useVideoSignedUrl,
  VideoLecture,
  VideoCourseSection,
} from "@/hooks/useVideoCourses";

const SAVE_INTERVAL_MS = 5000;

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─── Sidebar lecture item ─────────────────────────────────────────────────────
const LectureItem = ({
  lecture,
  idx,
  isActive,
  isCompleted,
  progress,
  onClick,
}: {
  lecture: VideoLecture;
  idx: number;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px', border: 'none', textAlign: 'left', cursor: 'pointer',
      background: isActive ? 'var(--gold-glow)' : 'transparent',
      borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg-elevated)')}
    onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isCompleted ? 'rgba(74,222,128,0.15)' : isActive ? 'var(--gold-glow)' : 'var(--bg-elevated)',
      border: `1px solid ${isCompleted ? 'rgba(74,222,128,0.4)' : isActive ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
    }}>
      <span className="material-symbols-rounded" style={{
        fontSize: '14px',
        color: isCompleted ? '#4ade80' : isActive ? 'var(--gold)' : 'var(--text-muted)',
      }}>
        {isCompleted ? 'check' : 'play_arrow'}
      </span>
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '0.82rem', fontWeight: isActive ? 600 : 500,
        color: isActive ? 'var(--gold-light)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {idx + 1}. {lecture.title}
      </div>
      {lecture.duration_seconds > 0 && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {formatTime(lecture.duration_seconds)}
        </div>
      )}
      {/* Progress bar mini */}
      {progress > 0 && progress < 100 && (
        <div style={{
          height: '2px', background: 'var(--bg-elevated)',
          borderRadius: '1px', marginTop: '4px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'var(--gold)', borderRadius: '1px',
          }} />
        </div>
      )}
    </div>
  </button>
);

// ─── Assignment card ──────────────────────────────────────────────────────────
const AssignmentCard = ({
  title, description, idx,
}: {
  title: string; description: string; idx: number;
}) => {
  const [done, setDone] = useState(false);
  return (
    <div style={{
      padding: '20px', borderRadius: '14px',
      background: done ? 'rgba(74,222,128,0.05)' : 'var(--bg-card)',
      border: `1px solid ${done ? 'rgba(74,222,128,0.25)' : 'var(--border-subtle)'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <button
          onClick={() => setDone(v => !v)}
          style={{
            flexShrink: 0, width: '26px', height: '26px', borderRadius: '8px',
            border: `2px solid ${done ? 'rgba(74,222,128,0.6)' : 'var(--border-light)'}`,
            background: done ? 'rgba(74,222,128,0.15)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {done && <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#4ade80' }}>check</span>}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
            marginBottom: '6px',
            textDecoration: done ? 'line-through' : 'none',
            opacity: done ? 0.6 : 1,
          }}>
            დავალება {idx + 1}: {title}
          </div>
          <div style={{
            fontSize: '0.85rem', color: 'var(--text-secondary)',
            lineHeight: 1.65, whiteSpace: 'pre-wrap',
            opacity: done ? 0.5 : 1,
          }}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main VideoPlayer page ────────────────────────────────────────────────────
const VideoPlayer = () => {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedRef = useRef(0);

  const { data: course } = useVideoCourse(courseId ?? '');
  const { data: sections = [] } = useVideoCourseSections(courseId ?? '');
  const { data: allLectures = [] } = useCourseLectures(courseId ?? '');
  const { data: enrollment } = useVideoEnrollment(courseId ?? '');
  const { data: assignments = [] } = useVideoAssignments(lectureId ?? '');
  const { data: savedProgress } = useVideoProgress(lectureId ?? '');
  const { data: courseProgressList = [] } = useCourseProgress(courseId ?? '');
  const updateProgress = useUpdateVideoProgress();

  const currentLecture = allLectures.find(l => l.id === lectureId);
  const isEnrolled = !!enrollment;

  const { data: signedUrl } = useVideoSignedUrl(currentLecture?.video_storage_path);

  // Resolve the actual src: signed URL for storage uploads, direct URL for external links
  const videoSrc = currentLecture?.video_storage_path ? signedUrl ?? null : (currentLecture?.video_url ?? null);

  const currentIdx = allLectures.findIndex(l => l.id === lectureId);
  const prevLecture = currentIdx > 0 ? allLectures[currentIdx - 1] : null;
  const nextLecture = currentIdx < allLectures.length - 1 ? allLectures[currentIdx + 1] : null;

  const progressMap = Object.fromEntries(courseProgressList.map(p => [p.lecture_id, p]));

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate(`/auth?next=/video-courses/${courseId}/watch/${lectureId}`);
    }
  }, [user]);

  useEffect(() => {
    if (currentLecture && !currentLecture.is_free_preview && !isEnrolled) {
      navigate(`/video-courses/${courseId}`);
    }
  }, [currentLecture, isEnrolled]);

  // ── Restore saved position ──────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !savedProgress) return;
    const onMeta = () => {
      if (savedProgress.position_seconds > 5 && !savedProgress.completed) {
        video.currentTime = savedProgress.position_seconds;
      }
    };
    video.addEventListener('loadedmetadata', onMeta);
    return () => video.removeEventListener('loadedmetadata', onMeta);
  }, [savedProgress, lectureId]);

  // ── Save progress every 5 seconds ──────────────────────────────────────────
  const saveProgress = useCallback((force = false) => {
    const video = videoRef.current;
    if (!video || !courseId || !lectureId || !user) return;
    const pos = Math.floor(video.currentTime);
    if (!force && Math.abs(pos - lastSavedRef.current) < 3) return;
    lastSavedRef.current = pos;
    const completed = video.duration > 0 && (video.currentTime / video.duration) > 0.92;
    updateProgress.mutate({ lecture_id: lectureId, course_id: courseId, position_seconds: pos, completed });
  }, [courseId, lectureId, user]);

  useEffect(() => {
    saveTimerRef.current = setInterval(() => saveProgress(), SAVE_INTERVAL_MS);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      saveProgress(true);
    };
  }, [saveProgress]);

  // ── Sidebar groups ──────────────────────────────────────────────────────────
  const lecturesBySec: Record<string, VideoLecture[]> = {};
  allLectures.forEach(l => {
    if (!lecturesBySec[l.section_id]) lecturesBySec[l.section_id] = [];
    lecturesBySec[l.section_id].push(l);
  });

  const completedCount = courseProgressList.filter(p => p.completed).length;
  const totalCount = allLectures.length;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!currentLecture) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main style={{ paddingTop: '120px', textAlign: 'center', padding: '120px 20px' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>ლექცია ვერ მოიძებნა</h2>
          <Link to={`/video-courses/${courseId}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            ← კურსის გვერდზე დაბრუნება
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead title={`${currentLecture.title} — ${course?.title ?? 'ვიდეო კურსი'}`} />

      {/* Fixed top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', gap: '12px',
        background: 'var(--bg-void)', borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <Link to={`/video-courses/${courseId}`} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem',
            flexShrink: 0,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
            <span className="desktop-only" style={{ display: 'none' }}>
              {course?.title}
            </span>
          </Link>
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          <span style={{
            fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {currentLecture.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Progress */}
          {totalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '60px', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px', background: 'var(--gold)',
                  width: `${Math.round((completedCount / totalCount) * 100)}%`,
                  transition: 'width 0.4s',
                }} />
              </div>
              <span>{completedCount}/{totalCount}</span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
              {sidebarOpen ? 'close_fullscreen' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: sidebarOpen ? '1fr 320px' : '1fr',
        minHeight: '100vh', paddingTop: '56px',
        transition: 'grid-template-columns 0.3s',
      }}>

        {/* ── Left: Video + content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Video container */}
          <div style={{
            background: '#000', position: 'relative',
            width: '100%', aspectRatio: '16/9',
          }}>
            {videoSrc ? (
              <video
                key={`${lectureId}-${videoSrc}`}
                ref={videoRef}
                src={videoSrc}
                controls
                style={{ width: '100%', height: '100%', display: 'block' }}
                onPause={() => saveProgress(true)}
                onEnded={() => saveProgress(true)}
              />
            ) : currentLecture.video_storage_path && !signedUrl ? (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '48px', opacity: 0.4, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>ვიდეო იტვირთება...</p>
              </div>
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '64px', opacity: 0.3 }}>video_file</span>
                <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>ვიდეო ჯერ არ არის ატვირთული</p>
              </div>
            )}
          </div>

          {/* Content below video */}
          <div style={{ padding: '32px 40px', maxWidth: '860px' }}>

            {/* Lecture nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <button
                onClick={() => prevLecture && navigate(`/video-courses/${courseId}/watch/${prevLecture.id}`)}
                disabled={!prevLecture}
                style={{
                  padding: '10px 18px', borderRadius: '10px', cursor: prevLecture ? 'pointer' : 'not-allowed',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  color: prevLecture ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: prevLecture ? 1 : 0.4,
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_left</span>
                წინა ლექცია
              </button>

              <button
                onClick={() => nextLecture && navigate(`/video-courses/${courseId}/watch/${nextLecture.id}`)}
                disabled={!nextLecture}
                style={{
                  padding: '10px 18px', borderRadius: '10px', cursor: nextLecture ? 'pointer' : 'not-allowed',
                  background: nextLecture ? 'var(--gold)' : 'var(--bg-card)',
                  border: `1px solid ${nextLecture ? 'var(--gold)' : 'var(--border-subtle)'}`,
                  color: nextLecture ? 'black' : 'var(--text-muted)',
                  fontSize: '0.85rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: nextLecture ? 1 : 0.4,
                }}
              >
                შემდეგი ლექცია
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>

            {/* Lecture info */}
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '12px',
            }}>
              {currentLecture.title}
            </h1>

            {currentLecture.description && (
              <p style={{
                fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7,
                marginBottom: '32px', whiteSpace: 'pre-wrap',
              }}>
                {currentLecture.description}
              </p>
            )}

            {/* Progress reminder */}
            {savedProgress && savedProgress.position_seconds > 10 && !savedProgress.completed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '10px', marginBottom: '28px',
                background: 'var(--gold-glow)', border: '1px solid var(--border-accent)',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--gold)' }}>history</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ბოლოს გააჩერეთ{' '}
                  <strong style={{ color: 'var(--gold-light)' }}>
                    {formatTime(savedProgress.position_seconds)}
                  </strong>-ზე — ვიდეო იქიდან განახლდა
                </span>
              </div>
            )}

            {/* Assignments */}
            {assignments.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                  color: 'var(--text-muted)', fontWeight: 700, marginBottom: '16px',
                }}>
                  ამ ლექციის დავალებები
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {assignments.map((a, i) => (
                    <AssignmentCard key={a.id} idx={i} title={a.title} description={a.description} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Right: Sidebar course outline ── */}
        {sidebarOpen && (
          <div style={{
            borderLeft: '1px solid var(--border-subtle)',
            background: 'var(--bg-void)',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 56px)',
            position: 'sticky', top: '56px',
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: '16px', borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                კურსის შიგთავსი
              </div>
              {totalCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    flex: 1, height: '4px', background: 'var(--bg-elevated)',
                    borderRadius: '2px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', background: '#4ade80', borderRadius: '2px',
                      width: `${Math.round((completedCount / totalCount) * 100)}%`,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {Math.round((completedCount / totalCount) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Sections & lectures */}
            {sections.map(sec => (
              <div key={sec.id}>
                <div style={{
                  padding: '10px 14px', fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-muted)', background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  {sec.title}
                </div>
                {(lecturesBySec[sec.id] ?? []).map((lec, idx) => {
                  const lp = progressMap[lec.id];
                  const pct = lec.duration_seconds > 0 && lp
                    ? Math.round((lp.position_seconds / lec.duration_seconds) * 100)
                    : 0;
                  return (
                    <LectureItem
                      key={lec.id}
                      lecture={lec}
                      idx={(lecturesBySec[sec.id] ?? []).findIndex(x => x.id === lec.id)}
                      isActive={lec.id === lectureId}
                      isCompleted={!!lp?.completed}
                      progress={pct}
                      onClick={() => navigate(`/video-courses/${courseId}/watch/${lec.id}`)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VideoPlayer;
