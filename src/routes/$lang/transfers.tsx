import { createFileRoute } from "@tanstack/react-router";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { routeHead } from "@/lib/route-head";

export const Route = createFileRoute("/$lang/transfers")({
  head: ({ params }) => routeHead({ params, routeKey: "transfers", path: "/transfers" }),
  component: () => <ServicesListPage type="transfer" navKey="transfers" />,
});
