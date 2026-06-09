import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionHeaderProps {
  label?: string;
  labelIcon?: string;
  title: ReactNode;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

const SectionHeader = ({
  label,
  labelIcon,
  title,
  subtitle,
  centered = false,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn(centered && "text-center", "mb-20", className)}>
      {label && (
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-accent border border-[hsl(var(--border-accent))] rounded-full text-xs font-semibold tracking-widest uppercase text-gold mb-6">
          {labelIcon && (
            <span className="material-symbols-rounded text-sm">{labelIcon}</span>
          )}
          {label}
        </div>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-foreground mb-5">
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "text-lg text-muted-foreground max-w-xl leading-relaxed",
          centered && "mx-auto"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
