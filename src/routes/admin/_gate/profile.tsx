import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LangTabs, type AdminLang } from "@/components/admin/LangTabs";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/_gate/profile")({
  component: AdminProfile,
});

type Profile = Tables<"profile">;

function AdminProfile() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.id) return;
    setSaving(true);
    // Контакты намеренно исключены из патча: их источник —
    // site_settings.contact_*, а колонки profile.* оставлены только ради
    // совместимости схемы. Записывать их отсюда значило бы снова развести
    // два набора значений.
    const { id, created_at, updated_at, email, phone, whatsapp, ...patch } = form as Profile;
    const { error } = await supabase.from("profile").update(patch).eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profils saglabāts");
    await queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
  }

  return (
    <>
      <AdminPageHeader
        title="Gida profils"
        description="Informācija par Ilzi Gulbi"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Saglabāt
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-5">
          <LangTabs
            render={(lang: AdminLang) => (
              <>
                <div className="space-y-1.5">
                  <Label>Loma ({lang})</Label>
                  <Input
                    value={(form[`role_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`role_${lang}` as keyof Profile, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Īsā biogrāfija ({lang})</Label>
                  <Textarea
                    rows={3}
                    value={(form[`short_bio_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`short_bio_${lang}` as keyof Profile, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pilnā biogrāfija ({lang})</Label>
                  <Textarea
                    rows={10}
                    value={(form[`bio_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`bio_${lang}` as keyof Profile, e.target.value as never)}
                  />
                </div>
              </>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label>Vārds, uzvārds</Label>
            <Input value={form.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          {/*
            Полей «E-pasts», «Tālrunis» и «WhatsApp» здесь больше нет.
            Колонки profile.email / phone / whatsapp не читает ни одна
            страница сайта: подвал, контакты, юридические тексты, письма и
            чат-бот берут site_settings.contact_*. Пока два набора жили
            рядом, в админке был виден один номер, а на сайте другой —
            и «правильным» оказывался тот, который никто не правил.
          */}
          <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            Kontakti (e-pasts, tālrunis, WhatsApp) tiek rediģēti{" "}
            <Link to="/admin/settings" className="font-medium text-foreground underline">
              Iestatījumos
            </Link>
            . Tie paši lauki šeit vairs nav — vietne tos nekad nelasīja.
          </div>
          <div className="space-y-1.5">
            <Label>Pieredze (gadi)</Label>
            <Input
              type="number"
              value={form.years_of_experience ?? ""}
              onChange={(e) => set("years_of_experience", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-1">
            <MediaPicker
              label="Portrets"
              folder="profile"
              value={form.avatar_storage_path ?? null}
              onChange={(path) => set("avatar_storage_path", path)}
            />
            <p className="text-xs text-muted-foreground">
              Redzams sākumlapas sadaļā «Par mani». Tukšs — rāda iniciāļus.
            </p>
          </div>
          <div className="space-y-1">
            <MediaPicker
              label="Hero attēls"
              folder="hero"
              value={form.hero_image_storage_path ?? null}
              onChange={(path) => set("hero_image_storage_path", path)}
            />
            <p className="text-xs text-muted-foreground">
              Sākumlapas un «Par mani» lapas galvenais attēls. Tukšs — rāda noklusējuma attēlu.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
