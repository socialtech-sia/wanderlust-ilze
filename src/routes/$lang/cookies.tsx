import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { openConsentSettings } from "@/lib/cookie-consent";

const UPDATED = "2026-07-07";

export const Route = createFileRoute("/$lang/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie policy — Wanderlust.lv" },
      {
        name: "description",
        content:
          "How Wanderlust.lv uses cookies and how you can manage your preferences.",
      },
      { property: "og:title", content: "Cookie policy — Wanderlust.lv" },
      {
        property: "og:description",
        content: "How Wanderlust.lv uses cookies and manages consent.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const { t } = useTranslation();

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl">{t("cookies.title")}</h1>
        <p className="mt-3 text-sm text-ink-muted">
          {t("cookies.updated", { date: UPDATED })}
        </p>
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
            <Button onClick={openConsentSettings}>
              {t("cookies.manage.button")}
            </Button>
          </div>
        </Section>

        <Section title={t("cookies.changes.title")}>
          <p>{t("cookies.changes.text")}</p>
        </Section>

        <Section title={t("cookies.contact.title")}>
          <p>{t("cookies.contact.text")}</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-ink/90">{children}</div>
    </section>
  );
}
