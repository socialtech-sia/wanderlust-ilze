import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CalendarDays, Clock, Mail, Phone, Users } from "lucide-react";
import type { Service } from "@/hooks/use-services";
import { tField, type Lang } from "@/lib/language";
import { formatPrice } from "@/lib/format";
import { ServiceTypeIcon, TYPE_COLOR } from "./ServiceTypeIcon";

interface Form {
  date: string;
  time: string;
  persons: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  terms: boolean;
}

export function StepReview({
  service,
  lang,
  form,
  onChangeTerms,
}: {
  service: Service | null;
  lang: Lang;
  form: Form;
  onChangeTerms: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  if (!service) return null;
  const color = TYPE_COLOR[service.type];
  const total =
    service.price_from_eur != null ? Number(service.price_from_eur) * form.persons : null;

  return (
    <div className="animate-fade-in grid gap-6 md:grid-cols-[1.1fr_1fr]">
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-bone"
        style={{ backgroundColor: color }}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-80">
          {t(`booking.type_${service.type}`)}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight">
          {tField(service, "title", lang)}
        </h3>
        <div className="mt-6 space-y-2 text-sm">
          <Row icon={<CalendarDays className="h-4 w-4" />}>
            {form.date ? format(new Date(form.date), "PPP") : "—"}
          </Row>
          {form.time && <Row icon={<Clock className="h-4 w-4" />}>{form.time}</Row>}
          <Row icon={<Users className="h-4 w-4" />}>
            {t("booking.persons_n", { count: form.persons })}
          </Row>
          <Row icon={<Mail className="h-4 w-4" />}>{form.email}</Row>
          {form.phone && <Row icon={<Phone className="h-4 w-4" />}>{form.phone}</Row>}
        </div>
        {total != null && (
          <div className="mt-6 border-t border-paper/20 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-80">
              {t("booking.estimated_total")}
            </p>
            <p className="mt-1 font-display text-3xl">{formatPrice(total)}</p>
          </div>
        )}
        <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-15">
          <ServiceTypeIcon type={service.type} className="h-40 w-40" />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div className="rounded-2xl border border-border/60 bg-paper-alt/40 p-5 text-sm text-ink-muted">
          <p className="font-medium text-foreground">{t("booking.review_note_title")}</p>
          <p className="mt-2">{t("booking.review_note_body")}</p>
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => onChangeTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-current"
            style={{ accentColor: color }}
          />
          <span>{t("booking.terms")}</span>
        </label>
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 opacity-95">
      <span className="opacity-80">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
