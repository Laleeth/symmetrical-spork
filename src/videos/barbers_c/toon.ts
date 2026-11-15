// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#f6e8d6";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.95, 0.9, 0.93]; // soft, slightly lavender shadow on pale cream heads (no orange)
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string;
  build?: Build; kurta?: boolean; cape?: boolean; hairStyle?: "neat" | "messy" | "short" | "bun" | "bald";
  /** Indian costume system (bodyIndian). garment = top; lower = what is below it. kurta:true == garment "kurta" */
  garment?: "kurta" | "jhabba" | "shirt" | "blouse"; lower?: "pyjama" | "pants" | "stick" | "lungi" | "dhoti" | "saree";
  /** collar / placket / hem / border colour */ trim?: string;
  /** cloth waist sash colour */ waist?: string;
  /** barber's towel over one shoulder (towel colour; stripes use trim) */ towel?: string;
  /** shawl over both shoulders */ shawl?: string;
  /** lungi / saree / dhoti cloth colour */ cloth?: string;
  specs?: boolean; bindi?: string; mous?: "thin" | "bushy";
};
type P2 = [number, number];

const luma = (c: string) => { const n = parseInt(c.slice(1), 16); return (0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255; };
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f3e1cb", "#efd9bf", "#f1dcc6"];
/** older warm skins used by earlier outfits -> pale cream equivalents (no orange faces) */
const LEGACY_SKIN: Record<string, string> = { "#efc298": "#f6e8d6", "#e0ab83": "#f1dfc8", "#d79f76": "#ecd5bb", "#f0c49a": "#f6e8d6", "#e2b088": "#f1dfc8", "#d9a57c": "#ecd5bb" };
export const paleSkin = (s?: string) => (s ? LEGACY_SKIN[s.toLowerCase()] ?? s : SKIN);

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed: number, a = 118, facing = 0): Blob => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 2.0 + 0.24 * (rnd(seed, 2) - 0.5), nBot: 2.4 + 0.24 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick";
type EyeK = "dot" | "small" | "lid" | "slit" | "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral";
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE: Record<Expr, { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK }> = {
  neutral: { eye: ["dot", "dot"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
};
const halfLid = (k: EyeK): EyeK => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k: EyeK, lid: number): EyeK =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: EyeK, x: number, ey: number, u: number, side: number, look: number, skin: string) => {
  const lx = x + look * 3 * u, lw = 3.2 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.3 * u, 4.6 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 2.6 * u, 3.7 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 3.2 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 7.5 * u, by + dI * u], [x + side * 7.5 * u, by + dO * u], 3.8 * u, 1.8 * u);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  mouth(p, F.mouth, mx, my, u);
  if (moustache && luma(moustache) > 0.6) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 13) * u, cy + (stout ? 10.5 : 14.5) * u], (stout ? 5.5 : 3.4) * u + 2.4 * u, 1.2 * u + 2.4 * u, INK);
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 13) * u, cy + (stout ? 10.5 : 14.5) * u], stout ? 5.5 * u : 3.4 * u, 1.2 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx: number, hc: number, light: number, seed: number, facing: number, side: boolean) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts: P2[]) => rotPts(pts, a, cx, hc);
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    if (o.hat === "hair" && o.hairStyle === "messy") { // spiky, uncombed: tufts fanning out of the crown, then the cap of hair over their roots
      const tips = arc.filter(([, y]) => y < hc - 0.25 * H.b);
      const step = Math.max(1, Math.floor(tips.length / 13));
      for (let i = 0, k = 0; i < tips.length; i += step, k++) {
        const [x, y] = tips[i], ang = Math.atan2(y - hc, x - cx) + (rnd(seed, 40 + k) - 0.5) * 0.9, L = (16 + 22 * rnd(seed, 60 + k)) * u;
        const nx = Math.cos(ang), ny = Math.sin(ang), px = -ny, py = nx, bw = (7 + 4 * rnd(seed, 80 + k)) * u;
        p.poly([[x - px * bw - nx * 8 * u, y - py * bw - ny * 8 * u], [x + nx * L + px * 3 * u * (k % 2 ? 1 : -1), y + ny * L], [x + px * bw - nx * 8 * u, y + py * bw - ny * 8 * u]], col, ow * 0.8);
      }
    }
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair" && o.hairStyle === "neat") { // oiled side parting and a glossy front wave
      const s = side ? 1 : facing || 1;
      const qx = cx + s * 16 * u, qy = crown + 0.05 * HH;
      p.ell(qx, qy + 4 * u, 25 * u, 11 * u, col, ow * 0.8, 180, 360, s * -6);
      p.ell(qx, qy + 6 * u, 24 * u, 6 * u, col, 0, 0, 360, s * -6);
      p.arc(cx - s * 4 * u, crown + 0.2 * HH, 22 * u, 10 * u, s > 0 ? 215 : 265, s > 0 ? 275 : 325, 3.5 * u, mix(col, "#ffffff", 0.4));
      p.stroke([[cx - s * 22 * u, cut - 30 * u], [cx - s * 12 * u, cut - 6 * u]], 2.2 * u);
    } else if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
      if (o.hairStyle === "messy") for (const k of [-1, 1]) p.arc(cx + k * 30 * u, crown - 6 * u, 7 * u, 7 * u, 180, 450, 2.4 * u);
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | "cane" | ["hammer", number] | ["scissors", number] | ["comb", number] | ["point", number];

const BUILD: Record<Build, { a: number; torso: number; legs: number; tw: number }> = {
  adult: { a: 110, torso: 1.18, legs: 1.45, tw: 0.8 },
  stout: { a: 110, torso: 1.22, legs: 1.38, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall"; look?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
};

const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};

