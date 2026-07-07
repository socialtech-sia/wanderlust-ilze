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

const SCROLL_END = 72;

export function Header() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const matchRoute = useMatchRoute();

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(Math.max(window.scrollY / SCROLL_END, 0), 1);
      setScrollProgress(progress);
    };
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onScroll();
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      setSmoothProgress((prev) => {
        const diff = scrollProgress - prev;
        const next = prev + diff * 0.12;
        if (Math.abs(diff) < 0.001) return scrollProgress;
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollProgress]);

  const blurPx = smoothProgress * (isMobile ? 10 : 18);

  return (
    <header className="fixed left-0 right-0 top-0 z-40">
      <div
        className={cn(
          "pointer-events-none absolute left-0 right-0 top-2 mx-3 h-14 rounded-full border border-white/15 bg-background/65 shadow-lg shadow-black/5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity,backdrop-filter]",
          "md:top-3 md:mx-auto md:h-20 md:max-w-4xl lg:max-w-5xl",
        )}
        style={{
          opacity: smoothProgress,
          transform: `translateY(${(1 - smoothProgress) * -10}px) scale(${0.98 + smoothProgress * 0.02})`,
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
        }}
        aria-hidden="true"
      />

      <div className="container-editorial flex h-14 items-center justify-between md:h-20">
        <Link
          to="/$lang"
          params={{ lang }}
          className="font-display text-2xl tracking-tight text-foreground text-shadow-sm transition-colors"
          aria-label="Wanderlust.lv"
        >
          Wanderlust<span className="text-moss">.</span>lv
        </Link>

        <nav className="hidden items-center gap-7 text-shadow-sm md:flex">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground text-shadow-sm transition-colors md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5 drop-shadow-text" /> : <Menu className="h-5 w-5 drop-shadow-text" />}
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
