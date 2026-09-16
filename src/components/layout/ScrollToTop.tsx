import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/use-services";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { cn } from "@/lib/utils";

/**
 * Кнопка возврата к началу страницы.
 *
 * Делит правый нижний угол с кнопкой чата и баннером кук, поэтому её отступ
 * снизу считается от того, что там сейчас есть, а не задан константой:
 *
 *   - чат виден  — встаём над ним, с зазором в 0.75rem;
 *   - чат выключен в настройках (chatbot_enabled=false) или ещё не
 *     смонтирован — занимаем его место, иначе кнопка висела бы в пустоте;
 *   - баннер кук поднимает обе кнопки, ровно как это делает ChatWidget.
 *
 * Значения отступов повторяют ChatWidget намеренно: две кнопки в одной колонке
 * обязаны двигаться синхронно, и разъехавшиеся константы были бы видны сразу.
 */

// Порог — высота одного экрана: кнопка не нужна тому, кто ещё не прокрутил.
function useScrolledPastViewport() {
  const [past, setPast] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const read = () => {
      frame.current = 0;
      setPast(window.scrollY > window.innerHeight);
    };
    // Чтение положения прокрутки — в rAF: событие scroll прилетает чаще,
    // чем браузер успевает рисовать, и синхронный setState на каждом
    // вызывал бы лишние перерисовки.
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return past;
}

export function ScrollToTop() {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();
  const { consent, isLoaded } = useCookieConsent();
  const [mounted, setMounted] = useState(false);
  const visible = useScrolledPastViewport();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const bannerVisible = isLoaded && !consent;
  const chatVisible = settings?.chatbot_enabled !== false;

  const offset = chatVisible
    ? bannerVisible
      ? "bottom-[17.25rem] md:bottom-[20.25rem]"
      : "bottom-[8.75rem] md:bottom-[10.25rem]"
    : bannerVisible
      ? "bottom-[13.5rem] md:bottom-64"
      : "bottom-20 md:bottom-24";

  const toTop = () => {
    // Тем, кто просил убрать анимации, плавная прокрутка — такая же анимация.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={t("cta.scroll_top")}
      // Скрытая кнопка убирается из потока фокуса и из дерева доступности,
      // но остаётся в разметке: появление через opacity/transform не двигает
      // макет, а размонтирование дало бы скачок.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        // Тише чата осознанно: меньше, без заливки акцентом, полупрозрачная.
        // Первичное действие в этом углу — чат, и он должен оставаться заметнее.
        "fixed right-4 z-[55] flex h-10 w-10 items-center justify-center rounded-full",
        "border border-border/70 bg-background/80 text-foreground/70 backdrop-blur-sm",
        "shadow-sm transition-[opacity,transform,color,border-color] duration-300",
        "hover:border-border hover:text-foreground focus-visible:opacity-100",
        "motion-reduce:transition-none md:right-6 md:h-11 md:w-11",
        offset,
        visible
          ? "translate-y-0 opacity-70 hover:opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <ArrowUp className="h-4 w-4 md:h-5 md:w-5" aria-hidden />
    </button>
  );
}
