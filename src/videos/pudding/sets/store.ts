// SET "store" — a 1999 California discount grocery (one long pudding aisle, a second emptied aisle, checkout lanes)
// plus the back stockroom where the pudding mountain is stacked and David peels barcodes alone.
// Shots: 1 hook (aisle, one cup), 3 (aisle + promo standee), 4 (standee close), 5 (David, double miles), 6 (pudding
// shelf, 25c tag), 7 (the math at the shelf), 8 (emptied aisle, overflowing cart), 9 (pudding mountain crane), 10 (alone
// at the table, three weeks). Local: store x -9..9, z -22..8 (front windows at z = 8); stockroom x 30..50.
import * as THREE from "three";
import { Put, C, PL, lam, quad, V, U, ctex, blot, W9, INK } from "../kit";
import { V3, smooth } from "../core";
import { Key, Dof, dolly, pushK, glide } from "../cam";
import type { StageAPI, Outfit, FrontOpts } from "../stagekit";
import { fxStars } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import * as K from "./diner_kit";
import type { Pen } from "../toon";
export const ORIGIN: V3 = [400, 0, 0];
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];

// ---------------- painted textures ----------------
const PK = ["#d8433a", "#f2c43b", "#3a6fd0", "#3f8a5a", "#e8668e", "#f08a3a", "#7a5aa8", "#2fa39a", "#f4efe2", "#b8483a"];
/** one shelf level of mixed packages: 1 m wide x 0.38 m tall, packages with ink rims, labels, a little tone drift */
const goodsTex = (k: number) => ctex("goods" + k, 512, 196, (g, r) => {
  g.fillStyle = "#5a4a48"; g.fillRect(0, 0, 512, 196);
  let x = 4;
  while (x < 508) {
    const w = 34 + Math.floor(r() * 46), h = 110 + Math.floor(r() * 74), c = PK[Math.floor(r() * PK.length)], kind = r();
    const y = 196 - h;
    g.fillStyle = c;
    if (kind < 0.25) { g.beginPath(); g.ellipse(x + w / 2, y + 10, w / 2, 9, 0, 0, 7); g.fill(); g.fillRect(x, y + 10, w, h - 10); } // can / bottle
    else g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(x + 5, y + h * 0.3, w - 10, h * 0.28);
    g.fillStyle = PK[(PK.indexOf(c) + 3) % PK.length]; g.fillRect(x + 8, y + h * 0.36, (w - 16) * (0.4 + r() * 0.6), 7);
    g.fillRect(x + 8, y + h * 0.47, (w - 16) * 0.5, 5);
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x + 3, y + 3, 5, h - 6);
    g.strokeStyle = INK; g.lineWidth = 3.5; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    x += w + 3;
  }
  for (let i = 0; i < 4; i++) blot(g, r() * 512, r() * 196, 90, "40,30,40", 0.12);
});
/** one level of pudding: rows of brown cups with foil lids, a green band and a barcode label (1 m x 0.38 m) */
const puddingTex = () => ctex("puddingRow", 512, 196, (g, r) => {
  g.fillStyle = "#4a3a38"; g.fillRect(0, 0, 512, 196);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
    const cx = 30 + i * 57 + (row ? 0 : 0), y0 = row ? 104 : 14, tw = 25, bw = 19, h = 78;
    g.fillStyle = "#efe8da"; g.beginPath(); g.moveTo(cx - tw, y0); g.lineTo(cx + tw, y0); g.lineTo(cx + bw, y0 + h); g.lineTo(cx - bw, y0 + h); g.closePath(); g.fill();
    g.save(); g.clip(); g.fillStyle = "#7a4a2e"; g.fillRect(cx - 30, y0 + 14, 60, 50); g.fillStyle = "#3f8a5a"; g.fillRect(cx - 30, y0 + 18, 60, 7);
    g.fillStyle = "#ffffff"; g.fillRect(cx - 11, y0 + 32, 22, 16); g.fillStyle = INK; for (let k = 0; k < 9; k++) g.fillRect(cx - 9 + k * 2.2, y0 + 34, k % 3 ? 1 : 1.8, 12); g.restore();
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - tw, y0); g.lineTo(cx + tw, y0); g.lineTo(cx + bw, y0 + h); g.lineTo(cx - bw, y0 + h); g.closePath(); g.stroke();
    g.fillStyle = "#d4dbe2"; g.beginPath(); g.ellipse(cx, y0, tw + 2, 6, 0, 0, 7); g.fill(); g.stroke();
  }
  for (let i = 0; i < 3; i++) blot(g, r() * 512, r() * 196, 80, "40,30,40", 0.1);
});
/** a nearly empty shelf: dark back, a few stray cups */
const emptyTex = () => ctex("emptyRow", 512, 196, (g, r) => {
  g.fillStyle = "#4a3a38"; g.fillRect(0, 0, 512, 196);
  const gr = g.createLinearGradient(0, 0, 0, 196); gr.addColorStop(0, "rgba(0,0,0,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 196);
  for (let i = 0; i < 2; i++) { const cx = 60 + r() * 400, y0 = 104; g.fillStyle = "#efe8da"; g.fillRect(cx - 20, y0, 40, 78); g.fillStyle = "#7a4a2e"; g.fillRect(cx - 20, y0 + 14, 40, 44); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(cx - 20, y0, 40, 78); }
});
/** shelf-edge price strip: white with red price tags */
const stripTex = (price: boolean) => ctex("strip" + price, 512, 32, (g, r) => {
  g.fillStyle = "#f4efe2"; g.fillRect(0, 0, 512, 32);
  for (let x = 20; x < 512; x += 64 + Math.floor(r() * 30)) { g.fillStyle = price ? "#f2c43b" : "#ffffff"; g.fillRect(x, 3, 40, 26); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, 3, 40, 26);
    g.fillStyle = price ? "#c8323c" : "#333"; g.font = "900 18px Arial Black, Arial"; g.textAlign = "center"; g.fillText(price ? "25¢" : "$" + (1 + Math.floor(r() * 4)) + "." + (10 + Math.floor(r() * 89)), x + 20, 23); }
  g.fillStyle = INK; g.fillRect(0, 0, 512, 2); g.fillRect(0, 30, 512, 2);
});
/** a case of pudding cups (cardboard, green label, cup icons), 256 px square, tiled per 0.5 m */
const caseTex = () => ctex("pudCase", 256, 256, (g, r) => {
  g.fillStyle = "#c99a5e"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) blot(g, r() * 256, r() * 256, 80, r() > 0.5 ? "255,235,200" : "120,80,40", 0.18);
  g.fillStyle = "#3f8a5a"; g.fillRect(28, 92, 200, 72); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(28, 92, 200, 72);
  g.fillStyle = "#f4efe2"; g.font = "900 30px Arial Black, Arial"; g.textAlign = "center"; g.fillText("PUDDING", 128, 124); g.font = "700 22px Arial"; g.fillText("48 CUPS", 128, 152);
  for (let i = 0; i < 4; i++) { const cx = 56 + i * 48; g.fillStyle = "#7a4a2e"; g.beginPath(); g.ellipse(cx, 52, 15, 18, 0, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = "rgba(40,22,14,0.75)"; g.fillRect(0, 0, 256, 5); g.fillRect(0, 0, 5, 256); g.fillRect(0, 124, 256, 3);
});
const floorTex = () => ctex("storeFloor", 512, 512, (g, r) => {
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) { g.fillStyle = (i + k) % 2 ? "#e9e2d2" : (r() > 0.5 ? "#cfd8c8" : "#d6dccb"); g.fillRect(i * 128, k * 128, 128, 128); }
  for (let i = 0; i < 8; i++) blot(g, r() * 512, r() * 512, 120, r() > 0.5 ? "255,255,240" : "90,80,70", 0.12);
  g.strokeStyle = "rgba(60,50,50,0.5)"; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); }
});
const concTex = () => ctex("stockConc", 512, 512, (g, r) => {
  g.fillStyle = "#b8b0a2"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 14; i++) W9(512, 512, r() * 512, r() * 512, 110, (a, b) => blot(g, a, b, 110, r() > 0.5 ? "240,235,220" : "80,70,60", 0.14));
  g.strokeStyle = "rgba(50,40,40,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 256); g.lineTo(512, 256); g.moveTo(256, 0); g.lineTo(256, 512); g.stroke();
});
const ceilTex = () => ctex("storeCeil", 256, 256, (g) => { g.fillStyle = "#e8e4da"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(60,60,70,0.45)"; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252); });
/** hanging aisle sign */
const aisleTex = (n: string, l1: string, l2: string) => ctex("aisle" + n, 512, 256, (g) => {
  g.fillStyle = "#2f6a8a"; g.fillRect(0, 0, 512, 256); g.strokeStyle = "#f4efe2"; g.lineWidth = 8; g.strokeRect(12, 12, 488, 232); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(4, 4, 504, 248);
  g.fillStyle = "#f2c43b"; g.beginPath(); g.arc(90, 128, 58, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.fillStyle = INK; g.font = "900 70px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(n, 90, 132);
  g.fillStyle = "#f4efe2"; g.font = "900 46px Arial Black, Arial"; g.fillText(l1, 320, 96, 330); g.font = "800 38px Arial"; g.fillText(l2, 320, 164, 330);
});
/** the promotion standee: no brand marks, just the offer */
const promoTex = () => ctex("promoStandee", 512, 760, (g, r) => {
  const sky = g.createLinearGradient(0, 0, 0, 760); sky.addColorStop(0, "#5ab0e8"); sky.addColorStop(1, "#bfe3f6"); g.fillStyle = sky; g.fillRect(0, 0, 512, 760);
  for (let i = 0; i < 5; i++) { g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(60 + r() * 400, 330 + r() * 120, 60, 18, 0, 0, 7); g.fill(); }
  // airliner
  g.save(); g.translate(256, 300); g.rotate(-0.18);
  g.fillStyle = "#f4f6f8"; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.ellipse(0, 0, 150, 26, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-20, 4); g.lineTo(-90, 90); g.lineTo(-50, 92); g.lineTo(50, 6); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-120, -6); g.lineTo(-150, -70); g.lineTo(-125, -70); g.lineTo(-95, -10); g.closePath(); g.fillStyle = "#c8323c"; g.fill(); g.stroke();
  g.fillStyle = "#2f6a8a"; for (let i = 0; i < 9; i++) g.fillRect(-70 + i * 18, -10, 9, 9);
  g.restore();
  g.fillStyle = "#c8323c"; g.fillRect(0, 0, 512, 170); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, 504, 752);
  g.fillStyle = "#ffffff"; g.font = "900 64px Arial Black, Arial"; g.textAlign = "center"; g.fillText("FREE", 256, 74); g.font = "900 56px Arial Black, Arial"; g.fillText("AIRLINE MILES!", 256, 140, 470);
  g.fillStyle = "#f4efe2"; g.fillRect(24, 470, 464, 270); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(24, 470, 464, 270);
  g.fillStyle = INK; g.font = "900 44px Arial Black, Arial"; g.fillText("10 BARCODES", 256, 530); g.fillText("= 500 MILES", 256, 584);
  g.fillStyle = "#c8323c"; g.font = "900 36px Arial Black, Arial"; g.fillText("DOUBLE MILES", 256, 650); g.fillText("BY MAY 31!", 256, 696);
  g.fillStyle = "#ffffff"; g.fillRect(380, 600, 90, 50); g.fillStyle = INK; for (let k = 0; k < 16; k++) g.fillRect(386 + k * 5, 606, k % 3 ? 2 : 3.5, 38);
});
/** wall calendar for May 1999 (May 1 was a Saturday) */
const calTex = () => ctex("may99", 384, 480, (g) => {
  g.fillStyle = "#fbf6ea"; g.fillRect(0, 0, 384, 480); g.fillStyle = "#c8323c"; g.fillRect(0, 0, 384, 110);
  g.fillStyle = "#ffffff"; g.font = "900 54px Arial Black, Arial"; g.textAlign = "center"; g.fillText("MAY 1999", 192, 74);
  g.font = "700 26px Arial"; g.textBaseline = "middle";
  for (let d = 1; d <= 31; d++) { const c = (d + 5) % 7, row = Math.floor((d + 5) / 7); const x = 30 + c * 54, y = 150 + row * 60;
    g.fillStyle = d === 31 ? "#c8323c" : "#333"; g.fillText(String(d), x, y);
    if (d < 10) { g.strokeStyle = "#c8323c"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 16, y - 16); g.lineTo(x + 16, y + 16); g.moveTo(x + 16, y - 16); g.lineTo(x - 16, y + 16); g.stroke(); }
    if (d === 31) { g.strokeStyle = "#c8323c"; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 24, 0, 7); g.stroke(); } }
  g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, 376, 472);
});

