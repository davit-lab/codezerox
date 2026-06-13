import { useState } from 'react';
import { 
  useAIConversations, 
  useClearAIHistory, 
  useRenameConversation, 
  useDeleteConversation 
} from '@/hooks/useAIChatHistory';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ConversationSidebar = ({ 
  selectedConversationId, 
  onSelectConversation,
  onNewChat,
  isOpen, 
  onClose 
}: ConversationSidebarProps) => {
  const { data: conversations, isLoading } = useAIConversations();
  const clearHistory = useClearAIHistory();
  const renameConversation = useRenameConversation();
  const deleteConversation = useDeleteConversation();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleClearAll = async () => {
    if (window.confirm('ნამდვილად გსურთ ყველა საუბრის წაშლა?')) {
      await clearHistory.mutateAsync();
      onNewChat();
    }
  };

  const handleStartRename = (conv: { id: string; title: string }) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async () => {
    if (editingId && editTitle.trim()) {
      await renameConversation.mutateAsync({ id: editingId, title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('ნამდვილად გსურთ ამ საუბრის წაშლა?')) {
      await deleteConversation.mutateAsync(id);
      if (selectedConversationId === id) {
        onNewChat();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'დღეს';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'გუშინ';
    }
    
    return formatDistanceToNow(date, { addSuffix: true, locale: ka });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="ai-sidebar-overlay"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}
      
      <div className={`ai-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="ai-sidebar-header">
          <h3>
            <span className="material-symbols-rounded">history</span>
            საუბრების ისტორია
          </h3>
          <button
            type="button"
            className="ai-sidebar-close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <button type="button" className="ai-new-chat-btn" onClick={handleNewChat}>
          <span className="material-symbols-rounded">add</span>
          ახალი საუბარი
        </button>

        <div className="ai-conversations-list">
          {isLoading ? (
            <div className="ai-sidebar-loading">
              <span className="material-symbols-rounded spinning">progress_activity</span>
              <span>იტვირთება...</span>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`ai-conversation-item ${selectedConversationId === conv.id ? 'active' : ''}`}
              >
                {editingId === conv.id ? (
                  <div className="ai-conv-edit">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      autoFocus
                      className="ai-conv-edit-input"
                    />
                    <button 
                      type="button"
                      className="ai-conv-edit-btn save" 
                      onClick={handleSaveRename}
                      title="შენახვა"
                    >
                      <span className="material-symbols-rounded">check</span>
                    </button>
                    <button 
                      type="button"
                      className="ai-conv-edit-btn cancel" 
                      onClick={handleCancelRename}
                      title="გაუქმება"
                    >
                      <span className="material-symbols-rounded">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="ai-conv-main"
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onClose();
                      }}
                    >
                      <div className="ai-conv-icon">
                        <span className="material-symbols-rounded">chat</span>
                      </div>
                      <div className="ai-conv-content">
                        <span className="ai-conv-title">
                          {conv.title.length > 35 ? conv.title.slice(0, 35) + '...' : conv.title}
                        </span>
                        <span className="ai-conv-meta">
                          {formatDate(conv.updated_at)} • {conv.message_count} შეტყობინება
                        </span>
                      </div>
                    </button>
                    <div className="ai-conv-actions">
                      <button 
                        type="button"
                        className="ai-conv-action-btn"
                        onClick={() => handleStartRename(conv)}
                        title="სახელის შეცვლა"
                      >
                        <span className="material-symbols-rounded">edit</span>
                      </button>
                      <button 
                        type="button"
                        className="ai-conv-action-btn delete"
                        onClick={() => handleDelete(conv.id)}
                        title="წაშლა"
                      >
                        <span className="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="ai-sidebar-empty">
              <span className="material-symbols-rounded">forum</span>
              <span>საუბრები არ არის</span>
            </div>
          )}
        </div>

        {conversations && conversations.length > 0 && (
          <div className="ai-sidebar-footer">
            <button 
              type="button"
              className="ai-clear-history-btn" 
              onClick={handleClearAll}
              disabled={clearHistory.isPending}
            >
              <span className="material-symbols-rounded">delete_sweep</span>
              ისტორიის გასუფთავება
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ConversationSidebar;
