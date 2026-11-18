import { mkdir, writeFile } from "node:fs/promises";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  // Bun loads .env automatically; with Node use: node --env-file=.env
  console.error("OPENROUTER_API_KEY is not set");
  process.exit(1);
}

const response = await fetch("https://openrouter.ai/api/v1/images", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen/qwen-image-2.1-turbo",
    prompt: "Jarvis from Ironman in a blizzard."
  }),
});

const result = await response.json();
await mkdir("./output", { recursive: true });
for (const [i, image] of (result.data ?? []).entries()) {
  const path = `./output/image-${i}.png`;
  const bytes = Buffer.from(image.b64_json, "base64");
  await writeFile(path, bytes);
  console.log(`Wrote ${path} (${bytes.length} bytes)`);
}