export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  if ((o.kurta || o.garment || o.lower) && mode !== "fall") return bodyIndian(p, o, opts);
  const Bd = BUILD[o.build ?? "adult"], skin = paleSkin(o.skin), two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 5.8 * u, footW = 7.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall";
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * HH], R1: P2 = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
  type Arm = { pts: [P2, P2, P2]; front: boolean };
  const arms: Arm[] = [];
  if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop) && prop[0] !== "hammer") {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E: P2 = [tcx + 1.05 * T.a + 12 * u, S[1] - (0.1 + 0.15 * k) * HH], Hd: P2 = [tcx + 0.85 * T.a + 10 * u - 18 * u * k, S[1] - (0.55 + 0.2 * k) * HH];
      arms.push({ pts: [S, E, Hd], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  const drawArm = (a: Arm) => { p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0: P2 = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    if (o.kurta && mode !== "sit") {
      const kp: P2[] = [[tcx - 0.97 * T.a, torsoBot - 0.45 * HH], [tcx + 0.97 * T.a, torsoBot - 0.45 * HH], [tcx + 1.02 * T.a, torsoBot + 0.5 * HH], [tcx - 1.02 * T.a, torsoBot + 0.5 * HH]];
      p.gradFill(kp, o.jacket, mul(o.jacket, SH_CLOTH), light);
      p.band([[tcx - 1.02 * T.a, torsoBot + 0.47 * HH], [tcx + 1.02 * T.a, torsoBot + 0.47 * HH]], shade(o.jacket, 0.78), 0.04 * HH, 0);
      p.inkRing(kp, ow * 0.9, thick);
    }
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    if (o.sash) { const s = facing || 1; p.poly([[tcx + s * 0.55 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.05 * HH], [tcx + s * 0.45 * T.a, torsoBot + 0.02 * HH]], o.sash, 1.6 * u); }
    if (o.kurta && mode !== "sit") p.clip([[0, 0], [600, 0], [600, torsoBot - 0.36 * HH], [0, torsoBot - 0.36 * HH]], () => p.inkRing(tp, ow, thick));
    else p.inkRing(tp, ow, thick);
    if (o.cape) {
      const cp: P2[] = [];
      for (let i = 0; i <= 24; i++) { const t = Math.PI * (i / 24); cp.push([300 - Math.cos(t) * 0.62 * W * (0.35 + 0.65 * Math.sin(t / 2 + 0.2)), chin - 0.02 * HH + (1 - Math.cos(t * 0)) * 0 + Math.sin(t) * 0]); }
      const top = chin + 0.02 * HH, bot = sole - 0.42 * HH;
      const capePts: P2[] = [[300 - 0.16 * W, top], [300 + 0.16 * W, top], [300 + 0.62 * W, bot], [300 - 0.62 * W, bot]];
      p.gradFill(capePts, "#f4f6fb", "#c9d2e6", light);
      p.clip(capePts, () => { for (let k = 1; k < 5; k++) p.band([[300 - 0.7 * W, top + k * (bot - top) / 5], [300 + 0.7 * W, top + k * (bot - top) / 5]], "#8fb3e6", 0.035 * HH, 0); });
      p.inkRing(capePts, ow, thick);
    }
  }
  // in front of the body: hands holding props
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop) && prop[0] === "scissors") {
      const op = 10 + 22 * Math.abs(Math.sin(prop[1] * 9));
      for (const s of [-1, 1]) {
        const R2 = (pts: P2[]) => rotPts(pts, rad(-35 + s * op / 2), hx, hy);
        p.poly(R2([[hx, hy - 3 * u], [hx + 46 * u, hy - 1 * u], [hx + 46 * u, hy + 1 * u], [hx, hy + 3 * u]]), "#dfe5ea", 1.6 * u);
        const [rx, ry] = R2([[hx - 13 * u, hy + s * 6 * u]])[0];
        p.ell(rx, ry, 8 * u, 6 * u, null, 3.4 * u); p.arc(rx, ry, 8 * u, 6 * u, 0, 360, 2.2 * u, "#d8433a");
      }
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop) && prop[0] === "comb") {
      const Rh = (pts: P2[]) => rotPts(pts, rad(-15), hx, hy);
      p.poly(Rh([[hx - 6 * u, hy - 30 * u], [hx + 30 * u, hy - 30 * u], [hx + 30 * u, hy - 22 * u], [hx - 6 * u, hy - 22 * u]]), "#d8433a", 1.8 * u);
      for (let i = 0; i < 8; i++) p.stroke(Rh([[hx - 3 * u + i * 4.4 * u, hy - 22 * u], [hx - 3 * u + i * 4.4 * u, hy - 14 * u]]), 1.6 * u, "#d8433a");
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop) && prop[0] === "point") {
      p.stroke([[hx, hy], [hx - 10 * u, hy - 9 * u]], 4 * u, INK); p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  if (o.hat === "hair") hairBehind(p, o, H, 300, hc, light, thick, facing);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (o.hat === "hair") hairV3(p, o, H, 300, hc, light, thick, seed, facing, skin);
  else hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

// ---------------- Indian cast (v3): kurta / shirt / saree / dhoti costumes, hair that hugs the skull ----------------
/** one point of a blob contour at parameter t (same formula as blobPts) */
const blobAt = (cx: number, cy: number, B: Blob, t: number, sc = 1): P2 => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
  let X = Math.sign(c) * Math.abs(c) ** e;
  const Y = Math.sign(s) * Math.abs(s) ** e;
  X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
  const r = sc * (1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2])));
  const x = B.a * X * r, y = B.b * Y * r;
  return [cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)];
};
const OWI = 3.6; // Indian cast outline width in u (thin-medium; thick-thin ring adds weight on the shadow side)
const HAIR_INK = (c: string) => mix(c, INK, 0.35);

/** behind-the-head hair parts (bun) */
const hairBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, facing: number) => {
  if (o.hairStyle !== "bun") return;
  const u = (2 * H.a) / 100, s = facing || 1, col = o.hair ?? "#2a1d26";
  const bx = cx - s * 20 * u, by = hc - H.b - 9 * u, r = 17 * u;
  const bp = blobPts(bx, by, { a: r, b: r * 0.9, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: H.seed + 31 });
  p.shadedFill(bp, col, mul(col, SH_FELT), light, r, 0.35);
  p.inkRing(bp, OWI * u, thick);
  p.arc(bx, by, r * 0.6, r * 0.45, 200, 330, 1.4 * u, mix(col, "#ffffff", 0.25));
  for (let i = 0; i < 6; i++) { // jasmine string (gajra)
    const a = rad(150 + i * 22);
    p.dot(bx + Math.cos(a) * r * 1.02, by + Math.sin(a) * r * 0.95 + 4 * u, 3.4 * u, INK);
    p.dot(bx + Math.cos(a) * r * 1.02, by + Math.sin(a) * r * 0.95 + 4 * u, 2.4 * u, "#fbf8ee");
  }
};

