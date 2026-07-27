import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicUrl, uploadAndRegister, type MediaFolder } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface MediaRow {
  id: string;
  storage_path: string;
  alt_lv: string | null;
  alt_en: string | null;
  alt_es: string | null;
}

export function useMediaLibrary() {
  return useQuery({
    queryKey: ["admin", "media"],
    queryFn: async (): Promise<MediaRow[]> => {
      const { data, error } = await supabase
        .from("media")
        .select("id, storage_path, alt_lv, alt_en, alt_es")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

interface MediaPickerProps {
  /** Currently selected storage path (or null). */
  value: string | null;
  onChange: (storagePath: string | null) => void;
  folder?: MediaFolder;
  label?: string;
}

/** Pick an existing image from the library or upload a new one. Stores the storage path. */
export function MediaPicker({ value, onChange, folder = "services", label = "Attēls" }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: media = [], isLoading } = useMediaLibrary();

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const id = await uploadAndRegister(file, folder);
        const { data } = await supabase.from("media").select("storage_path").eq("id", id).single();
        if (data) onChange(data.storage_path);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Attēls augšupielādēts");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Augšupielāde neizdevās");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative">
            <img
              src={getPublicUrl(value)}
              alt="Izvēlētais attēls"
              className="h-24 w-32 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
              aria-label="Noņemt attēlu"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex h-24 w-32 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Izvēlēties
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Mediju bibliotēka</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                Augšupielādēt
              </Button>
              <span className="text-xs text-muted-foreground">Attēli tiek pārveidoti uz WebP, maks. 2400 px</span>
            </div>

            <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {isLoading ? <p className="text-sm text-muted-foreground">Ielādē…</p> : null}
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.storage_path);
                    setOpen(false);
                  }}
                  className="overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
                >
                  <img
                    src={getPublicUrl(m.storage_path)}
                    alt={m.alt_lv ?? "Medija fails"}
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
