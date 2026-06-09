import { useState } from 'react';
import { HubChannel } from '@/hooks/useMentoringHub';
import {
  useAssignments,
  useUpsertAssignment,
  useDeleteAssignment,
  useMySubmission,
  useAllSubmissions,
  useSubmissionStats,
  useSubmitAssignment,
  useGradeSubmission,
  useMyHubMembership,
} from '@/hooks/useMentoringHubExtras';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SubmissionAttachment } from '@/hooks/useMentoringHubExtras';

interface Props {
  channel: HubChannel;
  courseId: string;
}

const AssignmentsPanel = ({ channel, courseId }: Props) => {
  const { user, isAdmin } = useAuth();
  const { data: membership } = useMyHubMembership(courseId);
  const { data: assignments = [] } = useAssignments(courseId);
  const upsert = useUpsertAssignment();
  const del = useDeleteAssignment();

  const isMentorRole = isAdmin || membership?.role === 'mentor' || membership?.role === 'mentor_assistant';
  const channelAssignments = assignments.filter(a => !a.channel_id || a.channel_id === channel.id);

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '', due_at: '', min_tier: 1 });
  const [openId, setOpenId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!draft.title.trim()) { toast.error('სათაური სავალდებულოა'); return; }
    try {
      await upsert.mutateAsync({
        course_id: courseId,
        channel_id: channel.id,
        title: draft.title,
        description: draft.description || undefined,
        due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
        min_tier: draft.min_tier,
      });
      setDraft({ title: '', description: '', due_at: '', min_tier: 1 });
      setCreating(false);
      toast.success('დავალება შეიქმნა');
    } catch (e: any) { toast.error(e?.message ?? 'შეცდომა'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--text-muted)' }}>assignment</span>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{channel.name}</div>
        {isMentorRole && (
          <button
            onClick={() => setCreating(true)}
            style={{
              marginLeft: 'auto', padding: '6px 12px',
              background: 'var(--text-primary)', color: 'var(--bg-card)',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>
            ახალი დავალება
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {creating && isMentorRole && (
          <div style={{
            marginBottom: '20px', padding: '20px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px',
          }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px' }}>ახალი დავალება</div>
            <Input value={draft.title} onChange={v => setDraft({ ...draft, title: v })} placeholder="სათაური" />
            <Textarea value={draft.description} onChange={v => setDraft({ ...draft, description: v })} placeholder="აღწერა" />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="datetime-local"
                value={draft.due_at}
                onChange={e => setDraft({ ...draft, due_at: e.target.value })}
                style={inputStyle}
              />
              <select
                value={draft.min_tier}
                onChange={e => setDraft({ ...draft, min_tier: Number(e.target.value) })}
                style={inputStyle}
              >
                <option value={1}>პაკეტი 1+</option>
                <option value={2}>პაკეტი 2+</option>
                <option value={3}>პაკეტი 3</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCreate} style={primaryBtn}>შენახვა</button>
              <button onClick={() => setCreating(false)} style={secondaryBtn}>გაუქმება</button>
            </div>
          </div>
        )}

        {channelAssignments.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            ჯერ დავალებები არ არის
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {channelAssignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              courseId={courseId}
              isMentorRole={!!isMentorRole}
              expanded={openId === a.id}
              onToggle={() => setOpenId(openId === a.id ? null : a.id)}
              onDelete={() => del.mutate({ id: a.id, courseId })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment, courseId, isMentorRole, expanded, onToggle, onDelete }: {
  assignment: any; courseId: string; isMentorRole: boolean; expanded: boolean; onToggle: () => void; onDelete: () => void;
}) => {
  const { user, isAdmin } = useAuth();
  const { data: mySub } = useMySubmission(assignment.id);
  const { data: stats } = useSubmissionStats(assignment.id);
  const { data: allSubs = [] } = useAllSubmissions(isMentorRole && expanded ? assignment.id : undefined, courseId);
  const submit = useSubmitAssignment();
  const grade = useGradeSubmission();

  const initialAttachments: SubmissionAttachment[] = (() => {
    if (Array.isArray(mySub?.attachments) && mySub!.attachments.length) return mySub!.attachments as any;
    if (mySub?.attachment_url) return [{ url: mySub.attachment_url, name: 'ფაილი', type: '' }];
    return [];
  })();
  const [content, setContent] = useState(mySub?.content ?? '');
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<SubmissionAttachment[]>(initialAttachments);
  const overdue = assignment.due_at && new Date(assignment.due_at) < new Date();

  const onUpload = async (files: FileList | null) => {
    if (!user || !files || !files.length) return;
    try {
      setUploading(true);
      const uploaded: SubmissionAttachment[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name}: 50MB-ზე მეტია`); continue; }
        const path = `${user.id}/${courseId}/assignments/${assignment.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
        const { data, error } = await supabase.storage.from('chat-attachments').upload(path, file, { upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(data.path);
        uploaded.push({ url: pub.publicUrl, name: file.name, type: file.type || '', size: file.size });
      }
      setAttachments(prev => [...prev, ...uploaded]);
      if (uploaded.length) toast.success(`${uploaded.length} ფაილი ატვირთულია`);
    } catch (e: any) { toast.error(e?.message ?? 'შეცდომა'); }
    finally { setUploading(false); }
  };

  const removeAttachment = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = async () => {
    if (!content.trim() && attachments.length === 0) { toast.error('დაწერე ან ატვირთე რამე'); return; }
    try {
      await submit.mutateAsync({
        assignmentId: assignment.id,
        courseId,
        content: content || undefined,
        attachments,
      });
      toast.success('გადაგზავნილია');
    } catch (e: any) { toast.error(e?.message ?? 'შეცდომა'); }
  };

  return (
    <div style={{
      padding: '16px', background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)', borderRadius: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
            {assignment.title}
            {assignment.min_tier > 1 && (
              <span style={{
                marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px',
                background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderRadius: '4px',
              }}>პაკეტი {assignment.min_tier}+</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: overdue ? '#dc2626' : 'var(--text-muted)' }}>
            {assignment.due_at && (
              <span>ვადა: {new Date(assignment.due_at).toLocaleString('ka-GE')}</span>
            )}
            {stats && <span>გადაგზავნილია: {stats.submitted} / {stats.total}</span>}
            {mySub && !isMentorRole && (
              <span style={{ color: mySub.reviewed_at ? '#22c55e' : 'var(--text-muted)' }}>
                {mySub.reviewed_at ? `შეფასდა: ${mySub.grade ?? '-'}` : 'გადაგზავნილია'}
              </span>
            )}
          </div>
        </div>
        {(isAdmin || (isMentorRole && assignment.created_by === user?.id)) && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              background: 'transparent', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', padding: '4px 10px', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.75rem',
            }}
          >წაშლა</button>
        )}
        <span className="material-symbols-rounded" style={{ color: 'var(--text-muted)' }}>
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
          {assignment.description && (
            <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '14px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {assignment.description}
            </div>
          )}

          {/* Student view: own submission only */}
          {!isMentorRole && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 600 }}>
                შენი ნამუშევარი
              </div>
              {mySub?.reviewed_at && (
                <div style={{
                  padding: '10px 12px', marginBottom: '10px',
                  background: 'var(--bg-elevated)', borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem' }}>
                    შეფასება: {mySub.grade ?? '—'}
                  </div>
                  {mySub.feedback && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                      {mySub.feedback}
                    </div>
                  )}
                </div>
              )}
              <Textarea value={content} onChange={setContent} placeholder="ჩაწერე ან აღწერე ნამუშევარი..." />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <label style={{ ...secondaryBtn, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>upload_file</span>
                  ფაილების ატვირთვა
                  <input
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => onUpload(e.target.files)}
                  />
                </label>
                {uploading && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>იტვირთება...</span>}
              </div>
              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {attachments.map((a, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 10px', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.83rem',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>description</span>
                      <a href={a.url} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.name}
                      </a>
                      {!mySub?.reviewed_at && (
                        <button onClick={() => removeAttachment(i)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={onSubmit}
                disabled={submit.isPending || !!mySub?.reviewed_at}
                style={{ ...primaryBtn, opacity: mySub?.reviewed_at ? 0.5 : 1 }}
              >
                {mySub ? 'განახლება' : 'გადაგზავნა'}
              </button>
              {mySub?.reviewed_at && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                  ნამუშევარი უკვე შეფასდა — ვეღარ ცვლი.
                </div>
              )}
            </div>
          )}

          {/* Mentor view: all submissions */}
          {isMentorRole && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 600 }}>
                გადაგზავნილი ნამუშევრები — {allSubs.length}
              </div>
              {allSubs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', padding: '12px 0' }}>ჯერ არცერთი არ არის გადაგზავნილი</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allSubs.map((s: any) => (
                  <SubmissionRow key={s.id} sub={s} assignmentId={assignment.id} onGrade={grade.mutate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SubmissionRow = ({ sub, assignmentId, onGrade }: {
  sub: any; assignmentId: string; onGrade: (v: { id: string; assignmentId: string; grade: number | null; feedback: string | null }) => void;
}) => {
  const [g, setG] = useState<string>(sub.grade?.toString() ?? '');
  const [f, setF] = useState(sub.feedback ?? '');

  return (
    <div style={{
      padding: '12px', background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)', borderRadius: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        {sub.profile?.avatar_url ? (
          <img src={sub.profile.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)',
          }}>{(sub.profile?.full_name ?? 'U').charAt(0).toUpperCase()}</div>
        )}
        <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600 }}>
          {sub.profile?.full_name ?? 'მომხმარებელი'}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          {new Date(sub.submitted_at).toLocaleString('ka-GE')}
        </div>
      </div>
      {sub.content && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
          {sub.content}
        </div>
      )}
      {Array.isArray(sub.attachments) && sub.attachments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
          {sub.attachments.map((a: any, i: number) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', fontSize: '0.83rem' }}>
              📎 {a.name ?? 'ფაილი'}
            </a>
          ))}
        </div>
      ) : sub.attachment_url && (
        <a href={sub.attachment_url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '8px' }}>
          📎 მიმაგრებული ფაილი
        </a>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
        <input
          type="number"
          placeholder="შეფასება"
          value={g}
          onChange={e => setG(e.target.value)}
          style={{ ...inputStyle, width: '90px', marginBottom: 0 }}
        />
        <input
          placeholder="უკუკავშირი"
          value={f}
          onChange={e => setF(e.target.value)}
          style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
        />
        <button
          onClick={() => onGrade({ id: sub.id, assignmentId, grade: g ? Number(g) : null, feedback: f || null })}
          style={primaryBtn}
        >შეფასება</button>
      </div>
      {sub.reviewed_at && (
        <div style={{ color: '#22c55e', fontSize: '0.75rem', marginTop: '6px' }}>
          შეფასდა: {new Date(sub.reviewed_at).toLocaleString('ka-GE')}
        </div>
      )}
    </div>
  );
};

const Input = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
);
const Textarea = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', marginBottom: '12px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
};
const primaryBtn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--text-primary)', color: 'var(--bg-card)',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};
const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px', background: 'transparent', color: 'var(--text-primary)',
  border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};

export default AssignmentsPanel;
