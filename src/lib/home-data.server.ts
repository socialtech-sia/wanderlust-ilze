/**
 * Server-side data fetch for the home page.
 * Runs on the server (SSR + prerender) with a publishable-key client, so the
 * landing page HTML already contains real content (SEO + LCP).
 * Every query degrades to an empty result instead of throwing.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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
  };
  const supabase = publicClient();
  if (!supabase) return empty;

  try {
    const [servicesRes, faqRes, profileRes, testimonialsRes, settingsRes] = await Promise.all([
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
    ]);

    const settings: SiteSettingsMap = {};
    for (const row of settingsRes.data ?? []) settings[row.key] = row.value as SiteSettingsMap[string];

    return {
      services: (servicesRes.data ?? []) as HomeService[],
      faq: (faqRes.data ?? []) as HomeFaq[],
      profile: (profileRes.data ?? null) as HomeProfile | null,
      testimonials: (testimonialsRes.data ?? []) as HomeTestimonial[],
      settings,
    };
  } catch (err) {
    console.error("[home] data fetch failed", err);
    return empty;
  }
}
