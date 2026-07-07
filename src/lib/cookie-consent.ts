export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentState = ConsentCategories & {
  timestamp: number;
  version: number;
};

export const CONSENT_STORAGE_KEY = "wanderlust.cookie-consent.v1";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "wanderlust:cookie-consent-change";
export const CONSENT_OPEN_EVENT = "wanderlust:cookie-consent-open";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed?.version !== CONSENT_VERSION) return null;
    return { ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function setConsent(input: Partial<ConsentCategories>): ConsentState {
  const next: ConsentState = {
    necessary: true,
    analytics: Boolean(input.analytics),
    marketing: Boolean(input.marketing),
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
  }
  return next;
}

export function clearConsent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function openConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
