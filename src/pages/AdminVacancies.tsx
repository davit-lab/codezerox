import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminVacancies = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vacancies = [], isLoading: vacanciesLoading } = useQuery({
    queryKey: ['admin-vacancies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*, profiles:user_id(email, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('vacancies').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] }),
  });

  const deleteVacancy = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('vacancy_messages').delete().eq('vacancy_id', id);
      const { error } = await supabase.from('vacancies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] });
      toast.success('ვაკანსია წაიშალა');
    },
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (isLoading) {
    return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;
  }

  if (!user || !isAdmin) { navigate("/"); return null; }

  const filtered = vacancies.filter((v: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return v.title?.toLowerCase().includes(q) || v.company_name?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout title="ვაკანსიები" titleIcon="work">

              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-muted)' }}>search</span>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="მოძებნე..." style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none' }} />
              </div>

              {vacanciesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>სათაური</th>
                        <th>კომპანია</th>
                        <th>ავტორი</th>
                        <th>სტატუსი</th>
                        <th>მოქმედებები</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((v: any) => (
                        <tr key={v.id}>
                          <td style={{ color: 'var(--text-white)', fontWeight: 500 }}>{v.title}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{v.company_name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{(v.profiles as any)?.email || '—'}</td>
                          <td>
                            <span className={`admin-badge ${v.is_active ? 'admin-badge-gold' : 'admin-badge-default'}`}>
                              {v.is_active ? 'აქტიური' : 'არააქტიური'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button className="btn btn-sm btn-ghost" onClick={() => toggleActive.mutate({ id: v.id, is_active: !v.is_active })} title={v.is_active ? 'გათიშვა' : 'გააქტიურება'}>
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{v.is_active ? 'visibility_off' : 'visibility'}</span>
                              </button>
                              {deleteConfirm === v.id ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--ruby)', color: 'white' }} onClick={() => { deleteVacancy.mutate(v.id); setDeleteConfirm(null); }}>დადასტურება</button>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(null)}>გაუქმება</button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(v.id)} style={{ color: 'var(--ruby)' }}>
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

export default AdminVacancies;
