import { Link, useMatchRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

type Tone = "light" | "dark";

function detectLowEnd(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  return !!reduced || lowMem || lowCpu;
}

export function Header() {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("light");
  const matchRoute = useMatchRoute();

  const pillRef = useRef<HTMLDivElement | null>(null);
  const lowEndRef = useRef(false);
  const isMobileRef = useRef(false);
  const toneRef = useRef<Tone>("light");

  // Single rAF loop drives pill style directly, tone detection, and low-end fallbacks.
  useEffect(() => {
    lowEndRef.current = detectLowEnd();
    isMobileRef.current = window.innerWidth < 768;

    let rafId = 0;
    let pending = false;
    let smooth = 0;
    let target = 0;
    let lastToneCheck = 0;

    const readTarget = () => {
      target = Math.min(Math.max(window.scrollY / SCROLL_END, 0), 1);
    };

    const applyPill = () => {
      const el = pillRef.current;
      if (!el) return;
      const isMobile = isMobileRef.current;
      const lowEnd = lowEndRef.current;
      const isDark = toneRef.current === "dark";

      // On low-end devices: snap to target, skip backdrop-filter entirely.
      if (lowEnd) {
        smooth = target;
      } else {
        smooth += (target - smooth) * 0.18;
        if (Math.abs(target - smooth) < 0.002) smooth = target;
      }

      // Round to reduce style thrash / filter recompute.
      const op = Math.round(smooth * 100) / 100;
      const ty = Math.round((1 - smooth) * -10 * 10) / 10;
      el.style.opacity = String(op);
      el.style.transform = `translate3d(0, ${ty}px, 0)`;

      if (!lowEnd) {
        const maxBlur = isMobile ? 10 : 18;
        const blur = Math.round(smooth * maxBlur + (isDark ? 4 : 0));
        const blurStr = blur > 0 ? `blur(${blur}px)` : "none";
        el.style.backdropFilter = blurStr;
        (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = blurStr;
      }
    };

    const detectTone = () => {
      const probeY = isMobileRef.current ? 36 : 56;
      const probeX = Math.round(window.innerWidth / 2);
      const els = document.elementsFromPoint(probeX, probeY) as HTMLElement[];
      let found: Tone | null = null;
      for (const el of els) {
        const dt = el.dataset?.headerTone as Tone | undefined;
        if (dt === "dark" || dt === "light") {
          found = dt;
          break;
        }
      }
      const next = found ?? "light";
      if (next !== toneRef.current) {
        toneRef.current = next;
        setTone(next);
      }
    };

    const tick = (ts: number) => {
      pending = false;
      applyPill();
      if (ts - lastToneCheck > 120) {
        lastToneCheck = ts;
        detectTone();
      }
      // Keep animating until smooth reaches target.
      if (smooth !== target) {
        rafId = requestAnimationFrame(tick);
        pending = true;
      }
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readTarget();
      schedule();
    };
    const onResize = () => {
      isMobileRef.current = window.innerWidth < 768;
      readTarget();
      schedule();
    };

    readTarget();
    schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const isDark = tone === "dark";
  const pillClass = isDark
    ? "border-white/20 bg-ink/35 shadow-lg shadow-black/20"
    : "border-white/15 bg-background/65 shadow-lg shadow-black/5";
  const textColor = isDark ? "text-paper" : "text-foreground";
  const mutedColor = isDark
    ? "text-paper/70 hover:text-paper"
    : "text-ink-muted hover:text-foreground";

  return (
    <header className="fixed left-0 right-0 top-0 z-40" data-tone={tone}>
      <div
        ref={pillRef}
        className={cn(
          "pointer-events-none absolute left-0 right-0 top-2 mx-3 h-14 rounded-full border transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "md:top-3 md:mx-auto md:h-20 md:max-w-4xl lg:max-w-5xl",
          pillClass,
        )}
        style={{
          opacity: 0,
          transform: "translate3d(0,-10px,0)",
          willChange: "transform, opacity, backdrop-filter",
          contain: "layout paint style",
          backfaceVisibility: "hidden",
        }}
        aria-hidden="true"
      />

      <div className="container-editorial relative z-10 flex h-14 items-center justify-between md:h-20">
        <Link
          to="/$lang"
          params={{ lang }}
          className={cn(
            "font-display text-2xl tracking-tight text-shadow-sm transition-colors",
            textColor,
          )}
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
                  active ? textColor : mutedColor,
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
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full text-shadow-sm transition-colors md:hidden",
              textColor,
            )}
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
