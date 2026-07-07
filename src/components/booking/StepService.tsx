import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock } from "lucide-react";
import type { Service, ServiceType } from "@/hooks/use-services";
import { tField, type Lang } from "@/lib/language";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ServiceTypeIcon, TYPE_COLOR } from "./ServiceTypeIcon";

export function StepService({
  services,
  type,
  lang,
  value,
  onSelect,
  onBackToType,
}: {
  services: Service[];
  type: ServiceType;
  lang: Lang;
  value: string | null;
  onSelect: (id: string) => void;
  onBackToType: () => void;
}) {
  const { t } = useTranslation();
  const list = services.filter((s) => s.type === type);
  const color = TYPE_COLOR[type];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow" style={{ color }}>{t(`booking.type_${type}`)}</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">{t("booking.service_prompt")}</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onBackToType}>
          <ArrowLeft className="h-4 w-4" /> {t("booking.change_type")}
        </Button>
      </div>

      <div className="mt-6 grid gap-3">
        {list.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "group flex items-center gap-4 rounded-2xl border bg-background p-4 text-left transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-editorial",
                active ? "border-transparent shadow-editorial" : "border-border/70",
              )}
              style={active ? { borderColor: color } : undefined}
            >
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: active ? color : "var(--paper-alt)",
                  color: active ? "var(--paper)" : color,
                }}
              >
                <ServiceTypeIcon type={s.type} className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{tField(s, "title", lang)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  {s.duration_min != null && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDuration(Number(s.duration_min), t)}
                    </span>
                  )}
                  {s.price_from_eur != null && (
                    <span>{t("service.price_from", { price: formatPrice(Number(s.price_from_eur)) })}</span>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active ? "border-transparent" : "border-border",
                )}
                style={active ? { backgroundColor: color } : undefined}
              >
                {active && <span className="h-2 w-2 rounded-full bg-paper" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(min: number, t: (k: string, o?: Record<string, unknown>) => string) {
  if (min < 60) return `${min} ${t("service.min_short")}`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${h}${t("service.hours_short")} ${rest}` : `${h} ${t("service.hours_short")}`;
}
