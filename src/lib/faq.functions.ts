import { createServerFn } from "@tanstack/react-start";
import type { HomeFaq } from "@/lib/home-data";

/**
 * Вопросы и ответы на сервере.
 *
 * Страница FAQ — это и есть список вопросов. Пока он приезжал клиентским
 * запросом, аккордеон дорисовывался после гидратации и сдвигал страницу:
 * CLS 0.145 при пороге 0.1. Плюс содержимое не попадало в SSR-разметку,
 * а это ровно тот контент, ради которого страницу и открывают из поиска.
 */
export const getFaq = createServerFn({ method: "GET" }).handler(async (): Promise<HomeFaq[]> => {
  const { fetchAllFaq } = await import("@/lib/faq.server");
  return fetchAllFaq();
});
