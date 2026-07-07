import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import lv from "@/i18n/lv.json";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { DEFAULT_LANG } from "@/lib/language";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      lv: { translation: lv },
      en: { translation: en },
      es: { translation: es },
    },
    lng: DEFAULT_LANG,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
