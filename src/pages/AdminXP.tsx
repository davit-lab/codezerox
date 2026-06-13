import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard, getLevelTitle } from "@/hooks/useXP";
import { useUsers } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const AdminXP = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const { data: leaders = [], isLoading: leadersLoading } = useLeaderboard(100);
  const { data: users = [] } = useUsers();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState("admin_award");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  if (isLoading) return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const handleAwardXP = async () => {
    if (!selectedUser || amount <= 0) {
      toast.error("აირჩიე მომხმარებელი და შეიყვანე XP რაოდენობა");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("admin_award_xp", {
        _user_id: selectedUser,
        _amount: amount,
        _reason: reason,
      });
      if (error) throw error;
      toast.success(`${amount} XP წარმატებით დაემატა!`);
      setSelectedUser("");
      setAmount(50);
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    } catch (err: any) {
      toast.error(err.message || "შეცდომა");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.full_name || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s);
  });

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '24px',
  };

  return (
    <AdminLayout title="XP მართვა" titleIcon="leaderboard">

              {/* Award XP Card */}
              <div style={{ ...cardStyle, marginBottom: 24 }}>
                <h3 style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8, color: 'var(--gold)' }}>add_circle</span>
                  XP-ის მინიჭება
                </h3>

                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {/* User Search & Select */}
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>მომხმარებელი</label>
                    <input
                      type="text"
                      placeholder="ძებნა სახელით ან ემეილით..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)', borderRadius: '10px',
                        color: 'var(--text-white)', fontSize: '0.9rem', marginBottom: 8,
                      }}
                    />
                    <select
                      value={selectedUser}
                      onChange={e => setSelectedUser(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)', borderRadius: '10px',
                        color: 'var(--text-white)', fontSize: '0.9rem',
                      }}
                    >
                      <option value="">-- აირჩიე --</option>
                      {filteredUsers.map(u => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.full_name || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>XP რაოდენობა</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      min={1}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)', borderRadius: '10px',
                        color: 'var(--text-white)', fontSize: '0.9rem',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {[10, 25, 50, 100, 200, 500].map(v => (
                        <button
                          key={v}
                          onClick={() => setAmount(v)}
                          style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                            background: amount === v ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                            color: amount === v ? 'white' : 'var(--text-secondary)',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          +{v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>მიზეზი</label>
                    <select
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)', borderRadius: '10px',
                        color: 'var(--text-white)', fontSize: '0.9rem',
                      }}
                    >
                      <option value="admin_award">ადმინის ჯილდო</option>
                      <option value="bonus">ბონუსი</option>
                      <option value="contest_prize">კონკურსის პრიზი</option>
                      <option value="correction">კორექცია</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAwardXP}
                  disabled={submitting || !selectedUser}
                  className="btn btn-gold"
                  style={{ marginTop: 20, minWidth: 180 }}
                >
                  {submitting ? (
                    <span className="material-symbols-rounded spinning">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-rounded">bolt</span>
                      XP-ის მინიჭება
                    </>
                  )}
                </button>
              </div>

              {/* Current Leaderboard */}
              <div style={cardStyle}>
                <h3 style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8, color: 'var(--gold)' }}>format_list_numbered</span>
                  რეიტინგი ({leaders.length} მომხმარებელი)
                </h3>
                
                {leadersLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <span className="material-symbols-rounded spinning" style={{ fontSize: 32, color: 'var(--gold)' }}>progress_activity</span>
                  </div>
                ) : leaders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>ჯერ არავის აქვს XP</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {leaders.map((leader, idx) => (
                      <div
                        key={leader.user_id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
                          background: idx < 3 ? 'rgba(212,168,83,0.06)' : 'transparent',
                          borderRadius: '10px',
                          borderLeft: idx < 3 ? '3px solid var(--gold)' : '3px solid transparent',
                        }}
                      >
                        <span style={{ width: 32, fontWeight: 700, fontSize: '0.9rem', color: idx < 3 ? 'var(--gold)' : 'var(--text-muted)', textAlign: 'center' }}>
                          {idx < 3 ? ["🥇","🥈","🥉"][idx] : `#${idx + 1}`}
                        </span>
                        <Avatar style={{ width: 32, height: 32, flexShrink: 0 }}>
                          <AvatarImage src={leader.profiles?.avatar_url || ""} />
                          <AvatarFallback style={{ fontSize: '0.75rem' }}>{(leader.profiles?.full_name || "U")[0]}</AvatarFallback>
                        </Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {leader.profiles?.full_name || "მომხმარებელი"}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lv.{leader.level} · {getLevelTitle(leader.level)}</div>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--gold)', flexShrink: 0 }}>{leader.total_xp} XP</span>
                        <button
                          onClick={() => setSelectedUser(leader.user_id)}
                          style={{
                            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
                            padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem',
                          }}
                          title="XP მინიჭება"
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
    </AdminLayout>
  );
};

export default AdminXP;
