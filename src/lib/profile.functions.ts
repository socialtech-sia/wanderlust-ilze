import { createServerFn } from "@tanstack/react-start";
import type { HomeProfile } from "@/lib/home-data";

/**
 * Профиль гида на сервере.
 *
 * Страница «О гиде» состоит из профиля почти целиком — имя, роль, биография,
 * сертификаты. Пока он грузился клиентским запросом, всё это появлялось уже
 * после гидратации и сдвигало макет: CLS 0.64 на мобильном при пороге 0.1.
 */
export const getProfile = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeProfile | null> => {
    const { fetchHomeData } = await import("@/lib/home-data.server");
    const { profile } = await fetchHomeData();
    return profile;
  },
);
