/**
 * Enter Gauja brand mapping.
 * Source: EnterGauja Vadlīnijas 2025 (brand guidelines).
 *
 * Primary categories: Nature, History, Culture, Action, Get-around.
 * Each has an official plate/accent color (guidelines §2), symbol,
 * dedicated hub URL on entergauja.lv, and a schema.org type for
 * structured data on partner pages.
 */

import logoAsset from "@/assets/entergauja/entergauja_logo.png.asset.json";

import symbolNature from "@/assets/entergauja/symbol_nature_deer.png.asset.json";
import symbolHistory from "@/assets/entergauja/symbol_history_tower.png.asset.json";
import symbolCulture from "@/assets/entergauja/symbol_culture_star.png.asset.json";
import symbolAction from "@/assets/entergauja/symbol_action_lightning.png.asset.json";
import symbolGetaround from "@/assets/entergauja/symbol_getaround_horse.png.asset.json";

import blockNature from "@/assets/entergauja/block_nature_mountain.png.asset.json";
import blockHistory from "@/assets/entergauja/block_history_mountain.png.asset.json";
import blockCulture from "@/assets/entergauja/block_culture_mountain.png.asset.json";
import blockAction from "@/assets/entergauja/block_action_mountain.png.asset.json";
import blockGetaround from "@/assets/entergauja/block_getaround_mountain.png.asset.json";

import badgeNature from "@/assets/entergauja/badge_nature.png.asset.json";
import badgeHistory from "@/assets/entergauja/badge_history.png.asset.json";
import badgeCulture from "@/assets/entergauja/badge_culture.png.asset.json";
import badgeAction from "@/assets/entergauja/badge_action.png.asset.json";
import badgeGetaround from "@/assets/entergauja/badge_getaround.png.asset.json";

export type EnterGaujaKey =
  | "nature"
  | "history"
  | "culture"
  | "action"
  | "getaround";

export interface EnterGaujaCategoryInfo {
  key: EnterGaujaKey;
  label: string;
  slug: string;
  /** Plate / accent color (guidelines §2, per-category plate). */
  color: string;
  /** Hover / active — unified Enter Gauja olive (#A9AD00). */
  colorActive: string;
  url: string;
  schemaType:
    | "TouristAttraction"
    | "LandmarksOrHistoricalBuildings"
    | "Event"
    | "SportsActivityLocation"
    | "TravelAction";
  symbol: string;
}

/** Unified Enter Gauja olive used for all APSKATĪT button hover/active states. */
export const EG_OLIVE = "#A9AD00";

export const ENTER_GAUJA_CATEGORIES: Record<EnterGaujaKey, EnterGaujaCategoryInfo> = {
  nature: {
    key: "nature",
    label: "Enter Nature",
    slug: "enter-nature",
    color: "#4F6F19",
    colorActive: EG_OLIVE,
    url: "https://entergauja.lv/enter-nature/",
    schemaType: "TouristAttraction",
    symbol: "deer",
  },
  history: {
    key: "history",
    label: "Enter History",
    slug: "enter-history",
    color: "#D1701A",
    colorActive: EG_OLIVE,
    url: "https://entergauja.lv/enter-history/",
    schemaType: "LandmarksOrHistoricalBuildings",
    symbol: "castle",
  },
  culture: {
    key: "culture",
    label: "Enter Culture",
    slug: "enter-culture",
    color: "#51869D",
    colorActive: EG_OLIVE,
    url: "https://entergauja.lv/enter-culture/",
    schemaType: "Event",
    symbol: "austra",
  },
  action: {
    key: "action",
    label: "Enter Action",
    slug: "enter-action",
    color: "#F05366",
    colorActive: EG_OLIVE,
    url: "https://entergauja.lv/enter-action/",
    schemaType: "SportsActivityLocation",
    symbol: "lightning",
  },
  getaround: {
    key: "getaround",
    label: "Gauja Get-around",
    slug: "gauja-get-around",
    color: "#6987B6",
    colorActive: EG_OLIVE,
    url: "https://entergauja.lv/gauja-get-around/",
    schemaType: "TravelAction",
    symbol: "horse",
  },
};

