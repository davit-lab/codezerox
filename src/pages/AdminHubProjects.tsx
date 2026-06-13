import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminHubProjects = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['admin-hub-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_projects')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('hub_project_comments').delete().eq('project_id', id);
      await supabase.from('hub_project_likes').delete().eq('project_id', id);
      const { error } = await supabase.from('hub_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hub-projects'] });
      toast.success('პროექტი წაიშალა');
    },
  });

  if (isLoading) return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  const filtered = projects.filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title?.toLowerCase().includes(q) || (p.profiles as any)?.full_name?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout title="Hub პროექტები" titleIcon="hub">

              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-muted)' }}>search</span>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="მოძებნე..." style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none' }} />
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>პროექტი</th>
                        <th>ავტორი</th>
                        <th>ნახვები</th>
                        <th>თარიღი</th>
                        <th>მოქმედებები</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p: any) => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-white)', fontWeight: 500 }}>{p.title}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{(p.profiles as any)?.full_name || '—'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{p.views}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(p.created_at).toLocaleDateString('ka-GE')}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>open_in_new</span></a>}
                              {deleteConfirm === p.id ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--ruby)', color: 'white' }} onClick={() => { deleteProject.mutate(p.id); setDeleteConfirm(null); }}>დადასტურება</button>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(null)}>გაუქმება</button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(p.id)} style={{ color: 'var(--ruby)' }}>
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

export default AdminHubProjects;
