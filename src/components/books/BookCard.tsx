import { Link, useNavigate } from 'react-router-dom';
import { Book } from '@/hooks/useBooks';
import { ReadingProgress } from '@/hooks/useReadingProgress';

interface BookCardProps {
  book: Book;
  showOwnedBadge?: boolean;
  readingProgress?: ReadingProgress | null;
}

const BookCard = ({ book, showOwnedBadge, readingProgress }: BookCardProps) => {
  const navigate = useNavigate();
  // Calculate progress percentage
  const progressPercent = readingProgress && book.pages 
    ? Math.min(Math.round((readingProgress.last_page / book.pages) * 100), 100)
    : 0;

  const isCompleted = progressPercent === 100;

  return (
    <Link 
      to={showOwnedBadge ? `/read/${book.id}` : `/books/${book.id}`} 
      className="group relative flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden transition-all duration-500 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 min-w-0"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-transparent group-hover:to-purple-600/5 rounded-2xl transition-all duration-500 pointer-events-none" />
      
      {/* Cover Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
        {book.cover_url ? (
          <img 
            src={book.cover_url} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
            <span className="material-symbols-rounded text-6xl text-muted-foreground/50">menu_book</span>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          {showOwnedBadge && isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-lg">
              <span className="material-symbols-rounded text-sm">check_circle</span>
              წაკითხული
            </span>
          ) : showOwnedBadge ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-700 text-white backdrop-blur-sm shadow-lg">
              <span className="material-symbols-rounded text-sm">verified</span>
              შეძენილი
            </span>
          ) : book.is_new ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/90 text-white backdrop-blur-sm shadow-lg animate-pulse">
              <span className="material-symbols-rounded text-sm">fiber_new</span>
              ახალი
            </span>
          ) : book.is_free ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-lg">
              <span className="material-symbols-rounded text-sm">redeem</span>
              უფასო
            </span>
          ) : book.is_popular ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/90 text-white backdrop-blur-sm shadow-lg">
              <span className="material-symbols-rounded text-sm">local_fire_department</span>
              პოპულარული
            </span>
          ) : null}
        </div>

        {/* Reading Progress Overlay */}
        {showOwnedBadge && readingProgress && progressPercent > 0 && !isCompleted && (
          <div className="absolute top-3 right-3 z-10">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-background/30"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${progressPercent * 1.26} 126`}
                  strokeLinecap="round"
                  className="text-purple-600"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                {progressPercent}%
              </span>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
          {!showOwnedBadge && book.pdf_url && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/read/${book.id}?preview=true`);
              }}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm text-foreground shadow-lg border border-white/10 hover:bg-primary/20 hover:border-primary/30 transition-all"
              title="დაათვალიერე"
            >
              <span className="material-symbols-rounded text-lg">visibility</span>
            </button>
          )}
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-700 text-white shadow-lg">
            <span className="material-symbols-rounded">
              {showOwnedBadge ? 'auto_stories' : 'arrow_forward'}
            </span>
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="relative flex flex-col flex-1 p-4 z-10">
        {/* Meta line: file tag + category */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20">
            <span>[</span>
            {book.category?.name?.slice(0, 12) || 'book'}
            <span>]</span>
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/70">.pdf</span>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
          {book.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
          <span className="material-symbols-rounded text-sm">person</span>
          {book.author}
        </p>
        
        {/* Progress Bar for owned books */}
        {showOwnedBadge && readingProgress && progressPercent > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">პროგრესი</span>
              <span className={`font-medium ${isCompleted ? 'text-emerald-500' : 'text-purple-600'}`}>
                {isCompleted ? 'დასრულებული!' : `${readingProgress.last_page}/${book.pages || '?'} გვ.`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
          {showOwnedBadge ? (
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              isCompleted ? 'text-emerald-500' : 'text-purple-600'
            }`}>
              <span className="material-symbols-rounded text-lg">
                {isCompleted ? 'replay' : readingProgress && readingProgress.last_page > 1 ? 'play_arrow' : 'auto_stories'}
              </span>
              {isCompleted ? 'თავიდან' : readingProgress && readingProgress.last_page > 1 ? 'გაგრძელება' : 'კითხვა'}
            </span>
          ) : (
            <span className={`text-lg font-bold ${book.is_free ? 'text-emerald-500' : 'text-foreground'}`}>
              {book.is_free ? 'უფასო' : `${book.price.toFixed(2)} ₾`}
            </span>
          )}
          
          <div className="flex items-center gap-3">
            {book.pages && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="material-symbols-rounded text-sm">description</span>
                {book.pages}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm">
              <span className="material-symbols-rounded text-purple-600 text-base">star</span>
              <span className="font-medium text-foreground">{book.rating?.toFixed(1) || '0.0'}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;