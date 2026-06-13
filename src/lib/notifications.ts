/**
 * Browser notifications + business hours helpers
 * Used by Support Chat (user side and admin side) to ping users with
 * native OS / Chrome notifications when a chat message arrives.
 */

// ---- Business hours (Tbilisi time, GMT+4) -----------------------------
// Mon–Fri 10:00 – 21:00, Sat 12:00 – 18:00, Sunday closed.
const BIZ_HOURS: Record<number, [number, number] | null> = {
  0: null,           // Sunday – closed
  1: [10, 21],       // Mon
  2: [10, 21],       // Tue
  3: [10, 21],       // Wed
  4: [10, 21],       // Thu
  5: [10, 21],       // Fri
  6: [12, 18],       // Sat
};

export const isWithinBusinessHours = (now: Date = new Date()): boolean => {
  // Convert "now" to Tbilisi (UTC+4, no DST)
  const tbilisi = new Date(now.getTime() + (4 * 60 - now.getTimezoneOffset() * -1) * 60_000);
  // Simpler & robust: use UTC then add 4
  const utc = now.getUTCHours() + now.getUTCMinutes() / 60;
  const tHour = (utc + 4) % 24;
  // Compute Tbilisi day-of-week
  const utcMs = now.getTime();
  const tbDay = new Date(utcMs + 4 * 3600_000).getUTCDay();
  const window = BIZ_HOURS[tbDay];
  if (!window) return false;
  const [start, end] = window;
  return tHour >= start && tHour < end;
};

export const businessHoursLabel = 'ორშ–პარ 10:00–21:00 · შაბ 12:00–18:00';

// ---- Browser Notifications --------------------------------------------
export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export const getNotificationPermission = (): PermissionState => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as PermissionState;
};

export const requestNotificationPermission = async (): Promise<PermissionState> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result as PermissionState;
  } catch {
    return 'denied';
  }
};

interface ShowNotificationOptions {
  title: string;
  body: string;
  tag?: string;     // de-duplicates notifications
  icon?: string;
  onClick?: () => void;
  /** If true, only show when document is hidden / window unfocused */
  onlyWhenHidden?: boolean;
}

export const showBrowserNotification = ({
  title,
  body,
  tag,
  icon = '/favicon.ico',
  onClick,
  onlyWhenHidden = true,
}: ShowNotificationOptions): Notification | null => {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;
  if (onlyWhenHidden && document.visibilityState === 'visible' && document.hasFocus()) {
    return null;
  }
  try {
    const n = new Notification(title, {
      body,
      tag: tag ?? 'codezero-chat',
      icon,
      badge: icon,
      silent: false,
    });
    if (onClick) {
      n.onclick = () => {
        try {
          window.focus();
          onClick();
          n.close();
        } catch { /* noop */ }
      };
    }
    return n;
  } catch (e) {
    console.warn('[notifications] failed to show', e);
    return null;
  }
};