// ---------------- geometry ----------------
const HX = 9, Z0 = -22, Z1 = 8, CEIL = 4.4;
/** a shelf run along z from za to zb, the stocked face toward side s (+1 = +x), at x = xf; levels painted by tex(level) */
const shelfRun = (P: Put, xf: number, s: 1 | -1, za: number, zb: number, tex: (lv: number, seg: number) => THREE.Texture, strip: (lv: number, seg: number) => THREE.Texture, segs: [number, number][] = [[za, zb]]) => {
  const d = 0.55, xb = xf - s * d, metal = C("#d9dcd8"), back = C("#5a4a48");
  P.box(metal, Math.min(xf, xb), Math.max(xf, xb), 0, 0.18, za, zb);
  P.box(back, Math.min(xf, xb) + (s > 0 ? 0 : d - 0.05), Math.min(xf, xb) + (s > 0 ? 0.05 : d), 0.18, 2.15, za, zb);
  P.box(metal, Math.min(xf, xb) - 0.02, Math.max(xf, xb) + 0.02, 2.15, 2.22, za - 0.02, zb + 0.02);
  for (const z of [za, zb]) P.box(metal, Math.min(xf, xb), Math.max(xf, xb), 0, 2.2, z - 0.03, z + 0.03);
  for (let lv = 0; lv < 5; lv++) {
    const y0 = 0.2 + lv * 0.39, y1 = y0 + 0.37;
    segs.forEach(([a, b], si) => {
      const L = b - a, m = lam(`row${tex(lv, si).uuid}`, () => ({ map: tex(lv, si) })), x = xf - s * 0.04;
      const geo = s > 0 ? quad(V(x, y0, b), V(x, y0, a), V(x, y1, a), V(x, y1, b), L, 1) : quad(V(x, y0, a), V(x, y0, b), V(x, y1, b), V(x, y1, a), L, 1);
      P.geo(geo, m);
      const sm = lam(`strip${strip(lv, si).uuid}`, () => ({ map: strip(lv, si) })), xs = xf + s * 0.01;
      const g2 = s > 0 ? quad(V(xs, y0 - 0.05, b), V(xs, y0 - 0.05, a), V(xs, y0 + 0.02, a), V(xs, y0 + 0.02, b), L / 1.4, 1) : quad(V(xs, y0 - 0.05, a), V(xs, y0 - 0.05, b), V(xs, y0 + 0.02, b), V(xs, y0 + 0.02, a), L / 1.4, 1);
      P.geo(g2, sm);
    });
    P.box(metal, Math.min(xf, xb), Math.max(xf, xb), y0 - 0.05, y0 - 0.02, za, zb);
  }
};
const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  const M = P.M, GOODS = [0, 1, 2, 3, 4].map((k) => goodsTex(k));
  const floor = lam("stFloor", () => ({ map: floorTex() })), wall = PL("#e8dcc0"), ceil = lam("stCeil", () => ({ map: ceilTex() }));
  // shell
  PI.box(floor, -HX, HX, -0.02, 0.0, Z0, Z1, 2.4);
  PI.box(wall, -HX - 0.25, -HX, 0, CEIL, Z0, Z1, 2.5); PI.box(wall, HX, HX + 0.25, 0, CEIL, Z0, Z1, 2.5); PI.box(wall, -HX, HX, 0, CEIL, Z0 - 0.25, Z0, 2.5);
  PI.box(C("#3f8a5a"), -HX, HX, 0, 0.3, Z0, Z0 + 0.04); // base trim
  // back wall: dairy coolers glow
  for (let x = -8; x < 8; x += 2.1) { PI.box(C("#d9dcd8"), x, x + 2.0, 0, 2.4, Z0, Z0 + 0.9); K.emissive(root, M, new THREE.BoxGeometry(1.8, 1.9, 0.02).translate(x + 1.0, 1.3, Z0 + 0.92), [1.35, 1.45, 1.5]); }
  PI.geo(quad(V(-HX, CEIL, Z0), V(HX, CEIL, Z0), V(HX, CEIL, Z1), V(-HX, CEIL, Z1), 18 / 1.2, 30 / 1.2), ceil);
  // fluorescent strips over every lane
  for (const x of [-6.6, -3.4, 0, 3.4, 6.6]) for (let z = Z0 + 1.5; z < Z1 - 1; z += 3.2) K.emissive(root, M, new THREE.BoxGeometry(0.22, 0.05, 2.4).translate(x, CEIL - 0.05, z), [2.3, 2.3, 2.15]);
  // front wall with windows (daylight) + doors
  PI.box(wall, -HX, HX, 0, 0.7, Z1, Z1 + 0.25, 2.5); PI.box(wall, -HX, HX, 3.0, CEIL, Z1, Z1 + 0.25, 2.5);
  for (let x = -HX; x < HX; x += 3) PI.box(C("#c9ced6"), x - 0.06, x + 0.06, 0.7, 3.0, Z1, Z1 + 0.25);
  K.emissive(root, M, new THREE.BoxGeometry(HX * 2, 2.3, 0.02).translate(0, 1.85, Z1 + 0.3), [2.0, 1.95, 1.75]);
  // ---- aisle A (x -1.7..1.7): pudding section on the right side, z -7..-2 ----
  const pudTex = puddingTex();
  shelfRun(PI, -1.7, 1, -18, 1.4, (lv, si) => GOODS[(lv + si) % 5], () => stripTex(false), [[-18, -10], [-10, -4], [-4, 1.4]]);
  shelfRun(PI, 1.7, -1, -18, 1.4, (lv, si) => si === 1 ? pudTex : GOODS[(lv + si + 2) % 5], (lv, si) => stripTex(si === 1), [[-18, -7.5], [-7.5, -2], [-2, 1.4]]);
  // ---- aisle B (x 4.9..8.3): the emptied pudding run on the left side ----
  const emp = emptyTex();
  shelfRun(PI, 4.9, 1, -18, 1.4, (lv, si) => si === 1 ? emp : GOODS[(lv + si + 1) % 5], (lv, si) => stripTex(si === 1), [[-18, -9], [-9, -1], [-1, 1.4]]);
  shelfRun(PI, 8.4, -1, -18, 1.4, (lv, si) => GOODS[(lv + si + 3) % 5], () => stripTex(false), [[-18, -6], [-6, 1.4]]);
  // aisle C (x -8.3..-4.9) for depth
  shelfRun(PI, -4.9, -1, -18, 1.4, (lv, si) => GOODS[(lv + si + 4) % 5], () => stripTex(false), [[-18, -8], [-8, 1.4]]);
  shelfRun(PI, -8.4, 1, -18, 1.4, (lv, si) => GOODS[(lv + si) % 5], () => stripTex(false), [[-18, -8], [-8, 1.4]]);
  // hanging aisle signs
  K.plane(root, M, aisleTex("7", "DESSERTS", "PUDDING • JELLO"), 1.6, 0.8, [0, 3.35, -4.5], 0);
  K.plane(root, M, aisleTex("7", "DESSERTS", "PUDDING • JELLO"), 1.6, 0.8, [0, 3.35, -4.52], Math.PI);
  K.plane(root, M, aisleTex("8", "SNACKS", "CHIPS • COOKIES"), 1.6, 0.8, [6.6, 3.35, -4.5], 0);
  K.plane(root, M, aisleTex("6", "CEREAL", "BREAKFAST"), 1.6, 0.8, [-6.6, 3.35, -4.5], 0);
  for (const x of [0, 6.6, -6.6]) PI.rod(C("#5a5e66"), [x, 3.75, -4.5], [x, CEIL, -4.5], 0.01);
  // promo standee at the pudding section (faces the aisle mouth, turned toward the centre)
  const sx = 1.15, sz = -1.6;
  PI.box(C("#f4efe2"), sx - 0.05, sx + 0.05, 0, 0.05, sz - 0.35, sz + 0.35);
  K.plane(root, M, promoTex(), 0.82, 1.22, [sx, 1.25, sz], -0.55, 0xf4f4f4, true);
  PI.box(C("#c9ced6"), sx - 0.02, sx + 0.02, 0, 0.66, sz - 0.02, sz + 0.02);
  // shelf-talker star burst over the pudding
  const talker = ctex("talker", 256, 256, (g) => { g.fillStyle = "#f2c43b"; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = i % 2 ? 100 : 124; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
    g.fillStyle = "#c8323c"; g.font = "900 96px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("25¢", 128, 120); g.font = "900 26px Arial Black, Arial"; g.fillStyle = INK; g.fillText("EACH", 128, 180); });
  K.plane(root, M, talker, 0.55, 0.55, [1.66, 1.95, -4.6], -Math.PI / 2, 0xf4f4f4, true);
  // checkout lanes near the front
  for (const x of [-3.4, 3.4]) {
    PI.box(C("#3a3d46"), x - 0.4, x + 0.4, 0, 0.9, 3.6, 6.6); PI.box(C("#2a2a30"), x - 0.35, x + 0.35, 0.9, 0.93, 3.7, 6.0);
    PI.box(C("#d9dcd8"), x - 0.3, x + 0.3, 0.93, 1.25, 6.0, 6.5); PI.box(C("#2a2a30"), x - 0.2, x + 0.2, 1.25, 1.55, 6.1, 6.3);
    PI.rod(C("#c9ced6"), [x + 0.5, 0, 6.3], [x + 0.5, 2.6, 6.3], 0.03); K.emissive(root, M, new THREE.BoxGeometry(0.4, 0.4, 0.05).translate(x + 0.5, 2.75, 6.3), [2.2, 1.0, 0.5]);
  }
  // carts parked by the doors
  for (let i = 0; i < 4; i++) cart3(PI, -7.2 + i * 0.32, 6.8, Math.PI);

  // ---------------- stockroom (x 30..50, z -12..8, height 9) ----------------
  const SX0 = 30, SX1 = 50, SZ0 = -12, SZ1 = 8, SH = 9;
  const conc = lam("stConc", () => ({ map: concTex() })), blk = PL("#c8c0b0"), case_ = lam("pudCase", () => ({ map: caseTex() }));
  PI.box(conc, SX0, SX1, -0.02, 0, SZ0, SZ1, 4);
  PI.box(blk, SX0 - 0.3, SX0, 0, SH, SZ0, SZ1, 2.5); PI.box(blk, SX1, SX1 + 0.3, 0, SH, SZ0, SZ1, 2.5); PI.box(blk, SX0, SX1, 0, SH, SZ0 - 0.3, SZ0, 2.5);
  PI.box(blk, SX0, SX1, 0, SH, SZ1, SZ1 + 0.3, 2.5);
  PI.box(C("#6a6e76"), SX0, SX1, SH, SH + 0.2, SZ0, SZ1);
  for (let x = SX0 + 2; x < SX1; x += 4) { PI.box(C("#4a4e56"), x - 0.1, x + 0.1, SH - 0.5, SH, SZ0, SZ1); K.emissive(root, M, new THREE.BoxGeometry(0.3, 0.06, 3).translate(x, SH - 0.6, -2), [2.2, 2.1, 1.9]); K.emissive(root, M, new THREE.BoxGeometry(0.3, 0.06, 3).translate(x, SH - 0.6, 4), [2.2, 2.1, 1.9]); }
  // roll-up door (glowing daylight gap)
  PI.box(C("#9aa3ae"), 36, 42, 2.6, 4.4, SZ1 - 0.05, SZ1);
  K.emissive(root, M, new THREE.BoxGeometry(6, 2.6, 0.02).translate(39, 1.3, SZ1 - 0.02), [2.2, 2.0, 1.7]);
  // steel racks along the left wall full of other stock
  for (let z = SZ0 + 1; z < SZ1 - 2; z += 3.2) { for (const y of [0.1, 1.6, 3.1, 4.6]) { PI.box(C("#e07a3a"), SX0 + 0.2, SX0 + 1.4, y, y + 0.1, z, z + 3); for (let k = 0; k < 5; k++) PI.box(lam("pudCase", () => ({ map: caseTex() })), SX0 + 0.3, SX0 + 1.3, y + 0.1, y + 0.1 + U(r, 0.5, 1.2), z + 0.1 + k * 0.58, z + 0.6 + k * 0.58); }
    for (const zz of [z, z + 3]) PI.box(C("#2f5a8a"), SX0 + 0.2, SX0 + 0.3, 0, 6, zz - 0.05, zz + 0.05); }
  // THE PUDDING MOUNTAIN: stepped stacks of cases (tiled at 0.5 m) centred at (41, -3)
  const MX = 41, MZ = -3.5;
  for (let k = 0; k < 14; k++) {
    const hw = 4.6 - k * 0.3 + (k % 2 ? 0.1 : 0), hd = 3.6 - k * 0.24, y0 = k * 0.5;
    PI.box(case_, MX - hw, MX + hw, y0, y0 + 0.5, MZ - hd, MZ + hd, 0.5);
  }
  // loose cases tumbling off the edges for an irregular silhouette
  for (let i = 0; i < 70; i++) {
    const k = Math.floor(U(r, 0, 13)), hw = 4.6 - k * 0.3, hd = 3.6 - k * 0.24, side = Math.floor(r() * 4), t = U(r, -1, 1);
    const x = side < 2 ? MX + (side ? hw : -hw) + U(r, -0.1, 0.25) * (side ? 1 : -1) : MX + t * hw, z = side >= 2 ? MZ + (side === 2 ? hd : -hd) + U(r, -0.1, 0.25) * (side === 2 ? 1 : -1) : MZ + t * hd;
    PI.geo(new THREE.BoxGeometry(0.5, 0.5, 0.5).rotateY(U(r, -0.3, 0.3)).translate(x, k * 0.5 + 0.75, z), case_);
  }
  // pallets + hand truck at the mountain foot
  for (const [x, z] of [[35.5, 2.5], [46.5, 3.0]] as const) { PI.box(C("#b8864e"), x - 0.6, x + 0.6, 0, 0.15, z - 0.5, z + 0.5); PI.box(case_, x - 0.55, x + 0.55, 0.15, 1.15, z - 0.45, z + 0.45, 0.5); }
  // David's peeling table (shot 10): table, cup piles, scissors, a wall calendar on a pillar
  const TX = 44.5, TZ = 5.2;
  PI.box(C("#8a5a34"), TX - 1.1, TX + 1.1, 0.74, 0.8, TZ - 0.55, TZ + 0.55);
  for (const [dx, dz] of [[-1, -0.45], [1, -0.45], [-1, 0.45], [1, 0.45]] as const) PI.box(C("#5a3a22"), TX + dx - 0.04, TX + dx + 0.04, 0, 0.74, TZ + dz - 0.04, TZ + dz + 0.04);
  for (let i = 0; i < 26; i++) { const x = TX - 0.9 + U(r, 0, 0.9), z = TZ - 0.4 + U(r, 0, 0.8); cupLow(PI, x, 0.8, z); }
  for (let i = 0; i < 10; i++) { const x = TX + 0.3 + U(r, 0, 0.6); cupLow(PI, x, 0.8 + (i % 3) * 0.09, TZ - 0.2 + U(r, 0, 0.4)); }
  PI.box(C("#f4efe2"), TX + 0.1, TX + 0.9, 0.8, 0.83, TZ + 0.1, TZ + 0.45); // heap of cut barcodes
  PI.box(blk, 47.7, 48.3, 0, SH, 6.6, 7.2, 2.5);
  K.plane(root, M, calTex(), 0.52, 0.65, [48.0, 1.75, 6.58], Math.PI, 0xf4f4f4, true);
};
const cupLow = (P: Put, x: number, y: number, z: number) => {
  P.geo(new THREE.CylinderGeometry(0.04, 0.03, 0.08, 8).translate(x, y + 0.04, z), C("#7a4a2e"));
  P.geo(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 8).translate(x, y + 0.084, z), C("#d4dbe2"));
};
const cart3 = (P: Put, x: number, z: number, rot: number) => {
  const m = C("#c9ced6"), Q = P.at(x, z, rot);
  Q.box(m, -0.28, 0.28, 0.45, 0.48, -0.45, 0.45); Q.box(m, -0.28, -0.26, 0.48, 0.95, -0.45, 0.45); Q.box(m, 0.26, 0.28, 0.48, 0.95, -0.45, 0.45);
  Q.box(m, -0.28, 0.28, 0.48, 0.95, 0.43, 0.45); Q.box(m, -0.28, 0.28, 0.48, 0.95, -0.45, -0.43); Q.rod(C("#c8323c"), [-0.3, 1.05, 0.55], [0.3, 1.05, 0.55], 0.02);
  for (const [a, b] of [[-0.22, -0.4], [0.22, -0.4], [-0.22, 0.4], [0.22, 0.4]] as const) { Q.rod(m, [a, 0.08, b], [a, 0.45, b], 0.012); Q.geo(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8).rotateZ(Math.PI / 2).translate(a, 0.06, b), C("#2a2a30")); }
};

