import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { HubChannel, useChannelMessages, useSendChannelMessage, useDeleteChannelMessage } from '@/hooks/useMentoringHub';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  channel: HubChannel;
  courseId: string;
}

interface Pending {
  url: string;
  name: string;
  type: string;
}

const MessagePanel = ({ channel, courseId }: Props) => {
  const { user, isAdmin } = useAuth();
  const { data: messages = [], isLoading } = useChannelMessages(channel.id);
  const send = useSendChannelMessage();
  const del = useDeleteChannelMessage();
  const [text, setText] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const onPickFile = async (file: File) => {
    if (!user) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('ფაილი 25MB-ზე მეტია');
      return;
    }
    try {
      setUploading(true);
      const path = `${user.id}/${courseId}/chat/${channel.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
      const { data, error } = await supabase.storage.from('chat-attachments').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(data.path);
      setPending({ url: pub.publicUrl, name: file.name, type: file.type || 'application/octet-stream' });
    } catch (e: any) {
      toast.error(e?.message ?? 'ატვირთვა ვერ მოხერხდა');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onSend = async () => {
    const v = text.trim();
    if (!v && !pending) return;
    const snapshot = { v, p: pending };
    setText('');
    setPending(null);
    try {
      await send.mutateAsync({
        channelId: channel.id,
        courseId,
        content: v || (pending ? '📎' : ''),
        attachmentUrl: snapshot.p?.url ?? null,
        attachmentName: snapshot.p?.name ?? null,
        attachmentType: snapshot.p?.type ?? null,
      });
    } catch (e: any) {
      toast.error(e?.message ?? 'გაგზავნა ვერ მოხერხდა');
      setText(snapshot.v);
      setPending(snapshot.p);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--text-muted)' }}>tag</span>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{channel.name}</div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          {messages.length} შეტყობინება
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {isLoading && <div style={{ color: 'var(--text-muted)' }}>იტვირთება...</div>}
        {!isLoading && messages.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            არხი ცარიელია — დაწერე პირველი მესიჯი
          </div>
        )}
        {messages.map((m, i) => {
          const canDel = m.user_id === user?.id || isAdmin;
          const prev = messages[i - 1];
          const showHeader = !prev || prev.user_id !== m.user_id ||
            (new Date(m.created_at).getTime() - new Date(prev.created_at).getTime()) > 5 * 60 * 1000;
          return (
            <div key={m.id} style={{
              display: 'flex', gap: '12px', marginBottom: showHeader ? '12px' : '2px',
              marginTop: showHeader ? '14px' : 0, alignItems: 'flex-start',
            }}>
              <div style={{ width: '36px', flexShrink: 0 }}>
                {showHeader && <Avatar url={m.profile?.avatar_url} name={m.profile?.full_name ?? 'მომხმარებელი'} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {showHeader && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {m.profile?.full_name || 'მომხმარებელი'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {new Date(m.created_at).toLocaleString('ka-GE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                    {canDel && (
                      <button
                        onClick={() => del.mutate({ id: m.id, channelId: channel.id })}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                        title="წაშლა"
                      >წაშლა</button>
                    )}
                  </div>
                )}
                {m.content && m.content !== '📎' && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.content}
                  </div>
                )}
                {m.attachment_url && <Attachment url={m.attachment_url} name={m.attachment_name} type={m.attachment_type} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
        {pending && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', marginBottom: '8px',
            background: 'var(--bg-elevated)', borderRadius: '6px',
            border: '1px solid var(--border-subtle)', fontSize: '0.82rem',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>attach_file</span>
            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {pending.name}
            </span>
            <button
              onClick={() => setPending(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="წაშლა"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !!pending}
            title="ფაილის მიმაგრება"
            style={{
              padding: '10px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: uploading || pending ? 0.5 : 1,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
              {uploading ? 'progress_activity' : 'attach_file'}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && onPickFile(e.target.files[0])}
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={`შეტყობინება #${channel.name}-ში...`}
            rows={1}
            style={{
              flex: 1, resize: 'none', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px',
              padding: '10px 12px', color: 'var(--text-primary)',
              fontSize: '0.9rem', fontFamily: 'inherit', minHeight: '40px', maxHeight: '160px',
              outline: 'none',
            }}
          />
          <button
            onClick={onSend}
            disabled={(!text.trim() && !pending) || send.isPending}
            style={{
              padding: '10px 16px', background: 'var(--text-primary)', color: 'var(--bg-card)',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              opacity: (!text.trim() && !pending) ? 0.5 : 1,
            }}
          >გაგზავნა</button>
        </div>
      </div>
    </div>
  );
};

const Attachment = ({ url, name, type }: { url: string; name: string | null; type: string | null }) => {
  const isImage = type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name ?? url);
  const isVideo = type?.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(name ?? url);
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '6px' }}>
        <img src={url} alt={name ?? ''} style={{ maxWidth: '320px', maxHeight: '240px', borderRadius: '8px', display: 'block' }} />
      </a>
    );
  }
  if (isVideo) {
    return (
      <video controls src={url} style={{ maxWidth: '420px', marginTop: '6px', borderRadius: '8px', background: '#000' }} />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '6px',
        padding: '8px 12px', background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)', borderRadius: '8px',
        color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem',
      }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>description</span>
      <span style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name ?? 'ფაილი'}
      </span>
    </a>
  );
};

const Avatar = ({ url, name }: { url?: string | null; name: string }) => (
  url ? (
    <img src={url} alt={name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
    }}>{name.charAt(0).toUpperCase()}</div>
  )
);

export default MessagePanel;
