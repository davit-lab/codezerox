import { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

const NotificationBell = () => {
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">შეტყობინებები</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              ყველას წაკითხვა
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              შეტყობინებები არ არის
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-muted/30 transition-colors ${
                    !n.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!n.is_read) markRead.mutate(n.id);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      !n.is_read ? 'bg-primary' : 'bg-transparent'
                    }`} />
                    <div className="min-w-0">
                      <p className="font-medium text-xs">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString('ka-GE', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
