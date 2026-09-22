import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
import { TYPE_COLOR, TYPE_ON_COLOR } from "@/components/booking/ServiceTypeIcon";
import { bookingErrorKey } from "@/lib/booking-errors";
import {
  EMPTY_PHONE,
  toE164,
  validatePhone,
  type PhoneErrorCode,
  type PhoneParts,
} from "@/lib/phone";

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
  phone: PhoneParts;
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
        (s) =>
          s.slug_lv === preselectedSlug ||
          s.slug_en === preselectedSlug ||
          s.slug_es === preselectedSlug,
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
    phone: EMPTY_PHONE,
    country: "",
    notes: "",
    terms: false,
    language: lang,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ошибка телефона показывается только после попытки уйти дальше: подсвечивать
  // поле красным, пока посетитель ещё набирает номер, — враньё.
  const [phoneTouched, setPhoneTouched] = useState(false);
  // Замок от второго нажатия. Состояния `submitting` для этого мало: React
  // применяет setState асинхронно, и два быстрых клика успевают войти в
  // обработчик до перерисовки — получалось две одинаковые брони, вторая из
  // которых падала на проверке дублей и показывала посетителю ошибку.
  const inFlight = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const selectedService: Service | null = services?.find((s) => s.id === form.serviceId) ?? null;

  const accent = form.serviceType ? TYPE_COLOR[form.serviceType] : "var(--sandstone)";
  // Текст на кнопке подбирается под фон: на цветах категорий белый не
  // дотягивает до 4.5:1, см. TYPE_ON_COLOR.
  const onAccent = form.serviceType ? TYPE_ON_COLOR[form.serviceType] : "var(--on-accent)";

  const phoneError: PhoneErrorCode | null = validatePhone(form.phone, { required: true });

  const canNext = (): boolean => {
    if (step === 1) return !!form.serviceType;
    if (step === 2) return !!form.serviceId;
    if (step === 3) return !!form.date && form.persons > 0;
    if (step === 4) return !!form.name && !!form.email && !phoneError;
    return form.terms;
  };

  // Сообщение об ошибке живёт рядом с кнопкой, но на узком экране шаг 5
  // длиннее вьюпорта, и появившийся текст оказывался за нижней границей.
  // Поэтому после отказа прокручиваем к нему, а не надеемся, что заметят.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);

  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
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
      if (validatePhone(form.phone, { required: true })) {
        setPhoneTouched(true);
        setStep(4);
        throw new Error("Invalid phone");
      }
      const { data: rows, error: err } = await supabase.rpc("create_booking", {
        p_service_id: form.serviceId,
        p_service_snapshot: snapshot,
        p_requested_date: form.date,
        // time is nullable in the database; the generated types don't model that
        p_requested_time: (form.time || null) as unknown as string,
        p_persons_count: form.persons,
        p_customer_name: form.name,
        p_customer_email: form.email,
        // В базу — строго E.164: «+37129123456», без пробелов и скобок.
        p_customer_phone: toE164(form.phone),
        p_customer_country: form.country || "",
        p_customer_language: form.language,
        p_notes: form.notes || "",
      });
      if (err) throw err;
      const data = Array.isArray(rows) ? rows[0] : rows;
      if (!data) throw new Error(t("errors.generic"));
      // Fire-and-forget: a failed email must not block the confirmation screen.
      void fetch("/api/public/booking-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: data.id }),
      }).catch(() => undefined);

      // Переход НЕ fire-and-forget.
      //
      // Раньше здесь стояло `void navigate(...)`: обещание отбрасывалось, и
      // если переход не состоялся, посетитель оставался на шаге 5 с той же
      // кнопкой — ровно то, на что жаловался клиент. Теперь перехода
      // дожидаемся, а если после него адрес не сменился, уходим на
      // подтверждение обычной сменой документа. Бронь уже в базе, и показать
      // её код важнее, чем сохранить SPA-переход.
      const target = `/${lang}/book/confirmed/${encodeURIComponent(
        data.reference_code,
      )}?email=${encodeURIComponent(form.email)}`;
      try {
        await navigate({
          to: "/$lang/book/confirmed/$ref",
          params: { lang, ref: data.reference_code },
          search: { email: form.email },
        });
      } catch {
        window.location.assign(target);
        return;
      }
      if (!window.location.pathname.includes("/book/confirmed/")) {
        window.location.assign(target);
        return;
      }
      // Успех: замок и «отправка» НЕ снимаются намеренно — эта страница уже
      // уходит, а разблокированная кнопка успела бы принять ещё один клик.
      return;
    } catch (e) {
      const key = bookingErrorKey(e);
      setError(key ? t(`booking.${key}`) : t("errors.generic"));
      inFlight.current = false;
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

        <div className="mt-8 rounded-xl border border-border/60 bg-card p-6 md:p-10 shadow-editorial">
          {step === 1 && (
            <StepType
              services={services ?? []}
              value={form.serviceType}
              onSelect={(tp) =>
                setForm((f) => ({
                  ...f,
                  serviceType: tp,
                  serviceId: f.serviceType === tp ? f.serviceId : null,
                }))
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
              phoneError={phoneTouched ? phoneError : null}
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
              form={{ ...form, phone: toE164(form.phone) }}
              onChangeTerms={(v) => setForm({ ...form, terms: v })}
            />
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
                data-testid="booking-next"
                disabled={!canNext()}
                onClick={() => {
                  if (step === 4) setPhoneTouched(true);
                  setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
                }}
                style={{ backgroundColor: accent, color: onAccent }}
              >
                {t("cta.next")} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="md"
                data-testid="booking-submit"
                // aria-busy, а не только disabled: читалка должна сказать
                // «занято», а не молча перестать реагировать на кнопку.
                aria-busy={submitting || undefined}
                disabled={!canNext() || submitting}
                onClick={submit}
                style={{ backgroundColor: accent, color: onAccent }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t("booking.sending")}
                  </>
                ) : (
                  t("booking.submit")
                )}
              </Button>
            )}
          </div>

          {/* Ошибка — под самой кнопкой, а не в начале карточки.
              Клиент жаловался, что сообщения не видно: на шаге 5 карточка
              выше экрана, и текст над кнопкой оставался за кадром. */}
          {error && (
            <p
              ref={errorRef}
              role="alert"
              data-testid="booking-error"
              className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          )}
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
