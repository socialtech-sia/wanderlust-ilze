import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { routeHead } from "@/lib/route-head";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/language";
import {
  loadServicesForList,
  servicesToItemListJsonLd,
} from "@/lib/services-jsonld";
import { ROUTE_SEO } from "@/lib/seo-strings";

const catSchema = z.enum(["action", "nature", "history", "culture"]).optional();
const diffSchema = z.enum(["easy", "medium", "hard"]).optional();

export const Route = createFileRoute("/$lang/hiking")({
  validateSearch: z.object({ category: catSchema, difficulty: diffSchema }),
  staticData: { enterGaujaCategory: "nature" as const },
  loader: () => loadServicesForList("hiking"),
  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
    const listName = ROUTE_SEO.hiking.title[lang];
    const extraJsonLd = loaderData?.length
      ? [servicesToItemListJsonLd(lang, listName, loaderData)]
      : undefined;
    return routeHead({ params, routeKey: "hiking", path: "/hiking", extraJsonLd });
  },
  component: RouteComp,
});

function RouteComp() {
  const { category, difficulty } = Route.useSearch();
  return (
    <ServicesListPage
      type="hiking"
      navKey="hiking"
      category={category}
      difficulty={difficulty}
    />
  );
}
