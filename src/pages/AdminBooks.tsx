import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBooks, useCategories, useCreateBook, useDeleteBook, useUpdateBook } from "@/hooks/useBooks";
import { useBookUpdates, useCreateBookUpdate, useDeleteBookUpdate } from "@/hooks/useBookUpdates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminBooks = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const { data: books = [] } = useBooks();
  const { data: categories = [] } = useCategories();
  const createBook = useCreateBook();
  const deleteBook = useDeleteBook();
  const updateBook = useUpdateBook();
  const createBookUpdate = useCreateBookUpdate();
  const deleteBookUpdate = useDeleteBookUpdate();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [pages, setPages] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewPdfFile, setPreviewPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Update form state
  const [showUpdateForm, setShowUpdateForm] = useState<string | null>(null);
  const [updateVersion, setUpdateVersion] = useState("v2.0");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updatePrice, setUpdatePrice] = useState("0");
  const [updatePages, setUpdatePages] = useState("0");
  const [updateIsFree, setUpdateIsFree] = useState(false);
  const [updatePdfFile, setUpdatePdfFile] = useState<File | null>(null);
  const [uploadingUpdate, setUploadingUpdate] = useState(false);

  // Edit form state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editPages, setEditPages] = useState("0");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editIsFree, setEditIsFree] = useState(false);
  const [editIsNew, setEditIsNew] = useState(false);
  const [editIsPopular, setEditIsPopular] = useState(false);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [editPreviewPdfFile, setEditPreviewPdfFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  if (isLoading) return <AdminLayout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>progress_activity</span></div></AdminLayout>;
  if (!user || !isAdmin) { navigate("/"); return null; }

  const startEditing = (book: any) => {
    setEditingBookId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditDescription(book.description || "");
    setEditPrice(String(book.price));
    setEditPages(String(book.pages || 0));
    setEditCategoryId(book.category_id || "");
    setEditIsFree(book.is_free || false);
    setEditIsNew(book.is_new || false);
    setEditIsPopular(book.is_popular || false);
    setEditCoverFile(null);
    setEditPdfFile(null);
    setEditPreviewPdfFile(null);
    setShowUpdateForm(null);
  };

  const cancelEditing = () => {
    setEditingBookId(null);
  };

  const handleEditSubmit = async (bookId: string) => {
    setSavingEdit(true);
    try {
      const updates: any = {
        id: bookId,
        title: editTitle,
        author: editAuthor,
        description: editDescription || null,
        price: parseFloat(editPrice),
        pages: parseInt(editPages),
        category_id: editCategoryId || null,
        is_free: editIsFree,
        is_new: editIsNew,
        is_popular: editIsPopular,
      };

      if (editCoverFile) {
        const ext = editCoverFile.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-covers').upload(path, editCoverFile);
        if (error) throw error;
        const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
        updates.cover_url = data.publicUrl;
      }

      if (editPdfFile) {
        const ext = editPdfFile.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-pdfs').upload(path, editPdfFile);
        if (error) throw error;
        const { data } = supabase.storage.from('book-pdfs').getPublicUrl(path);
        updates.pdf_url = data.publicUrl;
      }

      // if (editPreviewPdfFile) {
      //   const ext = editPreviewPdfFile.name.split('.').pop();
      //   const path = `preview/${Date.now()}.${ext}`;
      //   const { error } = await supabase.storage.from('book-pdfs').upload(path, editPreviewPdfFile);
      //   if (error) throw error;
      //   const { data } = supabase.storage.from('book-pdfs').getPublicUrl(path);
      //   updates.preview_pdf_url = data.publicUrl;
      // }

      await updateBook.mutateAsync(updates);
      toast.success("წიგნი განახლდა!");
      setEditingBookId(null);
    } catch (err) {
      toast.error("შეცდომა წიგნის განახლებისას");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let coverUrl = null;
      let pdfUrl = null;
      if (coverFile) {
        const ext = coverFile.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-covers').upload(path, coverFile);
        if (error) throw error;
        const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
        coverUrl = data.publicUrl;
      }
      if (pdfFile) {
        const ext = pdfFile.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-pdfs').upload(path, pdfFile);
        if (error) throw error;
        const { data } = supabase.storage.from('book-pdfs').getPublicUrl(path);
        pdfUrl = data.publicUrl;
      }
      let previewPdfUrl = null;
      if (previewPdfFile) {
        const ext = previewPdfFile.name.split('.').pop();
        const path = `preview/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-pdfs').upload(path, previewPdfFile);
        if (error) throw error;
        const { data } = supabase.storage.from('book-pdfs').getPublicUrl(path);
        previewPdfUrl = data.publicUrl;
      }
      await createBook.mutateAsync({
        title, 
        author, 
        description: description || null, 
        price: parseFloat(price), 
        pages: parseInt(pages),
        category_id: categoryId || null, 
        is_free: isFree, 
        is_new: isNew, 
        is_popular: isPopular,
        cover_url: coverUrl, 
        pdf_url: pdfUrl, 
        // preview_pdf_url: previewPdfUrl,  // Temporarily disabled - may need migration
        rating: 0, 
        rating_count: 0
      });
      toast.success("წიგნი დაემატა!");
      setShowForm(false);
      setTitle(""); setAuthor(""); setDescription(""); setPrice("0"); setPages("0");
      setCategoryId(""); setIsFree(false); setIsNew(false); setIsPopular(false);
      setCoverFile(null); setPdfFile(null); setPreviewPdfFile(null);
    } catch (err) {
      console.error('Book creation error:', err);
      toast.error(`შეცდომა წიგნის დამატებისას: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSubmit = async (bookId: string) => {
    setUploadingUpdate(true);
    try {
      let pdfUrl = null;
      if (updatePdfFile) {
        const ext = updatePdfFile.name.split('.').pop();
        const path = `updates/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-pdfs').upload(path, updatePdfFile);
        if (error) throw error;
        const { data } = supabase.storage.from('book-pdfs').getPublicUrl(path);
        pdfUrl = data.publicUrl;
      }

      await createBookUpdate.mutateAsync({
        book_id: bookId,
        version_name: updateVersion,
        description: updateDescription,
        price: updateIsFree ? 0 : parseFloat(updatePrice),
        is_free: updateIsFree,
        pdf_url: pdfUrl,
        pages: parseInt(updatePages) || 0,
      });

      toast.success("განახლება დაემატა!");
      setShowUpdateForm(null);
      setUpdateVersion("v2.0"); setUpdateDescription(""); setUpdatePrice("0");
      setUpdatePages("0"); setUpdateIsFree(false); setUpdatePdfFile(null);
    } catch (err) {
      toast.error("შეცდომა განახლების დამატებისას");
    } finally {
      setUploadingUpdate(false);
    }
  };

  return (
    <AdminLayout title="წიგნები" titleIcon="menu_book" actions={
      <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
        <span className="material-symbols-rounded">{showForm ? 'close' : 'add'}</span>
        {showForm ? 'გაუქმება' : 'ახალი წიგნი'}
      </button>
    }>

              {showForm && (
                <form onSubmit={handleSubmit} style={{ background: 'var(--bg-elevated)', padding: '32px', borderRadius: 'var(--radius-xl)', marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="form-group"><label className="form-label">სათაური</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">ავტორი</label><input className="form-input" value={author} onChange={e => setAuthor(e.target.value)} required /></div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">აღწერა</label><textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
                    <div className="form-group"><label className="form-label">ფასი (₾)</label><input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">გვერდები</label><input type="number" className="form-input" value={pages} onChange={e => setPages(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">კატეგორია</label><select className="filter-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">აირჩიეთ</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />უფასო</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} />ახალი</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />პოპულარული</label>
                    </div>
                    <div className="form-group"><label className="form-label">ყდის სურათი</label><input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">PDF ფაილი (სრული)</label><input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="form-input" /></div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span className="material-symbols-rounded" style={{ fontSize:16, color:'var(--gold)' }}>preview</span>
                        პრევიუ PDF — პირველი 10 გვერდი (არასავალდებულო)
                      </label>
                      <input type="file" accept=".pdf" onChange={e => setPreviewPdfFile(e.target.files?.[0] || null)} className="form-input" />
                      <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:4 }}>შეიძინეთ-გარეშე მომხმარებლები ამ PDF-ს ნახავენ პრევიუ რეჟიმში</p>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-gold" disabled={uploading} style={{ marginTop: '24px' }}>
                    {uploading ? <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span> : <><span className="material-symbols-rounded">save</span>შენახვა</>}
                  </button>
                </form>
              )}

              <table className="admin-table">
                <thead><tr><th>სათაური</th><th>ავტორი</th><th>ფასი</th><th>სტატუსი</th><th>მოქმედება</th></tr></thead>
                <tbody>
                  {books.map(book => (
                    <BookRow
                      key={book.id}
                      book={book}
                      categories={categories}
                      showUpdateForm={showUpdateForm}
                      setShowUpdateForm={setShowUpdateForm}
                      updateVersion={updateVersion}
                      setUpdateVersion={setUpdateVersion}
                      updateDescription={updateDescription}
                      setUpdateDescription={setUpdateDescription}
                      updatePrice={updatePrice}
                      setUpdatePrice={setUpdatePrice}
                      updatePages={updatePages}
                      setUpdatePages={setUpdatePages}
                      updateIsFree={updateIsFree}
                      setUpdateIsFree={setUpdateIsFree}
                      updatePdfFile={updatePdfFile}
                      setUpdatePdfFile={setUpdatePdfFile}
                      uploadingUpdate={uploadingUpdate}
                      onSubmitUpdate={handleUpdateSubmit}
                      onDelete={(id) => { if(confirm('წაშლა?')) deleteBook.mutate(id); }}
                      deleteBookUpdate={deleteBookUpdate}
                      editingBookId={editingBookId}
                      onStartEdit={startEditing}
                      onCancelEdit={cancelEditing}
                      onSaveEdit={handleEditSubmit}
                      savingEdit={savingEdit}
                      editTitle={editTitle} setEditTitle={setEditTitle}
                      editAuthor={editAuthor} setEditAuthor={setEditAuthor}
                      editDescription={editDescription} setEditDescription={setEditDescription}
                      editPrice={editPrice} setEditPrice={setEditPrice}
                      editPages={editPages} setEditPages={setEditPages}
                      editCategoryId={editCategoryId} setEditCategoryId={setEditCategoryId}
                      editIsFree={editIsFree} setEditIsFree={setEditIsFree}
                      editIsNew={editIsNew} setEditIsNew={setEditIsNew}
                      editIsPopular={editIsPopular} setEditIsPopular={setEditIsPopular}
                      editCoverFile={editCoverFile} setEditCoverFile={setEditCoverFile}
                      editPdfFile={editPdfFile} setEditPdfFile={setEditPdfFile}
                      editPreviewPdfFile={editPreviewPdfFile} setEditPreviewPdfFile={setEditPreviewPdfFile}
                    />
                  ))}
                </tbody>
              </table>
    </AdminLayout>
  );
};

interface BookRowProps {
  book: any;
  categories: any[];
  showUpdateForm: string | null;
  setShowUpdateForm: (id: string | null) => void;
  updateVersion: string;
  setUpdateVersion: (v: string) => void;
  updateDescription: string;
  setUpdateDescription: (v: string) => void;
  updatePrice: string;
  setUpdatePrice: (v: string) => void;
  updatePages: string;
  setUpdatePages: (v: string) => void;
  updateIsFree: boolean;
  setUpdateIsFree: (v: boolean) => void;
  updatePdfFile: File | null;
  setUpdatePdfFile: (f: File | null) => void;
  uploadingUpdate: boolean;
  onSubmitUpdate: (bookId: string) => void;
  onDelete: (id: string) => void;
  deleteBookUpdate: any;
  editingBookId: string | null;
  onStartEdit: (book: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: (bookId: string) => void;
  savingEdit: boolean;
  editTitle: string; setEditTitle: (v: string) => void;
  editAuthor: string; setEditAuthor: (v: string) => void;
  editDescription: string; setEditDescription: (v: string) => void;
  editPrice: string; setEditPrice: (v: string) => void;
  editPages: string; setEditPages: (v: string) => void;
  editCategoryId: string; setEditCategoryId: (v: string) => void;
  editIsFree: boolean; setEditIsFree: (v: boolean) => void;
  editIsNew: boolean; setEditIsNew: (v: boolean) => void;
  editIsPopular: boolean; setEditIsPopular: (v: boolean) => void;
  editCoverFile: File | null; setEditCoverFile: (f: File | null) => void;
  editPdfFile: File | null; setEditPdfFile: (f: File | null) => void;
  editPreviewPdfFile: File | null; setEditPreviewPdfFile: (f: File | null) => void;
}

const BookRow = ({
  book, categories, showUpdateForm, setShowUpdateForm,
  updateVersion, setUpdateVersion, updateDescription, setUpdateDescription,
  updatePrice, setUpdatePrice, updatePages, setUpdatePages,
  updateIsFree, setUpdateIsFree, updatePdfFile, setUpdatePdfFile,
  uploadingUpdate, onSubmitUpdate, onDelete, deleteBookUpdate,
  editingBookId, onStartEdit, onCancelEdit, onSaveEdit, savingEdit,
  editTitle, setEditTitle, editAuthor, setEditAuthor,
  editDescription, setEditDescription, editPrice, setEditPrice,
  editPages, setEditPages, editCategoryId, setEditCategoryId,
  editIsFree, setEditIsFree, editIsNew, setEditIsNew,
  editIsPopular, setEditIsPopular, editCoverFile, setEditCoverFile,
  editPdfFile, setEditPdfFile, editPreviewPdfFile, setEditPreviewPdfFile
}: BookRowProps) => {
  const { data: updates = [] } = useBookUpdates(book.id);
  const isUpdateOpen = showUpdateForm === book.id;
  const isEditing = editingBookId === book.id;

  return (
    <>
      <tr>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>{book.is_free ? 'უფასო' : `${book.price} ₾`}</td>
        <td>
          {book.is_new && <span className="book-badge new" style={{ marginRight: '4px' }}>ახალი</span>}
          {book.is_popular && <span className="book-badge popular">პოპულარული</span>}
          {updates.length > 0 && (
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 8px', borderRadius: '8px', fontSize: '11px',
              background: 'rgba(95, 19, 202, 0.15)', color: 'var(--gold)', marginLeft: '4px'
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>upgrade</span>
              {updates.length} განახლება
            </span>
          )}
        </td>
        <td>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => onStartEdit(book)}
              title="რედაქტირება"
              style={{ color: 'var(--emerald)' }}
            >
              <span className="material-symbols-rounded">edit</span>
            </button>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => setShowUpdateForm(isUpdateOpen ? null : book.id)}
              title="განახლება დამატება"
              style={{ color: 'var(--gold)' }}
            >
              <span className="material-symbols-rounded">upgrade</span>
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(book.id)}>
              <span className="material-symbols-rounded">delete</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Edit form */}
      {isEditing && (
        <tr>
          <td colSpan={5} style={{ padding: 0 }}>
            <div style={{ 
              background: 'var(--bg-surface)', padding: '24px', 
              borderTop: '2px solid var(--emerald)',
              borderBottom: '2px solid var(--emerald)'
            }}>
              <h4 style={{ color: 'var(--emerald)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded">edit</span>
                წიგნის რედაქტირება — {book.title}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">სათაური</label>
                  <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">ავტორი</label>
                  <input className="form-input" value={editAuthor} onChange={e => setEditAuthor(e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">აღწერა</label>
                  <textarea className="form-input" value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">ფასი (₾)</label>
                  <input type="number" className="form-input" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">გვერდები</label>
                  <input type="number" className="form-input" value={editPages} onChange={e => setEditPages(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">კატეგორია</label>
                  <select className="filter-select" value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}>
                    <option value="">აირჩიეთ</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={editIsFree} onChange={e => setEditIsFree(e.target.checked)} />უფასო
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={editIsNew} onChange={e => setEditIsNew(e.target.checked)} />ახალი
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={editIsPopular} onChange={e => setEditIsPopular(e.target.checked)} />პოპულარული
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">ახალი ყდის სურათი (არასავალდებულო)</label>
                  <input type="file" accept="image/*" onChange={e => setEditCoverFile(e.target.files?.[0] || null)} className="form-input" />
                  {book.cover_url && !editCoverFile && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>არსებული ყდა შენარჩუნდება</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">ახალი PDF სრული (არასავალდებულო)</label>
                  <input type="file" accept=".pdf" onChange={e => setEditPdfFile(e.target.files?.[0] || null)} className="form-input" />
                  {book.pdf_url && !editPdfFile && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>არსებული PDF შენარჩუნდება</p>
                  )}
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span className="material-symbols-rounded" style={{ fontSize:15, color:'var(--gold)' }}>preview</span>
                    პრევიუ PDF — პირველი 10 გვერდი (არასავალდებულო)
                  </label>
                  <input type="file" accept=".pdf" onChange={e => setEditPreviewPdfFile(e.target.files?.[0] || null)} className="form-input" />
                  {book.preview_pdf_url && !editPreviewPdfFile
                    ? <p style={{ color:'var(--gold)', fontSize:'12px', marginTop:'4px' }}>✓ არსებული პრევიუ არის (ახალის ატვირთვით გამოანაცვლება)</p>
                    : <p style={{ color:'var(--text-muted)', fontSize:'12px', marginTop:'4px' }}>შეიძინეთ-გარეშე მომხმარებლები ამ PDF-ს ნახავენ</p>
                  }
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button 
                  className="btn btn-gold" 
                  disabled={savingEdit}
                  onClick={() => onSaveEdit(book.id)}
                >
                  {savingEdit ? (
                    <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  ) : (
                    <><span className="material-symbols-rounded">save</span>შენახვა</>
                  )}
                </button>
                <button className="btn btn-ghost" onClick={onCancelEdit}>
                  გაუქმება
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Update form */}
      {isUpdateOpen && (
        <tr>
          <td colSpan={5} style={{ padding: 0 }}>
            <div style={{ 
              background: 'var(--bg-surface)', padding: '24px', 
              borderTop: '1px solid var(--border-accent)',
              borderBottom: '1px solid var(--border-accent)'
            }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded">upgrade</span>
                განახლების ატვირთვა — {book.title}
              </h4>

              {updates.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>არსებული განახლებები:</p>
                  {updates.map(upd => (
                    <div key={upd.id} style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '10px',
                      marginBottom: '6px', border: '1px solid var(--border-subtle)'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginRight: '8px' }}>{upd.version_name}</span>
                        <span style={{ color: upd.is_free ? 'var(--emerald)' : 'var(--gold)', fontSize: '13px' }}>
                          {upd.is_free ? 'უფასო' : `${upd.price} ₾`}
                        </span>
                        {upd.description && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{upd.description}</p>
                        )}
                      </div>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => { if(confirm('წაშლა?')) deleteBookUpdate.mutate({ id: upd.id, bookId: book.id }); }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">ვერსია</label>
                  <input className="form-input" value={updateVersion} onChange={e => setUpdateVersion(e.target.value)} placeholder="მაგ: v2.0" />
                </div>
                <div className="form-group">
                  <label className="form-label">გვერდები</label>
                  <input type="number" className="form-input" value={updatePages} onChange={e => setUpdatePages(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">რა შედის განახლებაში</label>
                  <textarea className="form-input" value={updateDescription} onChange={e => setUpdateDescription(e.target.value)} rows={3} placeholder="აღწერეთ რა ცვლილებები შედის ამ ვერსიაში..." />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <input type="checkbox" checked={updateIsFree} onChange={e => setUpdateIsFree(e.target.checked)} />
                    უფასო განახლება
                  </label>
                  {!updateIsFree && (
                    <>
                      <label className="form-label">ფასი (₾)</label>
                      <input type="number" className="form-input" value={updatePrice} onChange={e => setUpdatePrice(e.target.value)} />
                    </>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">განახლებული PDF</label>
                  <input type="file" accept=".pdf" onChange={e => setUpdatePdfFile(e.target.files?.[0] || null)} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button 
                  className="btn btn-gold" 
                  disabled={uploadingUpdate}
                  onClick={() => onSubmitUpdate(book.id)}
                >
                  {uploadingUpdate ? (
                    <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  ) : (
                    <><span className="material-symbols-rounded">upload</span>განახლების ატვირთვა</>
                  )}
                </button>
                <button className="btn btn-ghost" onClick={() => setShowUpdateForm(null)}>
                  გაუქმება
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminBooks;
