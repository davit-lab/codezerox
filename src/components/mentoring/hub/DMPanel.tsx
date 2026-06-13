import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useDMList, useDMMessages, useSendDM } from '@/hooks/useMentoringHub';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  courseId: string;
  activeDmId: string | null;
  setActiveDmId: (id: string | null) => void;
}

const DMPanel = ({ courseId, activeDmId, setActiveDmId }: Props) => {
  const { user } = useAuth();
  const { data: dms = [] } = useDMList(courseId);
  const { data: messages = [] } = useDMMessages(activeDmId ?? undefined);
  const send = useSendDM();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    if (!activeDmId && dms.length > 0) setActiveDmId(dms[0].id);
  }, [activeDmId, dms, setActiveDmId]);

  const onSend = async () => {
    const v = text.trim();
    if (!v || !activeDmId) return;
    setText('');
    try {
      await send.mutateAsync({ dmId: activeDmId, content: v });
    } catch (e: any) {
      toast.error(e?.message ?? 'ვერ გაიგზავნა');
      setText(v);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const active = dms.find(d => d.id === activeDmId);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* DM list */}
      <div style={{
        width: '240px', borderRight: '1px solid var(--border-subtle)',
        overflowY: 'auto', padding: '12px 8px',
      }}>
        <div style={{
          fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', padding: '4px 8px', marginBottom: '6px', fontWeight: 600,
        }}>პირადი მესიჯები</div>
        {dms.length === 0 && (
          <div style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            ჯერ არ გქონია ჩათები. გახსენი წევრების სიიდან.
          </div>
        )}
        {dms.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDmId(d.id)}
            style={{
              width: '100%', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeDmId === d.id ? 'var(--bg-elevated)' : 'transparent',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              color: activeDmId === d.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              textAlign: 'left', marginBottom: '2px',
            }}
          >
            {d.other?.avatar_url ? (
              <img src={d.other.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {(d.other?.full_name ?? 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.other?.full_name ?? 'მომხმარებელი'}
            </span>
          </button>
        ))}
      </div>

      {/* DM thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)', fontWeight: 600,
        }}>{active?.other?.full_name ?? (activeDmId ? '...' : 'აირჩიე ჩატი')}</div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {!activeDmId && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              აირჩიე საუბარი მარცხნიდან, ან გახსენი ახალი წევრების სიიდან
            </div>
          )}
          {messages.map(m => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                <div style={{
                  maxWidth: '70%', padding: '8px 12px', borderRadius: '8px',
                  background: mine ? 'var(--text-primary)' : 'var(--bg-elevated)',
                  color: mine ? 'var(--bg-card)' : 'var(--text-primary)',
                  fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                  <div style={{
                    fontSize: '0.65rem', marginTop: '4px',
                    opacity: 0.7, textAlign: 'right',
                  }}>{new Date(m.created_at).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
        </div>

        {activeDmId && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder="დაწერე მესიჯი..."
                style={{
                  flex: 1, resize: 'none', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px',
                  padding: '10px 12px', color: 'var(--text-primary)',
                  fontSize: '0.9rem', fontFamily: 'inherit', minHeight: '40px', maxHeight: '160px', outline: 'none',
                }}
              />
              <button
                onClick={onSend}
                disabled={!text.trim() || send.isPending}
                style={{
                  padding: '10px 16px', background: 'var(--text-primary)', color: 'var(--bg-card)',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                  opacity: !text.trim() ? 0.5 : 1,
                }}
              >გაგზავნა</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DMPanel;
