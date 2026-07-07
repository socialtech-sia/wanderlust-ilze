import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es, lv } from "date-fns/locale";
import { CalendarDays, Clock, Users, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { useAllServices, type Service } from "@/hooks/use-services";
import { tField, tSlug, type Lang } from "@/lib/language";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LOCALES = { en: enUS, es, lv } as const;
const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

import { routeHead } from "@/lib/route-head";

export const Route = createFileRoute("/$lang/book")({
  validateSearch: z.object({ service: z.string().optional() }),
  head: ({ params }) => routeHead({ params, routeKey: "book", path: "/book" }),
  component: BookingPage,
});

type Step = 1 | 2 | 3 | 4;

interface FormState {
  serviceId: string | null;
  date: string;
  time: string;
  persons: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
  terms: boolean;
  language: Lang;
}

function BookingPage() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const navigate = useNavigate();
  const { service: preselectedSlug } = Route.useSearch();
  const { data: services } = useAllServices();

  const preselected = useMemo(() => {
    if (!preselectedSlug || !services) return null;
    return (
      services.find(
        (s) => s.slug_lv === preselectedSlug || s.slug_en === preselectedSlug || s.slug_es === preselectedSlug,
      ) ?? null
    );
  }, [preselectedSlug, services]);

  const [step, setStep] = useState<Step>(preselected ? 2 : 1);
  const [form, setForm] = useState<FormState>({
    serviceId: preselected?.id ?? null,
    date: "",
    time: "",
    persons: 2,
    name: "",
    email: "",
    phone: "",
    country: "",
    notes: "",
    terms: false,
    language: lang,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService: Service | null =
    services?.find((s) => s.id === form.serviceId) ?? null;

  const canNext = (): boolean => {
    if (step === 1) return !!form.serviceId;
    if (step === 2) return !!form.date && form.persons > 0;
    if (step === 3) return !!form.name && !!form.email;
    return form.terms;
  };

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const snapshot = selectedService
        ? {
            id: selectedService.id,
            type: selectedService.type,
            title: tField(selectedService, "title", lang),
            price_from_eur: selectedService.price_from_eur,
          }
        : null;
      const { data, error: err } = await supabase
        .from("bookings")
        .insert({
          service_id: form.serviceId,
          service_snapshot: snapshot,
          requested_date: form.date,
          requested_time: form.time || null,
          persons_count: form.persons,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone || null,
          customer_country: form.country || null,
          customer_language: form.language,
          notes: form.notes || null,
        })
        .select("reference_code")
        .single();
      if (err) throw err;
      void navigate({
        to: "/$lang/book/confirmed/$ref",
        params: { lang, ref: data.reference_code },
      });
    } catch (e) {
      setError((e as Error).message ?? t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-editorial py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-eyebrow">Wanderlust</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{t("booking.title")}</h1>

        <ol className="mt-8 flex items-center gap-2 text-xs font-medium text-ink-muted">
          {(["step_service", "step_when", "step_contact", "step_review"] as const).map((k, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <li key={k} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                    done && "border-moss-deep bg-moss-deep text-paper",
                    active && "border-foreground bg-foreground text-paper",
                    !done && !active && "border-border text-ink-muted",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </span>
                <span className={cn("hidden sm:inline", active && "text-foreground")}>
                  {t(`booking.${k}`)}
                </span>
                {i < 3 && <span className="mx-1 h-px flex-1 bg-border" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6 md:p-10">
          {step === 1 && (
            <StepService
              services={services ?? []}
              lang={lang}
              value={form.serviceId}
              onSelect={(id) => setForm({ ...form, serviceId: id })}
            />
          )}
          {step === 2 && <StepWhen form={form} onChange={setForm} lang={lang} />}
          {step === 3 && <StepContact form={form} onChange={setForm} />}
          {step === 4 && (
            <StepReview form={form} service={selectedService} lang={lang} onChangeTerms={(v) => setForm({ ...form, terms: v })} />
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> {t("cta.back")}
            </button>
            {step < 4 ? (
              <button
                type="button"
                disabled={!canNext()}
                onClick={() => setStep((s) => (s < 4 ? ((s + 1) as Step) : s))}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                {t("cta.next")} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext() || submitting}
                onClick={submit}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {submitting ? "…" : t("booking.submit")}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          <Link to="/$lang" params={{ lang }} className="hover:text-foreground">
            ← {t("nav.home")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function StepService({
  services,
  lang,
  value,
  onSelect,
}: {
  services: Service[];
  lang: Lang;
  value: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const grouped = {
    excursion: services.filter((s) => s.type === "excursion"),
    hiking: services.filter((s) => s.type === "hiking"),
    transfer: services.filter((s) => s.type === "transfer"),
  };
  return (
    <div className="space-y-8">
      {(Object.keys(grouped) as (keyof typeof grouped)[]).map((k) => (
        <div key={k}>
          <h3 className="mb-3 text-eyebrow">{t(`service.${k}`)}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {grouped[k].map((s) => {
              const active = value === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-primary bg-accent text-foreground"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{tField(s, "title", lang)}</p>
                  {s.price_from_eur != null && (
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {t("service.price_from", { price: formatPrice(Number(s.price_from_eur)) })}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepWhen({
  form,
  onChange,
  lang,
}: {
  form: FormState;
  onChange: (v: FormState) => void;
  lang: Lang;
}) {
  const { t } = useTranslation();
  const locale = LOCALES[lang];
  const selectedDate = form.date ? new Date(form.date) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          <CalendarDays className="mr-1.5 inline h-4 w-4" /> {t("booking.date")}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm outline-none transition-colors hover:border-ink-soft focus:border-foreground",
                !selectedDate && "text-ink-soft",
              )}
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-ink-muted" />
                {selectedDate ? format(selectedDate, "PPP", { locale }) : t("booking.date")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="pointer-events-auto w-auto rounded-2xl border-border bg-popover p-0 shadow-editorial"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => onChange({ ...form, date: d ? format(d, "yyyy-MM-dd") : "" })}
              disabled={{ before: today }}
              locale={locale}
              weekStartsOn={1}
              showOutsideDays
              captionLayout="dropdown"
              initialFocus
              className="pointer-events-auto p-4 [--cell-size:2.25rem]"
              classNames={{
                day: "group/day relative aspect-square h-full w-full select-none p-0 text-center",
                today:
                  "font-semibold text-moss-deep data-[selected=true]:text-primary-foreground",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          <Clock className="mr-1.5 inline h-4 w-4" /> {t("booking.time")}
        </label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {TIME_SLOTS.map((slot) => {
            const active = form.time === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onChange({ ...form, time: slot })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-ink-soft hover:bg-paper-alt",
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          <Users className="mr-1.5 inline h-4 w-4" /> {t("booking.persons")}
        </label>
        <div className="inline-flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...form, persons: Math.max(1, form.persons - 1) })}
            className="h-10 w-10 rounded-full border border-border text-lg"
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-medium">{form.persons}</span>
          <button
            type="button"
            onClick={() => onChange({ ...form, persons: form.persons + 1 })}
            className="h-10 w-10 rounded-full border border-border text-lg"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function StepContact({ form, onChange }: { form: FormState; onChange: (v: FormState) => void }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={t("booking.name")} required>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label={t("booking.email")} required>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label={t("booking.phone")}>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label={t("booking.country")}>
        <input
          type="text"
          value={form.country}
          onChange={(e) => onChange({ ...form, country: e.target.value })}
          className={inputCls}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label={t("booking.notes")}>
          <textarea
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder={t("booking.notes_placeholder")}
            rows={4}
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  );
}

function StepReview({
  form,
  service,
  lang,
  onChangeTerms,
}: {
  form: FormState;
  service: Service | null;
  lang: Lang;
  onChangeTerms: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <dl className="divide-y divide-border/60 text-sm">
        {service && (
          <Row label={t("booking.step_service")} value={tField(service, "title", lang)} />
        )}
        <Row label={t("booking.date")} value={form.date ? format(new Date(form.date), "PPP") : "—"} />
        {form.time && <Row label={t("booking.time")} value={form.time} />}
        <Row label={t("booking.persons")} value={String(form.persons)} />
        <Row label={t("booking.name")} value={form.name} />
        <Row label={t("booking.email")} value={form.email} />
        {form.phone && <Row label={t("booking.phone")} value={form.phone} />}
        {form.notes && <Row label={t("booking.notes")} value={form.notes} />}
      </dl>
      <label className="mt-6 flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.terms}
          onChange={(e) => onChangeTerms(e.target.checked)}
          className="mt-1"
        />
        {t("booking.terms")}
      </label>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
