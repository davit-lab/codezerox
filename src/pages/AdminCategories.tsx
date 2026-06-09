import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useBooks";
import { toast } from "sonner";

const ICONS = [
  'folder', 'code', 'psychology', 'architecture', 'terminal', 'web', 
  'smartphone', 'database', 'cloud', 'security', 'analytics', 'brush',
  'palette', 'photo_camera', 'videocam', 'music_note', 'school', 'science',
  'calculate', 'trending_up', 'work', 'rocket_launch', 'lightbulb', 'extension'
];

const AdminCategories = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("folder");

  if (authLoading) {
    return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span></div></AdminLayout>;
  }

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("folder");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (category: typeof categories[0]) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "folder");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, name, description, icon });
        toast.success("Category updated!");
      } else {
        await createCategory.mutateAsync({ name, description, icon });
        toast.success("Category created!");
      }
      resetForm();
    } catch (err) {
      toast.error(editingId ? "Failed to update category" : "Failed to create category");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Books in this category will be uncategorized.`)) return;
    
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted!");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <AdminLayout title="კატეგორიები" titleIcon="category" actions={
      <button className="btn btn-gold" onClick={() => { resetForm(); setShowForm(!showForm); }}>
        <span className="material-symbols-rounded">{showForm ? 'close' : 'add'}</span>
        {showForm ? 'გაუქმება' : 'ახალი კატეგორია'}
      </button>
    }>

              {showForm && (
                <form onSubmit={handleSubmit} style={{ background: 'var(--bg-elevated)', padding: '32px', borderRadius: 'var(--radius-xl)', marginBottom: '32px', border: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ color: 'var(--text-white)', marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
                    {editingId ? 'Edit Category' : 'New Category'}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input 
                        className="form-input" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g. Web Development"
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Icon</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ICONS.map(i => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setIcon(i)}
                            style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: icon === i ? 'var(--gold-glow)' : 'var(--bg-card)',
                              border: `1px solid ${icon === i ? 'var(--gold)' : 'var(--border-subtle)'}`,
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: '20px', color: icon === i ? 'var(--gold)' : 'var(--text-muted)' }}>{i}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-input" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        rows={3}
                        placeholder="Brief description of this category..."
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-gold" disabled={createCategory.isPending || updateCategory.isPending}>
                      {(createCategory.isPending || updateCategory.isPending) ? (
                        <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                      ) : (
                        <>
                          <span className="material-symbols-rounded">{editingId ? 'save' : 'add'}</span>
                          {editingId ? 'Save Changes' : 'Create Category'}
                        </>
                      )}
                    </button>
                    {editingId && (
                      <button type="button" className="btn btn-ghost" onClick={resetForm}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              )}

              {categoriesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                </div>
              ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>folder_off</span>
                  <p>No categories yet</p>
                  <button className="btn btn-gold" style={{ marginTop: '16px' }} onClick={() => setShowForm(true)}>
                    <span className="material-symbols-rounded">add</span>
                    Create First Category
                  </button>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Books</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: 'var(--radius-sm)', 
                                background: 'var(--gold-glow)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                border: '1px solid var(--border-accent)'
                              }}>
                                <span className="material-symbols-rounded" style={{ color: 'var(--gold)', fontSize: '20px' }}>{cat.icon || 'folder'}</span>
                              </div>
                              <span style={{ color: 'var(--text-white)', fontWeight: '500' }}>{cat.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
                            {cat.description || '—'}
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-default">{cat.book_count} books</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-ghost btn-sm" 
                                onClick={() => handleEdit(cat)}
                                title="Edit"
                              >
                                <span className="material-symbols-rounded">edit</span>
                              </button>
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleDelete(cat.id, cat.name)}
                                title="Delete"
                              >
                                <span className="material-symbols-rounded">delete</span>
                              </button>
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

export default AdminCategories;
