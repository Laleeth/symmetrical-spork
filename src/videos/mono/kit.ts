// Shared world kit: painted textures, materials, the Put batch writer and reusable props/buildings.
// Set files (sets/*.ts) import from here and may add their own painters/props locally.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, tri } from "./build";
import { ctex, rep, rng, stoneHD, cloudHD, roofHD, jit } from "./paint";
import { Pen, mix, INK } from "./toon";
import { V3, clamp01 } from "./core";
import { NOINK } from "./ink";
export { Batch, boxGeo, V, lam, quad, tri, ctex, rep, rng, stoneHD, cloudHD, roofHD, jit, Pen, mix, INK };
export const KERB = 0.15;
export const U = (r: () => number, a: number, b: number) => a + (b - a) * r();
// ---------------- painted textures (reference style: flat colour fields, soft big tone drift, thin dark seams) ----------------
export const blot = (g: CanvasRenderingContext2D, x: number, y: number, rad: number, rgb: string, a: number) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
};
/** draw fn at every wrapped copy of (x, y) that touches the W x H tile (seamless repeats) */
export const W9 = (W: number, H: number, x: number, y: number, rad: number, fn: (x: number, y: number) => void) => {
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) if (x + dx + rad > 0 && x + dx - rad < W && y + dy + rad > 0 && y + dy - rad < H) fn(x + dx, y + dy);
};
export const SEAM = "#2a160e";
/** plaster wall, 512 px = 2.5 m: flat paint, big soft light/dark drift, damp streaks, hairline cracks, chipped patches */
export const plasterTex = (col: string) => ctex("plas" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 70, 180), light = r() > 0.45; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,250,232" : "120,70,40", light ? 0.14 : 0.12)); }
  for (let i = 0; i < 4; i++) { const x = U(r, 20, 480), y = U(r, 0, 300), l = U(r, 90, 200), w = U(r, 12, 34); const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, "rgba(80,50,35,0.2)"); gr.addColorStop(1, "rgba(80,50,35,0)"); g.fillStyle = gr; g.fillRect(x, y, w, l); }
  g.strokeStyle = "rgba(45,25,20,0.55)"; g.lineWidth = 2; g.lineCap = "round";
  for (let i = 0; i < 3; i++) { let x = U(r, 40, 470), y = U(r, 30, 380); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += U(r, -16, 16); y += U(r, 8, 22); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 2; i++) {
    const x = U(r, 50, 440), y = U(r, 50, 440), w = U(r, 34, 64), h = U(r, 20, 32);
    g.fillStyle = "#b85d3c"; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(70,30,20,0.55)"; g.fillRect(x - w * 0.35, y - 1, w * 0.7, 2.5); g.fillRect(x - 2, y - h * 0.4, 2.5, h * 0.38);
    g.strokeStyle = "rgba(45,25,20,0.75)"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, 0, 0, 7); g.stroke();
  }
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,250,235" : "90,60,40"},${U(r, 0.08, 0.2)})`; g.fillRect(U(r, 0, 512), U(r, 0, 512), U(r, 1.5, 3.5), U(r, 1.5, 3.5)); }
});
/** vertical boards (doors, shutters, crates, benches), 256 x 512, 4 boards with near-black seams */
export const woodTex = (col: string) => ctex("wood" + col, 256, 512, (g, r) => {
  const B = 64;
  for (let i = 0; i < 4; i++) {
    g.fillStyle = jit(r, col, 0.08, 3, 0.1); g.fillRect(i * B, 0, B, 512);
    for (let k = 0; k < 5; k++) { g.strokeStyle = r() < 0.3 ? "rgba(255,235,200,0.2)" : "rgba(60,30,10,0.28)"; g.lineWidth = U(r, 1.5, 3); const x = i * B + U(r, 8, B - 8); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + U(r, -6, 6), 170, x + U(r, -6, 6), 340, x + U(r, -4, 4), 512); g.stroke(); }
    g.fillStyle = "rgba(255,235,200,0.28)"; g.fillRect(i * B + 4, 0, 3, 512);
  }
  g.fillStyle = SEAM; for (let i = 0; i <= 4; i++) g.fillRect(i * B - 3, 0, 6, 512);
});
/** rolling shutter (horizontal slats), 256 px = 1 m */
export const shutterTex = (col: string) => ctex("shut" + col, 256, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) { g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(0, y + 2, 256, 4); g.fillStyle = "rgba(20,20,30,0.35)"; g.fillRect(0, y + 12, 256, 4); }
  for (let i = 0; i < 5; i++) { const x = U(r, 0, 256), y = U(r, 0, 256), rad = U(r, 20, 50); W9(256, 256, x, y, rad, (a, b) => blot(g, a, b, rad, "150,70,30", 0.35)); }
});
/** corrugated tin, 256 px = 1.5 m: ridges along the slope (v), a few rust patches, sheet laps */
export const tinTex = (col: string) => ctex("tin" + col, 256, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 21.33) { const gr = g.createLinearGradient(x, 0, x + 21.33, 0); gr.addColorStop(0, "rgba(255,255,255,0.28)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(15,20,35,0.3)"); g.fillStyle = gr; g.fillRect(x, 0, 21.33, 256); }
  for (let i = 0; i < 7; i++) { const x = U(r, 0, 256), y = U(r, 0, 256), rad = U(r, 18, 60); W9(256, 256, x, y, rad, (a, b) => blot(g, a, b, rad, "170,80,30", 0.45)); }
  g.fillStyle = "rgba(25,20,25,0.7)"; g.fillRect(0, 0, 256, 3); g.fillRect(0, 0, 3, 256);
});
/** dusty road across the street: u along the street (10 m per tile), v across it (0..1 = full width), two wheel ruts */
export const roadTex = () => ctex("road2", 1024, 512, (g, r) => {
  g.fillStyle = "#d6b088"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 26; i++) { const x = U(r, 0, 1024), y = U(r, 0, 512), rad = U(r, 50, 150), light = r() > 0.45; W9(1024, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,236,200" : "140,90,50", light ? 0.2 : 0.16)); }
  for (const y0 of [150, 360]) {
    g.fillStyle = "rgba(135,85,45,0.32)"; g.fillRect(0, y0 - 26, 1024, 52);
    for (const dy of [-18, 14]) { g.strokeStyle = "rgba(95,55,28,0.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(0, y0 + dy); for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y0 + dy + Math.sin(x * 0.0123 + y0) * 3); g.stroke(); }
    g.fillStyle = "rgba(255,235,200,0.22)"; g.fillRect(0, y0 - 3, 1024, 5);
  }
  for (let i = 0; i < 260; i++) { // pebbles: flat light stone with a dark rim
    const x = U(r, 0, 1024), y = U(r, 0, 512), rx = U(r, 2, 6), ry = rx * U(r, 0.5, 0.8);
    g.fillStyle = r() > 0.5 ? "#e6c79a" : "#a87c50"; g.beginPath(); g.ellipse(x, y, rx, ry, U(r, 0, 3), 0, 7); g.fill();
    g.strokeStyle = "rgba(70,40,20,0.6)"; g.lineWidth = 1.2; g.stroke();
  }
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "120,75,40" : "255,240,210"},${U(r, 0.12, 0.3)})`; g.fillRect(U(r, 0, 1024), U(r, 0, 512), U(r, 2, 4), U(r, 2, 3)); }
});
export const dirtTex = () => ctex("dirt2", 512, 512, (g, r) => {
  g.fillStyle = "#d0a87e"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 50, 130), light = r() > 0.5; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,236,200" : "140,90,50", 0.16)); }
  for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "120,75,40" : "255,240,210"},${U(r, 0.12, 0.3)})`; g.fillRect(U(r, 0, 512), U(r, 0, 512), U(r, 2, 4), U(r, 2, 3)); }
});
export const paveTex = () => stoneHD("paveHD", ["#d6b48c", "#cbaa84", "#dfc29c", "#c19f7b"], "#7b5e48");
/** woven rope bed (charpoy) */
export const ropeTex = () => ctex("rope", 256, 256, (g) => {
  g.fillStyle = "#e0bd7c"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(110,65,25,0.75)"; g.lineWidth = 3;
  for (let k = -256; k < 512; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.stroke(); g.beginPath(); g.moveTo(k, 256); g.lineTo(k + 256, 0); g.stroke(); }
});
export const signTex = (key: string, l1: string, l2: string, bg: string, fg: string) => ctex("sign" + key, 1400, 300, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1400, 300);
  g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(18, 18, 1364, 264);
  g.strokeStyle = "#1a1014"; g.lineWidth = 10; g.strokeRect(5, 5, 1390, 290);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 118px Arial Black, Arial, sans-serif"; g.fillText(l1, 700, 128, 1040);
  g.font = "700 64px Arial, sans-serif"; g.fillText(l2, 700, 232, 900);
  for (const x of [120, 1280]) { g.strokeStyle = fg; g.lineWidth = 10; g.beginPath(); g.arc(x - 22, 200, 22, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 22, 200, 22, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - 10, 180); g.lineTo(x + 40, 70); g.moveTo(x + 10, 180); g.lineTo(x - 40, 70); g.stroke(); }
  for (let i = 0; i < 8; i++) blot(g, 100 + i * 170, i % 2 ? 40 : 270, 90, "60,40,30", 0.12);
});
/** double-sided blade sign (scissors + name), shabby = faded, stained, chipped */
export const bladeTex = (l1: string, l2: string, bg: string, fg: string, shabby: boolean) => ctex("blade" + l1, 768, 420, (g, r) => {
  g.fillStyle = bg; g.fillRect(0, 0, 768, 420);
  g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(20, 20, 728, 380); g.strokeStyle = "#1a1014"; g.lineWidth = 12; g.strokeRect(6, 6, 756, 408);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 104px Arial Black, Arial, sans-serif"; g.fillText(l1, 384, 150, 680);
  g.font = "800 62px Arial, sans-serif"; g.fillText(l2, 384, 262, 640);
  g.strokeStyle = fg; g.lineWidth = 9; const x = 384; g.beginPath(); g.arc(x - 26, 352, 18, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 26, 352, 18, 0, 7); g.stroke();
  if (shabby) { for (let i = 0; i < 14; i++) blot(g, U(r, 0, 768), U(r, 0, 420), U(r, 30, 110), "70,50,30", 0.22); for (let i = 0; i < 5; i++) { g.fillStyle = "#b8a888"; g.beginPath(); g.ellipse(U(r, 30, 740), U(r, 30, 390), U(r, 14, 30), U(r, 8, 16), 0, 0, 7); g.fill(); } }
});
/** small painted shop board: name + a line, weathered */
export const boardTex = (l1: string, l2: string, bg: string, fg: string) => ctex("board" + l1 + bg, 1024, 256, (g, r) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 6; i++) blot(g, U(r, 0, 1024), U(r, 0, 256), U(r, 60, 140), r() > 0.5 ? "255,255,240" : "60,40,30", 0.13);
  g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(16, 16, 992, 224);
  g.strokeStyle = "#1a1014"; g.lineWidth = 10; g.strokeRect(5, 5, 1014, 246);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 104px Arial Black, Arial, sans-serif"; g.fillText(l1, 512, 108, 900);
  g.font = "700 48px Arial, sans-serif"; g.fillText(l2, 512, 196, 760);
});
export const poleTex = () => ctex("barberPole", 256, 512, (g) => {
  g.fillStyle = "#f6f3ec"; g.fillRect(0, 0, 256, 512);
  for (let k = -4; k < 12; k++) for (const [c, o] of [["#d8433a", 0], ["#2f6fd6", 64]] as const) {
    g.fillStyle = c; g.beginPath(); const y = k * 128 + o; g.moveTo(0, y); g.lineTo(256, y - 128); g.lineTo(256, y - 128 + 40); g.lineTo(0, y + 40); g.closePath(); g.fill();
  }
});
export const mirrorTex = () => ctex("mirror", 512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 512, 512); gr.addColorStop(0, "#bfe6f2"); gr.addColorStop(1, "#6fa9c4"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(80, 0); g.lineTo(200, 0); g.lineTo(40, 512); g.lineTo(0, 512); g.lineTo(0, 260); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(250, 0); g.lineTo(290, 0); g.lineTo(130, 512); g.lineTo(90, 512); g.closePath(); g.fill();
});
export const posterTex = (k: number) => ctex("poster" + k, 300, 420, (g) => {
  g.fillStyle = ["#f2c43b", "#e8668e", "#3fb7a8", "#7a6fe0"][k % 4]; g.fillRect(0, 0, 300, 420);
  const p = new Pen(g);
  p.ell(150, 170, 80, 92, "#f0c49a", 8); p.ell(150, 115, 86, 50, "#1f1a24", 8, 180, 360); p.dot(122, 170, 7); p.dot(178, 170, 7); p.arc(150, 200, 26, 12, 20, 160, 6);
  g.fillStyle = "#1f1a24"; g.font = "900 46px Arial Black, Arial"; g.textAlign = "center"; g.fillText(["STYLE", "NEW CUT", "SHAVE", "FASHION"][k % 4], 150, 330);
  g.font = "700 30px Arial"; g.fillText("₹ 40", 150, 380);
  g.strokeStyle = "#1f1a24"; g.lineWidth = 8; g.strokeRect(4, 4, 292, 412);
});
export const calendarTex = () => ctex("calendar", 300, 400, (g) => {
  g.fillStyle = "#fff8ec"; g.fillRect(0, 0, 300, 400); g.fillStyle = "#d8433a"; g.fillRect(0, 0, 300, 140);
  g.fillStyle = "#f2b23e"; g.beginPath(); g.arc(150, 70, 46, 0, 7); g.fill();
  g.fillStyle = "#333"; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) g.fillRect(25 + c * 44, 170 + r * 44, 26, 18);
});

