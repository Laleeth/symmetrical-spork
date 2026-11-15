// The two barbers' street as one three.js scene: sky, dusty road, pavement, two salons with open fronts (mirror, chair,
// shelf inside), neighbouring flat-roofed houses with chhajjas and balconies, a neem tree, an electric pole, a temple
// tower on the skyline, and the cast as lit 2D cards. update(id, f, camera) poses everything (pure function of id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad } from "./build";
import { ctex, rep, rng, stoneHD, cloudHD } from "./paint";
import { Pen, bodyFront, Outfit, FrontOpts, Expr, fxStars, fxContact, fxShadow, mix, INK } from "./toon";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, Place, FxPlace } from "./cast";
import { FPS, SHOTS, ShotDef, camAt, V3, SHOP_A, SHOP_B, FRONT, KERB, CHAIR, SPOT, SWAP, clamp01 } from "./story";

const U = (r: () => number, a: number, b: number) => a + (b - a) * r();
// ---------------- painted textures ----------------
const blot = (g: CanvasRenderingContext2D, x: number, y: number, rad: number, rgb: string, a: number) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
};
const roadTex = () => ctex("road", 1024, 1024, (g, r) => {
  g.fillStyle = "#d2b48a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 140), r() > 0.5 ? "255,240,215" : "150,110,70", U(r, 0.08, 0.16));
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "110,80,50" : "250,235,210"},${U(r, 0.15, 0.4)})`; g.fillRect(U(r, 0, 1024), U(r, 0, 1024), U(r, 2, 5), U(r, 2, 4)); }
  for (const y of [300, 360, 690, 750]) { g.strokeStyle = "rgba(120,85,55,0.16)"; g.lineWidth = 26; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + y) * 8); g.stroke(); }
});
const paveTex = () => stoneHD("paveHD", ["#c9bba4", "#bfb099", "#d3c6b0", "#b8aa93"], "#958670");
/** plaster facade with an Indian upper floor: shuttered windows with iron grills, stains, a painted dado line */
const facadeTex = (key: string, wm: number, hm: number, wall: string, shutter: string, shopFront: boolean) => {
  const PX = Math.min(80, 2048 / Math.max(wm, hm)), W = Math.round(wm * PX), H = Math.round(hm * PX), m = (v: number) => v * PX;
  return ctex("fac" + key, W, H, (g, r) => {
    g.fillStyle = wall; g.fillRect(0, 0, W, H);
    for (let i = 0; i < Math.round(wm * hm / 2.5) + 8; i++) blot(g, U(r, 0, W), U(r, 0, H), m(U(r, 0.4, 1.6)), r() > 0.45 ? "255,255,255" : "120,90,60", r() > 0.45 ? 0.08 : 0.07);
    for (let i = 0; i < Math.round(wm); i++) { // rain streaks under the roof line
      const x = U(r, 0, W), l = m(U(r, 0.6, 2.2)); const gr = g.createLinearGradient(0, 0, 0, l);
      gr.addColorStop(0, "rgba(90,70,60,0.22)"); gr.addColorStop(1, "rgba(90,70,60,0)"); g.fillStyle = gr; g.fillRect(x, 0, m(U(r, 0.1, 0.3)), l);
    }
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(0, m(0.35), W, m(0.12)); // parapet band
    // upper-floor windows (sill at 4.0 m above ground = hm - 4.0 - 1.3 from top)
    const n = Math.max(1, Math.floor(wm / 2.0)), top = H - m(5.4);
    for (let i = 0; i < n; i++) {
      const cx = ((i + 0.5) / n) * W, ww = m(1.0), wh = m(1.3);
      g.fillStyle = "#3c3346"; g.fillRect(cx - ww / 2, top, ww, wh);
      g.fillStyle = shutter; g.fillRect(cx - ww / 2 - m(0.32), top, m(0.3), wh); g.fillRect(cx + ww / 2 + m(0.02), top, m(0.3), wh);
      g.fillStyle = "rgba(0,0,0,0.18)"; for (let k = 1; k < 6; k++) { g.fillRect(cx - ww / 2 - m(0.32), top + (k * wh) / 6, m(0.3), 2); g.fillRect(cx + ww / 2 + m(0.02), top + (k * wh) / 6, m(0.3), 2); }
      g.strokeStyle = "#2a2430"; g.lineWidth = Math.max(2, m(0.03)); // grill
      for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(cx - ww / 2 + (k * ww) / 5, top); g.lineTo(cx - ww / 2 + (k * ww) / 5, top + wh); g.stroke(); }
      g.beginPath(); g.moveTo(cx - ww / 2, top + wh / 2); g.lineTo(cx + ww / 2, top + wh / 2); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(cx - ww / 2, top, ww * 0.35, wh);
    }
    if (!shopFront) { // ground floor: a door and a small window
      const dx = W * 0.3; g.fillStyle = "#5b3a2a"; g.fillRect(dx - m(0.5), H - m(2.3), m(1.0), m(2.3));
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(dx - m(0.42), H - m(2.2), m(0.36), m(2.1));
      g.fillStyle = "#3c3346"; g.fillRect(W * 0.68 - m(0.5), H - m(2.1), m(1.0), m(1.0));
      g.fillStyle = shutter; g.fillRect(W * 0.68 - m(0.82), H - m(2.1), m(0.3), m(1.0)); g.fillRect(W * 0.68 + m(0.52), H - m(2.1), m(0.3), m(1.0));
    }
    g.fillStyle = "rgba(80,60,50,0.28)"; g.fillRect(0, H - m(0.6), W, m(0.6)); // dado / splash
  });
};
const signTex = (key: string, l1: string, l2: string, bg: string, fg: string) => ctex("sign" + key, 1400, 300, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1400, 300);
  g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(18, 18, 1364, 264);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 118px Arial Black, Arial, sans-serif"; g.fillText(l1, 700, 128, 1040);
  g.font = "700 64px Arial, sans-serif"; g.fillText(l2, 700, 232, 900);
  // scissors icons
  for (const x of [120, 1280]) { g.strokeStyle = fg; g.lineWidth = 10; g.beginPath(); g.arc(x - 22, 200, 22, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 22, 200, 22, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - 10, 180); g.lineTo(x + 40, 70); g.moveTo(x + 10, 180); g.lineTo(x - 40, 70); g.stroke(); }
});
const poleTex = () => ctex("barberPole", 256, 512, (g) => {
  g.fillStyle = "#f6f3ec"; g.fillRect(0, 0, 256, 512);
  for (let k = -4; k < 12; k++) for (const [c, o] of [["#d8433a", 0], ["#2f6fd6", 64]] as const) {
    g.fillStyle = c; g.beginPath(); const y = k * 128 + o; g.moveTo(0, y); g.lineTo(256, y - 128); g.lineTo(256, y - 128 + 40); g.lineTo(0, y + 40); g.closePath(); g.fill();
  }
});
const mirrorTex = () => ctex("mirror", 512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 512, 512); gr.addColorStop(0, "#d7eef6"); gr.addColorStop(1, "#9cc6d8"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(80, 0); g.lineTo(200, 0); g.lineTo(40, 512); g.lineTo(0, 512); g.lineTo(0, 260); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(250, 0); g.lineTo(290, 0); g.lineTo(130, 512); g.lineTo(90, 512); g.closePath(); g.fill();
});
const posterTex = (k: number) => ctex("poster" + k, 300, 420, (g) => {
  g.fillStyle = ["#f2d36b", "#e88aa6", "#8fd0c8"][k % 3]; g.fillRect(0, 0, 300, 420);
  const p = new Pen(g);
  for (const [x, y, s] of [[150, 170, 1]] as const) { p.ell(x, y, 80 * s, 92 * s, "#f0c49a", 8); p.ell(x, y - 55, 86, 50, "#1f1a24", 8, 180, 360); p.dot(x - 28, y, 7); p.dot(x + 28, y, 7); p.arc(x, y + 30, 26, 12, 20, 160, 6); }
  g.fillStyle = "#1f1a24"; g.font = "900 46px Arial Black, Arial"; g.textAlign = "center"; g.fillText(["STYLE", "NEW CUT", "SHAVE"][k % 3], 150, 330);
  g.font = "700 30px Arial"; g.fillText("₹ 40", 150, 380);
});
const calendarTex = () => ctex("calendar", 300, 400, (g) => {
  g.fillStyle = "#fff8ec"; g.fillRect(0, 0, 300, 400); g.fillStyle = "#d8433a"; g.fillRect(0, 0, 300, 140);
  g.fillStyle = "#f2b23e"; g.beginPath(); g.arc(150, 70, 46, 0, 7); g.fill();
  g.fillStyle = "#333"; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) g.fillRect(25 + c * 44, 170 + r * 44, 26, 18);
});

// ---------------- cast ----------------
const SK1 = "#efc298", SK2 = "#e0ab83", SK3 = "#d79f76";
export const NANDU: Outfit = { jacket: "#e8892f", pants: "#f1ead8", boots: "#6b3f26", hat: "hair", hair: "#1f1a24", hairStyle: "neat", moustache: "#1f1a24", skin: SK1, kurta: true, buttons: "#f4e6c0" };
export const MURALI: Outfit = { jacket: "#2f8c8c", pants: "#f1ead8", boots: "#6b3f26", hat: "hair", hair: "#1f1a24", hairStyle: "messy", moustache: "#1f1a24", skin: SK2, kurta: true, buttons: "#f4e6c0" };
const CUST: Outfit = { jacket: "#c75a7a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#3a2a22", skin: SK3, kurta: true };
const WALKER: Outfit = { jacket: "#e8b23a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#241a1a", skin: SK2, dress: "#c2365a" };
const SEED = { nandu: 3, murali: 5, cust: 2, walker: 6 };

const tier = (d: number): [number, number, number] => d < 2.2 ? [1800, 3000, 3.0] : d < 5 ? [1080, 1800, 1.8] : d < 12 ? [600, 1000, 1.0] : [300, 500, 0.5];
const q = (v: number) => Math.round(v * 60) / 60;
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));
const LID = [0.5, 1, 1, 0.5];
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const lidAt = (f: number, i: number, swaps: number[] = []) => {
  for (const fs of swaps) { const k = f - fs + 2; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-40 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) { const k = f - s; if (k >= 0 && k < 4) return LID[k]; s += Math.round(18 + 45 * hh(i * 31 + n, 13)); }
  return 0;
};

type Stage = { places: Place[]; fx: FxPlace[] };
type Cam2 = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3 };
const light2D = (cam: Cam2, mirror: boolean) => {
  const sx = cam.sun.dot(cam.right) * (mirror ? -1 : 1), sy = -cam.sun.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
const tmp = new THREE.Vector3();
const person = (st: Stage, cam: Cam2, o: Outfit, okey: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y = at[1]) => {
  const d = cam.pos.distanceTo(tmp.set(at[0], y + 1.3, at[2]));
  const [w, h, k] = tier(d);
  const f2: FrontOpts = { mode: "stand", ...opts, light: light2D(cam, mirror), seed };
  st.places.push({ key: `F|${okey}|${fkey(f2)}`, draw: (p) => bodyFront(p, o, f2), x: at[0], y, z: at[2], mirror, size: [w, h, k] });
  if (opts.mode !== "sit") contact(st, at[0], at[1], at[2], cam);
};
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number]) => "#" + c.map((v) => Math.round(255 * toSrgb(v)).toString(16).padStart(2, "0")).join("");
const contact = (st: Stage, x: number, y: number, z: number, cam: Cam2) => {
  const s = cam.sun, hl = Math.hypot(s.x, s.z) || 1, ox = -s.x / hl, oz = -s.z / hl, rot = Math.atan2(-ox, -oz);
  const el = Math.asin(Math.min(0.99, Math.max(0.1, s.y))), len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))), hgt = len + 0.55, c = 0.3 * hgt;
  const tc = hexOf([0.42, 0.44, 0.62]), cc = hexOf([0.2, 0.21, 0.33]);
  st.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72, h: hgt, flat: true, rot });
  st.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y: y + 0.022, z, w: 0.52, h: 0.4, flat: true, rot });
};
// effect cards
const fxQ = (p: Pen) => { const g = p.g; g.font = "900 220px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 22; g.strokeStyle = INK; g.strokeText("?", 128, 140); g.fillStyle = "#ffffff"; g.fillText("?", 128, 140); };
const fxFly = (p: Pen, up: boolean) => { p.ell(70, up ? 40 : 52, 26, up ? 30 : 14, "#eaf6ff", 4, 0, 360, -25); p.ell(110, up ? 40 : 52, 26, up ? 30 : 14, "#eaf6ff", 4, 0, 360, 25); p.ell(90, 80, 26, 22, INK, 0); };
const fxSnip = (p: Pen, k: number) => { for (let i = 0; i < 5; i++) { const a = (k * 7 + i * 1.3) % 6.28; p.stroke([[64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30], [64 + Math.cos(a) * 30 + Math.cos(a + 1.2) * 22, 64 + Math.sin(a) * 30 + Math.sin(a + 1.2) * 22]], 7, "#1f1a24"); } };
const fxSparkle = (p: Pen, t: number) => fxStars(p, t);

const stage = (id: number, f: number, cam: Cam2): Stage => {
  const st: Stage = { places: [], fx: [] };
  const P = (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y?: number) =>
    person(st, cam, o, key, seed, at, { blink: lidAt(f, seed), ...opts }, mirror, y);
  const card = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: V3, w: number, h: number, soft = false, rot = 0) =>
    st.fx.push({ key, cw, ch, draw, x: at[0], y: at[1], z: at[2], w, h, soft, rot });
  const after = (fr: number) => f >= fr - 2;
  if (id === 1) {
    const wave = after(45) ? Math.sin(f * 0.5) * 0.5 + 0.5 : undefined;
    P(NANDU, "N", SEED.nandu, SPOT.nandu1, { expr: after(45) ? "grin" : "smile", facing: 1, wave: wave !== undefined ? 1 - wave : undefined });
    P(MURALI, "M", SEED.murali, SPOT.murali1, { expr: after(45) ? "grin" : "neutral", facing: -1, wave }, true);
    const u = f / 60;
    P(WALKER, "W", SEED.walker, [-4.5 + 3.5 * u, 0, 0.8], { mode: "stroll", phase: (f / 30) % 1, expr: "smile", facing: 1 });
  } else if (id === 2) {
    const k = clamp01((f - 66) / 14) - clamp01((f - 92) / 8);
    P(NANDU, "N", SEED.nandu, SPOT.nandu, { expr: after(77) ? "smile_closed" : "smile", facing: 0, prop: ["comb", k], look: 0.3 });
    if (after(77)) for (let i = 0; i < 3; i++) {
      const t = ((f - 77) / 14 + i * 0.33) % 1, h = SPOT.nandu;
      card(`stars|${Math.round(t * 8)}`, 256, 256, (p) => fxSparkle(p, Math.round(t * 8) / 8), [h[0] - 0.35 + i * 0.32, h[1] + 1.95 + (i % 2) * 0.12, h[2] + 0.05], 0.22, 0.22);
    }
  } else if (id === 3) {
    P(MURALI, "M", SEED.murali, SPOT.murali, { expr: "nervous", facing: -1, look: -0.5, tilt: -4 }, true);
  } else if (id === 4) {
    P(MURALI, "M", SEED.murali, SPOT.murali, { expr: after(143) ? "shock" : "smile", facing: 0, blink: lidAt(f, SEED.murali, [143]) }, true);
    for (let i = 0; i < 3; i++) {
      const a = f * (0.25 + i * 0.06) + i * 2.1, h = SPOT.murali;
      card(`fly|${f % 2}`, 180, 120, (p) => fxFly(p, f % 2 === 0), [h[0] + Math.cos(a) * 0.38, h[1] + 1.95 + Math.sin(a * 1.4) * 0.1, h[2] + Math.sin(a) * 0.2], 0.12, 0.08);
    }
  } else if (id === 5) {
    P(NANDU, "N", SEED.nandu, SPOT.nandu5, { expr: "smile", facing: 1, look: 0.4 });
    P(MURALI, "M", SEED.murali, SPOT.murali5, { expr: "nervous", facing: -1, look: -0.4 }, true);
    P(CUST, "C", SEED.cust, SPOT.cust5, { expr: after(186) ? "nervous" : "neutral", facing: 0, look: Math.sin(f * 0.12) });
    if (after(186)) card("q", 256, 256, fxQ, [SPOT.cust5[0] + 0.3, 2.05 + 0.03 * Math.sin(f * 0.3), SPOT.cust5[2]], 0.32, 0.32, false, 0.15);
  } else if (id === 6) {
    P(MURALI, "M", SEED.murali, SPOT.murali, { expr: after(225) ? "relief_open" : "nervous", facing: -1, wave: after(225) ? 0.8 : undefined, blink: lidAt(f, SEED.murali, [225]) }, true);
    if (after(225)) for (let i = 0; i < 3; i++) {
      const t = ((f - 225) / 12 + i * 0.33) % 1, h = SPOT.murali;
      card(`stars|${Math.round(t * 8)}`, 256, 256, (p) => fxSparkle(p, Math.round(t * 8) / 8), [h[0] - 0.4 + i * 0.35, h[1] + 2.0 + (i % 2) * 0.12, h[2] + 0.05], 0.22, 0.22);
    }
  } else if (id === 7) {
    P(CUST, "C", SEED.cust, SPOT.cust5, { expr: after(259) ? "dazed" : "nervous", facing: 0, headTilt: 6 * Math.sin(f * 0.15) });
    for (let i = 0; i < 2; i++) card("q", 256, 256, fxQ, [SPOT.cust5[0] - 0.3 + i * 0.6, 2.0 + 0.04 * Math.sin(f * 0.3 + i), SPOT.cust5[2]], 0.26, 0.26, false, i ? 0.25 : -0.25);
  } else if (id === 8) {
    const swapped = f >= SWAP, sitter = swapped ? MURALI : NANDU, cutter = swapped ? NANDU : MURALI;
    const cut = (f - 285) / 30;
    P({ ...sitter, cape: true }, swapped ? "Mc" : "Nc", swapped ? SEED.murali : SEED.nandu, [CHAIR[0], CHAIR[1], CHAIR[2]],
      { mode: "sit", expr: swapped ? "shock" : "smile_closed", facing: 0 }, false, CHAIR[1] + 0.42);
    P(cutter, swapped ? "N" : "M", swapped ? SEED.nandu : SEED.murali, [CHAIR[0] + 0.62, CHAIR[1], CHAIR[2] - 0.45],
      { expr: swapped ? "whistle" : "stern", facing: -1, prop: ["scissors", cut], tilt: swapped ? 6 * Math.sin(f * 0.6) : -3 }, true);
    const n = swapped ? 7 : 3;
    for (let i = 0; i < n; i++) {
      const ph = ((f - (swapped ? SWAP : 285)) / (swapped ? 14 : 22) + i / n) % 1;
      card(`snip|${i % 3}`, 128, 128, (p) => fxSnip(p, i % 3), [CHAIR[0] - 0.3 + (i / n) * 0.6 + (swapped ? Math.sin(f * 0.4 + i) * 0.2 : 0), CHAIR[1] + 1.75 - ph * 1.1, CHAIR[2] + 0.15], 0.14, 0.14);
    }
  } else if (id === 9) {
    const k = clamp01((f - 358) / 10);
    P(NANDU, "N", SEED.nandu, SPOT.nandu9, { expr: f >= 399 ? "smile_closed" : "smile", facing: 1, look: 0.5 });
    P(MURALI, "M", SEED.murali, SPOT.murali9, { expr: "grin", facing: 1, prop: ["point", k], look: 1 }, true);
    if (f >= 399) for (let i = 0; i < 4; i++) {
      const t = ((f - 399) / 12 + i * 0.25) % 1, h = SPOT.nandu9;
      card(`stars|${Math.round(t * 8)}`, 256, 256, (p) => fxSparkle(p, Math.round(t * 8) / 8), [h[0] - 0.42 + i * 0.28, h[1] + 1.95 + (i % 2) * 0.14, h[2] + 0.08], 0.2, 0.2);
    }
  }
  return st;
};

// ---------------- world ----------------
const box = (b: Batch, m: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tile = 0) => b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile, true), m);

export class BarberWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = [];

  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6); this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud));
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 34, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    const b = new Batch(), bi = new Batch();
    // ---- ground: dusty road, raised pavement on both sides ----
    const road = lam("road", () => ({ map: rep(roadTex(), 1, 1) }));
    b.add(quad(V(-200, 0, 200), V(200, 0, 200), V(200, 0, -200), V(-200, 0, -200), 400 / 9, 400 / 9), road);
    const pave = lam("pave", () => ({ map: paveTex() }));
    box(b, pave, -60, 60, 0, KERB, FRONT, FRONT + 2.2, 2.5);
    box(b, pave, -60, 60, 0, KERB, 8.2, 10.5, 2.5);
    box(b, lam("kerbStone", () => ({ color: "#a8998a" })), -60, 60, 0, KERB + 0.01, FRONT + 2.2, FRONT + 2.4);
    // ---- north row: the two salons, a lane between, houses beyond ----
    const shop = (cx: number, wall: string, shutter: string, inner: string, sign: [string, string, string, string], awning: string) => {
      const w = 5.4, h = 7.2, d = 7.5, x0 = cx - w / 2, x1 = cx + w / 2, z0 = FRONT - d, z1 = FRONT, ow = 3.7, oh = 2.9, oz = z1 - 5.0;
      const fac = lam("facShop" + cx, () => ({ map: facadeTex("shop" + cx, w, h, wall, shutter, true) }));
      const plain = lam("wall" + wall, () => ({ color: wall }));
      // front wall around the opening
      b.add(quad(V(x0, oh, z1), V(x1, oh, z1), V(x1, h, z1), V(x0, h, z1), 1, 1, 0, oh / h), fac);
      b.add(quad(V(x0, 0, z1), V(cx - ow / 2, 0, z1), V(cx - ow / 2, oh, z1), V(x0, oh, z1), (w - ow) / 2 / w, oh / h, 0, 0), fac);
      b.add(quad(V(cx + ow / 2, 0, z1), V(x1, 0, z1), V(x1, oh, z1), V(cx + ow / 2, oh, z1), 1, oh / h, (w + ow) / 2 / w, 0), fac);
      for (const [a, c] of [[x0, z0], [x1, z1]] as const) void a, void c;
      b.add(quad(V(x0, 0, z0), V(x0, 0, z1), V(x0, h, z1), V(x0, h, z0)), plain);
      b.add(quad(V(x1, 0, z1), V(x1, 0, z0), V(x1, h, z0), V(x1, h, z1)), plain);
      b.add(quad(V(x1, 0, z0), V(x0, 0, z0), V(x0, h, z0), V(x1, h, z0)), plain);
      b.add(quad(V(x0, h, z1), V(x1, h, z1), V(x1, h, z0), V(x0, h, z0)), lam("roofTop", () => ({ color: "#b9ab98" })));
      // parapet + chhajja (thin concrete sunshade over the upper windows) + pillars either side of the opening
      const conc = lam("concrete", () => ({ color: "#e9e1d2" }));
      box(b, conc, x0 - 0.05, x1 + 0.05, h, h + 0.9, z1 - 0.18, z1 + 0.05);
      box(b, conc, x0 - 0.15, x1 + 0.15, 5.15, 5.27, z1, z1 + 0.65);
      box(b, conc, x0 - 0.12, x1 + 0.12, oh, oh + 0.16, z1, z1 + 0.18);
      for (const px of [cx - ow / 2 - 0.25, cx + ow / 2 + 0.25]) box(b, conc, px - 0.25, px + 0.25, 0, oh, z1 - 0.05, z1 + 0.14);
      // awning (sloped, striped) over the opening
      const awn = lam("awning" + awning, () => ({ map: ctex("awn" + awning, 512, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f6f1e6" : awning; g.fillRect(i * 64, 0, 64, 128); } }) }));
      b.add(quad(V(cx - ow / 2 - 0.4, 2.55, z1 + 1.25), V(cx + ow / 2 + 0.4, 2.55, z1 + 1.25), V(cx + ow / 2 + 0.4, 3.05, z1 + 0.02), V(cx - ow / 2 - 0.4, 3.05, z1 + 0.02)), awn);
      b.add(quad(V(cx + ow / 2 + 0.4, 2.55, z1 + 1.25), V(cx - ow / 2 - 0.4, 2.55, z1 + 1.25), V(cx - ow / 2 - 0.4, 3.05, z1 + 0.02), V(cx + ow / 2 + 0.4, 3.05, z1 + 0.02)), awn);
      // interior: floor tiles, painted walls, ceiling, mirror, shelf, posters (own batch: no roof shadow)
      { const b = bi;
      const inw = lam("inner" + inner, () => ({ color: inner }));
      const tile = lam("floorTile", () => ({ map: rep(ctex("tiles", 256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#e9e2d4" : "#3d4a5c"; g.fillRect(i * 64, j * 64, 64, 64); } }), 1, 1) }));
      b.add(quad(V(cx - ow / 2, 0.02, z1), V(cx + ow / 2, 0.02, z1), V(cx + ow / 2, 0.02, oz), V(cx - ow / 2, 0.02, oz), ow / 1.0, 5 / 1.0), tile);
      b.add(quad(V(cx - ow / 2, 0, oz), V(cx - ow / 2, 0, z1), V(cx - ow / 2, oh, z1), V(cx - ow / 2, oh, oz)), inw);
      b.add(quad(V(cx + ow / 2, 0, z1), V(cx + ow / 2, 0, oz), V(cx + ow / 2, oh, oz), V(cx + ow / 2, oh, z1)), inw);
      b.add(quad(V(cx + ow / 2, 0, oz), V(cx - ow / 2, 0, oz), V(cx - ow / 2, oh, oz), V(cx + ow / 2, oh, oz)).translate(0, 0, 0.0001), inw);
      b.add(quad(V(cx - ow / 2, oh, oz), V(cx + ow / 2, oh, oz), V(cx + ow / 2, oh, z1), V(cx - ow / 2, oh, z1)).rotateX(0), lam("ceil", () => ({ color: "#f3efe6" })));
      const frame = lam("mframe", () => ({ color: "#c98f3b" }));
      box(b, frame, cx - 1.05, cx + 1.05, 0.95, 2.35, oz + 0.01, oz + 0.07);
      const mir = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.3), new THREE.MeshBasicMaterial({ map: mirrorTex(), color: 0xdddddd }));
      mir.position.set(cx, 1.65, oz + 0.08); this.root.add(mir);
      box(b, lam("shelf", () => ({ color: "#8a5a3c" })), cx - 1.3, cx + 1.3, 0.85, 0.92, oz, oz + 0.45);
      const bottles = ["#2f8c8c", "#d8433a", "#e8b23a", "#5b6fd6", "#f3efe6"];
      for (let i = 0; i < 9; i++) {
        const bx = cx - 1.15 + i * 0.28, bh = 0.16 + 0.1 * ((i * 7) % 3) / 2;
        b.add(new THREE.CylinderGeometry(0.045, 0.05, bh, 10).translate(bx, 0.92 + bh / 2, oz + 0.25), lam("bot" + bottles[i % 5], () => ({ color: bottles[i % 5] })));
      }
      for (const [k, px] of [[0, cx - 1.55], [1, cx + 1.55]] as const) {
        const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.58), new THREE.MeshBasicMaterial({ map: posterTex(k + (cx > 0 ? 1 : 0)), color: 0xe0e0e0 }));
        pm.position.set(px, 1.75, oz + 0.02); this.root.add(pm);
      }
      const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.53), new THREE.MeshBasicMaterial({ map: calendarTex(), color: 0xe0e0e0 }));
      cal.position.set(cx - ow / 2 + 0.02, 1.7, oz + 1.6); cal.rotation.y = Math.PI / 2; this.root.add(cal);
      }
      // signboard (unlit face so the lettering stays readable), backing box for the ink
      box(b, lam("signBack", () => ({ color: "#3b2f2a" })), x0 + 0.2, x1 - 0.2, 3.35, 4.65, z1 + 0.05, z1 + 0.12);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.5, 1.2), new THREE.MeshBasicMaterial({ map: signTex(sign[0], sign[1], sign[2], sign[3], "#ffffff"), color: 0xe8e8e8 }));
      sg.position.set(cx, 4.0, z1 + 0.13); sg.layers.set(NOINK); this.root.add(sg);
      // barber pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 20), new THREE.MeshBasicMaterial({ map: poleTex(), color: 0xe6e6e6 }));
      pole.position.set(cx - ow / 2 - 0.25, 1.5, z1 + 0.3); this.root.add(pole);
      box(b, lam("chrome", () => ({ color: "#c9ccd2" })), cx - ow / 2 - 0.37, cx - ow / 2 - 0.13, 1.92, 2.0, z1 + 0.18, z1 + 0.42);
      box(b, lam("chrome", () => ({ color: "#c9ccd2" })), cx - ow / 2 - 0.37, cx - ow / 2 - 0.13, 1.0, 1.08, z1 + 0.18, z1 + 0.42);
      box(b, lam("chrome", () => ({ color: "#c9ccd2" })), cx - ow / 2 - 0.3, cx - ow / 2 - 0.2, 1.08, 1.92, z1 + 0.05, z1 + 0.18);
    };
    shop(SHOP_A, "#f2c76b", "#2f8c8c", "#bfe3d9", ["A", "STYLE KING", "HAIR SALOON", "#c0392b"], "#c0392b");
    shop(SHOP_B, "#9fd0c4", "#c0392b", "#f3d9a8", ["B", "MURALI", "HAIR CUTTING", "#2c5aa0"], "#2c5aa0");
    // barber chair in Nandu's shop
    const red = lam("chairRed", () => ({ color: "#c8343a" })), chrome = lam("chrome", () => ({ color: "#c9ccd2" }));
    const [chx, , chz] = CHAIR;
    { const b = bi;
    b.add(new THREE.CylinderGeometry(0.06, 0.08, 0.45, 12).translate(chx, KERB * 0 + 0.25, chz), chrome);
    b.add(new THREE.CylinderGeometry(0.28, 0.32, 0.05, 20).translate(chx, 0.04, chz), chrome);
    box(b, red, chx - 0.32, chx + 0.32, 0.45, 0.6, chz - 0.32, chz + 0.25);
    box(b, red, chx - 0.32, chx + 0.32, 0.6, 1.35, chz - 0.36, chz - 0.22);
    for (const s of [-1, 1]) box(b, red, chx + s * 0.32 - 0.05, chx + s * 0.32 + 0.05, 0.6, 0.8, chz - 0.3, chz + 0.2);
    box(b, chrome, chx - 0.2, chx + 0.2, 0.15, 0.2, chz + 0.25, chz + 0.5);
    }
    // the lane between the shops (back wall) and the neighbouring houses
    const house = (x0: number, x1: number, h: number, wall: string, shutter: string, z1 = FRONT, d = 8) => {
      const w = x1 - x0, fac = lam("facH" + x0, () => ({ map: facadeTex("h" + x0, w, h, wall, shutter, false) })), plain = lam("wall" + wall, () => ({ color: wall }));
      b.add(quad(V(x0, 0, z1), V(x1, 0, z1), V(x1, h, z1), V(x0, h, z1)), fac);
      b.add(quad(V(x0, 0, z1 - d), V(x0, 0, z1), V(x0, h, z1), V(x0, h, z1 - d)), plain);
      b.add(quad(V(x1, 0, z1), V(x1, 0, z1 - d), V(x1, h, z1 - d), V(x1, h, z1)), plain);
      b.add(quad(V(x0, h, z1), V(x1, h, z1), V(x1, h, z1 - d), V(x0, h, z1 - d)), lam("roofTop", () => ({ color: "#b9ab98" })));
      const conc = lam("concrete", () => ({ color: "#e9e1d2" }));
      box(b, conc, x0 - 0.05, x1 + 0.05, h, h + 0.8, z1 - 0.18, z1 + 0.05);
      box(b, conc, x0 - 0.1, x1 + 0.1, 5.15, 5.27, z1, z1 + 0.6);
      box(b, conc, x0 - 0.1, x1 + 0.1, 2.5, 2.6, z1, z1 + 0.5);
      // water tank on the roof
      b.add(new THREE.CylinderGeometry(0.55, 0.55, 1.1, 18).translate(x0 + w * 0.7, h + 0.55, z1 - d * 0.5), lam("tank", () => ({ color: "#3b3f46" })));
    };
    house(-0.9, 0.9, 6.0, "#e7d9c3", "#6b8e4e", FRONT - 1.5, 6);
    house(-13.5, -6.3, 8.0, "#e8a68a", "#2c5aa0");
    house(-20, -13.5, 6.5, "#d9cfe8", "#7a3b2e");
    house(6.3, 12.5, 6.4, "#f0d58a", "#7a3b2e");
    house(12.5, 19, 8.6, "#bcd9a4", "#2c5aa0");
    house(19, 26, 6.0, "#f2b8a0", "#2f8c8c");
    // south row (seen in the hook and the reverse angles)
    for (const [x0, x1, h, wall] of [[-16, -8, 7, "#e2c6a2"], [-8, -1, 6.2, "#a9cfe0"], [-1, 7, 7.8, "#ecc58f"], [7, 15, 6.6, "#d6b8d8"]] as const) {
      const fac = lam("facS" + x0, () => ({ map: facadeTex("s" + x0, x1 - x0, h, wall, "#2f8c8c", false) }));
      b.add(quad(V(x1, 0, 10.5), V(x0, 0, 10.5), V(x0, h, 10.5), V(x1, h, 10.5)), fac);
    }
    // temple tower on the skyline (stepped gopuram) + far hills of roofs
    const stone = lam("gopuram", () => ({ map: stoneHD("gopuramHD", ["#d9b98c", "#cfae80", "#e2c49a", "#c6a576"], "#9c7f5c") }));
    const corn = lam("gopCorn", () => ({ color: "#ead2a8" })), gold = lam("kalasha", () => ({ color: "#e8b23a" }));
    { const gx = -14, gz = -110; let gw = 16, gd = 10, gy = 0;
      box(b, stone, gx - gw / 2 - 1, gx + gw / 2 + 1, 0, 6, gz - gd / 2 - 1, gz + gd / 2 + 1, 3); gy = 6;
      for (let i = 0; i < 11; i++) { const th = 2.6 - i * 0.08; box(b, stone, gx - gw / 2, gx + gw / 2, gy, gy + th, gz - gd / 2, gz + gd / 2, 3); box(b, corn, gx - gw / 2 - 0.3, gx + gw / 2 + 0.3, gy + th - 0.35, gy + th, gz - gd / 2 - 0.3, gz + gd / 2 + 0.3); gy += th; gw -= 1.0; gd -= 0.55; }
      b.add(new THREE.CylinderGeometry(gd / 2, gd / 2, gw, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(0).translate(gx, gy, gz), stone);
      for (let k = -2; k <= 2; k++) b.add(new THREE.SphereGeometry(0.45, 12, 10).scale(1, 1.5, 1).translate(gx + k * gw / 5.5, gy + gd / 2 + 0.6, gz), gold);
    }
    for (let i = 0; i < 14; i++) { const x = -60 + i * 9, h = 5 + ((i * 7) % 5) * 1.4; box(b, lam("farRoof" + (i % 3), () => ({ color: ["#d8c4a8", "#c9b39a", "#e0cfb4"][i % 3] })), x, x + 8, 0, h, -40 - (i % 3) * 6, -32 - (i % 3) * 6); }
    // neem tree on the pavement + electric pole with sagging wires
    const bark = lam("bark", () => ({ color: "#7a5a40" })), leaf = [lam("leafA", () => ({ color: "#5f9e45" })), lam("leafB", () => ({ color: "#4f8a3b" })), lam("leafC", () => ({ color: "#6fae4f" }))];
    const tree = (x: number, z: number, s: number) => {
      b.add(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 3.4 * s, 10).translate(x, 1.7 * s, z), bark);
      const rr = rng(Math.round(x * 13 + z));
      for (let i = 0; i < 14; i++) { const a = rr() * Math.PI * 2, d = rr() * 1.5 * s, r = (0.9 + rr() * 0.7) * s; b.add(new THREE.SphereGeometry(r, 16, 12).translate(x + Math.cos(a) * d, (3.6 + rr() * 1.6) * s, z + Math.sin(a) * d * 0.7), leaf[i % 3]); }
    };
    tree(-8.6, -2.8, 1.25); tree(10.5, 9.2, 1.1); tree(-14, 9.4, 1.0);
    const wood = lam("poleWood", () => ({ color: "#6f6a64" }));
    box(b, wood, -7.4 - 0.09, -7.4 + 0.09, 0, 8.5, -2.55, -2.37);
    box(b, wood, -8.1, -6.7, 7.9, 8.0, -2.5, -2.42);
    const wire = lam("wire", () => ({ color: "#1d1b22" }));
    for (const dz of [-0.6, 0.6]) for (let k = -40; k < 40; k++) {
      const xa = k * 0.6, xb = xa + 0.6, sag = (x: number) => 7.95 - 0.6 * (1 - ((((x % 18) + 18) % 18) / 9 - 1) ** 2);
      b.add(new THREE.CylinderGeometry(0.012, 0.012, 0.62, 4).rotateZ(Math.PI / 2 - Math.atan2(sag(xb) - sag(xa), 0.6)).translate((xa + xb) / 2, (sag(xa) + sag(xb)) / 2, -2.46 + dz * 0.0 + (dz > 0 ? 0.05 : -0.05)), wire);
    }
    // handcart with vegetables near Murali's shop, potted tulsi by Nandu's
    box(b, lam("cartWood", () => ({ color: "#a0683f" })), 7.4, 9.2, 0.75, 0.85, -2.6, -1.6);
    for (const [wx, wz] of [[7.7, -2.62], [8.9, -2.62], [7.7, -1.58], [8.9, -1.58]] as const) b.add(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 18).rotateX(Math.PI / 2).translate(wx, 0.32, wz), lam("wheel", () => ({ color: "#3b2f2a" })));
    for (let i = 0; i < 12; i++) b.add(new THREE.SphereGeometry(0.11, 10, 8).translate(7.6 + (i % 6) * 0.28, 0.95, -2.4 + Math.floor(i / 6) * 0.45), lam("veg" + (i % 3), () => ({ color: ["#d8433a", "#e8b23a", "#5f9e45"][i % 3] })));
    box(b, lam("planter", () => ({ color: "#b8684a" })), -6.6, -6.0, KERB, KERB + 0.7, -4.3, -3.7);
    b.add(new THREE.SphereGeometry(0.42, 14, 10).translate(-6.3, KERB + 1.0, -4.0), leaf[2]);
    b.build(R);
    const inner = new THREE.Group(); bi.build(inner, false); inner.traverse((o) => { o.receiveShadow = false; }); R.add(inner);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.sunAz ?? L.az), el = THREE.MathUtils.degToRad(s.sunEl ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 60);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) m.lookAt(cam.position.x, m.position.y, cam.position.z);
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right, sun: sunDir });
    let ai = 0;
    for (const p of st.places) {
      const a = this.actor(ai++), [w, h, k] = p.size ?? [600, 1000, 1];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -1 : 1, 1, 1);
      a.mesh.castShadow = false;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return focus;
  }
}
