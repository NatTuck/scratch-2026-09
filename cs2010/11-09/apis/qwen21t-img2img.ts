import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const DEFAULT_PROMPT =
  "Apply warm, painterly sunset light to the reference image, keeping its composition and subject unchanged.";

const [refPath, prompt = DEFAULT_PROMPT] = process.argv.slice(2);
if (!refPath) {
  console.error("Usage: bun qwen21t-img2img.ts <reference-image> [prompt]");
  process.exit(1);
}

const mime = MIME_BY_EXT[extname(refPath).toLowerCase()];
if (!mime) {
  console.error(
    `Unsupported reference image type: ${refPath}. Use one of: ${Object.keys(MIME_BY_EXT).join(", ")}`,
  );
  process.exit(1);
}

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  // Bun loads .env automatically; with Node use: node --env-file=.env
  console.error("OPENROUTER_API_KEY is not set");
  process.exit(1);
}

const refBytes = await readFile(refPath);
const refUrl = `data:${mime};base64,${refBytes.toString("base64")}`;

const response = await fetch("https://openrouter.ai/api/v1/images", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen/qwen-image-2.1-turbo",
    prompt,
    input_references: [{ type: "image_url", image_url: { url: refUrl } }],
  }),
});

if (!response.ok) {
  const body = await response.json().catch(() => ({}));
  console.error(`HTTP ${response.status}: ${body?.error?.message ?? "request failed"}`);
  process.exit(1);
}

const result = await response.json();
await mkdir("./output", { recursive: true });
for (const [i, image] of (result.data ?? []).entries()) {
  const ext = image.media_type?.split("/")[1] ?? "png";
  const path = `./output/image-${i}.${ext}`;
  const bytes = Buffer.from(image.b64_json, "base64");
  await writeFile(path, bytes);
  console.log(`Wrote ${path} (${bytes.length} bytes)`);
}
