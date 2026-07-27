import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ADMIN_LANGS = ["lv", "en", "es"] as const;
export type AdminLang = (typeof ADMIN_LANGS)[number];

const LABEL: Record<AdminLang, string> = { lv: "Latviešu", en: "English", es: "Español" };

interface LangTabsProps {
  render: (lang: AdminLang) => React.ReactNode;
}

/** Three language tabs (LV/EN/ES) rendering the same field set per language. */
export function LangTabs({ render }: LangTabsProps) {
  return (
    <Tabs defaultValue="lv" className="w-full">
      <TabsList>
        {ADMIN_LANGS.map((lang) => (
          <TabsTrigger key={lang} value={lang}>
            {LABEL[lang]}
          </TabsTrigger>
        ))}
      </TabsList>
      {ADMIN_LANGS.map((lang) => (
        <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
          {render(lang)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
