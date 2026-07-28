import { useTranslation } from "react-i18next";
import { BadgeCheck, Users, Languages, Route } from "lucide-react";

const FACTS = [
  { icon: BadgeCheck, key: "certified" },
  { icon: Users, key: "groups" },
  { icon: Languages, key: "languages" },
  { icon: Route, key: "custom" },
] as const;

export function KeyFacts() {
  const { t } = useTranslation();

  return (
    <section data-header-tone="dark" className="surface-dark border-y border-border">
      <div className="container-editorial grid grid-cols-2 gap-x-6 gap-y-7 py-8 md:grid-cols-4 md:py-10">
        {FACTS.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-moss-deep" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-foreground">
                {t(`facts.${key}_title`)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {t(`facts.${key}_text`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
