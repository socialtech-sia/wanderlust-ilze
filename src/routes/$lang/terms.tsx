import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { routeHead } from "@/lib/route-head";
import { useContactDetails } from "@/hooks/use-contact-details";

const UPDATED = "2026-07-07";

export const Route = createFileRoute("/$lang/terms")({
  head: ({ params }) => routeHead({ params, routeKey: "terms", path: "/terms" }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useTranslation();
  // Контакты берём из site_settings: они клиентские и меняются из админки.
  const { email, phone } = useContactDetails();

  const bookingItems = t("terms.booking.items", { returnObjects: true }) as string[];
  const userItems = t("terms.user.items", { returnObjects: true }) as string[];

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl">{t("terms.title")}</h1>
        <p className="mt-3 text-sm text-ink-muted">{t("terms.updated", { date: UPDATED })}</p>
        <p className="mt-4 text-ink-muted">{t("terms.intro")}</p>

        <Section title={t("terms.provider.title")}>
          <p>{t("terms.provider.text", { email, phone })}</p>
        </Section>

        <Section title={t("terms.services.title")}>
          <p>{t("terms.services.text")}</p>
        </Section>

        <Section title={t("terms.booking.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {bookingItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title={t("terms.user.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {userItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title={t("terms.ip.title")}>
          <p>{t("terms.ip.text")}</p>
        </Section>

        <Section title={t("terms.liability.title")}>
          <p>{t("terms.liability.text")}</p>
        </Section>

        <Section title={t("terms.force.title")}>
          <p>{t("terms.force.text")}</p>
        </Section>

        <Section title={t("terms.changes.title")}>
          <p>{t("terms.changes.text")}</p>
        </Section>

        <Section title={t("terms.law.title")}>
          <p>{t("terms.law.text")}</p>
        </Section>

        <Section title={t("terms.contact.title")}>
          <p>{t("terms.contact.text", { email, phone })}</p>
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
