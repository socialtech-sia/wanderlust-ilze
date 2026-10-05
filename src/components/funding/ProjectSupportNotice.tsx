/**
 * Project funding / visibility notice.
 *
 * Required for reporting to the fund: the supporting programme's logo plus the
 * project reference must be visible on the site. Two constraints shape this file:
 *
 * 1. Strings are static per-language constants, NOT i18next lookups. The block
 *    has to be in the server-rendered HTML because it may be checked by tooling
 *    that does not execute JavaScript. `lang` comes from the route params, so
 *    this renders identically on the server and after hydration.
 * 2. The logo is reproduced as supplied: no opacity, no grayscale, no recolor,
 *    no overlay, no distortion. Only the surrounding block is muted. The source
 *    file is a JPEG whose artwork bleeds to all four edges with no built-in
 *    clear space, so the white plate below supplies both the required clear
 *    space and a deliberate-looking edge against the dark footer.
 *
 * The Latvian wording is dictated by the programme and must not be edited.
 */

const LOGO_SRC = "/eu-logo.jpg";

/** Intrinsic size of the source file — pins the aspect ratio, prevents reflow. */
const LOGO_W = 240;
const LOGO_H = 308;

const LOGO_ALT = "Nacionālais attīstības plāns 2027";

const NOTICE = {
  lv: 'Mājas lapas uzlabošana/izveidei tika veikta ar projekta Nr. 1.2.3.6/2/24/A/008 "Gaujas Nacionālā parka tūrisma biedrība" atbalstu.',
  en: 'The improvement/creation of the website was carried out with the support of project No. 1.2.3.6/2/24/A/008 "Gaujas Nacionālā parka tūrisma biedrība".',
  es: 'La mejora/creación del sitio web se llevó a cabo con el apoyo del proyecto n.º 1.2.3.6/2/24/A/008 "Gaujas Nacionālā parka tūrisma biedrība".',
} as const;

type Lang = keyof typeof NOTICE;

export function ProjectSupportNotice({ lang }: { lang: Lang }) {
  return (
    <div className="border-t border-border">
      <div className="container-editorial flex items-start gap-4 py-5 md:items-center md:gap-5">
        {/* Light plate: the JPEG has no transparency and no margin of its own. */}
        <span className="shrink-0 rounded-sm bg-white p-2.5">
          <img
            src={LOGO_SRC}
            alt={LOGO_ALT}
            width={LOGO_W}
            height={LOGO_H}
            // Deliberately NOT lazy: this is a compliance asset, and a checker
            // that screenshots without scrolling must still get the pixels.
            // Eager makes React emit a head preload, so keep the priority low —
            // it must not contend with the hero image for LCP.
            loading="eager"
            fetchPriority="low"
            decoding="async"
            className="block h-10 w-auto object-contain md:h-11"
          />
        </span>
        <p className="max-w-3xl text-xs leading-relaxed text-ink-muted">{NOTICE[lang]}</p>
      </div>
    </div>
  );
}