// ---------------- world ----------------
export type Mat = THREE.Material;
export const Mx = (x: number, z: number, rot = 0, y = 0) => new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeRotationY(rot));
export const rodGeo = (a: V3, c: V3, rad: number, seg = 6) => {
  const A = V(...a), C2 = V(...c), d = C2.clone().sub(A), L = d.length();
  const g = new THREE.CylinderGeometry(rad, rad, L, seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()));
  return g.translate((A.x + C2.x) / 2, (A.y + C2.y) / 2, (A.z + C2.z) / 2);
};
/** batch writer in a local frame (x along the facade, front face at z = 0 looking +z, y up) */
export class Put {
  constructor(public b: Batch, public M: THREE.Matrix4) {}
  box(m: Mat, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tile = 0) { this.b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile, true), m, this.M); }
  geo(g: THREE.BufferGeometry, m: Mat) { this.b.add(g, m, this.M); }
  /** sloped slab from (zA, yA) to (zB, yB) across x0..x1, thickness t under the top surface */
  slab(m: Mat, x0: number, x1: number, zA: number, yA: number, zB: number, yB: number, t: number, tile = 0) {
    const L = Math.hypot(zB - zA, yB - yA), a = Math.atan2(yB - yA, zB - zA);
    this.geo(boxGeo(V(x0, -t, 0), V(x1, 0, L), tile, true).rotateX(-a).translate(0, yA, zA), m);
  }
  rod(m: Mat, a: V3, c: V3, rad: number, seg = 6) { this.geo(rodGeo(a, c, rad, seg), m); }
  at(x: number, z: number, rot = 0, y = 0) { return new Put(this.b, this.M.clone().multiply(Mx(x, z, rot, y))); }
}
export const dim = (hex: string, k: number) => "#" + new THREE.Color(hex).multiplyScalar(k).getHexString();
export const C = (col: string) => lam("c" + col, () => ({ color: col }));
export const PL = (col: string) => lam("pl" + col, () => ({ map: plasterTex(col) }));
export const WD = (col: string) => lam("wd" + col, () => ({ map: woodTex(col) }));
export const SHT = (col: string) => lam("sh" + col, () => ({ map: shutterTex(col) }));
export const TIN = (col: string) => lam("tin" + col, () => ({ map: tinTex(col) }));
export const TILE = () => lam("tileRoof", () => ({ map: roofHD("#c8623a") }));
export const IRON = "#24303a", GLASS = "#2f3b5c", POST = "#7a4526";
export const WALLS = ["#d9a35a", "#c46a46", "#e8d6b0", "#b9643f", "#d8b98a", "#7fa294", "#e3c9a0", "#cf8f5a", "#a9b5a0", "#c98a6a", "#e6d2a8", "#8d9cad"];
export const TRIMS = ["#efe4cc", "#efe4cc", "#f3ead6", "#7a4a2e", "#a8503a", "#d8c49a"];
export const SHUTS = ["#4f7d6b", "#5a6f94", "#9a4a34", "#6e7f45", "#7a5a3c", "#4f8080"];
export const RAILS = ["#3f6b5e", "#4a5a7a", "#7a3a2c", "#2a3036"];
export const CLOTH = ["#b8485e", "#d9a03a", "#4f86a8", "#8a5a8f", "#d0703a"];
export const BOARDS: [string, string][] = [["SRI LAKSHMI", "KIRANA STORES"], ["RAJU TAILORS", "LADIES & GENTS"], ["GANESH TEA", "TEA - COFFEE - SNACKS"], ["BALAJI MEDICAL", "MEDICINES"],
  ["ANNAPURNA", "SWEETS & SAVOURIES"], ["SAI CYCLE", "REPAIR WORKS"], ["STD - PCO", "XEROX - PHONE"], ["VENKAT FANCY", "BANGLES - TOYS"], ["SRINIVASA", "GENERAL STORES"], ["MANI RICE", "MANDI"]];
