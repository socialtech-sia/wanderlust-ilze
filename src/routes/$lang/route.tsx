import { createFileRoute, Outlet, notFound, useMatches } from "@tanstack/react-router";
import { useMemo } from "react";
import { isLang } from "@/lib/language";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/cookie/CookieConsent";
import { EnterGaujaPartnerBadge } from "@/components/entergauja/EnterGaujaPartnerBadge";
import { getEnterGaujaCategory, type EnterGaujaKey } from "@/lib/enter-gauja";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  component: LangLayout,
});

function LangLayout() {
  const matches = useMatches();
  const badgeCategory = useMemo(() => {
    // Deepest match wins — child routes can set { staticData: { enterGaujaCategory: "nature" } }
    for (let i = matches.length - 1; i >= 0; i--) {
      const k = (matches[i].staticData as { enterGaujaCategory?: EnterGaujaKey } | undefined)
        ?.enterGaujaCategory;
      if (k) return getEnterGaujaCategory(k);
    }
    return undefined;
  }, [matches]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <EnterGaujaPartnerBadge category={badgeCategory} />
      <CookieConsent />
    </div>
  );
}
