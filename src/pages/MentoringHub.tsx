import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useMentoringCourseBySlug,
  useHubAccess,
  useHubChannels,
  useHubMembers,
  HubChannel,
} from '@/hooks/useMentoringHub';
import { useMyHubMembership } from '@/hooks/useMentoringHubExtras';
import ChannelSidebar from '@/components/mentoring/hub/ChannelSidebar';
import MessagePanel from '@/components/mentoring/hub/MessagePanel';
import VoicePanel from '@/components/mentoring/hub/VoicePanel';
import LecturePanel from '@/components/mentoring/hub/LecturePanel';
import AssignmentsPanel from '@/components/mentoring/hub/AssignmentsPanel';
import MembersList from '@/components/mentoring/hub/MembersList';
import DMPanel from '@/components/mentoring/hub/DMPanel';
import FriendsPanel from '@/components/mentoring/hub/FriendsPanel';
import SEOHead from '@/components/SEOHead';

type View = 'channel' | 'dms' | 'friends';

const MentoringHub = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const { data: course, isLoading: courseLoading } = useMentoringCourseBySlug(slug);
  const { data: hasAccess, isLoading: accessLoading } = useHubAccess(course?.id);
  const { data: channels = [] } = useHubChannels(course?.id);
  const { data: members = [] } = useHubMembers(course?.id);
  const { data: membership } = useMyHubMembership(course?.id);

  const [activeChannel, setActiveChannel] = useState<HubChannel | null>(null);
  const [view, setView] = useState<View>('channel');
  const [activeDmId, setActiveDmId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeChannel && channels.length > 0) {
      const firstText = channels.find(c => c.type === 'text') ?? channels[0];
      setActiveChannel(firstText);
    }
  }, [channels, activeChannel]);

  // Guards
  if (authLoading || courseLoading) {
    return <FullPage>იტვირთება...</FullPage>;
  }
  if (!user) {
    navigate(`/auth?next=/mentoring/${slug}/hub`, { replace: true });
    return null;
  }
  if (!course) {
    return <FullPage>კურსი ვერ მოიძებნა. <Link to="/" style={{ color: 'var(--text-primary)' }}>მთავარზე</Link></FullPage>;
  }
  if (accessLoading) return <FullPage>წვდომის შემოწმება...</FullPage>;
  if (!hasAccess) {
    return (
      <FullPage>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
            წვდომა შეზღუდულია
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            ამ სივრცეში შესასვლელად საჭიროა კურსზე რეგისტრაცია და გადახდა.
          </div>
          <Link to={`/mentoring/${slug}`} style={{
            display: 'inline-block', padding: '10px 18px',
            background: 'var(--text-primary)', color: 'var(--bg-card)',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600,
          }}>კურსის გვერდი</Link>
        </div>
      </FullPage>
    );
  }

  const onSelectChannel = (ch: HubChannel) => {
    setActiveChannel(ch);
    setView('channel');
  };
  const onOpenDM = (dmId: string) => {
    setActiveDmId(dmId);
    setView('dms');
  };

  return (
    <>
      <SEOHead title={`${course.title} — Hub`} />
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg-void, #0a0a0a)',
        display: 'flex', overflow: 'hidden',
      }}>
        <ChannelSidebar
          channels={channels}
          activeId={activeChannel?.id ?? null}
          onSelect={onSelectChannel}
          onSelectDMs={() => setView('dms')}
          onSelectFriends={() => setView('friends')}
          view={view}
          courseTitle={course.title}
          myTier={membership?.package_tier ?? 1}
          myRole={membership?.role}
        />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-void, #0a0a0a)' }}>
          {/* Top breadcrumb */}
          <div style={{
            padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem',
          }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← მთავარი</Link>
            {isAdmin && (
              <Link to="/admin/mentoring" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginLeft: 'auto' }}>
                ადმინ პანელი
              </Link>
            )}
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            {view === 'channel' && activeChannel && activeChannel.category === 'lecture' && (
              <LecturePanel channel={activeChannel} courseId={course.id} />
            )}
            {view === 'channel' && activeChannel && activeChannel.category === 'assignment' && (
              <AssignmentsPanel channel={activeChannel} courseId={course.id} />
            )}
            {view === 'channel' && activeChannel && activeChannel.type === 'text' && (activeChannel.category ?? 'general') === 'general' && (
              <MessagePanel channel={activeChannel} courseId={course.id} />
            )}
            {view === 'channel' && activeChannel && activeChannel.type === 'voice' && activeChannel.category !== 'lecture' && (
              <VoicePanel channel={activeChannel} courseId={course.id} />
            )}
            {view === 'channel' && !activeChannel && (
              <div style={{ padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}>
                ჯერ არცერთი არხი არ არის. ადმინი დაამატებს.
              </div>
            )}
            {view === 'dms' && (
              <DMPanel courseId={course.id} activeDmId={activeDmId} setActiveDmId={setActiveDmId} />
            )}
            {view === 'friends' && (
              <FriendsPanel courseId={course.id} onOpenDM={onOpenDM} />
            )}
          </div>
        </main>

        <MembersList members={members} courseId={course.id} onOpenDM={onOpenDM} />
      </div>
    </>
  );
};

const FullPage = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-void, #0a0a0a)', color: 'var(--text-secondary)', padding: '40px',
  }}>{children}</div>
);

export default MentoringHub;
