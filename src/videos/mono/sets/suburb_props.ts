// SUBURB set: 1990s American houses, cars, fences, mailboxes, power poles (local frames: front face at z = 0 looking +z).
import * as THREE from "three";
import { Put, C, lam, V, tri, quad, U, pick, roofHD, SHT, Mat, rodGeo } from "../kit";
import { brick } from "../paint";
import { sidingTex, concreteTex, garageTex, doorTex, windowTex, louvreTex, TX, woodPanelTex } from "./suburb_tex";
import type { V3 } from "../core";

export const SID = (col: string) => lam("sid" + col, () => ({ map: sidingTex(col) }));
export const CONC = (col = "#d9cfbf") => lam("conc" + col, () => ({ map: concreteTex(col) }));
export const SHING = (col: string) => lam("shing" + col, () => ({ map: roofHD(col, true) }));
export const BRICK = () => lam("brickS", () => ({ map: brick() }));
export const GAR = (col: string) => lam("gar" + col, () => ({ map: garageTex(col) }));
export const DOOR = (col: string) => lam("door" + col, () => ({ map: doorTex(col) }));
export const WIN = (cur: string | null, warm = false) => lam("win" + cur + warm, () => ({ map: windowTex(cur, warm) }));
export const LOUV = (col: string) => lam("louv" + col, () => ({ map: louvreTex(col) }));
export const WOODP = () => lam("woodpanel", () => ({ map: woodPanelTex() }));
export const TRIM = "#f4efe4";

