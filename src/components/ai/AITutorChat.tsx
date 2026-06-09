import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat } from '@/hooks/useAIChat';
import { useUserCredits, useHasPurchasedBook } from '@/hooks/useCredits';
import { 
  useConversationMessages, 
  useCreateConversation,
  useSaveMessage 
} from '@/hooks/useAIChatHistory';
import { Link } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';
import ConversationSidebar from './ConversationSidebar';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import logoImg from '@/assets/logo.png';

interface AITutorChatProps {
  bookId?: string;
  isWidget?: boolean;
  onClose?: () => void;
  defaultFullscreen?: boolean;
}

const AITutorChat = ({ bookId, isWidget = false, onClose, defaultFullscreen = false }: AITutorChatProps) => {
  const AI_NAME = 'CodeZero AI';
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(defaultFullscreen);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, clearMessages, setMessages, setConversationId } = useAIChat(bookId);
  const { data: userCredits } = useUserCredits();
  const { data: hasPurchased } = useHasPurchasedBook();
  const { data: historyMessages } = useConversationMessages(currentConversationId);
  const createConversation = useCreateConversation();
  const saveMessage = useSaveMessage();

  // Sync conversationId to useAIChat so backend loads history from DB
  useEffect(() => {
    setConversationId(currentConversationId);
  }, [currentConversationId, setConversationId]);

  // Load history when a conversation is selected
  useEffect(() => {
    if (currentConversationId && historyMessages && historyMessages.length > 0) {
      setMessages(historyMessages.map(m => ({
        role: m.role,
        content: m.content,
      })));
    }
  }, [currentConversationId, historyMessages, setMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Save assistant response after streaming completes
  const lastMessageRef = useRef<string>('');
  useEffect(() => {
    if (!isLoading && messages.length > 0 && currentConversationId) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.content && lastMsg.content !== lastMessageRef.current) {
        lastMessageRef.current = lastMsg.content;
        saveMessage.mutate({ 
          conversationId: currentConversationId, 
          role: 'assistant', 
          content: lastMsg.content, 
          bookId 
        });
      }
    }
  }, [isLoading, messages, currentConversationId, bookId, saveMessage]);

  const isSubmittingRef = useRef(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmittingRef.current || !input.trim() || isLoading) {
      return;
    }
    
    isSubmittingRef.current = true;
    const messageContent = input.trim();
    setInput('');
    
    let convId = currentConversationId;
    
    // Create a new conversation if none exists
    if (!convId) {
      try {
        const newConv = await createConversation.mutateAsync(
          messageContent.slice(0, 50) // Use first 50 chars as title
        );
        convId = newConv.id;
        setCurrentConversationId(convId);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        isSubmittingRef.current = false;
        return;
      }
    }
    
    // Save user message to database (for history)
    saveMessage.mutate({
      conversationId: convId,
      role: 'user',
      content: messageContent,
      bookId,
    });
    
    // Send to AI (this will add the message to the UI state)
    await sendMessage(messageContent);
    
    // Reset submission lock
    isSubmittingRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    clearMessages();
    lastMessageRef.current = '';
  };

  const handleSelectConversation = (id: string | null) => {
    if (id !== currentConversationId) {
      setCurrentConversationId(id);
      if (!id) {
        clearMessages();
      }
      lastMessageRef.current = '';
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = async (content: string, messageIdx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageIdx);
      toast.success('დაკოპირდა!');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast.error('კოპირება ვერ მოხერხდა');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Close fullscreen on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (!user) {
    return (
      <div className={`ai-chat-container ${isWidget ? 'widget' : 'fullpage'}`}>
        <div className="ai-empty-state">
          <div className="ai-empty-icon">
            <span className="material-symbols-rounded">smart_toy</span>
          </div>
          <h3>{AI_NAME}</h3>
          <p>გთხოვთ გაიაროთ ავტორიზაცია</p>
          <Link to="/auth" className="btn btn-gold">შესვლა</Link>
        </div>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className={`ai-chat-container ${isWidget ? 'widget' : 'fullpage'}`}>
        <div className="ai-empty-state">
          <div className="ai-empty-icon">
            <span className="material-symbols-rounded">smart_toy</span>
          </div>
          <h3>{AI_NAME}</h3>
          <p>ხელმისაწვდომია მხოლოდ წიგნის შეძენის შემდეგ</p>
          <Link to="/books" className="btn btn-gold">წიგნების ნახვა</Link>
        </div>
      </div>
    );
  }

  const credits = userCredits?.credits ?? 0;

  // Fullscreen overlay
  if (isFullscreen) {
    const overlay = (
      <div className="ai-fullscreen-overlay">
        <div className={`ai-fullscreen-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {/* Sidebar */}
          <ConversationSidebar
            selectedConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className="ai-chat-container fullscreen">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-left">
              <button 
                type="button"
                className="ai-header-btn history" 
                onClick={() => setIsSidebarOpen(true)}
                title="საუბრების ისტორია"
              >
                <span className="material-symbols-rounded">menu</span>
              </button>
              <div className="ai-avatar">
                <img src={logoImg} alt="CodeZero AI" className="ai-avatar-img" />
              </div>
              <div className="ai-header-info">
                <span className="ai-header-title">{AI_NAME}</span>
                <span className="ai-header-credits">
                  <span className="material-symbols-rounded">toll</span>
                  {credits} კრედიტი
                </span>
              </div>
            </div>
            <div className="ai-chat-header-right">
              {credits < 10 && (
                <Link to="/credits" className="ai-header-btn buy">
                  <span className="material-symbols-rounded">add_circle</span>
                  <span>შეიძინე</span>
                </Link>
              )}
              {messages.length > 0 && (
                <button type="button" className="ai-header-btn" onClick={handleNewChat} title="ახალი საუბარი">
                  <span className="material-symbols-rounded">edit_square</span>
                </button>
              )}
              <button 
                type="button"
                className="ai-header-btn" 
                onClick={() => setIsFullscreen(false)} 
                title="გამოსვლა სრული ეკრანიდან (ESC)"
              >
                <span className="material-symbols-rounded">fullscreen_exit</span>
              </button>
              <button
                type="button"
                className="ai-header-btn close"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFullscreen(false);
                  if (isWidget && onClose) {
                    onClose();
                  }
                }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
              </div>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="ai-welcome">
                  <div className="ai-welcome-badge">
                    <span className="material-symbols-rounded">verified</span>
                    პრემიუმ AI
                  </div>
                  <div className="ai-welcome-icon">
                    <img src={logoImg} alt="CodeZero AI" className="ai-welcome-logo" />
                  </div>
                  <h3>გამარჯობა!</h3>
                  <p>მე ვარ {AI_NAME} — შენი პირადი AI მენტორი პროგრამირებაში. მზად ვარ დაგეხმარო.</p>
                  <div className="ai-capabilities">
                    <div className="ai-capability">
                      <span className="material-symbols-rounded">code</span>
                      <span>კოდის წერა</span>
                    </div>
                    <div className="ai-capability">
                      <span className="material-symbols-rounded">bug_report</span>
                      <span>შეცდომების გასწორება</span>
                    </div>
                    <div className="ai-capability">
                      <span className="material-symbols-rounded">school</span>
                      <span>კონცეფციების ახსნა</span>
                    </div>
                  </div>
                  <div className="ai-suggestions">
                    <button 
                      onClick={() => { setInput('როგორ დავიწყო პროგრამირების სწავლა?'); }}
                      className="ai-suggestion"
                    >
                      <span className="material-symbols-rounded">lightbulb</span>
                      როგორ დავიწყო პროგრამირება?
                    </button>
                    <button 
                      onClick={() => { setInput('დამიწერე Hello World პროგრამა Python-ზე'); }}
                      className="ai-suggestion"
                    >
                      <span className="material-symbols-rounded">terminal</span>
                      Hello World პროგრამა
                    </button>
                    <button 
                      onClick={() => { setInput('ახსენი რა არის ფუნქცია პროგრამირებაში'); }}
                      className="ai-suggestion"
                    >
                      <span className="material-symbols-rounded">functions</span>
                      რა არის ფუნქცია?
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ai-messages-list">
                  {messages.map((msg, idx) => {
                    const isStreaming = isLoading && msg.role === 'assistant' && idx === messages.length - 1;
                    return (
                      <div key={idx} className={`ai-message ${msg.role}${isStreaming ? ' streaming' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="ai-message-avatar">
                            <img src={logoImg} alt="CodeZero AI" className="ai-avatar-img" />
                          </div>
                        )}
                        <div className="ai-message-bubble">
                          {msg.role === 'assistant' ? (
                            msg.content ? (
                              <>
                                <MarkdownRenderer content={msg.content} />
                                {!isStreaming && (
                                  <button
                                    type="button"
                                    className="ai-copy-btn"
                                    onClick={() => handleCopyMessage(msg.content, idx)}
                                    title="დაკოპირება"
                                  >
                                    {copiedMessageId === idx ? (
                                      <Check size={14} />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                )}
                              </>
                            ) : isLoading && idx === messages.length - 1 ? (
                              <div className="ai-typing">
                                <div className="ai-typing-indicator">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                                <span className="ai-typing-text">AI წერს...</span>
                              </div>
                            ) : null
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            {credits > 0 ? (
              <form className="ai-chat-input-container" onSubmit={handleSubmit}>
                <div className="ai-input-wrapper">
                  <textarea
                    ref={inputRef}
                    className="ai-input"
                    placeholder="დაწერე შეკითხვა..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="ai-send-btn"
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <span className="material-symbols-rounded spinning">progress_activity</span>
                    ) : (
                      <span className="material-symbols-rounded">arrow_upward</span>
                    )}
                  </button>
                </div>
                <p className="ai-input-hint">
                  <span className="material-symbols-rounded">info</span>
                  1 შეტყობინება = 1 კრედიტი
                </p>
              </form>
            ) : (
              <div className="ai-no-credits">
                <span className="material-symbols-rounded">toll</span>
                <span>კრედიტები ამოიწურა</span>
                <Link to="/credits" className="btn btn-gold btn-sm">შეიძინე</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // Ensure fullscreen overlay is truly fullscreen even when launched from the widget container
    return typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay;
  }

  // Normal (non-fullscreen) view
  return (
    <div className={`ai-chat-wrapper ${isWidget ? 'widget' : 'fullpage'}`}>
      {/* Sidebar for history - only in fullpage mode */}
      {!isWidget && (
        <ConversationSidebar
          selectedConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`ai-chat-container ${isWidget ? 'widget' : 'fullpage'}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            {!isWidget && (
              <button 
                type="button"
                className="ai-header-btn history" 
                onClick={() => setIsSidebarOpen(true)}
                title="საუბრების ისტორია"
              >
                <span className="material-symbols-rounded">menu</span>
              </button>
            )}
            <div className="ai-avatar">
              <img src={logoImg} alt="CodeZero AI" className="ai-avatar-img" />
            </div>
            <div className="ai-header-info">
              <span className="ai-header-title">{AI_NAME}</span>
              <span className="ai-header-credits">
                <span className="material-symbols-rounded">toll</span>
                {credits} კრედიტი
              </span>
            </div>
          </div>
          <div className="ai-chat-header-right">
            {credits < 10 && (
              <Link to="/credits" className="ai-header-btn buy">
                <span className="material-symbols-rounded">add_circle</span>
                <span>შეიძინე</span>
              </Link>
            )}
            {messages.length > 0 && (
              <button type="button" className="ai-header-btn" onClick={handleNewChat} title="ახალი საუბარი">
                <span className="material-symbols-rounded">edit_square</span>
              </button>
            )}
            {/* Fullscreen toggle */}
            <button 
              type="button"
              className="ai-header-btn" 
              onClick={() => setIsFullscreen(true)} 
              title="სრულ ეკრანზე გახსნა"
            >
              <span className="material-symbols-rounded">fullscreen</span>
            </button>
            {/* Close button - always show in widget mode */}
            {isWidget && (
              <button 
                type="button" 
                className="ai-header-btn close" 
                onClick={() => {
                  if (onClose) onClose();
                }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="ai-welcome">
              <div className="ai-welcome-badge">
                <span className="material-symbols-rounded">verified</span>
                პრემიუმ AI
              </div>
              <div className="ai-welcome-icon">
                <img src={logoImg} alt="CodeZero AI" className="ai-welcome-logo" />
              </div>
              <h3>გამარჯობა!</h3>
              <p>მე ვარ შენი პირადი AI ტუტორი პროგრამირებაში. მზად ვარ დაგეხმარო.</p>
              <div className="ai-capabilities">
                <div className="ai-capability">
                  <span className="material-symbols-rounded">code</span>
                  <span>კოდის წერა</span>
                </div>
                <div className="ai-capability">
                  <span className="material-symbols-rounded">bug_report</span>
                  <span>შეცდომების გასწორება</span>
                </div>
                <div className="ai-capability">
                  <span className="material-symbols-rounded">school</span>
                  <span>კონცეფციების ახსნა</span>
                </div>
              </div>
              <div className="ai-suggestions">
                <button 
                  onClick={() => { setInput('როგორ დავიწყო პროგრამირების სწავლა?'); }}
                  className="ai-suggestion"
                >
                  <span className="material-symbols-rounded">lightbulb</span>
                  როგორ დავიწყო პროგრამირება?
                </button>
                <button 
                  onClick={() => { setInput('დამიწერე Hello World პროგრამა Python-ზე'); }}
                  className="ai-suggestion"
                >
                  <span className="material-symbols-rounded">terminal</span>
                  Hello World პროგრამა
                </button>
                <button 
                  onClick={() => { setInput('ახსენი რა არის ფუნქცია პროგრამირებაში'); }}
                  className="ai-suggestion"
                >
                  <span className="material-symbols-rounded">functions</span>
                  რა არის ფუნქცია?
                </button>
              </div>
            </div>
          ) : (
            <div className="ai-messages-list">
              {messages.map((msg, idx) => {
                const isStreaming = isLoading && msg.role === 'assistant' && idx === messages.length - 1;
                return (
                  <div key={idx} className={`ai-message ${msg.role}${isStreaming ? ' streaming' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="ai-message-avatar">
                        <img src={logoImg} alt="CodeZero AI" className="ai-avatar-img" />
                      </div>
                    )}
                    <div className="ai-message-bubble">
                      {msg.role === 'assistant' ? (
                        msg.content ? (
                          <>
                            <MarkdownRenderer content={msg.content} />
                            {!isStreaming && (
                              <button
                                type="button"
                                className="ai-copy-btn"
                                onClick={() => handleCopyMessage(msg.content, idx)}
                                title="დაკოპირება"
                              >
                                {copiedMessageId === idx ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            )}
                          </>
                        ) : isLoading && idx === messages.length - 1 ? (
                          <div className="ai-typing">
                            <div className="ai-typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <span className="ai-typing-text">AI წერს...</span>
                          </div>
                        ) : null
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {credits > 0 ? (
          <form className="ai-chat-input-container" onSubmit={handleSubmit}>
            <div className="ai-input-wrapper">
              <textarea
                ref={inputRef}
                className="ai-input"
                placeholder="დაწერე შეკითხვა..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />
              <button
                type="submit"
                className="ai-send-btn"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <span className="material-symbols-rounded spinning">progress_activity</span>
                ) : (
                  <span className="material-symbols-rounded">arrow_upward</span>
                )}
              </button>
            </div>
            <p className="ai-input-hint">
              <span className="material-symbols-rounded">info</span>
              1 შეტყობინება = 1 კრედიტი
            </p>
          </form>
        ) : (
          <div className="ai-no-credits">
            <span className="material-symbols-rounded">toll</span>
            <span>კრედიტები ამოიწურა</span>
            <Link to="/credits" className="btn btn-gold btn-sm">შეიძინე</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutorChat;
