/**
 * Перевод ошибки отправки брони в сообщение на языке интерфейса.
 *
 * Раньше посетителю показывался `error.message` как есть — то есть текст из
 * PostgreSQL по-английски («Duplicate booking already submitted for this
 * service and time») на латышской странице. Формально это была ошибка, а по
 * сути — ничего не объясняющая строка.
 *
 * Сопоставление идёт по тексту исключения, а не по SQLSTATE: все проверки в
 * create_booking и в триггере enforce_booking_limits поднимают один и тот же
 * код 23514 (check_violation), и различить их можно только по сообщению.
 * Поэтому строки здесь обязаны совпадать с теми, что в SQL; при правке
 * миграции правится и этот список.
 */

/** Ключ i18n внутри секции `booking.`, либо null — тогда общий текст. */
export type BookingErrorKey =
  | "error_duplicate"
  | "error_rate_limit"
  | "error_email"
  | "error_name"
  | "error_date"
  | "error_persons"
  | "error_phone"
  | "error_network";

const BY_MESSAGE: ReadonlyArray<readonly [RegExp, BookingErrorKey]> = [
  [/duplicate booking/i, "error_duplicate"],
  [/too many booking requests/i, "error_rate_limit"],
  [/invalid email/i, "error_email"],
  [/invalid name/i, "error_name"],
  [/invalid date/i, "error_date"],
  [/invalid group size/i, "error_persons"],
  [/invalid phone|phone number must be/i, "error_phone"],
];

/**
 * Сетевой сбой отличается от отказа базы: базе мы не дозвонились вообще, и
 * «проверьте интернет» здесь единственный полезный совет. fetch роняет
 * TypeError с разным текстом в разных браузерах, отсюда несколько вариантов.
 */
const NETWORK = /failed to fetch|networkerror|load failed|network request failed/i;

export function bookingErrorKey(error: unknown): BookingErrorKey | null {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error ?? "");
  if (NETWORK.test(message)) return "error_network";
  for (const [pattern, key] of BY_MESSAGE) {
    if (pattern.test(message)) return key;
  }
  return null;
}
