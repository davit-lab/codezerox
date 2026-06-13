import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HubChallenge } from "@/hooks/useHubChallenges";

const DIFFICULTIES = [
  { value: 'easy', label: 'მარტივი', color: '#22c55e' },
  { value: 'medium', label: 'საშუალო', color: '#f59e0b' },
  { value: 'hard', label: 'რთული', color: '#ef4444' },
];

const STATUSES = [
  { value: 'active', label: 'აქტიური', color: '#22c55e' },
  { value: 'upcoming', label: 'მომავალი', color: '#3b82f6' },
  { value: 'completed', label: 'დასრულებული', color: '#6b7280' },
];

const CATEGORIES = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Design', 'Other'];

const AdminChallenges = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<HubChallenge | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    category: 'Frontend',
    points: 50,
    status: 'active' as 'active' | 'upcoming' | 'completed',
    deadline: '',
    tasks: [''] as string[],
  });

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['admin-hub-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_challenges' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as HubChallenge[];
    },
    enabled: isAdmin,
  });

  const createChallenge = useMutation({
    mutationFn: async (challenge: typeof formData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('hub_challenges' as any)
        .insert({
          title: challenge.title,
          description: challenge.description || null,
          difficulty: challenge.difficulty,
          category: challenge.category,
          points: challenge.points,
          status: challenge.status,
          deadline: challenge.deadline || null,
          tasks: challenge.tasks.filter(t => t.trim()),
          created_by: session.session.user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hub-challenges'] });
      toast.success('ჩელენჯი წარმატებით დაემატა!');
      resetForm();
      setShowForm(false);
    },
    onError: (err: any) => {
      toast.error(`ჩელენჯის დამატება ვერ მოხერხდა: ${err.message}`);
    },
  });

  const updateChallenge = useMutation({
    mutationFn: async ({ id, challenge }: { id: string; challenge: typeof formData }) => {
      const { data, error } = await supabase
        .from('hub_challenges' as any)
        .update({
          title: challenge.title,
          description: challenge.description || null,
          difficulty: challenge.difficulty,
          category: challenge.category,
          points: challenge.points,
          status: challenge.status,
          deadline: challenge.deadline || null,
          tasks: challenge.tasks.filter(t => t.trim()),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hub-challenges'] });
      toast.success('ჩელენჯი განახლებულია!');
      resetForm();
      setShowForm(false);
      setEditingChallenge(null);
    },
    onError: (err: any) => {
      toast.error(`განახლება ვერ მოხერხდა: ${err.message}`);
    },
  });

  const deleteChallenge = useMutation({
    mutationFn: async (id: string) => {
      // First delete related participants and submissions
      await supabase.from('hub_challenge_participants' as any).delete().eq('challenge_id', id);
      await supabase.from('challenge_submissions' as any).delete().eq('challenge_id', id);
      
      const { error } = await supabase.from('hub_challenges' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hub-challenges'] });
      toast.success('ჩელენჯი წაიშალა');
      setDeleteConfirm(null);
    },
    onError: (err: any) => {
      toast.error(`წაშლა ვერ მოხერხდა: ${err.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      category: 'Frontend',
      points: 50,
      status: 'active',
      deadline: '',
      tasks: [''],
    });
  };

  const handleEdit = (challenge: HubChallenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description || '',
      difficulty: challenge.difficulty,
      category: challenge.category,
      points: challenge.points,
      status: challenge.status,
      deadline: challenge.deadline ? new Date(challenge.deadline).toISOString().slice(0, 16) : '',
      tasks: challenge.tasks.length > 0 ? challenge.tasks : [''],
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('სათაური სავალდებულოა');
      return;
    }

    if (editingChallenge) {
      await updateChallenge.mutateAsync({ id: editingChallenge.id, challenge: formData });
    } else {
      await createChallenge.mutateAsync(formData);
    }
  };

  const addTask = () => {
    setFormData({ ...formData, tasks: [...formData.tasks, ''] });
  };

  const removeTask = (index: number) => {
    setFormData({ ...formData, tasks: formData.tasks.filter((_, i) => i !== index) });
  };

  const updateTask = (index: number, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData({ ...formData, tasks: newTasks });
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (authLoading) {
    return (
      <AdminLayout title="Hub ჩელენჯები" titleIcon="emoji_events">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) return null;

  const getDifficultyLabel = (diff: string) => DIFFICULTIES.find(d => d.value === diff)?.label || diff;
  const getDifficultyColor = (diff: string) => DIFFICULTIES.find(d => d.value === diff)?.color || '#888';
  const getStatusLabel = (status: string) => STATUSES.find(s => s.value === status)?.label || status;
  const getStatusColor = (status: string) => STATUSES.find(s => s.value === status)?.color || '#888';

  return (
    <AdminLayout
      title="Hub ჩელენჯები"
      titleIcon="emoji_events"
      actions={
        <button
          onClick={() => {
            setEditingChallenge(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn btn-gold"
        >
          <span className="material-symbols-rounded">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'დახურვა' : 'ჩელენჯის დამატება'}
        </button>
      }
    >
      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>
            {editingChallenge ? 'ჩელენჯის რედაქტირება' : 'ახალი ჩელენჯი'}
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>სათაური *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="მაგ: Landing Page Challenge"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>აღწერა</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="ჩელენჯის დეტალური აღწერა..."
                rows={3}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            {/* Row: Difficulty, Category, Points, Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>სირთულე</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem' }}
                >
                  {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>კატეგორია</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>XP ქულები</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  min={0}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>სტატუსი</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem' }}
                >
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>დედლაინი</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '0.95rem' }}
              />
            </div>

            {/* Tasks */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>ამოცანები</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.tasks.map((task, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder={`ამოცანა ${index + 1}`}
                      style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '0.9rem' }}
                    />
                    {formData.tasks.length > 1 && (
                      <button
                        onClick={() => removeTask(index)}
                        className="btn btn-ghost"
                        style={{ padding: '8px', color: 'var(--ruby)' }}
                      >
                        <span className="material-symbols-rounded">delete</span>
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addTask} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
                  <span className="material-symbols-rounded">add</span>
                  ამოცანის დამატება
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleSubmit}
                disabled={createChallenge.isPending || updateChallenge.isPending}
                className="btn btn-gold"
              >
                <span className="material-symbols-rounded">save</span>
                {createChallenge.isPending || updateChallenge.isPending ? 'ინახება...' : (editingChallenge ? 'განახლება' : 'შენახვა')}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingChallenge(null);
                  resetForm();
                }}
                className="btn btn-ghost"
              >
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenges List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>emoji_events</span>
          <p>ჩელენჯები ჯერ არ არის. დაამატე პირველი!</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>სათაური</th>
                <th>კატეგორია</th>
                <th>სირთულე</th>
                <th>XP</th>
                <th>სტატუსი</th>
                <th>დედლაინი</th>
                <th>მოქმედებები</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge.id}>
                  <td style={{ color: 'var(--text-white)', fontWeight: 500 }}>{challenge.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{challenge.category}</td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      background: `${getDifficultyColor(challenge.difficulty)}20`,
                      color: getDifficultyColor(challenge.difficulty),
                      fontWeight: 500
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>
                        {challenge.difficulty === 'easy' ? 'signal_cellular_alt_1_bar' : 
                         challenge.difficulty === 'medium' ? 'signal_cellular_alt_2_bar' : 'signal_cellular_alt'}
                      </span>
                      {getDifficultyLabel(challenge.difficulty)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{challenge.points} XP</td>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      background: `${getStatusColor(challenge.status)}20`,
                      color: getStatusColor(challenge.status),
                      fontWeight: 500
                    }}>
                      {getStatusLabel(challenge.status)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString('ka-GE') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(challenge)}
                        className="btn btn-sm btn-ghost"
                        title="რედაქტირება"
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      {deleteConfirm === challenge.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--ruby)', color: 'white' }}
                            onClick={() => deleteChallenge.mutate(challenge.id)}
                          >
                            დიახ
                          </button>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            არა
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(challenge.id)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--ruby)' }}
                          title="წაშლა"
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminChallenges;
