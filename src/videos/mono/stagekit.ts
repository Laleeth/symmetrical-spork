// Staging kit: lit 2D character cards, contact shadows, blinks and effect cards. Each set's stage() uses makeStage().
import * as THREE from "three";
import { Pen, bodyFront, Outfit, FrontOpts, Expr, fxStars, fxContact, fxShadow, mix, INK } from "./toon";
import { Place, FxPlace } from "./cast";
import { V3, clamp01 } from "./core";
export type { Outfit, FrontOpts, Expr };
export { Pen, fxStars, INK, mix };
export const tier = (d: number): [number, number, number] => d < 2.2 ? [1800, 3000, 3.0] : d < 5 ? [1080, 1800, 1.8] : d < 12 ? [600, 1000, 1.0] : [300, 500, 0.5];
export const q = (v: number) => Math.round(v * 60) / 60;
export const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));
export const LID = [0.5, 1, 1, 0.5];
export const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const lidAt = (f: number, i: number, swaps: number[] = []) => {
  for (const fs of swaps) { const k = f - fs + 2; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-40 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) { const k = f - s; if (k >= 0 && k < 4) return LID[k]; s += Math.round(18 + 45 * hh(i * 31 + n, 13)); }
  return 0;
};

export type Stage = { places: Place[]; fx: FxPlace[] };
export type Cam2 = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3 };
export const light2D = (cam: Cam2, mirror: boolean) => {
  const sx = cam.sun.dot(cam.right) * (mirror ? -1 : 1), sy = -cam.sun.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
export const tmp = new THREE.Vector3();
export const person = (st: Stage, cam: Cam2, o: Outfit, okey: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y = at[1]) => {
  const d = cam.pos.distanceTo(tmp.set(at[0], y + 1.3, at[2]));
  const [w, h, k] = tier(d);
  const f2: FrontOpts = { mode: "stand", ...opts, light: light2D(cam, mirror), seed };
  st.places.push({ key: `F|${okey}|${fkey(f2)}`, draw: (p) => bodyFront(p, o, f2), x: at[0], y, z: at[2], mirror, size: [w, h, k] });
  if (opts.mode !== "sit") contact(st, at[0], at[1], at[2], cam);
};
export const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
export const hexOf = (c: [number, number, number]) => "#" + c.map((v) => Math.round(255 * toSrgb(v)).toString(16).padStart(2, "0")).join("");
export const contact = (st: Stage, x: number, y: number, z: number, cam: Cam2) => {
  const s = cam.sun, hl = Math.hypot(s.x, s.z) || 1, ox = -s.x / hl, oz = -s.z / hl, rot = Math.atan2(-ox, -oz);
  const el = Math.asin(Math.min(0.99, Math.max(0.1, s.y))), len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))), hgt = len + 0.55, c = 0.3 * hgt;
  const tc = hexOf([0.42, 0.44, 0.62]), cc = hexOf([0.2, 0.21, 0.33]);
  st.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72, h: hgt, flat: true, rot });
  st.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y: y + 0.022, z, w: 0.52, h: 0.4, flat: true, rot });
};
// effect cards
export const fxQ = (p: Pen) => { const g = p.g; g.font = "900 220px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 22; g.strokeStyle = INK; g.strokeText("?", 128, 140); g.fillStyle = "#ffffff"; g.fillText("?", 128, 140); };
export const fxFly = (p: Pen, up: boolean) => { p.ell(70, up ? 40 : 52, 26, up ? 30 : 14, "#eaf6ff", 4, 0, 360, -25); p.ell(110, up ? 40 : 52, 26, up ? 30 : 14, "#eaf6ff", 4, 0, 360, 25); p.ell(90, 80, 26, 22, INK, 0); };
export const fxSnip = (p: Pen, k: number) => { for (let i = 0; i < 5; i++) { const a = (k * 7 + i * 1.3) % 6.28; p.stroke([[64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30], [64 + Math.cos(a) * 30 + Math.cos(a + 1.2) * 22, 64 + Math.sin(a) * 30 + Math.sin(a + 1.2) * 22]], 7, "#1f1a24"); } };
export const fxSparkle = (p: Pen, t: number) => fxStars(p, t);
export type StageAPI = {
  f: number; cam: Cam2;
  /** place a character card: outfit, cache key, seed (blinks), feet position, options, mirror, y override */
  P: (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror?: boolean, y?: number) => void;
  /** camera-facing (or flat) effect card drawn with the Pen API on a cw x ch canvas, w x h metres */
  card: (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: V3, w: number, h: number, soft?: boolean, rot?: number) => void;
  after: (fr: number) => boolean;
  st: Stage;
};
export const makeStage = (f: number, cam: Cam2): StageAPI => {
  const st: Stage = { places: [], fx: [] };
  const P = (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y?: number) =>
    person(st, cam, o, key, seed, at, { blink: lidAt(f, seed), ...opts }, mirror, y);
  const card = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: V3, w: number, h: number, soft = false, rot = 0) =>
    { st.fx.push({ key, cw, ch, draw, x: at[0], y: at[1], z: at[2], w, h, soft, rot }); };
  return { f, cam, P, card, after: (fr: number) => f >= fr - 2, st };
};
