import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminReviews = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'books' | 'freelancers'>('books');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: bookReviews = [], isLoading: bookLoading } = useQuery({
    queryKey: ['admin-book-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_reviews')
        .select('*, books:book_id(title), profiles:user_id(email, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: freelancerReviews = [], isLoading: freelancerLoading } = useQuery({
    queryKey: ['admin-freelancer-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freelancer_reviews')
        .select('*, freelancer_profiles:profile_id(title, user_id), profiles:user_id(email, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const deleteBookReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('book_reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-book-reviews'] });
      toast.success('რევიუ წაიშალა');
    },
  });

  const deleteFreelancerReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('freelancer_reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-freelancer-reviews'] });
      toast.success('რევიუ წაიშალა');
    },
  });

  if (isLoading) return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <AdminLayout title="რევიუები" titleIcon="reviews">

              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button className={`btn btn-sm ${tab === 'books' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setTab('books')}>
                  წიგნების ({bookReviews.length})
                </button>
                <button className={`btn btn-sm ${tab === 'freelancers' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setTab('freelancers')}>
                  ფრილანსერების ({freelancerReviews.length})
                </button>
              </div>

              {tab === 'books' && (
                bookLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr><th>წიგნი</th><th>ავტორი</th><th>რეიტინგი</th><th>ტექსტი</th><th>მოქმედებები</th></tr>
                      </thead>
                      <tbody>
                        {bookReviews.map((r: any) => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--text-white)', fontWeight: 500 }}>{(r.books as any)?.title || '—'}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{(r.profiles as any)?.full_name || (r.profiles as any)?.email || '—'}</td>
                            <td style={{ color: 'var(--gold)' }}>{renderStars(r.rating)}</td>
                            <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.review_text || '—'}</td>
                            <td>
                              {deleteConfirm === r.id ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--ruby)', color: 'white' }} onClick={() => { deleteBookReview.mutate(r.id); setDeleteConfirm(null); }}>დადასტურება</button>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(null)}>გაუქმება</button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(r.id)} style={{ color: 'var(--ruby)' }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {tab === 'freelancers' && (
                freelancerLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr><th>ფრილანსერი</th><th>რეცენზენტი</th><th>რეიტინგი</th><th>ტექსტი</th><th>მოქმედებები</th></tr>
                      </thead>
                      <tbody>
                        {freelancerReviews.map((r: any) => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--text-white)', fontWeight: 500 }}>{(r.freelancer_profiles as any)?.title || '—'}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{(r.profiles as any)?.full_name || (r.profiles as any)?.email || '—'}</td>
                            <td style={{ color: 'var(--gold)' }}>{renderStars(r.rating)}</td>
                            <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.review_text || '—'}</td>
                            <td>
                              {deleteConfirm === r.id ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-sm" style={{ background: 'var(--ruby)', color: 'white' }} onClick={() => { deleteFreelancerReview.mutate(r.id); setDeleteConfirm(null); }}>დადასტურება</button>
                                  <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(null)}>გაუქმება</button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-ghost" onClick={() => setDeleteConfirm(r.id)} style={{ color: 'var(--ruby)' }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
    </AdminLayout>
  );
};

export default AdminReviews;
