import type { ServiceType } from "@/hooks/use-services";

export function ServiceTypeIcon({
  type,
  className,
}: {
  type: ServiceType;
  className?: string;
}) {
  const stroke = "currentColor";
  if (type === "excursion") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
        <circle cx="32" cy="32" r="20" stroke={stroke} strokeWidth="1.5" />
        <path d="M32 12 v6 M32 46 v6 M12 32 h6 M46 32 h6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 22 L30 34 L26 30 Z" fill={stroke} opacity="0.85" />
        <path d="M30 34 L26 42" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="1.8" fill={stroke} />
      </svg>
    );
  }
  if (type === "hiking") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
        <path d="M6 50 L20 30 L28 40 L40 20 L58 50 Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="44" cy="16" r="3" fill={stroke} />
        <path d="M22 50 h20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
        <path d="M40 20 v-6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // transfer
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <rect x="10" y="20" width="44" height="22" rx="4" stroke={stroke} strokeWidth="1.5" />
      <path d="M14 28 h36 M22 20 v-4 h20 v4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="46" r="4" stroke={stroke} strokeWidth="1.5" fill="var(--paper)" />
      <circle cx="44" cy="46" r="4" stroke={stroke} strokeWidth="1.5" fill="var(--paper)" />
      <circle cx="20" cy="46" r="1.4" fill={stroke} />
      <circle cx="44" cy="46" r="1.4" fill={stroke} />
    </svg>
  );
}

export const TYPE_COLOR: Record<ServiceType, string> = {
  excursion: "var(--cat-action)",
  hiking: "var(--cat-nature)",
  transfer: "var(--cat-history)",
};
