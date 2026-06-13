import { useFriendships, useRespondFriendRequest, useHubMembers, useOrCreateDM } from '@/hooks/useMentoringHub';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  courseId: string;
  onOpenDM: (dmId: string) => void;
}

const FriendsPanel = ({ courseId, onOpenDM }: Props) => {
  const { user } = useAuth();
  const { data: friendships = [] } = useFriendships(courseId);
  const { data: members = [] } = useHubMembers(courseId);
  const respond = useRespondFriendRequest();
  const orCreateDm = useOrCreateDM();

  const incoming = friendships.filter((f: any) => f.addressee_id === user?.id && f.status === 'pending');
  const outgoing = friendships.filter((f: any) => f.requester_id === user?.id && f.status === 'pending');
  const accepted = friendships.filter((f: any) => f.status === 'accepted');

  const nameOf = (uid: string) => members.find(m => m.user_id === uid)?.profile?.full_name ?? 'მომხმარებელი';
  const avatarOf = (uid: string) => members.find(m => m.user_id === uid)?.profile?.avatar_url ?? null;

  const openDm = async (uid: string) => {
    try {
      const id = await orCreateDm.mutateAsync({ courseId, otherUserId: uid });
      onOpenDM(id);
    } catch (e: any) { toast.error(e?.message ?? 'შეცდომა'); }
  };

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
      <h2 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '20px', fontWeight: 600 }}>მეგობრები</h2>

      <Section title={`შემოსული მოთხოვნები — ${incoming.length}`}>
        {incoming.length === 0 && <Empty>ცარიელია</Empty>}
        {incoming.map((f: any) => (
          <Row
            key={f.id}
            name={nameOf(f.requester_id)}
            avatar={avatarOf(f.requester_id)}
            actions={
              <>
                <Btn primary onClick={() => respond.mutate({ id: f.id, status: 'accepted', courseId })}>მიღება</Btn>
                <Btn onClick={() => respond.mutate({ id: f.id, status: 'declined', courseId })}>უარყოფა</Btn>
              </>
            }
          />
        ))}
      </Section>

      <Section title={`გაგზავნილი მოთხოვნები — ${outgoing.length}`}>
        {outgoing.length === 0 && <Empty>ცარიელია</Empty>}
        {outgoing.map((f: any) => (
          <Row key={f.id} name={nameOf(f.addressee_id)} avatar={avatarOf(f.addressee_id)} actions={<span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>მოლოდინში</span>} />
        ))}
      </Section>

      <Section title={`მეგობრები — ${accepted.length}`}>
        {accepted.length === 0 && <Empty>ჯერ არცერთი მეგობარი</Empty>}
        {accepted.map((f: any) => {
          const otherId = f.requester_id === user?.id ? f.addressee_id : f.requester_id;
          return (
            <Row
              key={f.id}
              name={nameOf(otherId)}
              avatar={avatarOf(otherId)}
              actions={<Btn onClick={() => openDm(otherId)}>ჩატი</Btn>}
            />
          );
        })}
      </Section>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</div>
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 12px' }}>{children}</div>
);

const Row = ({ name, avatar, actions }: { name: string; avatar: string | null; actions: React.ReactNode }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)', borderRadius: '8px',
  }}>
    {avatar ? (
      <img src={avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{name.charAt(0).toUpperCase()}</div>
    )}
    <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{name}</div>
    <div style={{ display: 'flex', gap: '6px' }}>{actions}</div>
  </div>
);

const Btn = ({ children, onClick, primary }: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 12px',
      background: primary ? 'var(--text-primary)' : 'transparent',
      color: primary ? 'var(--bg-card)' : 'var(--text-primary)',
      border: '1px solid var(--text-primary)', borderRadius: '6px',
      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
    }}
  >{children}</button>
);

export default FriendsPanel;
