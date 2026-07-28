import { useTranslation } from "react-i18next";
import type { Service, ServiceType } from "@/hooks/use-services";
import { cn } from "@/lib/utils";
import { ServiceTypeIcon, TYPE_COLOR } from "./ServiceTypeIcon";

const TYPES: ServiceType[] = ["excursion", "hiking", "transfer"];

export function StepType({
  services,
  value,
  onSelect,
}: {
  services: Service[];
  value: ServiceType | null;
  onSelect: (t: ServiceType) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="animate-fade-in">
      <p className="text-eyebrow">{t("booking.step_type")}</p>
      <h2 className="mt-2 display-3">{t("booking.type_prompt")}</h2>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">{t("booking.type_sub")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TYPES.map((tp) => {
          const count = services.filter((s) => s.type === tp).length;
          const active = value === tp;
          const color = TYPE_COLOR[tp];
          return (
            <button
              key={tp}
              type="button"
              onClick={() => onSelect(tp)}
              disabled={count === 0}
              className={cn(
                "group relative flex flex-col items-start gap-4 overflow-hidden rounded-lg border bg-paper-alt/60 p-5 text-left transition-all duration-300",
                "hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--sandstone)_55%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
                active ? "border-transparent shadow-editorial" : "border-border/70",
              )}
              style={active ? { borderColor: color, boxShadow: `0 10px 30px -12px ${color}` } : undefined}
            >
              <span
                className="inline-flex h-16 w-16 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: active ? color : "var(--paper)",
                  color: active ? "var(--paper)" : color,
                }}
              >
                <ServiceTypeIcon type={tp} className="h-9 w-9" />
              </span>
              <div>
                <p className="display-3 leading-tight">{t(`booking.type_${tp}`)}</p>
                <p className="mt-1 text-xs text-ink-muted">{t(`booking.type_${tp}_desc`)}</p>
              </div>
              <span className="mt-auto text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                {t("booking.services_count", { count })}
              </span>
              <svg
                className="absolute inset-x-0 bottom-0 h-8 w-full text-border/50"
                viewBox="0 0 200 30"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M0 25 Q50 5 100 20 T200 15 V30 H0 Z" fill="currentColor" opacity="0.4" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
