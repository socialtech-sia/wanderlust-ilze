import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentLanguage } from "@/hooks/use-current-language";

export const Route = createFileRoute("/$lang/book/confirmed/$ref")({
  validateSearch: z.object({ email: z.string().optional() }),
  component: Confirmed,
});

function Confirmed() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const { ref } = Route.useParams();
  const { email } = Route.useSearch();
  return (
    <div className="container-editorial flex min-h-[70vh] items-center py-20">
      <div className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-moss" />
        <h1 className="mt-6 font-display text-4xl">{t("booking.confirmed_title")}</h1>
        <p className="mt-3 text-ink-muted">{t("booking.confirmed_body")}</p>
        {email ? (
          <p className="mt-2 text-sm text-ink-muted">{t("booking.email_sent", { email })}</p>
        ) : null}
        <div className="mt-8 inline-block rounded-2xl border border-border/60 bg-card px-8 py-5">
          <p className="text-xs uppercase tracking-wider text-ink-muted">
            {t("booking.reference")}
          </p>
          <p className="mt-1 font-display text-2xl tracking-widest text-foreground">{ref}</p>
        </div>
        <p className="mt-4 text-xs text-ink-muted">{t("booking.save_code")}</p>

        <Button asChild className="mt-10">
          <Link to="/$lang" params={{ lang }}>
            {t("booking.back_home")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
