import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { HomeFaq } from "@/lib/home-data";

/** Все активные вопросы. Пустой список вместо исключения: страница обязана открыться. */
export async function fetchAllFaq(): Promise<HomeFaq[]> {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from("faq")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return (data ?? []) as HomeFaq[];
  } catch (err) {
    console.error("[faq] fetch failed", err);
    return [];
  }
}
