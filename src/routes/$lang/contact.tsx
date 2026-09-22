import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Mail, Phone, Send } from "lucide-react";
import { PhoneField } from "@/components/common/PhoneField";
import { EMPTY_PHONE, toE164, validatePhone, type PhoneParts } from "@/lib/phone";
import { supabase } from "@/integrations/supabase/client";
import { getPublicContacts } from "@/lib/contacts.functions";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { Button } from "@/components/ui/button";

import { routeHead } from "@/lib/route-head";

export const Route = createFileRoute("/$lang/contact")({
  // Контакты читаются на сервере, как на юридических страницах.
  //
  // Клиентским хуком телефон появлялся только после гидратации, и в
  // SSR-разметке страницы контактов ссылки tel: не было вовсе — проверено
  // запросом: ни одного href="tel:". То есть на странице, которая ровно для
  // этого и существует, номера не видели ни роботы, ни читалки без JS.
  loader: () => getPublicContacts(),
  head: ({ params }) => routeHead({ params, routeKey: "contact", path: "/contact" }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { email, phone } = Route.useLoaderData();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  // Телефон здесь НЕ обязателен — в отличие от брони: за ответом на вопрос
  // номер не нужен. Но если он введён, правила те же, что и в брони, иначе
  // в базе снова оказались бы номера без кода страны.
  const [formPhone, setFormPhone] = useState<PhoneParts>(EMPTY_PHONE);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const phoneError = validatePhone(formPhone, { required: false });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phoneError) {
      setPhoneTouched(true);
      return;
    }
    if (state === "sending") return;
    setState("sending");
    // Идентификатор задаём здесь, а не получаем обратно из базы.
    //
    // Раньше тут был .select("id").single() — то есть запрос с
    // Prefer: return=representation. Он требует права на ЧТЕНИЕ
    // contact_messages, а читать их может только администратор: единственная
    // политика на SELECT — contact_admin_all. PostgREST отвечал 401
    // (insufficient_privilege) и откатывал вставку, поэтому сообщение не
    // сохранялось вообще, посетитель видел ошибку, а уведомление не уходило.
    // Проверено запросом: 401, строк в базе 0.
    const messageId = crypto.randomUUID();
    const { error } = await supabase.from("contact_messages").insert({
      id: messageId,
      name: form.name,
      email: form.email,
      subject: form.subject || null,
      // Пусто — NULL, а не пустая строка: ограничение в базе проверяет формат
      // только у заполненных номеров.
      phone: toE164(formPhone) || null,
      message: form.message,
      language: lang,
    });
    if (!error) {
      void fetch("/api/public/contact-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId }),
      }).catch(() => undefined);
    }
    if (error) {
      // Сырой текст PostgREST посетителю ничего не объясняет и всегда
      // по-английски. Для телефона причина известна точно, остальное —
      // общий текст на языке страницы.
      setErrorMsg(
        /phone/i.test(error.message) ? t("booking.error_phone") : t("errors.generic"),
      );
      setState("error");
    } else {
      setState("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
      setFormPhone(EMPTY_PHONE);
      setPhoneTouched(false);
    }
  }

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="max-w-2xl">
        <p className="text-eyebrow">Wanderlust</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">{t("contact.title")}</h1>
        <p className="mt-4 text-ink-muted">{t("contact.subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-xl border border-border/60 bg-card p-6 md:p-8"
        >
          {state === "sent" ? (
            <p className="rounded-md bg-moss-soft px-4 py-3 text-moss-deep">{t("contact.sent")}</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder={t("contact.name")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
                <input
                  required
                  type="email"
                  placeholder={t("contact.email")}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </div>
              <PhoneField
                lang={lang}
                value={formPhone}
                onChange={(next) => setFormPhone(next)}
                error={phoneTouched ? phoneError : null}
                id="contact-phone"
              />
              <input
                placeholder={t("contact.subject")}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
              <textarea
                required
                rows={6}
                placeholder={t("contact.message")}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
              <Button
                type="submit"
                size="lg"
                aria-busy={state === "sending" || undefined}
                disabled={state === "sending"}
                className="self-start"
              >
                <Send className="h-4 w-4" />{" "}
                {state === "sending" ? t("booking.sending") : t("contact.send")}
              </Button>
              {state === "error" && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{errorMsg}</span>
                </p>
              )}
            </>
          )}
        </form>

        <aside className="space-y-4 text-sm">
          <p className="text-eyebrow">{t("contact.or_write")}</p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-foreground hover:text-moss-deep"
            >
              <Mail className="h-4 w-4" /> {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-foreground hover:text-moss-deep"
            >
              <Phone className="h-4 w-4" /> {phone}
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
