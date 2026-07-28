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

/**
 * Wizard progress rendered as sandstone strata (signature element, use #2):
 * three stacked ribbons of different heights fill as the traveller advances.
 */
const BANDS = [
  { h: 3, c: "var(--sandstone-bright)", d: 0 },
  { h: 6, c: "var(--sandstone)", d: 60 },
  { h: 2, c: "color-mix(in oklab, var(--sandstone) 45%, var(--pine))", d: 120 },
];

export function BookingStepper({ step, accent }: { step: number; accent?: string }) {
  const { t } = useTranslation();
  const progress = ((step - 1) / (STEP_KEYS.length - 1)) * 100;
  const tint = accent ?? "var(--sandstone)";

  return (
    <div className="w-full">
      <div aria-hidden className="w-full overflow-hidden">
        {BANDS.map((b, i) => (
          <div key={i} style={{ height: `${b.h}px` }} className="w-full bg-[color-mix(in_oklab,var(--bone)_10%,transparent)]">
            <div
              className="h-full origin-left transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: `${progress}%`,
                backgroundColor: i === 1 ? tint : b.c,
                transitionDelay: `${b.d}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <ol className="text-utility mt-5 flex items-center justify-between text-[10px] text-muted-foreground">
        {STEP_KEYS.map((k, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={k} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-sm border text-[10px] transition-colors",
                  done && "border-transparent text-bone",
                  active && "border-foreground bg-foreground text-background",
                  !done && !active && "border-border",
                )}
                style={done ? { backgroundColor: tint } : undefined}
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
