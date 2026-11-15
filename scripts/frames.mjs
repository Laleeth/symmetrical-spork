// usage: COMP=PuddingShort node scripts/frames.mjs  -> prints durationInFrames
import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";
import path from "node:path";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const c = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable: process.env.CHROME || "/usr/bin/google-chrome", chromiumOptions: { gl: "swangle" } });
console.log("FRAMES=" + c.durationInFrames);
