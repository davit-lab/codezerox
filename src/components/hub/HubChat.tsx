import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useCommunityMessages,
  useSendCommunityMessage,
  useToggleReaction,
  useDeleteMessage,
  useOnlineUsers,
  CommunityMessage,
  ChannelType,
} from '@/hooks/useCommunityChat';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Hash, Code, HelpCircle, Send, Reply, Trash2,
  SmilePlus, Users, ArrowDown, X, Link as LinkIcon,
  ExternalLink, Plus, MessageSquare,
} from 'lucide-react';
import hubChatBgDefault from '@/assets/hub-chat-bg.jpg';
import { useHeroBanner } from '@/hooks/useHeroBanners';

const CHANNELS = [
  { id: 'general' as const, name: 'ზოგადი', icon: Hash, desc: 'ზოგადი დისკუსია', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'projects' as const, name: 'პროექტები', icon: Code, desc: 'პროექტების გაზიარება', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'help' as const, name: 'დახმარება', icon: HelpCircle, desc: 'კითხვები და პასუხები', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const HubChat = () => {
  const { user, isAdmin } = useAuth();
  const [activeChannel, setActiveChannel] = useState<ChannelType>('general');
  const { data: messages = [], isLoading: messagesLoading } = useCommunityMessages(activeChannel);
  const sendMessage = useSendCommunityMessage();
  const toggleReaction = useToggleReaction();
  const deleteMessage = useDeleteMessage();
  const onlineUsers = useOnlineUsers();
  const { data: hubBannerData } = useHeroBanner('hub_chat');
  const hubChatBg = hubBannerData?.image_url || hubChatBgDefault;

  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'project' | 'question'>('text');
  const [projectUrl, setProjectUrl] = useState('');
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCount = useRef(0);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [content]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 200);
  };

  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, msg) => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    }, {} as Record<string, CommunityMessage[]>);
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await sendMessage.mutateAsync({
        content: content.trim(),
        messageType,
        projectUrl: messageType === 'project' ? projectUrl : undefined,
        channel: activeChannel,
        replyTo: replyTo?.id,
      });
      setContent('');
      setProjectUrl('');
      setReplyTo(null);
      if (textareaRef.current) textareaRef.current.style.height = '44px';
    } catch {
      toast.error('შეტყობინება ვერ გაიგზავნა');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape' && replyTo) setReplyTo(null);
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'დღეს';
    if (date.toDateString() === yesterday.toDateString()) return 'გუშინ';
    return date.toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getReactionCount = (msg: CommunityMessage, type: string) => msg.reactions?.filter((r) => r.reaction_type === type).length || 0;
  const hasUserReacted = (msg: CommunityMessage, type: string) => msg.reactions?.some((r) => r.reaction_type === type && r.user_id === user?.id) || false;
  const currentChannel = CHANNELS.find(c => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Channel Switcher Bar */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeChannel === ch.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <ch.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{ch.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/30 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.06]">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {onlineUsers.length} ონლაინ
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              showMembers ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Channel description */}
          <div className="px-5 py-2.5 border-b border-white/[0.04] flex items-center gap-2 bg-white/[0.01]">
            <currentChannel.icon className={`w-4 h-4 ${currentChannel.color}`} />
            <span className="text-xs text-white/40">{currentChannel.desc}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/20">{messages.length} შეტყობინება</span>
            </div>
          </div>

          {/* Messages list */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-1 relative hub-chat-messages"
            style={{ backgroundImage: `url(${hubChatBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="hub-chat-messages-overlay" />
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-white/40">იტვირთება...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                    <currentChannel.icon className={`w-8 h-8 ${currentChannel.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">#{currentChannel.name}</h3>
                    <p className="text-sm text-white/40">ეს არის არხის დასაწყისი. დაიწყე საუბარი!</p>
                  </div>
                </div>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">{formatDate(msgs[0].created_at)}</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  {msgs.map((msg, idx) => {
                    const isOwn = msg.user_id === user?.id;
                    const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                    const showHeader = !prevMsg || prevMsg.user_id !== msg.user_id ||
                      new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000;

                    return (
                      <div
                        key={msg.id}
                        className={`group relative flex gap-3 py-1.5 px-3 -mx-3 rounded-xl hub-msg-row transition-all ${!showHeader ? 'mt-0' : 'mt-3'}`}
                      >
                        {showHeader ? (
                          <Avatar className="w-9 h-9 mt-0.5 flex-shrink-0 ring-2 ring-purple-500/10">
                            <AvatarImage src={msg.profile?.avatar_url || undefined} />
                            <AvatarFallback className="hub-avatar-fallback text-xs font-bold">
                              {(msg.profile?.full_name || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-9 flex-shrink-0 flex items-center justify-center">
                            <span className="text-[10px] text-white/0 group-hover:text-white/30 transition-colors">{formatTime(msg.created_at)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {showHeader && (
                            <div className="flex items-center gap-2 mb-0.5">
                              <Link to={`/user/${msg.user_id}`} className="font-semibold text-sm text-white hover:text-purple-300 transition-colors cursor-pointer">
                                {msg.profile?.full_name || 'მომხმარებელი'}
                              </Link>
                              {msg.message_type === 'project' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 uppercase tracking-wider">პროექტი</span>
                              )}
                              {msg.message_type === 'question' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 uppercase tracking-wider">კითხვა</span>
                              )}
                              <span className="text-[11px] text-white/25">{formatTime(msg.created_at)}</span>
                            </div>
                          )}
                          {msg.replied_message && (
                            <div className="flex items-center gap-1.5 mb-1 text-xs text-white/30">
                              <Reply className="w-3 h-3 rotate-180" />
                              <span className="font-medium text-purple-400/70">{msg.replied_message.profile?.full_name || 'მომხმარებელი'}</span>
                              <span className="truncate max-w-[200px]">{msg.replied_message.content}</span>
                            </div>
                          )}
                          <p className="text-sm text-white/85 leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                          {msg.project_url && (
                            <a href={msg.project_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300 hover:bg-purple-500/20 transition-colors">
                              <LinkIcon className="w-3 h-3" />
                              <span className="truncate max-w-[250px]">{msg.project_url}</span>
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                          )}
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {(['like', 'helpful', 'fire'] as const).map(type => {
                              const count = type === 'like' ? (msg.upvote_count || getReactionCount(msg, type)) : getReactionCount(msg, type);
                              const reacted = hasUserReacted(msg, type);
                              const icons = { like: '👍', helpful: '💡', fire: '🔥' };
                              if (count === 0 && type !== 'like') return null;
                              return (
                                <button key={type}
                                  onClick={() => toggleReaction.mutate({ messageId: msg.id, reactionType: type })}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all ${
                                    reacted ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300' : 'bg-white/[0.05] border border-transparent text-white/40 hover:bg-white/[0.08]'
                                  }`}>
                                  <span className="text-xs">{icons[type]}</span>
                                  {count > 0 && <span>{count}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="absolute right-2 -top-3 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 bg-[#111116] border border-white/10 rounded-lg shadow-lg p-0.5">
                          <button onClick={() => toggleReaction.mutate({ messageId: msg.id, reactionType: 'like' })} className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors" title="რეაქცია">
                            <SmilePlus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setReplyTo(msg)} className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors" title="პასუხი">
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          {(isOwn || isAdmin) && (
                            <button onClick={() => deleteMessage.mutate(msg.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors" title="წაშლა">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollDown && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
              <button onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-medium hover:bg-purple-500 transition-colors">
                <ArrowDown className="w-3 h-3" /> ახალი შეტყობინებები
              </button>
            </div>
          )}

          {/* Input */}
          <div className="hub-chat-input-area p-3 md:p-4 border-t border-white/[0.06]">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-purple-500/5 border border-purple-500/10 rounded-lg text-xs">
                <Reply className="w-3 h-3 text-purple-400" />
                <span className="text-white/40">პასუხი</span>
                <span className="font-semibold text-white">{replyTo.profile?.full_name || 'მომხმარებელს'}</span>
                <button onClick={() => setReplyTo(null)} className="ml-auto text-white/40 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button onClick={() => setMessageType(messageType === 'project' ? 'text' : 'project')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  messageType === 'project' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60'
                }`}>
                <Plus className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                {messageType === 'project' && (
                  <input type="url" placeholder="პროექტის URL..." value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="w-full px-4 py-2 mb-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
                )}
                <textarea ref={textareaRef} placeholder={`შეტყობინება #${currentChannel.name}-ში...`}
                  value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleKeyDown} rows={1}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none"
                  style={{ minHeight: '44px', maxHeight: '160px' }} />
              </div>
              <button onClick={handleSend} disabled={!content.trim() || sendMessage.isPending}
                className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-purple-500 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        {showMembers && (
          <div className="hidden md:block w-52 border-l border-white/[0.06] bg-white/[0.01] flex-shrink-0">
            <div className="p-3 border-b border-white/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/30">ონლაინ — {onlineUsers.length}</h3>
            </div>
            <div className="p-2 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100% - 50px)' }}>
              {onlineUsers.map(u => (
                <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-7 h-7">
                      {u.avatar ? <AvatarImage src={u.avatar} /> : null}
                      <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[10px] font-bold">{u.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c0c10]" />
                  </div>
                  <span className="text-xs text-white/60 truncate">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubChat;
