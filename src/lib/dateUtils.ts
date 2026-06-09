// Shared expiration / countdown helpers used across packages, subscriptions, and Kids accounts.

export const daysRemaining = (expiresAt: string | Date | null | undefined): number => {
  if (!expiresAt) return 0;
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const diff = exp.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const isExpired = (expiresAt: string | Date | null | undefined): boolean => {
  if (!expiresAt) return true;
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return exp.getTime() <= Date.now();
};

export const formatExpiryLabel = (expiresAt: string | Date | null | undefined): string => {
  if (!expiresAt) return 'ვადა არ არის';
  if (isExpired(expiresAt)) return 'ვადაგასული';
  const d = daysRemaining(expiresAt);
  if (d === 0) return 'იწურება დღეს';
  if (d === 1) return 'იწურება ხვალ';
  return `იწურება ${d} დღეში`;
};

export const formatExpiryDate = (expiresAt: string | Date | null | undefined): string => {
  if (!expiresAt) return '—';
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return exp.toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' });
};
