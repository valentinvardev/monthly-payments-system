import "server-only";
import Jimp from "jimp";
import { env } from "@/lib/env";

// Generación de íconos con Gemini + recorte de fondo. Misma técnica que
// scripts/generate-assets.mjs: le pedimos al modelo un fondo blanco liso
// y lo volamos con flood-fill desde los bordes — solo se vuelve
// transparente lo conectado al borde, así los blancos/claros INTERNOS
// del ícono sobreviven. Salida: PNG 500x500 con alpha.

const MODEL = "gemini-2.5-flash-image";
const OUTPUT_SIZE = 500;

// Sufijo fijo: UN ícono aislado, centrado, 1:1, fondo blanco recortable.
const PROMPT_SUFFIX =
  ". EXACTLY ONE single isolated icon, never a set, never a collection, never a grid or pattern of multiple icons, one object only, centered with generous margin around it, plain solid pure white background (#FFFFFF), no frame, no border lines, no shadows on the background, no text, no letters, no watermark, high quality, 1:1 aspect ratio";

function removeBackground(img: InstanceType<typeof Jimp>, tolerance = 90) {
  const { width: w, height: h, data } = img.bitmap;
  const idx = (x: number, y: number) => (y * w + x) * 4;
  const corners = [idx(0, 0), idx(w - 1, 0), idx(0, h - 1), idx(w - 1, h - 1)];
  const bg = [0, 1, 2].map((c) => corners.reduce((a, i) => a + data[i + c], 0) / 4);
  const isBg = (i: number) =>
    Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) <
    tolerance;

  // La cola guarda índices de píxel planos en un Int32Array preasignado en
  // vez de tuplas [x, y]: cada entrada pasa de un objeto en el heap (~56 B)
  // a 4 B. Además marcamos `seen` al encolar y no al desencolar, así ningún
  // píxel entra más de una vez — sin eso, cada píxel de fondo empujaba sus 4
  // vecinos sin filtrar y la cola crecía a ~4x el área de la imagen.
  // Con ambas cosas, w*h entradas es cota exacta: 4 MB fijos a 1024x1024.
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qlen = 0;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    queue[qlen++] = p;
  };

  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }

  while (qlen > 0) {
    const p = queue[--qlen];
    const i = p * 4;
    if (!isBg(i)) continue;
    data[i + 3] = 0;
    const x = p % w;
    const y = (p - x) / w;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
}

export async function generateIcon(prompt: string): Promise<Buffer> {
  if (!env.GOOGLE_AI_KEY) {
    throw new Error("Falta GOOGLE_AI_KEY en el .env del servidor");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GOOGLE_AI_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt.trim() + PROMPT_SUFFIX }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: "1:1" },
        },
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Gemini respondió HTTP ${res.status}`);
  }
  const parts: { inlineData?: { mimeType?: string; data?: string } }[] =
    data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
  if (!img?.inlineData?.data) {
    const block = data?.promptFeedback?.blockReason;
    throw new Error(block ? `Bloqueado por Gemini: ${block}` : "La respuesta no trajo imagen");
  }

  const image = await Jimp.read(Buffer.from(img.inlineData.data, "base64"));
  removeBackground(image);
  image.resize(OUTPUT_SIZE, OUTPUT_SIZE);
  return image.getBufferAsync(Jimp.MIME_PNG);
}
