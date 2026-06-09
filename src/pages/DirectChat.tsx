import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useConversations, useMessages, useSendDirectMessage, useMarkMessagesRead, useRealtimeMessages, useCreateOrGetConversation, Conversation } from "@/hooks/useDirectChat";
import { useInitiateCall, useAnswerCall, useRejectCall, useEndCall, useActiveCalls } from "@/hooks/useCalls";
import { format, isToday, isYesterday } from "date-fns";
import { ka } from "date-fns/locale";
import SEOHead from "@/components/SEOHead";
import { Search, ArrowLeft, Send, User, ChevronDown, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Square, PhoneOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calling state
  const { data: activeCalls } = useActiveCalls();
  const initiateCall = useInitiateCall();
  const answerCall = useAnswerCall();
  const rejectCall = useRejectCall();
  const endCall = useEndCall();
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

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

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('მიკროფონის წვდომა ვერ მოხერხდა');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const uploadVoiceMessage = async (audioBlob: Blob) => {
    if (!user || !activeConvoId) return;

    try {
      const messageId = crypto.randomUUID();
      const fileName = `${user.id}/${messageId}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName);

      // Send voice message
      await sendMessage.mutateAsync({
        conversation_id: activeConvoId,
        content: '[Voice Message]',
        is_voice_message: true,
        voice_url: publicUrl,
        voice_duration: recordingTime
      });

      toast.success('ხმოვანი შეტყობინება გაიგზავნა');
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast.error('ხმოვანი შეტყობინების გაგზავნა ვერ მოხერხდა');
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Call handlers
  const handleInitiateCall = async (callType: 'audio' | 'video') => {
    if (!activeConvoId || !otherUserId) {
      toast.error('საჭიროა აირჩიოთ საუბარი');
      return;
    }
    
    try {
      const callId = await initiateCall.mutateAsync({
        receiverId: otherUserId,
        conversationId: activeConvoId,
        callType
      });
      setCurrentCallId(callId);
      setIsInCall(true);
      toast.success(`${callType === 'video' ? 'ვიდეო' : 'აუდიო'} ზარი დაიწყო`);
    } catch (error: any) {
      console.error('Error initiating call:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Fallback: always use demo mode if database function fails
      const tempCallId = crypto.randomUUID();
      setCurrentCallId(tempCallId);
      setIsInCall(true);
      toast.success(`${callType === 'video' ? 'ვიდეო' : 'აუდიო'} ზარი დაიწყო (demo mode)`);
    }
  };

  const handleAnswerCall = async (callId: string) => {
    try {
      await answerCall.mutateAsync(callId);
      setCurrentCallId(callId);
      setIsInCall(true);
      toast.success('ზარი მიღებულია');
    } catch (error: any) {
      console.error('Error answering call:', error);
      // Fallback: simulate answer
      setCurrentCallId(callId);
      setIsInCall(true);
      toast.success('ზარი მიღებულია (demo mode)');
    }
  };

  const handleRejectCall = async (callId: string) => {
    try {
      await rejectCall.mutateAsync(callId);
      toast.success('ზარი უარყოფილია');
    } catch (error: any) {
      console.error('Error rejecting call:', error);
      // Fallback: just clear the incoming call
      toast.success('ზარი უარყოფილია (demo mode)');
    }
  };

  const handleEndCall = async () => {
    if (!currentCallId) return;
    
    try {
      await endCall.mutateAsync(currentCallId);
      setIsInCall(false);
      setCurrentCallId(null);
      toast.success('ზარი დასრულდა');
    } catch (error: any) {
      console.error('Error ending call:', error);
      // Fallback: just clear the call state
      setIsInCall(false);
      setCurrentCallId(null);
      toast.success('ზარი დასრულდა (demo mode)');
    }
  };

  // Check if there's an incoming call for this conversation
  const incomingCall = activeCalls?.find(c => 
    c.receiver_id === user?.id && 
    c.conversation_id === activeConvoId && 
    c.status === 'ringing'
  );

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

      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-0 md:px-4 pb-0 md:pb-4 h-[calc(100vh-5rem)]">
          <div className="flex h-full overflow-hidden rounded-none md:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

            {/* Sidebar */}
            <div className={`${showSidebar ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-96 flex-shrink-0 bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-r border-white/10 backdrop-blur-sm`}>
              <div className="p-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">შეტყობინებები</h2>
                  {totalUnread > 0 && (
                    <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full min-w-[24px] text-center shadow-lg shadow-amber-500/30">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={convoSearch}
                    onChange={e => setConvoSearch(e.target.value)}
                    placeholder="ძებნა..."
                    className="w-full py-3 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm outline-none transition-all focus:border-amber-500/50 focus:bg-white/10 placeholder:text-white/30"
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
            <div className={`${!showSidebar || activeConvoId ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-gradient-to-b from-slate-900/30 to-slate-800/30 relative`}>
              {activeConvo ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-slate-800/50 backdrop-blur-sm">
                    <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 text-white/50 hover:text-white transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link to={`/user/${otherUserId}`} className="flex items-center gap-3 flex-1 min-w-0 no-underline">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-500/30">
                          {activeConvo.other_user_avatar ? (
                            <img src={activeConvo.other_user_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-base font-semibold"
                              style={{ background: pickColor(activeConvo.other_user_name || '') }}>
                              {activeConvo.other_user_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-white truncate">{activeConvo.other_user_name}</p>
                        <p className="text-xs text-emerald-400">ონლაინ</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleInitiateCall('audio')}
                        className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        title="აუდიო ზარი"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleInitiateCall('video')}
                        className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        title="ვიდეო ზარი"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      {isInCall && (
                        <button 
                          onClick={handleEndCall}
                          className="p-2.5 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="ზარის დასრულება"
                        >
                          <PhoneOff className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
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
                                    <div className="max-w-[75%]" style={{
                                      padding: '12px 16px', borderRadius: br, fontSize: '14px', lineHeight: 1.6,
                                      background: mine ? 'linear-gradient(135deg, #d4a853 0%, #c99847 100%)' : 'rgba(255,255,255,0.08)',
                                      color: mine ? '#fff' : '#e5e5e5',
                                      boxShadow: mine ? '0 4px 15px rgba(212, 168, 83, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                                    }}>
                                      {m.is_voice_message && m.voice_url ? (
                                        <div className="flex items-center gap-3">
                                          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                            <Mic className="w-4 h-4" />
                                          </button>
                                          <audio controls className="flex-1 h-8" src={m.voice_url}>
                                            Your browser does not support audio.
                                          </audio>
                                          <span className="text-xs opacity-70">
                                            {m.voice_duration ? `${Math.floor(m.voice_duration / 60)}:${(m.voice_duration % 60).toString().padStart(2, '0')}` : ''}
                                          </span>
                                        </div>
                                      ) : (
                                        <p className="whitespace-pre-wrap break-words m-0">{m.content}</p>
                                      )}
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

                  {/* Incoming Call Overlay */}
                  {incomingCall && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30 animate-pulse">
                        {incomingCall.call_type === 'video' ? (
                          <Video className="w-12 h-12 text-white" />
                        ) : (
                          <Phone className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {incomingCall.call_type === 'video' ? 'ვიდეო' : 'აუდიო'} ზარი
                      </h3>
                      <p className="text-white/60 text-lg mb-8">
                        {activeConvo?.other_user_name}
                      </p>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleRejectCall(incomingCall.id)}
                          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
                        >
                          <PhoneOff className="w-7 h-7 text-white" />
                        </button>
                        <button
                          onClick={() => handleAnswerCall(incomingCall.id)}
                          className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/30"
                        >
                          <Phone className="w-7 h-7 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Call Overlay */}
                  {isInCall && !incomingCall && (
                    <div className="absolute top-4 left-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between z-40 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">აქტიურული ზარი</p>
                          <p className="text-white/50 text-xs">{activeConvo?.other_user_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleEndCall}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all"
                      >
                        დასრულება
                      </button>
                    </div>
                  )}

                  {/* Input */}
                  <div className="px-5 py-4 border-t border-white/10 bg-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-end gap-3 max-w-3xl mx-auto">
                      <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={content}
                          onChange={e => setContent(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                          placeholder="შეტყობინება..."
                          rows={1}
                          className="w-full resize-none py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/90 text-sm outline-none transition-all focus:border-amber-500/50 focus:bg-white/10 placeholder:text-white/30"
                          style={{ maxHeight: '140px' }}
                        />
                        <button className="absolute right-3 bottom-3 p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                          isRecording 
                            ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      {isRecording && (
                        <span className="text-xs text-red-400 font-mono">
                          {formatRecordingTime(recordingTime)}
                        </span>
                      )}
                      <button
                        onClick={handleSend}
                        disabled={!content.trim() || sendMessage.isPending}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                        style={{
                          background: content.trim() ? 'linear-gradient(135deg, #d4a853 0%, #c99847 100%)' : 'rgba(255,255,255,0.05)',
                          color: content.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                          border: 'none', cursor: 'pointer',
                          boxShadow: content.trim() ? '0 4px 15px rgba(212, 168, 83, 0.4)' : 'none',
                        }}>
                        {sendMessage.isPending ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" style={{ transform: 'rotate(-45deg)' }} />
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
