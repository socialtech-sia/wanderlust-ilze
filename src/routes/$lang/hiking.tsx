import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { routeHead } from "@/lib/route-head";

const catSchema = z.enum(["action", "nature", "history", "culture"]).optional();
const diffSchema = z.enum(["easy", "medium", "hard"]).optional();

export const Route = createFileRoute("/$lang/hiking")({
  validateSearch: z.object({ category: catSchema, difficulty: diffSchema }),
  staticData: { enterGaujaCategory: "nature" as const },
  head: ({ params }) => routeHead({ params, routeKey: "hiking", path: "/hiking" }),
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
