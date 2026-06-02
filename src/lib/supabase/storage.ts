import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "proofs";

let ensured = false;

// Create the bucket lazily on first use. Idempotent; bucket lives forever
// once created. Private (not public) — every access goes through a signed
// URL with TTL.
async function ensureBucket() {
  if (ensured) return;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`No pudimos leer buckets de Storage: ${error.message}`);
  }
  if (!data?.some((b) => b.name === BUCKET)) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "application/pdf",
      ],
    });
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(`No pudimos crear el bucket: ${createErr.message}`);
    }
  }
  ensured = true;
}

// Returns a one-shot signed upload URL the client can PUT a file to.
// Path layout: <invoiceId>/<timestamp>-<sanitizedFilename>
export async function getProofUploadToken(args: {
  invoiceId: string;
  filename: string;
}): Promise<{ signedUrl: string; token: string; path: string }> {
  await ensureBucket();
  const supabase = getSupabaseAdmin();
  const safe = args.filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${args.invoiceId}/${Date.now()}-${safe}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(`No pudimos generar el upload URL: ${error?.message ?? "desconocido"}`);
  }
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

// Returns a short-lived signed download URL the admin can open in a new tab.
// Returns null for legacy demo paths (http://demo.invalid/...) or on errors.
export async function getProofSignedDownloadUrl(
  pathOrUrl: string | null | undefined,
  ttlSeconds = 3600,
): Promise<string | null> {
  if (!pathOrUrl) return null;
  // Legacy / demo: stored as a fake URL. Pass through as-is.
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(pathOrUrl, ttlSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

export const PROOF_BUCKET = BUCKET;
