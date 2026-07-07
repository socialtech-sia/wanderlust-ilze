/**
 * Enter Gauja brand mapping.
 * Source: EnterGauja Vadlīnijas 2025 (brand guidelines).
 *
 * Primary categories: Nature, History, Culture, Action.
 * Each has an official color, symbol, dedicated hub URL on entergauja.lv,
 * and a matching schema.org type used for structured data on partner pages.
 */

export type EnterGaujaKey = "nature" | "history" | "culture" | "action";

export interface EnterGaujaCategoryInfo {
  key: EnterGaujaKey;
  /** English label used on the badge / CTA. */
  label: string;
  /** Enter Gauja category slug used in URLs on entergauja.lv */
  slug: string;
  /** Hex color from the brand book (page 23/30/37/45). */
  color: string;
  /** Slightly darker variant for hover / active button (REGULAR / ACTIVE). */
  colorActive: string;
  /** Absolute URL to the Enter Gauja hub page for this category. */
  url: string;
  /** schema.org @type suited for TouristAttraction / Landmark / Event / Sports. */
  schemaType:
    | "TouristAttraction"
    | "LandmarksOrHistoricalBuildings"
    | "Event"
    | "SportsActivityLocation";
  /** Short symbol name from the guidelines (deer / castle / austra / lightning). */
  symbol: string;
}

export const ENTER_GAUJA_CATEGORIES: Record<EnterGaujaKey, EnterGaujaCategoryInfo> = {
  nature: {
    key: "nature",
    label: "Enter Nature",
    slug: "enter-nature",
    color: "#679A40",
    colorActive: "#4F6F19",
    url: "https://entergauja.lv/enter-nature/",
    schemaType: "TouristAttraction",
    symbol: "deer",
  },
  history: {
    key: "history",
    label: "Enter History",
    slug: "enter-history",
    color: "#E38F25",
    colorActive: "#9B4922",
    url: "https://entergauja.lv/enter-history/",
    schemaType: "LandmarksOrHistoricalBuildings",
    symbol: "castle",
  },
  culture: {
    key: "culture",
    label: "Enter Culture",
    slug: "enter-culture",
    color: "#51869D",
    colorActive: "#003F62",
    url: "https://entergauja.lv/enter-culture/",
    schemaType: "Event",
    symbol: "austra",
  },
  action: {
    key: "action",
    label: "Enter Action",
    slug: "enter-action",
    color: "#E94F64",
    colorActive: "#B02036",
    url: "https://entergauja.lv/enter-action/",
    schemaType: "SportsActivityLocation",
    symbol: "lightning",
  },
};

export const ENTER_GAUJA_ORDER: EnterGaujaKey[] = ["nature", "history", "culture", "action"];

export const ENTER_GAUJA_ROOT_URL = "https://entergauja.lv/";

/** Safe lookup — returns undefined for unknown / null categories. */
export function getEnterGaujaCategory(
  key: string | null | undefined,
): EnterGaujaCategoryInfo | undefined {
  if (!key) return undefined;
  return ENTER_GAUJA_CATEGORIES[key as EnterGaujaKey];
}

/**
 * Primary Enter Gauja category for a service.
 * Uses the first entry of `enter_gauja_categories[]` (multiselect on DB),
 * with fallback to service.category (single enum used across the site).
 */
export function pickPrimaryCategory(input: {
  enter_gauja_categories?: string[] | null;
  category?: string | null;
}): EnterGaujaCategoryInfo | undefined {
  const arr = input.enter_gauja_categories ?? [];
  for (const k of arr) {
    const info = getEnterGaujaCategory(k);
    if (info) return info;
  }
  return getEnterGaujaCategory(input.category);
}

/** Default Enter Gauja category for a Wanderlust service type. */
export function defaultCategoryForType(
  type: "excursion" | "hiking" | "transfer" | string | null | undefined,
): EnterGaujaCategoryInfo | undefined {
  switch (type) {
    case "hiking":
      return ENTER_GAUJA_CATEGORIES.nature;
    case "excursion":
      return ENTER_GAUJA_CATEGORIES.history;
    default:
      return undefined; // transfers → supplementary (Gauja Get-around), no primary badge
  }
}
