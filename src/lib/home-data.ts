/**
 * Server-side data loader for the home page.
 * Runs in the route loader so the landing page is rendered with real
 * content during SSR (SEO + LCP). Every query degrades to an empty
 * result instead of throwing, so an empty database never breaks the page.
 */

import type { Tables } from "@/integrations/supabase/types";

export type HomeService = Tables<"services">;
export type HomeFaq = Tables<"faq">;
export type HomeProfile = Tables<"profile">;
export type HomeTestimonial = Tables<"testimonials">;

/** Значение настройки: то, что реально лежит в jsonb. `unknown` здесь не
 *  годится — загрузчик маршрута требует сериализуемый тип. */
export type SettingValue = string | number | boolean | null | SettingValue[] | { [k: string]: SettingValue };
export type SiteSettingsMap = Record<string, SettingValue>;

export interface HomeData {
  services: HomeService[];
  faq: HomeFaq[];
  profile: HomeProfile | null;
  testimonials: HomeTestimonial[];
  /** site_settings, прочитанные на сервере. Без них hero берёт заголовок
   *  клиентским запросом, текст меняется уже после гидратации, и страница
   *  дёргается: на мобильном это давало CLS 0.14 при пороге 0.1. */
  settings: SiteSettingsMap;
}

export interface TypeStats {
  count: number;
  minDuration: number | null;
  maxDuration: number | null;
  priceFrom: number | null;
}

export function statsForType(
  services: HomeService[],
  type: HomeService["type"],
): TypeStats {
  const rows = services.filter((s) => s.type === type);
  const durations = rows
    .map((s) => s.duration_minutes)
    .filter((d): d is number => typeof d === "number" && d > 0);
  const prices = rows
    .map((s) => (s.price_from_eur == null ? null : Number(s.price_from_eur)))
    .filter((p): p is number => p != null && !Number.isNaN(p));
  return {
    count: rows.length,
    minDuration: durations.length ? Math.min(...durations) : null,
    maxDuration: durations.length ? Math.max(...durations) : null,
    priceFrom: prices.length ? Math.min(...prices) : null,
  };
}

/** Mixed selection for the featured grid: 2 tours + 2 hikes + 1 transfer. */
export function pickFeatured(services: HomeService[]): HomeService[] {
  const take = (type: HomeService["type"], n: number) =>
    services.filter((s) => s.type === type).slice(0, n);
  const mixed = [
    ...take("excursion", 2),
    ...take("hiking", 2),
    ...take("transfer", 1),
  ];
  if (mixed.length >= 3) return mixed;
  return services.slice(0, 5);
}
