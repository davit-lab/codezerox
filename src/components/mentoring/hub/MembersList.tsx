import { HubMember, HubRole, useOrCreateDM, useSendFriendRequest, useFriendships } from '@/hooks/useMentoringHub';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  members: HubMember[];
  courseId: string;
  onOpenDM: (dmId: string) => void;
}

const ROLE_LABEL: Record<HubRole, string> = {
  mentor: 'მენტორი',
  mentor_assistant: 'ასისტენტი',
  top_student: 'ტოპ სტუდენტი',
  student: 'სტუდენტი',
};

const ROLE_COLOR: Record<HubRole, string> = {
  mentor: '#d4a017',
  mentor_assistant: '#8b5cf6',
  top_student: '#22c55e',
  student: 'var(--text-muted)',
};

const ROLE_ORDER: Record<HubRole, number> = { mentor: 0, mentor_assistant: 1, top_student: 2, student: 3 };

const MembersList = ({ members, courseId, onOpenDM }: Props) => {
  const { user } = useAuth();
  const orCreateDm = useOrCreateDM();
  const sendFriend = useSendFriendRequest();
  const { data: friendships = [] } = useFriendships(courseId);

  const sorted = [...members].sort((a, b) => {
    const r = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
    if (r !== 0) return r;
    return (a.profile?.full_name ?? '').localeCompare(b.profile?.full_name ?? '');
  });

  const friendStatus = (otherId: string): 'none' | 'pending' | 'accepted' => {
    const f = friendships.find((x: any) =>
      (x.requester_id === user?.id && x.addressee_id === otherId) ||
      (x.addressee_id === user?.id && x.requester_id === otherId));
    if (!f) return 'none';
    if (f.status === 'accepted') return 'accepted';
    return 'pending';
  };

  const openDM = async (otherId: string) => {
    try {
      const id = await orCreateDm.mutateAsync({ courseId, otherUserId: otherId });
      onOpenDM(id);
    } catch (e: any) {
      toast.error(e?.message ?? 'ვერ გავხსენი ჩატი');
    }
  };

  const addFriend = async (otherId: string) => {
    try {
      await sendFriend.mutateAsync({ courseId, addresseeId: otherId });
      toast.success('მეგობრობის მოთხოვნა გაგზავნილია');
    } catch (e: any) {
      toast.error(e?.message ?? 'შეცდომა');
    }
  };

  return (
    <aside style={{
      width: '260px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border-subtle)',
      overflowY: 'auto', padding: '16px 12px',
    }}>
      <div style={{
        fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600,
      }}>წევრები — {members.length}</div>

      {sorted.map(m => {
        const isMe = m.user_id === user?.id;
        const fs = isMe ? 'self' : friendStatus(m.user_id);
        return (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 6px',
            borderRadius: '6px',
          }}>
            <div style={{ width: '4px', alignSelf: 'stretch', background: ROLE_COLOR[m.role], borderRadius: '2px', flexShrink: 0 }} />
            {m.profile?.avatar_url ? (
              <img src={m.profile.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
              }}>{(m.profile?.full_name ?? 'U').charAt(0).toUpperCase()}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{m.profile?.full_name ?? 'მომხმარებელი'} {isMe && <span style={{ color: 'var(--text-muted)' }}>(შენ)</span>}</div>
              <div style={{ color: ROLE_COLOR[m.role], fontSize: '0.7rem' }}>{ROLE_LABEL[m.role]}{m.banned ? ' • დაბანილი' : m.muted ? ' • დადუმებული' : ''}</div>
            </div>
            {!isMe && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <IconBtn title="ჩატი" icon="chat" onClick={() => openDM(m.user_id)} />
                {fs === 'none' && <IconBtn title="დაამატე მეგობრად" icon="person_add" onClick={() => addFriend(m.user_id)} />}
                {fs === 'accepted' && <IconBtn title="მეგობარია" icon="check" disabled />}
                {fs === 'pending' && <IconBtn title="მოლოდინში" icon="schedule" disabled />}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

const IconBtn = ({ icon, title, onClick, disabled }: { icon: string; title: string; onClick?: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px',
      cursor: disabled ? 'default' : 'pointer', color: 'var(--text-muted)',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{icon}</span>
  </button>
);

export default MembersList;
