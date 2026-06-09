import { Wallet } from 'lucide-react';
import { useSiteCreditsBalance } from '@/hooks/useSiteCredits';

interface Props {
  total: number;
  apply: boolean;
  appliedAmount: number;
  onToggle: (apply: boolean) => void;
  onAmountChange: (amount: number) => void;
}

/**
 * Reusable checkout widget that lets the user spend Site Credits.
 * Caller decides the final flow (skip Flitt if applied >= total, etc.).
 */
const SiteCreditsWidget = ({ total, apply, appliedAmount, onToggle, onAmountChange }: Props) => {
  const { data: balance = 0 } = useSiteCreditsBalance();

  const max = Math.min(balance, total);

  return (
    <div className="rounded-xl bg-muted/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">საიტის კრედიტი</span>
          <span className="text-xs text-muted-foreground">({balance.toFixed(2)} ₾ ხელმისაწვდომი)</span>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={apply}
            disabled={max <= 0}
            onChange={(e) => {
              onToggle(e.target.checked);
              onAmountChange(e.target.checked ? max : 0);
            }}
            className="w-4 h-4 accent-primary"
          />
          გამოყენება
        </label>
      </div>

      {max <= 0 && (
        <p className="text-xs text-muted-foreground mb-0">ამ შეკვეთაზე გამოსაყენებელი კრედიტი ჯერ არ გაქვთ.</p>
      )}

      {apply && max > 0 && (
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={max}
            step={0.5}
            value={appliedAmount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 ₾</span>
            <span className="font-semibold text-foreground">{appliedAmount.toFixed(2)} ₾ გამოყენებული</span>
            <span>{max.toFixed(2)} ₾</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteCreditsWidget;
