import { Review } from '@/hooks/useReviews';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
}

const ReviewList = ({ reviews, isLoading }: ReviewListProps) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--gold)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px', display: 'block' }}>
          rate_review
        </span>
        <p style={{ color: 'var(--text-muted)' }}>ჯერ არ არის შეფასებები. იყავი პირველი!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--gold-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {review.profile?.avatar_url ? (
                <img
                  src={review.profile.avatar_url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--gold)' }}>
                  person
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px' }}>
                    {review.profile?.full_name || 'ანონიმური'}
                  </p>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ka })}
                </span>
              </div>
            </div>
          </div>
          {review.review_text && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginLeft: '60px' }}>
              {review.review_text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;