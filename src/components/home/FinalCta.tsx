import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentLanguage } from "@/hooks/use-current-language";

export function FinalCta() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  return (
    <section data-header-tone="dark" className="surface-dark surface-deep section-y-sm">
      <div className="container-editorial flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-bone md:text-4xl">
            {t("finalcta.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-bone-muted md:text-base">
            {t("finalcta.text")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="lg">
            <Link to="/$lang/book" params={{ lang }}>
              {t("cta.book_now")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="lg">
            <Link to="/$lang/contact" params={{ lang }}>
              {t("finalcta.secondary")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
