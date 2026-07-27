import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { useAllServices, type Service, type ServiceType } from "@/hooks/use-services";
import { tField, type Lang } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { routeHead } from "@/lib/route-head";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { StepType } from "@/components/booking/StepType";
import { StepService } from "@/components/booking/StepService";
import { StepWhen } from "@/components/booking/StepWhen";
import { StepContact } from "@/components/booking/StepContact";
import { StepReview } from "@/components/booking/StepReview";
import { TYPE_COLOR } from "@/components/booking/ServiceTypeIcon";

export const Route = createFileRoute("/$lang/book")({
  validateSearch: z.object({ service: z.string().optional() }),
  head: ({ params }) => routeHead({ params, routeKey: "book", path: "/book" }),
  component: BookingPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

interface FormState {
  serviceType: ServiceType | null;
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

  const [step, setStep] = useState<Step>(preselected ? 3 : 1);
  const [form, setForm] = useState<FormState>({
    serviceType: preselected?.type ?? null,
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

  const accent = form.serviceType ? TYPE_COLOR[form.serviceType] : "var(--moss-deep)";

  const canNext = (): boolean => {
    if (step === 1) return !!form.serviceType;
    if (step === 2) return !!form.serviceId;
    if (step === 3) return !!form.date && form.persons > 0;
    if (step === 4) return !!form.name && !!form.email;
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
      if (!form.serviceId) throw new Error(t("errors.generic"));
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
        .select("id, reference_code")
        .single();
      if (err) throw err;
      // Fire-and-forget: a failed email must not block the confirmation screen.
      void fetch("/api/public/booking-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: data.id }),
      }).catch(() => undefined);
      void navigate({
        to: "/$lang/book/confirmed/$ref",
        params: { lang, ref: data.reference_code },
        search: { email: form.email },
      });
    } catch (e) {
      setError((e as Error).message ?? t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-editorial py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-eyebrow">Wanderlust</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{t("booking.title")}</h1>

        <div className="mt-8">
          <BookingStepper step={step} accent={accent} />
        </div>

        <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 md:p-10 shadow-editorial">
          {step === 1 && (
            <StepType
              services={services ?? []}
              value={form.serviceType}
              onSelect={(tp) =>
                setForm((f) => ({ ...f, serviceType: tp, serviceId: f.serviceType === tp ? f.serviceId : null }))
              }
            />
          )}
          {step === 2 && form.serviceType && (
            <StepService
              services={services ?? []}
              type={form.serviceType}
              lang={lang}
              value={form.serviceId}
              onSelect={(id) => setForm({ ...form, serviceId: id })}
              onBackToType={() => {
                setForm((f) => ({ ...f, serviceId: null }));
                setStep(1);
              }}
            />
          )}
          {step === 3 && (
            <StepWhen
              service={selectedService}
              lang={lang}
              date={form.date}
              time={form.time}
              persons={form.persons}
              accent={accent}
              onChange={(patch) => setForm({ ...form, ...patch })}
            />
          )}
          {step === 4 && (
            <StepContact
              service={selectedService}
              lang={lang}
              name={form.name}
              email={form.email}
              phone={form.phone}
              country={form.country}
              notes={form.notes}
              accent={accent}
              onChange={(patch) => setForm({ ...form, ...patch })}
            />
          )}
          {step === 5 && (
            <StepReview
              service={selectedService}
              lang={lang}
              form={form}
              onChangeTerms={(v) => setForm({ ...form, terms: v })}
            />
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-10 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={step === 1}
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
            >
              <ArrowLeft className="h-4 w-4" /> {t("cta.back")}
            </Button>
            {step < 5 ? (
              <Button
                type="button"
                size="md"
                disabled={!canNext()}
                onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}
                style={{ backgroundColor: accent, color: "var(--paper)" }}
              >
                {t("cta.next")} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="md"
                disabled={!canNext() || submitting}
                onClick={submit}
                style={{ backgroundColor: accent, color: "var(--paper)" }}
              >
                {submitting ? "…" : t("booking.submit")}
              </Button>
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
