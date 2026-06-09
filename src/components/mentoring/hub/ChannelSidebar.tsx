import { HubChannel } from '@/hooks/useMentoringHub';

interface Props {
  channels: HubChannel[];
  activeId: string | null;
  onSelect: (ch: HubChannel) => void;
  onSelectDMs: () => void;
  onSelectFriends: () => void;
  view: 'channel' | 'dms' | 'friends';
  courseTitle?: string;
  myTier?: number;
  myRole?: string;
}

const TIER_LABEL: Record<number, string> = { 1: 'პაკეტი 1', 2: 'პაკეტი 2', 3: 'პაკეტი 3' };
const TIER_COLOR: Record<number, string> = { 1: '#6b7280', 2: '#3b82f6', 3: '#d4a017' };

const ChannelSidebar = ({ channels, activeId, onSelect, onSelectDMs, onSelectFriends, view, courseTitle, myTier = 1, myRole }: Props) => {
  const isStaff = myRole === 'mentor' || myRole === 'mentor_assistant';

  // Hide channels above my tier (mentors/admins see all)
  const visible = isStaff ? channels : channels.filter(c => (c.min_tier ?? 1) <= myTier);

  const text = visible.filter(c => c.type === 'text' && (c.category ?? 'general') === 'general');
  const voice = visible.filter(c => c.type === 'voice' && (c.category ?? 'voice') !== 'lecture');
  const lecture = visible.filter(c => c.category === 'lecture');
  const assignment = visible.filter(c => c.category === 'assignment');

  return (
    <aside style={{
      width: '240px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px', borderBottom: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{courseTitle ?? 'მენტორინგი'}</div>

      {/* Tier badge */}
      {!isStaff && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
            fontSize: '0.7rem', fontWeight: 600, color: 'white',
            background: TIER_COLOR[myTier] ?? '#6b7280',
          }}>{TIER_LABEL[myTier] ?? `პაკეტი ${myTier}`}</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <Section label="ტექსტური არხები">
          {text.map(ch => (
            <ChannelRow key={ch.id} active={view === 'channel' && activeId === ch.id} onClick={() => onSelect(ch)} icon="tag" name={ch.name} locked={(ch.min_tier ?? 1) > myTier && isStaff} />
          ))}
          {text.length === 0 && <Empty>არხები ჯერ არ არის</Empty>}
        </Section>

        <Section label="ხმოვანი არხები">
          {voice.map(ch => (
            <ChannelRow key={ch.id} active={view === 'channel' && activeId === ch.id} onClick={() => onSelect(ch)} icon="volume_up" name={ch.name} />
          ))}
          {voice.length === 0 && <Empty>ხმოვანი არხები არ არის</Empty>}
        </Section>

        <Section label="ლექციები">
          {lecture.map(ch => (
            <ChannelRow key={ch.id} active={view === 'channel' && activeId === ch.id} onClick={() => onSelect(ch)} icon="cast" name={ch.name} />
          ))}
          {lecture.length === 0 && <Empty>ლექციის არხები არ არის</Empty>}
        </Section>

        <Section label="დავალებები">
          {assignment.map(ch => (
            <ChannelRow key={ch.id} active={view === 'channel' && activeId === ch.id} onClick={() => onSelect(ch)} icon="assignment" name={ch.name} />
          ))}
          {assignment.length === 0 && <Empty>დავალების არხები არ არის</Empty>}
        </Section>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 4px' }} />

        <ChannelRow active={view === 'dms'} onClick={onSelectDMs} icon="forum" name="პირადი მესიჯები" />
        <ChannelRow active={view === 'friends'} onClick={onSelectFriends} icon="group" name="მეგობრები" />
      </div>
    </aside>
  );
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{
      fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
      color: 'var(--text-muted)', padding: '4px 8px', fontWeight: 600,
    }}>{label}</div>
    {children}
  </div>
);

const ChannelRow = ({ icon, name, active, onClick, locked }: { icon: string; name: string; active: boolean; onClick: () => void; locked?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 10px', background: active ? 'var(--bg-elevated)' : 'transparent',
      border: 'none', borderRadius: '6px', cursor: 'pointer',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      fontSize: '0.9rem', textAlign: 'left', marginBottom: '2px',
      opacity: locked ? 0.5 : 1,
    }}
  >
    <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{icon}</span>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{name}</span>
    {locked && <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>lock</span>}
  </button>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '6px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{children}</div>
);

export default ChannelSidebar;
