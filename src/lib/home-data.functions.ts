import { createServerFn } from "@tanstack/react-start";
import type { HomeData } from "@/lib/home-data";

export const getHomeData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeData> => {
    const { fetchHomeData } = await import("@/lib/home-data.server");
    return fetchHomeData();
  },
);
