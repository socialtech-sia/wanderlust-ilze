import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, Enums } from "@/integrations/supabase/types";
import { slugify } from "@/lib/slugify";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LangTabs, type AdminLang } from "@/components/admin/LangTabs";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/_gate/services/$id")({
  component: ServiceEditor,
});

type Service = Tables<"services">;
type ServiceType = Enums<"service_type">;
type Category = Enums<"enter_gauja_category">;
type Difficulty = Enums<"service_difficulty">;

const TYPES: ServiceType[] = ["excursion", "hiking", "transfer"];
const CATEGORIES: Category[] = ["action", "nature", "history", "culture", "getaround"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const EMPTY: TablesInsert<"services"> = {
  type: "excursion",
  title_lv: "",
  is_active: false,
  sort_order: 100,
};

function ServiceEditor() {
  const { id } = useParams({ from: "/admin/_gate/services/$id" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  const [form, setForm] = useState<Partial<Service>>(EMPTY as Partial<Service>);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "service", id],
    enabled: !isNew,
    queryFn: async (): Promise<Service | null> => {
      const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof Service>(key: K, value: Service[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.title_lv) {
      toast.error("Nosaukums latviski ir obligāts");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      slug_lv: form.slug_lv || slugify(form.title_lv),
      slug_en: form.slug_en || slugify(form.title_en ?? form.title_lv),
      slug_es: form.slug_es || slugify(form.title_es ?? form.title_lv),
    } as TablesInsert<"services">;

    const { error, data: saved } = isNew
      ? await supabase.from("services").insert(payload).select("id").single()
      : await supabase.from("services").update(payload).eq("id", id).select("id").single();

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saglabāts");
    await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    if (isNew && saved) await navigate({ to: "/admin/services/$id", params: { id: saved.id } });
  }

  async function handleDelete() {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Dzēsts");
    await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    await navigate({ to: "/admin/services" });
  }

  const categories = (form.enter_gauja_categories ?? []) as Category[];

  return (
    <>
      <AdminPageHeader
        title={isNew ? "Jauns pakalpojums" : (form.title_lv ?? "Pakalpojums")}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/admin/services" })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atpakaļ
            </Button>
            {!isNew ? (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Saglabāt
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-lg border border-border bg-card p-5">
          <LangTabs
            render={(lang: AdminLang) => (
              <>
                <div className="space-y-1.5">
                  <Label>Nosaukums ({lang})</Label>
                  <Input
                    value={(form[`title_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`title_${lang}` as keyof Service, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL slug ({lang})</Label>
                  <Input
                    value={(form[`slug_${lang}`] as string | null) ?? ""}
                    placeholder="tiek ģenerēts automātiski"
                    onChange={(e) => set(`slug_${lang}` as keyof Service, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Īsais apraksts ({lang})</Label>
                  <Textarea
                    rows={3}
                    value={(form[`short_description_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`short_description_${lang}` as keyof Service, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pilnais apraksts ({lang})</Label>
                  <Textarea
                    rows={8}
                    value={(form[`description_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`description_${lang}` as keyof Service, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SEO virsraksts ({lang})</Label>
                  <Input
                    value={(form[`meta_title_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`meta_title_${lang}` as keyof Service, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SEO apraksts ({lang})</Label>
                  <Textarea
                    rows={2}
                    value={(form[`meta_description_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`meta_description_${lang}` as keyof Service, e.target.value as never)}
                  />
                </div>
              </>
            )}
          />
        </div>

        <div className="space-y-5 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active ?? false} onCheckedChange={(v) => set("is_active", v)} />
            <Label>Publicēts</Label>
          </div>

          <div className="space-y-1.5">
            <Label>Veids</Label>
            <Select value={form.type ?? "excursion"} onValueChange={(v) => set("type", v as ServiceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ilgums (min)</Label>
              <Input
                type="number"
                value={form.duration_minutes ?? ""}
                onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cena no (€)</Label>
              <Input
                type="number"
                value={form.price_from_eur ?? ""}
                onChange={(e) => set("price_from_eur", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min. personas</Label>
              <Input
                type="number"
                value={form.min_persons ?? ""}
                onChange={(e) => set("min_persons", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Maks. personas</Label>
              <Input
                type="number"
                value={form.max_persons ?? ""}
                onChange={(e) => set("max_persons", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kārtība</Label>
              <Input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Grūtība</Label>
              <Select
                value={form.difficulty ?? "none"}
                onValueChange={(v) => set("difficulty", v === "none" ? null : (v as Difficulty))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Enter Gauja kategorijas</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      set(
                        "enter_gauja_categories",
                        (active ? categories.filter((c) => c !== cat) : [...categories, cat]) as never,
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <MediaPicker
            label="Galvenais attēls"
            value={form.hero_image_storage_path ?? null}
            onChange={(path) => set("hero_image_storage_path", path)}
            folder="services"
          />

          {form.type === "transfer" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>No</Label>
                <Input value={form.transfer_from ?? ""} onChange={(e) => set("transfer_from", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Uz</Label>
                <Input value={form.transfer_to ?? ""} onChange={(e) => set("transfer_to", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Transports</Label>
                <Input value={form.vehicle_info ?? ""} onChange={(e) => set("vehicle_info", e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Vieta</Label>
              <Input value={form.location_name ?? ""} onChange={(e) => set("location_name", e.target.value)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
