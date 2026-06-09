import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHasPurchasedBook, useUserCredits } from '@/hooks/useCredits';
import AITutorChat from './AITutorChat';

interface AITutorWidgetProps {
  bookId?: string;
}

const AITutorWidget = ({ bookId }: AITutorWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { data: hasPurchased } = useHasPurchasedBook();
  const { data: userCredits } = useUserCredits();

  // Only show widget if user has purchased a book
  if (!user || !hasPurchased) return null;

  const credits = userCredits?.credits ?? 0;

  return (
    <>
      <button
        type="button"
        className={`ai-widget-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="AI ტუტორი"
      >
        <span className="material-symbols-rounded">psychology</span>
        {credits > 0 && <span className="ai-widget-badge">{credits}</span>}
      </button>

      <div className={`ai-widget-container ${isOpen ? 'open' : ''}`}>
        <AITutorChat 
          bookId={bookId} 
          isWidget={true} 
          onClose={() => setIsOpen(false)} 
        />
      </div>
    </>
  );
};

export default AITutorWidget;
