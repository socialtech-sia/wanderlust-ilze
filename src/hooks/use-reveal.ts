import { useEffect, useRef } from "react";

/**
 * SSR-safe scroll reveal.
 *
 * Markup is rendered in its FINAL state on the server. Only after hydration
 * does JS "arm" elements that are still below the fold, so a page without JS
 * (or before hydration) always looks finished and never flashes.
 */
export function useReveal<T extends HTMLElement>(attr = "data-reveal") {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.setAttribute(attr, "in");
      return;
    }

    // Already visible on load → no animation (avoids first-screen flicker).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.setAttribute(attr, "in");
      return;
    }

    el.setAttribute(attr, "armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute(attr, "in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -4% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [attr]);

  return ref;
}
