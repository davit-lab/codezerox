import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminAllChildren,
  useAdminToggleChildActive,
  useAdminDeleteChildAccount,
} from "@/hooks/useKidsProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminKids = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: children = [], isLoading } = useAdminAllChildren();
  const toggleActive = useAdminToggleChildActive();
  const deleteChild = useAdminDeleteChildAccount();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (authLoading) {
    return (
      <AdminLayout title="Kids მართვა" titleIcon="child_care">
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: 48, color: "var(--gold)" }}>
            progress_activity
          </span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const filtered = children.filter((c: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.child_username?.toLowerCase().includes(q) ||
      c.child_display_name?.toLowerCase().includes(q) ||
      c.parent?.email?.toLowerCase().includes(q) ||
      c.parent?.full_name?.toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("შეავსე ყველა ველი");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-child-account", {
        body: {
          action: "create",
          username: newUsername.trim(),
          password: newPassword.trim(),
          display_name: newDisplayName.trim() || newUsername.trim(),
        },
      });
      if (error || data?.error) {
        toast.error(data?.error || "შეცდომა");
      } else {
        toast.success("ბავშვის ანგარიში შეიქმნა");
        setNewUsername("");
        setNewPassword("");
        setNewDisplayName("");
        setShowCreate(false);
      }
    } catch (e: any) {
      toast.error(e.message || "შეცდომა");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (childId: string, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ childId, isActive: !currentActive });
      toast.success(!currentActive ? "ანგარიში გააქტიურდა" : "ანგარიში გაითიშა");
    } catch {
      toast.error("შეცდომა");
    }
  };

  const handleDelete = async (childId: string) => {
    try {
      await deleteChild.mutateAsync(childId);
      toast.success("ანგარიში წაიშალა");
      setDeleteConfirm(null);
    } catch (e: any) {
      toast.error(e.message || "შეცდომა");
    }
  };

  const handleGrantAccess = async (childId: string, hasSubscription: boolean) => {
    try {
      if (hasSubscription) {
        // Remove subscription
        const { error } = await supabase
          .from('kids_subscriptions')
          .delete()
          .eq('child_id', childId);
        if (error) throw error;
        toast.success("წვდომა გაუქმდა");
      } else {
        // Grant permanent subscription
        const { error } = await supabase
          .from('kids_subscriptions')
          .insert({
            child_id: childId,
            parent_id: '00000000-0000-0000-0000-000000000000',
            status: 'active',
            amount_gel: 0,
            expires_at: '2099-12-31T23:59:59Z',
          });
        if (error) throw error;
        toast.success("წვდომა გააქტიურდა");
      }
    } catch (e: any) {
      toast.error(e.message || "შეცდომა");
    }
  };

  return (
    <AdminLayout
      title="Kids მართვა"
      titleIcon="child_care"
      actions={
        <button
          onClick={() => setShowCreate(true)}
          className="admin-btn admin-btn-primary"
        >
          <span className="material-symbols-rounded">add</span>
          ანგარიშის შექმნა
        </button>
      }
    >
      {/* Search */}
      <div className="admin-search-bar mb-6">
        <span className="material-symbols-rounded">search</span>
        <input
          type="text"
          placeholder="ძებნა სახელით, მშობლით..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{children.length}</div>
          <div className="admin-stat-label">სულ ანგარიშები</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{children.filter((c: any) => c.is_active !== false).length}</div>
          <div className="admin-stat-label">აქტიური</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{children.filter((c: any) => c.subscription).length}</div>
          <div className="admin-stat-label">გამოწერით</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {children.reduce((sum: number, c: any) => sum + (c.lessonsCompleted || 0), 0)}
          </div>
          <div className="admin-stat-label">გაკვეთილი შესრულებული</div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          იტვირთება...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          ბავშვის ანგარიშები არ მოიძებნა
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>მომხმარებელი</th>
                <th>მშობელი</th>
                <th>პროგრესი</th>
                <th>სტატუსი</th>
                <th>თარიღი</th>
                <th>მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((child: any) => (
                <tr key={child.id}>
                  <td>
                    <div>
                      <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {child.child_display_name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        @{child.child_username}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {child.parent?.full_name || child.parent?.email || "—"}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold" style={{ color: "var(--gold)" }}>
                      {child.lessonsCompleted} გაკვეთილი
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: child.is_active !== false
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(239,68,68,0.15)",
                        color: child.is_active !== false ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {child.is_active !== false ? "აქტიური" : "გათიშული"}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(child.created_at).toLocaleDateString("ka-GE")}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGrantAccess(child.child_id, !!child.subscription)}
                        className={`admin-btn admin-btn-sm ${child.subscription ? '' : 'admin-btn-primary'}`}
                        title={child.subscription ? "წვდომის გაუქმება" : "წვდომის მინიჭება"}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                          {child.subscription ? "lock_open" : "vpn_key"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(child.child_id, child.is_active !== false)}
                        className="admin-btn admin-btn-sm"
                        title={child.is_active !== false ? "გათიშვა" : "გააქტიურება"}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                          {child.is_active !== false ? "toggle_on" : "toggle_off"}
                        </span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(child.child_id)}
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        title="წაშლა"
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="admin-modal">
          <DialogHeader>
            <DialogTitle>ახალი ბავშვის ანგარიში</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                მომხმარებლის სახელი
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                სახელი
              </label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="საჩვენებელი სახელი"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                პაროლი
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="მინიმუმ 4 სიმბოლო"
                className="admin-input w-full"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="admin-btn admin-btn-primary w-full"
            >
              {creating ? "იქმნება..." : "შექმნა"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="admin-modal">
          <DialogHeader>
            <DialogTitle>ანგარიშის წაშლა</DialogTitle>
          </DialogHeader>
          <p className="text-sm my-4" style={{ color: "var(--text-muted)" }}>
            ნამდვილად გსურთ ამ ბავშვის ანგარიშის წაშლა? ეს მოქმედება შეუქცევადია.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="admin-btn flex-1">
              გაუქმება
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="admin-btn admin-btn-danger flex-1"
            >
              წაშლა
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminKids;
