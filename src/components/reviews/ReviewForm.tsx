import { useState } from 'react';
import StarRating from './StarRating';
import { useCreateReview, useUpdateReview, useDeleteReview, Review } from '@/hooks/useReviews';
import { toast } from 'sonner';

interface ReviewFormProps {
  bookId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

const ReviewForm = ({ bookId, existingReview, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isEditing, setIsEditing] = useState(!existingReview);

  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('გთხოვთ აირჩიოთ რეიტინგი');
      return;
    }

    try {
      if (existingReview) {
        await updateReview.mutateAsync({
          id: existingReview.id,
          rating,
          reviewText: reviewText.trim(),
          bookId
        });
        toast.success('შეფასება განახლდა!');
        setIsEditing(false);
      } else {
        await createReview.mutateAsync({
          bookId,
          rating,
          reviewText: reviewText.trim()
        });
        toast.success('შეფასება გაიგზავნა!');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'შეფასების გაგზავნა ვერ მოხერხდა');
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    try {
      await deleteReview.mutateAsync({ id: existingReview.id, bookId });
      toast.success('შეფასება წაიშალა');
      setRating(0);
      setReviewText('');
      setIsEditing(true);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'შეფასების წაშლა ვერ მოხერხდა');
    }
  };

  const isPending = createReview.isPending || updateReview.isPending || deleteReview.isPending;

  if (existingReview && !isEditing) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>შენი შეფასება</p>
            <StarRating rating={existingReview.rating} readonly size="md" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-ghost"
              style={{ padding: '8px 16px' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
              რედაქტირება
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="btn btn-ghost"
              style={{ padding: '8px 16px', color: 'var(--error)' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
            </button>
          </div>
        </div>
        {existingReview.review_text && (
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{existingReview.review_text}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px'
    }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--text-white)', marginBottom: '16px' }}>
        {existingReview ? 'შეფასების რედაქტირება' : 'დაწერე შეფასება'}
      </h4>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>
          შენი რეიტინგი *
        </label>
        <StarRating rating={rating} onRate={setRating} size="lg" />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>
          შენი შეფასება (არასავალდებულო)
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="გაუზიარე შენი აზრი ამ წიგნზე..."
          maxLength={1000}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-white)',
            fontSize: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', textAlign: 'right' }}>
          {reviewText.length}/1000
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="btn btn-gold"
        >
          {isPending ? (
            <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded">send</span>
              {existingReview ? 'შეფასების განახლება' : 'შეფასების გაგზავნა'}
            </>
          )}
        </button>
        {existingReview && isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setRating(existingReview.rating);
              setReviewText(existingReview.review_text || '');
            }}
            className="btn btn-ghost"
          >
            გაუქმება
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;