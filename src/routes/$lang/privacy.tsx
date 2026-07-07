import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

import { routeHead } from "@/lib/route-head";

export const Route = createFileRoute("/$lang/privacy")({
  head: ({ params }) => routeHead({ params, routeKey: "privacy", path: "/privacy" }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation();

  const collectedItems = t("privacy.collected.items", { returnObjects: true }) as string[];
  const usageItems = t("privacy.usage.items", { returnObjects: true }) as string[];
  const legalBasisItems = t("privacy.legal_basis.items", { returnObjects: true }) as string[];
  const rightsItems = t("privacy.rights.items", { returnObjects: true }) as string[];

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl">{t("privacy.title")}</h1>
        <p className="mt-4 text-ink-muted">{t("privacy.intro")}</p>

        <PrivacySection title={t("privacy.controller.title")}>
          <p>{t("privacy.controller.text")}</p>
        </PrivacySection>

        <PrivacySection title={t("privacy.collected.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {collectedItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </PrivacySection>

        <PrivacySection title={t("privacy.usage.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {usageItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </PrivacySection>

        <PrivacySection title={t("privacy.legal_basis.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {legalBasisItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </PrivacySection>

        <PrivacySection title={t("privacy.sharing.title")}>
          <p>{t("privacy.sharing.text")}</p>
        </PrivacySection>

        <PrivacySection title={t("privacy.retention.title")}>
          <p>{t("privacy.retention.text")}</p>
        </PrivacySection>

        <PrivacySection title={t("privacy.rights.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {rightsItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </PrivacySection>

        <PrivacySection title={t("privacy.cookies.title")}>
          <p>{t("privacy.cookies.text")}</p>
        </PrivacySection>

        <PrivacySection title={t("privacy.security.title")}>
          <p>{t("privacy.security.text")}</p>
        </PrivacySection>

        <PrivacySection title={t("privacy.changes.title")}>
          <p>{t("privacy.changes.text")}</p>
        </PrivacySection>

        <PrivacySection title={t("privacy.contact.title")}>
          <p>{t("privacy.contact.text")}</p>
        </PrivacySection>
      </div>
    </div>
  );
}

function PrivacySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-ink/90">{children}</div>
    </section>
  );
}
