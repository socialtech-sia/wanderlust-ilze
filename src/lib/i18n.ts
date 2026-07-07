import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import lv from "@/i18n/lv.json";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { DEFAULT_LANG } from "@/lib/language";

if (!i18n.isInitialized) {
  // initImmediate: false forces sync initialisation when resources are
  // bundled inline — required so SSR / first render already has translations
  // and no hydration mismatch occurs between server (raw keys) and client.
  i18n.use(initReactI18next).init({
    resources: {
      lv: { translation: lv },
      en: { translation: en },
      es: { translation: es },
    },
    lng: DEFAULT_LANG,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false,
  });
}

export default i18n;
