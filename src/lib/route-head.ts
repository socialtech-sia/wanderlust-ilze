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
  extraJsonLd,
}: {
  params: { lang: string };
  routeKey: keyof typeof ROUTE_SEO;
  path: string;
  breadcrumbs?: BreadcrumbItem[];
  extraJsonLd?: object[];
}) {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const seo = ROUTE_SEO[routeKey];
  const jsonLd: object[] = [];
  if (breadcrumbs) jsonLd.push(buildBreadcrumbList(lang, breadcrumbs));
  if (extraJsonLd?.length) jsonLd.push(...extraJsonLd);
  return buildPageHead({
    path,
    lang,
    title: seo.title[lang],
    description: seo.description[lang],
    category: seo.category,
    jsonLd: jsonLd.length ? jsonLd : undefined,
  });
}
