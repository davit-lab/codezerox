import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBooks } from "@/hooks/useBooks";
import {
  useAdminBundles,
  useBundleItems,
  useCreateBundle,
  useDeleteBundle,
  useToggleBundle,
  useUpdateBundle,
  BookBundle,
} from "@/hooks/useBookBundles";
import {
  Plus, Trash2, Percent, BadgeDollarSign, ToggleLeft, ToggleRight,
  Package, Search, Check, X, BookOpen, Pencil, ChevronDown, ChevronUp,
} from "lucide-react";

const AdminBundles = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: bundles = [], isLoading: loadingBundles } = useAdminBundles();
  const { data: allBooks = [] } = useBooks();
  const createBundle = useCreateBundle();
  const deleteBundle = useDeleteBundle();
  const toggleBundle = useToggleBundle();
  const updateBundle = useUpdateBundle();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [bookSearch, setBookSearch] = useState("");

  // Fetch items for expanded bundle
  const { data: expandedItems = [] } = useBundleItems(expandedId);

  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return allBooks;
    const q = bookSearch.toLowerCase();
    return allBooks.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [allBooks, bookSearch]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setStartsAt("");
    setExpiresAt("");
    setSelectedBookIds([]);
    setBookSearch("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !discountValue || selectedBookIds.length < 2) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      starts_at: startsAt || undefined,
      expires_at: expiresAt || undefined,
      book_ids: selectedBookIds,
    };

    if (editingId) {
      updateBundle.mutate({ id: editingId, ...payload }, { onSuccess: resetForm });
    } else {
      createBundle.mutate(payload, { onSuccess: resetForm });
    }
  };

  const startEdit = (bundle: BookBundle, items: { book_id: string }[]) => {
    setEditingId(bundle.id);
    setTitle(bundle.title);
    setDescription(bundle.description || "");
    setDiscountType(bundle.discount_type);
    setDiscountValue(String(bundle.discount_value));
    setStartsAt(bundle.starts_at ? bundle.starts_at.slice(0, 16) : "");
    setExpiresAt(bundle.expires_at ? bundle.expires_at.slice(0, 16) : "");
    setSelectedBookIds(items.map(i => i.book_id));
    setShowForm(true);
  };

  const toggleBook = (bookId: string) => {
    setSelectedBookIds(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const selectedTotal = useMemo(() => {
    return allBooks
      .filter(b => selectedBookIds.includes(b.id))
      .reduce((sum, b) => sum + (b.is_free ? 0 : b.price), 0);
  }, [allBooks, selectedBookIds]);

  const previewDiscount = useMemo(() => {
    if (!discountValue) return 0;
    const val = parseFloat(discountValue);
    if (discountType === 'percentage') return selectedTotal * (val / 100);
    return Math.min(val, selectedTotal);
  }, [selectedTotal, discountType, discountValue]);

  if (authLoading) {
    return (
      <AdminLayout title="ფასდაკლებები">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
        </div>
      </AdminLayout>
    );
  }
  if (!user || !isAdmin) { navigate("/"); return null; }

  return (
    <AdminLayout title="ფასდაკლებები (ბანდლები)" titleIcon="sell" actions={
      <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus className="w-4 h-4" /> ახალი
      </button>
    }>
      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-card/80 border border-border/30 rounded-2xl p-6 mb-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {editingId ? "ფასდაკლების რედაქტირება" : "ახალი ფასდაკლება"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">სახელი</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="მაგ: Front-End ბანდლი"
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">აღწერა (არასავალდებულო)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="მოკლე აღწერა"
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">ფასდაკლების ტიპი</label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="percentage">პროცენტული (%)</option>
                <option value="fixed">ფიქსირებული (₾)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                მნიშვნელობა {discountType === 'percentage' ? '(%)' : '(₾)'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "20" : "5.00"}
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">დაწყების თარიღი (არასავალდებულო)</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">ვადა (არასავალდებულო)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Book selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              წიგნების არჩევა ({selectedBookIds.length} არჩეული)
              {selectedBookIds.length < 2 && <span className="text-destructive ml-2">მინიმუმ 2 წიგნი</span>}
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                placeholder="წიგნის ძებნა..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="max-h-60 overflow-y-auto border border-border/20 rounded-xl divide-y divide-border/10">
              {filteredBooks.map(book => {
                const isSelected = selectedBookIds.includes(book.id);
                return (
                  <button
                    key={book.id}
                    onClick={() => toggleBook(book.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border/50'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="w-7 h-9 rounded bg-muted/20 overflow-hidden flex-shrink-0">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-3 h-3 text-muted-foreground/30" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{book.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{book.author}</div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                      {book.is_free ? 'უფასო' : `${book.price.toFixed(2)} ₾`}
                    </span>
                  </button>
                );
              })}
              {filteredBooks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">წიგნი ვერ მოიძებნა</p>
              )}
            </div>
          </div>

          {/* Preview */}
          {selectedBookIds.length >= 2 && discountValue && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-1.5">
              <div className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" /> პრევიუ
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ჯამური ფასი ({selectedBookIds.length} წიგნი)</span>
                <span>{selectedTotal.toFixed(2)} ₾</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">ფასდაკლება</span>
                <span className="text-emerald-400 font-semibold">-{previewDiscount.toFixed(2)} ₾</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5">
                <span>საბოლოო ფასი</span>
                <span className="text-primary">{(selectedTotal - previewDiscount).toFixed(2)} ₾</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !discountValue || selectedBookIds.length < 2 || createBundle.isPending || updateBundle.isPending}
              className="btn btn-gold disabled:opacity-50"
            >
              {createBundle.isPending || updateBundle.isPending ? 'იტვირთება...' : editingId ? 'განახლება' : 'შექმნა'}
            </button>
            <button onClick={resetForm} className="btn btn-ghost">გაუქმება</button>
          </div>
        </div>
      )}

      {/* Bundles List */}
      {loadingBundles ? (
        <p className="text-muted-foreground">იტვირთება...</p>
      ) : bundles.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">ფასდაკლებები ჯერ არ არის</p>
          <p className="text-xs text-muted-foreground/60 mt-1">შექმენი ახალი ფასდაკლება რამდენიმე წიგნისთვის</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map((bundle: BookBundle) => {
            const isExpanded = expandedId === bundle.id;
            const isExpired = bundle.expires_at && new Date(bundle.expires_at) < new Date();
            return (
              <div
                key={bundle.id}
                className={`bg-card/80 border rounded-xl overflow-hidden transition-colors ${
                  bundle.is_active && !isExpired ? 'border-border/30' : 'border-border/10 opacity-60'
                }`}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : bundle.id)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      bundle.discount_type === 'percentage' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {bundle.discount_type === 'percentage' ? <Percent className="w-5 h-5" /> : <BadgeDollarSign className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{bundle.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          bundle.discount_type === 'percentage'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {bundle.discount_type === 'percentage' ? `${bundle.discount_value}%` : `${bundle.discount_value} ₾`}
                        </span>
                        {isExpired && <span className="text-xs text-destructive">ვადაგასული</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {bundle.description && <span>{bundle.description}</span>}
                        {bundle.expires_at && (
                          <span>ვადა: {new Date(bundle.expires_at).toLocaleDateString('ka-GE')}</span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/40" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/40" />}
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleBundle.mutate({ id: bundle.id, is_active: !bundle.is_active })}
                      className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      title={bundle.is_active ? "გამორთვა" : "ჩართვა"}
                    >
                      {bundle.is_active ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("წაშალოთ ფასდაკლება?")) deleteBundle.mutate(bundle.id);
                      }}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded: show books in bundle */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/10">
                    <div className="flex items-center justify-between mt-3 mb-2">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        წიგნები ბანდლში
                      </span>
                      <button
                        onClick={() => startEdit(bundle, expandedItems)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> რედაქტირება
                      </button>
                    </div>
                    {expandedItems.length === 0 ? (
                      <p className="text-xs text-muted-foreground">წიგნები არ არის</p>
                    ) : (
                      <div className="space-y-1.5">
                        {expandedItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 py-1.5">
                            <div className="w-7 h-9 rounded bg-muted/20 overflow-hidden flex-shrink-0">
                              {item.book?.cover_url ? (
                                <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-3 h-3 text-muted-foreground/30" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate block">{item.book?.title || 'უცნობი'}</span>
                              <span className="text-xs text-muted-foreground">{item.book?.author}</span>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {item.book?.is_free ? 'უფასო' : `${item.book?.price?.toFixed(2)} ₾`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBundles;
