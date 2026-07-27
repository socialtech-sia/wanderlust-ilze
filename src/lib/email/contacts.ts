import type { EmailContacts } from "./templates";

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

/** Reads public contact details from site_settings. Never throws. */
export async function loadContacts(
  client: SettingsReader,
  siteUrl: string,
): Promise<EmailContacts> {
  let email = "info@wanderlust.lv";
  let phone = "";
  try {
    const { data } = await client.from("site_settings").select("key, value");
    for (const r of data ?? []) {
      const v = typeof r.value === "string" ? r.value : "";
      if (r.key === "contact_email" && v) email = v;
      if (r.key === "contact_phone" && v) phone = v;
    }
  } catch {
    /* fall back to defaults */
  }
  return { email, phone, siteUrl };
}
