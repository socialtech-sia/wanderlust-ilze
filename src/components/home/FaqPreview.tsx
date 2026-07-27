import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";
import type { HomeFaq } from "@/lib/home-data";

export function FaqPreview({ items }: { items: HomeFaq[] }) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  if (!items.length) return null;

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16">
          <div>
            <p className="text-eyebrow">10 · BUJ</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">{t("faqp.title")}</h2>
            <p className="mt-3 text-ink-muted">{t("faqp.subtitle")}</p>
            <Link
              to="/$lang/faq"
              params={{ lang }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-moss-deep"
            >
              {t("faqp.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Accordion type="single" collapsible className="divide-y divide-border/60">
            {items.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-b-0">
                <AccordionTrigger className="py-4 text-left font-display text-base text-foreground hover:no-underline md:text-lg">
                  {tField(f, "question", lang)}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-ink-muted">
                  {tField(f, "answer", lang)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
