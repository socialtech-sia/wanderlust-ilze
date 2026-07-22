import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Clock, Users, MapPin } from "lucide-react";
import type { Service } from "@/hooks/use-services";
import { useEnterGaujaCategories } from "@/hooks/use-services";
import { tField, tSlug, type Lang } from "@/lib/language";
import { formatDuration, formatPrice } from "@/lib/format";
import { CategoryBadge } from "@/components/common/CategoryBadge";

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

  return (
    <Link
      to="/$lang/s/$slug"
      params={{ lang, slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:shadow-editorial"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-alt">
        <img
          src={stockImg}
          alt={[title, service.location_name, "Gauja National Park, Latvia"].filter(Boolean).join(" — ")}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {service.enter_gauja_categories?.length ? (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {service.enter_gauja_categories.slice(0, 2).map((c) => (
              <CategoryBadge key={c} category={c} lang={lang} categoriesData={cats} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl leading-tight text-foreground">{title}</h3>
        {desc && <p className="text-sm leading-relaxed text-ink-muted line-clamp-3">{desc}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs text-ink-muted">
          {service.duration_minutes && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(service.duration_minutes, lang)}
            </span>
          )}
          {service.max_persons && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {t("service.persons_max", { count: service.max_persons })}
            </span>
          )}
          {service.location_name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {service.location_name}
            </span>
          )}
        </div>
        {service.price_from_eur != null && (
          <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
            <span className="text-eyebrow">
              {t("service.price_from", { price: formatPrice(Number(service.price_from_eur)) })}
            </span>
            <span className="text-xs text-ink-muted">
              {service.price_per_person ? t("service.price_per_person") : t("service.price_per_trip")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// Free stock placeholders (Unsplash) — will be swapped for admin-uploaded media in Phase 2.
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1470217957101-da7150b3b77d?auto=format&fit=crop&w=1200&q=70", // castle
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=70", // forest
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=70", // hiking
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=70", // river
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=70", // cliffs
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70", // path
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=70", // sunset
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=70", // car/road
];
