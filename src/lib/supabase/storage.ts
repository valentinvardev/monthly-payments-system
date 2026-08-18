import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "proofs";

type BucketSpec = {
  name: string;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
};

// Comprobantes de pago que sube el cliente desde el portal.
const PROOFS: BucketSpec = {
  name: BUCKET,
  fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
};

// Documentos que el admin adjunta a un presupuesto. Sólo PDF: es lo que
// el visor del presupuesto sabe mostrar, y aceptar cualquier cosa
// significaría ofrecerle al destinatario un archivo que no puede abrir.
const QUOTE_DOCS: BucketSpec = {
  name: "quote-docs",
  fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: ["application/pdf"],
};

const ensured = new Set<string>();

// Create the bucket lazily on first use. Idempotent; bucket lives forever
// once created. Private (not public) — every access goes through a signed
// URL with TTL.
async function ensureBucket(spec: BucketSpec) {
  if (ensured.has(spec.name)) return;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`No pudimos leer buckets de Storage: ${error.message}`);
  }
  if (!data?.some((b) => b.name === spec.name)) {
    const { error: createErr } = await supabase.storage.createBucket(spec.name, {
      public: false,
      fileSizeLimit: spec.fileSizeLimit,
      allowedMimeTypes: spec.allowedMimeTypes,
    });
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(`No pudimos crear el bucket: ${createErr.message}`);
    }
  }
  ensured.add(spec.name);
}

// One-shot signed upload URL: the browser PUTs the file straight to
// Supabase and hands the path back, so the file never travels through
// the Node process — on a 1 GB VPS a 10 MB PDF in memory is not free.
async function uploadToken(spec: BucketSpec, prefix: string, filename: string) {
  await ensureBucket(spec);
  const supabase = getSupabaseAdmin();
  const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${prefix}/${Date.now()}-${safe}`;
  const { data, error } = await supabase.storage
    .from(spec.name)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(`No pudimos generar el upload URL: ${error?.message ?? "desconocido"}`);
  }
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

async function signedDownloadUrl(
  spec: BucketSpec,
  path: string,
  ttlSeconds: number,
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(spec.name)
    .createSignedUrl(path, ttlSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

// Returns a one-shot signed upload URL the client can PUT a file to.
// Path layout: <invoiceId>/<timestamp>-<sanitizedFilename>
export async function getProofUploadToken(args: {
  invoiceId: string;
  filename: string;
}): Promise<{ signedUrl: string; token: string; path: string }> {
  return uploadToken(PROOFS, args.invoiceId, args.filename);
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
  return signedDownloadUrl(PROOFS, pathOrUrl, ttlSeconds);
}

// Un presupuesto todavía sin guardar no tiene id, así que el prefijo es
// un uuid suelto. La carpeta es sólo orden dentro del bucket: la
// referencia buena es la fila de QuoteAttachment.
export async function getQuoteDocUploadToken(args: {
  quoteId?: string;
  filename: string;
}): Promise<{ signedUrl: string; token: string; path: string }> {
  return uploadToken(QUOTE_DOCS, args.quoteId ?? crypto.randomUUID(), args.filename);
}

export async function getQuoteDocSignedUrl(
  path: string,
  ttlSeconds = 3600,
): Promise<string | null> {
  return signedDownloadUrl(QUOTE_DOCS, path, ttlSeconds);
}

// Borrar el archivo es best-effort: si Storage falla, la fila igual se
// va y lo único que queda es un PDF huérfano que nadie puede alcanzar
// sin la ruta. Cortar el borrado por eso sería peor.
export async function deleteQuoteDocs(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(QUOTE_DOCS.name).remove(paths);
}

export const PROOF_BUCKET = BUCKET;
