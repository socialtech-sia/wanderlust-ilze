import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { openConsentSettings } from "@/lib/cookie-consent";
import { routeHead } from "@/lib/route-head";
import { getPublicContacts } from "@/lib/contacts.functions";

const UPDATED = "2026-07-07";

export const Route = createFileRoute("/$lang/cookies")({
  // Контакты читаются на сервере: в юридический текст они подставляются
  // прямо в предложение, и пустое место в SSR-разметке недопустимо.
  loader: () => getPublicContacts(),
  head: ({ params }) => routeHead({ params, routeKey: "cookies", path: "/cookies" }),
  component: CookiesPage,
});

function CookiesPage() {
  const { t } = useTranslation();
  // Контакты берём из site_settings: они клиентские и меняются из админки.
  const { email, phone } = Route.useLoaderData();

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl">{t("cookies.title")}</h1>
        <p className="mt-3 text-sm text-ink-muted">{t("cookies.updated", { date: UPDATED })}</p>
        <p className="mt-4 text-ink-muted">{t("cookies.intro")}</p>

        <Section title={t("cookies.what.title")}>
          <p>{t("cookies.what.text")}</p>
        </Section>

        <Section title={t("cookies.types.title")}>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t("cookies.types.necessary")}</li>
            <li>{t("cookies.types.analytics")}</li>
            <li>{t("cookies.types.marketing")}</li>
          </ul>
        </Section>

        <Section title={t("cookies.retention.title")}>
          <p>{t("cookies.retention.text")}</p>
        </Section>

        <Section title={t("cookies.manage.title")}>
          <p>{t("cookies.manage.text")}</p>
          <div className="mt-4">
            <Button onClick={openConsentSettings}>{t("cookies.manage.button")}</Button>
          </div>
        </Section>

        <Section title={t("cookies.changes.title")}>
          <p>{t("cookies.changes.text")}</p>
        </Section>

        <Section title={t("cookies.contact.title")}>
          <p>{t("cookies.contact.text", { email, phone })}</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-foreground/90">{children}</div>
    </section>
  );
}
