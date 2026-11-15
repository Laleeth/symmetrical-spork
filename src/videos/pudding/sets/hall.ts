// SET "hall" — a church-basement style community hall turned into a barcode-cutting assembly line, plus an airliner
// cabin at golden hour. Shots: 2 (hook: he gives the pudding away), 11 (pallets wheeled in), 12 (the assembly line, the
// big comedic reveal), 13 (tax write-off wink), 16 (window seat toast). Hall local x -10..10, z -14..6; cabin x 52..68.
import * as THREE from "three";
import { Put, C, PL, lam, quad, V, U, ctex, blot, INK, woodTex } from "../kit";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, glide } from "../cam";
import type { StageAPI, Outfit, FrontOpts } from "../stagekit";
import { fxStars } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import * as K from "./diner_kit";
import type { Pen } from "../toon";
export const ORIGIN: V3 = [-400, 0, 0];
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];

const plankTex = () => ctex("hallFloor", 512, 512, (g, r) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = ["#c98a52", "#b97a46", "#d49a60", "#c08048"][i % 4]; g.fillRect(i * 64, 0, 64, 512);
    g.fillStyle = "rgba(60,30,10,0.6)"; g.fillRect(i * 64, 0, 3, 512); const y = r() * 512; g.fillRect(i * 64, y, 64, 3); }
  for (let i = 0; i < 10; i++) blot(g, r() * 512, r() * 512, 100, r() > 0.5 ? "255,240,210" : "90,50,20", 0.13);
});
const caseTex = () => ctex("pudCase", 256, 256, (g, r) => {
  g.fillStyle = "#c99a5e"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) blot(g, r() * 256, r() * 256, 80, r() > 0.5 ? "255,235,200" : "120,80,40", 0.18);
  g.fillStyle = "#3f8a5a"; g.fillRect(28, 92, 200, 72); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(28, 92, 200, 72);
  g.fillStyle = "#f4efe2"; g.font = "900 30px Arial Black, Arial"; g.textAlign = "center"; g.fillText("PUDDING", 128, 124); g.font = "700 22px Arial"; g.fillText("48 CUPS", 128, 152);
  for (let i = 0; i < 4; i++) { const cx = 56 + i * 48; g.fillStyle = "#7a4a2e"; g.beginPath(); g.ellipse(cx, 52, 15, 18, 0, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = "rgba(40,22,14,0.75)"; g.fillRect(0, 0, 256, 5); g.fillRect(0, 0, 5, 256); g.fillRect(0, 124, 256, 3);
});
const bannerTex = () => ctex("hallBanner", 1024, 256, (g) => {
  g.fillStyle = "#c8323c"; g.fillRect(0, 0, 1024, 256); g.strokeStyle = "#f4efe2"; g.lineWidth = 10; g.strokeRect(16, 16, 992, 224); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(4, 4, 1016, 248);
  g.fillStyle = "#ffffff"; g.font = "900 96px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("FOOD DRIVE", 512, 108); g.font = "800 46px Arial"; g.fillText("VOLUNTEERS WELCOME", 512, 190);
});
const clothTex = () => ctex("tablecloth", 256, 256, (g) => { g.fillStyle = "#f4efe2"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(200,50,60,0.35)"; for (let i = 0; i < 256; i += 32) { g.fillRect(i, 0, 14, 256); g.fillRect(0, i, 256, 14); } });
const skyTex = () => ctex("goldSky", 256, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#ffb86a"); gr.addColorStop(0.55, "#ffd89a"); gr.addColorStop(0.62, "#fff2d0"); gr.addColorStop(1, "#e88a5a"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(255,255,255,0.75)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(40 + i * 60, 170 + (i % 2) * 14, 50, 9, 0, 0, 7); g.fill(); } });

// ---------------- geometry ----------------
const HX = 10, Z0 = -14, Z1 = 6, CEIL = 5;
/** long table along z with cloth, cases and loose cups */
const table = (P: Put, r: () => number, x: number, za: number, zb: number) => {
  const cloth = lam("cloth", () => ({ map: clothTex() })), legs = C("#5a5e66"), cs = lam("pudCaseH", () => ({ map: caseTex() }));
  P.box(cloth, x - 0.5, x + 0.5, 0.72, 0.76, za, zb, 0.8); P.box(cloth, x - 0.51, x + 0.51, 0.5, 0.76, za, za + 0.01, 0.8); P.box(cloth, x - 0.51, x + 0.51, 0.5, 0.76, zb - 0.01, zb, 0.8);
  for (const z of [za + 0.2, zb - 0.2]) for (const s of [-1, 1]) P.box(legs, x + s * 0.4 - 0.02, x + s * 0.4 + 0.02, 0, 0.72, z - 0.02, z + 0.02);
  for (let z = za + 0.6; z < zb - 0.4; z += U(r, 0.9, 1.5)) {
    P.geo(new THREE.BoxGeometry(0.42, 0.32, 0.42).rotateY(U(r, -0.3, 0.3)).translate(x + U(r, -0.1, 0.1), 0.92, z), cs);
    for (let k = 0; k < 6; k++) { const cx = x + U(r, -0.4, 0.4), cz = z + U(r, -0.45, 0.45); P.geo(new THREE.CylinderGeometry(0.04, 0.03, 0.08, 8).translate(cx, 0.8, cz), C("#7a4a2e")); P.geo(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 8).translate(cx, 0.84, cz), C("#d4dbe2")); }
    for (let k = 0; k < 5; k++) P.box(C("#ffffff"), x - 0.4 + U(r, 0, 0.75), x - 0.35 + U(r, 0, 0.75) + 0.05, 0.76, 0.765, z + U(r, -0.4, 0.4), z + U(r, -0.4, 0.4) + 0.03);
  }
};
const chair = (P: Put, x: number, z: number, s: 1 | -1) => {
  const m = C("#4a5a7a");
  P.box(m, x - 0.21, x + 0.21, 0.44, 0.48, z - 0.21, z + 0.21); P.box(m, x + s * 0.19 - 0.02, x + s * 0.19 + 0.02, 0.48, 0.9, z - 0.21, z + 0.21);
  for (const a of [-0.18, 0.18]) for (const b of [-0.18, 0.18]) P.box(C("#3a3d46"), x + a - 0.015, x + a + 0.015, 0, 0.44, z + b - 0.015, z + b + 0.015);
};
const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  const M = P.M, floor = lam("hallFloor", () => ({ map: plankTex() })), wall = PL("#efe2c4"), wain = lam("hallWain", () => ({ map: woodTex("#8a5a34") }));
  PI.box(floor, -HX, HX, -0.02, 0, Z0, Z1, 3);
  PI.box(wall, -HX - 0.25, -HX, 0, CEIL, Z0, Z1, 2.5); PI.box(wall, HX, HX + 0.25, 0, CEIL, Z0, Z1, 2.5); PI.box(wall, -HX, HX, 0, CEIL, Z0 - 0.25, Z0, 2.5);
  for (const x of [-HX + 0.02, HX - 0.06]) PI.box(wain, x, x + 0.04, 0, 1.1, Z0, Z1, 1);
  PI.box(wain, -HX, HX, 0, 1.1, Z0, Z0 + 0.04, 1);
  // front wall with double doors (daylight)
  PI.box(wall, -HX, -1.2, 0, CEIL, Z1, Z1 + 0.25, 2.5); PI.box(wall, 1.2, HX, 0, CEIL, Z1, Z1 + 0.25, 2.5); PI.box(wall, -1.2, 1.2, 2.6, CEIL, Z1, Z1 + 0.25, 2.5);
  K.emissive(root, M, new THREE.BoxGeometry(2.4, 2.6, 0.02).translate(0, 1.3, Z1 + 0.3), [2.3, 2.15, 1.8]);
  for (const s of [-1, 1]) PI.box(C("#7a3a2c"), s * 1.2 - 0.05, s * 1.2 + 0.05, 0, 2.6, Z1 - 0.05, Z1 + 0.3);
  // ceiling + timber trusses + hanging lamps
  PI.geo(quad(V(-HX, CEIL, Z0), V(HX, CEIL, Z0), V(HX, CEIL, Z1), V(-HX, CEIL, Z1), 8, 8), C("#e8dcc0"));
  for (let z = Z0 + 2; z < Z1; z += 4) { PI.box(C("#6a4026"), -HX, HX, CEIL - 0.35, CEIL, z - 0.15, z + 0.15); for (const x of [-5, 0, 5]) { PI.rod(C("#2a2a30"), [x, CEIL - 0.35, z], [x, 3.6, z], 0.012); PI.geo(new THREE.ConeGeometry(0.32, 0.3, 14, 1, true).translate(x, 3.5, z), C("#2f5a3a")); K.emissive(root, M, new THREE.CylinderGeometry(0.28, 0.28, 0.02, 12).translate(x, 3.36, z), [2.4, 2.1, 1.6]); } }
  // tall windows on the left wall with sun shafts
  for (let z = Z0 + 2.5; z < Z1 - 1; z += 3.4) {
    K.emissive(root, M, new THREE.BoxGeometry(0.02, 2.2, 1.3).translate(-HX + 0.05, 2.6, z), [2.2, 2.05, 1.7]);
    PI.box(C("#f4efe2"), -HX + 0.02, -HX + 0.12, 1.45, 1.5, z - 0.7, z + 0.7); PI.box(C("#f4efe2"), -HX + 0.02, -HX + 0.12, 3.7, 3.75, z - 0.7, z + 0.7);
    PI.box(C("#f4efe2"), -HX + 0.02, -HX + 0.12, 1.5, 3.7, z - 0.03, z + 0.03);
    K.glowPlane(root, M, 1.2, 2.4, [-HX + 2.6, 0.03, z + 0.8], [-Math.PI / 2, 0, 0.35], "#ffd9a0", 0.22, "none");
    K.glowPlane(root, M, 1.2, 5.0, [-HX + 1.4, 2.2, z + 0.4], [0, Math.PI / 2, -0.9], "#ffe2b0", 0.07);
  }
  // stage at the back with a banner
  PI.box(C("#8a5a34"), -6, 6, 0, 0.7, Z0, Z0 + 2.6); PI.box(C("#6a4026"), -6, 6, 0.6, 0.7, Z0 + 2.6, Z0 + 2.65);
  PI.box(C("#9a2a32"), -6.2, -5.2, 0.7, CEIL, Z0 + 0.05, Z0 + 0.6); PI.box(C("#9a2a32"), 5.2, 6.2, 0.7, CEIL, Z0 + 0.05, Z0 + 0.6);
  K.plane(root, M, bannerTex(), 6, 1.5, [0, 3.2, Z0 + 0.08], 0, 0xf4f4f4, true);
  // three long tables
  for (const x of [-5, 0, 5]) { table(PI, r, x, -11.5, -1.5); for (let z = -11; z < -1.8; z += 1.1) { chair(PI, x - 0.85, z, -1); chair(PI, x + 0.85, z, 1); } }
  // pallets of cases inside the door
  const cs = lam("pudCaseH", () => ({ map: caseTex() }));
  for (const [x, z, h] of [[3.4, 3.6, 1.5], [5.4, 3.2, 2.0], [-3.6, 3.4, 1.0]] as const) { PI.box(C("#b8864e"), x - 0.65, x + 0.65, 0, 0.15, z - 0.55, z + 0.55); PI.box(cs, x - 0.6, x + 0.6, 0.15, 0.15 + h, z - 0.5, z + 0.5, 0.5); }
  // bins of cut barcodes at the table ends
  for (const x of [-5, 0, 5]) { PI.geo(new THREE.CylinderGeometry(0.3, 0.25, 0.6, 14, 1, true).translate(x, 0.3, -0.8), C("#2f6a8a")); PI.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 14).translate(x, 0.55, -0.8), C("#ffffff")); }
  // flags / bulletin board on the right wall
  PI.box(C("#b8864e"), HX - 0.08, HX - 0.02, 1.4, 2.6, -6, -3);
  for (let i = 0; i < 8; i++) PI.box(C(["#f4efe2", "#f2c43b", "#9ab4d8", "#e8668e"][i % 4]), HX - 0.1, HX - 0.08, 1.55 + (i % 3) * 0.33, 1.8 + (i % 3) * 0.33, -5.8 + Math.floor(i / 3) * 0.95, -5.2 + Math.floor(i / 3) * 0.95);

  // ---------------- airliner cabin (x 52..68): aisle along z, windows on the left wall at x = 56.2 ----------------
  const CX = 58, seatBlue = C("#2f4a7a"), head = C("#e8e4da"), panel = C("#ece8de");
  PI.box(C("#5a5e76"), CX - 2.2, CX + 2.2, -0.02, 0, -10, 10);
  PI.box(C("#8a2a32"), CX - 0.35, CX + 0.35, 0.0, 0.01, -10, 10); // aisle carpet
  // side walls (slanted upper panels) + ceiling bins
  for (const s of [-1, 1]) {
    PI.box(panel, CX + s * 2.2 - 0.1, CX + s * 2.2 + 0.1, 0, 1.0, -10, 10);
    PI.geo(new THREE.BoxGeometry(0.12, 1.4, 20).rotateZ(-s * 0.22).translate(CX + s * 2.05, 1.7, 0), panel);
    PI.geo(new THREE.BoxGeometry(0.9, 0.5, 20).translate(CX + s * 1.55, 2.25, 0), C("#f4f1ea"));
    PI.box(C("#c9c4bc"), CX + s * 1.1 - 0.02, CX + s * 1.1 + 0.02, 2.0, 2.5, -10, 10);
  }
  PI.box(C("#f4f1ea"), CX - 1.2, CX + 1.2, 2.55, 2.6, -10, 10);
  K.emissive(root, M, new THREE.BoxGeometry(0.06, 0.04, 20).translate(CX - 1.12, 2.5, 0), [1.6, 1.4, 1.1]);
  const sky = lam("goldSky", () => ({ map: skyTex() }));
  for (let z = -9; z < 10; z += 0.9) {
    const xw = CX - 2.05;
    PI.geo(quad(V(xw, 1.1, z - 0.18), V(xw, 1.1, z + 0.18), V(xw - 0.05 + 0.1, 1.55, z + 0.18), V(xw - 0.05 + 0.1, 1.55, z - 0.18)), sky);
    K.emissive(root, M, new THREE.BoxGeometry(0.01, 0.42, 0.33).rotateZ(0.22).translate(xw + 0.02, 1.32, z), [2.6, 1.9, 1.15]);
    PI.box(C("#d8d4cc"), xw, xw + 0.06, 1.05, 1.1, z - 0.22, z + 0.22); PI.box(C("#d8d4cc"), xw + 0.08, xw + 0.14, 1.56, 1.61, z - 0.22, z + 0.22);
    K.glowPlane(root, M, 0.5, 1.4, [xw + 0.9, 0.7, z + 0.2], [0, Math.PI / 2, -1.0], "#ffc070", 0.12);
  }
  // seat rows: 3 on the left (window side), 3 on the right, every 0.9 m
  for (let z = -9; z < 10; z += 0.9) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    if (s < 0 && z > -3.0 && z < -0.5) continue; // open row in front of the family for the camera
    const x = CX + s * (0.6 + k * 0.5);
    PI.box(seatBlue, x - 0.23, x + 0.23, 0.4, 0.5, z - 0.25, z + 0.2); PI.box(seatBlue, x - 0.23, x + 0.23, 0.5, 1.15, z + 0.2, z + 0.32);
    PI.box(head, x - 0.18, x + 0.18, 0.95, 1.15, z + 0.17, z + 0.19);
    PI.box(C("#2a2a30"), x - 0.03, x + 0.03, 0, 0.4, z - 0.1, z + 0.1);
  }
};

