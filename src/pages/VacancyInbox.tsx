import { Link } from 'react-router-dom';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import { useAllMyVacancyMessages, useMarkMessageRead } from '@/hooks/useVacancies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VacancyInbox = () => {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useAllMyVacancyMessages();
  const markRead = useMarkMessageRead();

  const unreadCount = messages.filter((m: any) => !m.is_read).length;

  const handleDownloadCV = async (cvUrl: string) => {
    try {
      const { data, error } = await supabase.storage.from('vacancy-cvs').createSignedUrl(cvUrl, 3600);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('CV-ს ჩამოტვირთვა ვერ მოხერხდა');
    }
  };

  if (!user) {
    return (
      <>
        <Atmosphere /><Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">გთხოვთ გაიაროთ ავტორიზაცია</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Atmosphere /><Header />
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/vacancies" className="w-10 h-10 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
              <span className="material-symbols-rounded">arrow_back</span>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">ინბოქსი</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    {unreadCount} ახალი
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{messages.length} შეტყობინება სულ</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-14 h-14 rounded-full border-[3px] border-muted animate-spin border-t-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-rounded text-4xl text-muted-foreground/60">inbox</span>
              </div>
              <p className="text-muted-foreground font-medium">ჯერ შეტყობინებები არ გაქვთ</p>
              <p className="text-muted-foreground/60 text-sm mt-1">როცა ვინმე გამოგეხმაურებათ, აქ გამოჩნდება</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                    msg.is_read 
                      ? 'bg-card/40 backdrop-blur-sm border border-border/20' 
                      : 'bg-card/70 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5'
                  }`}
                >
                  {/* Unread indicator */}
                  {!msg.is_read && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className="p-5 pl-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                          msg.is_read ? 'bg-muted/50 text-muted-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          {msg.sender_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm">{msg.sender_name}</h3>
                            {!msg.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground/70">{msg.sender_email}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-muted-foreground/60">
                          {new Date(msg.created_at).toLocaleDateString('ka-GE')}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary">
                          {msg.vacancy_title}
                        </span>
                      </div>
                    </div>
                    
                    {/* Message body */}
                    <div className="ml-[52px]">
                      <p className="text-sm text-muted-foreground/90 whitespace-pre-wrap leading-relaxed mb-4">{msg.message}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {msg.cv_url && (
                          <button
                            onClick={() => handleDownloadCV(msg.cv_url)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <span className="material-symbols-rounded text-sm">download</span>
                            CV ჩამოტვირთვა
                          </button>
                        )}
                        {!msg.is_read && (
                          <button
                            onClick={() => markRead.mutate(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <span className="material-symbols-rounded text-sm">done_all</span>
                            წაკითხულად
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default VacancyInbox;
