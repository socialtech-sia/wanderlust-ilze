/**
 * Home-page Enter Gauja cooperation block — grant category is Enter Action.
 * Uses the official partner backlink block per guidelines §4.
 */

import { EnterGaujaBacklinkBlock } from "@/components/entergauja/EnterGaujaBacklinkBlock";
import { ENTER_GAUJA_CATEGORIES, EG_HOMEPAGE_DEFAULT } from "@/lib/enter-gauja";

export function EnterGaujaBadge() {
  return (
    <section className="container-editorial pb-20 md:pb-28">
      <EnterGaujaBacklinkBlock category={ENTER_GAUJA_CATEGORIES[EG_HOMEPAGE_DEFAULT]} />
    </section>
  );
}
