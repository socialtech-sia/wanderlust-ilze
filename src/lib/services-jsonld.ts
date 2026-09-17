/**
 * Helper to build ItemList JSON-LD for services listing pages
 * (tours, hiking, transfers). Runs in route loaders so the schema
 * lands in SSR-rendered HTML for crawlers.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { SiteSettingsMap } from "@/lib/home-data";
import { firstImageSrc } from "@/lib/images";
import { tField, tSlug, type Lang } from "@/lib/language";
import {
  buildItemList,
  type ItemListEntry,
} from "@/lib/seo";
import {
  pickPrimaryCategory,
  defaultCategoryForType,
} from "@/lib/enter-gauja";

type Service = Tables<"services">;

export interface ServicesListData {
  services: Service[];
  /** site_settings, прочитанные тем же загрузчиком. Нужны из-за картинки
   *  шапки: клиентским useSiteSettings она приезжала уже после гидратации,
   *  и в SSR-разметке всегда оставалась стоковая — то есть загруженная через
   *  админку фотография не попадала ни в первый кадр, ни к роботам. */
  settings: SiteSettingsMap;
}

export async function loadServicesForList(type: Service["type"]): Promise<ServicesListData> {
  const [servicesRes, settingsRes] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("type", type)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("key, value"),
  ]);
  const settings: SiteSettingsMap = {};
  for (const row of settingsRes.data ?? [])
    settings[row.key] = row.value as SiteSettingsMap[string];
  return { services: (servicesRes.data ?? []) as Service[], settings };
}

export function servicesToItemListJsonLd(
  lang: Lang,
  listName: string,
  services: Service[],
): object {
  const entries: ItemListEntry[] = services.map((s) => {
    const slug = tSlug(s, lang) || s.id;
    const cat =
      pickPrimaryCategory({
        enter_gauja_categories: (s.enter_gauja_categories as string[] | null) ?? null,
      }) ?? defaultCategoryForType(s.type);
    return {
      name: tField(s, "title", lang) || slug,
      path: `/s/${slug}`,
      description:
        tField(s, "short_description", lang) ||
        tField(s, "description", lang).slice(0, 155) ||
        undefined,
      // Абсолютный адрес файла, а не путь в бакете: в schema.org уезжает
      // ссылка, которую должен уметь открыть робот.
      image: firstImageSrc(s.hero_image_storage_path) || undefined,
      priceEur: s.price_from_eur != null ? Number(s.price_from_eur) : null,
      category: cat,
      locationName: (s.location_name as string | null) ?? null,
      latitude: (s.location_lat as number | null) ?? null,
      longitude: (s.location_lng as number | null) ?? null,
    };
  });
  return buildItemList(lang, listName, entries);
}
