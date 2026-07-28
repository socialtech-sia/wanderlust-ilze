import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { Service } from "@/hooks/use-services";
import { useEnterGaujaCategories } from "@/hooks/use-services";
import { tField, tSlug, type Lang } from "@/lib/language";
import { formatDuration, formatPrice } from "@/lib/format";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { StrataHoverBar } from "@/components/common/Strata";

const CAT_VAR: Record<string, string> = {
  action: "var(--cat-action)",
  nature: "var(--cat-nature)",
  history: "var(--cat-history)",
  culture: "var(--cat-culture)",
  getaround: "var(--cat-getaround)",
};

export function ServiceCard({
  service,
  lang,
  imageIndex = 0,
}: {
  service: Service;
  lang: Lang;
  imageIndex?: number;
}) {
  const { t } = useTranslation();
  const { data: cats } = useEnterGaujaCategories();
  const title = tField(service, "title", lang);
  const desc = tField(service, "short_description", lang);
  const slug = tSlug(service, lang);
  const stockImg = STOCK_IMAGES[imageIndex % STOCK_IMAGES.length];

  const meta = [
    service.duration_minutes ? formatDuration(service.duration_minutes, lang) : null,
    service.max_persons ? t("service.persons_max", { count: service.max_persons }) : null,
    service.location_name || null,
  ].filter(Boolean) as string[];

  const strataColors = (service.enter_gauja_categories ?? [])
    .map((c) => CAT_VAR[c])
    .filter(Boolean);

  return (
    <Link
      to="/$lang/s/$slug"
      params={{ lang, slug }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-[color-mix(in_oklab,var(--sandstone)_55%,transparent)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg">
        <img
          src={stockImg}
          alt={[title, service.location_name, "Gauja National Park, Latvia"].filter(Boolean).join(" — ")}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        {service.enter_gauja_categories?.length ? (
          <div className="absolute left-0 top-0 flex flex-wrap">
            {service.enter_gauja_categories.slice(0, 2).map((c) => (
              <CategoryBadge key={c} category={c} lang={lang} categoriesData={cats} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 pb-8">
        <h3 className="display-3 text-foreground">{title}</h3>
        {desc ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        ) : null}

        {meta.length ? (
          <p className="text-utility mt-1 text-[11px] text-muted-foreground">
            {meta.join(" · ")}
          </p>
        ) : null}

        {service.price_from_eur != null && (
          <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-border pt-4">
            <span className="font-display text-2xl leading-none text-foreground">
              {formatPrice(Number(service.price_from_eur))}
            </span>
            <span className="text-utility text-[10px] text-muted-foreground">
              {service.price_per_person ? t("service.price_per_person") : t("service.price_per_trip")}
            </span>
          </div>
        )}
      </div>

      <StrataHoverBar colors={strataColors} />
    </Link>
  );
}

// Free stock placeholders (Unsplash) — will be swapped for admin-uploaded media in Phase 2.
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1200&q=70", // castle
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=70", // forest
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=70", // hiking
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=70", // river
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=70", // cliffs
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70", // path
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=70", // sunset
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=70", // car/road
];