export type HO = {
  kind: "colonial" | "ranch" | "gable"; w: number; wall: string; roof: string; shut: string; door: string; garage: -1 | 0 | 1;
  brick?: boolean; curtain?: string | null; hoop?: boolean; garCol?: string; warm?: boolean;
};
export const window1 = (P: Put, o: HO, cx: number, y0: number, ww = 0.95, wh = 1.45, shutters = true) => {
  P.box(WIN(o.curtain ?? null, o.warm), cx - ww / 2, cx + ww / 2, y0, y0 + wh, -0.05, 0.04);
  P.box(C(TRIM), cx - ww / 2 - 0.12, cx + ww / 2 + 0.12, y0 - 0.1, y0, -0.05, 0.12);           // sill
  P.box(C(TRIM), cx - ww / 2 - 0.1, cx + ww / 2 + 0.1, y0 + wh, y0 + wh + 0.14, -0.05, 0.08);   // head
  if (shutters) for (const s of [-1, 1]) { const x = cx + s * (ww / 2 + 0.24); P.box(LOUV(o.shut), x - 0.2, x + 0.2, y0, y0 + wh, -0.05, 0.06); }
};
/** gable roof, ridge along x, front eave at zF (y = h), back eave at zB, ridge at zR; gable triangles in wallMat */
const gableX = (P: Put, roof: Mat, wall: Mat, x0: number, x1: number, zF: number, zB: number, h: number, rise: number, ov = 0.45) => {
  const zR = (zF + zB) / 2, k = rise / (zF - zR);
  P.slab(roof, x0 - ov, x1 + ov, zF + ov, h - ov * k, zR, h + rise, 0.16, 4);
  P.slab(roof, x1 + ov, x0 - ov, zB - ov, h - ov * k, zR, h + rise, 0.16, 4);
  P.geo(tri(V(x1, h, zF), V(x1, h, zB), V(x1, h + rise, zR)), wall); P.geo(tri(V(x0, h, zF), V(x0, h + rise, zR), V(x0, h, zB)), wall);
  P.box(C(TRIM), x0 - ov, x1 + ov, h - ov * k - 0.2, h - ov * k, zF + ov - 0.06, zF + ov + 0.02);
  P.box(C("#4a3c40"), x0 - ov - 0.05, x1 + ov + 0.05, h + rise - 0.04, h + rise + 0.1, zR - 0.12, zR + 0.12);
};
/** gable roof with its ridge running front-to-back (gable faces the street) */
const gableZ = (P: Put, roof: Mat, wall: Mat, x0: number, x1: number, zF: number, zB: number, h: number, rise: number, ov = 0.45) => {
  const xc = (x0 + x1) / 2, hw = (x1 - x0) / 2, k = rise / hw, R = P.at(0, 0, Math.PI / 2); // frame-x -> -z, frame-z -> +x
  R.slab(roof, -(zF + ov), -(zB - ov), x0 - ov, h - ov * k, xc, h + rise, 0.16, 4);
  R.slab(roof, -(zB - ov), -(zF + ov), x1 + ov, h - ov * k, xc, h + rise, 0.16, 4);
  P.geo(tri(V(x0, h, zF), V(x1, h, zF), V(xc, h + rise, zF)), wall); P.geo(tri(V(x1, h, zB), V(x0, h, zB), V(xc, h + rise, zB)), wall);
  P.geo(rodGeo([x0 - ov, h - ov * k + 0.02, zF + ov - 0.02], [xc, h + rise + 0.05, zF + ov - 0.02], 0.08, 4), C(TRIM));
  P.geo(rodGeo([x1 + ov, h - ov * k + 0.02, zF + ov - 0.02], [xc, h + rise + 0.05, zF + ov - 0.02], 0.08, 4), C(TRIM));
};
const porch = (P: Put, x0: number, x1: number, d: number, hy: number, roofMat: Mat, posts: number, railCol = TRIM) => {
  const deck = 0.5, t = C(TRIM);
  P.box(C("#b8aaa0"), x0, x1, 0, deck, 0, d);                              // deck block
  P.box(lam("deckw", () => ({ color: "#9a7a62" })), x0 - 0.03, x1 + 0.03, deck - 0.05, deck, -0.01, d + 0.03);
  const cx = (x0 + x1) / 2;
  for (let s = 0; s < 3; s++) P.box(CONC(), cx - 0.8, cx + 0.8, 0, deck - (s + 1) * 0.16, d, d + 0.3 * (s + 1));
  const xs: number[] = []; for (let i = 0; i < posts; i++) xs.push(x0 + 0.12 + ((x1 - x0 - 0.24) * i) / (posts - 1));
  for (const x of xs) P.box(t, x - 0.08, x + 0.08, deck, hy, d - 0.22, d - 0.06);
  P.box(t, x0, x1, hy - 0.22, hy, d - 0.26, d - 0.02);
  P.slab(roofMat, x0 - 0.15, x1 + 0.15, d + 0.25, hy, -0.1, hy + 0.55, 0.12, 4);
  // railings either side of the steps
  for (const [a, b] of [[x0 + 0.12, cx - 0.85], [cx + 0.85, x1 - 0.12]]) {
    if (b - a < 0.3) continue;
    P.box(C(railCol), a, b, deck + 0.82, deck + 0.9, d - 0.2, d - 0.08);
    P.box(C(railCol), a, b, deck + 0.08, deck + 0.14, d - 0.18, d - 0.1);
    for (let x = a + 0.1; x < b - 0.04; x += 0.16) P.box(C(railCol), x - 0.025, x + 0.025, deck + 0.14, deck + 0.82, d - 0.16, d - 0.12);
  }
};
const chimney = (P: Put, x: number, z: number, top: number) => {
  P.box(BRICK(), x - 0.4, x + 0.4, 0, top, z - 0.35, z + 0.35, 1.2);
  P.box(C("#6a5a58"), x - 0.48, x + 0.48, top, top + 0.14, z - 0.43, z + 0.43);
};
let LO = false;
const bushes = (P: Put, r: () => number, x0: number, x1: number, z: number) => {
  if (LO) return;
  for (let x = x0; x < x1; x += U(r, 0.7, 1.1)) P.geo(new THREE.IcosahedronGeometry(U(r, 0.38, 0.55), 1).scale(1, 0.8, 0.9).translate(x, 0.35, z + U(r, -0.1, 0.1)), C(pick(r, ["#4f8a3e", "#3f7a3a", "#5e9a44"])));
};
const hoop = (P: Put, x: number, y: number) => {
  P.box(C("#f4f1ea"), x - 0.6, x + 0.6, y, y + 0.8, 0.0, 0.05);
  P.box(C("#d8433a"), x - 0.25, x + 0.25, y + 0.12, y + 0.16, 0.05, 0.07);
  P.geo(new THREE.TorusGeometry(0.23, 0.02, 6, 18).rotateX(Math.PI / 2).translate(x, y + 0.1, 0.32), C("#e86a2a"));
};
/** a whole house in its lot frame (front face at z = 0, street at +z) */
export const house = (P: Put, o: HO, r: () => number, lo = false) => {
  LO = lo;
  const hw = o.w / 2, D = o.kind === "gable" ? 10 : 8.5, wall = o.brick ? BRICK() : SID(o.wall), sid = SID(o.wall), roof = SHING(o.roof), t = C(TRIM);
  const found = C("#a49a92");
  if (o.kind === "colonial") {
    const h = 5.6;
    P.box(found, -hw - 0.04, hw + 0.04, 0, 0.5, -D, 0.04);
    P.box(sid, -hw, hw, 0.5, h, -D, 0, 2);
    for (const x of [-hw, hw]) P.box(t, x - 0.1, x + 0.1, 0.5, h, -0.1, 0.06);
    P.box(t, -hw - 0.05, hw + 0.05, h - 0.25, h, -D, 0.07);
    gableX(P, roof, sid, -hw, hw, 0, -D, h, 2.3);
    const n = o.w > 9.5 ? 3 : 2;
    for (let i = 0; i < n; i++) window1(P, o, -hw + ((i + 0.5) * o.w) / n, 3.4, 0.95, 1.35);
    for (const s of [-1, 1]) window1(P, o, s * (hw * 0.62), 1.1, 0.95, 1.5);
    P.box(t, -0.72, 0.72, 0.5, 2.85, -0.04, 0.1); P.box(DOOR(o.door), -0.52, 0.52, 0.5, 2.62, -0.02, 0.12);
    porch(P, -hw * 0.45 - 0.5, hw * 0.45 + 0.5, 2.2, 3.05, roof, 4);
    chimney(P, -hw + 0.45, -D * 0.5, h + 3.0);
    bushes(P, r, -hw + 0.3, -hw * 0.45 - 0.6, 0.6); bushes(P, r, hw * 0.45 + 0.7, hw - 0.2, 0.6);
  } else if (o.kind === "ranch") {
    const h = 3.0;
    P.box(found, -hw - 0.04, hw + 0.04, 0, 0.35, -D, 0.04);
    P.box(wall, -hw, hw, 0.35, o.brick ? 1.3 : h, -D, 0, o.brick ? 1.2 : 2);
    if (o.brick) P.box(sid, -hw, hw, 1.3, h, -D, -0.02, 2);
    P.box(t, -hw - 0.05, hw + 0.05, h - 0.2, h, -D, 0.07);
    gableX(P, roof, sid, -hw, hw, 0, -D, h, 1.7, 0.7);
    // picture window + two small ones + door under a deep eave
    P.box(WIN(o.curtain ?? null, o.warm), -hw * 0.55 - 1.1, -hw * 0.55 + 1.1, 1.0, 2.4, -0.05, 0.04);
    P.box(t, -hw * 0.55 - 1.25, -hw * 0.55 + 1.25, 0.9, 1.0, -0.05, 0.14);
    window1(P, o, hw * 0.12 + 0.9, 1.2, 0.9, 1.2);
    P.box(t, -0.62 + hw * 0.12 - 0.6, 0.62 + hw * 0.12 - 0.6, 0.35, 2.5, -0.04, 0.1); P.box(DOOR(o.door), -0.45 + hw * 0.12 - 0.6, 0.45 + hw * 0.12 - 0.6, 0.35, 2.4, -0.02, 0.12);
    P.box(CONC(), hw * 0.12 - 1.5, hw * 0.12 + 0.3, 0, 0.3, 0, 1.4);
    P.box(CONC(), hw * 0.12 - 1.2, hw * 0.12 + 0.0, 0, 0.15, 1.4, 1.8);
    chimney(P, hw * 0.3, -D * 0.5, h + 2.4);
    bushes(P, r, -hw + 0.3, -hw * 0.55 + 1.2, 0.6);
  } else {
    const h = 3.2;
    P.box(found, -hw - 0.04, hw + 0.04, 0, 0.5, -D, 0.04);
    P.box(sid, -hw, hw, 0.5, h, -D, 0, 2);
    for (const x of [-hw, hw]) P.box(t, x - 0.1, x + 0.1, 0.5, h, -0.1, 0.06);
    gableZ(P, roof, sid, -hw, hw, 0, -D, h, 3.0);
    window1(P, o, 0, h + 0.7, 0.8, 1.0, false);
    window1(P, o, -hw * 0.5, 1.2, 0.95, 1.45);
    P.box(t, hw * 0.35 - 0.68, hw * 0.35 + 0.68, 0.5, 2.85, -0.04, 0.1); P.box(DOOR(o.door), hw * 0.35 - 0.5, hw * 0.35 + 0.5, 0.5, 2.62, -0.02, 0.12);
    porch(P, -hw + 0.1, hw - 0.1, 2.4, 3.0, roof, 4);
    bushes(P, r, -hw + 0.2, hw - 0.2, -0.3 + 3.2);
  }
  // attached garage
  if (o.garage) {
    const gw = 6.2, gx0 = o.garage > 0 ? hw : -hw - gw, gx1 = gx0 + gw, gh = 2.9, gz = -0.6;
    P.box(found, gx0, gx1, 0, 0.2, -7, gz + 0.04);
    P.box(sid, gx0, gx1, 0.2, gh, -7, gz, 2);
    P.box(t, gx0 - 0.05, gx1 + 0.05, gh - 0.2, gh, -7, gz + 0.07);
    gableX(P, roof, sid, gx0, gx1, gz, -7, gh, 1.4, 0.4);
    P.box(t, (gx0 + gx1) / 2 - 2.55, (gx0 + gx1) / 2 + 2.55, 0.0, 2.4, gz - 0.02, gz + 0.06);
    P.box(GAR(o.garCol ?? "#f1ece0"), (gx0 + gx1) / 2 - 2.4, (gx0 + gx1) / 2 + 2.4, 0.0, 2.25, gz - 0.02, gz + 0.09);
    if (o.hoop) hoop(P.at(0, gz + 0.1), (gx0 + gx1) / 2, gh + 0.25);
  }
};
export const garageX = (o: HO) => (o.garage ? (o.garage > 0 ? o.w / 2 + 3.1 : -o.w / 2 - 3.1) : o.w / 2 + 2.2);