export const ENTER_GAUJA_ORDER: EnterGaujaKey[] = [
  "nature",
  "history",
  "culture",
  "action",
  "getaround",
];

export const ENTER_GAUJA_ROOT_URL = "https://entergauja.lv/";

/** Home page default per grant application. */
export const EG_HOMEPAGE_DEFAULT: EnterGaujaKey = "action";

// ---- Asset maps (official brand kit, PNG on CDN) ---------------------

export const EG_LOGO_ASSET = logoAsset;

export const EG_SYMBOL_ASSET: Record<EnterGaujaKey, { url: string }> = {
  nature: symbolNature,
  history: symbolHistory,
  culture: symbolCulture,
  action: symbolAction,
  getaround: symbolGetaround,
};

export const EG_BLOCK_ASSET: Record<EnterGaujaKey, { url: string }> = {
  nature: blockNature,
  history: blockHistory,
  culture: blockCulture,
  action: blockAction,
  getaround: blockGetaround,
};

export const EG_BADGE_ASSET: Record<EnterGaujaKey, { url: string }> = {
  nature: badgeNature,
  history: badgeHistory,
  culture: badgeCulture,
  action: badgeAction,
  getaround: badgeGetaround,
};

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
    case "transfer":
      return ENTER_GAUJA_CATEGORIES.getaround;
    default:
      return undefined;
  }
}

/** Official LV intro paragraphs (guidelines §4 — must be used verbatim). */
export const EG_OFFICIAL_INTRO_LV: Record<EnterGaujaKey, string> = {
  action:
    '"Enter Action" kategorija piedāvā aizraujošus piedzīvojumus Gaujas reģionā. No laivošanas un raftingiem līdz zip-line un velo maršrutiem — šeit atradīsi gan adrenalīna pilnas aktivitātes, gan ģimenēm piemērotus piedzīvojumus. Partneri nodrošina inventāru, drošības instrukcijas un gidu palīdzību. Plāno savu aktīvās atpūtas ceļojumu kopā ar Enter Gauja.',
  nature:
    'Atklāj Gaujas nacionālā parka bagātības: klintis, alas, skatu vietas un daudzveidīgas pārgājienu takas. "Enter Nature" apvieno dabas apskates objektus un atpūtas vietas dabā — no īsām pastaigām līdz vairāku stundu pārgājieniem. Plāno maršrutu, pārbaudi sezonālos ieteikumus un atklāj, ko darīt tuvumā: kur paēst, kur nakšņot un kā nokļūt līdz sākuma punktam.',
  history:
    '"Enter History" kategorija aicina izzināt Gaujas reģiona vēsturisko mantojumu: viduslaiku pilis, muižas, baznīcas un senos ciemus. Apmeklētāji var baudīt ekskursijas, piedalīties pasākumos un atklāt vietas, kur gadsimtiem glabātas tradīcijas un leģendas. Plāno vizīti, pārbaudi darba laikus, rezervē gidu un apvieno vēstures ceļojumu ar nakšņošanu un restorāniem Gaujas ielejā.',
  culture:
    '"Enter Culture" kategorija aicina baudīt Gaujas reģiona kultūras dzīvi — no grandioziem festivāliem un brīvdabas koncertiem līdz kamerstila izstādēm un teātra uzvedumiem. Partneri piedāvā pieredzes, kas bagātina ceļojumu pa Gaujas ieleju. Plāno apmeklējumu, rezervē biļetes un savieno kultūras pasākumu ar tuvumā esošajām naktsmītnēm un restorāniem.',
  getaround:
    '"Gauja Get-around" kategorija palīdz ceļotājiem ērti sasniegt un izpētīt Gaujas nacionālo parku. Partneri nodrošina transporta iespējas — no sabiedriskā transporta un transfēriem līdz velo un auto nomai. Ar Enter Gauja kartēm un praktisko informāciju tu viegli plānosi ceļojumu un nokļūsi līdz dabas takām, pilsētām un pasākumiem reģionā.',
};
