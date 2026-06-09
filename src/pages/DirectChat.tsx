import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useConversations, useMessages, useSendDirectMessage, useMarkMessagesRead, useRealtimeMessages, useCreateOrGetConversation, Conversation } from "@/hooks/useDirectChat";
import { format, isToday, isYesterday } from "date-fns";
import { ka } from "date-fns/locale";
import SEOHead from "@/components/SEOHead";
import { Search, ArrowLeft, Send, User, ChevronDown } from "lucide-react";

const AVATAR_BG = ["#5b6abf","#bf5b7a","#5bab8f","#a67bbf","#bf8c5b","#6b8fbf","#8fbf5b","#bf5b5b"];

const pickColor = (s: string) => {
  let h = 0;
  for (let i = 0; i < (s||'').length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
};

const fmtDate = (d: string) => {
  const dt = new Date(d);
  if (isToday(dt)) return "დღეს";
  if (isYesterday(dt)) return "გუშინ";
  return format(dt, "d MMM yyyy", { locale: ka });
};

const fmtTime = (d: string) => {
  const dt = new Date(d);
  if (isToday(dt)) return format(dt, "HH:mm");
  if (isYesterday(dt)) return "გუშინ";
  const days = Math.floor((Date.now() - dt.getTime()) / 86400000);
  if (days < 7) return format(dt, "EEEEEE", { locale: ka });
  return format(dt, "d MMM", { locale: ka });
};

const DirectChat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { data: conversations = [], isLoading: convosLoading } = useConversations();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(searchParams.get('c'));
  const { data: messages = [], isLoading: msgsLoading } = useMessages(activeConvoId || '');
  const sendMessage = useSendDirectMessage();
  const markRead = useMarkMessagesRead();
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const lastMarkedRef = useRef<string | null>(null);
  const createOrGetConvo = useCreateOrGetConversation();
  const [convoSearch, setConvoSearch] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useRealtimeMessages(activeConvoId || '');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user]);

  useEffect(() => {
    const c = searchParams.get('c');
    if (c) { setActiveConvoId(c); return; }
    const targetUser = searchParams.get('user');
    if (targetUser && user) {
      createOrGetConvo.mutateAsync(targetUser).then((convoId) => {
        setActiveConvoId(convoId);
        setSearchParams({ c: convoId });
      }).catch(() => {});
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (!activeConvoId || !user) return;
    const hasUnread = messages.some(m => !m.is_read && m.sender_id !== user.id);
    const key = `${activeConvoId}-${messages.length}`;
    if (hasUnread && lastMarkedRef.current !== key) {
      lastMarkedRef.current = key;
      markRead.mutate(activeConvoId);
    }
  }, [activeConvoId, messages, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [content]);

  // Scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeConvoId]);

  const handleSend = useCallback(async () => {
    if (!content.trim() || !activeConvoId) return;
    const msg = content;
    setContent("");
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    try {
      await sendMessage.mutateAsync({ conversation_id: activeConvoId, content: msg });
    } catch {
      setContent(msg);
    }
  }, [content, activeConvoId, sendMessage]);

  const activeConvo = conversations.find(c => c.id === activeConvoId);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const filteredConvos = useMemo(() => {
    if (!convoSearch.trim()) return conversations;
    const q = convoSearch.toLowerCase();
    return conversations.filter(c => c.other_user_name?.toLowerCase().includes(q));
  }, [conversations, convoSearch]);

  const selectConvo = (id: string) => {
    setActiveConvoId(id);
    setSearchParams({ c: id });
    setShowSidebar(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const groupedMessages = messages.reduce<{ date: string; msgs: typeof messages }[]>((groups, m) => {
    const dateKey = fmtDate(m.created_at);
    const last = groups[groups.length - 1];
    if (last && last.date === dateKey) last.msgs.push(m);
    else groups.push({ date: dateKey, msgs: [m] });
    return groups;
  }, []);

  const otherUserId = activeConvo
    ? (activeConvo.participant_one === user?.id ? activeConvo.participant_two : activeConvo.participant_one)
    : null;

  if (authLoading) {
    return (
      <>
        <SEOHead title="შეტყობინებები" description="პირადი მიმოწერა" />
        <Atmosphere /><Header />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead title="შეტყობინებები" description="პირადი მიმოწერა" />
      <Atmosphere />
      <Header />
      <style>{`
        .dc-convo:hover { background: rgba(255,255,255,0.03); }
        .dc-convo.sel { background: rgba(255,255,255,0.05); }
        .dc-input::placeholder { color: rgba(255,255,255,0.22); }
        .dc-input:focus { border-color: rgba(255,255,255,0.12); }
      `}</style>

      <main className="pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-0 md:px-4 pb-0 md:pb-4">
          <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-none md:rounded-xl border border-white/[0.06]">

            {/* Sidebar */}
            <div className={`${showSidebar ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-80 flex-shrink-0 bg-[#101014] border-r border-white/[0.06]`}>
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-semibold text-white/90">შეტყობინებები</h2>
                  {totalUnread > 0 && (
                    <span className="text-[10px] font-bold bg-[#d4a853] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input
                    value={convoSearch}
                    onChange={e => setConvoSearch(e.target.value)}
                    placeholder="ძებნა..."
                    className="dc-input w-full py-2 pl-8 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/80 text-[13px] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {convosLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 border-white/5 border-t-white/30 rounded-full animate-spin" />
                  </div>
                ) : filteredConvos.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    {conversations.length === 0 ? (
                      <>
                        <p className="text-white/40 text-sm mb-1">საუბრები ჯერ არ გაქვთ</p>
                        <p className="text-white/20 text-xs mb-4">დაიწყეთ ახალი საუბარი ფრილანსერის პროფილიდან</p>
                        <Link to="/freelancers" className="inline-block text-xs text-[#d4a853] hover:underline">
                          ფრილანსერების ნახვა →
                        </Link>
                      </>
                    ) : (
                      <p className="text-white/25 text-sm">ვერ მოიძებნა</p>
                    )}
                  </div>
                ) : (
                  filteredConvos.map(c => {
                    const active = activeConvoId === c.id;
                    const unread = (c.unread_count || 0) > 0;
                    return (
                      <button key={c.id} onClick={() => selectConvo(c.id)}
                        className={`dc-convo w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active ? 'sel' : ''}`}>
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            {c.other_user_avatar ? (
                              <img src={c.other_user_avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{ background: pickColor(c.other_user_name || '') }}>
                                {c.other_user_name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          {unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#d4a853] border-2 border-[#101014]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[13px] truncate ${unread ? 'text-white font-semibold' : 'text-white/60 font-medium'}`}>
                              {c.other_user_name}
                            </span>
                            {c.last_message_at && (
                              <span className={`text-[11px] flex-shrink-0 ${unread ? 'text-[#d4a853]' : 'text-white/20'}`}>
                                {fmtTime(c.last_message_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className={`text-xs truncate ${unread ? 'text-white/40' : 'text-white/20'}`}>
                              {c.last_message || 'ცარიელი საუბარი'}
                            </p>
                            {unread && (
                              <span className="text-[10px] font-bold bg-[#d4a853] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                                {c.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${!showSidebar || activeConvoId ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[#0c0c10] relative`}>
              {activeConvo ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#101014]">
                    <button onClick={() => setShowSidebar(true)} className="md:hidden p-1 text-white/40">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link to={`/user/${otherUserId}`} className="flex items-center gap-3 flex-1 min-w-0 no-underline">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                        {activeConvo.other_user_avatar ? (
                          <img src={activeConvo.other_user_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold"
                            style={{ background: pickColor(activeConvo.other_user_name || '') }}>
                            {activeConvo.other_user_name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/90 truncate">{activeConvo.other_user_name}</p>
                        <p className="text-[11px] text-white/25">ონლაინ</p>
                      </div>
                    </Link>
                    <Link to={`/user/${otherUserId}`} className="p-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-colors no-underline">
                      <User className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Messages */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
                    {msgsLoading ? (
                      <div className="flex justify-center py-16">
                        <div className="w-6 h-6 border-2 border-white/5 border-t-white/30 rounded-full animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-white/30 text-sm mb-1">დაიწყეთ საუბარი</p>
                        <p className="text-white/15 text-xs">მიწერეთ {activeConvo.other_user_name}-ს პირველი შეტყობინება</p>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto">
                        {groupedMessages.map((group, gi) => (
                          <div key={gi}>
                            <div className="flex justify-center my-4">
                              <span className="text-[11px] text-white/20 bg-white/[0.03] px-3 py-1 rounded-full">
                                {group.date}
                              </span>
                            </div>
                            <div className="flex flex-col gap-[3px]">
                              {group.msgs.map((m, mi) => {
                                const mine = m.sender_id === user?.id;
                                const next = group.msgs[mi + 1];
                                const last = !next || next.sender_id !== m.sender_id;
                                const prev = group.msgs[mi - 1];
                                const first = !prev || prev.sender_id !== m.sender_id;
                                const avatar = !mine && last;

                                const R = 18, r = 4;
                                let br: string;
                                if (mine) {
                                  br = first && last ? `${R}px ${R}px ${r}px ${R}px`
                                    : first ? `${R}px ${R}px ${r}px ${R}px`
                                    : last ? `${R}px ${r}px ${r}px ${R}px`
                                    : `${R}px ${r}px ${r}px ${R}px`;
                                } else {
                                  br = first && last ? `${R}px ${R}px ${R}px ${r}px`
                                    : first ? `${R}px ${R}px ${R}px ${r}px`
                                    : last ? `${r}px ${R}px ${R}px ${r}px`
                                    : `${r}px ${R}px ${R}px ${r}px`;
                                }

                                return (
                                  <div key={m.id} className={`flex items-end gap-2 ${mine ? 'justify-end pl-12' : 'justify-start pr-12'} ${last ? 'mb-2' : ''}`}>
                                    {!mine && (
                                      <div className="w-7 flex-shrink-0">
                                        {avatar && (
                                          <div className="w-7 h-7 rounded-full overflow-hidden">
                                            {activeConvo.other_user_avatar ? (
                                              <img src={activeConvo.other_user_avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-semibold"
                                                style={{ background: pickColor(activeConvo.other_user_name || '') }}>
                                                {activeConvo.other_user_name?.charAt(0)?.toUpperCase()}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <div className="max-w-[70%]" style={{
                                      padding: '8px 12px', borderRadius: br, fontSize: '13.5px', lineHeight: 1.5,
                                      background: mine ? '#d4a853' : 'rgba(255,255,255,0.06)',
                                      color: mine ? '#fff' : '#c8c8c8',
                                    }}>
                                      <p className="whitespace-pre-wrap break-words m-0">{m.content}</p>
                                      <div className={`flex items-center gap-1 mt-0.5 ${mine ? 'justify-end' : ''}`}>
                                        <span className="text-[10px]" style={{ color: mine ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)' }}>
                                          {format(new Date(m.created_at), 'HH:mm')}
                                        </span>
                                        {mine && (
                                          <span className="text-[11px]" style={{ color: m.is_read ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
                                            {m.is_read ? '✓✓' : '✓'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {showScrollBtn && (
                    <button onClick={scrollToBottom} className="absolute bottom-20 right-4 z-20 w-8 h-8 rounded-full bg-[#1a1a1f] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/60 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-white/[0.06] bg-[#101014]">
                    <div className="flex items-end gap-2 max-w-2xl mx-auto">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="შეტყობინება..."
                        rows={1}
                        className="dc-input flex-1 resize-none py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/80 text-[13.5px] outline-none transition-colors"
                        style={{ maxHeight: '120px' }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!content.trim() || sendMessage.isPending}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                        style={{
                          background: content.trim() ? '#d4a853' : 'rgba(255,255,255,0.04)',
                          color: content.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                          border: 'none', cursor: 'pointer',
                        }}>
                        {sendMessage.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" style={{ transform: 'rotate(-45deg)' }} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-6">
                    <p className="text-white/30 text-sm mb-1">აირჩიეთ საუბარი</p>
                    <p className="text-white/15 text-xs max-w-[240px] mx-auto leading-relaxed">
                      აირჩიეთ მარცხენა სიიდან ან დაიწყეთ ახალი ფრილანსერის პროფილიდან
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DirectChat;
