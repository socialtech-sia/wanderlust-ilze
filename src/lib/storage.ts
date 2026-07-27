/**
 * Media storage helpers for the admin CMS.
 * Bucket name is fixed; the Supabase URL/keys come from env via the generated client.
 */

import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

export const MEDIA_BUCKET = "public-media";

export type MediaFolder = "services" | "profile" | "blog" | "hero" | "misc";

export const MEDIA_FOLDERS: MediaFolder[] = ["services", "profile", "blog", "hero", "misc"];

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  extension: string;
}

const MAX_EDGE = 2400;

/**
 * Downscale to max 2400px on the long edge and convert to WebP.
 * Uses createImageBitmap + canvas — no extra dependencies.
 * SVG files are passed through untouched.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  if (file.type === "image/svg+xml") {
    return { blob: file, width: 0, height: 0, mimeType: file.type, extension: "svg" };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Neizdevās sagatavot attēlu");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85),
  );
  if (!blob) throw new Error("Neizdevās konvertēt attēlu");

  return { blob, width, height, mimeType: "image/webp", extension: "webp" };
}

export function getPublicUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (/^https?:\/\//.test(storagePath)) return storagePath;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export interface UploadedMedia {
  storagePath: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  mimeType: string;
}

/** Process, upload to `folder/` and return storage metadata (no DB write). */
export async function uploadImage(file: File, folder: MediaFolder): Promise<UploadedMedia> {
  const processed = await processImage(file);
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "attels";
  const path = `${folder}/${Date.now()}-${base}.${processed.extension}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, processed.blob, { contentType: processed.mimeType, upsert: false });
  if (error) throw error;

  return {
    storagePath: path,
    width: processed.width,
    height: processed.height,
    fileSizeBytes: processed.blob.size,
    mimeType: processed.mimeType,
  };
}

/** Upload + insert a row into `media`. Returns the created row id. */
export async function uploadAndRegister(file: File, folder: MediaFolder): Promise<string> {
  const uploaded = await uploadImage(file, folder);
  const { data, error } = await supabase
    .from("media")
    .insert({
      storage_path: uploaded.storagePath,
      bucket: MEDIA_BUCKET,
      mime_type: uploaded.mimeType,
      width: uploaded.width || null,
      height: uploaded.height || null,
      file_size_bytes: uploaded.fileSizeBytes,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteMedia(id: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
  if (storageError) throw storageError;
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw error;
}
