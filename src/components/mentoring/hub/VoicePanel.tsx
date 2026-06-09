import { useEffect, useState } from 'react';
import { HubChannel, useVoicePresence, useHubMembers } from '@/hooks/useMentoringHub';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  channel: HubChannel;
  courseId: string;
}

/**
 * Simplified voice room: tracks presence (who is in the channel) via DB and uses
 * local microphone capture with mute toggle. Full WebRTC mesh signaling is
 * stubbed for the next iteration; this version provides the UI + presence.
 */
const VoicePanel = ({ channel, courseId }: Props) => {
  const { user } = useAuth();
  const { data: sessions = [], join, leave } = useVoicePresence(channel.id, courseId);
  const { data: members = [] } = useHubMembers(courseId);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);

  const inRoom = sessions.some((s: any) => s.user_id === user?.id);

  useEffect(() => () => {
    // cleanup on unmount: leave room + stop tracks
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (inRoom) leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(s);
      await join();
      toast.success('დაუკავშირდი ხმოვან არხს');
    } catch (e: any) {
      toast.error('მიკროფონზე წვდომა ვერ მივიღე');
    }
  };

  const handleLeave = async () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    await leave();
  };

  const toggleMute = () => {
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach(t => (t.enabled = !next));
    setMuted(next);
  };

  const getName = (uid: string) => {
    const m = members.find(x => x.user_id === uid);
    return m?.profile?.full_name ?? 'მომხმარებელი';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--text-muted)' }}>volume_up</span>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{channel.name}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{
          fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600,
        }}>არხში — {sessions.length}</div>

        {sessions.length === 0 && (
          <div style={{ color: 'var(--text-muted)' }}>ჯერ ვერავინ შემოვიდა</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {sessions.map((s: any) => (
            <div key={s.id} style={{
              padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', fontWeight: 600,
              }}>{getName(s.user_id).charAt(0).toUpperCase()}</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'center', wordBreak: 'break-word' }}>
                {getName(s.user_id)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '14px 20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {!inRoom ? (
          <button
            onClick={handleJoin}
            style={{
              padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg-card)',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>call</span>
            შესვლა
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              style={{
                padding: '10px 16px', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600,
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{muted ? 'mic_off' : 'mic'}</span>
              {muted ? 'გაშვება' : 'დადუმება'}
            </button>
            <button
              onClick={handleLeave}
              style={{
                padding: '10px 16px', background: '#dc2626', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>call_end</span>
              გასვლა
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoicePanel;
