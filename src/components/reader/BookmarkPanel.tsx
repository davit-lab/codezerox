import { useState } from "react";
import { Bookmark, useAddBookmark, useUpdateBookmark, useDeleteBookmark, useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";

const COLORS = [
  { name: "gold", value: "#5F13CA" },
  { name: "emerald", value: "#34d399" },
  { name: "ruby", value: "#f43f5e" },
  { name: "sapphire", value: "#3b82f6" },
  { name: "amber", value: "#f59e0b" },
];

interface BookmarkPanelProps {
  bookId: string;
  currentPage: number;
  onGoToPage: (page: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BookmarkPanel = ({ bookId, currentPage, onGoToPage, isOpen, onClose }: BookmarkPanelProps) => {
  const { data: bookmarks = [] } = useBookmarks(bookId);
  const addBookmark = useAddBookmark();
  const updateBookmark = useUpdateBookmark();
  const deleteBookmark = useDeleteBookmark();

  const [noteText, setNoteText] = useState("");
  const [selectedColor, setSelectedColor] = useState("gold");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  const currentPageBookmark = bookmarks.find(b => b.page_number === currentPage);

  const handleAdd = () => {
    addBookmark.mutate(
      { bookId, pageNumber: currentPage, note: noteText || undefined, color: selectedColor },
      {
        onSuccess: () => {
          toast.success("სანიშნე დამატებულია");
          setNoteText("");
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteBookmark.mutate({ id, bookId }, {
      onSuccess: () => toast.success("სანიშნე წაიშალა"),
    });
  };

  const handleUpdate = (id: string) => {
    updateBookmark.mutate({ id, bookId, note: editNote }, {
      onSuccess: () => {
        setEditingId(null);
        toast.success("ჩანიშვნა განახლდა");
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="bookmark-panel">
      <div className="bookmark-panel-header">
        <h3>📌 სანიშნეები</h3>
        <button onClick={onClose} className="reader-icon-btn">
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>

      {/* Add bookmark for current page */}
      {!currentPageBookmark ? (
        <div className="bookmark-add-section">
          <p className="bookmark-add-label">გვერდი {currentPage}</p>
          <textarea
            className="bookmark-note-input"
            placeholder="ჩანიშვნა (არასავალდებულო)..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={2}
          />
          <div className="bookmark-color-row">
            {COLORS.map(c => (
              <button
                key={c.name}
                className={`bookmark-color-dot ${selectedColor === c.name ? "active" : ""}`}
                style={{ background: c.value }}
                onClick={() => setSelectedColor(c.name)}
              />
            ))}
          </div>
          <button onClick={handleAdd} disabled={addBookmark.isPending} className="bookmark-add-btn">
            <span className="material-symbols-rounded">bookmark_add</span>
            სანიშნის დამატება
          </button>
        </div>
      ) : (
        <div className="bookmark-add-section">
          <p className="bookmark-current-info">
            <span className="material-symbols-rounded" style={{ color: COLORS.find(c => c.name === currentPageBookmark.color)?.value || "var(--gold)", fontSize: "18px" }}>bookmark</span>
            გვერდი {currentPage} მონიშნულია
          </p>
        </div>
      )}

      {/* Bookmark list */}
      <div className="bookmark-list">
        {bookmarks.length === 0 ? (
          <p className="bookmark-empty">სანიშნეები არ არის</p>
        ) : (
          bookmarks.map(bm => (
            <div key={bm.id} className="bookmark-item" onClick={() => { onGoToPage(bm.page_number); }}>
              <div className="bookmark-item-header">
                <span className="material-symbols-rounded" style={{ color: COLORS.find(c => c.name === bm.color)?.value || "var(--gold)", fontSize: "20px" }}>bookmark</span>
                <span className="bookmark-item-page">გვ. {bm.page_number}</span>
                <div className="bookmark-item-actions" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditingId(bm.id); setEditNote(bm.note || ""); }} className="bookmark-action-btn" title="რედაქტირება">
                    <span className="material-symbols-rounded">edit</span>
                  </button>
                  <button onClick={() => handleDelete(bm.id)} className="bookmark-action-btn bookmark-action-delete" title="წაშლა">
                    <span className="material-symbols-rounded">delete</span>
                  </button>
                </div>
              </div>
              {editingId === bm.id ? (
                <div className="bookmark-edit-area" onClick={e => e.stopPropagation()}>
                  <textarea
                    className="bookmark-note-input"
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                    rows={2}
                    autoFocus
                  />
                  <div className="bookmark-edit-buttons">
                    <button onClick={() => handleUpdate(bm.id)} className="bookmark-save-btn">შენახვა</button>
                    <button onClick={() => setEditingId(null)} className="bookmark-cancel-btn">გაუქმება</button>
                  </div>
                </div>
              ) : bm.note ? (
                <p className="bookmark-item-note">{bm.note}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookmarkPanel;
