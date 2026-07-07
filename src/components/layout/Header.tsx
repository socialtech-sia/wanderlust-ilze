import { Link, useMatchRoute, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "tours", to: "/$lang/tours" },
  { key: "hiking", to: "/$lang/hiking" },
  { key: "transfers", to: "/$lang/transfers" },
  { key: "about", to: "/$lang/about" },
  { key: "faq", to: "/$lang/faq" },
  { key: "contact", to: "/$lang/contact" },
] as const;

export function Header() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const matchRoute = useMatchRoute();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrolled = pathname !== `/${lang}` && pathname !== `/${lang}/`;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "border-b border-border/60 bg-background/90 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="container-editorial flex h-16 items-center justify-between md:h-20">
        <Link
          to="/$lang"
          params={{ lang }}
          className="font-display text-2xl tracking-tight text-foreground"
          aria-label="Wanderlust.lv"
        >
          Wanderlust<span className="text-moss">.</span>lv
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const active = !!matchRoute({ to: item.to, params: { lang } });
            return (
              <Link
                key={item.key}
                to={item.to}
                params={{ lang }}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-ink-muted hover:text-foreground",
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            to="/$lang/book"
            params={{ lang }}
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 md:inline-flex"
          >
            {t("cta.book_now")}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container-editorial flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                params={{ lang }}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base text-foreground hover:bg-accent"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <Link
              to="/$lang/book"
              params={{ lang }}
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              {t("cta.book_now")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
