import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

export function EnterGaujaBadge() {
  const { t } = useTranslation();
  return (
    <section className="container-editorial pb-20 md:pb-28">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-moss-soft bg-gradient-to-br from-moss-soft/80 to-paper p-10 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-eyebrow">Enter Gauja</p>
          <p className="mt-2 max-w-xl font-display text-2xl text-foreground">
            {t("home.partner_text")}
          </p>
        </div>
        <a
          href="https://entergauja.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-moss-deep px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-moss"
        >
          {t("home.partner_learn")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
