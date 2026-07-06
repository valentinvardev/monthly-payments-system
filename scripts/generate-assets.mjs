// Generador de assets pixel-art para Surcodia Studio.
//
// Usa la Gemini API (gemini-2.5-flash-image) para generar sprites 8-bit y
// banners, y después fuerza la grilla pixel real: los modelos de difusión
// nunca alinean los "píxeles" perfectamente, así que reducimos con
// nearest-neighbor al tamaño lógico y re-escalamos. Resultado: pixel-perfect.
//
// Uso:
//   node --env-file=.env scripts/generate-assets.mjs --all
//   node --env-file=.env scripts/generate-assets.mjs dev-sur carpincho --variants 2
//
// Salida: public/pixel/<name>-vN.png  (+ original en public/pixel/raw/)
// Requiere GOOGLE_AI_KEY en .env.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import Jimp from "jimp";

const API_KEY = process.env.GOOGLE_AI_KEY;
if (!API_KEY) {
  console.error("Falta GOOGLE_AI_KEY en el entorno. Corré con: node --env-file=.env scripts/generate-assets.mjs");
  process.exit(1);
}

const ACCENT = {
  blue: "#0070F3", // fotografía / marca
  purple: "#7928CA", // e-commerce
  teal: "#17C9A5", // IA
};

const STYLE_DNA = (accent) =>
  `8-bit pixel art sprite, chunky pixels aligned to a strict low-resolution grid (roughly 32x32 logical pixels rendered large), flat solid colors only, strict palette: near-black #0A0A0A, off-white #FAFAFA, one mid gray #8A8A86, plus a single accent color ${accent} used sparingly (under 10% of pixels), plain solid background #0A0A0A, no anti-aliasing, no gradients, no outline glow, no dithering except sparse 2-tone checker dithering for shadows, crisp hard square edges, centered composition, full body, video game character sprite aesthetic, no text, no letters, no watermark`;

const BANNER_DNA = (accent) =>
  `wide 8-bit pixel art scene, strict palette: near-black #0A0A0A, off-white #FAFAFA, one mid gray #8A8A86, single accent ${accent} under 10% of pixels, flat solid colors, no anti-aliasing, crisp pixel grid, minimalist composition with generous empty dark space on one side for text overlay, no text, no letters, no watermark`;

// grid = ancho lógico en píxeles al que se reduce; scale = factor de re-escalado.
const CATALOG = {
  "dev-sur": {
    accent: ACCENT.blue,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a relaxed south american software developer sitting cross-legged with a laptop on his lap, wearing a plain hoodie, holding a mate (traditional argentine gourd drink with metal straw) in one hand, small steam pixels rising from the mate in accent color ${a}, face lit by the laptop screen glow (2-3 accent pixels on the face), calm confident expression`,
  },
  hornero: {
    accent: ACCENT.blue,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a hornero bird (rufous ovenbird, national bird of Argentina, round body, short tail) as a tiny builder, wearing a minimal pixel hard hat, standing next to a half-built brick structure shaped like a browser window, carrying one single glowing brick in accent color ${a} in its beak`,
  },
  carpincho: {
    accent: ACCENT.teal,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a capybara lying down completely relaxed with tiny sunglasses, a mechanical keyboard in front of its front paws, one paw resting on the keys, a small status LED on the keyboard glowing in accent color ${a}, radiating total calm while work happens on its own`,
  },
  agente: {
    accent: ACCENT.teal,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a small friendly robot with an old CRT monitor as its head, blank screen except a single blinking cursor in accent color ${a}, stubby body with visible bolts, one arm raised in a static wave, tiny antenna with one accent pixel at the tip`,
  },
  camara: {
    accent: ACCENT.blue,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a vintage SLR camera with tiny legs and arms, its lens as a big expressive eye with one accent color ${a} highlight pixel, a small pixel flash going off above it represented as a 5-pixel white starburst, confidently walking forward`,
  },
  changuito: {
    accent: ACCENT.purple,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a shopping cart with rocket thrusters instead of back wheels, thruster flames as 4-6 pixels in accent color ${a}, one single package box inside the cart, slight forward tilt suggesting speed, tiny motion lines made of 3 gray pixels behind it`,
  },
  "hero-cielo": {
    accent: ACCENT.blue,
    aspect: "21:9",
    grid: 320,
    scale: 6,
    prompt: (a) =>
      `wide 8-bit pixel art landscape, night sky over a flat dark horizon line (pampa silhouette), strict palette: near-black background, off-white stars as single crisp pixels, the Southern Cross constellation (Crux) clearly visible and slightly larger than other stars, its fifth smallest star glowing in vivid electric blue, no connecting lines between stars, sparse star field, subtle 2-tone dithering band near the horizon suggesting the Milky Way, no anti-aliasing, no gradients, flat colors, minimalist, lots of empty dark space for text overlay on the left side, absolutely no text, no letters, no numbers, no labels, no watermark`,
  },
  "banner-fotografia": {
    accent: ACCENT.blue,
    aspect: "16:9",
    grid: 240,
    scale: 6,
    prompt: (a) =>
      `${BANNER_DNA(a)}. Scene: a pixel art stadium at night seen from the stands, tiny white camera flashes scattered in the crowd, one photographer silhouette in the foreground holding a camera with an accent-colored lens`,
  },
  "banner-ecommerce": {
    accent: ACCENT.purple,
    aspect: "16:9",
    grid: 240,
    scale: 6,
    prompt: (a) =>
      `${BANNER_DNA(a)}. Scene: a tiny pixel storefront at night with one glowing accent storefront sign, a conveyor belt carrying small package boxes out the door toward the viewer`,
  },
  "banner-ia": {
    accent: ACCENT.teal,
    aspect: "16:9",
    grid: 240,
    scale: 6,
    prompt: (a) =>
      `${BANNER_DNA(a)}. Scene: a dark terminal room with three small CRT screens, each showing a single accent-colored cursor, a tiny friendly CRT-headed robot working alone at the middle screen`,
  },
};