// ---------------- cameras ----------------
const CAMS: Record<number, Key[]> = {
  // hook b: low dolly along the floor following the hand truck toward the tables
  2: [{ f: 165, s: (f) => { const u = glide((f - 165) / 106); return { pos: W([1.6, 0.75, 5.2 - 2.6 * u]), look: W([-0.6, 1.25, -4.0 - 1.0 * u]), fov: 46, roll: 0.03 }; } }],
  // pallets in through the doors: from inside, door glow behind
  11: [{ f: 1082, s: (f) => dolly(W([-2.4, 1.5, -2.6]), W([1.3, 1.25, 4.4]), pushK(f, 1082, 0.0018), { fov: 42 }) },
    { f: 1137, dur: 16, s: (f) => dolly(W([-2.4, 1.6, -2.6]), W([0.0, 1.35, 1.0]), pushK(f, 1137, 0.002), { fov: 40, roll: -0.04 }) }],
  // the assembly line: crane up from table level to the whole hall
  12: [{ f: 1170, s: (f) => ({ pos: W([2.6, 1.15, 0.6]), look: W([0.0, 0.95, -5.0]), fov: 44, roll: 0 }) },
    { f: 1186, dur: 50, s: () => ({ pos: W([8.2, 4.4, 4.6]), look: W([-0.8, 0.5, -6.2]), fov: 52, roll: 0 }) }],
  // wink close
  13: [{ f: 1242, s: (f) => dolly(W([1.4, 1.55, 1.6]), W([0.5, 1.6, -0.6]), pushK(f, 1242, 0.003), { fov: 38 }) }],
  // window seat: from the aisle toward the window, slow push to the toast
  16: [{ f: 1492, s: (f) => dolly(W([57.4, 1.5, -3.4]), W([57.3, 1.15, 0.1]), pushK(f, 1492, 0.0018), { fov: 46 }) },
    { f: 1548, dur: 40, s: (f) => dolly(W([57.2, 1.45, -2.6]), W([57.0, 1.2, 0.1]), pushK(f, 1548, 0.0015), { fov: 46, roll: -0.03 }) }],
};
const DOF: Dof[] = [
  { f: 165, cInf: 8, focus: (f) => W([0.6, 1.0, 2.5 - 4.0 * glide((f - 165) / 106)]) },
  { f: 1082, cInf: 9, focus: () => W([0.4, 1.2, 3.4]) },
  { f: 1170, cInf: 8, focus: () => W([0.0, 1.0, -3.0]) },
  { f: 1186, dur: 40, cInf: 0 },
  { f: 1242, cInf: 11, focus: () => W([0.55, 1.6, -0.3]) },
  { f: 1492, cInf: 7, focus: () => W([57.3, 1.1, 0.0]) },
];
const KICKS: [number, number][] = [[234, 1.0], [1153, 0.8], [1201, 1.0], [1276, 0.7], [1523, 0.6]];
const LIGHT: SetDef["LIGHT"] = { 16: { light: "golden", sunAz: 200, sunEl: 10 } };

