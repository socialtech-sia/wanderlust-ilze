import { useTranslation } from "react-i18next";
import type { Service } from "@/hooks/use-services";
import { tField, type Lang } from "@/lib/language";
import { formatPrice } from "@/lib/format";
import { ServiceTypeIcon, TYPE_COLOR } from "./ServiceTypeIcon";

export function BookingSummary({ service, lang }: { service: Service; lang: Lang }) {
  const { t } = useTranslation();
  const color = TYPE_COLOR[service.type];
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-border/60 bg-paper-alt/60 p-4"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <span
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color, color: "var(--paper)" }}
      >
        <ServiceTypeIcon type={service.type} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {t(`service.${service.type}`)}
        </p>
        <p className="truncate font-medium text-foreground">{tField(service, "title", lang)}</p>
      </div>
      {service.price_from_eur != null && (
        <p className="shrink-0 text-sm text-ink-muted">
          {t("service.price_from", { price: formatPrice(Number(service.price_from_eur)) })}
        </p>
      )}
    </div>
  );
}
