import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUsers, useUpdateUserRole, useDeleteUser, useAssignCourseMentor } from "@/hooks/useUsers";
import { useBooks } from "@/hooks/useBooks";
import { useAllMentoringCourses } from "@/hooks/useMentoring";
import { useAdminGiveCredits, useAdminDeductCredits, useAdminGiveBookAccess, useAdminRemoveBookAccess, useAdminGetUserCredits, useAdminGetUserPurchases } from "@/hooks/useAdminActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppRole = Database['public']['Enums']['app_role'];

interface UserModalData {
  userId: string;
  email: string;
  fullName: string | null;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: books = [] } = useBooks();
  const { data: mentoringCourses = [] } = useAllMentoringCourses();

  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const assignCourseMentor = useAssignCourseMentor();
  const giveCredits = useAdminGiveCredits();
  const deductCredits = useAdminDeductCredits();
  const giveBookAccess = useAdminGiveBookAccess();
  const removeBookAccess = useAdminRemoveBookAccess();
  const getUserCredits = useAdminGetUserCredits();
  const getUserPurchases = useAdminGetUserPurchases();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<UserModalData | null>(null);
  const [modalType, setModalType] = useState<'credits' | 'books' | 'password' | 'mentoring' | null>(null);
  const [creditsAmount, setCreditsAmount] = useState(50);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [userCredits, setUserCredits] = useState(0);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    if (selectedUser && modalType === 'credits') {
      getUserCredits.mutateAsync(selectedUser.userId).then(setUserCredits);
    }
    if (selectedUser && modalType === 'books') {
      getUserPurchases.mutateAsync(selectedUser.userId).then(setUserPurchases);
    }
  }, [selectedUser, modalType]);

  if (authLoading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success(`როლი შეცვლილია: ${newRole}`);
    } catch (error) {
      toast.error("შეცდომა როლის შეცვლისას");
    }
  };

  const openCreditsModal = (u: typeof users[0]) => {
    setSelectedUser({ userId: u.user_id, email: u.email, fullName: u.full_name });
    setModalType('credits');
    setCreditsAmount(50);
  };

  const openBooksModal = (u: typeof users[0]) => {
    setSelectedUser({ userId: u.user_id, email: u.email, fullName: u.full_name });
    setModalType('books');
    setSelectedBookId('');
  };

  const openPasswordModal = (u: typeof users[0]) => {
    setSelectedUser({ userId: u.user_id, email: u.email, fullName: u.full_name });
    setModalType('password');
    setResetPassword('');
  };

  const openMentoringModal = (u: typeof users[0]) => {
    setSelectedUser({ userId: u.user_id, email: u.email, fullName: u.full_name });
    setModalType('mentoring');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setUserCredits(0);
    setUserPurchases([]);
    setResetPassword('');
  };

  const handleAdminResetPassword = async () => {
    if (!selectedUser || !resetPassword || resetPassword.length < 6) {
      toast.error("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო");
      return;
    }
    setResetPasswordLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-reset-password", {
        body: { userId: selectedUser.userId, newPassword: resetPassword },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("პაროლი წარმატებით შეიცვალა!");
      setResetPassword('');
      closeModal();
    } catch (err: any) {
      toast.error(err.message || "პაროლის შეცვლა ვერ მოხერხდა");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleGiveCredits = async () => {
    if (!selectedUser || creditsAmount <= 0) return;
    try {
      await giveCredits.mutateAsync({ userId: selectedUser.userId, credits: creditsAmount });
      toast.success(`${creditsAmount} კრედიტი დაემატა!`);
      setUserCredits(prev => prev + creditsAmount);
      setCreditsAmount(50);
    } catch (error) {
      toast.error("შეცდომა კრედიტების დამატებისას");
    }
  };

  const handleDeductCredits = async () => {
    if (!selectedUser || creditsAmount <= 0) return;
    try {
      const result = await deductCredits.mutateAsync({ userId: selectedUser.userId, credits: creditsAmount });
      toast.success(`${creditsAmount} კრედიტი ამოიკლო!`);
      setUserCredits(result.newCredits);
      setCreditsAmount(50);
    } catch (error) {
      toast.error("შეცდომა კრედიტების ამოკლებისას");
    }
  };

  const handleRemoveBookAccess = async (purchaseId: string, bookTitle: string) => {
    try {
      await removeBookAccess.mutateAsync(purchaseId);
      toast.success(`წიგნზე წვდომა გათიშულია: ${bookTitle}`);
      setUserPurchases(prev => prev.filter(p => p.id !== purchaseId));
    } catch (error) {
      toast.error("შეცდომა წვდომის გათიშვისას");
    }
  };


  const handleGiveBookAccess = async () => {
    if (!selectedUser || !selectedBookId) return;
    try {
      await giveBookAccess.mutateAsync({ userId: selectedUser.userId, bookId: selectedBookId });
      toast.success("წიგნზე წვდომა მიენიჭა!");
      getUserPurchases.mutateAsync(selectedUser.userId).then(setUserPurchases);
      setSelectedBookId('');
    } catch (error: any) {
      if (error.message?.includes('already has access')) {
        toast.error("მომხმარებელს უკვე აქვს ამ წიგნზე წვდომა");
      } else {
        toast.error("შეცდომა წვდომის მინიჭებისას");
      }
    }
  };

  const availableBooks = books.filter(b => !userPurchases.some(p => p.book?.id === b.id));

  return (
    <AdminLayout title="მომხმარებლები" titleIcon="group">

              {/* Search */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-muted)' }}>search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="მოძებნე ემაილით ან სახელით..."
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      color: 'var(--text-white)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
                    </button>
                  )}
                </div>
              </div>

              {usersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
                </div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>group_off</span>
                  <p>მომხმარებლები არ არიან</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>მომხმარებელი</th>
                        <th>ელ-ფოსტა</th>
                        <th>დარეგისტრირდა</th>
                        <th>როლი</th>
                        <th>მოქმედებები</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
                        })
                        .map((u) => (
                        <tr key={u.user_id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: 'var(--gold-glow)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}>
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span className="material-symbols-rounded" style={{ color: 'var(--gold)', fontSize: '20px' }}>person</span>
                                )}
                              </div>
                              <span style={{ color: 'var(--text-white)', fontWeight: '500' }}>
                                {u.full_name || 'უსახელო'}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {new Date(u.created_at).toLocaleDateString('ka-GE')}
                          </td>
                          <td>
                            {(() => {
                              const roleStyles: Record<string, { bg: string; color: string; label: string; icon: string }> = {
                                admin:  { bg: 'rgba(212,175,55,0.12)',  color: 'var(--gold)',     label: 'ადმინი',         icon: 'admin_panel_settings' },
                                mentor: { bg: 'rgba(99,102,241,0.14)',  color: '#818cf8',         label: 'მენტორი',        icon: 'psychology' },
                                child:  { bg: 'rgba(236,72,153,0.12)',  color: '#f472b6',         label: 'ბავშვი',         icon: 'child_care' },
                                user:   { bg: 'rgba(148,163,184,0.12)', color: 'var(--text-muted)', label: 'მომხმარებელი',  icon: 'person' },
                              };
                              const r = roleStyles[u.role] ?? roleStyles.user;
                              return (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                                  background: r.bg, color: r.color,
                                  border: `1px solid ${r.color}33`,
                                }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{r.icon}</span>
                                  {r.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                className="btn btn-sm btn-ghost"
                                onClick={() => openCreditsModal(u)}
                                title="კრედიტების მართვა"
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>toll</span>
                              </button>
                              <button 
                                className="btn btn-sm btn-ghost"
                                onClick={() => openBooksModal(u)}
                                title="წიგნებზე წვდომა"
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>menu_book</span>
                              </button>
                              <button 
                                className="btn btn-sm btn-ghost"
                                onClick={() => openMentoringModal(u)}
                                title="სამენტოროს მართვა"
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px', color: u.role === 'mentor' ? '#818cf8' : undefined }}>psychology</span>
                              </button>
                              <button 
                                className="btn btn-sm btn-ghost"
                                onClick={() => openPasswordModal(u)}
                                title="პაროლის შეცვლა"
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>key</span>
                              </button>
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.user_id, e.target.value as AppRole)}
                                disabled={updateRole.isPending || u.user_id === user.id}
                                className="admin-select"
                                style={{ minWidth: '130px' }}
                              >
                                <option value="user">მომხმარებელი</option>
                                <option value="mentor">მენტორი</option>
                                <option value="admin">ადმინი</option>
                              </select>
                              {u.user_id !== user.id && (
                                deleteConfirm === u.user_id ? (
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      className="btn btn-sm"
                                      style={{ background: 'var(--ruby)', color: 'white' }}
                                      onClick={async () => {
                                        try {
                                          await deleteUser.mutateAsync(u.user_id);
                                          toast.success('მომხმარებელი წაიშალა');
                                          setDeleteConfirm(null);
                                        } catch (e) {
                                          toast.error('შეცდომა წაშლისას');
                                        }
                                      }}
                                      disabled={deleteUser.isPending}
                                    >
                                      {deleteUser.isPending ? (
                                        <span className="material-symbols-rounded spinning" style={{ fontSize: '16px' }}>progress_activity</span>
                                      ) : 'დადასტურება'}
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => setDeleteConfirm(null)}
                                    >
                                      გაუქმება
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setDeleteConfirm(u.user_id)}
                                    title="წაშლა"
                                    style={{ color: 'var(--ruby)' }}
                                  >
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

      {/* Credits Modal */}
      <Dialog open={modalType === 'credits'} onOpenChange={() => closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--gold)' }}>toll</span>
              AI კრედიტები
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: '16px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedUser?.fullName || selectedUser?.email}
            </p>
            
            <div style={{ 
              background: 'var(--bg-surface)', 
              padding: '20px', 
              borderRadius: 'var(--radius-lg)', 
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>მიმდინარე ბალანსი</span>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--gold)' }}>
                {userCredits} კრედიტი
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                type="number"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(Number(e.target.value))}
                min={1}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button 
                className="btn btn-gold"
                onClick={handleGiveCredits}
                disabled={giveCredits.isPending || creditsAmount <= 0}
              >
                {giveCredits.isPending ? (
                  <span className="material-symbols-rounded spinning">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-rounded">add</span>
                    დამატება
                  </>
                )}
              </button>
              <button 
                className="btn btn-sm"
                style={{ background: 'var(--ruby)', color: 'white' }}
                onClick={handleDeductCredits}
                disabled={deductCredits.isPending || creditsAmount <= 0}
              >
                {deductCredits.isPending ? (
                  <span className="material-symbols-rounded spinning">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-rounded">remove</span>
                    ამოკლება
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {[10, 50, 100, 500].map(amount => (
                <button 
                  key={amount}
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCreditsAmount(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Books Modal */}
      <Dialog open={modalType === 'books'} onOpenChange={() => closeModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--gold)' }}>menu_book</span>
              წიგნებზე წვდომა
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: '16px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              {selectedUser?.fullName || selectedUser?.email}
            </p>

            {/* Add book access */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                წიგნის დამატება
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="admin-select"
                  style={{ flex: 1 }}
                >
                  <option value="">აირჩიე წიგნი...</option>
                  {availableBooks.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
                <button 
                  className="btn btn-gold"
                  onClick={handleGiveBookAccess}
                  disabled={giveBookAccess.isPending || !selectedBookId}
                >
                  {giveBookAccess.isPending ? (
                    <span className="material-symbols-rounded spinning">progress_activity</span>
                  ) : (
                    <span className="material-symbols-rounded">add</span>
                  )}
                </button>
              </div>
            </div>

            {/* Current books */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                მიმდინარე წვდომები ({userPurchases.length})
              </label>
              {userPurchases.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  წვდომა არ აქვს არცერთ წიგნზე
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {userPurchases.map(purchase => (
                    <div key={purchase.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '50px', 
                        background: 'var(--gold-glow)', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        {purchase.book?.cover_url && (
                          <img src={purchase.book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-white)', fontWeight: '500' }}>{purchase.book?.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(purchase.purchased_at).toLocaleDateString('ka-GE')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBookAccess(purchase.id, purchase.book?.title || '')}
                        title="წვდომის გათიშვა"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <span className="material-symbols-rounded" style={{ color: 'var(--ruby)', fontSize: '20px' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={modalType === 'password' && !!selectedUser} onOpenChange={closeModal}>
        <DialogContent style={{ maxWidth: '400px' }}>
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--gold)' }}>key</span>
              პაროლის შეცვლა
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: '16px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedUser?.fullName || selectedUser?.email}
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                ახალი პაროლი
              </label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="მინიმუმ 6 სიმბოლო"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <button 
              className="btn btn-gold"
              style={{ width: '100%' }}
              onClick={handleAdminResetPassword}
              disabled={resetPasswordLoading || resetPassword.length < 6}
            >
              {resetPasswordLoading ? (
                <span className="material-symbols-rounded spinning">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-rounded">check</span>
                  პაროლის შეცვლა
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mentoring Assignment Modal */}
      <Dialog open={modalType === 'mentoring' && !!selectedUser} onOpenChange={closeModal}>
        <DialogContent style={{ maxWidth: '520px' }}>
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: '#818cf8' }}>psychology</span>
              სამენტოროს მართვა
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: '8px 0 16px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {selectedUser?.fullName || selectedUser?.email}
            </p>

            {(() => {
              const currentUser = users.find(u => u.user_id === selectedUser?.userId);
              const isCurrentlyMentor = currentUser?.role === 'mentor';
              const assignedCourses = mentoringCourses.filter(c => (c as any).mentor_user_id === selectedUser?.userId);
              const unassignedCourses = mentoringCourses.filter(c => (c as any).mentor_user_id !== selectedUser?.userId);

              return (
                <>
                  {/* Role toggle */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    marginBottom: '20px',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: '0.95rem' }}>მენტორის როლი</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isCurrentlyMentor ? 'აქვს სამენტორო ადმინის წვდომა' : 'არ აქვს მენტორის წვდომა'}
                      </div>
                    </div>
                    <button
                      className={isCurrentlyMentor ? 'btn btn-sm btn-ghost' : 'btn btn-sm btn-gold'}
                      disabled={updateRole.isPending || selectedUser?.userId === user?.id}
                      onClick={async () => {
                        if (!selectedUser) return;
                        try {
                          await updateRole.mutateAsync({
                            userId: selectedUser.userId,
                            role: isCurrentlyMentor ? 'user' : 'mentor',
                          });
                          toast.success(isCurrentlyMentor ? 'მენტორის როლი მოხსნილია' : 'მენტორის როლი მინიჭებულია');
                        } catch {
                          toast.error('შეცდომა როლის შეცვლისას');
                        }
                      }}
                    >
                      {isCurrentlyMentor ? 'მოხსნა' : 'მინიჭება'}
                    </button>
                  </div>

                  {/* Assigned courses */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{
                      fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                    }}>მინიჭებული კურსები ({assignedCourses.length})</div>
                    {assignedCourses.length === 0 ? (
                      <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                        ჯერ არცერთი კურსი არ აქვს მინიჭებული
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {assignedCourses.map(c => (
                          <div key={c.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                            padding: '10px 12px',
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            borderRadius: '8px',
                          }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: 'var(--text-white)', fontSize: '0.9rem', fontWeight: 500 }}>{c.title}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.language}</div>
                            </div>
                            <button
                              className="btn btn-sm btn-ghost"
                              title="გათიშვა"
                              onClick={async () => {
                                try {
                                  await assignCourseMentor.mutateAsync({ courseId: c.id, mentorUserId: null });
                                  toast.success('კურსიდან გათიშულია');
                                } catch (e: any) {
                                  toast.error(e?.message ?? 'შეცდომა');
                                }
                              }}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--ruby)' }}>link_off</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assign new course */}
                  <div>
                    <div style={{
                      fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                    }}>კურსზე ჩართვა</div>
                    {unassignedCourses.length === 0 ? (
                      <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        თავისუფალი კურსი არ არის
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                        {unassignedCourses.map(c => {
                          const occupiedBy = (c as any).mentor_user_id;
                          return (
                            <div key={c.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                              padding: '10px 12px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                            }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: 'var(--text-white)', fontSize: '0.9rem', fontWeight: 500 }}>{c.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                  {c.language}{occupiedBy ? ' · დაკავებული' : ' · თავისუფალი'}
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-gold"
                                onClick={async () => {
                                  if (!selectedUser) return;
                                  if (occupiedBy && !confirm('კურსს უკვე ჰყავს მენტორი. შეცვალო?')) return;
                                  try {
                                    if (!isCurrentlyMentor) {
                                      await updateRole.mutateAsync({ userId: selectedUser.userId, role: 'mentor' });
                                    }
                                    await assignCourseMentor.mutateAsync({ courseId: c.id, mentorUserId: selectedUser.userId });
                                    toast.success('მინიჭებულია');
                                  } catch (e: any) {
                                    toast.error(e?.message ?? 'შეცდომა');
                                  }
                                }}
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add_link</span>
                                ჩართვა
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
