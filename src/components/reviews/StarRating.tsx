interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const StarRating = ({ rating, onRate, size = 'md', readonly = false }: StarRatingProps) => {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRate?.(star)}
          disabled={readonly}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readonly ? 'default' : 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => !readonly && (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => !readonly && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: sizes[size],
              color: star <= rating ? 'var(--gold)' : 'var(--text-muted)',
              fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0"
            }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
