import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useFeaturedServices } from "@/hooks/use-services";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { ServiceCard } from "@/components/services/ServiceCard";

export function FeaturedServices() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { data, isLoading } = useFeaturedServices(3);

  return (
    <section className="bg-paper-alt py-20 md:py-28">
      <div className="container-editorial">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow">02 · Selection</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl">
              {t("home.featured_title")}
            </h2>
            <p className="mt-3 text-ink-muted">{t("home.featured_subtitle")}</p>
          </div>
          <Link
            to="/$lang/tours"
            params={{ lang }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-moss-deep"
          >
            {t("cta.view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-paper" />
            ))}
          {data?.map((s, i) => <ServiceCard key={s.id} service={s} lang={lang} imageIndex={i} />)}
        </div>
      </div>
    </section>
  );
}
