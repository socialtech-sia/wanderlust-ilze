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

export const Route = createFileRoute("/$lang/tours")({
  validateSearch: z.object({ category: catSchema, difficulty: diffSchema }),
  staticData: { enterGaujaCategory: "history" as const },
  loader: () => loadServicesForList("excursion"),
  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
    const listName = ROUTE_SEO.tours.title[lang];
    const extraJsonLd = loaderData?.length
      ? [servicesToItemListJsonLd(lang, listName, loaderData)]
      : undefined;
    return routeHead({ params, routeKey: "tours", path: "/tours", extraJsonLd });
  },
  component: RouteComp,
});

function RouteComp() {
  const { category, difficulty } = Route.useSearch();
  return (
    <ServicesListPage
      type="excursion"
      navKey="tours"
      category={category}
      difficulty={difficulty}
    />
  );
}