/** hair v3 (front view): a cap that hugs the skull, its own hairline, style-specific detail */
const hairV3 = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, seed: number, facing: number, skin: string) => {
  const style = o.hairStyle ?? (o.dress || o.lower === "saree" ? "bun" : "short");
  const W = 2 * H.a, u = W / 100, b = H.b, col = o.hair ?? "#2a1d26", s = facing || (rnd(seed, 22) < 0.5 ? -1 : 1);
  const ring = (pts: P2[], w = OWI * u) => p.inkRing(pts, w, thick, 0.5, HAIR_INK(col) === col ? INK : INK);
  if (style === "bald") { // white side tufts above the ears, a few wisps on top
    for (const side of [-1, 1]) {
      const t0 = side > 0 ? Math.PI * 2 - 0.12 : Math.PI + 0.12;
      const [x, y] = blobAt(cx, hc, H, t0, 1.0);
      const tuft: P2[] = [];
      for (let i = 0; i <= 16; i++) {
        const a = rad(-100 + (200 * i) / 16) , rr = 9 * u * (1 + 0.22 * Math.abs(Math.sin(i * 1.7)));
        tuft.push([x + side * Math.cos(a) * rr * 0.75, y + Math.sin(a) * rr * 1.25]);
      }
      if (side < 0) tuft.reverse();
      p.shadedFill(tuft, col, mul(col, [0.86, 0.86, 0.92]), light, 10 * u, 0.3);
      p.inkRing(tuft, 2.6 * u, thick);
    }
    const [tx, ty] = blobAt(cx, hc, H, Math.PI * 1.5);
    p.arc(tx + 3 * u, ty + 2 * u, 8 * u, 7 * u, 200, 300, 1.4 * u);
    p.arc(tx - 5 * u, ty + 3 * u, 6 * u, 6 * u, 230, 320, 1.4 * u);
    return;
  }
  const tS = style === "bun" ? 0.42 : style === "messy" ? 0.02 : -0.04;
  // ---- outer arc (left -> crown -> right), with style-specific volume ----
  const tufts: { t: number; A: number; w: number; bend: number }[] = [];
  if (style === "messy") {
    const N = 9;
    for (let k = 0; k < N; k++) {
      const t = Math.PI - 0.05 + ((Math.PI + 0.1) * (k + 0.5 + 0.5 * (rnd(seed, 70 + k) - 0.5))) / N;
      tufts.push({ t, A: 0.07 + 0.09 * rnd(seed, 80 + k), w: 0.12 + 0.05 * rnd(seed, 90 + k), bend: (rnd(seed, 100 + k) - 0.5) * 0.5 + (t > 1.5 * Math.PI ? 0.18 : -0.18) });
    }
  }
  const arc: P2[] = [];
  const NA = 90;
  for (let i = 0; i <= NA; i++) {
    let t = Math.PI - tS + ((Math.PI + 2 * tS) * i) / NA, sc = 1.03;
    if (style === "neat") { const tq = 1.5 * Math.PI + s * 0.38; sc += 0.15 * Math.exp(-(((t - tq) / 0.28) ** 2)); sc -= 0.012 * Math.exp(-(((t - (1.5 * Math.PI - s * 0.5)) / 0.12) ** 2)); }
    if (style === "short") sc += 0.02 * Math.exp(-(((t - 1.5 * Math.PI) / 0.6) ** 2));
    if (style === "bun") sc += 0.02;
    for (const T of tufts) { const d = Math.max(0, 1 - Math.abs(t - T.t) / T.w); sc += T.A * d * d; t += T.bend * T.A * d * d * 2.2; }
    arc.push(blobAt(cx, hc, H, t, sc));
  }
  // ---- hairline (right -> left) ----
  const R0 = arc[arc.length - 1], L0 = arc[0], line: P2[] = [];
  const xT = style === "bun" ? 0.37 * W : 0.41 * W; // temples
  const yAt = (X: number): number => { // X in -1..1 across the forehead (screen left -> right)
    const Xs = X * s;
    if (style === "neat") {
      let y = hc - b * (0.66 - 0.09 * (Xs + 1));
      if (Xs > -0.2) y += b * 0.13 * Math.max(0, Math.sin((Math.PI * (Xs + 0.2)) / 1.2)) ** 1.5; // the combed front wave sweeps down over the forehead...
      if (Xs > 0.78) y -= b * 0.5 * (Xs - 0.78); // ...and flicks back up at the temple
      y -= b * 0.07 * Math.exp(-(((Xs + 0.55) / 0.07) ** 2)); // parting notch
      return y;
    }
    if (style === "messy") return hc - b * (0.56 + 0.03 * Math.sin(X * 3 + seed));
    if (style === "bun") return hc - b * (0.36 + 0.26 * (1 - Math.abs(X)) ** 1.3) + b * 0.03 * Math.exp(-((X / 0.06) ** 2));
    return hc - b * (0.58 + 0.04 * (1 - X * X)) - b * 0.04 * Math.exp(-(((Xs + 0.5) / 0.08) ** 2));
  };
  const side0: P2 = style === "bun" ? [R0[0] - 9 * u, R0[1] - 2 * u] : [R0[0] - 5 * u, R0[1] - 2 * u];
  line.push(side0);
  const NL = style === "messy" ? 18 : 26;
  for (let i = 0; i <= NL; i++) {
    const X = 1 - (2 * i) / NL;
    let y = yAt(X);
    if (style === "messy") y += (i % 2 ? 1 : -0.4) * b * (0.07 + 0.06 * rnd(seed, 120 + i));
    line.push([cx + X * xT, y]);
  }
  line.push(style === "bun" ? [L0[0] + 9 * u, L0[1] - 2 * u] : [L0[0] + 5 * u, L0[1] - 2 * u]);
  const cap = [...arc, ...line];
  p.shadedFill(cap, col, mul(col, SH_FELT), light, H.a, 0.35);
  // ---- detail clipped to the hair ----
  p.clip(cap, () => {
    const gloss = mix(col, "#ffffff", style === "neat" ? 0.42 : 0.22);
    if (style === "neat") {
      // combed grooves sweeping from the parting toward the wave, plus a long glossy highlight
      for (const k of [0.86, 0.74]) {
        const g: P2[] = [];
        for (let i = 0; i <= 16; i++) { const t = 1.5 * Math.PI - s * 0.45 + s * (0.85 * i) / 16; g.push(blobAt(cx, hc, H, t, k + 0.05 * Math.exp(-(((t - (1.5 * Math.PI + s * 0.42)) / 0.33) ** 2)))); }
        p.stroke(g, 1.3 * u, mix(col, "#ffffff", 0.16));
      }
      const hl: P2[] = [];
      for (let i = 0; i <= 14; i++) { const t = 1.5 * Math.PI + s * (-0.15 + (0.7 * i) / 14); hl.push(blobAt(cx, hc, H, t, 0.95 + 0.06 * Math.exp(-(((t - (1.5 * Math.PI + s * 0.42)) / 0.33) ** 2)))); }
      p.stroke(hl, 2.6 * u, gloss);
      p.stroke(hl.slice(5, 9), 1.4 * u, mix(col, "#ffffff", 0.7));
      // parting: a fine scalp line from the notch toward the crown
      const px = cx - s * 0.55 * xT, py = yAt(-0.55 * s * s * 1) ;
      p.stroke(curve([px, py + 2 * u], [px - s * 2 * u, py - 0.25 * b], [px - s * 1 * u, hc - 0.98 * b]), 1.8 * u, mix(skin, col, 0.35));
    } else if (style === "messy") {
      for (let k = 0; k < 4; k++) {
        const t = Math.PI * (1.15 + 0.22 * k), [x, y] = blobAt(cx, hc, H, t, 0.82);
        p.stroke(curve([x, y], [x + 4 * u, y + 5 * u], [x + (k % 2 ? 7 : -6) * u, y + 11 * u]), 1.3 * u, mix(col, "#ffffff", 0.16));
      }
      const hl: P2[] = [];
      for (let i = 0; i <= 8; i++) hl.push(blobAt(cx, hc, H, Math.PI * (1.25 + 0.03 * i), 0.93));
      p.stroke(hl, 2.6 * u, gloss);
    } else if (style === "bun") {
      p.stroke([[cx, yAt(0) + 2 * u], [cx + u, hc - 0.98 * b]], 1.8 * u, mix(skin, col, 0.35));
      for (const k of [-1, 1]) {
        const g: P2[] = [];
        for (let i = 0; i <= 10; i++) g.push(blobAt(cx, hc, H, 1.5 * Math.PI + k * (0.15 + (0.9 * i) / 10), 0.9));
        p.stroke(g, 2.4 * u, gloss);
      }
    } else {
      const hl: P2[] = [];
      for (let i = 0; i <= 10; i++) hl.push(blobAt(cx, hc, H, 1.5 * Math.PI - 0.55 + 0.05 * i, 0.92));
      p.stroke(hl, 3 * u, gloss);
      const px = cx - s * 0.5 * xT;
      p.stroke([[px, yAt(-0.5 * s) + u], [px - s * u, hc - 0.95 * b]], 1.5 * u, mix(skin, col, 0.4));
    }
  });
  ring(cap);
  if (style === "messy") { // two stray hairs
    const [x1, y1] = blobAt(cx, hc, H, Math.PI * 1.62, 1.12), [x2, y2] = blobAt(cx, hc, H, Math.PI * 1.08, 1.06);
    p.stroke(curve([x1, y1 + 4 * u], [x1 + 5 * u, y1 - 5 * u], [x1 + 2 * u, y1 - 13 * u]), 1.5 * u);
    p.stroke(curve([x2 + 3 * u, y2], [x2 - 5 * u, y2 - 3 * u], [x2 - 10 * u, y2 + 2 * u]), 1.5 * u);
  }
};

