import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { deleteMedia, getPublicUrl, uploadAndRegister, MEDIA_FOLDERS, type MediaFolder } from "@/lib/storage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/_gate/media")({
  component: AdminMedia,
});

type Media = Tables<"media">;

function AdminMedia() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState<MediaFolder>("services");
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async (): Promise<Media[]> => {
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateAlt = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Media> }) => {
      const { error } = await supabase.from("media").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "media"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: ({ id, path }: { id: string; path: string }) => deleteMedia(id, path),
    onSuccess: () => {
      toast.success("Fails dzēsts");
      void queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadAndRegister(file, folder);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Augšupielāde pabeigta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Augšupielāde neizdevās");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Mediji"
        description="Attēli tiek automātiski pārveidoti uz WebP (maks. 2400 px)"
        actions={
          <>
            <Select value={folder} onValueChange={(v) => setFolder(v as MediaFolder)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_FOLDERS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              Augšupielādēt
            </Button>
          </>
        }
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Ielādē…</p> : null}
      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bibliotēka ir tukša — augšupielādē pirmo attēlu.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={getPublicUrl(m.storage_path)}
              alt={m.alt_lv ?? m.storage_path}
              className="h-40 w-full object-cover"
              loading="lazy"
            />
            <div className="space-y-2 p-3">
              <p className="truncate font-mono text-xs text-muted-foreground">{m.storage_path}</p>
              <Input
                defaultValue={m.alt_lv ?? ""}
                placeholder="Alt LV"
                onBlur={(e) => updateAlt.mutate({ id: m.id, patch: { alt_lv: e.target.value } })}
              />
              <Input
                defaultValue={m.alt_en ?? ""}
                placeholder="Alt EN"
                onBlur={(e) => updateAlt.mutate({ id: m.id, patch: { alt_en: e.target.value } })}
              />
              <Input
                defaultValue={m.alt_es ?? ""}
                placeholder="Alt ES"
                onBlur={(e) => updateAlt.mutate({ id: m.id, patch: { alt_es: e.target.value } })}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(getPublicUrl(m.storage_path));
                    toast.success("Saite nokopēta");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Saite
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove.mutate({ id: m.id, path: m.storage_path })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Dzēst
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
