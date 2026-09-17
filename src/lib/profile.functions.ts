import { createServerFn } from "@tanstack/react-start";
import type { HomeProfile, SiteSettingsMap } from "@/lib/home-data";

/**
 * Профиль и site_settings для страницы «Par mani», на сервере.
 *
 * Страница состоит из профиля почти целиком — имя, роль, биография,
 * сертификаты. Пока он грузился клиентским запросом, всё это появлялось уже
 * после гидратации и сдвигало макет: CLS 0.64 на мобильном при пороге 0.1.
 *
 * Настройки здесь же и по той же причине: из них берётся картинка шапки
 * (about_hero_storage_path). Пока их читал клиентский хук, в SSR-разметке
 * всегда оставалась стоковая фотография — то есть загруженная через админку
 * не попадала ни в первый кадр, ни к роботам.
 */
export const getAboutData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ profile: HomeProfile | null; settings: SiteSettingsMap }> => {
    const { fetchHomeData } = await import("@/lib/home-data.server");
    const { profile, settings } = await fetchHomeData();
    return { profile, settings };
  },
);