// ---------------- cameras ----------------
const WL = (p: V3) => W(p);
const CAMS: Record<number, Key[]> = {
  // hook: punch in on David holding one cup in the aisle mouth, the pudding section behind him
  1: [{ f: 0, s: (f) => dolly(WL([0.2, 1.55, 4.6]), WL([0.4, 1.45, -0.5]), pushK(f, 0, 0.0016, 0.012, 22), { fov: 44 }) },
    { f: 118, dur: 30, s: (f) => dolly(WL([1.0, 1.3, 2.3]), WL([0.3, 1.45, -0.5]), pushK(f, 118, 0.0025), { fov: 44, roll: -0.05 }) }],
  // aisle wide: David walks in, camera trucks with him toward the standee
  3: [{ f: 271, s: (f) => { const u = glide((f - 271) / 110); return { pos: WL([-0.3, 1.6, 6.2 - 2.2 * u]), look: WL([0.5, 1.3, -2.0 - 1.0 * u]), fov: 42, roll: 0 }; } },
    { f: 350, dur: 30, s: (f) => dolly(WL([-0.2, 1.45, 1.9]), WL([1.15, 1.3, -1.6]), pushK(f, 350, 0.004), { fov: 40 }) }],
  // standee close-up: snap in, then barcodes fly (overlay)
  4: [{ f: 394, s: (f) => dolly(WL([0.25, 1.32, 0.15]), WL([1.15, 1.22, -1.6]), pushK(f, 394, 0.0035), { fov: 38, roll: 0.04 }) }],
  // David's reaction: low angle, roll in on "doubles"
  5: [{ f: 460, s: (f) => dolly(WL([-1.0, 1.05, 2.2]), WL([0.35, 1.5, -1.0]), pushK(f, 460, 0.002), { fov: 42 }) },
    { f: 522, dur: 10, s: (f) => dolly(WL([-1.0, 1.05, 2.2]), WL([0.35, 1.6, -1.0]), 0.7 * pushK(f, 522, 0.003), { fov: 42, roll: -0.07 }) }],
  // the pudding shelf: track along the cups, then whip to David's face
  6: [{ f: 543, s: (f) => { const u = glide((f - 543) / 45); return { pos: WL([0.35, 1.25, -7.4 + 2.4 * u]), look: WL([1.7, 1.05, -5.6 + 2.0 * u]), fov: 38, roll: 0 }; } },
    { f: 592, dur: 9, s: (f) => dolly(WL([-0.9, 1.5, -1.3]), WL([0.55, 1.5, -3.6]), pushK(f, 592, 0.004), { fov: 40 }) }],
  // the math: wide, symmetric, David small at the shelf so the scale overlay owns the top of frame
  7: [{ f: 625, s: (f) => dolly(WL([-0.5, 1.75, 1.9]), WL([0.6, 2.3, -5.0]), pushK(f, 625, 0.0012), { fov: 46 }) }],
  // emptied aisle B: cart races toward camera, camera backs away (fast)
  8: [{ f: 743, s: (f) => { const u = (f - 743) / 71; return { pos: WL([6.4, 1.15, 0.6 + 1.6 * u]), look: WL([6.7, 1.2, -6.0 + 3.4 * u]), fov: 46, roll: 0.04 * Math.sin(f * 0.25) }; } }],
  // pudding mountain: start on David at the foot, crane up and back to reveal the whole stack
  9: [{ f: 814, s: (f) => dolly(WL([39.2, 1.4, 6.4]), WL([40.0, 1.5, 1.2]), pushK(f, 814, 0.001), { fov: 40 }) },
    { f: 838, dur: 90, s: () => ({ pos: WL([38.0, 7.8, 7.7]), look: WL([41.0, 3.2, -3.5]), fov: 46, roll: 0 }) }],
  // alone at the table: slow push, roll as the days burn
  10: [{ f: 970, s: (f) => dolly(WL([46.2, 1.65, 1.0]), WL([44.4, 1.3, 4.8]), pushK(f, 970, 0.0022), { fov: 42 }) },
    { f: 1050, dur: 18, s: (f) => dolly(WL([46.2, 1.65, 1.0]), WL([44.4, 1.45, 4.8]), 0.7 * pushK(f, 1050, 0.003), { fov: 42, roll: 0.06 }) }],
};
const DOF: Dof[] = [
  { f: 0, cInf: 10, focus: () => WL([0.4, 1.5, -0.4]) },
  { f: 271, cInf: 7, focus: (f) => WL([0.5, 1.2, 2.6 - 2.6 * glide((f - 271) / 110)]) },
  { f: 394, cInf: 9, focus: () => WL([1.15, 1.2, -1.6]) },
  { f: 460, cInf: 10, focus: () => WL([0.2, 1.6, -0.9]) },
  { f: 543, cInf: 10, focus: (f) => WL([1.6, 1.05, -5.6 + 2.0 * glide((f - 543) / 45)]) },
  { f: 592, dur: 6, cInf: 11, focus: () => WL([0.45, 1.6, -3.4]) },
  { f: 625, cInf: 6, focus: () => WL([0.5, 1.3, -3.6]) },
  { f: 743, cInf: 8, focus: (f) => WL([6.6, 1.0, -3.4 + 4.5 * ((f - 743) / 71)]) },
  { f: 814, cInf: 6, focus: () => WL([40.0, 1.4, 2.4]) },
  { f: 838, dur: 40, cInf: 0 },
  { f: 970, cInf: 10, focus: () => WL([44.6, 1.2, 5.0]) },
];
const KICKS: [number, number][] = [[121, 1.4], [526, 1.0], [601, 0.9], [711, 1.2], [790, 0.8], [853, 0.9], [1037, 0.6]];
const LIGHT: SetDef["LIGHT"] = {};

