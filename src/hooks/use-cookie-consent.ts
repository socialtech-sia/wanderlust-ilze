import { useEffect, useState, useCallback } from "react";
import {
  CONSENT_EVENT,
  getConsent,
  setConsent,
  type ConsentCategories,
  type ConsentState,
} from "@/lib/cookie-consent";

export function useCookieConsent() {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setConsentState(getConsent());
    setIsLoaded(true);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState | null>).detail;
      setConsentState(detail ?? getConsent());
    };
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const acceptAll = useCallback(() => {
    setConsentState(setConsent({ analytics: true, marketing: true }));
  }, []);

  const rejectOptional = useCallback(() => {
    setConsentState(setConsent({ analytics: false, marketing: false }));
  }, []);

  const update = useCallback((partial: Partial<ConsentCategories>) => {
    setConsentState(setConsent(partial));
  }, []);

  return { consent, isLoaded, acceptAll, rejectOptional, update };
}
