import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ServicesListPage } from "@/components/services/ServicesListPage";

const catSchema = z.enum(["action", "nature", "history", "culture"]).optional();
const diffSchema = z.enum(["easy", "medium", "hard"]).optional();

export const Route = createFileRoute("/$lang/tours")({
  validateSearch: z.object({ category: catSchema, difficulty: diffSchema }),
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