// ---------------- CLI ----------------
const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const MODEL = flag("model", "gemini-2.5-flash-image");
const VARIANTS = Number(flag("variants", "1"));
const names = args.includes("--all")
  ? Object.keys(CATALOG)
  : args.filter((a) => !a.startsWith("--") && a !== flag("model", "") && a !== flag("variants", ""));

if (names.length === 0) {
  console.log("Assets disponibles:\n  " + Object.keys(CATALOG).join("\n  "));
  console.log("\nUso: node --env-file=.env scripts/generate-assets.mjs <nombres...|--all> [--variants N]");
  process.exit(0);
}

const unknown = names.filter((n) => !CATALOG[n]);
if (unknown.length) {
  console.error("Assets desconocidos: " + unknown.join(", "));
  process.exit(1);
}

// ---------------- Gemini ----------------
async function generateImage(prompt, aspect) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: aspect },
    },
  };

  let res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify(body),
  });

  // Algunos modelos/versiones no aceptan imageConfig — reintento sin él.
  if (res.status === 400) {
    delete body.generationConfig.imageConfig;
    body.contents[0].parts[0].text = `${prompt}, ${aspect} aspect ratio`;
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify(body),
    });
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  }
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
  if (!img) {
    const block = data?.promptFeedback?.blockReason;
    throw new Error(block ? `Bloqueado: ${block}` : "La respuesta no trajo imagen");
  }
  return Buffer.from(img.inlineData.data, "base64");
}

// Fuerza la grilla: reduce al ancho lógico con nearest-neighbor y re-escala.
async function pixelize(buffer, gridWidth, scale) {
  const img = await Jimp.read(buffer);
  const ratio = img.bitmap.height / img.bitmap.width;
  const gh = Math.round(gridWidth * ratio);
  img.resize(gridWidth, gh, Jimp.RESIZE_NEAREST_NEIGHBOR);
  img.resize(gridWidth * scale, gh * scale, Jimp.RESIZE_NEAREST_NEIGHBOR);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

// ---------------- main ----------------
const OUT = path.resolve("public/pixel");
const RAW = path.join(OUT, "raw");
await mkdir(RAW, { recursive: true });

for (const name of names) {
  const spec = CATALOG[name];
  for (let v = 1; v <= VARIANTS; v++) {
    const label = VARIANTS > 1 ? `${name}-v${v}` : name;
    process.stdout.write(`⏳ ${label} (${spec.aspect}, grid ${spec.grid})... `);
    try {
      const raw = await generateImage(spec.prompt(spec.accent), spec.aspect);
      await writeFile(path.join(RAW, `${label}.png`), raw);
      const pix = await pixelize(raw, spec.grid, spec.scale);
      await writeFile(path.join(OUT, `${label}.png`), pix);
      console.log(`✔ public/pixel/${label}.png`);
    } catch (e) {
      console.log(`✖ ${e.message}`);
    }
    // Respiro entre llamadas para no golpear rate limits.
    if (names.length > 1 || VARIANTS > 1) await new Promise((r) => setTimeout(r, 2500));
  }
}
console.log("Listo.");
