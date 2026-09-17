/**
 * Server-side data fetch for the home page.
 * Runs on the server (SSR + prerender) with a publishable-key client, so the
 * landing page HTML already contains real content (SEO + LCP).
 * Every query degrades to an empty result instead of throwing.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { buildMediaAltMap } from "@/lib/home-data";
import type {
  HomeData,
  HomeFaq,
  HomeProfile,
  HomeService,
  HomeTestimonial,
  SiteSettingsMap,
} from "@/lib/home-data";

function publicClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchHomeData(): Promise<HomeData> {
  const empty: HomeData = {
    services: [],
    faq: [],
    profile: null,
    testimonials: [],
    settings: {},
    mediaAlt: {},
  };
  const supabase = publicClient();
  if (!supabase) return empty;

  try {
    const [servicesRes, faqRes, profileRes, testimonialsRes, settingsRes, mediaRes] =
      await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("faq")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(4),
        supabase
          .from("profile")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(3),
        supabase.from("site_settings").select("key, value"),
        // alt-тексты загруженных файлов. Страницы знают про картинку только
        // путь в бакете, а alt лежит здесь; без этого запроса alt оставался бы
        // тем, что зашит в коде.
        supabase.from("media").select("storage_path, alt_lv, alt_en, alt_es"),
      ]);

    const settings: SiteSettingsMap = {};
    for (const row of settingsRes.data ?? [])
      settings[row.key] = row.value as SiteSettingsMap[string];

    const mediaAlt = buildMediaAltMap(mediaRes.data);

    return {
      services: (servicesRes.data ?? []) as HomeService[],
      faq: (faqRes.data ?? []) as HomeFaq[],
      profile: (profileRes.data ?? null) as HomeProfile | null,
      testimonials: (testimonialsRes.data ?? []) as HomeTestimonial[],
      settings,
      mediaAlt,
    };
  } catch (err) {
    console.error("[home] data fetch failed", err);
    return empty;
  }
}
