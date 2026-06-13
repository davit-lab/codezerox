import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminFreelancers = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: freelancers = [], isLoading: loading } = useQuery({
    queryKey: ['admin-freelancers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*, profiles:user_id(email, full_name, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const deleteFreelancer = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('freelancer_reviews').delete().eq('profile_id', id);
      await supabase.from('freelancer_projects').delete().eq('profile_id', id);
      await supabase.from('freelancer_skills').delete().eq('profile_id', id);
      const { error } = await supabase.from('freelancer_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-freelancers'] });
      toast.success('ფრილანსერის პროფილი წაიშალა');
    },
  });

  if (isLoading) return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  const filtered = freelancers.filter((f: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.title?.toLowerCase().includes(q) || (f.profiles as any)?.email?.toLowerCase().includes(q) || (f.profiles as any)?.full_name?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout title="ფრილანსერები" titleIcon="engineering">

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
                        <th>ფრილანსერი</th>
                        <th>სპეციალობა</th>
                        <th>ტარიფი</th>
                        <th>სტატუსი</th>
                        <th>მოქმედებები</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((f: any) => (
                        <tr key={f.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {(f.profiles as any)?.avatar_url ? (
                                  <img src={(f.profiles as any).avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span className="material-symbols-rounded" style={{ color: 'var(--gold)', fontSize: '20px' }}>person</span>
                                )}
                              </div>
                              <div>
                                <div style={{ color: 'var(--text-white)', fontWeight: 500 }}>{(f.profiles as any)?.full_name || 'უსახელო'}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{(f.profiles as any)?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{f.title || '—'}</td>
                          <td style={{ color: 'var(--gold)' }}>{f.hourly_rate ? `$${f.hourly_rate}/სთ` : '—'}</td>
                          <td>
                            <span className={`admin-badge ${f.availability === 'available' ? 'admin-badge-gold' : 'admin-badge-default'}`}>
                              {f.availability === 'available' ? 'ხელმისაწვდომი' : f.availability === 'busy' ? 'დაკავებული' : 'მიუწვდომელი'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <Link to={`/freelancer/${f.id}`} className="btn btn-sm btn-ghost"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>open_in_new</span></Link>
                              {deleteConfirm === f.id ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--ruby)', color: 'white' }} onClick={() => { deleteFreelancer.mutate(f.id); setDeleteConfirm(null); }}>დადასტურება</button>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(null)}>გაუქმება</button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(f.id)} style={{ color: 'var(--ruby)' }}>
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

export default AdminFreelancers;
