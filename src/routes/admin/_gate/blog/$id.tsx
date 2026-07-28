import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { slugify } from "@/lib/slugify";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LangTabs, type AdminLang } from "@/components/admin/LangTabs";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/_gate/blog/$id")({
  component: BlogEditor,
});

type Post = Tables<"blog_posts">;

function BlogEditor() {
  const { id } = useParams({ from: "/admin/_gate/blog/$id" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  const [form, setForm] = useState<Partial<Post>>({ status: "draft" });
  const [saving, setSaving] = useState(false);
  const [heroPath, setHeroPath] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "blog", id],
    enabled: !isNew,
    queryFn: async (): Promise<Post | null> => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  // Resolve the featured media row into a storage path for the picker.
  useEffect(() => {
    if (!form.featured_image_id) {
      setHeroPath(null);
      return;
    }
    void supabase
      .from("media")
      .select("storage_path")
      .eq("id", form.featured_image_id)
      .maybeSingle()
      .then(({ data }) => setHeroPath(data?.storage_path ?? null));
  }, [form.featured_image_id]);

  function set<K extends keyof Post>(key: K, value: Post[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleHeroChange(path: string | null) {
    setHeroPath(path);
    if (!path) {
      set("featured_image_id", null);
      return;
    }
    const { data } = await supabase.from("media").select("id").eq("storage_path", path).maybeSingle();
    set("featured_image_id", data?.id ?? null);
  }

  async function handleSave() {
    if (!form.title_lv) {
      toast.error("Virsraksts latviski ir obligāts");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      slug_lv: form.slug_lv || slugify(form.title_lv),
      slug_en: form.slug_en || slugify(form.title_en ?? form.title_lv),
      slug_es: form.slug_es || slugify(form.title_es ?? form.title_lv),
      published_at:
        form.status === "published" ? (form.published_at ?? new Date().toISOString()) : form.published_at ?? null,
    } as TablesInsert<"blog_posts">;

    const { error, data: saved } = isNew
      ? await supabase.from("blog_posts").insert(payload).select("id").single()
      : await supabase.from("blog_posts").update(payload).eq("id", id).select("id").single();

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saglabāts");
    await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    if (isNew && saved) await navigate({ to: "/admin/blog/$id", params: { id: saved.id } });
  }

  async function handleDelete() {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    await navigate({ to: "/admin/blog" });
  }

  return (
    <>
      <AdminPageHeader
        title={isNew ? "Jauns raksts" : (form.title_lv ?? "Raksts")}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/admin/blog" })}>
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
        <div className="rounded-lg border border-border bg-card p-5">
          <LangTabs
            render={(lang: AdminLang) => (
              <>
                <div className="space-y-1.5">
                  <Label>Virsraksts ({lang})</Label>
                  <Input
                    value={(form[`title_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`title_${lang}` as keyof Post, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL slug ({lang})</Label>
                  <Input
                    value={(form[`slug_${lang}`] as string | null) ?? ""}
                    placeholder="tiek ģenerēts automātiski"
                    onChange={(e) => set(`slug_${lang}` as keyof Post, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kopsavilkums ({lang})</Label>
                  <Textarea
                    rows={3}
                    value={(form[`excerpt_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`excerpt_${lang}` as keyof Post, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Saturs ({lang}) — Markdown</Label>
                  <Textarea
                    rows={16}
                    className="font-mono text-sm"
                    value={(form[`content_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`content_${lang}` as keyof Post, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SEO virsraksts ({lang})</Label>
                  <Input
                    value={(form[`meta_title_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`meta_title_${lang}` as keyof Post, e.target.value as never)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SEO apraksts ({lang})</Label>
                  <Textarea
                    rows={2}
                    value={(form[`meta_description_${lang}`] as string | null) ?? ""}
                    onChange={(e) => set(`meta_description_${lang}` as keyof Post, e.target.value as never)}
                  />
                </div>
              </>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label>Statuss</Label>
            <Select value={form.status ?? "draft"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Melnraksts</SelectItem>
                <SelectItem value="published">Publicēts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tagi (atdalīti ar komatu)</Label>
            <Input
              value={(form.tags ?? []).join(", ")}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>

          <MediaPicker label="Galvenais attēls" folder="blog" value={heroPath} onChange={handleHeroChange} />
        </div>
      </div>
    </>
  );
}
