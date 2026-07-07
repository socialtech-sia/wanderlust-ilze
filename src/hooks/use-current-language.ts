import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/language";

export function useCurrentLanguage(): Lang {
  // "strict: false" so components can call this from anywhere
  const params = useParams({ strict: false }) as { lang?: string };
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang, i18n]);

  return lang;
}
