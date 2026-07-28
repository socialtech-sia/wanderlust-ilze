import { Link, useMatchRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useCurrentLanguage } from "@/hooks/use-current-language";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

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
      const ty = Math.round((1 - smooth) * -6 * 10) / 10;
      el.style.opacity = String(op);
      el.style.transform = `translate3d(0, ${ty}px, 0)`;

      if (!lowEnd) {
        const maxBlur = isMobile ? 8 : 14;
        const blur = Math.round(smooth * maxBlur + (isDark ? 2 : 0));
        const blurStr = op > 0 && blur > 0 ? `blur(${blur}px)` : "none";
        el.style.backdropFilter = blurStr;
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
    ? "border-[color-mix(in_oklab,var(--bone)_18%,transparent)] bg-[color-mix(in_oklab,var(--pine)_74%,transparent)]"
    : "border-[color-mix(in_oklab,var(--pine)_14%,transparent)] bg-[color-mix(in_oklab,var(--sand)_94%,transparent)]";
  // NB: root theme is dark-first, so `text-foreground` is bone — unusable on the light pill.
  const textColor = isDark ? "text-bone" : "text-pine";
  const mutedColor = isDark
    ? "text-bone-muted hover:text-bone"
    : "text-[color-mix(in_oklab,var(--pine)_70%,transparent)] hover:text-pine";


  const shadowClass = isDark ? "text-shadow-sm" : "";

  return (
    <header className="fixed left-0 right-0 top-0 z-40" data-tone={tone}>
      <div className="container-editorial relative z-10">
        <div
          ref={pillRef}
          className={cn(
            "pointer-events-none absolute inset-x-2 top-2 h-12 rounded-full border transition-[background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "md:inset-x-4 md:h-16",
            pillClass,
          )}
          style={{
            opacity: 0,
            transform: "translate3d(0,-6px,0)",
            willChange: "transform, opacity, backdrop-filter",
            contain: "layout paint style",
            backfaceVisibility: "hidden",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-16 items-center justify-between md:h-20">
        <Link
          to="/$lang"
          params={{ lang }}
          className={cn("transition-colors", shadowClass, textColor)}
          aria-label="Wanderlust.lv"
        >
          <Logo variant="horizontal" tone="auto" size={40} className="hidden md:inline-flex" />
          <Logo
            variant="horizontal"
            tone="auto"
            size={36}
            showTagline={false}
            className="md:hidden"
          />
        </Link>

        <nav className={cn("hidden items-center gap-7 md:flex", shadowClass)}>
          {NAV.map((item) => {
            const active = !!matchRoute({ to: item.to, params: { lang } });
            return (
              <Link
                key={item.key}
                to={item.to}
                params={{ lang }}
                className={cn(
                  "text-utility text-[11px] transition-colors",
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
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link to="/$lang/book" params={{ lang }}>
              {t("cta.book_now")}
            </Link>
          </Button>
          <button
            type="button"
            aria-label="Menu"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden",
              shadowClass,
              textColor,
            )}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      </div>

      {mobileOpen && (
        <div className="surface-dark relative z-10 border-t border-border md:hidden">
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
            <Button asChild className="mt-2 w-full">
              <Link
                to="/$lang/book"
                params={{ lang }}
                onClick={() => setMobileOpen(false)}
              >
                {t("cta.book_now")}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
