import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ServicesListPage } from "@/components/services/ServicesListPage";

const catSchema = z.enum(["action", "nature", "history", "culture"]).optional();

export const Route = createFileRoute("/$lang/tours")({
  validateSearch: z.object({ category: catSchema }),
  component: () => {
    const { category } = Route.useSearch();
    return <ServicesListPage type="excursion" navKey="tours" category={category} />;
  },
});
