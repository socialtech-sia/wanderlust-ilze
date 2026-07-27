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

      <div className="space-y-4">
        {settings.map((s) => (
          <SettingCard key={s.key} setting={s} onSave={(raw) => save.mutate({ key: s.key, raw })} />
        ))}
      </div>
    </>
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
