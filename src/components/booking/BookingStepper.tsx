import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_KEYS = [
  "booking.step_type",
  "booking.step_service",
  "booking.step_when",
  "booking.step_contact",
  "booking.step_review",
] as const;

export function BookingStepper({ step, accent }: { step: number; accent?: string }) {
  const { t } = useTranslation();
  const progress = ((step - 1) / (STEP_KEYS.length - 1)) * 100;
  return (
    <div className="w-full">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: accent ?? "var(--moss-deep)" }}
        />
      </div>
      <ol className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {STEP_KEYS.map((k, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={k} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                  done && "border-transparent text-paper",
                  active && "border-foreground bg-foreground text-paper",
                  !done && !active && "border-border bg-background",
                )}
                style={done ? { backgroundColor: accent ?? "var(--moss-deep)" } : undefined}
              >
                {done ? <Check className="h-3 w-3" /> : n}
              </span>
              <span className={cn("hidden md:inline", active && "text-foreground")}>{t(k)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
