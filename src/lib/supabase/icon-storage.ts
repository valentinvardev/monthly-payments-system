import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Bucket PÚBLICO para los íconos generados: se sirven directo por URL
// (sin signed URLs — son assets de diseño, no datos sensibles).
const BUCKET = "generated-icons";

let ensured = false;

async function ensureBucket() {
  if (ensured) return;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`No pudimos leer buckets de Storage: ${error.message}`);
  }
  if (!data?.some((b) => b.name === BUCKET)) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/png"],
    });
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(`No pudimos crear el bucket: ${createErr.message}`);
    }
  }
  ensured = true;
}

export async function uploadGeneratedIcon(args: {
  label: string;
  png: Buffer;
}): Promise<{ path: string; url: string }> {
  await ensureBucket();
  const supabase = getSupabaseAdmin();
  const safe = args.label.toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "icono";
  const path = `${safe}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, args.png, {
    contentType: "image/png",
    cacheControl: "31536000",
  });
  if (error) {
    throw new Error(`No pudimos subir el ícono: ${error.message}`);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deleteGeneratedIcon(path: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(BUCKET).remove([path]);
}
