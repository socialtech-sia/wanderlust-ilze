import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import i18n from "@/lib/i18n"; // ensure i18n is initialised synchronously on both server and client
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/language";

export function useCurrentLanguage(): Lang {
  // "strict: false" so components can call this from anywhere
  const params = useParams({ strict: false }) as { lang?: string };
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;

  useEffect(() => {
    if (i18n.language !== lang && typeof i18n.changeLanguage === "function") {
      void i18n.changeLanguage(lang);
    }
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  return lang;
}
