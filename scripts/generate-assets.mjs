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

import { mkdir, readFile, writeFile } from "node:fs/promises";
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

// Banners de tarjeta: acá NO va espacio vacío — composición rica que llena
// el frame de borde a borde (los de nicho se muestran con object-cover).
const CARD_BANNER_DNA = (accent) =>
  `wide 8-bit pixel art scene, rich detailed composition filling the ENTIRE frame edge to edge, background fully painted with pixel detail everywhere, no large empty or solid-black areas, strict palette: near-black #0A0A0A, off-white #FAFAFA, one mid gray #8A8A86, single accent ${accent} on roughly 15% of pixels, flat solid colors, no anti-aliasing, crisp pixel grid, no text, no letters, no watermark`;

// grid = ancho lógico al que se reduce; scale = factor de re-escalado;
// transparent = quitar el fondo (personajes sí, banners no).
const CATALOG = {
  "dev-sur": {
    accent: ACCENT.blue,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a relaxed south american software developer sitting cross-legged with a laptop on his lap, wearing a plain hoodie, holding a mate (traditional argentine gourd drink with metal straw) in one hand, small steam pixels rising from the mate in accent color ${a}, face lit by the laptop screen glow (2-3 accent pixels on the face), calm confident expression`,
  },
  hornero: {
    accent: ACCENT.blue,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a hornero bird (rufous ovenbird, national bird of Argentina, round body, short tail) as a tiny builder, wearing a minimal pixel hard hat, standing next to a half-built brick structure shaped like a browser window, carrying one single glowing brick in accent color ${a} in its beak`,
  },
  carpincho: {
    accent: ACCENT.teal,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a capybara lying down completely relaxed with tiny sunglasses, a mechanical keyboard in front of its front paws, one paw resting on the keys, a small status LED on the keyboard glowing in accent color ${a}, radiating total calm while work happens on its own`,
  },
  agente: {
    accent: ACCENT.teal,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a small friendly robot with an old CRT monitor as its head, blank screen except a single blinking cursor in accent color ${a}, stubby body with visible bolts, one arm raised in a static wave, tiny antenna with one accent pixel at the tip`,
  },
  camara: {
    accent: ACCENT.blue,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a vintage SLR camera with tiny legs and arms, its lens as a big expressive eye with one accent color ${a} highlight pixel, a small pixel flash going off above it represented as a 5-pixel white starburst, confidently walking forward`,
  },
  changuito: {
    accent: ACCENT.purple,
    aspect: "1:1",
    grid: 96,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `${STYLE_DNA(a)}. Character: a shopping cart with rocket thrusters instead of back wheels, thruster flames as 4-6 pixels in accent color ${a}, one single package box inside the cart, slight forward tilt suggesting speed, tiny motion lines made of 3 gray pixels behind it`,
  },
  // Escudo pixel estilo Belgrano (celeste) para la franja de la landing.
  // Interpretación pixel-art, no el escudo oficial — si Valentin quiere el
  // real, reemplaza public/pixel/belgrano.png a mano.
  belgrano: {
    accent: "#6CACE4",
    aspect: "1:1",
    grid: 72,
    scale: 8,
    transparent: true,
    prompt: (a) =>
      `8-bit pixel art football club crest, classic shield shape, sky blue (celeste ${a}) and white color scheme, a bold letter B in the center in white, small pixel star above the shield, flat solid colors only, no anti-aliasing, no gradients, crisp hard square edges, plain solid background #0A0A0A, centered, no text other than the single letter B, no watermark`,
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
      `${CARD_BANNER_DNA(a)}. Scene: a packed football stadium at night that fills the whole frame — stands crowded with tiny pixel spectators from edge to edge, dozens of white camera flashes popping across the crowd, tall floodlight towers, a strip of green-gray pitch along the bottom, one photographer silhouette with an accent-colored camera lens in the foreground corner`,
  },
  "banner-ecommerce": {
    accent: ACCENT.purple,
    aspect: "16:9",
    grid: 240,
    scale: 6,
    prompt: (a) =>
      `${CARD_BANNER_DNA(a)}. Scene: a bustling pixel shopping street at night filling the entire frame — a row of small storefronts with glowing accent signs, shelves of tiny products visible through windows, a conveyor belt crossing the foreground carrying package boxes, stacked parcels, a tiny delivery cart, hanging cables and rooftops closing the top of the frame`,
  },
  "banner-ia": {
    accent: ACCENT.teal,
    aspect: "16:9",
    grid: 240,
    scale: 6,
    prompt: (a) =>
      `${CARD_BANNER_DNA(a)}. Scene: a mission-control room wall-to-wall with technology filling the whole frame — a large wall of stacked CRT monitors each glowing with tiny accent-colored cursors and graphs, desks with keyboards and tangled cables in the foreground, server racks with blinking lights on both sides, one tiny friendly CRT-headed robot working at the central desk`,
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
// --reprocess: no llama a la API — vuelve a pixelizar (y quitar fondo)
// desde los originales guardados en public/pixel/raw/.
const REPROCESS = args.includes("--reprocess");
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

// Quita el fondo por flood-fill desde los bordes: solo se vuelven
// transparentes los píxeles conectados al borde y parecidos al color de
// fondo — los oscuros INTERNOS del personaje (pelo, teclado, lentes)
// quedan intactos. Se corre a resolución de grilla, antes del upscale.
function removeBackground(img, tolerance = 70) {
  const { width: w, height: h, data } = img.bitmap;
  const idx = (x, y) => (y * w + x) * 4;
  // Color de fondo: promedio de las 4 esquinas.
  const corners = [idx(0, 0), idx(w - 1, 0), idx(0, h - 1), idx(w - 1, h - 1)];
  const bg = [0, 1, 2].map((c) => corners.reduce((a, i) => a + data[i + c], 0) / 4);
  const isBg = (i) =>
    Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) <
    tolerance;

  const seen = new Uint8Array(w * h);
  const queue = [];
  for (let x = 0; x < w; x++) queue.push([x, 0], [x, h - 1]);
  for (let y = 0; y < h; y++) queue.push([0, y], [w - 1, y]);

  while (queue.length) {
    const [x, y] = queue.pop();
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

// Fuerza la grilla: reduce al ancho lógico con nearest-neighbor y re-escala.
async function pixelize(buffer, gridWidth, scale, transparent = false) {
  const img = await Jimp.read(buffer);
  const ratio = img.bitmap.height / img.bitmap.width;
  const gh = Math.round(gridWidth * ratio);
  img.resize(gridWidth, gh, Jimp.RESIZE_NEAREST_NEIGHBOR);
  if (transparent) removeBackground(img);
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
      let raw;
      if (REPROCESS) {
        raw = await readFile(path.join(RAW, `${label}.png`));
      } else {
        raw = await generateImage(spec.prompt(spec.accent), spec.aspect);
        await writeFile(path.join(RAW, `${label}.png`), raw);
      }
      const pix = await pixelize(raw, spec.grid, spec.scale, spec.transparent);
      await writeFile(path.join(OUT, `${label}.png`), pix);
      console.log(`✔ public/pixel/${label}.png`);
    } catch (e) {
      console.log(`✖ ${e.message}`);
    }
    // Respiro entre llamadas para no golpear rate limits.
    if (!REPROCESS && (names.length > 1 || VARIANTS > 1)) {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
}
console.log("Listo.");
