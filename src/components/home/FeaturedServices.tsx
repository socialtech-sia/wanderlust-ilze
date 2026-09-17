import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { ServiceCard } from "@/components/services/ServiceCard";
import { pickFeatured, type HomeService, type MediaAltMap } from "@/lib/home-data";

export function FeaturedServices({
  services = [],
  mediaAlt,
}: {
  services?: HomeService[];
  mediaAlt?: MediaAltMap;
}) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const featured = pickFeatured(services);

  if (!featured.length) return null;

  return (
    <section data-header-tone="dark" className="surface-dark section-y">
      <div className="container-editorial">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow">04 · {t("home.selection_eyebrow")}</p>
            <h2 className="mt-2 display-2">
              {t("home.featured_title")}
            </h2>
            <p className="mt-3 text-ink-muted">{t("home.featured_subtitle")}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s, i) => (
            <ServiceCard key={s.id} service={s} lang={lang} imageIndex={i} mediaAlt={mediaAlt} />
          ))}
        </div>

        <Link
          to="/$lang/tours"
          params={{ lang }}
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-moss-deep"
        >
          {t("home.featured_all")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
