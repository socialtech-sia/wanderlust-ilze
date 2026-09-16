import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { routeHead } from "@/lib/route-head";
import { getFaq } from "@/lib/faq.functions";

export const Route = createFileRoute("/$lang/faq")({
  // Вопросы читаются на сервере: это содержимое страницы, и клиентский
  // запрос дорисовывал аккордеон уже после гидратации, сдвигая макет.
  loader: () => getFaq(),
  head: ({ params }) => routeHead({ params, routeKey: "faq", path: "/faq" }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const data = Route.useLoaderData();

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-eyebrow">Wanderlust</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">{t("faq.title")}</h1>
        <p className="mt-4 text-ink-muted">{t("faq.subtitle")}</p>

        {/* Radix Accordion рендерит вопросы как h3; без этого h2 уровни шли h1 -> h3. */}
        <h2 className="sr-only">{t("a11y.faq_list")}</h2>
        <Accordion type="single" collapsible className="mt-10 divide-y divide-border/60">
          {data?.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="border-b-0">
              <AccordionTrigger className="py-5 text-left display-3 !text-lg text-foreground hover:no-underline">
                {tField(f, "question", lang)}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-ink-muted">
                {tField(f, "answer", lang)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
