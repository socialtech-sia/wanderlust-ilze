import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { Button } from "@/components/ui/button";

import { routeHead } from "@/lib/route-head";

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => routeHead({ params, routeKey: "contact", path: "/contact" }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data: settings } = useSiteSettings();
  const email = (settings?.contact_email as string) ?? "";
  const phone = (settings?.contact_phone as string) ?? "";

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: form.name,
        email: form.email,
        subject: form.subject || null,
        message: form.message,
        language: lang,
      })
      .select("id")
      .single();
    if (!error && data) {
      void fetch("/api/public/contact-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: data.id }),
      }).catch(() => undefined);
    }
    if (error) {
      setErrorMsg(error.message);
      setState("error");
    } else {
      setState("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
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
        <form onSubmit={submit} className="grid gap-4 rounded-xl border border-border/60 bg-card p-6 md:p-8">
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
              {state === "error" && <p className="text-sm text-destructive">{errorMsg}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={state === "sending"}
                className="self-start"
              >
                <Send className="h-4 w-4" /> {t("contact.send")}
              </Button>
            </>
          )}
        </form>

        <aside className="space-y-4 text-sm">
          <p className="text-eyebrow">{t("contact.or_write")}</p>
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-foreground hover:text-moss-deep">
              <Mail className="h-4 w-4" /> {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-foreground hover:text-moss-deep">
              <Phone className="h-4 w-4" /> {phone}
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
