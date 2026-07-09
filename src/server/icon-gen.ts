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

  const seen = new Uint8Array(w * h);
  const queue: [number, number][] = [];
  for (let x = 0; x < w; x++) queue.push([x, 0], [x, h - 1]);
  for (let y = 0; y < h; y++) queue.push([0, y], [w - 1, y]);

  while (queue.length) {
    const [x, y] = queue.pop()!;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (seen[p]) continue;
    seen[p] = 1;
    const i = idx(x, y);
    if (!isBg(i)) continue;
    data[i + 3] = 0;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
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
