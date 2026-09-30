/**
 * Название и тип услуги для брони.
 *
 * Берём из `service_snapshot` — слепка, который `create_booking` сохраняет
 * в момент заявки. Джойн с `services` для этого не годится: услугу могли
 * переименовать или удалить уже после брони, и в списке появилось бы
 * не то, что заказывал клиент.
 *
 * Снапшот пишется на языке, на котором бронировали (см. `book.tsx`),
 * поэтому у испанца там испанский заголовок. Так и надо: администратор
 * видит ровно то, что видел клиент.
 *
 * Джойн остаётся запасным вариантом — для броней до появления снапшота
 * и на случай, если он окажется пустым.
 */

import type { Tables } from "@/integrations/supabase/types";

type ServiceType = Tables<"services">["type"];

/** Подписи типов для админки — латышские, как и вся остальная админка. */
export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  excursion: "Ekskursija",
  hiking: "Pārgājiens",
  transfer: "Transfērs",
};

/** То, что кладёт в снапшот `book.tsx`. Все поля считаем ненадёжными. */
interface ServiceSnapshot {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  price_from_eur?: unknown;
}

export interface BookingServiceInfo {
  /** Название услуги на момент брони; null — если взять неоткуда. */
  title: string | null;
  /** Подпись типа, уже готовая к показу (капсом её делает CSS). */
  typeLabel: string | null;
  /** Откуда взяли: снапшот целиком, джойн целиком или ничего. */
  source: "snapshot" | "service" | "none";
}

const isType = (v: unknown): v is ServiceType =>
  v === "excursion" || v === "hiking" || v === "transfer";

const trimmed = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
};

/**
 * Откат делаем по каждому полю отдельно, а не «снапшот целиком или джойн
 * целиком». Снапшот бывает неполным — например, тип есть, а заголовок
 * пустой; брать в такой ситуации прочерк вместо живого названия из
 * `services` незачем.
 *
 * @param snapshot `bookings.service_snapshot` как есть (Json | null)
 * @param fallback строка из `services`, подтянутая джойном, если она есть
 */
export function bookingServiceInfo(
  snapshot: unknown,
  fallback?: { type?: unknown; title_lv?: unknown; title_en?: unknown } | null,
): BookingServiceInfo {
  const snap = (snapshot ?? null) as ServiceSnapshot | null;

  const snapTitle = snap ? trimmed(snap.title) : null;
  const snapType = snap && isType(snap.type) ? snap.type : null;

  const fbTitle = trimmed(fallback?.title_lv) ?? trimmed(fallback?.title_en);
  const fbType = isType(fallback?.type) ? fallback.type : null;

  const title = snapTitle ?? fbTitle;
  const type = snapType ?? fbType;

  const source =
    title === null && type === null ? "none" : snapTitle || snapType ? "snapshot" : "service";

  return { title, typeLabel: type ? SERVICE_TYPE_LABEL[type] : null, source };
}
