// Short, warm feedback lines that vary from attempt to attempt so feedback
// never reads like the same canned sentence twice.

export const praise = [
  'სწორია!',
  'ზუსტად ასე!',
  'ბრავო, კარგად გამოგივიდა!',
  'ეს უკვე ნამდვილი პროგრამისტის ნაბიჯია.',
  'შესანიშნავია, ასე გააგრძელე!',
] as const;

export const retry = [
  'თითქმის! კიდევ ერთხელ სცადე.',
  'ახლოს ხარ.',
  'შეცდომა გზის ნაწილია, ისევ სცადე.',
  'ჯერ არა, მაგრამ სწორ გზაზე ხარ.',
] as const;

// Deterministic on purpose: the same seed gives the same line, so a re-render
// never swaps the sentence under the learner's eyes. Callers seed with something
// that changes per attempt (for example the number of recorded attempts).
export function pick<T>(items: readonly T[], seed: number): T {
  const n = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
  return items[n % items.length];
}

export function streakLine(days: number): string {
  if (!(days > 0)) return '';
  if (days === 1) return 'პირველი დღე ზედიზედ. ხვალაც დაბრუნდი!';
  if (days < 7) return `${days} დღე ზედიზედ. სერია იზრდება!`;
  return `${days} დღე ზედიზედ. შესანიშნავი რიტმია!`;
}