// ---------------- staging ----------------
const X = (o: Outfit, patch: Partial<Outfit>) => ({ ...o, ...patch }) as Outfit;
const PR = (s: string, k = 0) => [s, k] as unknown as FrontOpts["prop"];
const pop = (f: number, f0: number, d = 6) => { const u = Math.max(0, Math.min(1, (f - f0) / d)); return u <= 0 ? 0 : 1 + 0.25 * Math.sin(u * Math.PI); };
/** overflowing cart card (2D, ink style): basket heaped with pudding cases */
const cartCard = (p: Pen) => {
  const g = p.g;
  g.lineJoin = "round"; g.strokeStyle = INK;
  for (let i = 0; i < 9; i++) { const x = 70 + (i % 5) * 70 + (i > 4 ? 35 : 0), y = i > 4 ? 120 : 170; g.fillStyle = i % 2 ? "#c99a5e" : "#d8a868"; g.fillRect(x, y, 68, 54); g.lineWidth = 5; g.strokeRect(x, y, 68, 54); g.fillStyle = "#3f8a5a"; g.fillRect(x + 10, y + 20, 48, 14); }
  for (let i = 0; i < 3; i++) { const x = 140 + i * 70, y = 70; g.fillStyle = "#d8a868"; g.fillRect(x, y, 68, 54); g.lineWidth = 5; g.strokeRect(x, y, 68, 54); g.fillStyle = "#3f8a5a"; g.fillRect(x + 10, y + 20, 48, 14); }
  g.fillStyle = "rgba(201,206,214,0.35)"; g.beginPath(); g.moveTo(40, 220); g.lineTo(440, 220); g.lineTo(410, 400); g.lineTo(80, 400); g.closePath(); g.fill();
  g.lineWidth = 9; g.stroke(); g.lineWidth = 4; for (let x = 70; x < 430; x += 34) { g.beginPath(); g.moveTo(x, 222); g.lineTo(x + (x < 240 ? 8 : -8), 398); g.stroke(); } for (let y = 260; y < 400; y += 34) { g.beginPath(); g.moveTo(48, y); g.lineTo(432, y); g.stroke(); }
  g.lineWidth = 9; g.beginPath(); g.moveTo(440, 220); g.lineTo(480, 160); g.moveTo(80, 400); g.lineTo(70, 460); g.moveTo(410, 400); g.lineTo(420, 460); g.stroke();
  g.fillStyle = "#2a2a30"; for (const x of [70, 420]) { g.beginPath(); g.arc(x, 470, 18, 0, 7); g.fill(); g.stroke(); }
  g.strokeStyle = "#c8323c"; g.lineWidth = 12; g.beginPath(); g.moveTo(470, 150); g.lineTo(500, 160); g.stroke();
};
const speedLines = (p: Pen, t: number) => { const g = p.g; g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineCap = "round"; for (let i = 0; i < 8; i++) { const y = 30 + i * 28, x = (i * 67 + t * 300) % 300; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90, y); g.stroke(); } };
const sweat = (p: Pen) => { p.g.fillStyle = "#9fd4ff"; p.g.strokeStyle = INK; p.g.lineWidth = 6; p.g.beginPath(); p.g.moveTo(64, 10); p.g.quadraticCurveTo(110, 80, 64, 118); p.g.quadraticCurveTo(18, 80, 64, 10); p.g.fill(); p.g.stroke(); };
const barcodeBits = (p: Pen, t: number) => { const g = p.g; for (let i = 0; i < 14; i++) { const x = (i * 97) % 480 + 16, y = ((i * 53 + t * 900) % 480); g.save(); g.translate(x, y); g.rotate(i + t * 6); g.fillStyle = "#ffffff"; g.fillRect(-18, -12, 36, 24); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-18, -12, 36, 24); g.fillStyle = INK; for (let k = 0; k < 8; k++) g.fillRect(-14 + k * 3.6, -8, k % 3 ? 1.4 : 2.6, 16); g.restore(); } };

