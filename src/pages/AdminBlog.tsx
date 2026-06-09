import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdminBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, BlogPost } from "@/hooks/useBlog";
import { toast } from "sonner";

const AdminBlog = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: posts = [], isLoading } = useAdminBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  if (authLoading) return null;
  if (!isAdmin) { navigate("/"); return null; }

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
  };

  const resetForm = () => {
    setTitle(""); setSlug(""); setContent(""); setExcerpt(""); setCoverUrl(""); setTags(""); setIsPublished(false);
    setEditingPost(null); setShowForm(false);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setExcerpt(post.excerpt || "");
    setCoverUrl(post.cover_url || "");
    setTags((post.tags || []).join(", "));
    setIsPublished(post.is_published);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("სათაური და slug სავალდებულოა");
      return;
    }

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      cover_url: coverUrl.trim() || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      is_published: isPublished,
    };

    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, ...postData }, {
        onSuccess: () => { toast.success("სტატია განახლდა"); resetForm(); },
        onError: () => toast.error("შეცდომა"),
      });
    } else {
      createPost.mutate(postData, {
        onSuccess: () => { toast.success("სტატია შეიქმნა"); resetForm(); },
        onError: () => toast.error("შეცდომა"),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("წავშალოთ სტატია?")) return;
    deletePost.mutate(id, {
      onSuccess: () => toast.success("სტატია წაიშალა"),
    });
  };

  const handleTogglePublish = (post: BlogPost) => {
    updatePost.mutate({
      id: post.id,
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : post.published_at,
    }, {
      onSuccess: () => toast.success(post.is_published ? "სტატია გაუქმდა" : "სტატია გამოქვეყნდა"),
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("ka-GE", { month: "short", day: "numeric", year: "numeric" });

  return (
    <AdminLayout title="ბლოგის მართვა" titleIcon="article" actions={
      <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-gold">
        <span className="material-symbols-rounded">add</span>
        ახალი სტატია
      </button>
    }>

          {/* Form Modal */}
          {showForm && (
            <div className="admin-modal-overlay" onClick={() => resetForm()}>
              <div className="admin-modal blog-admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingPost ? "სტატიის რედაქტირება" : "ახალი სტატია"}</h2>
                  <button onClick={resetForm} className="icon-btn">
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
                <div className="admin-modal-body blog-form-body">
                  <div className="form-group">
                    <label className="form-label">სათაური</label>
                    <input
                      className="form-input"
                      value={title}
                      onChange={e => { setTitle(e.target.value); if (!editingPost) setSlug(generateSlug(e.target.value)); }}
                      placeholder="სტატიის სათაური"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug (URL)</label>
                    <input className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="statiis-url" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">მოკლე აღწერა</label>
                    <input className="form-input" value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="მოკლე აღწერა..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ყდის სურათი (URL)</label>
                    <input className="form-input" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ტეგები (მძიმით გამოყოფილი)</label>
                    <input className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="javascript, react, tips" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">კონტენტი (Markdown)</label>
                    <textarea
                      className="form-input blog-content-editor"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="სტატიის ტექსტი Markdown ფორმატში..."
                      rows={16}
                    />
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label className="form-label" style={{ margin: 0 }}>გამოქვეყნება</label>
                    <button
                      className={`blog-toggle ${isPublished ? "active" : ""}`}
                      onClick={() => setIsPublished(!isPublished)}
                    >
                      <span className="blog-toggle-dot" />
                    </button>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button onClick={resetForm} className="btn btn-ghost">გაუქმება</button>
                  <button onClick={handleSave} className="btn btn-gold" disabled={createPost.isPending || updatePost.isPending}>
                    {editingPost ? "განახლება" : "შექმნა"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>სათაური</th>
                  <th>სტატუსი</th>
                  <th>ნახვები</th>
                  <th>თარიღი</th>
                  <th>მოქმედება</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>იტვირთება...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>სტატიები არ არის</td></tr>
                ) : posts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{post.title}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/blog/{post.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${post.is_published ? "badge-success" : "badge-muted"}`}>
                        {post.is_published ? "გამოქვეყნებული" : "დრაფტი"}
                      </span>
                    </td>
                    <td>{post.views}</td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{formatDate(post.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleTogglePublish(post)} className="icon-btn" title={post.is_published ? "გაუქმება" : "გამოქვეყნება"}>
                          <span className="material-symbols-rounded">{post.is_published ? "unpublished" : "publish"}</span>
                        </button>
                        <button onClick={() => openEdit(post)} className="icon-btn" title="რედაქტირება">
                          <span className="material-symbols-rounded">edit</span>
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="icon-btn" title="წაშლა" style={{ color: "var(--ruby)" }}>
                          <span className="material-symbols-rounded">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </AdminLayout>
  );
};

export default AdminBlog;
