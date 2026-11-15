// THE TWO BARBERS: shots timed to the narration words (frames at 30 fps), camera grammar from the reference study:
// hard cuts on big reframes, smootherstep glides 18-40 f, every hold creeps in, flip kicks on impacts, 4-5 deg rolls.
export const FPS = 30;
export const TOTAL = 429;
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };

// ---------------- layout (metres; street along x, shop fronts on z = -4.5 facing +z) ----------------
export const SHOP_A = -3.6, SHOP_B = 3.6; // shop centre x (Nandu's / Murali's)
export const FRONT = -4.5;                 // facade plane
export const KERB = 0.15;                  // pavement height in front of the shops
export const CHAIR: V3 = [SHOP_A, KERB, -7.4]; // barber chair inside Nandu's shop

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; sunAz?: number; sunEl?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 60, light: "day" },      // "This town has only two barbers."
  { id: 2, a: 60, b: 102, light: "day" },    // "One has perfect hair."
  { id: 3, a: 102, b: 122, light: "day" },   // "The other?"
  { id: 4, a: 122, b: 163, light: "day" },   // "A total disaster."
  { id: 5, a: 163, b: 204, light: "day" },   // "So who cuts your hair?"
  { id: 6, a: 204, b: 245, light: "day" },   // "Go to the messy one."
  { id: 7, a: 245, b: 285, light: "day" },   // "Sounds crazy, right?"
  { id: 8, a: 285, b: 347, light: "day", sunAz: 120, sunEl: 35 }, // "Because they cut each other's hair," (inside)
  { id: 9, a: 347, b: TOTAL, light: "day" }, // "and his work is on the other guy's head."
];
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -100;
export const SWAP = 321; // "other's": roles swap in the chair
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mixc = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixc(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 30) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

// where people stand (feet on the pavement)
export const SPOT = {
  nandu: [SHOP_A + 0.2, KERB, -3.2] as V3, murali: [SHOP_B - 0.2, KERB, -3.2] as V3,
  nandu1: [-1.75, KERB, -3.1] as V3, murali1: [1.75, KERB, -3.1] as V3,
  nandu5: [-1.25, KERB, -3.0] as V3, murali5: [1.25, KERB, -3.0] as V3, cust5: [0, 0, -1.0] as V3,
  nandu9: [-0.55, 0, -2.7] as V3, murali9: [0.6, 0, -2.7] as V3,
};
const head = (p: V3, h = 1.62): V3 => [p[0], p[1] + h, p[2]];