// ---------------- street furniture ----------------
export const picket = (P: Put, x0: number, x1: number, col = "#f4f1ea") => {
  const m = C(col);
  P.box(m, x0, x1, 0.3, 0.37, -0.06, -0.02); P.box(m, x0, x1, 0.7, 0.77, -0.06, -0.02);
  for (let x = x0 + 0.05; x < x1 - 0.03; x += 0.16) {
    P.box(m, x - 0.045, x + 0.045, 0, 0.98, -0.02, 0.02);
  }
  for (const x of [x0, x1]) P.box(m, x - 0.06, x + 0.06, 0, 1.02, -0.08, 0.04);
};
export const mailbox = (P: Put, col: string, r: () => number) => {
  P.box(C("#6e5444"), -0.05, 0.05, 0, 1.0, -0.05, 0.05);
  P.box(C(col), -0.13, 0.13, 1.0, 1.18, -0.28, 0.28);
  P.geo(new THREE.CylinderGeometry(0.13, 0.13, 0.56, 12, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(0, 1.18, 0), C(col));
  P.box(C("#d8433a"), 0.13, 0.15, 1.08, 1.2, -0.05, 0.0); if (r() < 0.6) P.box(C("#d8433a"), 0.13, 0.15, 1.2, 1.38, -0.05, 0.02);
};
export const flamingo = (P: Put) => {
  const pk = C("#f07aa8");
  P.rod(C("#2a2a2e"), [0, 0, 0], [0, 0.45, 0], 0.012, 4); P.rod(C("#2a2a2e"), [0.05, 0, 0], [0.02, 0.45, 0], 0.012, 4);
  P.geo(new THREE.SphereGeometry(1, 12, 8).scale(0.2, 0.12, 0.1).translate(0.03, 0.55, 0), pk);
  P.rod(pk, [0.15, 0.58, 0], [0.2, 0.85, 0], 0.025, 6);
  P.geo(new THREE.SphereGeometry(0.05, 8, 6).translate(0.21, 0.88, 0), pk); P.box(C("#2a2a2e"), 0.24, 0.32, 0.85, 0.88, -0.015, 0.015);
};
export const LEAF2 = ["#5a9a3e", "#4a8a38", "#6aac48", "#3e7c36"];
export const oak = (P: Put, r: () => number, x: number, z: number, s: number, leaf = LEAF2) => {
  const bark = C("#6a4c3e");
  P.geo(new THREE.CylinderGeometry(0.18 * s, 0.3 * s, 3.4 * s, 9).translate(x, 1.7 * s, z), bark);
  for (let i = 0; i < 3; i++) { const a = U(r, 0, 6.28); P.rod(bark, [x, 2.8 * s, z], [x + Math.cos(a) * 1.3 * s, 4.2 * s, z + Math.sin(a) * 1.3 * s], 0.1 * s); }
  for (let i = 0; i < 6; i++) {
    const a = r() * 6.28, d = r() * 1.5 * s, rr = (1.1 + r() * 0.7) * s;
    P.geo(new THREE.IcosahedronGeometry(rr, 1).scale(1, 0.82, 1).translate(x + Math.cos(a) * d, (4.3 + r() * 1.7) * s, z + Math.sin(a) * d), C(leaf[i % leaf.length]));
  }
};
export const pine = (P: Put, x: number, z: number, s: number) => {
  P.geo(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.4 * s, 7).translate(x, 0.7 * s, z), C("#5a4034"));
  for (let k = 0; k < 4; k++) P.geo(new THREE.ConeGeometry((1.7 - k * 0.35) * s, 2.0 * s, 9).translate(x, (1.6 + k * 1.15) * s, z), C(k % 2 ? "#2f6a44" : "#3a7a4c"));
};
/** utility pole at (x, z) with a cross-arm along z; returns the 3 wire attach points */
export const pole = (P: Put, x: number, z: number, tx = false): V3[] => {
  const w = C("#7a6656"), H = 9.5;
  P.geo(new THREE.CylinderGeometry(0.13, 0.17, H, 8).translate(x, H / 2, z), w);
  P.box(w, x - 0.08, x + 0.08, H - 0.8, H - 0.62, z - 1.2, z + 1.2);
  const pts: V3[] = [];
  for (const dz of [-1.0, 0, 1.0]) { const zz = z + dz * (dz ? 1 : 0); P.geo(new THREE.CylinderGeometry(0.05, 0.06, 0.18, 6).translate(x, H - 0.53, zz), C("#5a7a6a")); pts.push([x, H - 0.45, zz]); }
  pts[1] = [x, H - 0.45, z]; // centre insulator sits on the pole top line
  if (tx) { P.geo(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12).translate(x + 0.4, H - 2.2, z), C("#8a8f96")); P.geo(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 12).translate(x + 0.4, H - 1.72, z), C("#6a6f76")); }
  return pts;
};
export const wire = (P: Put, a: V3, b: V3, sag: number) => {
  const N = 8; let prev = a;
  for (let i = 1; i <= N; i++) {
    const t = i / N, p: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
    P.rod(C("#2a2430"), prev, p, 0.022, 4); prev = p;
  }
};

