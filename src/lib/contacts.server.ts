import { DEFAULT_CONTACT_EMAIL } from "@/lib/contact-defaults";

export interface PublicContacts {
  email: string;
  phone: string;
  whatsapp: string;
}

/**
 * Публичные контакты из site_settings, прочитанные НА СЕРВЕРЕ.
 *
 * Юридические страницы подставляют адрес и телефон прямо в текст политики.
 * Клиентского хука там мало: до гидратации значения пусты, и в SSR-разметку
 * уезжает «Jautājumi par sīkdatnēm: info@wanderlust.lv, .» — именно это и
 * видят поисковики и читалки без JS. Для юридического текста так нельзя,
 * поэтому здесь он читается на сервере и приезжает уже заполненным.
 */
export async function fetchPublicContacts(): Promise<PublicContacts> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const out: PublicContacts = { email: DEFAULT_CONTACT_EMAIL, phone: "", whatsapp: "" };
  try {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["contact_email", "contact_phone", "contact_whatsapp"]);
    for (const row of data ?? []) {
      const v = typeof row.value === "string" ? row.value : "";
      if (!v) continue;
      if (row.key === "contact_email") out.email = v;
      if (row.key === "contact_phone") out.phone = v;
      if (row.key === "contact_whatsapp") out.whatsapp = v;
    }
  } catch {
    // Отсутствие ключа или недоступная база не должны ронять юридическую
    // страницу: она обязана открываться всегда, пусть и с запасным адресом.
  }
  return out;
}
