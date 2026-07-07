import { Link, useMatchRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
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

const SCROLL_THRESHOLD = 48;

export function Header() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const matchRoute = useMatchRoute();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const island = scrolled;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 transition-all duration-300 ease-out",
        island
          ? "top-3 mx-4 rounded-2xl border border-white/20 bg-background/70 shadow-xl shadow-black/5 backdrop-blur-xl md:mx-auto md:max-w-4xl lg:max-w-5xl"
          : "bg-transparent",
      )}
    >
      <div className="container-editorial flex h-16 items-center justify-between md:h-20">
        <Link
          to="/$lang"
          params={{ lang }}
          className="font-display text-2xl tracking-tight text-foreground transition-colors"
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
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
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
