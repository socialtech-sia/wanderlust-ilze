import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { tField } from "@/lib/language";
import { Award, Languages } from "lucide-react";

import { routeHead } from "@/lib/route-head";
import { getProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/$lang/about")({
  // Профиль читается на сервере: он и есть содержимое страницы, а клиентский
  // запрос дорисовывал его после гидратации и сдвигал макет.
  loader: () => getProfile(),
  head: ({ params }) => routeHead({ params, routeKey: "about", path: "/about" }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const profile = Route.useLoaderData();
  const certs = (profile?.certifications as { name: string; year?: number }[] | null) ?? [];

  return (
    <>
      <section
        data-header-tone="dark"
        className="surface-dark relative -mt-16 flex min-h-[42vh] items-end overflow-hidden md:-mt-20 md:min-h-[52vh]"
      >
        <img
          src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=70"
          alt="Misty Gauja river valley at sunrise, seen from Sigulda ridge"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--pine)_45%,transparent)_0%,color-mix(in_oklab,var(--pine)_30%,transparent)_40%,color-mix(in_oklab,var(--pine)_88%,transparent)_88%,var(--pine)_100%)]"
        />
        <div className="container-editorial relative z-10 flex h-full items-end pb-14 pt-32 text-bone md:pb-20 md:pt-40">
          <div>
            <p className="text-eyebrow text-bone-muted">{t("home.about_eyebrow")}</p>
            <h1 className="display-1 mt-4 text-bone">{profile?.full_name ?? t("about.title")}</h1>
            <p className="mt-2 text-bone-muted">{profile ? tField(profile, "role", lang) : ""}</p>
          </div>
        </div>
      </section>

      <section className="container-editorial grid gap-12 py-16 md:grid-cols-3">
        <div className="md:col-span-2 prose prose-neutral max-w-none text-foreground/90">
          {profile && <ReactMarkdown>{tField(profile, "bio", lang)}</ReactMarkdown>}
        </div>
        <aside className="space-y-8">
          {profile?.years_of_experience != null && (
            <div>
              <p className="text-eyebrow">—</p>
              <p className="mt-1 font-display text-5xl text-foreground">
                {profile.years_of_experience}
              </p>
              <p className="text-sm text-ink-muted">{t("about.years_experience")}</p>
            </div>
          )}
          {certs.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-eyebrow">
                <Award className="h-4 w-4" /> {t("about.certifications")}
              </div>
              <ul className="space-y-1.5 text-sm text-foreground">
                {certs.map((c, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{c.name}</span>
                    {c.year && <span className="text-ink-muted">{c.year}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile?.languages_spoken?.length ? (
            <div>
              <div className="mb-2 flex items-center gap-2 text-eyebrow">
                <Languages className="h-4 w-4" /> {t("about.languages")}
              </div>
              <p className="text-sm text-foreground">
                {profile.languages_spoken.map((l: string) => l.toUpperCase()).join(" · ")}
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </>
  );
}
