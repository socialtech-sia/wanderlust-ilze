import type { EmailContacts } from "./templates";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/contact-defaults";

interface SettingRow {
  key: string;
  value: unknown;
}

/** Minimal structural shape of a Supabase client used here. */
export interface SettingsReader {
  from(table: "site_settings"): {
    select(columns: string): PromiseLike<{ data: SettingRow[] | null }>;
  };
}

export interface EmailSettings {
  /** Контакты в подписи письма — те же, что показывает сайт. */
  contacts: EmailContacts;
  /**
   * Куда слать уведомления администратору.
   *
   * Источник — site_settings.booking_notification_email, то есть поле в
   * админке. Пусто — остаётся ADMIN_NOTIFICATION_EMAIL из окружения.
   * Раньше читалось ТОЛЬКО окружение, а поле в админке не читал никто:
   * клиент менял адрес и не получал ничего.
   */
  notificationEmail: string;
}

/**
 * Один запрос к site_settings на письмо: и подпись, и адрес получателя.
 *
 * Никогда не бросает: недоступные настройки не должны ронять обработчик
 * брони — бронь уже записана, письмо вторично.
 */
export async function loadEmailSettings(
  client: SettingsReader,
  siteUrl: string,
): Promise<EmailSettings> {
  let email = DEFAULT_CONTACT_EMAIL;
  let phone = "";
  let notificationEmail = "";
  try {
    const { data } = await client.from("site_settings").select("key, value");
    for (const r of data ?? []) {
      const v = typeof r.value === "string" ? r.value.trim() : "";
      if (!v) continue;
      if (r.key === "contact_email") email = v;
      if (r.key === "contact_phone") phone = v;
      if (r.key === "booking_notification_email") notificationEmail = v;
    }
  } catch {
    /* fall back to defaults */
  }
  return { contacts: { email, phone, siteUrl }, notificationEmail };
}

/** Reads public contact details from site_settings. Never throws. */
export async function loadContacts(
  client: SettingsReader,
  siteUrl: string,
): Promise<EmailContacts> {
  const { contacts } = await loadEmailSettings(client, siteUrl);
  return contacts;
}

/**
 * Адрес администратора: сначала поле админки, потом окружение.
 *
 * Порядок именно такой, а не наоборот: значение в админке — это то, что
 * клиент видит и правит сам, и оно обязано перекрывать серверную настройку.
 * Пусто и там, и там — вернётся пустая строка, вызывающий код запишет это
 * в notification_error, а не промолчит.
 */
export function pickAdminRecipient(settings: EmailSettings): string {
  return settings.notificationEmail || (process.env.ADMIN_NOTIFICATION_EMAIL ?? "").trim();
}
