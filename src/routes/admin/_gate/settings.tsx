import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaFolder } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_gate/settings")({
  component: AdminSettings,
});

type Setting = Tables<"site_settings">;

/**
 * Контакты сайта. ЕДИНСТВЕННОЕ место, где они правятся.
 *
 * Те же три ключа читают: подвал, страница контактов, три юридические
 * страницы, письма и чат-бот. В таблице profile есть похожие колонки
 * (phone, whatsapp, email) — они не используются нигде и в админке больше
 * не показываются: именно из-за них в админке был один номер, а на сайте
 * другой.
 */
const CONTACT_KEYS = [
  { key: "contact_email", label: "E-pasts", placeholder: "info@wanderlust.lv" },
  { key: "contact_phone", label: "Tālrunis", placeholder: "+371 00000000" },
  { key: "contact_whatsapp", label: "WhatsApp", placeholder: "+37100000000" },
] as const;

/** Адрес, на который уходят письма о новых бронях и сообщениях.
 *  Отдельно от публичных контактов: этот на сайте не показывается. */
const NOTIFICATION_KEY = {
  key: "booking_notification_email",
  label: "Paziņojumu e-pasts",
  placeholder: "ilze@wanderlust.lv",
} as const;

/** Идентификатор GA4. Пусто — аналитика на сайт не подключается вовсе. */
const ANALYTICS_KEY = {
  key: "google_analytics_id",
  label: "Google Analytics ID",
  placeholder: "G-XXXXXXXXXX",
} as const;

/** Ключи с путями к картинкам: их правит MediaPicker, а не JSON-поле. */
const IMAGE_KEYS = [
  { key: "home_hero_storage_path", label: "Sākumlapas hero", folder: "hero" },
  { key: "about_hero_storage_path", label: "Lapa «Par mani» — hero", folder: "hero" },
  { key: "tours_hero_storage_path", label: "Ekskursiju lapa — hero", folder: "hero" },
  { key: "hiking_hero_storage_path", label: "Pārgājienu lapa — hero", folder: "hero" },
  { key: "transfers_hero_storage_path", label: "Transfēru lapa — hero", folder: "hero" },
  { key: "tile_excursion_storage_path", label: "Flīze: ekskursijas", folder: "misc" },
  { key: "tile_hiking_storage_path", label: "Flīze: pārgājieni", folder: "misc" },
  { key: "tile_transfer_storage_path", label: "Flīze: transfēri", folder: "misc" },
] as const;

const GREETING_KEYS = [
  { key: "chatbot_greeting_lv", label: "Sveiciens (LV)" },
  { key: "chatbot_greeting_en", label: "Sveiciens (EN)" },
  { key: "chatbot_greeting_es", label: "Sveiciens (ES)" },
] as const;

/**
 * Ключи, которые НИ НА ЧТО не влияют, и потому в админке не показываются.
 *
 * Строки остаются в базе (удалять данные из-за интерфейса незачем), но
 * редактировать их клиенту нельзя: правка не даёт никакого результата, а
 * поле в админке обещает обратное.
 *
 *   default_language — язык выбирается из адреса (/lv, /en, /es), а корень
 *     сайта редиректит на lv. Ключ не читает никто.
 *   hero_headline / hero_subline / footer_text без языкового суффикса —
 *     остатки одноязычной версии. Код читает только `${key}_${lang}`.
 */
const HIDDEN_KEYS = new Set<string>([
  "default_language",
  "hero_headline",
  "hero_subline",
  "footer_text",
]);

/** Ключи, у которых есть своя карточка — в общий JSON-список они не идут,
 *  иначе одно значение редактировалось бы в двух местах сразу. */
const HANDLED_KEYS = new Set<string>([
  ...CONTACT_KEYS.map((c) => c.key),
  NOTIFICATION_KEY.key,
  ANALYTICS_KEY.key,
  ...IMAGE_KEYS.map((i) => i.key),
  ...GREETING_KEYS.map((g) => g.key),
  "chatbot_enabled",
]);

