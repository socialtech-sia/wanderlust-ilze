/**
 * Запасные контакты на случай, когда site_settings ещё не доехали.
 *
 * Живут отдельным файлом, потому что нужны с ОБЕИХ сторон: серверной
 * (src/lib/email/contacts.ts, куда React тянуть нельзя) и клиентской
 * (useContactDetails). Держать две копии одного адреса — верный способ
 * однажды поменять только одну.
 */
export const DEFAULT_CONTACT_EMAIL = "info@wanderlust.lv";