const stage = (id: number, f: number, S: StageAPI) => {
  const P = (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y?: number) => S.P(o, key, seed, W(at), opts, mirror, y);
  const card = (key: string, draw: (p: Pen) => void, at: V3, w: number, h: number, cw = 256, ch = 256, soft = false, rot = 0) => S.card(key, cw, ch, draw, W(at), w, h, soft, rot);
  if (id === 1) {
    const up = f >= 121; // "million": cup thrust up, sparkle
    P(CAST.david, "david", SEED.david, [0.35, 0, -0.5], { expr: f < 40 ? "smile" : up ? "laugh" : "grin", facing: 0, prop: PR("pudding"), tilt: up ? 3 : 0, look: 0.2 });
    if (up) card("stars" + (f % 16), (p) => fxStars(p, (f % 16) / 16), [0.62, 2.25, -0.45], 0.9 * pop(f, 121, 8), 0.47, 420, 220);
    P(CAST.shopper, "shopper", SEED.shopper, [-0.9, 0, -6.5], { expr: up ? "shock" : "neutral", facing: 1, look: 0.4 });
    P(CAST.shopper2, "shopper2", SEED.shopper2, [0.8, 0, -10.5], { expr: "neutral", facing: -1, mode: "stroll", phase: (f / 40) % 1 });
  } else if (id === 3) {
    const u = glide((f - 271) / 110), at: V3 = [0.25, 0, 2.4 - 2.4 * u];
    P(CAST.david, "david", SEED.david, at, { expr: f >= 345 ? "shock" : "neutral", mode: f < 360 ? "stroll" : "stand", phase: ((f - 271) / 30) % 1, facing: f >= 345 ? 1 : 0, look: f >= 345 ? 0.8 : 0 });
    P(CAST.shopper, "shopper", SEED.shopper, [-0.8, 0, -8 + 0.01 * (f - 271)], { expr: "neutral", facing: 1, mode: "stroll", phase: (f / 36) % 1 });
    P(CAST.stocker, "stocker", SEED.stocker, [1.1, 0, -12], { expr: "neutral", facing: 1, prop: PR("box") });
  } else if (id === 4) {
    // standee owns the frame; tiny sparkles on the offer
  } else if (id === 5) {
    const dbl = f >= 526;
    P(CAST.david, "david", SEED.david, [0.35, 0, -1.0], { expr: dbl ? "greedy" : "shock", facing: 1, look: 0.7, tilt: dbl ? -3 : 0 });
    if (dbl) card("sweat", sweat, [0.05, 2.05, -0.95], 0.13 * pop(f, 526), 0.13, 128, 128);
  } else if (id === 6) {
    const turn = f >= 592;
    P(CAST.david, "david", SEED.david, [0.55, 0, -3.6], { expr: turn ? (f >= 601 ? "shock" : "neutral") : "neutral", facing: 1, look: 0.9 });
    if (f >= 601) card("stars" + (f % 16), (p) => fxStars(p, (f % 16) / 16), [0.5, 2.15, -3.6], 0.8 * pop(f, 601), 0.42, 420, 220);
  } else if (id === 7) {
    P(CAST.david, "david", SEED.david, [0.5, 0, -3.6], { expr: f < 703 ? "smirk" : "greedy", facing: 1, look: 0.6, prop: PR("pudding") });
  } else if (id === 8) {
    const u = (f - 743) / 71, z = -6.5 + 4.6 * u;
    P(CAST.david, "david", SEED.david, [6.9, 0, z + 0.95], { expr: "laugh", mode: "march", phase: (f / 12) % 1, facing: 0 });
    card("cart", cartCard, [6.6, 0.75, z], 1.25, 1.25, 512, 512);
    card("speed" + (f % 10), (p) => speedLines(p, (f % 10) / 10), [6.6, 1.0, z - 0.8], 1.6, 0.8, 300, 260, true);
    P(CAST.cashier, "cashier", SEED.cashier, [5.6, 0, -9], { expr: "shock", facing: 1, look: 0.5 });
  } else if (id === 9) {
    P(CAST.david, "david", SEED.david, [40.0, 0, 2.6], { expr: f < 880 ? "grin" : "laugh", facing: 0, prop: PR("box"), tilt: 2 * Math.sin(f * 0.15) });
    P(CAST.manager, "manager", SEED.manager, [37.6, 0, 3.6], { expr: f < 850 ? "shock" : "dazed", facing: 1, look: 0.6 });
    P(CAST.stocker, "stocker", SEED.stocker, [44.2, 0, 3.0], { expr: "nervous", facing: -1, prop: PR("box") }, true);
  } else if (id === 10) {
    const late = f >= 1037;
    P(CAST.david, "david", SEED.david, [44.4, 0, 4.5], { expr: late ? "pained" : "nervous", facing: 0, prop: ["scissors", f / 8] as FrontOpts["prop"], tilt: late ? -4 : 0 });
    card("sweat", sweat, [44.05, 2.05, 4.45], 0.12, 0.12, 128, 128);
    if (f >= 1008) card("bits" + (f % 12), (p) => barcodeBits(p, (f % 12) / 12), [44.6, 1.5, 4.9], 1.6, 1.6, 512, 512, true);
  }
};
export const STORE: SetDef = { name: "store", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
