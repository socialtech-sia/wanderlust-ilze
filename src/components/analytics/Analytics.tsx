import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-services";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

/**
 * Google Analytics 4 с Consent Mode v2.
 *
 * Три правила, которые здесь и реализованы:
 *
 * 1. Идентификатор берётся из site_settings.google_analytics_id. Пусто —
 *    на страницу не попадает ВООБЩЕ ничего: ни тега, ни dataLayer. До этого
 *    ключ существовал в админке, но кода аналитики в приложении не было.
 *
 * 2. gtag.js подгружается только после согласия на аналитические куки в
 *    существующем баннере. Не «загружаем и не пишем», а именно не загружаем:
 *    до согласия к googletagmanager.com не уходит ни одного запроса.
 *
 * 3. Consent Mode v2 объявляется ДО загрузки библиотеки и по умолчанию
 *    denied по всем сигналам, включая ad_user_data и ad_personalization —
 *    те два, которых не было в v1. Библиотека разбирает очередь dataLayer
 *    по порядку, поэтому к моменту её старта состояние уже верное.
 *
 * Отзыв согласия шлёт consent update: denied. Выгрузить уже загруженный
 * скрипт нельзя, но запрет хранения — это ровно то, что требует Consent Mode.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Стандартный загрузочный сниппет gtag — дословно, как у Google.
 *  Вставляется отдельным <script>, чтобы `function gtag(){}` объявилась в
 *  глобальной области и была доступна из React как window.gtag. */
const BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted'
});
gtag('set', 'ads_data_redaction', true);
gtag('js', new Date());
`.trim();

const BOOTSTRAP_ID = "ga-consent-bootstrap";

export function Analytics() {
  const { data: settings } = useSiteSettings();
  const { consent, isLoaded } = useCookieConsent();
  const href = useRouterState({ select: (s) => s.location.href });

  const raw = settings?.google_analytics_id;
  const measurementId = typeof raw === "string" ? raw.trim() : "";
  // Лишняя страховка от опечатки в админке: G-XXXXXXX, а не «вставил ссылку».
  const validId = /^G-[A-Z0-9]+$/i.test(measurementId) ? measurementId : "";

  const granted = isLoaded && consent?.analytics === true;
  const configuredFor = useRef<string | null>(null);
  const lastHref = useRef<string | null>(null);

  // Consent Mode объявляется заранее и независимо от согласия: очередь должна
  // быть выстроена до того, как библиотека вообще появится.
  useEffect(() => {
    if (!validId) return;
    if (document.getElementById(BOOTSTRAP_ID)) return;
    const el = document.createElement("script");
    el.id = BOOTSTRAP_ID;
    el.text = BOOTSTRAP;
    document.head.appendChild(el);
  }, [validId]);

  // Загрузка библиотеки и снятие запрета — только по согласию.
  useEffect(() => {
    if (!validId || !isLoaded) return;
    const gtag = window.gtag;
    if (!gtag) return;

    if (!granted) {
      // Явный отказ или отозванное согласие.
      gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
      return;
    }

    gtag("consent", "update", { analytics_storage: "granted" });

    if (configuredFor.current === validId) return;
    configuredFor.current = validId;

    const el = document.createElement("script");
    el.async = true;
    el.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(validId)}`;
    document.head.appendChild(el);

    // send_page_view: false — просмотры шлём сами (см. следующий эффект).
    // Иначе первый переход по SPA-роутеру считался бы дважды: один раз
    // конфигом, второй — обработчиком смены адреса.
    gtag("config", validId, { anonymize_ip: true, send_page_view: false });
    lastHref.current = null;
  }, [validId, granted, isLoaded]);

  // Просмотры страниц при навигации роутером: смены документа нет, и сам
  // GA4 такой переход не увидел бы.
  useEffect(() => {
    if (!validId || !granted) return;
    if (lastHref.current === href) return;
    lastHref.current = href;
    window.gtag?.("event", "page_view", {
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [href, validId, granted]);

  return null;
}
