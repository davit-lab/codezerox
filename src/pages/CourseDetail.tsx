import { useParams, Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import SEOHead from "@/components/SEOHead";
import { useCourse, useCourseChapters, useCourseProgress, useUpdateCourseProgress } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useSubscriptionStatus, useRecordChapterRead, useChapterReads } from "@/hooks/useCourseSubscription";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/ai/MarkdownRenderer";

const difficultyLabels: Record<string, string> = {
  beginner: "დამწყები",
  intermediate: "საშუალო",
  advanced: "მოწინავე",
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourse(id!);
  const { data: chapters = [] } = useCourseChapters(id!);
  const { data: progress = [] } = useCourseProgress(id!);
  const updateProgress = useUpdateCourseProgress();
  const { addCourseItem, isCourseInCart } = useCart();
  const recordRead = useRecordChapterRead();
  const { data: readChapterIds = new Set() } = useChapterReads(id!);

  const {
    isActive, isLoading: subLoading,
    chaptersReadThisMonth, canReadMore, remainingReads,
    canGenerateToday, daysRemaining, monthlyLimit,
  } = useSubscriptionStatus(id!);

  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const generateContent = useMutation({
    mutationFn: async ({ chapterId, courseId }: { chapterId: string; courseId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-chapter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ chapterId, courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'გენერაცია ვერ მოხერხდა');
      return data.content as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-chapters', id] });
      queryClient.invalidateQueries({ queryKey: ['course-subscription', id] });
      toast.success('კონტენტი წარმატებით დაგენერირდა');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const hasAccess = isActive;
  const inCart = isCourseInCart(id!);

  const completedChapterIds = new Set(progress.filter(p => p.completed).map(p => p.chapter_id));
  const completedCount = completedChapterIds.size;
  const progressPercent = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;

  const activeChapterData = chapters.find(c => c.id === activeChapter);

  const handleGenerateChapter = (chapterId: string) => {
    if (!id) return;
    generateContent.mutate({ chapterId, courseId: id });
  };

  const handleOpenChapter = async (chapterId: string) => {
    if (!hasAccess || !canReadMore || !id) return;
    // Record read if not already read
    if (!readChapterIds.has(chapterId)) {
      try {
        await recordRead.mutateAsync({ courseId: id, chapterId });
      } catch {}
    }
    setActiveChapter(chapterId);
  };

  const handleCompleteChapter = async (chapterId: string) => {
    if (!id) return;
    await updateProgress.mutateAsync({ courseId: id, chapterId, completed: true });
  };

  if (isLoading || subLoading) {
    return (
      <>
        <Atmosphere /><Header />
        <div className="min-h-screen flex items-center justify-center">
          <span className="material-symbols-rounded text-5xl text-gold animate-spin">progress_activity</span>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Atmosphere /><Header />
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <span className="material-symbols-rounded text-6xl text-muted-foreground">error</span>
          <p className="text-muted-foreground">კურსი ვერ მოიძებნა</p>
        </div>
      </>
    );
  }

  // Chapter view
  if (activeChapter && activeChapterData && hasAccess) {
    return (
      <>
        <SEOHead title={`${activeChapterData.title} - ${course.title}`} path={`/course/${id}`} />
        <Atmosphere /><Header />
        <main className="pt-28 pb-20 min-h-screen">
          <div className="container mx-auto px-4" style={{ maxWidth: '900px' }}>
            <button onClick={() => setActiveChapter(null)} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-6 text-sm">
              <span className="material-symbols-rounded text-lg">arrow_back</span>
              თავებზე დაბრუნება
            </button>

            <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">თავი {activeChapterData.chapter_number}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{activeChapterData.title}</h1>

            {activeChapterData.content ? (
              <div className="prose prose-invert max-w-none mb-8 rounded-2xl border border-white/[0.06] bg-accent/30 p-6 sm:p-8">
                <MarkdownRenderer content={activeChapterData.content} />
              </div>
            ) : (
              <div className="mb-8 rounded-2xl border border-white/[0.06] bg-accent/30 p-8 text-center">
                <span className="material-symbols-rounded text-4xl text-muted-foreground mb-3 block">auto_awesome</span>
                {generateContent.isPending ? (
                  <>
                    <span className="material-symbols-rounded text-3xl text-gold animate-spin block mb-3">progress_activity</span>
                    <p className="text-muted-foreground text-sm">კონტენტი გენერირდება... გთხოვთ მოიცადოთ.</p>
                    <p className="text-xs text-muted-foreground mt-1">ამას შეიძლება 30-60 წამი დასჭირდეს.</p>
                  </>
                ) : canGenerateToday ? (
                  <>
                    <p className="text-muted-foreground text-sm mb-4">ამ თავის კონტენტი ჯერ არ არის გენერირებული.</p>
                    <button
                      onClick={() => id && handleGenerateChapter(activeChapterData.id)}
                      className="btn btn-gold"
                    >
                      <span className="material-symbols-rounded text-sm">auto_awesome</span>
                      კონტენტის გენერაცია
                    </button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">დღევანდელი გენერაციის ლიმიტი ამოიწურა. სცადეთ ხვალ.</p>
                )}
              </div>
            )}

            {activeChapterData.code_template && (
              <div className="mb-8 rounded-xl border border-white/[0.06] bg-black/40 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="material-symbols-rounded text-sm text-gold">code</span>
                  <span className="text-xs text-muted-foreground">კოდის მაგალითი</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm"><code>{activeChapterData.code_template}</code></pre>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              {!completedChapterIds.has(activeChapterData.id) ? (
                <button onClick={() => handleCompleteChapter(activeChapterData.id)} className="btn btn-gold" disabled={updateProgress.isPending}>
                  <span className="material-symbols-rounded text-sm">check_circle</span>
                  თავის დასრულება
                </button>
              ) : (
                <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <span className="material-symbols-rounded text-sm">check_circle</span>
                  დასრულებულია
                </span>
              )}
              {(() => {
                const next = chapters.find(c => c.chapter_number === activeChapterData.chapter_number + 1);
                return next ? (
                  <button onClick={() => handleOpenChapter(next.id)} className="btn btn-outline" disabled={!canReadMore}>
                    შემდეგი თავი <span className="material-symbols-rounded text-sm">arrow_forward</span>
                  </button>
                ) : null;
              })()}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead title={course.title} description={course.description || undefined} path={`/course/${id}`} />
      <Atmosphere /><Header /><ChatWidget />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          <Link to="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8 text-sm">
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            კურსებზე დაბრუნება
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 bg-accent">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="material-symbols-rounded text-7xl text-gold/20">school</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{course.title}</h1>

              <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
                {course.difficulty && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-white/[0.06]">
                    <span className="material-symbols-rounded text-sm">signal_cellular_alt</span>
                    {difficultyLabels[course.difficulty] || course.difficulty}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-white/[0.06]">
                  <span className="material-symbols-rounded text-sm">library_books</span>
                  {course.total_chapters} თავი
                </span>
                {course.duration_hours && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-white/[0.06]">
                    <span className="material-symbols-rounded text-sm">schedule</span>
                    {course.duration_hours} საათი
                  </span>
                )}
              </div>

              {course.description && (
                <div className="prose prose-invert max-w-none mb-8 text-muted-foreground leading-relaxed">
                  <p>{course.description}</p>
                </div>
              )}

              <h2 className="text-xl font-bold text-foreground mb-4">სილაბუსი</h2>
              <div className="space-y-2">
                {chapters.map((chapter) => {
                  const isCompleted = completedChapterIds.has(chapter.id);
                  const isRead = readChapterIds.has(chapter.id);
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => hasAccess ? handleOpenChapter(chapter.id) : null}
                      disabled={!hasAccess || (!canReadMore && !isRead)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all text-left ${
                        hasAccess && (canReadMore || isRead)
                          ? 'border-white/[0.06] bg-accent hover:border-gold/20 hover:bg-accent/60 cursor-pointer'
                          : 'border-white/[0.04] bg-accent opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-green-500/20 text-green-400' : isRead ? 'bg-blue-500/20 text-blue-400' : 'bg-gold/10 text-gold'
                      }`}>
                        {isCompleted ? (
                          <span className="material-symbols-rounded text-sm">check</span>
                        ) : (
                          chapter.chapter_number
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">{chapter.title}</h3>
                        {chapter.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{chapter.description}</p>
                        )}
                      </div>
                      {hasAccess ? (
                        <span className="material-symbols-rounded text-lg text-muted-foreground">chevron_right</span>
                      ) : (
                        <span className="material-symbols-rounded text-lg text-muted-foreground">lock</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar - show first on mobile */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="sticky top-32 rounded-2xl border border-white/[0.06] bg-accent/30 backdrop-blur-sm p-6">
                {/* Price */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gold">{course.monthly_price}₾</div>
                  <p className="text-xs text-muted-foreground mt-1">თვეში</p>
                </div>

                {/* Subscription info */}
                {hasAccess && (
                  <div className="mb-6 space-y-3">
                    <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
                        <span className="material-symbols-rounded text-sm">verified</span>
                        აქტიური გამოწერა
                      </div>
                      <p className="text-xs text-muted-foreground">დარჩენილია {daysRemaining} დღე</p>
                    </div>

                    <div className="rounded-xl bg-accent/50 border border-white/[0.06] p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>თვის ლიმიტი</span>
                        <span>{chaptersReadThisMonth}/{monthlyLimit}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(chaptersReadThisMonth / monthlyLimit) * 100}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">დარჩენილია {remainingReads} თავი ამ თვეში</p>
                    </div>

                    {/* Progress */}
                    {chapters.length > 0 && (
                      <div className="rounded-xl bg-accent/50 border border-white/[0.06] p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>პროგრესი</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{completedCount}/{chapters.length} თავი დასრულებული</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action */}
                {hasAccess ? (
                  <button
                    onClick={() => {
                      const first = chapters.find(c => !completedChapterIds.has(c.id)) || chapters[0];
                      if (first) handleOpenChapter(first.id);
                    }}
                    className="btn btn-gold w-full"
                    disabled={!canReadMore}
                  >
                    <span className="material-symbols-rounded text-sm">play_arrow</span>
                    {completedCount > 0 ? 'გაგრძელება' : 'დაწყება'}
                  </button>
                ) : user ? (
                  <button
                    onClick={() => !inCart && addCourseItem(course)}
                    disabled={inCart}
                    className="btn btn-gold w-full"
                  >
                    <span className="material-symbols-rounded text-sm">{inCart ? 'check' : 'shopping_cart'}</span>
                    {inCart ? 'კალათაშია' : 'გამოწერა — 1 თვე'}
                  </button>
                ) : (
                  <Link to="/auth" className="btn btn-gold w-full text-center">
                    <span className="material-symbols-rounded text-sm">login</span>
                    შესვლა
                  </Link>
                )}

                {!hasAccess && (
                  <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-lg text-gold/50">calendar_month</span>
                      თვიური გამოწერა
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-lg text-gold/50">menu_book</span>
                      თვეში {monthlyLimit} თავის წაკითხვა
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-lg text-gold/50">devices</span>
                      ნებისმიერი მოწყობილობა
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CourseDetail;
