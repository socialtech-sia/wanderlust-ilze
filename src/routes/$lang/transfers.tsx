import { createFileRoute } from "@tanstack/react-router";
import { ServicesListPage } from "@/components/services/ServicesListPage";

export const Route = createFileRoute("/$lang/transfers")({
  component: () => <ServicesListPage type="transfer" navKey="transfers" />,
});
