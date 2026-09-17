import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Service = Tables<"services">;
export type SiteSetting = Tables<"site_settings">;
export type FaqRow = Tables<"faq">;
export type EnterGaujaCategoryRow = Tables<"enter_gauja_categories">;
export type Profile = Tables<"profile">;
export type ServiceType = Service["type"];

/**
 * Минута, а не пять.
 *
 * Из site_settings приходит всё, что клиент правит в админке: контакты,
 * заголовки hero, пути к картинкам. При staleTime в пять минут сохранение в
 * админке выглядело как «ничего не изменилось» — вкладка с открытым сайтом
 * ещё несколько минут показывала старое значение. Минута — верхняя граница
 * того, что клиент готов ждать после «Saglabāt».
 */
const ADMIN_EDITABLE_STALE_MS = 60_000;

async function fetchServicesByType(type: ServiceType): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("type", type)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export function useServicesByType(type: ServiceType) {
  return useQuery({
    queryKey: ["services", type],
    queryFn: () => fetchServicesByType(type),
    staleTime: ADMIN_EDITABLE_STALE_MS,
  });
}

async function fetchFeaturedServices(limit = 3): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .eq("type", "excursion")
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Service[];
}

export function useFeaturedServices(limit = 3) {
  return useQuery({
    queryKey: ["services", "featured", limit],
    queryFn: () => fetchFeaturedServices(limit),
    staleTime: ADMIN_EDITABLE_STALE_MS,
  });
}

async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .or(`slug_lv.eq.${slug},slug_en.eq.${slug},slug_es.eq.${slug}`)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Service | null;
}

export function useServiceBySlug(slug: string) {
  return useQuery({
    queryKey: ["service", slug],
    queryFn: () => fetchServiceBySlug(slug),
    enabled: !!slug,
    staleTime: ADMIN_EDITABLE_STALE_MS,
  });
}

async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export function useAllServices() {
  return useQuery({
    queryKey: ["services", "all"],
    queryFn: fetchAllServices,
    staleTime: ADMIN_EDITABLE_STALE_MS,
  });
}

async function fetchSiteSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: ADMIN_EDITABLE_STALE_MS,
  });
}

async function fetchFaq(): Promise<FaqRow[]> {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FaqRow[];
}

export function useFaq() {
  return useQuery({ queryKey: ["faq"], queryFn: fetchFaq, staleTime: ADMIN_EDITABLE_STALE_MS });
}

async function fetchCategories(): Promise<EnterGaujaCategoryRow[]> {
  const { data, error } = await supabase
    .from("enter_gauja_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EnterGaujaCategoryRow[];
}

export function useEnterGaujaCategories() {
  return useQuery({
    queryKey: ["enter_gauja_categories"],
    queryFn: fetchCategories,
    // Здесь десять минут намеренно: таблица категорий Enter Gauja — это
    // фиксированный справочник партнёра, в админке его страницы нет.
    staleTime: 600_000,
  });
}

async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Profile | null;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: ADMIN_EDITABLE_STALE_MS,
  });
}
