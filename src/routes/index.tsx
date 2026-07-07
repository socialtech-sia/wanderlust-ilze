import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LANG } from "@/lib/language";

// Root redirects to default language home.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$lang", params: { lang: DEFAULT_LANG } });
  },
  component: () => null,
});