export const BOARD_COL: [string, string][] = [["#e0b65a", "#8a2a1e"], ["#a8402e", "#f3e6c8"], ["#4a6f94", "#f3e6c8"], ["#4f7a4a", "#f3e6c8"], ["#efe2c4", "#3f5a7a"], ["#c9783a", "#2a1d18"]];

export type BO = { w: number; floors: number; wall: string; trim: string; roof: "flat" | "tile" | "tin"; ver: "" | "tile" | "tin"; pav: number; bal: boolean;
  front: "shutter" | "open" | "house" | "salon"; shut: string; rail: string; board?: number; D?: number; tank?: boolean; tin?: string };
export const FH = 3.2;
/** window with open wooden shutters, an iron grill and a chhajja sunshade above */
export const win = (P: Put, o: BO, cx: number, y0: number, ww = 0.9, wh = 1.25) => {
  const trim = C(o.trim), iron = C(IRON);
  P.geo(quad(V(cx - ww / 2, y0, 0.01), V(cx + ww / 2, y0, 0.01), V(cx + ww / 2, y0 + wh, 0.01), V(cx - ww / 2, y0 + wh, 0.01)), C(GLASS));
  P.box(trim, cx - ww / 2 - 0.12, cx + ww / 2 + 0.12, y0 - 0.12, y0, 0, 0.16);
  P.box(trim, cx - ww / 2 - 0.1, cx - ww / 2, y0, y0 + wh, 0, 0.08); P.box(trim, cx + ww / 2, cx + ww / 2 + 0.1, y0, y0 + wh, 0, 0.08);
  P.box(trim, cx - ww / 2 - 0.1, cx + ww / 2 + 0.1, y0 + wh, y0 + wh + 0.1, 0, 0.08);
  P.box(WD(o.shut), cx - ww - 0.1, cx - ww / 2 - 0.1, y0, y0 + wh, 0, 0.05); P.box(WD(o.shut), cx + ww / 2 + 0.1, cx + ww + 0.1, y0, y0 + wh, 0, 0.05);
  for (let k = 1; k < 4; k++) P.box(iron, cx - ww / 2 + (k * ww) / 4 - 0.015, cx - ww / 2 + (k * ww) / 4 + 0.015, y0, y0 + wh, 0.02, 0.05);
  P.box(iron, cx - ww / 2, cx + ww / 2, y0 + wh * 0.5 - 0.015, y0 + wh * 0.5 + 0.015, 0.02, 0.05);
  P.box(C("#e9e1d0"), cx - ww - 0.2, cx + ww + 0.2, y0 + wh + 0.2, y0 + wh + 0.3, 0, 0.55);
};
export const goods = (P: Put, r: () => number, x0: number, x1: number, y: number, z: number) => {
  for (let x = x0 + 0.1; x < x1 - 0.1; x += U(r, 0.16, 0.28)) {
    const h = U(r, 0.14, 0.3), c = pick(r, CLOTH.concat(["#e9dcc0", "#6f8f45", "#b04a35"]));
    if (r() < 0.5) P.box(C(c), x - 0.07, x + 0.07, y, y + h, z - 0.12, z + 0.02);
    else P.geo(new THREE.CylinderGeometry(0.07, 0.07, h, 8).translate(x, y + h / 2, z - 0.05), C(c));
  }
};
export const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length) % a.length];
export const potGeo = (s: number) => new THREE.LatheGeometry([[0.0, 0], [0.12, 0.01], [0.2, 0.08], [0.24, 0.2], [0.21, 0.32], [0.12, 0.4], [0.11, 0.44], [0.14, 0.47], [0.0, 0.47]].map(([x, y]) => new THREE.Vector2(x * s, y * s)), 12);
export const pots = (P: Put, r: () => number, n: number) => { for (let i = 0; i < n; i++) { const s = U(r, 0.8, 1.4); P.geo(potGeo(s).translate(i * 0.45 + U(r, -0.05, 0.05), 0, U(r, -0.1, 0.1)), C(pick(r, ["#b95c35", "#a84f2e", "#c76a3c"]))); } };
export const plant = (P: Put, r: () => number, x: number, z: number) => {
  P.geo(potGeo(1.2).translate(x, 0, z), C("#b95c35"));
  for (let i = 0; i < 4; i++) P.geo(new THREE.SphereGeometry(U(r, 0.18, 0.28), 12, 9).translate(x + U(r, -0.15, 0.15), 0.62 + U(r, 0, 0.3), z + U(r, -0.1, 0.1)), C(pick(r, ["#3f8f3a", "#55a843", "#2f7a35"])));
};
export const crates = (P: Put, r: () => number, n: number) => {
  for (let i = 0; i < n; i++) {
    const x = (i % 2) * 0.62, y = Math.floor(i / 2) * 0.42;
    P.box(WD("#c08a50"), x, x + 0.58, y, y + 0.4, -0.4, 0);
    if (y === 0) for (let k = 0; k < 5; k++) P.geo(new THREE.SphereGeometry(0.08, 8, 6).translate(x + 0.1 + k * 0.1, 0.42, -0.2), C(pick(r, ["#d8433a", "#f2a21e", "#5fae3a"])));
  }
};
export const sacks = (P: Put, r: () => number, n: number) => { for (let i = 0; i < n; i++) { P.geo(new THREE.SphereGeometry(1, 12, 9).scale(0.26, 0.34, 0.24).translate(i * 0.5, 0.3, 0), C("#dcc490")); P.geo(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 10).translate(i * 0.5, 0.62, 0), C(pick(r, ["#f2c94a", "#d8433a", "#8a5a3c", "#efe6cc"]))); } };
export const bicycle = (P: Put) => {
  const fr = C("#2a4fa8"), blk = C("#1d1b22");
  for (const x of [-0.52, 0.52]) { P.geo(new THREE.TorusGeometry(0.32, 0.025, 6, 22).translate(x, 0.34, 0), blk); P.rod(blk, [x, 0.34, 0], [x, 0.34, 0.01], 0.03); }
  P.rod(fr, [-0.52, 0.34, 0], [-0.05, 0.4, 0], 0.025); P.rod(fr, [-0.05, 0.4, 0], [-0.15, 0.78, 0], 0.025); P.rod(fr, [-0.52, 0.34, 0], [-0.15, 0.78, 0], 0.025);
  P.rod(fr, [-0.15, 0.78, 0], [0.38, 0.8, 0], 0.025); P.rod(fr, [-0.05, 0.4, 0], [0.38, 0.8, 0], 0.025); P.rod(fr, [0.38, 0.8, 0], [0.52, 0.34, 0], 0.025);
  P.rod(fr, [0.38, 0.8, 0], [0.34, 0.98, 0], 0.025); P.rod(blk, [0.34, 0.98, -0.25], [0.34, 0.98, 0.25], 0.02); P.box(blk, -0.27, -0.05, 0.84, 0.88, -0.06, 0.06);
  P.box(C("#c9b48a"), -0.62, -0.3, 0.68, 0.72, -0.12, 0.12);
};
export const charpoy = (P: Put) => {
  const w = C("#8a5530");
  for (const x of [-0.95, 0.95]) for (const z of [-0.45, 0.45]) P.box(w, x - 0.05, x + 0.05, 0, 0.48, z - 0.05, z + 0.05);
  P.box(w, -1.0, 1.0, 0.36, 0.44, -0.5, -0.42); P.box(w, -1.0, 1.0, 0.36, 0.44, 0.42, 0.5); P.box(w, -1.0, -0.92, 0.36, 0.44, -0.5, 0.5); P.box(w, 0.92, 1.0, 0.36, 0.44, -0.5, 0.5);
  P.box(lam("rope", () => ({ map: ropeTex() })), -0.92, 0.92, 0.38, 0.41, -0.42, 0.42, 0.6);
};
export const cow = (P: Put) => {
  const hide = C("#f2ede2"), dk = C("#3a2c2a"), horn = C("#d9c7a0");
  P.geo(new THREE.SphereGeometry(1, 20, 14).scale(0.95, 0.42, 0.44).translate(0, 0.42, 0), hide);
  P.geo(new THREE.SphereGeometry(0.24, 14, 10).scale(1.0, 1.0, 0.9).translate(0.5, 0.8, 0), hide);
  P.geo(new THREE.SphereGeometry(1, 14, 10).scale(0.3, 0.2, 0.18).translate(1.12, 0.66, 0.08), hide);
  P.geo(new THREE.SphereGeometry(1, 12, 8).scale(0.11, 0.1, 0.12).translate(1.38, 0.6, 0.08), C("#e9b7a8"));
  for (const s of [-1, 1]) { P.rod(horn, [1.0, 0.82, 0.08 + s * 0.09], [0.95, 1.08, 0.08 + s * 0.2], 0.035, 6); P.geo(new THREE.SphereGeometry(1, 8, 6).scale(0.12, 0.05, 0.06).translate(1.02, 0.74, 0.08 + s * 0.22), hide); }
  P.geo(new THREE.SphereGeometry(0.035, 8, 6).translate(1.3, 0.72, 0.18), dk);
  P.box(hide, 0.4, 1.0, 0.0, 0.16, 0.22, 0.42); P.box(hide, -0.7, -0.1, 0.0, 0.16, 0.22, 0.44);
  P.rod(hide, [-0.92, 0.5, 0], [-1.25, 0.12, 0.2], 0.035); P.geo(new THREE.SphereGeometry(0.07, 8, 6).translate(-1.27, 0.1, 0.22), dk);
  P.geo(new THREE.SphereGeometry(1, 12, 8).scale(0.32, 0.2, 0.05).translate(-0.3, 0.55, 0.42), C("#b9b0a4"));
};
export const handcart = (P: Put, r: () => number) => {
  const w = WD("#b07040");
  P.box(w, -0.9, 0.9, 0.7, 0.82, -0.55, 0.55, 0.5); P.box(C("#8a5530"), -0.9, 0.9, 0.82, 0.98, 0.5, 0.56); P.box(C("#8a5530"), -0.9, 0.9, 0.82, 0.98, -0.56, -0.5);
  for (const x of [-0.5, 0.5]) for (const z of [-0.62, 0.62]) P.geo(new THREE.TorusGeometry(0.3, 0.04, 6, 18).rotateY(0).translate(x, 0.32, z), C("#3b2a22"));
  P.rod(C("#8a5530"), [0.9, 0.8, -0.4], [1.8, 0.75, -0.4], 0.035); P.rod(C("#8a5530"), [0.9, 0.8, 0.4], [1.8, 0.75, 0.4], 0.035);
  for (let i = 0; i < 26; i++) P.geo(new THREE.SphereGeometry(U(r, 0.08, 0.12), 9, 7).translate(U(r, -0.75, 0.75), 0.92 + U(r, 0, 0.12), U(r, -0.42, 0.42)), C(pick(r, ["#d8433a", "#f2a21e", "#5fae3a", "#7a2f6a", "#e8d24a"])));
};
export const LEAF = ["#4f9a3a", "#3f8a35", "#62ad44", "#2f7a32"];
export const tree = (P: Put, r: () => number, x: number, z: number, s: number) => {
  const bark = C("#6e4a33");
  P.geo(new THREE.CylinderGeometry(0.2 * s, 0.32 * s, 3.6 * s, 10).translate(x, 1.8 * s, z), bark);
  for (let i = 0; i < 3; i++) { const a = U(r, 0, 6.28); P.rod(bark, [x, 3.0 * s, z], [x + Math.cos(a) * 1.4 * s, 4.4 * s, z + Math.sin(a) * 1.4 * s], 0.11 * s); }
  for (let i = 0; i < 16; i++) {
    const a = r() * 6.28, d = r() * 2.0 * s, rr = (1.0 + r() * 0.8) * s;
    P.geo(new THREE.SphereGeometry(rr, 14, 10).scale(1, 0.8, 1).translate(x + Math.cos(a) * d, (4.4 + r() * 1.8) * s, z + Math.sin(a) * d), C(LEAF[i % 4]));
  }
};
export const palm = (P: Put, r: () => number, x: number, z: number, h: number) => {
  const lean = U(r, -0.12, 0.12), pts: V3[] = [];
  for (let k = 0; k <= 6; k++) { const t = k / 6; pts.push([x + lean * h * t * t, h * t, z]); }
  for (let k = 0; k < 6; k++) P.rod(C("#8a6a4a"), pts[k], pts[k + 1], 0.16 - k * 0.012, 7);
  const top = pts[6];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.28 + U(r, -0.2, 0.2), L = U(r, 2.4, 3.0), dx = Math.cos(a), dz = Math.sin(a);
    const mid: V3 = [top[0] + dx * L * 0.55, top[1] + 0.45, top[2] + dz * L * 0.55], end: V3 = [top[0] + dx * L, top[1] - 0.9, top[2] + dz * L];
    for (const [p, q] of [[top, mid], [mid, end]] as const) {
      const d = V(q[0] - p[0], q[1] - p[1], q[2] - p[2]), len = d.length();
      const g = new THREE.BoxGeometry(0.62, 0.04, len).translate(0, 0, len / 2);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), d.normalize()));
      P.geo(g.translate(...p), C(i % 2 ? "#4f9a3a" : "#3f8a35"));
    }
  }
};
export const building = (P: Put, o: BO, r: () => number) => {
  const hw = o.w / 2, D = o.D ?? 8, h = o.floors * FH, wall = PL(o.wall), trim = C(o.trim), dark = C(dim(o.wall, 0.6));
  if (o.front !== "salon") P.box(wall, -hw, hw, 0, h, -D, 0, 2.5);
  if (o.front !== "salon") P.box(dark, -hw - 0.02, hw + 0.02, 0, 0.45, -D, 0.05);
  for (let k = 1; k < o.floors; k++) P.box(trim, -hw - 0.04, hw + 0.04, k * FH - 0.14, k * FH + 0.06, -0.3, 0.16);
  // ---- roof ----
  if (o.roof === "flat") {
    P.box(trim, -hw - 0.06, hw + 0.06, h - 0.16, h, -D, 0.22);
    P.box(wall, -hw, hw, h, h + 0.8, -0.22, 0.02, 2.5);
    P.box(trim, -hw - 0.05, hw + 0.05, h + 0.8, h + 0.92, -0.28, 0.08);
    for (let x = -hw + 0.5; x < hw - 0.4; x += 0.6) P.box(C(dim(o.wall, 0.45)), x, x + 0.25, h + 0.3, h + 0.6, 0.0, 0.025); // jali slots
    if (o.tank) { const tx = U(r, -hw + 0.8, hw - 0.8); P.geo(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16).translate(tx, h + 0.6, -D * 0.4), C("#26262c")); P.geo(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 16).translate(tx, h + 1.22, -D * 0.4), C("#3a3a42")); }
  } else if (o.roof === "tile") {
    const rh = 2.0, ov = 0.7, tl = TILE();
    P.slab(tl, -hw - 0.3, hw + 0.3, ov, h - 0.35, -D / 2, h + rh, 0.14, 1.6);
    P.slab(tl, hw + 0.3, -hw - 0.3, -D - ov, h - 0.35, -D / 2, h + rh, 0.14, 1.6);
    P.geo(tri(V(hw, h, 0), V(hw, h, -D), V(hw, h + rh, -D / 2)), wall); P.geo(tri(V(-hw, h, 0), V(-hw, h + rh, -D / 2), V(-hw, h, -D)), wall);
    P.box(C("#9c4a2c"), -hw - 0.32, hw + 0.32, h + rh - 0.06, h + rh + 0.12, -D / 2 - 0.12, -D / 2 + 0.12);
    P.box(C(POST), -hw - 0.3, hw + 0.3, h - 0.5, h - 0.32, ov - 0.04, ov + 0.08);
  } else {
    const t = TIN(o.tin ?? "#8fa3b4");
    P.slab(t, -hw - 0.25, hw + 0.25, 0.65, h + 0.05, -D - 0.3, h + 1.5, 0.05, 1.5);
    P.geo(tri(V(hw, h, 0), V(hw, h, -D), V(hw, h + 1.4, -D)), wall); P.geo(tri(V(-hw, h, 0), V(-hw, h + 1.4, -D), V(-hw, h, -D)), wall);
    P.box(C(POST), -hw - 0.25, hw + 0.25, h - 0.12, h + 0.08, 0.55, 0.7);
  }
  // ---- ground floor ----
  const pw = 0.42, ow = o.w - 2 * pw;
  if (o.front === "shutter" || o.front === "open") {
    P.box(trim, -hw, -hw + pw, 0, FH - 0.14, -0.04, 0.12); P.box(trim, hw - pw, hw, 0, FH - 0.14, -0.04, 0.12);
    P.geo(quad(V(-ow / 2, 0.45, 0.012), V(ow / 2, 0.45, 0.012), V(ow / 2, 2.7, 0.012), V(-ow / 2, 2.7, 0.012)), C("#2c2030"));
    P.box(trim, -hw, hw, 2.7, 2.92, -0.04, 0.1);
    for (const y of [1.15, 1.65, 2.15]) { P.box(C("#8a5530"), -ow / 2, ow / 2, y - 0.04, y, 0.0, 0.2); goods(P, r, -ow / 2, ow / 2, y, 0.16); }
    if (o.front === "shutter") { P.box(SHT(o.shut), -ow / 2, ow / 2, 2.05, 2.7, 0.0, 0.04, 1); P.box(C(dim(o.shut, 0.8)), -ow / 2 - 0.05, ow / 2 + 0.05, 2.7, 2.98, 0.0, 0.3); }
    P.box(WD("#a8673a"), -ow / 2 + 0.15, ow / 2 - 0.15, 0, 0.92, 0.08, 0.62); P.box(C("#6e3f22"), -ow / 2 + 0.1, ow / 2 - 0.1, 0.92, 0.98, 0.05, 0.68);
    goods(P, r, -ow / 2 + 0.2, ow / 2 - 0.2, 0.98, 0.5);
    if (r() < 0.6) sacks(P.at(-ow / 2 + 0.35, 0.95), r, 2 + Math.floor(r() * 2));
  } else if (o.front === "house") {
    const dx = o.w > 4 ? -hw + 1.2 : 0;
    P.box(trim, dx - 0.68, dx + 0.68, 0.45, 2.55, 0, 0.08); P.box(WD(o.shut), dx - 0.55, dx + 0.55, 0.45, 2.42, 0.02, 0.11);
    P.box(C("#d9c7a0"), dx - 0.7, dx + 0.7, 0.3, 0.45, 0, 0.4);
    if (o.w > 4) win(P, o, dx + 2.1, 1.1, 0.8, 1.1);
    if (r() < 0.6) plant(P, r, dx + 0.95, 0.3);
  }
  // ---- upper floors ----
  for (let k = 1; k < o.floors; k++) {
    const n = Math.max(1, Math.floor(o.w / 2.3));
    for (let i = 0; i < n; i++) win(P, o, -hw + ((i + 0.5) * o.w) / n, k * FH + 0.95);
  }
  if (o.bal && o.floors >= 2) {
    const rl = C(o.rail), x0 = -hw + 0.25, x1 = hw - 0.25, y = FH + 0.08;
    P.box(trim, x0, x1, FH - 0.1, y, 0, 1.0);
    for (let x = x0 + 0.05; x <= x1 - 0.04; x += 0.28) P.box(rl, x - 0.02, x + 0.02, y, y + 0.9, 0.9, 0.94);
    for (const z of [0.35, 0.65]) for (const x of [x0 + 0.02, x1 - 0.06]) P.box(rl, x, x + 0.04, y, y + 0.9, z - 0.02, z + 0.02);
    P.box(rl, x0, x1, y + 0.88, y + 0.96, 0.86, 0.98); P.box(rl, x0, x1, y + 0.3, y + 0.35, 0.89, 0.95);
    P.box(rl, x0, x0 + 0.06, y + 0.88, y + 0.96, 0, 0.98); P.box(rl, x1 - 0.06, x1, y + 0.88, y + 0.96, 0, 0.98);
    if (r() < 0.75) { const cx = U(r, x0 + 0.2, x1 - 1.3); P.box(C(pick(r, CLOTH)), cx, cx + 1.1, y + 0.25, y + 0.98, 0.98, 1.0); }
    if (r() < 0.5) plant(P, r, x1 - 0.35, 0.55);
  }
  // ---- verandah: wooden posts, beam, lean-to roof over the pavement ----
  if (o.ver && o.pav > 0) {
    const pz = o.pav - 0.25, pm = C(POST), xs = [-hw + 0.12, hw - 0.12].concat(o.w > 5.6 ? [0] : []);
    for (const x of xs) { P.box(pm, x - 0.07, x + 0.07, 0, 2.66, pz - 0.07, pz + 0.07); P.box(pm, x - 0.04, x + 0.04, 2.3, 2.66, pz - 0.5, pz - 0.07); }
    P.box(pm, -hw, hw, 2.62, 2.78, pz - 0.09, pz + 0.09);
    P.slab(o.ver === "tile" ? TILE() : TIN(o.tin ?? "#8fa3b4"), -hw - 0.02, hw + 0.02, 0, 3.12, o.pav, 2.74, o.ver === "tile" ? 0.1 : 0.05, 1.5);
  }
  // ---- painted shop board ----
  if (o.board !== undefined && o.floors >= 2 && o.front !== "salon") {
    const [l1, l2] = BOARDS[o.board % BOARDS.length], [bg, fg] = BOARD_COL[o.board % BOARD_COL.length];
    const y0 = o.ver ? 3.3 : 3.0, bw = Math.min(o.w - 0.6, 4.2);
    P.box(C("#3b2a22"), -bw / 2 - 0.05, bw / 2 + 0.05, y0 - 0.05, y0 + bw / 4 * 0.42 + 0.05, 0.0, 0.08);
    P.geo(quad(V(-bw / 2, y0, 0.085), V(bw / 2, y0, 0.085), V(bw / 2, y0 + bw / 4 * 0.42, 0.085), V(-bw / 2, y0 + bw / 4 * 0.42, 0.085)), lam("bd" + l1 + bg, () => ({ map: boardTex(l1, l2, bg, fg) })));
  }
};
/** an open-fronted salon: hollow ground floor with walls, tiled floor, mirror + shelf + bottles, posters, bench, fan, tube light */
export const salon = (P: Put, PI: Put, o: BO, root: THREE.Object3D, sign: [string, string, string, string], awn: string, r: () => number, k: number) => {
  const hw = o.w / 2, D = o.D ?? 8, h = o.floors * FH, wall = PL(o.wall), ow = 3.3, oh = 2.75, t = 0.25;
  P.box(wall, -hw, hw, FH, h, -D, 0, 2.5);
  P.box(wall, -hw, -hw + t, 0, FH, -D, 0, 2.5); P.box(wall, hw - t, hw, 0, FH, -D, 0, 2.5); P.box(wall, -hw, hw, 0, FH, -D, -D + t, 2.5);
  P.box(wall, -hw + t, -ow / 2, 0, FH, -t, 0, 2.5); P.box(wall, ow / 2, hw - t, 0, FH, -t, 0, 2.5); P.box(wall, -ow / 2, ow / 2, oh, FH, -t, 0, 2.5);
  P.box(C(o.trim), -ow / 2 - 0.12, ow / 2 + 0.12, oh - 0.12, oh + 0.04, -0.02, 0.1);
  for (const s of [-1, 1]) P.box(C(o.trim), s > 0 ? ow / 2 : -ow / 2 - 0.12, s > 0 ? ow / 2 + 0.12 : -ow / 2, 0, oh, -0.02, 0.1);
  building(P, { ...o, front: "salon" }, r);
  // interior (own batch: no shadows received, so the room reads warm and bright against the street)
  const inner = C(k ? "#f3d9a8" : "#9fd8c8"), iy = KERB;
  PI.box(lam("floorTile", () => ({ map: rep(ctex("tiles2", 256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#d9c19a" : "#b0603e"; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = "rgba(40,20,20,0.6)"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } }), 1, 1) })), -hw + t, hw - t, 0, iy, -D + t, 0, 1.0);
  const e = 0.006;
  PI.geo(quad(V(-hw + t + e, iy, 0), V(-hw + t + e, iy, -D + t), V(-hw + t + e, FH, -D + t), V(-hw + t + e, FH, 0)).rotateY(0), inner);
  PI.geo(quad(V(hw - t - e, iy, -D + t), V(hw - t - e, iy, 0), V(hw - t - e, FH, 0), V(hw - t - e, FH, -D + t)), inner);
  PI.geo(quad(V(-hw + t, iy, -D + t + e), V(hw - t, iy, -D + t + e), V(hw - t, FH, -D + t + e), V(-hw + t, FH, -D + t + e)), inner);
  const fq = (xa: number, xb: number, ya: number, yb: number) => PI.geo(quad(V(xb, ya, -t - e), V(xa, ya, -t - e), V(xa, yb, -t - e), V(xb, yb, -t - e)), inner);
  fq(-hw + t, -ow / 2, iy, FH); fq(ow / 2, hw - t, iy, FH); fq(-ow / 2, ow / 2, oh, FH);
  PI.geo(quad(V(-hw + t, FH - e, -D + t), V(hw - t, FH - e, -D + t), V(hw - t, FH - e, 0), V(-hw + t, FH - e, 0)), C("#f5efe2"));
  PI.box(C(dim(k ? "#f3d9a8" : "#9fd8c8", 0.7)), -hw + t, -hw + t + 0.03, iy, iy + 1.0, -D + t, -t); // dado on the mirror wall
  // mirror wall (left): long mirror, shelf, bottles, tube light
  const mx = -hw + t + 0.02, frame = C("#c98f3b");
  PI.box(frame, mx, mx + 0.06, iy + 1.0, iy + 2.25, -D + 1.2, -1.0);
  const mir = new THREE.Mesh(new THREE.PlaneGeometry(D - 2.5, 1.1), new THREE.MeshBasicMaterial({ map: mirrorTex(), color: 0xd8d8d8 }));
  mir.rotation.y = Math.PI / 2; mir.position.set(mx + 0.07, iy + 1.62, (-D + 1.2 - 1.0) / 2); mir.applyMatrix4(P.M); root.add(mir);
  PI.box(C("#8a5530"), mx, mx + 0.4, iy + 0.92, iy + 0.98, -D + 1.0, -0.8);
  const bot = ["#2f8c8c", "#d8433a", "#e8b23a", "#5b6fd6", "#f3efe6", "#7a3fc4"];
  for (let i = 0; i < 16; i++) { const z = -D + 1.3 + i * ((D - 2.4) / 16), bh = 0.14 + 0.1 * (i % 3) / 2; PI.geo(new THREE.CylinderGeometry(0.045, 0.05, bh, 8).translate(mx + 0.2, iy + 0.98 + bh / 2, z), C(bot[i % 6])); }
  const tube = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.4, 2.2) }));
  tube.position.set(mx + 0.08, iy + 2.55, -D * 0.45); tube.applyMatrix4(P.M); root.add(tube);
  // right wall: bench, posters, calendar; front wall inner: posters
  const rx = hw - t - 0.02;
  PI.box(WD("#a8673a"), rx - 0.45, rx, iy + 0.42, iy + 0.5, -D + 1.5, -2.0, 0); for (const z of [-D + 1.6, -2.1]) PI.box(C(POST), rx - 0.42, rx - 0.05, iy, iy + 0.42, z - 0.05, z + 0.05);
  const card2 = (tex: THREE.Texture, w: number, h2: number, pos: V3, ry: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h2), new THREE.MeshBasicMaterial({ map: tex, color: 0xe6e6e6 })); m.position.set(...pos); m.rotation.y = ry; m.applyMatrix4(P.M); root.add(m); };
  card2(posterTex(k * 2), 0.5, 0.7, [rx - 0.01, iy + 1.6, -D * 0.35], -Math.PI / 2); card2(posterTex(k * 2 + 1), 0.5, 0.7, [rx - 0.01, iy + 1.6, -D * 0.6], -Math.PI / 2);
  card2(calendarTex(), 0.4, 0.53, [rx - 0.01, iy + 1.7, -1.4], -Math.PI / 2);
  card2(posterTex(k + 2), 0.45, 0.62, [-ow / 2 - 0.45, iy + 1.65, -t - 0.012], Math.PI); card2(posterTex(k + 3), 0.45, 0.62, [ow / 2 + 0.45, iy + 1.65, -t - 0.012], Math.PI);
  // ceiling fan
  PI.rod(C("#4a4a52"), [0, FH, -D / 2], [0, FH - 0.45, -D / 2], 0.025); PI.geo(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12).translate(0, FH - 0.48, -D / 2), C("#e9e1d0"));
  for (let i = 0; i < 3; i++) PI.geo(new THREE.BoxGeometry(0.75, 0.02, 0.13).translate(0.45, 0, 0).rotateY(i * 2.09 + k).translate(0, FH - 0.5, -D / 2), C("#e9e1d0"));
  // outside: big sign, awning, barber pole, pots
  P.box(C("#3b2f2a"), -hw + 0.15, hw - 0.15, 2.95, 4.0, 0.05, 0.14);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(o.w - 0.4, 0.95), new THREE.MeshBasicMaterial({ map: signTex(sign[0], sign[1], sign[2], sign[3], "#ffffff"), color: 0xf0f0f0 }));
  sg.position.set(0, 3.475, 0.145); if (k) sg.rotation.z = -0.045; sg.applyMatrix4(P.M); sg.layers.set(NOINK); root.add(sg);
  // blade sign sticking out over the pavement: readable in the along-the-street shots (Nandu's crisp, Murali's faded + crooked)
  const bx = k ? -hw + 0.35 : hw - 0.35, blade = bladeTex(k ? "MURALI" : "STYLE KING", k ? "HAIR CUTTING" : "SALOON", k ? "#5a6f86" : "#9c3a2e", k ? "#e9dcb8" : "#fff6e0", !!k);
  P.box(C("#2a2224"), bx - 0.04, bx + 0.04, 4.35, 4.42, 0, 1.75); P.rod(C("#2a2224"), [bx, 4.38, 0.05], [bx, 3.6, 0.05], 0.02);
  for (const sd of [1, -1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.82), new THREE.MeshBasicMaterial({ map: blade, color: 0xeeeeee }));
    m.rotation.set(0, sd * Math.PI / 2, k ? 0.05 * sd : 0); m.position.set(bx + sd * 0.035, 3.88, 0.95); m.applyMatrix4(P.M); root.add(m);
  }
  P.box(C("#3b2f2a"), bx - 0.03, bx + 0.03, 3.42, 4.34, 0.15, 1.75);
  const aw = lam("awning" + awn, () => ({ map: ctex("awn" + awn, 512, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f6f1e6" : awn; g.fillRect(i * 64, 0, 64, 128); } g.fillStyle = "rgba(30,20,20,0.5)"; for (let i = 0; i <= 8; i++) g.fillRect(i * 64 - 1, 0, 2, 128); }) }));
  P.slab(aw, -ow / 2 - 0.35, ow / 2 + 0.35, 0.02, 2.88, 1.15, 2.5, 0.03);
  P.box(C(awn), -ow / 2 - 0.35, ow / 2 + 0.35, 2.32, 2.5, 1.13, 1.17);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 20), new THREE.MeshBasicMaterial({ map: poleTex(), color: 0xe6e6e6 }));
  pole.position.set(-ow / 2 - 0.3, 1.5, 0.32); pole.applyMatrix4(P.M); root.add(pole);
  const ch = C("#c9ccd2");
  P.box(ch, -ow / 2 - 0.42, -ow / 2 - 0.18, 1.92, 2.0, 0.2, 0.44); P.box(ch, -ow / 2 - 0.42, -ow / 2 - 0.18, 1.0, 1.08, 0.2, 0.44); P.box(ch, -ow / 2 - 0.35, -ow / 2 - 0.25, 1.08, 1.92, 0.02, 0.2);
  plant(P, r, hw - 0.4, 0.35);
};
export const chair = (P: Put) => {
  const red = C("#c8343a"), chrome = C("#c9ccd2");
  P.geo(new THREE.CylinderGeometry(0.06, 0.08, 0.45, 12).translate(0, 0.25, 0), chrome);
  P.geo(new THREE.CylinderGeometry(0.28, 0.32, 0.05, 20).translate(0, 0.04, 0), chrome);
  P.box(red, -0.32, 0.32, 0.45, 0.6, -0.32, 0.25); P.box(red, -0.32, 0.32, 0.6, 1.35, -0.36, -0.22);
  P.box(C("#e9e1d0"), -0.18, 0.18, 1.35, 1.5, -0.34, -0.26);
  for (const s of [-1, 1]) P.box(red, s * 0.32 - 0.05, s * 0.32 + 0.05, 0.6, 0.8, -0.3, 0.2);
  P.box(chrome, -0.2, 0.2, 0.15, 0.2, 0.25, 0.5);
};

