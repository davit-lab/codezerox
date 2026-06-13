import { useState } from 'react';
import {
  useHubChannels, useHubMembers, useUpsertChannel, useDeleteChannel,
  useUpdateMember, useRemoveMember, useAddMemberByEmail, HubRole,
} from '@/hooks/useMentoringHub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ROLE_LABEL: Record<HubRole, string> = {
  mentor: 'მენტორი', mentor_assistant: 'ასისტენტი', top_student: 'ტოპ სტუდენტი', student: 'სტუდენტი',
};

interface Props {
  courseId: string;
  courseTitle: string;
}

const MentoringHubManager = ({ courseId, courseTitle }: Props) => {
  const { data: channels = [] } = useHubChannels(courseId);
  const { data: members = [] } = useHubMembers(courseId);
  const upsertCh = useUpsertChannel();
  const delCh = useDeleteChannel();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const addMember = useAddMemberByEmail();

  const [chName, setChName] = useState('');
  const [chType, setChType] = useState<'text' | 'voice'>('text');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<HubRole>('student');

  const handleAddChannel = async () => {
    if (!chName.trim()) return;
    try {
      await upsertCh.mutateAsync({ course_id: courseId, name: chName.trim(), type: chType });
      setChName('');
      toast.success('არხი დამატებულია');
    } catch (e: any) { toast.error(e?.message ?? 'შეცდომა'); }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    try {
      await addMember.mutateAsync({ courseId, email: memberEmail.trim(), role: memberRole });
      setMemberEmail('');
      toast.success('წევრი დამატებულია');
    } catch (e: any) { toast.error(e?.message ?? 'შეცდომა'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Hub: <strong style={{ color: 'var(--text-primary)' }}>{courseTitle}</strong>
      </div>

      {/* Channels */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>არხები</h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <Input placeholder="არხის სახელი" value={chName} onChange={e => setChName(e.target.value)} style={{ maxWidth: '240px' }} />
          <select value={chType} onChange={e => setChType(e.target.value as any)}
            style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }}>
            <option value="text">ტექსტური</option>
            <option value="voice">ხმოვანი</option>
          </select>
          <Button onClick={handleAddChannel}>დამატება</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {channels.map(ch => (
            <div key={ch.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
              background: 'var(--bg-elevated)', borderRadius: '6px',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
                {ch.type === 'voice' ? 'volume_up' : 'tag'}
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{ch.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{ch.type}</span>
              <button
                onClick={() => { if (confirm('წავშალო?')) delCh.mutate({ id: ch.id, courseId }); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
              >წაშლა</button>
            </div>
          ))}
          {channels.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>არხები ჯერ არ არის</div>}
        </div>
      </section>

      {/* Members */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>წევრები — {members.length}</h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <Input placeholder="მომხმარებლის email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} style={{ maxWidth: '280px' }} />
          <select value={memberRole} onChange={e => setMemberRole(e.target.value as HubRole)}
            style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }}>
            {(Object.keys(ROLE_LABEL) as HubRole[]).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <Button onClick={handleAddMember}>დამატება</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {members.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
              background: 'var(--bg-elevated)', borderRadius: '6px', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {m.profile?.full_name ?? '—'} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.profile?.email}</span>
                </div>
              </div>
              <select
                value={m.role}
                onChange={e => updateMember.mutate({ id: m.id, courseId, role: e.target.value as HubRole })}
                style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
              >
                {(Object.keys(ROLE_LABEL) as HubRole[]).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={m.muted}
                  onChange={e => updateMember.mutate({ id: m.id, courseId, muted: e.target.checked })} />
                დადუმება
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={m.banned}
                  onChange={e => updateMember.mutate({ id: m.id, courseId, banned: e.target.checked })} />
                ბანი
              </label>
              <button
                onClick={() => { if (confirm('წავშალო წევრი?')) removeMember.mutate({ id: m.id, courseId }); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
              >წაშლა</button>
            </div>
          ))}
          {members.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>წევრები ჯერ არ არის</div>}
        </div>
      </section>
    </div>
  );
};

export default MentoringHubManager;