function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async (): Promise<Setting[]> => {
      const { data, error } = await supabase.from("site_settings").select("*").order("key");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async ({ key, raw }: { key: string; raw: string }) => {
      let value: unknown;
      try {
        value = JSON.parse(raw);
      } catch {
        throw new Error("Nederīgs JSON formāts");
      }
      const { error } = await supabase
        .from("site_settings")
        .update({ value: value as Setting["value"] })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saglabāts");
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSave = (key: string, raw: string) => save.mutate({ key, raw });
  const find = (key: string): unknown => settings.find((s) => s.key === key)?.value;
  const str = (key: string): string => (typeof find(key) === "string" ? (find(key) as string) : "");

  return (
    <>
      <AdminPageHeader
        title="Iestatījumi"
        description="Kontaktinformācija, attēli, virsraksti un SEO noklusējumi"
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Ielādē…</p> : null}

      <ContactsCard
        values={CONTACT_KEYS.map((c) => ({ ...c, value: str(c.key) }))}
        notification={{ ...NOTIFICATION_KEY, value: str(NOTIFICATION_KEY.key) }}
        onSave={onSave}
      />

      <ImagesCard values={IMAGE_KEYS.map((i) => ({ ...i, value: str(i.key) }))} onSave={onSave} />

      <AnalyticsCard value={str(ANALYTICS_KEY.key)} onSave={onSave} />

      <ChatbotCard settings={settings} onSave={onSave} />

      <div className="space-y-4">
        {settings
          .filter((s) => !HANDLED_KEYS.has(s.key) && !HIDDEN_KEYS.has(s.key))
          .map((s) => (
            <SettingCard key={s.key} setting={s} onSave={(raw) => onSave(s.key, raw)} />
          ))}
      </div>
    </>
  );
}

function ContactsCard({
  values,
  notification,
  onSave,
}: {
  values: { key: string; label: string; placeholder: string; value: string }[];
  notification: { key: string; label: string; placeholder: string; value: string };
  onSave: (key: string, raw: string) => void;
}) {
  return (
    <div className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <Label className="text-sm">Kontakti</Label>
        <p className="text-xs text-muted-foreground">
          Šie ir vienīgie kontakti, kas redzami vietnē: kājenē, kontaktu lapā, juridiskajās lapās,
          e-pastos un čatbotā.
        </p>
      </div>
      {values.map((c) => (
        <TextSettingField
          key={c.key}
          label={c.label}
          initial={c.value}
          placeholder={c.placeholder}
          onSave={(text) => onSave(c.key, JSON.stringify(text.trim()))}
        />
      ))}

      <div className="border-t border-border pt-4">
        <TextSettingField
          label={notification.label}
          initial={notification.value}
          placeholder={notification.placeholder}
          onSave={(text) => onSave(notification.key, JSON.stringify(text.trim()))}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Uz šo adresi nāk paziņojumi par jaunām rezervācijām un ziņām. Vietnē tā nav redzama.
        </p>
      </div>
    </div>
  );
}

function AnalyticsCard({
  value,
  onSave,
}: {
  value: string;
  onSave: (key: string, raw: string) => void;
}) {
  return (
    <div className="mb-6 space-y-2 rounded-lg border border-border bg-card p-4">
      <TextSettingField
        label={ANALYTICS_KEY.label}
        initial={value}
        placeholder={ANALYTICS_KEY.placeholder}
        onSave={(text) => onSave(ANALYTICS_KEY.key, JSON.stringify(text.trim()))}
      />
      <p className="text-xs text-muted-foreground">
        Formāts G-XXXXXXXXXX. Tukšs — analītika vietnē netiek pieslēgta vispār. Skripts ielādējas
        tikai pēc apmeklētāja piekrišanas analītikas sīkdatnēm.
      </p>
    </div>
  );
}