/** closed garment silhouette: neck -> rounded shoulders -> sides -> rounded hem (clockwise on screen) */
const garmentPts = (cx: number, top: number, sy: number, hem: number, sw: number, hw: number, bow: number, r: number, flare = 0.02): P2[] => {
  const half = (sd: number): P2[] => {
    const N: P2 = [cx + sd * 0.42 * sw, top], S: P2 = [cx + sd * sw, sy + 0.32 * (sy - top)], C: P2 = [cx + sd * hw, hem - r], E: P2 = [cx + sd * (hw - r), hem];
    return [...curve(N, [cx + sd * 0.9 * sw, top + 0.45 * (sy - top)], S, 8), ...curve(S, [cx + sd * ((sw + hw) / 2 + flare * hw), (S[1] + C[1]) / 2], C, 10).slice(1),
      ...curve(C, [cx + sd * (hw - 0.25 * r), hem - 0.25 * r], E, 5).slice(1)];
  };
  const R = half(1), L = half(-1).reverse();
  return [...R, ...curve(R[R.length - 1], [cx, hem + bow], L[0], 12).slice(1, -1), ...L];
};

/** draw a cloth piece: soft gradient, clipped detail, thick-thin ring */
const cloth = (p: Pen, pts: P2[], col: string, light: number, ow: number, thick: number, detail?: () => void, k = 0.5) => {
  p.gradFill(pts, col, mul(col, [0.74, 0.74, 0.82]), light, 0.3);
  if (detail) p.clip(pts, detail);
  p.inkRing(pts, ow, thick, k);
};

/** strip polygon around a polyline (sleeves, towel, pallu, tubes) */
const strip = (pts: P2[], w0: number, w1: number): P2[] => {
  const L: P2[] = [], R: P2[] = [], n = pts.length;
  pts.forEach((q, i) => {
    const a = pts[Math.max(0, i - 1)], b2 = pts[Math.min(n - 1, i + 1)];
    let nx = -(b2[1] - a[1]), ny = b2[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const w = (w0 + ((w1 - w0) * i) / (n - 1)) / 2;
    L.push([q[0] + nx * w, q[1] + ny * w]); R.push([q[0] - nx * w, q[1] - ny * w]);
  });
  return [...L, ...R.reverse()];
};
/** keep a strip polygon clockwise (inkRing normals expect it) */
const cw = (pts: P2[]): P2[] => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; }
  return a < 0 ? [...pts].reverse() : pts;
};

