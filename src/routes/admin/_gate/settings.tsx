import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_gate/settings")({
  component: AdminSettings,
});

type Setting = Tables<"site_settings">;

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

  return (
    <>
      <AdminPageHeader title="Iestatījumi" description="Kontaktinformācija, virsraksti un SEO noklusējumi" />

      {isLoading ? <p className="text-sm text-muted-foreground">Ielādē…</p> : null}

      <ChatbotCard
        settings={settings}
        onSave={(key, raw) => save.mutate({ key, raw })}
      />

      <div className="space-y-4">
        {settings.map((s) => (
          <SettingCard key={s.key} setting={s} onSave={(raw) => save.mutate({ key: s.key, raw })} />
        ))}
      </div>
    </>
  );
}

const GREETING_KEYS = [
  { key: "chatbot_greeting_lv", label: "Sveiciens (LV)" },
  { key: "chatbot_greeting_en", label: "Sveiciens (EN)" },
  { key: "chatbot_greeting_es", label: "Sveiciens (ES)" },
] as const;

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
    <div className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-4">
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
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
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
        className="font-mono text-xs"
        onChange={(e) => {
          draft = e.target.value;
        }}
      />
    </div>
  );
}
