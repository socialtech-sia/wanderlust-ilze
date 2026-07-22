/**
 * Helper to build ItemList JSON-LD for services listing pages
 * (tours, hiking, transfers). Runs in route loaders so the schema
 * lands in SSR-rendered HTML for crawlers.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
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

export async function loadServicesForList(type: Service["type"]): Promise<Service[]> {
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("type", type)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Service[];
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
      image: (s.hero_image_storage_path as string | null) ?? undefined,
      priceEur: s.price_from_eur != null ? Number(s.price_from_eur) : null,
      category: cat,
      locationName: (s.location_name as string | null) ?? null,
      latitude: (s.location_lat as number | null) ?? null,
      longitude: (s.location_lng as number | null) ?? null,
    };
  });
  return buildItemList(lang, listName, entries);
}
