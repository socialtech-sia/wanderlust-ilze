import { useSiteSettings } from "@/hooks/use-services";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/contact-defaults";

/**
 * Публичные контакты из site_settings.
 *
 * Их читают четыре места — страница контактов и три юридические страницы, —
 * и раньше каждое доставало их из настроек само. Для юридических страниц это
 * принципиально: там адрес и телефон обязаны быть клиентскими и меняться из
 * админки, а не жить строкой в переводах (до этого там был вписан наш).
 */
export function useContactDetails(): { email: string; phone: string; whatsapp: string } {
  const { data: settings } = useSiteSettings();
  const str = (key: string): string =>
    typeof settings?.[key] === "string" ? (settings[key] as string) : "";
  return {
    email: str("contact_email") || DEFAULT_CONTACT_EMAIL,
    phone: str("contact_phone"),
    whatsapp: str("contact_whatsapp"),
  };
}