// ---------------- 1990s cars (local frame: length along z, nose at +z, wheels on y = 0) ----------------
export type CarKind = "sedan" | "wagon" | "van" | "police" | "tvvan" | "fbi";
const prof = (pts: [number, number][], width: number) => {
  const s = new THREE.Shape(); pts.forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y)));
  // shape is in (z, y); extrude along +x then rotate so the shape's x becomes world z
  return new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false }).translate(0, 0, -width / 2).rotateY(-Math.PI / 2);
};
export const policeTx = () => TX("police", 512, 128, (g) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#1d2a5a"; g.font = "900 72px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("POLICE", 256, 66, 460);
});
export const tvTx = () => TX("tvlogo", 1024, 400, (g) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 1024, 400);
  g.fillStyle = "#d8433a"; g.fillRect(0, 290, 1024, 40); g.fillStyle = "#2f6fd6"; g.fillRect(0, 340, 1024, 30);
  g.fillStyle = "#2f6fd6"; g.beginPath(); g.arc(190, 150, 120, 0, 7); g.fill(); g.lineWidth = 12; g.strokeStyle = "#1a1014"; g.stroke();
  g.fillStyle = "#ffffff"; g.font = "900 130px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TV", 190, 156);
  g.fillStyle = "#1a1014"; g.font = "900 120px Arial Black, Arial"; g.textAlign = "left"; g.fillText("CHANNEL 8", 340, 110, 660);
  g.fillStyle = "#d8433a"; g.font = "900 86px Arial Black, Arial"; g.fillText("WINNER WATCH", 340, 222, 660);
});
export const car = (P: Put, kind: CarKind, col: string) => {
  const body = C(col), glass = C("#3f4a72"), blk = C("#26222a"), chrome = C("#c9ccd2");
  const W = kind === "van" || kind === "tvvan" ? 1.95 : 1.8, L = kind === "tvvan" ? 2.9 : 2.45;
  const lower: [number, number][] = kind === "tvvan"
    ? [[-L, 0.32], [L, 0.32], [L, 0.95], [L - 0.5, 1.15], [-L, 1.15]]
    : [[-L, 0.3], [L, 0.3], [L, 0.82], [L - 1.25, 0.95], [-L + 0.15, 0.98], [-L, 0.92]];
  P.geo(prof(lower, W), kind === "police" ? C("#1d1d24") : body);
  const cab: [number, number][] =
    kind === "van" ? [[L, 0.85], [L - 0.6, 1.05], [L - 1.4, 1.72], [-L + 0.05, 1.78], [-L, 0.95]] :
    kind === "tvvan" ? [[L - 0.5, 1.1], [L - 1.1, 2.0], [-L, 2.1], [-L, 1.1]] :
    kind === "wagon" ? [[L - 1.3, 0.94], [L - 2.0, 1.42], [-L + 0.1, 1.42], [-L + 0.05, 0.97]] :
    [[L - 1.3, 0.94], [L - 1.95, 1.42], [-L + 1.6, 1.42], [-L + 0.75, 0.97]];
  P.geo(prof(cab, W - 0.12), glass);
  if (kind === "tvvan") {
    P.box(body, -W / 2 + 0.02, W / 2 - 0.02, 1.1, 2.1, -L, L - 1.2);                  // box body over the glass
    P.box(tvTx(), -W / 2 - 0.01, W / 2 + 0.01, 1.05, 1.95, -L + 0.2, L - 1.45);
    P.geo(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6).translate(0, 2.55, -0.8), chrome);
    P.geo(new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3).rotateX(-1.0).translate(0, 3.0, -0.8), C("#e9e6dc"));
  } else {
    // roof + pillars in body colour
    const rz0 = cab[2][0], rz1 = cab[1][0];
    P.box(body, -W / 2 + 0.06, W / 2 - 0.06, cab[1][1] - 0.04, cab[1][1] + 0.06, Math.min(rz0, rz1), Math.max(rz0, rz1));
    if (kind !== "van") P.box(body, -W / 2 + 0.05, W / 2 - 0.05, 0.95, cab[1][1], -0.05, 0.08);
  }
  if (kind === "wagon") for (const s of [-1, 1]) P.box(WOODP(), s * W / 2 - 0.02, s * W / 2 + 0.02, 0.45, 0.85, -L + 0.3, L - 0.5);
  if (kind === "police") {
    P.box(C("#f4f1ea"), -W / 2 + 0.01, W / 2 - 0.01, 0.62, 0.97, -1.25, 0.9);
    P.box(policeTx(), -W / 2 - 0.005, W / 2 + 0.005, 0.5, 0.82, -1.15, 0.8);
    P.box(C("#2a2a30"), -0.7, 0.7, 1.48, 1.56, -0.4, -0.1);
    P.box(C("#e8323a"), -0.68, -0.05, 1.56, 1.7, -0.38, -0.12); P.box(C("#2f5fe8"), 0.05, 0.68, 1.56, 1.7, -0.38, -0.12);
  }
  if (kind === "fbi") P.geo(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 10).translate(-0.4, 1.5, 0.5), C("#e8323a"));
  for (const z of [-L + 0.75, L - 0.8]) for (const s of [-1, 1]) {
    P.geo(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14).rotateZ(Math.PI / 2).translate(s * (W / 2 - 0.08), 0.33, z), blk);
    P.geo(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 12).rotateZ(Math.PI / 2).translate(s * (W / 2 + 0.05), 0.33, z), chrome);
  }
  P.box(chrome, -W / 2, W / 2, 0.25, 0.42, L - 0.02, L + 0.1); P.box(chrome, -W / 2, W / 2, 0.25, 0.42, -L - 0.1, -L + 0.02);
  for (const s of [-1, 1]) { P.box(C("#fff4c8"), s * W / 2 - (s > 0 ? 0.42 : -0.06), s * W / 2 - (s > 0 ? 0.06 : -0.42), 0.55, 0.72, L - 0.02, L + 0.02); P.box(C("#c8323c"), s * W / 2 - (s > 0 ? 0.42 : -0.06), s * W / 2 - (s > 0 ? 0.06 : -0.42), 0.55, 0.75, -L - 0.02, -L + 0.02); }
};