// ---------------- staging ----------------
const X = (o: Outfit, patch: Partial<Outfit>) => ({ ...o, ...patch }) as Outfit;
const PR = (s: string, k = 0) => [s, k] as unknown as FrontOpts["prop"];
const pop = (f: number, f0: number, d = 6) => { const u = Math.max(0, Math.min(1, (f - f0) / d)); return u <= 0 ? 0 : 1 + 0.25 * Math.sin(u * Math.PI); };
const SIT = -0.38;
/** hand truck stacked with cases (2D card) */
const truckCard = (p: Pen) => {
  const g = p.g; g.strokeStyle = INK; g.lineJoin = "round";
  for (let i = 0; i < 5; i++) { const y = 380 - i * 74, x = 110 + (i % 2) * 8; g.fillStyle = i % 2 ? "#c99a5e" : "#d8a868"; g.fillRect(x, y, 180, 70); g.lineWidth = 6; g.strokeRect(x, y, 180, 70); g.fillStyle = "#3f8a5a"; g.fillRect(x + 40, y + 24, 100, 20); g.lineWidth = 3; g.strokeRect(x + 40, y + 24, 100, 20); }
  g.lineWidth = 12; g.strokeStyle = "#c8323c"; g.beginPath(); g.moveTo(320, 30); g.lineTo(310, 470); g.lineTo(100, 470); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(326, 30); g.lineTo(316, 476); g.lineTo(96, 476); g.stroke();
  g.fillStyle = "#2a2a30"; g.beginPath(); g.arc(300, 478, 30, 0, 7); g.fill(); g.lineWidth = 6; g.stroke();
};
const confetti = (p: Pen, t: number) => {
  const g = p.g;
  for (let i = 0; i < 26; i++) {
    const x = (i * 131) % 500 + 6, y = (i * 71 + t * 512) % 512;
    g.save(); g.translate(x, y); g.rotate(i * 1.7 + t * 8); g.fillStyle = "#ffffff"; g.fillRect(-16, -10, 32, 20); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-16, -10, 32, 20);
    g.fillStyle = INK; for (let k = 0; k < 7; k++) g.fillRect(-12 + k * 3.6, -7, k % 3 ? 1.3 : 2.4, 14); g.restore();
  }
};
const VOLS = ["vol1", "vol2", "vol3", "vol4", "vol5", "vol6"];
const stage = (id: number, f: number, S: StageAPI) => {
  const P = (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y?: number) => S.P(o, key, seed, W(at), opts, mirror, y);
  const card = (key: string, draw: (p: Pen) => void, at: V3, w: number, h: number, cw = 256, ch = 256, soft = false, rot = 0) => S.card(key, cw, ch, draw, W(at), w, h, soft, rot);
  /** a seated volunteer at table x, row z, on side s, snipping in rhythm */
  const vol = (i: number, x: number, z: number, s: 1 | -1, busy: boolean) => {
    const k = VOLS[i % VOLS.length];
    P(CAST[k], k, SEED[k] + i * 2, [x + s * 0.85, 0, z], { expr: busy ? (i % 3 ? "grin" : "laugh") : "neutral", facing: (-s) as 1 | -1, prop: busy ? (["scissors", f / 6 + i] as FrontOpts["prop"]) : PR("pudding"), look: -s * 0.4 }, false, SIT);
  };
  if (id === 2) {
    const u = glide((f - 165) / 106), at: V3 = [0.6, 0, 3.2 - 4.0 * u];
    P(CAST.david, "david", SEED.david, at, { expr: f >= 234 ? "laugh" : "grin", mode: "stroll", phase: ((f - 165) / 28) % 1, facing: 0 });
    card("truck", truckCard, [at[0] - 0.75, 0.8, at[2] - 0.2], 1.0, 1.25, 420, 520);
    for (let i = 0; i < 6; i++) vol(i, i < 3 ? 0 : -5, -2.6 - (i % 3) * 1.1, i % 2 ? 1 : -1, false);
    if (f >= 234) { P(CAST.vol1, "vol1s", SEED.vol1, [-0.5, 0, -1.4], { expr: "shock", facing: 1, look: 0.6 }); card("stars" + (f % 16), (p) => fxStars(p, (f % 16) / 16), [-0.5, 2.1, -1.4], 0.8 * pop(f, 234), 0.42, 420, 220); }
  } else if (id === 11) {
    const u = glide((f - 1082) / 70), at: V3 = [0.3, 0, 5.2 - 2.4 * u];
    P(CAST.david, "david", SEED.david, at, { expr: "smile_closed", mode: u < 1 ? "stroll" : "stand", phase: ((f - 1082) / 28) % 1, facing: 0 });
    card("truck", truckCard, [at[0] + 0.75, 0.8, at[2] - 0.15], 1.0, 1.25, 420, 520);
    const turned = f >= 1137;
    P(CAST.vol2, "vol2", SEED.vol2, [-1.6, 0, 0.6], { expr: turned ? "shock" : "neutral", facing: turned ? 1 : -1, look: turned ? 0.6 : -0.3 });
    P(CAST.vol4, "vol4", SEED.vol4, [2.4, 0, 0.2], { expr: turned ? "laugh" : "neutral", facing: turned ? -1 : 1, look: turned ? -0.5 : 0.3 });
    P(CAST.vol3, "vol3", SEED.vol3, [1.5, 0, 2.4], { expr: turned ? "grin" : "neutral", facing: 1 });
  } else if (id === 12) {
    // every seat filled, every pair of scissors going; barcodes fly
    let i = 0;
    for (const x of [-5, 0, 5]) for (let z = -11; z < -1.8; z += 1.1) for (const s of [-1, 1] as const) { if ((i * 7) % 5 !== 4) vol(i, x, z, s, true); i++; }
    P(CAST.david, "david", SEED.david, [2.5, 0, -0.6], { expr: "laugh", facing: -1, prop: PR("pudding"), look: -0.5 });
    for (const [x, z] of [[0, -4], [-5, -7], [5, -5], [0, -9], [-5, -3], [5, -9]] as const) card("conf" + ((f + x * 3) % 20), (p) => confetti(p, ((f + x * 3) % 20) / 20), [x, 1.6, z], 2.0, 2.0, 512, 512, true);
  } else if (id === 13) {
    const wink = f >= 1276;
    P(CAST.david, "david", SEED.david, [0.5, 0, -0.6], { expr: wink ? "wink" : "smirk", facing: -1, look: -0.3, prop: PR("envelope") });
    vol(0, 0, -2.6, -1, true); vol(3, -5, -3.0, 1, true);
    if (wink) card("stars" + (f % 16), (p) => fxStars(p, (f % 16) / 16), [0.35, 2.1, -0.6], 0.6 * pop(f, 1276), 0.32, 420, 220);
  } else if (id === 16) {
    const toast = f >= 1548;
    P(CAST.david, "david", SEED.david, [56.85, 0, 0.0], { expr: f >= 1569 ? "smile_closed" : toast ? "grin" : "smile", facing: -1, prop: toast ? PR("pudding") : undefined, look: -0.6, tilt: toast ? -3 : 0 }, false, SIT + 0.05);
    P(CAST.wife, "wife", SEED.wife, [57.35, 0, 0.0], { expr: f >= 1523 ? "laugh" : "smile", facing: -1, look: -0.4 }, false, SIT + 0.05);
    P(CAST.kid, "kid", SEED.kid, [57.85, 0, 0.0], { expr: "grin", facing: -1, look: -0.4 }, false, SIT + 0.15);
    if (toast) card("stars" + (f % 16), (p) => fxStars(p, (f % 16) / 16), [56.9, 1.75, 0.05], 0.55, 0.3, 420, 220);
  }
};
export const HALL: SetDef = { name: "hall", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
