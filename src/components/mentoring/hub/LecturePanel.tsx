import { useEffect, useRef, useState } from 'react';
import { HubChannel } from '@/hooks/useMentoringHub';
import {
  useLectures,
  useLiveSessions,
  useStartLiveSession,
  useEndLiveSession,
  useUpsertLecture,
  useDeleteLecture,
  useIncrementLectureView,
  useMyHubMembership,
} from '@/hooks/useMentoringHubExtras';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  channel: HubChannel;
  courseId: string;
}

type Source = 'screen' | 'camera' | 'screen+camera';

const formatDuration = (s: number | null) => {
  if (!s || s <= 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}სთ ${m % 60}წთ`;
  }
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const LecturePanel = ({ channel, courseId }: Props) => {
  const { user, isAdmin } = useAuth();
  const { data: membership } = useMyHubMembership(courseId);
  const { data: lectures = [] } = useLectures(courseId);
  const { data: live = [] } = useLiveSessions(courseId);
  const startLive = useStartLiveSession();
  const endLive = useEndLiveSession();
  const upsert = useUpsertLecture();
  const del = useDeleteLecture();
  const incView = useIncrementLectureView();

  const myTier = membership?.package_tier ?? 1;
  const role = membership?.role;
  const canHostLecture = isAdmin || role === 'mentor' || role === 'mentor_assistant'
    || (channel.can_send_min_tier ?? 1) <= myTier;
  const lectureChannelLectures = lectures.filter(l => !l.channel_id || l.channel_id === channel.id);
  const liveInChannel = live.find(s => s.channel_id === channel.id);

  // Recording refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const [isLive, setIsLive] = useState(false);
  const [activeLiveId, setActiveLiveId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<Source>('screen');

  useEffect(() => () => stopAndCleanup(false), []);

  // Live timer
  useEffect(() => {
    if (!isLive) return;
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(t);
  }, [isLive]);

  const stopAndCleanup = (saveRecording: boolean) => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (!saveRecording) chunksRef.current = [];
  };

  const handleStart = async () => {
    if (!title.trim()) { toast.error('ჩაწერე ლექციის სათაური'); return; }
    try {
      let stream: MediaStream;
      if (source === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else if (source === 'screen+camera') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        try {
          const cam = await navigator.mediaDevices.getUserMedia({ audio: true });
          cam.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch { /* ignore */ }
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          mic.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch { /* ignore */ }
      }
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => { await uploadRecording(); };
      rec.start(1000);
      recorderRef.current = rec;
      startedAtRef.current = Date.now();
      setElapsed(0);

      const id = await startLive.mutateAsync({ courseId, channelId: channel.id, title });
      setActiveLiveId(id);
      setIsLive(true);

      stream.getVideoTracks()[0].onended = () => handleStop();
    } catch (e: any) {
      toast.error(e?.message ?? 'ვერ დაიწყო ჩაწერა');
    }
  };

  const handleStop = async () => {
    setIsLive(false);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    } else {
      stopAndCleanup(false);
    }
    if (activeLiveId) {
      try { await endLive.mutateAsync({ id: activeLiveId }); } catch { /* ignore */ }
      setActiveLiveId(null);
    }
  };

  const uploadRecording = async () => {
    try {
      setUploading(true);
      const duration = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      chunksRef.current = [];
      const fileName = `${user!.id}/${courseId}/lectures/${Date.now()}-lecture.webm`;
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, blob, { contentType: 'video/webm', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(data.path);
      await upsert.mutateAsync({
        course_id: courseId,
        channel_id: channel.id,
        title,
        description: description || null,
        recording_url: pub.publicUrl,
        duration_seconds: duration,
        min_tier: channel.min_tier ?? 1,
      });
      setTitle('');
      setDescription('');
      stopAndCleanup(false);
      toast.success('ლექცია ჩაიწერა და აიტვირთა');
    } catch (e: any) {
      toast.error('ჩატვირთვა ვერ მოხერხდა: ' + (e?.message ?? ''));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--text-muted)' }}>cast</span>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{channel.name}</div>
        {liveInChannel && (
          <span style={{
            marginLeft: 'auto', padding: '2px 10px', background: '#dc2626', color: 'white',
            borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em',
          }}>● LIVE</span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Live host section */}
        {canHostLecture && (
          <div style={{
            marginBottom: '24px', padding: '20px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px',
          }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.95rem' }}>
              ლექციის ჩაწერა
            </div>
            {!isLive ? (
              <>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ლექციის სათაური *"
                  style={inputStyle}
                />
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="მოკლე აღწერა (არასავალდებულო)"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <SourceBtn active={source === 'screen'} onClick={() => setSource('screen')} icon="screen_share" label="ეკრანი" />
                  <SourceBtn active={source === 'camera'} onClick={() => setSource('camera')} icon="videocam" label="კამერა" />
                  <SourceBtn active={source === 'screen+camera'} onClick={() => setSource('screen+camera')} icon="present_to_all" label="ეკრანი + ხმა" />
                </div>
                <button
                  onClick={handleStart}
                  disabled={startLive.isPending}
                  style={{
                    padding: '10px 18px', background: 'var(--text-primary)', color: 'var(--bg-card)',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>fiber_manual_record</span>
                  ჩაწერის დაწყება
                </button>
                <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  ლექცია ავტომატურად ჩაიწერება და აიტვირთება ლექციების სიაში დასრულების შემდეგ.
                </div>
              </>
            ) : (
              <>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <video ref={localVideoRef} muted style={{
                    width: '100%', maxHeight: '380px', background: '#000',
                    borderRadius: '8px', display: 'block',
                  }} />
                  <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    padding: '4px 10px', background: 'rgba(220,38,38,0.95)', color: 'white',
                    borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    ჩაწერა · {formatDuration(elapsed)}
                  </div>
                </div>
                <button
                  onClick={handleStop}
                  disabled={uploading}
                  style={{
                    padding: '10px 18px', background: '#dc2626', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>stop_circle</span>
                  {uploading ? 'იტვირთება...' : 'დასრულება და ატვირთვა'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Live viewer banner (non-hosts) */}
        {liveInChannel && !isLive && (
          <div style={{
            marginBottom: '24px', padding: '16px 20px',
            background: 'var(--bg-card)', border: '1px solid #dc2626', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span className="material-symbols-rounded" style={{ color: '#dc2626', fontSize: '28px' }}>radio_button_checked</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {liveInChannel.title ?? 'ლექცია მიმდინარეობს'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                ჩანაწერი ხელმისაწვდომი იქნება დასრულების შემდეგ.
              </div>
            </div>
          </div>
        )}

        {/* Recorded lectures */}
        <div style={{
          fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600,
        }}>ჩაწერილი ლექციები — {lectureChannelLectures.length}</div>

        {lectureChannelLectures.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
            ჯერ არცერთი ლექცია არ არის ჩაწერილი
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lectureChannelLectures.map(l => {
            const canDel = isAdmin || l.created_by === user?.id;
            return (
              <div key={l.id} style={{
                padding: '16px', background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                      {l.title}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', color: 'var(--text-muted)', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                      <span>📅 {new Date(l.recorded_at).toLocaleString('ka-GE')}</span>
                      <span>⏱ {formatDuration(l.duration_seconds)}</span>
                      <span>👁 {l.views_count ?? 0} ნახვა</span>
                    </div>
                    {l.description && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                        {l.description}
                      </div>
                    )}
                  </div>
                  {canDel && (
                    <button
                      onClick={() => del.mutate({ id: l.id, courseId })}
                      style={{
                        background: 'transparent', border: '1px solid var(--border-subtle)',
                        borderRadius: '6px', padding: '4px 10px', color: 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '0.75rem',
                      }}
                    >წაშლა</button>
                  )}
                </div>
                {l.recording_url && (
                  <video
                    src={l.recording_url}
                    controls
                    onPlay={() => incView.mutate({ lectureId: l.id, courseId })}
                    style={{ width: '100%', marginTop: '12px', borderRadius: '8px', background: '#000', maxHeight: '480px' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SourceBtn = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 12px',
      background: active ? 'var(--text-primary)' : 'var(--bg-elevated)',
      color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)', borderRadius: '8px',
      cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: '6px',
    }}
  >
    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{icon}</span>
    {label}
  </button>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', marginBottom: '10px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
};

export default LecturePanel;