function ImagesCard({
  values,
  onSave,
}: {
  values: { key: string; label: string; folder: MediaFolder; value: string }[];
  onSave: (key: string, raw: string) => void;
}) {
  return (
    <div className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <Label className="text-sm">Attēli</Label>
        <p className="text-xs text-muted-foreground">
          Tukšs lauks — vietnē rādās noklusējuma attēls. Izmaiņas saglabājas uzreiz.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {values.map((img) => (
          <MediaPicker
            key={img.key}
            label={img.label}
            folder={img.folder}
            value={img.value || null}
            onChange={(path) => onSave(img.key, JSON.stringify(path ?? ""))}
          />
        ))}
      </div>
    </div>
  );
}

function ChatbotCard({
  settings,
  onSave,
}: {
  settings: Setting[];
  onSave: (key: string, raw: string) => void;
}) {
  const find = (key: string): unknown => settings.find((s) => s.key === key)?.value;
  const enabled = find("chatbot_enabled") !== false;

  return (
    <div className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm">AI čatbots</Label>
          <p className="text-xs text-muted-foreground">
            Ieslēdz vai izslēdz asistentu publiskajā vietnē
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => onSave("chatbot_enabled", JSON.stringify(v))}
        />
      </div>

      {GREETING_KEYS.map(({ key, label }) => (
        <GreetingField
          key={key}
          label={label}
          initial={typeof find(key) === "string" ? (find(key) as string) : ""}
          onSave={(text) => onSave(key, JSON.stringify(text))}
        />
      ))}
    </div>
  );
}

/**
 * Однострочное поле настройки.
 *
 * `key={initial}` на компоненте: после сохранения запрос инвалидируется, из
 * базы приходит новое значение, и поле обязано показать именно его. Без
 * пересоздания состояние черновика пережило бы обновление данных — ровно тот
 * случай, когда в админке на экране одно, а в базе другое.
 */
function TextSettingField({
  initial,
  ...rest
}: {
  label: string;
  initial: string;
  placeholder: string;
  onSave: (text: string) => void;
}) {
  return <TextSettingInput key={initial} initial={initial} {...rest} />;
}

function TextSettingInput({
  label,
  initial,
  placeholder,
  onSave,
}: {
  label: string;
  initial: string;
  placeholder: string;
  onSave: (text: string) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const dirty = draft.trim() !== initial.trim();

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          className="text-sm"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && dirty) onSave(draft);
          }}
        />
        <Button size="sm" variant="outline" disabled={!dirty} onClick={() => onSave(draft)}>
          <Save className="mr-2 h-4 w-4" />
          Saglabāt
        </Button>
      </div>
    </div>
  );
}

function GreetingField({
  label,
  initial,
  onSave,
}: {
  label: string;
  initial: string;
  onSave: (text: string) => void;
}) {
  let draft = initial;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm">{label}</Label>
        <Button size="sm" variant="outline" onClick={() => onSave(draft)}>
          <Save className="mr-2 h-4 w-4" />
          Saglabāt
        </Button>
      </div>
      <Textarea
        rows={3}
        defaultValue={initial}
        key={initial}
        className="text-sm"
        onChange={(e) => {
          draft = e.target.value;
        }}
      />
    </div>
  );
}

function SettingCard({ setting, onSave }: { setting: Setting; onSave: (raw: string) => void }) {
  const initial = JSON.stringify(setting.value, null, 2);
  let draft = initial;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label className="font-mono text-sm">{setting.key}</Label>
          {setting.description ? (
            <p className="text-xs text-muted-foreground">{setting.description}</p>
          ) : null}
        </div>
        <Button size="sm" variant="outline" onClick={() => onSave(draft)}>
          <Save className="mr-2 h-4 w-4" />
          Saglabāt
        </Button>
      </div>
      <Textarea
        rows={Math.min(12, initial.split("\n").length + 1)}
        defaultValue={initial}
        key={initial}
        className="font-mono text-xs"
        onChange={(e) => {
          draft = e.target.value;
        }}
      />
    </div>
  );
}
