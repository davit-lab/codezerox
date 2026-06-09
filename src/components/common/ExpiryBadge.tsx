import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { daysRemaining, isExpired, formatExpiryDate } from '@/lib/dateUtils';

interface Props {
  expiresAt: string | Date | null | undefined;
  className?: string;
}

const ExpiryBadge = ({ expiresAt, className = '' }: Props) => {
  if (!expiresAt) return null;
  const expired = isExpired(expiresAt);
  const days = daysRemaining(expiresAt);
  const warn = !expired && days <= 5;

  const colors = expired
    ? 'bg-destructive/15 text-destructive border-destructive/30'
    : warn
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  const Icon = expired ? AlertTriangle : warn ? Clock : CheckCircle2;
  const label = expired
    ? 'ვადაგასული'
    : days === 0
    ? 'იწურება დღეს'
    : `${days} დღე დარჩა`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors} ${className}`}
      title={`ვადა: ${formatExpiryDate(expiresAt)}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

export default ExpiryBadge;
