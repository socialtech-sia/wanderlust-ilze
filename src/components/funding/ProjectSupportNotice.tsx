/**
 * Project funding / visibility notice.
 *
 * Required for reporting to the fund: the supporting programme's logo plus the
 * project reference must be visible on the site. Three constraints shape this file:
 *
 * 1. Strings are static per-language constants, NOT i18next lookups. The block
 *    has to be in the server-rendered HTML because it may be checked by tooling
 *    that does not execute JavaScript. `lang` comes from the route params, so
 *    this renders identically on the server and after hydration.
 * 2. The logo is the official combined ES fondi 2021-2027 lockup: the EU emblem
 *    captioned "Līdzfinansē Eiropas Savienība", plus NAP2027. The white
 *    single-colour variant is the correct one here — this footer sits on
 *    `bg-paper-alt`, which on every public route resolves to dark pine
 *    (`--pine-raised`); the light scopes (`.surface-light`, `.admin-scope`)
 *    never contain it. In that variant the emblem is a white keyline rectangle
 *    with white stars on a transparent field, which is exactly how the emblem
 *    is reproduced on a dark background — so it needs no plate under it. The
 *    colour variant is kept at /eu-nap-logo-color.svg for a light surface.
 *    Reproduced as supplied: no opacity, no recolor, no overlay, no crop, no
 *    distortion. Only the surrounding block is muted.
 * 3. Size. The EU emblem *inside* the lockup must stay at least 40px tall. The
 *    emblem rectangle measures 135.4 of the file's 206.1 viewBox units — 65.7%
 *    of the rendered height — so the whole lockup has to be at least 61px tall
 *    for the emblem to clear 40px. Hence h-16: emblem 42.0px, white keyline
 *    44.6px, lockup 145.7px wide at the file's 2.276:1. That floor does not
 *    move with the viewport, so the logo must NOT shrink on small screens;
 *    the block stacks below `sm` instead, which is also what keeps the clear
 *    space intact at 360px.
 *
 * The Latvian wording is dictated by the programme and must not be edited.
 */

const LOGO_SRC = "/eu-nap-logo-white.svg";

/** viewBox of the source file, rounded — pins the aspect ratio, prevents reflow. */
const LOGO_W = 469;
const LOGO_H = 206;

/** The wording set in the artwork itself; it is Latvian in all three locales. */
const LOGO_ALT = "Līdzfinansē Eiropas Savienība. Nacionālais attīstības plāns 2027";

const NOTICE = {
  lv: 'Mājas lapas uzlabošana/izveidei tika veikta ar projekta Nr. 1.2.3.6/2/24/A/008 "Gaujas Nacionālā parka tūrisma biedrība" atbalstu.',
  en: 'The improvement/creation of the website was carried out with the support of project No. 1.2.3.6/2/24/A/008 "Gaujas Nacionālā parka tūrisma biedrība".',
  es: 'La mejora/creación del sitio web se llevó a cabo con el apoyo del proyecto n.º 1.2.3.6/2/24/A/008 "Gaujas Nacionālā parka tūrisma biedrība".',
} as const;

type Lang = keyof typeof NOTICE;

export function ProjectSupportNotice({ lang }: { lang: Lang }) {
  return (
    <div className="border-t border-border">
      <div className="container-editorial flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:gap-6">
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
          // self-start matters: in the stacked (mobile) layout a flex item with
          // `width: auto` stretches to the container, and the SVG then letterboxes
          // itself inside that box — the artwork stays undistorted but drifts to the
          // centre, out of line with the text. Shrink-to-fit instead.
          className="block h-16 w-auto shrink-0 self-start sm:self-center"
        />
        <p className="max-w-3xl text-xs leading-relaxed text-ink-muted">{NOTICE[lang]}</p>
      </div>
    </div>
  );
}