export const bodyIndian = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "stand", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = paleSkin(o.skin), two = Math.PI * 2, lid = lidOf(blink), sit = mode === "sit";
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = sit ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = OWI * u;
  const garment = o.garment ?? (o.lower === "saree" ? "blouse" : "kurta");
  const lower = o.lower ?? (garment === "blouse" ? "saree" : garment === "kurta" ? "pyjama" : "pants");
  const top = o.jacket, trim = o.trim ?? mix(top, "#ffffff", 0.55), clothCol = o.cloth ?? o.pants;
  const stout = o.build === "stout";
  const sw = (0.38 + (stout ? 0.05 : 0)) * W, tcx = 300 + 2 * u * facing;
  const sy = chin + 0.07 * HH;
  const hem = garment === "kurta" ? torsoBot + 0.52 * HH : garment === "jhabba" ? torsoBot + 0.16 * HH : garment === "shirt" ? torsoBot + 0.08 * HH : chin + 0.5 * HH;
  const hw = garment === "kurta" ? 0.415 * W : garment === "blouse" ? 0.33 * W : (0.4 + (stout ? 0.06 : 0)) * W;
  const legLine = mix(INK, skin, 0.12), limb = mix(INK, skin, 0.1);
  // ---------- legs + chappals (unrotated) ----------
  p.rot = null;
  const tube = lower === "pyjama" || lower === "pants";
  const legW = tube ? (lower === "pyjama" ? 10 : 11) * u : 5 * u, rim = 1.5 * u;
  const legCol = lower === "pyjama" ? o.pants : lower === "pants" ? o.pants : legLine;
  const chappal = (fx: number, fy: number, side: number) => {
    const a: P2 = [fx - side * 4 * u, fy + 1.5 * u], c: P2 = [fx + side * 14 * u, fy + 2 * u];
    p.stroke([a, c], 4.6 * u + 2 * rim, INK); p.stroke([a, c], 4.6 * u, o.boots);
    p.stroke([[fx - side * 1 * u, fy - 1.5 * u], [fx + side * 10 * u, fy - 1 * u]], 4.6 * u, mix(INK, skin, 0.15));
    p.stroke([[fx + side * 4 * u, fy - 4 * u], [fx + side * 6 * u, fy + 1 * u]], 1.6 * u, INK);
  };
  const leg = (pts: P2[]) => {
    if (tube) { p.stroke(pts, legW + 2 * rim, INK); p.stroke(pts, legW, legCol); const e = pts[pts.length - 1]; p.stroke([[e[0] - legW / 2, e[1] - 2 * u], [e[0] + legW / 2, e[1] - 2 * u]], 1.3 * u, mix(legCol, INK, 0.35)); }
    else p.stroke(pts, legW, legCol);
  };
  if (sit) {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 42 * u, sole - 10 * u];
      leg(curve(h, k, f)); chappal(f[0], sole - 6 * u, side);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 14 * u, fx = 300 + side * (lower === "saree" ? 12 : 21) * u, fy = sole - 6 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.2 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      leg(curve([hx, hipY], k, [fx, fy - 3 * u]));
      chappal(fx, fy, side);
    }
  }
  // ---------- upper body ----------
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const sh = (side: number): P2 => [tcx + side * 0.84 * sw, sy + 0.05 * HH];
  const sw2 = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (sw + (garment === "kurta" ? 0.07 : 0.05) * W);
    const hx = ex + side * 1.5 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.45 * HH], [hx, S[1] + 0.9 * HH - Math.abs(fwd) * 9 * u]];
  };
  type Arm = { pts: [P2, P2, P2]; front: boolean };
  const arms: Arm[] = [];
  const cape = !!o.cape && sit;
  if (sit) for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (sw + 0.07 * W), sh(side)[1] + 0.4 * HH], [tcx + side * (sw + 0.1 * W), torsoBot + 0.02 * HH]], front: false });
  else {
    arms.push({ pts: hang(-1, -sw2), front: false });
    if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + sw + 0.12 * W + 3 * u * wave, S[1] - 0.2 * HH], [tcx + sw + 0.18 * W + 12 * u * wave, S[1] - 0.58 * HH]], front: false });
    } else if (prop === "cane") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + sw + 0.1 * W, S[1] + 0.36 * HH], [tcx + sw + 0.15 * W, S[1] + 0.66 * HH]], front: true });
    } else if (Array.isArray(prop) && prop[0] !== "hammer") {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E: P2 = [tcx + sw + 0.14 * W, S[1] - (0.08 + 0.15 * k) * HH], Hd: P2 = [tcx + 0.85 * sw + 0.1 * W - 0.18 * W * k, S[1] - (0.55 + 0.2 * k) * HH];
      arms.push({ pts: [S, E, Hd], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + sw + 0.12 * W, S[1] - 0.15 * HH], [tcx + sw + 0.14 * W, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + sw + 0.18 * W, S[1] - 0.55 * HH], [tcx + 1.2 * sw + 0.25 * W, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw2), front: false });
  }
  const sleeveT = garment === "kurta" ? 0.52 : garment === "jhabba" ? 0.55 : garment === "shirt" ? 0.36 : 0.26;
  const drawArm = (a: Arm) => {
    const C = curve(a.pts[0], a.pts[1], a.pts[2], 20), cut = Math.round(20 * sleeveT);
    p.stroke(C.slice(cut - 1), 4.6 * u, limb);
    if (garment === "blouse") for (const k of [0.82, 0.88]) { const q = C[Math.round(20 * k)], q2 = C[Math.round(20 * k) + 1]; const dx = q2[0] - q[0], dy = q2[1] - q[1], l = Math.hypot(dx, dy) || 1; p.stroke([[q[0] - (dy / l) * 4 * u, q[1] + (dx / l) * 4 * u], [q[0] + (dy / l) * 4 * u, q[1] - (dx / l) * 4 * u]], 2.2 * u, k < 0.85 ? "#d8433a" : "#e8c45a"); }
    p.dot(a.pts[2][0], a.pts[2][1], 4.8 * u, INK);
    const sl = cw(strip(C.slice(0, cut + 1), 15 * u, (garment === "kurta" ? 17 : 15) * u));
    p.gradFill(sl, top, mul(top, [0.8, 0.8, 0.86]), light, 0.3);
    p.inkRing(sl, ow * 0.85, thick, 0.35);
    const e = C[cut], e0 = C[cut - 2], dx = e[0] - e0[0], dy = e[1] - e0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const hwc = (garment === "kurta" ? 8.5 : 7.5) * u, back = 3 * u;
    p.stroke([[e[0] - (dx / l) * back + nx * hwc * 0.85, e[1] - (dy / l) * back + ny * hwc * 0.85], [e[0] - (dx / l) * back - nx * hwc * 0.85, e[1] - (dy / l) * back - ny * hwc * 0.85]], 1.4 * u, garment === "kurta" || garment === "jhabba" ? trim : mix(top, INK, 0.4));
  };
  // ---------- lower garments (behind the top) ----------
  const waistY = torsoBot - 0.24 * HH;
  if (!sit && lower === "lungi") {
    const lb = sole - 0.2 * HH, lp: P2[] = [[tcx + 0.37 * W, waistY], [tcx + 0.4 * W, lb - 4 * u], [tcx + 0.36 * W, lb], [tcx - 0.36 * W, lb], [tcx - 0.4 * W, lb - 4 * u], [tcx - 0.37 * W, waistY]];
    const lp2 = cw(lp);
    cloth(p, lp2, clothCol, light, ow, thick, () => {
      const dk = mix(clothCol, INK, 0.3), lt = mix(clothCol, "#ffffff", 0.35);
      for (let i = -5; i <= 5; i++) p.stroke([[tcx + i * 0.075 * W, waistY], [tcx + i * 0.08 * W, lb]], (i % 2 ? 1.4 : 3) * u, i % 2 ? lt : dk);
      for (let y = waistY + 0.12 * HH; y < lb; y += 0.16 * HH) { p.stroke([[tcx - 0.5 * W, y], [tcx + 0.5 * W, y]], 3 * u, dk); p.stroke([[tcx - 0.5 * W, y + 4 * u], [tcx + 0.5 * W, y + 4 * u]], 1.2 * u, lt); }
      p.band([[tcx - 0.42 * W, lb - 4 * u], [tcx + 0.42 * W, lb - 4 * u]], mix(clothCol, INK, 0.45), 5 * u, 0);
      p.stroke(curve([tcx + 0.06 * W, waistY], [tcx + 0.12 * W, (waistY + lb) / 2], [tcx + 0.1 * W, lb]), 1.6 * u, INK);
    });
  } else if (!sit && lower === "dhoti") {
    const db = sole - 0.32 * HH, dp: P2[] = cw([[tcx + 0.38 * W, waistY], [tcx + 0.42 * W, db - 6 * u], [tcx + 0.32 * W, db], [tcx + 0.04 * W, db + 6 * u], [tcx - 0.32 * W, db], [tcx - 0.42 * W, db - 6 * u], [tcx - 0.38 * W, waistY]]);
    cloth(p, dp, clothCol, light, ow, thick, () => {
      p.band([[tcx - 0.5 * W, db - 3 * u], [tcx + 0.04 * W, db + 3 * u], [tcx + 0.5 * W, db - 3 * u]], trim, 4 * u, 0);
      for (const dx of [-0.02, 0.05, 0.12]) p.stroke(curve([tcx + dx * W, waistY + 0.05 * HH], [tcx + (dx + 0.03) * W, (waistY + db) / 2], [tcx + (dx + 0.02) * W, db + 4 * u]), 1.4 * u, mix(clothCol, INK, 0.45));
    });
  } else if (!sit && lower === "saree") {
    const st = chin + 0.42 * HH, sb = sole - 0.07 * HH, sp: P2[] = cw([[tcx + 0.3 * W, st], [tcx + 0.4 * W, sb - 0.35 * HH], [tcx + 0.47 * W, sb - 4 * u], [tcx + 0.42 * W, sb], [tcx - 0.42 * W, sb], [tcx - 0.47 * W, sb - 4 * u], [tcx - 0.4 * W, sb - 0.35 * HH], [tcx - 0.3 * W, st]]);
    cloth(p, sp, clothCol, light, ow, thick, () => {
      p.band([[tcx - 0.6 * W, sb - 6 * u], [tcx + 0.6 * W, sb - 6 * u]], trim, 9 * u, 0);
      p.band([[tcx - 0.6 * W, sb - 14 * u], [tcx + 0.6 * W, sb - 14 * u]], mix(trim, INK, 0.25), 1.6 * u, 0);
      for (let i = 0; i < 5; i++) { const x0 = tcx + (0.02 + 0.035 * i) * W; p.stroke([[x0, st + 0.4 * HH], [x0 + (i - 1) * 0.02 * W, sb]], 1.4 * u, mix(clothCol, INK, 0.35)); }
      for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) p.dot(tcx - 0.35 * W + i * 0.09 * W + (j % 2) * 0.045 * W, st + 0.18 * HH + j * 0.2 * HH, 1.6 * u, mix(clothCol, "#ffffff", 0.45));
    });
  }
  // ---------- arms behind, top garment ----------
  if (sit && (lower === "lungi" || lower === "dhoti" || lower === "saree")) {
    const lp = cw([[300 + 0.4 * W, hipY - 0.1 * HH], [300 + 0.46 * W, sole - 0.14 * HH], [300 - 0.46 * W, sole - 0.14 * HH], [300 - 0.4 * W, hipY - 0.1 * HH]]);
    cloth(p, lp, clothCol, light, ow, thick, () => { for (let i = -5; i <= 5; i++) p.stroke([[300 + i * 0.08 * W, hipY], [300 + i * 0.09 * W, sole]], 2.4 * u, mix(clothCol, INK, 0.3)); p.band([[0, sole - 0.14 * HH - 4 * u], [600, sole - 0.14 * HH - 4 * u]], mix(clothCol, INK, 0.45), 5 * u, 0); });
  }
  if (!cape) for (const a of arms) if (!a.front) drawArm(a);
  const gtop = chin - 0.12 * HH;
  const gp = garmentPts(tcx, gtop, sy, sit ? torsoBot + 0.04 * HH : hem, sw, sit ? hw * 0.95 : hw, garment === "kurta" ? 3 * u : 2 * u, 8 * u);
  const plX = tcx + 3 * u * facing;
  if (!cape) cloth(p, gp, top, light, ow, thick, () => {
    if (garment === "kurta" || garment === "jhabba") {
      if (!sit && garment === "kurta") for (const sd of [-1, 1]) { // side slits
        const x = tcx + sd * hw, sl: P2[] = [[x - sd * 2 * u, hem - 0.24 * HH], [x + sd * 3 * u, hem + 4 * u], [x - sd * 9 * u, hem + 4 * u]];
        p.poly(sl, lower === "pyjama" || lower === "pants" ? o.pants : mix(top, INK, 0.5), 0);
        p.stroke([sl[0], sl[2]], 1.6 * u, INK);
      }
      // hem border
      p.stroke(curve([tcx - hw - 4 * u, hem - 5 * u], [tcx, hem - 5 * u + 3 * u], [tcx + hw + 4 * u, hem - 5 * u]), 3.4 * u, trim);
      // placket with three buttons
      const pt = chin - 0.02 * HH, pb = sy + (garment === "kurta" ? 0.42 : 0.34) * HH;
      const pk: P2[] = [[plX - 4.5 * u, pt], [plX + 4.5 * u, pt], [plX + 4.5 * u, pb - 3 * u], [plX, pb], [plX - 4.5 * u, pb - 3 * u]];
      p.poly(pk, trim, 1.4 * u);
      for (let i = 0; i < 3; i++) { const y = chin + 0.1 * HH + i * ((pb - chin - 0.16 * HH) / 2); p.dot(plX, y, 2.2 * u, INK); p.dot(plX, y, 1.4 * u, o.buttons ?? "#f4e6c0"); }
      // chest embroidery / yoke seam
      p.stroke(curve([tcx - 0.8 * sw, sy + 0.04 * HH], [tcx, sy + 0.12 * HH], [tcx + 0.8 * sw, sy + 0.04 * HH]), 1.2 * u, mix(top, INK, 0.35));
    } else if (garment === "shirt") {
      p.stroke([[plX, chin], [plX + u, hem]], 1.4 * u, mix(top, INK, 0.45));
      for (let i = 0; i < 4; i++) p.dot(plX + 3.5 * u, chin + 0.12 * HH + i * 0.2 * HH, 2 * u, mix(top, "#ffffff", 0.6));
      const px = tcx - 0.45 * sw * (facing || 1), py = sy + 0.12 * HH;
      p.poly([[px - 8 * u, py], [px + 8 * u, py], [px + 8 * u, py + 13 * u], [px, py + 15 * u], [px - 8 * u, py + 13 * u]], null, 1.3 * u);
      p.stroke([[px - 8 * u, py + 3 * u], [px + 8 * u, py + 3 * u]], 1.1 * u, mix(top, INK, 0.4));
      p.stroke([[tcx - hw - 4 * u, hem - 4 * u], [tcx + hw + 4 * u, hem - 4 * u]], 1.2 * u, mix(top, INK, 0.4));
      if (o.trim) for (let i = -4; i <= 4; i++) p.stroke([[tcx + i * 0.1 * W, gtop], [tcx + i * 0.1 * W, hem + 6 * u]], 1.8 * u, mix(top, o.trim, 0.55));
    } else { // blouse: border at the hem
      p.stroke([[tcx - hw - 4 * u, hem - 4 * u], [tcx + hw + 4 * u, hem - 4 * u]], 3.6 * u, trim);
    }
    if (o.waist && !sit) { // cloth sash (kamarbandh)
      const y = torsoBot - 0.22 * HH;
      p.band([[tcx - hw - 6 * u, y + 2 * u], [tcx, y + 4 * u], [tcx + hw + 6 * u, y + 2 * u]], o.waist, 0.075 * HH, 1.2 * u);
      p.stroke([[tcx - hw - 6 * u, y + 3 * u], [tcx + hw + 6 * u, y + 3 * u]], 1.1 * u, mix(o.waist, INK, 0.35));
    }
  }, 0.5);
  if (cape) { /* collar hidden by the cape */ } else if (garment === "shirt") { // pointed collar
    for (const sd of [-1, 1]) p.poly(cw([[tcx + sd * 1 * u, chin - 2 * u], [tcx + sd * 17 * u, chin - 8 * u], [tcx + sd * 13 * u, chin + 0.09 * HH]]), mix(top, "#ffffff", 0.15), 1.6 * u);
  } else if (garment === "kurta" || garment === "jhabba") { // mandarin band collar ends peeking under the chin
    p.poly(cw([[plX - 15 * u, chin - 6 * u], [plX + 15 * u, chin - 6 * u], [plX + 13 * u, chin + 4 * u], [plX - 13 * u, chin + 4 * u]]), trim, 1.6 * u);
  }
  if (o.waist && !sit) { // knot + tails on the side away from the prop hand
    const sd = 1, y = torsoBot - 0.22 * HH, kx = tcx + sd * 0.55 * hw;
    for (const [dx, len, ang] of [[-3, 0.2, -16], [3, 0.17, 20]] as const) {
      const a0: P2 = [kx + dx * u, y + 4 * u], a1: P2 = [kx + dx * u + Math.sin(rad(ang)) * len * HH, y + len * HH];
      const t2 = cw(strip([a0, lerp2(a0, a1, 0.5), a1], 7 * u, 8.5 * u));
      p.gradFill(t2, o.waist, mul(o.waist, SH_CLOTH), light); p.inkRing(t2, 1.6 * u, thick, 0.3);
      p.stroke([[a1[0] - 4 * u, a1[1] - 3 * u], [a1[0] + 4 * u, a1[1] - 3 * u]], 1.1 * u, mix(o.waist, INK, 0.4));
    }
    p.ell(kx, y + 3 * u, 6.5 * u, 5.5 * u, o.waist, 1.6 * u);
  }
  // saree pallu: from the right hip over the left shoulder, border on both edges, falling behind
  if (!sit && lower === "saree") {
    const a: P2 = [tcx + 0.34 * W, chin + 0.62 * HH], m: P2 = [tcx - 0.05 * W, chin + 0.3 * HH], b2: P2 = [tcx - 0.62 * sw, chin - 0.02 * HH];
    const path = curve(a, m, b2, 14), pl = cw(strip(path, 20 * u, 24 * u));
    cloth(p, pl, clothCol, light, ow * 0.9, thick, () => {
      p.stroke(path.map(([x, y], i) => [x, y + (10 - i * 0.2) * u] as P2), 3.4 * u, trim);
      p.stroke(path.map(([x, y], i) => [x - 2 * u, y - (9 - i * 0.2) * u] as P2), 3.4 * u, trim);
      for (let i = 2; i < 13; i += 3) p.dot(path[i][0], path[i][1], 1.7 * u, mix(clothCol, "#ffffff", 0.45));
    });
  }
  // shawl: two panels hanging from the shoulders + the roll behind the neck
  if (o.shawl && !sit) {
    const sc = o.shawl;
    for (const sd of [-1, 1]) {
      const x0 = tcx + sd * 0.55 * sw, path: P2[] = curve([x0 + sd * 2 * u, chin - 0.06 * HH], [x0 + sd * 10 * u, sy + 0.2 * HH], [x0 + sd * 4 * u, sy + 0.66 * HH], 10);
      const sp = cw(strip(path, 22 * u, 20 * u));
      cloth(p, sp, sc, light, ow * 0.9, thick, () => {
        const e = path[path.length - 1];
        for (const k of [8, 13]) p.stroke([[e[0] - 14 * u, e[1] - k * u], [e[0] + 14 * u, e[1] - k * u]], 2 * u, mix(sc, "#f2d27a", 0.6));
        p.stroke(path.map(([x, y]) => [x - sd * 7 * u, y] as P2), 1.2 * u, mix(sc, INK, 0.35));
      });
      const e = path[path.length - 1];
      for (let i = -3; i <= 3; i++) p.stroke([[e[0] + i * 2.6 * u, e[1] + 1 * u], [e[0] + i * 2.6 * u + 0.5 * u, e[1] + 7 * u]], 1.3 * u, mix(sc, INK, 0.3));
    }
  }
  // barber's towel over the left shoulder
  if (o.towel && !sit) {
    const x0 = tcx - 0.72 * sw, path: P2[] = curve([x0 + 2 * u, sy - 0.1 * HH], [x0 - 3 * u, sy + 0.18 * HH], [x0 + 3 * u, sy + 0.5 * HH], 10);
    const tp = cw(strip(path, 21 * u, 23 * u));
    cloth(p, tp, o.towel, light, ow * 0.85, thick, () => {
      const e = path[path.length - 1], st = o.trim ?? "#d8433a";
      for (const k of [10, 15]) p.stroke([[e[0] - 16 * u, e[1] - k * u], [e[0] + 16 * u, e[1] - k * u]], 2.2 * u, st);
      p.stroke(path.map(([x, y]) => [x + 5 * u, y] as P2), 1.1 * u, mul(o.towel!, [0.82, 0.82, 0.88]));
    });
    const e = path[path.length - 1];
    for (let i = -4; i <= 4; i++) p.stroke([[e[0] + i * 2.3 * u, e[1] + 1 * u], [e[0] + i * 2.3 * u, e[1] + 6 * u]], 1.1 * u, INK);
    // the fold over the shoulder
    const fp = cw(strip(curve([x0 - 8 * u, sy - 0.02 * HH], [x0 - 2 * u, sy - 0.12 * HH], [x0 + 9 * u, sy - 0.09 * HH], 8), 14 * u, 18 * u));
    cloth(p, fp, o.towel, light, ow * 0.8, thick);
  }
  // ---------- barber cape (sit) ----------
  if (cape) {
    const tp0 = chin - 0.02 * HH, bot = sole - 0.42 * HH, cp: P2[] = [];
    const cR = (sd: number): P2[] => [...curve([300 + sd * 0.12 * W, tp0], [300 + sd * 0.42 * W, tp0 + 0.02 * HH], [300 + sd * 0.5 * W, tp0 + 0.22 * HH], 8),
      ...curve([300 + sd * 0.5 * W, tp0 + 0.22 * HH], [300 + sd * 0.6 * W, (tp0 + bot) / 2 + 0.1 * HH], [300 + sd * 0.64 * W, bot], 8).slice(1)];
    cp.push(...cR(1));
    for (let i = 1; i < 30; i++) { const x = 300 + 0.64 * W - (1.28 * W * i) / 30; cp.push([x, bot + 4 * u * Math.sin(i * 0.95) + 2 * u]); }
    cp.push(...cR(-1).reverse());
    cloth(p, cw(cp), "#f7f8fc", light, ow, thick, () => {
      for (let i = -8; i <= 8; i++) p.stroke([[300 + i * 0.07 * W, tp0], [300 + i * 0.085 * W, bot + 8 * u]], 1.6 * u, "#d6e2f3");
      for (const sd of [-1, 1]) for (const k of [0.25, 0.48]) p.stroke(curve([300 + sd * k * W, tp0 + 0.3 * HH], [300 + sd * (k + 0.03) * W, (tp0 + bot) / 2 + 0.2 * HH], [300 + sd * (k + 0.06) * W, bot + 4 * u]), 2 * u, "#b9c6dc");
    }, 0.4);
    p.poly(cw([[300 - 16 * u, tp0 - 4 * u], [300 + 16 * u, tp0 - 4 * u], [300 + 15 * u, tp0 + 5 * u], [300 - 15 * u, tp0 + 5 * u]]), "#ffffff", 1.6 * u);
  }
  // ---------- arms in front with props ----------
  for (const a of arms) if (a.front && !cape) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "cane") {
      p.band([[hx + 2 * u, hy - 4 * u], [hx + 10 * u, sole - 2 * u]], "#8a5a34", 3.6 * u, 1.2 * u, "round");
      p.band(curve([hx + 2 * u, hy - 4 * u], [hx - 4 * u, hy - 16 * u], [hx - 12 * u, hy - 8 * u], 6), "#8a5a34", 3.6 * u, 1.2 * u, "round");
      p.dot(hx, hy, 4.8 * u);
    } else if (Array.isArray(prop) && prop[0] === "scissors") {
      const op = 10 + 22 * Math.abs(Math.sin(prop[1] * 9));
      for (const s2 of [-1, 1]) {
        const R2 = (pts: P2[]) => rotPts(pts, rad(-35 + s2 * op / 2), hx, hy);
        p.poly(R2([[hx, hy - 2.5 * u], [hx + 40 * u, hy - 0.8 * u], [hx + 40 * u, hy + 0.8 * u], [hx, hy + 2.5 * u]]), "#dfe5ea", 1.4 * u);
        const [rx, ry] = R2([[hx - 11 * u, hy + s2 * 5 * u]])[0];
        p.ell(rx, ry, 7 * u, 5 * u, null, 3 * u); p.arc(rx, ry, 7 * u, 5 * u, 0, 360, 1.8 * u, "#d8433a");
      }
      p.dot(hx, hy, 4.8 * u);
    } else if (Array.isArray(prop) && prop[0] === "comb") {
      const Rh = (pts: P2[]) => rotPts(pts, rad(-15), hx, hy);
      p.poly(Rh([[hx - 5 * u, hy - 26 * u], [hx + 26 * u, hy - 26 * u], [hx + 26 * u, hy - 19 * u], [hx - 5 * u, hy - 19 * u]]), "#d8433a", 1.5 * u);
      for (let i = 0; i < 8; i++) p.stroke(Rh([[hx - 2.5 * u + i * 3.8 * u, hy - 19 * u], [hx - 2.5 * u + i * 3.8 * u, hy - 12 * u]]), 1.4 * u, "#d8433a");
      p.dot(hx, hy, 4.8 * u);
    } else if (Array.isArray(prop) && prop[0] === "point") {
      p.stroke([[hx, hy], [hx - 9 * u, hy - 8 * u]], 3.4 * u, INK); p.dot(hx, hy, 4.8 * u);
    } else p.dot(hx, hy, 4.8 * u);
  }
  // ---------- head ----------
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hairBehind(p, o, H, 300, hc, light, thick, facing);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a, 0.45, 1.0, 1.3);
  p.inkRing(hp, ow, thick, 0.55);
  if (o.hat === "hair" || o.hairStyle) hairV3(p, o, H, 300, hc, light, thick, seed, facing, skin);
  else if (o.hat) hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  faceFront(p, 300, hc, W, expr, facing, look, lid, false, skin, o.moustache, stout || o.mous === "bushy");
  const fx = 300 + 7 * u * facing;
  if (o.bindi) { p.dot(fx, hc - 27 * u, 2.8 * u, INK); p.dot(fx, hc - 27 * u, 2.1 * u, o.bindi); }
  if (o.specs) {
    for (const sd of [-1, 1]) p.ell(fx + sd * 13 * u, hc + u, 9.5 * u, 8.5 * u, null, 1.8 * u);
    p.arc(fx, hc - u, 3.5 * u, 2.5 * u, 200, 340, 1.6 * u);
  }
  if (o.hairStyle === "bald") { // forehead lines
    p.arc(fx, hc - 32 * u, 14 * u, 3 * u, 200, 340, 1.2 * u, mix(skin, INK, 0.45));
    p.arc(fx, hc - 38 * u, 11 * u, 2.5 * u, 205, 335, 1.2 * u, mix(skin, INK, 0.45));
  }
  p.rot = null;
};

export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push"; blink?: boolean | number; stomp?: number; pose?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 5.8 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};
