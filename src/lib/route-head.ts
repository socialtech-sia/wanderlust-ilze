/**
 * Small adapter used by every route's `head()` — turns a language param
 * and a route SEO key into a full head payload with canonical, hreflang,
 * Open Graph and (optionally) Breadcrumb JSON-LD.
 */

import { DEFAULT_LANG, isLang, type Lang } from "@/lib/language";
import { buildBreadcrumbList, buildPageHead, type BreadcrumbItem } from "@/lib/seo";
import { ROUTE_SEO } from "@/lib/seo-strings";

export function routeHead({
  params,
  routeKey,
  path,
  breadcrumbs,
}: {
  params: { lang: string };
  routeKey: keyof typeof ROUTE_SEO;
  path: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const seo = ROUTE_SEO[routeKey];
  const jsonLd = breadcrumbs ? [buildBreadcrumbList(lang, breadcrumbs)] : undefined;
  return buildPageHead({
    path,
    lang,
    title: seo.title[lang],
    description: seo.description[lang],
    category: seo.category,
    jsonLd,
  });
}
