/**
 * Строка «ТИП · Название услуги» для админских списков броней.
 *
 * Тип — капсом утилитарным шрифтом (утилита `text-eyebrow`), название —
 * обычным. Данные готовит `bookingServiceInfo`: сначала снапшот, потом
 * джойн (см. комментарий там).
 */

import type { BookingServiceInfo } from "@/lib/booking-service";

export function BookingServiceLine({
  info,
  /** В раскрытой строке подпись идёт после «Pakalpojums:» — там нужна не своя строка. */
  inline = false,
}: {
  info: BookingServiceInfo;
  inline?: boolean;
}) {
  if (!info.title && !info.typeLabel) {
    return <span className="text-xs text-muted-foreground">Pakalpojums nav zināms</span>;
  }
  return (
    <span className={inline ? "text-sm" : "mt-0.5 block text-xs leading-snug"}>
      {info.typeLabel ? (
        <span className="text-eyebrow text-muted-foreground">{info.typeLabel}</span>
      ) : null}
      {info.typeLabel && info.title ? (
        <span aria-hidden className="mx-1.5 text-muted-foreground">
          ·
        </span>
      ) : null}
      {info.title ? <span className="text-foreground">{info.title}</span> : null}
    </span>
  );
}
