// usage: node scripts/render-chunk.mjs <out.mp4> <from> <to> [concurrency]
import fs from "node:fs";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, a, b, conc = "2"] = process.argv.slice(2);
const browserExecutable = process.env.CHROME || "/usr/bin/google-chrome";
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const inputProps = process.env.INPUT ? JSON.parse(process.env.INPUT) : {};
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "BarbersShort", browserExecutable, chromiumOptions, inputProps });
const t0 = Date.now(); let last = 0;
await renderMedia({ composition, serveUrl, inputProps, codec: "h264", crf: 14, outputLocation: out, frameRange: [Number(a), Number(b)], concurrency: Number(conc),
  browserExecutable, chromiumOptions, timeoutInMilliseconds: 240000, muted: true,
  onProgress: ({ renderedFrames }) => { if (renderedFrames - last >= 5) { last = renderedFrames; console.log(`frames ${renderedFrames} ${((Date.now() - t0) / 1000).toFixed(0)}s`); } } });
console.log("DONE", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
