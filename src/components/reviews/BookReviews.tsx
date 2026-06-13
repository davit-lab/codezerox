import { useAuth } from '@/hooks/useAuth';
import { useBookReviews, useUserReview } from '@/hooks/useReviews';
import { usePurchase } from '@/hooks/usePurchases';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { Link } from 'react-router-dom';

interface BookReviewsProps {
  bookId: string;
  isFree?: boolean;
}

const BookReviews = ({ bookId, isFree }: BookReviewsProps) => {
  const { user } = useAuth();
  const { data: reviews, isLoading: reviewsLoading } = useBookReviews(bookId);
  const { data: userReview } = useUserReview(bookId, user?.id);
  const { data: purchase } = usePurchase(bookId);

  const hasPurchased = !!purchase || isFree;
  const canReview = user && hasPurchased;

  return (
    <div style={{ marginTop: '60px' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.5rem',
        color: 'var(--text-white)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--gold)' }}>reviews</span>
        შეფასებები
        {reviews && reviews.length > 0 && (
          <span style={{
            background: 'var(--gold-glow)',
            color: 'var(--gold)',
            fontSize: '0.875rem',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)'
          }}>
            {reviews.length}
          </span>
        )}
      </h3>

      {/* Review Form or Auth Prompt */}
      {canReview ? (
        <div style={{ marginBottom: '32px' }}>
          <ReviewForm bookId={bookId} existingReview={userReview} />
        </div>
      ) : user ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>
            lock
          </span>
          <p style={{ color: 'var(--text-muted)' }}>შეიძინე ეს წიგნი შეფასების დასატოვებლად</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>
            login
          </span>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>შედი სისტემაში შეფასების დასატოვებლად</p>
          <Link to="/auth" className="btn btn-gold">
            <span className="material-symbols-rounded">login</span>
            შესვლა
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <ReviewList reviews={reviews || []} isLoading={reviewsLoading} />
    </div>
  );
};

export default BookReviews;