// 1 · hook: 3/4 view down the street, Murali's shop near, Nandu's beyond; crane down + push on "two barbers"
const S1a = (f: number) => dolly([2.2, 3.6, 9.5], [0, 3.0, -4.5], pushK(f, 0, 0.0025), { fov: 48 });
const S1b = (f: number) => dolly([1.0, 1.8, 6.8], [0, 1.95, -3.6], pushK(f, 30, 0.002, 0.005, 26), { fov: 48, roll: -0.03 });
// 2 · Nandu CU, his shop pillar framing the left edge
const S2a = (f: number) => dolly([SPOT.nandu[0] + 2.3, 1.45, -1.3], head(SPOT.nandu, 1.38), pushK(f, 60, 0.0025, 0.006, 30), { fov: 38 });
// 3 · Murali MS, he leans into frame
const S3a = (f: number) => dolly([SPOT.murali[0] - 2.8, 1.45, -1.0], head(SPOT.murali, 1.25), pushK(f, 102, 0.003), { fov: 40, roll: 0.035 });
// 4 · Murali CU, punch on "disaster"
const S4a = (f: number) => dolly([SPOT.murali[0] - 1.9, 1.5, -1.7], head(SPOT.murali, 1.45), pushK(f, 122, 0.002, 0.008, 30), { fov: 36 });
// 5 · the customer between the two shops, both barbers waiting; roll on "your"
const S5a = (f: number) => dolly([0.3, 1.55, 3.9], [0, 1.25, -2.4], pushK(f, 163, 0.0022), { fov: 48 });
// 6 · straight to Murali, punch on "messy"
const S6a = (f: number) => dolly([SPOT.murali[0] - 2.5, 1.4, -0.6], head(SPOT.murali, 1.25), pushK(f, 204, 0.002, 0.007, 30), { fov: 40 });
// 7 · customer CU, dazed
const S7a = (f: number) => dolly([0.4, 1.5, 2.4], head(SPOT.cust5, 1.32), pushK(f, 245, 0.0028), { fov: 38, roll: -0.04 });
// 8 · inside Nandu's shop: the chair from the doorway, mirror behind
const S8a = (f: number) => dolly([SHOP_A + 0.55, 1.5, -4.1], [SHOP_A + 0.15, 1.25, -7.6], pushK(f, 285, 0.0022), { fov: 40 });
const S8b = (f: number) => dolly([SHOP_A + 0.2, 1.45, -4.6], [SHOP_A + 0.2, 1.3, -7.6], pushK(f, SWAP, 0.003), { fov: 38, roll: 0.04 });
// 9 · two-shot, then push into Nandu's perfect hair on "head"
const S9a = (f: number) => dolly([0.1, 1.5, 2.3], [0.02, 1.3, -2.7], pushK(f, 347, 0.0018), { fov: 44 });
const S9b = (f: number) => dolly([SPOT.nandu9[0] + 0.35, 1.85, -0.4], head(SPOT.nandu9, 1.6), pushK(f, 395, 0.0025), { fov: 36 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 26, dur: 34, s: S1b }],
  2: [{ f: 60, s: S2a }],
  3: [{ f: 102, s: S3a }],
  4: [{ f: 122, s: S4a }],
  5: [{ f: 163, s: S5a }, { f: 183, dur: 22, s: rolled(S5a, 0.05) }],
  6: [{ f: 204, s: S6a }],
  7: [{ f: 245, s: S7a }],
  8: [{ f: 285, s: S8a }, { f: SWAP, cut: true, s: S8b }],
  9: [{ f: 347, s: S9a }, { f: 392, dur: 26, s: S9b }],
};

const KICKS: [number, number][] = [[143 / FPS, 1.2], [225 / FPS, 0.8], [SWAP / FPS, 0.9]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },
  { f: 60, cInf: 13, focus: () => head(SPOT.nandu, 1.55) },
  { f: 102, cInf: 11, focus: () => head(SPOT.murali, 1.45) },
  { f: 122, cInf: 14, focus: () => head(SPOT.murali, 1.62) },
  { f: 163, cInf: 6, focus: () => head(SPOT.cust5, 1.4) },
  { f: 204, cInf: 11, focus: () => head(SPOT.murali, 1.4) },
  { f: 245, cInf: 14, focus: () => head(SPOT.cust5, 1.5) },
  { f: 285, cInf: 9, focus: () => [CHAIR[0], 1.4, CHAIR[2]] },
  { f: 347, cInf: 7, focus: () => head(SPOT.nandu9, 1.5) },
  { f: 392, dur: 26, cInf: 13, focus: () => head(SPOT.nandu9, 1.75) },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};

// ---------------- narration words (frames), for the reference-style one-word captions ----------------
export const WORDS: [number, number, string][] = [
  [4, 12, "this"], [13, 21, "town"], [22, 28, "has"], [29, 37, "only"], [38, 44, "two"], [45, 58, "barbers"],
  [62, 69, "one"], [70, 76, "has"], [77, 89, "perfect"], [90, 100, "hair"], [104, 110, "the"], [111, 121, "other"],
  [124, 130, "a"], [130, 142, "total"], [143, 161, "disaster"], [166, 171, "so"], [171, 177, "who"], [178, 185, "cuts"],
  [186, 193, "your"], [194, 203, "hair"], [206, 212, "go"], [212, 217, "to"], [218, 224, "the"], [225, 234, "messy"],
  [234, 243, "one"], [246, 258, "sounds"], [259, 270, "crazy"], [271, 283, "right"], [287, 298, "because"], [299, 306, "they"],
  [306, 313, "cut"], [313, 320, "each"], [321, 330, "other's"], [331, 345, "hair"], [348, 354, "and"], [354, 360, "his"],
  [360, 367, "work"], [368, 373, "is"], [373, 378, "on"], [378, 384, "the"], [385, 393, "other"], [393, 400, "guy's"], [401, 420, "head"],
];
