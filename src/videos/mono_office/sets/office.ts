// SET "office": (A) a 2000-era FBI field office (shots 11, 12) at local z -9..7 and (B) a wood-panelled courtroom
// (shots 15, 16) at local z +46..68 (CR frame = local + [0, 0, 60]). Local metres, y up, built at ORIGIN.
import * as THREE from "three";
import { Put, C, PL, WD, lam, V, quad, U, pick, dim } from "../kit";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, glide } from "../cam";
import { Pen, INK } from "../stagekit";
import type { StageAPI } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import { NOINK } from "../ink";
import { carpetTex, ceilTex, panelTex, plankTex, towerTex, blindTex, stripeTex, poolTex, crtTex, boxTex, cabTex, corkTex, plaqueTex, clockTex,
  sealTex, flagTex, cashTex, cashSideTex, checkTex, tagTex, parkTex } from "./office_tex";
export const ORIGIN: V3 = [-400, 0, 0];
/** local -> world */
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];
/** courtroom local -> world */
const CRZ = 60;
const WC = (p: V3): V3 => W([p[0], p[1], p[2] + CRZ]);

// ---------------- materials ----------------
const TX = (key: string, tex: () => THREE.Texture) => lam(key, () => ({ map: tex() }));
const basic = (tex: THREE.Texture | null, col: THREE.ColorRepresentation | THREE.Color = 0xffffff) => new THREE.MeshBasicMaterial({ map: tex, color: col });
const addM = (root: THREE.Object3D, P: Put, geo: THREE.BufferGeometry, mat: THREE.Material, noink = true) => {
  const m = new THREE.Mesh(geo, mat); m.applyMatrix4(P.M); m.matrixAutoUpdate = false; m.updateMatrix();
  if (noink) m.layers.set(NOINK); root.add(m); return m;
};
let _decal: Map<string, THREE.MeshBasicMaterial> | null = null;
const decal = (key: string, tex: () => THREE.Texture, k: number) => {
  if (!_decal) _decal = new Map();
  let m = _decal.get(key + k);
  if (!m) { m = new THREE.MeshBasicMaterial({ map: tex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(k, k * 0.85, k * 0.65), polygonOffset: true, polygonOffsetFactor: -2 }); _decal.set(key + k, m); }
  return m;
};
/** flat textured sign quad facing +z in P's frame */
const signQ = (P: Put, m: THREE.Material, x0: number, x1: number, y0: number, y1: number, z: number) => P.geo(quad(V(x0, y0, z), V(x1, y0, z), V(x1, y1, z), V(x0, y1, z)), m);
const floorPool = (root: THREE.Object3D, P: Put, x: number, y: number, z: number, rx: number, rz: number, k: number) =>
  addM(root, P, quad(V(x - rx, y, z + rz), V(x + rx, y, z + rz), V(x + rx, y, z - rz), V(x - rx, y, z - rz)), decal("pool", poolTex, k));

// ---------------- office furniture ----------------
const STEEL = "#7f8a82", LAMI = "#9a6a44";
const monitor = (P: Put, root: THREE.Object3D, k: number) => {
  P.box(C("#d8cfb8"), -0.21, 0.21, 0.03, 0.4, -0.2, 0.2); P.box(C("#cbc1a6"), -0.16, 0.16, 0.08, 0.34, -0.44, -0.2);
  P.box(C("#cbc1a6"), -0.13, 0.13, 0, 0.03, -0.14, 0.12);
  P.box(C("#4a4640"), -0.185, 0.185, 0.07, 0.37, 0.2, 0.215);
  addM(root, P, quad(V(-0.165, 0.09, 0.217), V(0.165, 0.09, 0.217), V(0.165, 0.35, 0.217), V(-0.165, 0.35, 0.217)), basic(crtTex(k), new THREE.Color(1.15, 1.15, 1.15)));
  P.geo(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6).rotateX(Math.PI / 2).translate(0.15, 0.05, 0.21), C("#6fd06a"));
};
const bankerLamp = (P: Put, root: THREE.Object3D, x: number, z: number) => {
  const L = P.at(x, z, 0, 0.76);
  L.geo(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 14).translate(0, 0.015, 0), C("#c9a24a"));
  L.rod(C("#c9a24a"), [0, 0.03, 0], [0, 0.34, 0], 0.012);
  L.geo(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).translate(0, 0.36, 0), C("#2f7a4a"));
  L.box(C("#2f7a4a"), -0.14, 0.14, 0.36, 0.37, -0.1, 0.1);
  addM(root, L, new THREE.BoxGeometry(0.24, 0.015, 0.1).translate(0, 0.355, 0), basic(null, new THREE.Color(2.2, 1.8, 1.1)));
  floorPool(root, L, 0, 0.004, 0.05, 0.45, 0.32, 0.55);
};
const chair = (P: Put, x: number, z: number, rot: number) => {
  const c = P.at(x, z, rot), blk = C("#2c2e36");
  c.box(blk, -0.25, 0.25, 0.42, 0.5, -0.24, 0.24); c.box(blk, -0.23, 0.23, 0.55, 1.05, -0.3, -0.24);
  c.rod(C("#55585f"), [0, 0.08, 0], [0, 0.42, 0], 0.03); c.rod(C("#55585f"), [0, 0.5, -0.2], [0, 0.6, -0.27], 0.02);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; c.rod(C("#3a3c44"), [0, 0.08, 0], [Math.sin(a) * 0.3, 0.05, Math.cos(a) * 0.3], 0.02); }
};
const fileBox = (P: Put, x: number, z: number, rot: number, n: number) => {
  const b = P.at(x, z, rot);
  for (let i = 0; i < n; i++) { const y = i * 0.29; b.box(TX("ofBoxM", boxTex), -0.22, 0.22, y, y + 0.26, -0.16, 0.16); b.box(C("#c9a46c"), -0.235, 0.235, y + 0.24, y + 0.29, -0.175, 0.175); }
};
const papers = (P: Put, r: () => number, x: number, z: number) => {
  let y = 0.76;
  for (let i = 0; i < 2 + Math.floor(r() * 3); i++) { const h = U(r, 0.015, 0.05), c = pick(r, ["#f3eee2", "#e6c47a", "#f3eee2", "#d9e2ec"]), dx = U(r, -0.03, 0.03); P.box(C(c), x - 0.15 + dx, x + 0.15 + dx, y, y + h, z - 0.11, z + 0.11); y += h; }
};
type DeskO = { mon?: number; monX?: number; lamp?: boolean; boxes?: number; chair?: boolean; k?: number };
const desk = (P: Put, root: THREE.Object3D, r: () => number, x: number, z: number, rot: number, o: DeskO = {}) => {
  const D = P.at(x, z, rot), st = C(STEEL), dk = C("#33343a");
  D.box(WD(LAMI), -0.85, 0.85, 0.72, 0.76, -0.42, 0.42, 1.0);
  D.box(C(dim(LAMI, 0.6)), -0.86, 0.86, 0.7, 0.72, -0.43, 0.43);
  for (const s of [-1, 1]) {
    D.box(st, s > 0 ? 0.42 : -0.83, s > 0 ? 0.83 : -0.42, 0, 0.7, -0.4, 0.38);
    for (const y of [0.24, 0.47]) D.box(dk, s > 0 ? 0.44 : -0.81, s > 0 ? 0.81 : -0.44, y - 0.012, y + 0.012, -0.41, 0.39);
  }
  D.box(C(dim(STEEL, 0.85)), -0.42, 0.42, 0.22, 0.7, 0.3, 0.34);
  if (o.mon !== undefined) monitor(D.at(o.monX ?? -0.45, -0.1, o.mon, 0.76), root, o.k ?? 0);
  D.box(C("#d0c7b0"), -0.24, 0.2, 0.76, 0.79, -0.33, -0.17);
  papers(D, r, 0.5, 0.1);
  if (r() < 0.6) papers(D, r, 0.15, 0.22);
  D.geo(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 10).translate(0.25, 0.81, -0.25), C(pick(r, ["#e8e2d0", "#c8323c", "#2f5a8a"])));
  if (o.lamp) bankerLamp(D, root, 0.66, -0.25);
  if (o.chair !== false) chair(D, 0.05, -0.85, U(r, -0.3, 0.3));
  if (o.boxes) fileBox(D, 1.15, 0.0, U(r, -0.2, 0.2), o.boxes);
};
const cabinet = (P: Put, x: number, z: number, rot: number) => {
  const c = P.at(x, z, rot);
  c.box(C("#8a9188"), -0.25, 0.25, 0, 1.33, -0.6, 0);
  signQ(c, TX("ofCabM", cabTex), -0.25, 0.25, 0.02, 1.31, 0.004);
};

// ---------------- OFFICE build ----------------
const OX0 = -7, OX1 = 7, OZ0 = -9, OZ1 = 7, OH = 2.9;
const WINS = [-4.95, -1.65, 1.65, 4.95], WW = 2.8, WY0 = 0.9, WY1 = 2.45;
const buildOffice = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  const wall = PL("#cfc09e"), trim = C("#6a4a34"), alu = C("#5d636e");
  // floor, ceiling
  PI.box(TX("ofCarpetM", () => carpetTex("#5f6f86")), OX0 - 6, OX1, -0.05, 0, OZ0, OZ1, 2);
  PI.box(TX("ofCeilM", ceilTex), OX0 - 6, OX1, OH, OH + 0.1, OZ0, OZ1, 1.2);
  for (const x of [-4.2, 0.6, 4.6]) for (const z of [-7.2, -4.2, -1.2, 1.8, 4.8]) {
    PI.box(C("#b8b4aa"), x - 0.36, x + 0.36, OH - 0.03, OH, z - 0.66, z + 0.66);
    addM(root, PI, new THREE.BoxGeometry(0.62, 0.02, 1.22).translate(x, OH - 0.035, z), basic(null, new THREE.Color(1.9, 1.9, 1.75)));
  }
  // back wall with the window band
  PI.box(wall, OX0, OX1, 0, WY0, OZ0 - 0.25, OZ0, 2.5);
  PI.box(wall, OX0, OX1, WY1, OH, OZ0 - 0.25, OZ0, 2.5);
  const edges = [OX0, ...WINS.flatMap((c) => [c - WW / 2, c + WW / 2]), OX1];
  for (let i = 0; i < edges.length; i += 2) PI.box(wall, edges[i], edges[i + 1], WY0, WY1, OZ0 - 0.25, OZ0, 2.5);
  PI.box(C("#e2d6bc"), OX0, OX1, WY0 - 0.06, WY0, OZ0 - 0.25, OZ0 + 0.18);                  // sill
  const blindM = lam("ofBlindM", () => ({ map: blindTex(), alphaTest: 0.5, side: THREE.DoubleSide }));
  WINS.forEach((cx, i) => {
    const x0 = cx - WW / 2, x1 = cx + WW / 2;
    PI.box(alu, x0, x1, WY0, WY0 + 0.05, OZ0 - 0.2, OZ0 - 0.1); PI.box(alu, x0, x1, WY1 - 0.05, WY1, OZ0 - 0.2, OZ0 - 0.1);
    for (const x of [x0, cx, x1 - 0.05]) PI.box(alu, x, x + 0.05, WY0, WY1, OZ0 - 0.2, OZ0 - 0.1);
    const yb = [1.55, 1.85, 1.35, 1.75][i];                                                     // blinds half raised at different heights
    const bl = quad(V(x0 + 0.04, yb, OZ0 - 0.06), V(x1 - 0.04, yb, OZ0 - 0.06), V(x1 - 0.04, WY1 - 0.04, OZ0 - 0.06), V(x0 + 0.04, WY1 - 0.04, OZ0 - 0.06), 1, (WY1 - yb) / 1.0 * 1.0);
    PI.geo(bl, blindM);
    PI.box(C("#d8c8a6"), x0 + 0.03, x1 - 0.03, yb - 0.03, yb, OZ0 - 0.08, OZ0 - 0.03);
    PI.box(C("#d8c8a6"), x0 + 0.02, x1 - 0.02, WY1 - 0.08, WY1 - 0.02, OZ0 - 0.1, OZ0 - 0.02);
    // light through the blinds on the carpet (additive stripes, skewed by a sun from the back-left)
    const L = 3.6, sk = 1.0;
    addM(root, PI, quad(V(x0 + sk, 0.006, OZ0 + L), V(x1 + sk, 0.006, OZ0 + L), V(x1, 0.006, OZ0 + 0.02), V(x0, 0.006, OZ0 + 0.02)), decal("stripe", stripeTex, 0.42));
  });
  // city outside (5th floor view): towers below/above the sill line, fogged by distance
  const tw = ["#b9a68c", "#c7b9a2", "#9fa8b4", "#c49a7a", "#a8b0a0"];
  for (let i = 0; i < 26; i++) {
    const x = U(r, -60, 60), z = U(r, -24, -110), w = U(r, 8, 18), d = U(r, 8, 16), h = U(r, 6, 40);
    const c = tw[i % tw.length];
    P.box(TX("ofTw" + c, () => towerTex(c, "#f4d68a")), x - w / 2, x + w / 2, -20, h, z - d, z, 4);
    P.box(C(dim(c, 0.7)), x - w / 2 - 0.3, x + w / 2 + 0.3, h, h + 0.6, z - d - 0.3, z + 0.3);
    if (r() < 0.4) P.box(C("#6a6e78"), x - 1, x + 1.5, h + 0.6, h + 2.4, z - d / 2 - 1, z - d / 2 + 1);
  }
  // left wall with a doorway into a lit corridor
  const DZ0 = -2.7, DZ1 = -1.5, DH = 2.2;
  PI.box(wall, OX0 - 0.2, OX0, 0, OH, OZ0, DZ0, 2.5); PI.box(wall, OX0 - 0.2, OX0, 0, OH, DZ1, OZ1, 2.5); PI.box(wall, OX0 - 0.2, OX0, DH, OH, DZ0, DZ1, 2.5);
  PI.box(trim, OX0 - 0.22, OX0 + 0.04, DH, DH + 0.1, DZ0 - 0.1, DZ1 + 0.1);
  for (const z of [DZ0 - 0.1, DZ1]) PI.box(trim, OX0 - 0.22, OX0 + 0.04, 0, DH, z, z + 0.1);
  const door = PI.at(OX0 - 0.1, DZ1, -1.25);
  door.box(WD("#8a5a36"), 0, 1.15, 0, DH - 0.02, -0.025, 0.025, 0); door.box(C("#cfd8dc"), 0.25, 0.9, 1.2, 1.9, -0.03, 0.03);
  PI.box(wall, OX0 - 6, OX0 - 0.2, 0, OH, DZ0 - 1.4, DZ0 - 1.2, 2.5); PI.box(PL("#d9cdb0"), OX0 - 6, OX0 - 0.2, 0, OH, DZ1 + 1.2, DZ1 + 1.4, 2.5);
  PI.box(PL("#e3d6b6"), OX0 - 6.2, OX0 - 6, 0, OH, DZ0 - 1.4, DZ1 + 1.4, 2.5);
  addM(root, PI, new THREE.BoxGeometry(1.2, 0.02, 0.4).translate(OX0 - 2.5, OH - 0.04, -2.1), basic(null, new THREE.Color(2, 2, 1.8)));
  PI.geo(new THREE.CylinderGeometry(0.17, 0.17, 0.45, 14).translate(OX0 - 5.6, 1.25, -1.6), C("#9ad0ec"));
  PI.box(C("#e8e2d0"), OX0 - 5.85, OX0 - 5.35, 0, 1.02, -1.85, -1.35);
  // right wall: filing cabinets, plaque, clock, wainscot rail
  PI.box(wall, OX1, OX1 + 0.2, 0, OH, OZ0, OZ1, 2.5);
  PI.box(wall, OX0, OX1, 0, OH, OZ1, OZ1 + 0.2, 2.5);
  for (const [x0, x1, z0, z1] of [[OX0, OX1, OZ0, OZ0 + 0.03], [OX1 - 0.03, OX1, OZ0, OZ1], [OX0, OX0 + 0.03, OZ0, DZ0 - 0.1], [OX0, OX0 + 0.03, DZ1 + 0.1, OZ1]] as const) {
    PI.box(C("#4a3426"), x0, x1, 0, 0.12, z0, z1);                                            // skirting
    PI.box(trim, x0, x1, 0.86, 0.9, z0, z1);                                                  // chair rail
  }
  for (let i = 0; i < 5; i++) cabinet(PI, OX1 - 0.02, -7.8 + i * 0.52, -Math.PI / 2);
  for (let i = 0; i < 3; i++) cabinet(PI, -6.4 + i * 0.52, OZ0 + 0.62, 0);
  fileBox(PI, -5.9, OZ0 + 1.0, 0.1, 3); fileBox(PI, -4.0, OZ0 + 0.5, -0.05, 2);
  const pl = PI.at(OX1 - 0.03, -3.5, -Math.PI / 2);
  pl.box(C("#141018"), -1.1, 1.1, 1.85, 2.4, -0.04, 0); signQ(pl, TX("ofPlaqueM", () => plaqueTex("FIELD OFFICE", "CRIMINAL INVESTIGATIONS")), -1.06, 1.06, 1.88, 2.37, 0.004);
  const ck = PI.at(OX0 + 0.03, -5.2, Math.PI / 2); signQ(ck, TX("ofClockM", clockTex), -0.22, 0.22, 2.1, 2.54, 0.005);
  // desks: three columns x three rows (front-right is the listening corner)
  desk(PI, root, r, -4.2, -6.2, 0, { mon: Math.PI + 0.3, monX: 0.3, lamp: true, boxes: 2, k: 1 });
  desk(PI, root, r, 0.8, -6.2, 0.05, { mon: Math.PI - 0.2, k: 0, boxes: 1 });
  desk(PI, root, r, 4.6, -6.2, -0.04, { mon: Math.PI + 0.2, k: 1, lamp: true });
  desk(PI, root, r, -4.2, -3.0, 0.03, { mon: Math.PI - 0.3, lamp: true, k: 0 });
  desk(PI, root, r, 0.8, -3.0, 0, { mon: -0.6, monX: 0.6, lamp: false, boxes: 2, k: 1, chair: false });   // HERO desk (agent)
  desk(PI, root, r, 4.6, -3.0, 0.06, { mon: Math.PI, k: 0, boxes: 3 });
  desk(PI, root, r, -4.2, 0.4, -0.05, { mon: Math.PI + 0.25, k: 1, boxes: 1 });
  desk(PI, root, r, 0.8, 0.6, 0.04, { mon: Math.PI - 0.15, k: 0, lamp: true });
  chair(PI, 0.85, -3.95, 0.5);
  // listening corner: table + reel-to-reel deck + free-standing corkboard
  const T = PI.at(4.4, 2.6, 0);
  T.box(WD("#8a5a3a"), -1.2, 1.2, 0.72, 0.76, -0.45, 0.45, 1.0);
  for (const x of [-1.12, 1.12]) for (const z of [-0.38, 0.38]) T.box(C("#3a3c44"), x - 0.03, x + 0.03, 0, 0.72, z - 0.03, z + 0.03);
  T.box(C("#3a3c44"), -1.15, 1.15, 0.6, 0.64, 0.36, 0.4);
  const deck = T.at(-0.05, 0.05, 0, 0.76);
  deck.box(C("#c9c2b0"), -0.34, 0.34, 0, 0.06, -0.2, 0.08); deck.box(C("#bdb6a2"), -0.32, 0.32, 0.06, 0.58, -0.12, 0.0);
  deck.box(C("#2a2a30"), -0.3, 0.3, 0.07, 0.17, -0.0, 0.012);
  for (let i = 0; i < 5; i++) deck.box(C(i === 2 ? "#d8433a" : "#e8e2d0"), -0.22 + i * 0.09, -0.16 + i * 0.09, 0.09, 0.14, 0.01, 0.03);
  deck.box(C("#1e1e24"), -0.06, 0.06, 0.2, 0.28, 0.0, 0.015);
  T.box(C("#d9d2c0"), 0.55, 0.85, 0.76, 0.79, -0.15, 0.15); T.box(C("#e6c47a"), 0.5, 0.82, 0.79, 0.8, -0.15, 0.12);
  T.geo(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 10).translate(-0.75, 0.81, 0.1), C("#e8e2d0"));
  T.box(C("#1e1e24"), -0.9, -0.62, 0.76, 0.8, -0.1, 0.1);                                      // amplifier box
  bankerLamp(T, root, 0.95, -0.25);
  chair(PI, 3.75, 1.85, Math.PI - 0.15); chair(PI, 5.05, 1.85, Math.PI + 0.2);
  const cb = PI.at(5.75, 0.6, -0.42);
  cb.box(C("#6a4a2e"), -1.05, 1.05, 0.95, 2.35, -0.04, 0.02); signQ(cb, TX("ofCorkM", corkTex), -1.02, 1.02, 0.98, 2.32, 0.024);
  for (const x of [-0.95, 0.95]) { cb.box(C("#3a3c44"), x - 0.03, x + 0.03, 0.05, 0.95, -0.03, 0.03); cb.box(C("#3a3c44"), x - 0.03, x + 0.03, 0.02, 0.05, -0.3, 0.3); }
  // warm lamp pools + window spill on the back carpet
  floorPool(root, PI, 0.8, 0.005, -4.4, 2.2, 1.4, 0.18);
};

// ---------------- COURTROOM build (CR frame) ----------------
const RX0 = -8, RX1 = 8, RZ0 = -14, RZ1 = 8, RH = 5.6, PANH = 2.6;
const CW = [-10.2, -5.2, -0.2];                                     // tall windows on the left wall (z centres)
const buildCourt = (P0: Put, PI0: Put, root: THREE.Object3D, r: () => number) => {
  const P = P0.at(0, CRZ), PI = PI0.at(0, CRZ);
  const panel = TX("ofPanelM", () => panelTex("#8a5432")), plaster = PL("#e6d4ae"), dark = C("#4a2a1a"), wood = WD("#7a4628");
  PI.box(TX("ofPlankM", () => plankTex("#a0683e")), RX0, RX1, -0.05, 0, RZ0, RZ1, 2);
  PI.box(C("#7a2a2e"), -0.7, 0.7, 0, 0.01, -9.5, RZ1);                                         // aisle runner
  PI.box(PL("#efe2c4"), RX0, RX1, RH, RH + 0.2, RZ0, RZ1, 2.5);
  for (let z = RZ0 + 1.5; z < RZ1; z += 3) PI.box(dark, RX0, RX1, RH - 0.3, RH, z - 0.15, z + 0.15);
  // walls: panelled to PANH, plaster above, cornice
  const wallRun = (x0: number, x1: number, z0: number, z1: number, gaps: [number, number][] = []) => {
    PI.box(panel, x0, x1, 0, PANH, z0, z1, 1.2);
    PI.box(plaster, x0, x1, PANH, RH, z0, z1, 2.5);
  };
  wallRun(RX0, RX1, RZ0 - 0.3, RZ0);
  wallRun(RX1, RX1 + 0.3, RZ0, RZ1);
  wallRun(RX0, RX1, RZ1, RZ1 + 0.3);
  // left wall with tall windows (piers between)
  const wz = [RZ0, ...CW.flatMap((c) => [c - 0.85, c + 0.85]), RZ1];
  for (let i = 0; i < wz.length; i += 2) wallRun(RX0 - 0.3, RX0, wz[i], wz[i + 1]);
  for (const c of CW) {
    PI.box(panel, RX0 - 0.3, RX0, 0, 2.0, c - 0.85, c + 0.85, 1.2);
    PI.box(plaster, RX0 - 0.3, RX0, 5.0, RH, c - 0.85, c + 0.85, 2.5);
    const fr = C("#efe6d0");
    PI.box(fr, RX0 - 0.12, RX0 + 0.05, 1.92, 2.04, c - 0.95, c + 0.95); PI.box(fr, RX0 - 0.12, RX0 + 0.05, 4.96, 5.08, c - 0.95, c + 0.95);
    for (const z of [c - 0.95, c + 0.85]) PI.box(fr, RX0 - 0.12, RX0 + 0.05, 1.92, 5.08, z, z + 0.1);
    PI.box(fr, RX0 - 0.2, RX0 - 0.15, 2.0, 5.0, c - 0.03, c + 0.03); for (const y of [3.0, 4.0]) PI.box(fr, RX0 - 0.2, RX0 - 0.15, y - 0.03, y + 0.03, c - 0.85, c + 0.85);
    addM(root, P, quad(V(RX0 - 1.5, 1.2, c + 2.2), V(RX0 - 1.5, 1.2, c - 2.2), V(RX0 - 1.5, 5.8, c - 2.2), V(RX0 - 1.5, 5.8, c + 2.2)), basic(parkTex(), new THREE.Color(1.05, 1.05, 1.05)));
    // sun spill through the window onto the planks (warm, skewed toward the camera side)
    addM(root, PI, quad(V(RX0 + 0.1, 0.006, c + 0.9), V(RX0 + 3.6, 0.006, c + 2.6), V(RX0 + 3.6, 0.006, c + 0.8), V(RX0 + 0.1, 0.006, c - 0.9)), decal("pool", poolTex, 0.5));
  }
  for (const [x0, x1, z0, z1] of [[RX0, RX1, RZ0, RZ0 + 0.06], [RX1 - 0.06, RX1, RZ0, RZ1], [RX0, RX0 + 0.06, RZ0, RZ1]] as const) {
    PI.box(dark, x0, x1, PANH - 0.05, PANH + 0.12, z0, z1 + 0.0); PI.box(dark, x0, x1, 0, 0.15, z0, z1); PI.box(C("#f2e8d0"), x0, x1, RH - 0.45, RH - 0.3, z0, z1);
  }
  // judge's bench: platform, tall front, sides, chair, seal, flags
  PI.box(wood, -3.0, 3.0, 0, 0.55, RZ0, -11.3, 1.0);
  PI.box(panel, -2.6, 2.6, 0, 1.55, -11.75, -11.3, 1.2);
  PI.box(dark, -2.75, 2.75, 1.55, 1.65, -12.1, -11.2);
  for (const s of [-1, 1]) PI.box(panel, s > 0 ? 2.6 : -2.75, s > 0 ? 2.75 : -2.6, 0, 1.55, -12.6, -11.3, 1.2);
  PI.box(C("#7a2a2e"), -0.45, 0.45, 0.55, 2.95, -13.75, -13.45); PI.box(C("#5a1e22"), -0.5, 0.5, 2.85, 3.05, -13.8, -13.4);
  PI.box(dark, -3.4, 3.4, PANH, 3.0, RZ0, RZ0 + 0.08);
  signQ(PI.at(0, RZ0 + 0.04), TX("ofSealM", sealTex), -0.85, 0.85, 3.25, 4.95, 0.02);
  for (const s of [-1, 1]) {
    const x = s * 3.6; PI.rod(C("#c9a24a"), [x, 0, -13.5], [x, 3.4, -13.5], 0.03); PI.geo(new THREE.SphereGeometry(0.07, 10, 8).translate(x, 3.45, -13.5), C("#e0b54e"));
    const fl = PI.at(x, -13.5, s * 0.25);
    fl.geo(quad(V(0, 2.2, 0), V(-s * 1.1, 2.0, 0.05), V(-s * 1.1, 3.0, 0.05), V(0, 3.3, 0), 1, 1), lam("ofFlagM", () => ({ map: flagTex(), side: THREE.DoubleSide })));
  }
  // clerk desk + witness box
  PI.box(panel, -1.9, 1.9, 0, 1.05, -10.9, -10.4, 1.2); PI.box(dark, -2.0, 2.0, 1.05, 1.12, -11.0, -10.3);
  PI.box(panel, -4.6, -3.1, 0, 1.15, -12.6, -11.0, 1.2); PI.box(dark, -4.7, -3.0, 1.15, 1.22, -12.7, -10.9);
  // bar rail across the well (left half) with balusters
  PI.box(dark, RX0, -0.9, 0.95, 1.02, -3.6, -3.4);
  for (let x = RX0 + 0.2; x < -0.9; x += 0.22) PI.box(wood, x - 0.025, x + 0.025, 0, 0.95, -3.53, -3.47);
  PI.box(dark, -0.95, -0.85, 0, 1.1, -3.6, -3.4);
  // gallery pews (left) and defence tables (right)
  for (let k = 0; k < 6; k++) {
    const z = -1.6 + k * 1.3;
    PI.box(wood, -7.4, -1.2, 0.42, 0.48, z - 0.25, z + 0.2); PI.box(wood, -7.4, -1.2, 0.48, 1.0, z + 0.2, z + 0.28);
    for (const x of [-7.4, -1.25]) PI.box(dark, x, x + 0.05, 0, 1.05, z - 0.3, z + 0.3);
  }
  for (const [x, z] of [[4.8, -7.6], [-5.2, -7.6]] as const) {
    PI.box(wood, x - 1.3, x + 1.3, 0.74, 0.78, z - 0.5, z + 0.5, 1.0);
    for (const xx of [x - 1.2, x + 1.2]) PI.box(dark, xx - 0.05, xx + 0.05, 0, 0.74, z - 0.45, z + 0.45);
    PI.box(C("#f3eee2"), x - 0.4, x - 0.1, 0.78, 0.82, z - 0.15, z + 0.15); PI.box(C("#e6c47a"), x + 0.2, x + 0.55, 0.78, 0.8, z - 0.1, z + 0.2);
    chair(PI, x - 0.6, z - 0.9, 0.1); chair(PI, x + 0.6, z - 0.9, -0.1);
  }
  // right wall: double doors, clock, hanging lamps
  const dr = PI.at(RX1 - 0.02, 2.0, -Math.PI / 2);
  dr.box(dark, -1.0, 1.0, 0, 2.6, -0.05, 0.05); dr.box(WD("#6a3a20"), -0.92, -0.02, 0, 2.5, -0.06, 0.08); dr.box(WD("#6a3a20"), 0.02, 0.92, 0, 2.5, -0.06, 0.08);
  for (const s of [-1, 1]) dr.box(C("#c9a24a"), s * 0.1 - 0.03, s * 0.1 + 0.03, 1.1, 1.3, 0.08, 0.12);
  signQ(PI.at(RX1 - 0.03, -6.5, -Math.PI / 2), TX("ofClockM", clockTex), -0.3, 0.3, 3.3, 3.9, 0.005);
  for (const z of [-9, -3, 3]) for (const x of [-3.5, 3.5]) {
    PI.rod(C("#2a2224"), [x, RH, z], [x, 4.2, z], 0.015);
    PI.geo(new THREE.CylinderGeometry(0.12, 0.32, 0.25, 16, 1, true).translate(x, 4.1, z), C("#2f5a3a"));
    addM(root, PI, new THREE.SphereGeometry(0.11, 12, 8).translate(x, 3.98, z), basic(null, new THREE.Color(2.4, 1.9, 1.2)));
  }
  // evidence table (shot 16): cash piles, bags, giant checks on easels, tags
  const E = PI.at(-2.8, -7.9, 0.08);
  E.box(wood, -1.4, 1.4, 0.76, 0.8, -0.5, 0.5, 1.0); E.box(C("#e9e2cc"), -1.42, 1.42, 0.8, 0.805, -0.52, 0.52);
  E.box(C("#e9e2cc"), -1.42, 1.42, 0.45, 0.8, 0.5, 0.52);
  for (const x of [-1.3, 1.3]) E.box(dark, x - 0.05, x + 0.05, 0, 0.76, -0.45, 0.45);
  const side = TX("ofCashSideM", cashSideTex), top = TX("ofCashM", cashTex);
  const pile = (cx: number, cz: number, nx: number, nz: number, ny: number, rot: number) => {
    const Q = E.at(cx, cz, rot, 0.805);
    for (let j = 0; j < ny; j++) {
      const sx = Math.max(1, nx - j), sz = Math.max(1, nz - j);
      for (let a = 0; a < sx; a++) for (let b = 0; b < sz; b++) {
        const x = (a - (sx - 1) / 2) * 0.17, z = (b - (sz - 1) / 2) * 0.085, y = j * 0.07;
        Q.box(side, x - 0.08, x + 0.08, y, y + 0.068, z - 0.04, z + 0.04);
        Q.geo(quad(V(x - 0.08, y + 0.069, z + 0.04), V(x + 0.08, y + 0.069, z + 0.04), V(x + 0.08, y + 0.069, z - 0.04), V(x - 0.08, y + 0.069, z - 0.04)), top);
      }
    }
  };
  pile(-0.85, -0.05, 4, 6, 4, 0.05); pile(0.05, 0.1, 5, 6, 5, -0.04); pile(0.9, -0.1, 3, 5, 3, 0.12);
  for (let i = 0; i < 9; i++) { const x = U(r, -1.25, 1.25), z = U(r, 0.25, 0.45); E.at(x, z, U(r, -0.8, 0.8), 0.805).box(side, -0.08, 0.08, 0, 0.068, -0.04, 0.04); }
  E.geo(new THREE.SphereGeometry(1, 14, 10).scale(0.38, 0.26, 0.24).translate(-1.05, 1.0, -0.2), C("#3a4a3a"));       // duffel bag
  E.geo(new THREE.TorusGeometry(0.12, 0.02, 6, 14, Math.PI).translate(-1.05, 1.22, -0.2), C("#2a3a2a"));
  signQ(E.at(0.55, 0.53), TX("ofTag1", () => tagTex(14)), -0.08, 0.08, 0.62, 0.74, 0.0);
  signQ(E.at(-0.55, 0.53), TX("ofTag2", () => tagTex(7)), -0.08, 0.08, 0.62, 0.74, 0.0);
  for (const [x, z, rot, k] of [[-4.9, -8.6, 0.35, 0], [-0.4, -8.9, -0.3, 1]] as const) {
    const ea = PI.at(x, z, rot);
    ea.rod(C("#6a4a2e"), [-0.6, 0, 0.15], [-0.45, 2.0, 0], 0.025); ea.rod(C("#6a4a2e"), [0.6, 0, 0.15], [0.45, 2.0, 0], 0.025); ea.rod(C("#6a4a2e"), [0, 0, -0.5], [0, 1.9, -0.02], 0.025);
    ea.box(C("#6a4a2e"), -0.7, 0.7, 0.98, 1.03, 0.02, 0.14);
    ea.box(C("#f4f1e8"), -0.82, 0.82, 1.03, 1.78, 0.02, 0.05);
    signQ(ea, TX("ofCheckM" + k, () => checkTex(k)), -0.8, 0.8, 1.05, 1.76, 0.052);
  }
};

const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  buildOffice(P, PI, root, r);
  buildCourt(P, PI, root, r);
};

// ---------------- staging positions ----------------
const HERO: V3 = [0.8, 0, -3.62];                    // agent behind the hero desk (stands)
const PHONE: V3 = [0.32, 0.76, -3.05];               // phone on the hero desk
const LIS1: V3 = [3.75, 0, 1.85], LIS2: V3 = [5.05, 0, 1.85]; // listeners (sit, y raised to the chair)
const SITY = 0.34;
const JUDGE: V3 = [0, 0.55, -12.55];                 // CR frame
const ROW: V3[] = Array.from({ length: 11 }, (_, i) => [3.7 - i * 0.2, 0, 4.2 - i * 1.18] as V3);
const ROWCAST = ["friend", "butcher", "psychic", "winner", "mobster", "cust1", "cust2", "crew", "pressman", "cashier", "chief"];
const ROWEXPR = ["nervous", "pained", "nervous", "shock", "stern", "nervous", "pained", "dazed", "nervous", "pained", "stern"] as const;
const CHIP: V3 = [-2.8, 0.8, -7.9];                  // evidence table centre (CR)
const hd = (p: V3, h = 1.6): V3 => [p[0], p[1] + h, p[2]];

// ---------------- cameras ----------------
const CAMS: Record<number, Key[]> = {
  11: [
    { f: 0, s: (f) => dolly(W([0.1, 1.38, 0.3]), W([0.65, 1.2, -3.5]), pushK(f, 1096, 0.0018), { fov: 42 }) },
    { f: 1176, dur: 14, s: (f) => dolly(W([0.35, 1.62, -1.35]), W(hd(HERO, 1.58)), pushK(f, 1176, 0.004), { fov: 38, roll: -0.05 }) },
  ],
  12: [
    { f: 0, s: (f) => dolly(W([2.7, 1.32, 6.6]), W([4.55, 1.12, 1.4]), pushK(f, 1199, 0.0022, f >= 1230 ? 0.0 : 0), { fov: 42, roll: 0.03 }) },
    { f: 1230, dur: 8, s: (f) => dolly(W([3.0, 1.3, 5.4]), W([4.45, 1.15, 1.6]), pushK(f, 1230, 0.002), { fov: 42, roll: 0.05 }) },
  ],
  15: [
    { f: 0, s: (f) => dolly(WC([5.6, 1.3, 8.2]), WC([1.4, 1.55, -6.0]), pushK(f, 1466, 0.0018), { fov: 42, roll: 0.03 }) },
    { f: 1518, dur: 14, s: (f) => dolly(WC([0.75, 2.05, -8.6]), WC(hd(JUDGE, 1.35)), pushK(f, 1518, 0.002), { fov: 40, roll: -0.06 }) },
  ],
  16: [
    { f: 0, s: (f) => {
      const k = glide((f - 1555) / 46);
      const pos: V3 = [-1.0 + 0.1 * k, 4.4 - 3.2 * k, -3.6 + 1.2 * k], look: V3 = [-2.8, 0.8 + 0.5 * k, -7.9 - 0.5 * k];
      return dolly(WC(pos), WC(look), pushK(f, 1555, 0.0015), { fov: 44, roll: 0.04 * k });
    } },
  ],
};
const DOF: Dof[] = [
  { f: 1096, cInf: 8, focus: () => W(hd(HERO, 1.5)) },
  { f: 1176, dur: 14, cInf: 14, focus: () => W(hd(HERO, 1.58)) },
  { f: 1199, cInf: 10, focus: () => W([4.4, 1.2, 1.9]) },
  { f: 1466, cInf: 8, focus: () => WC(hd(ROW[3], 1.5)) },
  { f: 1518, dur: 14, cInf: 12, focus: () => WC(hd(JUDGE, 1.4)) },
  { f: 1555, cInf: 6, focus: () => WC(CHIP) },
];
const KICKS: [number, number][] = [[1186, 0.6], [1232, 0.5], [1534, 1.2], [1600, 0.8]];
const LIGHT: SetDef["LIGHT"] = {
  11: { sunAz: 150, sunEl: 38 }, 12: { sunAz: 150, sunEl: 38 },
  15: { sunAz: 140, sunEl: 34 }, 16: { sunAz: 150, sunEl: 40 },
};

// ---------------- effect drawings ----------------
const ringFx = (p: Pen, t: number) => {
  const g = p.g;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const rr = 50 + k * 26 + (t % 2) * 4;
    g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.arc(256, 150, rr, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); g.stroke();
    g.strokeStyle = "#ffd84a"; g.lineWidth = 8; g.stroke();
  }
  g.font = "900 64px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = 14; g.strokeStyle = INK; g.strokeText("RING!", 256, 40 + (t % 2) * 4); g.fillStyle = "#fff4c8"; g.fillText("RING!", 256, 40 + (t % 2) * 4);
};
const phoneBase = (p: Pen, withHandset: boolean) => {
  p.poly([[60, 250], [452, 250], [420, 130], [92, 130]], "#2c2c34", 8);
  p.poly([[110, 140], [402, 140], [390, 120], [122, 120]], "#3a3a44", 6);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) p.poly([[180 + i * 52, 160 + j * 22], [214 + i * 52, 160 + j * 22], [214 + i * 52, 176 + j * 22], [180 + i * 52, 176 + j * 22]], "#e8e2d0", 3);
  p.dot(400, 160, 7, "#d8433a");
  if (withHandset) handset(p, 256, 92, 0);
};
const handset = (p: Pen, cx: number, cy: number, rot: number) => {
  const g = p.g; g.save(); g.translate(cx, cy); g.rotate(rot); g.translate(-cx, -cy);
  p.poly([[cx - 170, cy - 10], [cx + 170, cy - 10], [cx + 150, cy + 26], [cx - 150, cy + 26]], "#2c2c34", 7);
  p.ell(cx - 150, cy + 14, 44, 26, "#2c2c34", 7); p.ell(cx + 150, cy + 14, 44, 26, "#2c2c34", 7);
  p.stroke([[cx - 120, cy - 4], [cx + 120, cy - 4]], 5, "#55555f");
  g.restore();
};
const handsetCard = (p: Pen) => {
  const g = p.g; g.save(); g.translate(128, 128); g.rotate(1.25); g.scale(0.55, 0.55); g.translate(-256, -100);
  handset(p, 256, 100, 0); g.restore();
};
const bang = (p: Pen, t: number, txt: string, col = "#ffd84a") => {
  const g = p.g, n = 12, R0 = 70 + t * 30, R1 = 200 + t * 30;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.2; p.stroke([[256 + Math.cos(a) * R0, 256 + Math.sin(a) * R0], [256 + Math.cos(a) * R1, 256 + Math.sin(a) * R1]], 14, INK); p.stroke([[256 + Math.cos(a) * R0, 256 + Math.sin(a) * R0], [256 + Math.cos(a) * R1, 256 + Math.sin(a) * R1]], 7, col); }
  if (txt) { g.font = "900 120px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 24; g.strokeStyle = INK; g.strokeText(txt, 256, 256); g.fillStyle = "#ffffff"; g.fillText(txt, 256, 256); }
};
const phonesFx = (p: Pen) => {          // headphones over a head (256 x 256, head ~ 200 px wide)
  p.arc(128, 132, 112, 120, 195, 345, 26, INK); p.arc(128, 132, 112, 120, 198, 342, 14, "#4a4a56");
  for (const s of [-1, 1]) { p.ell(128 + s * 114, 140, 26, 42, "#2c2c34", 8); p.ell(128 + s * 114, 140, 12, 26, "#d8433a", 0); }
};
const reelFx = (p: Pen) => {
  p.ell(128, 128, 118, 118, "#c9c2b0", 10); p.ell(128, 128, 84, 84, "#5a3a2a", 0);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; p.ell(128 + Math.cos(a) * 62, 128 + Math.sin(a) * 62, 26, 26, "#c9c2b0", 6); }
  p.ell(128, 128, 22, 22, "#e8e2d0", 6);
};
const waveFx = (p: Pen, t: number) => {
  const g = p.g; g.lineCap = "round";
  for (let k = 0; k < 3; k++) { const rr = 40 + k * 34 + t * 18; g.globalAlpha = Math.max(0, 1 - t * 0.6 - k * 0.15); g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(128, 220, rr, -2.4, -0.74); g.stroke(); g.strokeStyle = "#7ee0ff"; g.lineWidth = 8; g.stroke(); }
  g.globalAlpha = 1;
};
const bigMoney = (p: Pen) => {
  const g = p.g;
  for (const [x, y, rot] of [[110, 70, -0.4], [930, 90, 0.35], [160, 300, 0.3], [880, 290, -0.25]] as const) {
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = "#8fc27e"; g.fillRect(-70, -36, 140, 72); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(-70, -36, 140, 72);
    g.fillStyle = "#3a6a3a"; g.font = "900 46px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 0, 2); g.restore();
  }
  g.font = "900 150px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = 34; g.strokeStyle = INK; g.strokeText("$24,000,000", 512, 190, 960);
  const gr = g.createLinearGradient(0, 120, 0, 260); gr.addColorStop(0, "#fff2a0"); gr.addColorStop(0.5, "#ffd23a"); gr.addColorStop(1, "#e89a1a");
  g.fillStyle = gr; g.fillText("$24,000,000", 512, 190, 960);
  g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,0.8)"; g.strokeText("$24,000,000", 509, 184, 960);
};
const pop = (f: number, f0: number) => { const t = f - f0; if (t < 0) return 0; if (t < 4) return (t + 1) / 4 * 1.18; if (t < 8) return 1.18 - 0.18 * (t - 3) / 5; return 1; };

// ---------------- staging ----------------
const stage = (id: number, f: number, S: StageAPI) => {
  const R = S.cam.right, rx = R.x, rz = R.z;
  const off = (p: V3, dr: number, dy: number, dz = 0): V3 => [p[0] + rx * dr, p[1] + dy, p[2] + rz * dr + dz];
  if (id === 11) {
    const held = f >= 1150, k = Math.min(1, Math.max(0, (f - 1150) / 6));
    const expr = f >= 1184 ? "shock" : held ? "stern" : f >= 1104 ? "nervous" : "neutral";
    S.P(CAST.agent, "agent", SEED.agent, W(HERO), { expr, mode: "stand", look: held ? 0 : -0.6, prop: k > 0 ? ["phone", k] : null, tilt: f >= 1184 ? -4 : 0 });
    // ringing phone (shakes) until picked up
    const ringing = !held && (f - 1098) % 22 < 14, sh = ringing ? Math.sin(f * 2.6) * 0.012 : 0;
    S.card(`phone|${held ? 0 : 1}`, 512, 280, (p) => phoneBase(p, !held), W(off(PHONE, sh, 0.11 + (ringing ? Math.abs(Math.sin(f * 1.7)) * 0.012 : 0), 0.02)), 0.42, 0.23, false, ringing ? Math.sin(f * 2.1) * 0.06 : 0);
    if (ringing) S.card(`ring|${f % 2}`, 512, 300, (p) => ringFx(p, f % 2), W(off(PHONE, 0, 0.45, 0.05)), 0.85, 0.5);
    if (held) {
      const hp = off(hd(HERO, 1.6), 0.24 * k - 0.4 * (1 - k), -0.75 * (1 - k), 0.12);
      void hp;
    }
    if (f >= 1184 && f < 1196) S.card(`tip|${Math.min(3, f - 1184)}`, 512, 512, (p) => bang(p, Math.min(3, f - 1184) / 3, "!"), W(off(hd(HERO, 1.95), -0.38, 0, 0.1)), 0.34 * pop(f, 1184), 0.34 * pop(f, 1184));
    // background life
    S.P(CAST.auditor, "aud", SEED.auditor, W([-5.6, 0, -7.6]), { expr: "neutral", mode: "stand", look: 0.6 });
    S.P(CAST.agent2, "ag2s", SEED.agent2, W([-4.15, 0, -7.05]), { expr: "neutral", mode: "sit", look: -0.4 }, false, SITY);
    S.P(CAST.guard, "grd", SEED.guard, W([-8.6, 0, -2.3]), { expr: "neutral", mode: "stroll", phase: (f % 40) / 40 });
  } else if (id === 12) {
    const beat = f >= 1230;
    S.P(CAST.agent, "agentL", SEED.agent, W(LIS1), { expr: beat ? "stern" : "neutral", mode: "sit", look: beat ? 0.5 : 0.3, headTilt: -6 }, false, SITY);
    S.P(CAST.agent2, "agentR", SEED.agent2, W(LIS2), { expr: beat ? "shock" : "nervous", mode: "sit", look: beat ? -0.4 : -0.6, headTilt: beat ? 0 : 5 }, true, SITY);
    for (const p of [LIS1, LIS2]) S.card("phones", 256, 256, phonesFx, W(off(hd(p, 0.96 + SITY), 0, 0.02, 0.1)), 0.64, 0.64);
    const spin = (f - 1199) * (beat ? 0.32 : 0.2);
    for (const s of [-1, 1]) S.card("reel", 256, 256, reelFx, W([4.35 + s * 0.17, 0.76 + 0.43, 2.68]), 0.27, 0.27, false, spin * (s > 0 ? 1 : 1.07));
    if (f >= 1228) { const t = Math.min(1, (f - 1228) / 14); S.card(`wave|${Math.round(t * 6)}`, 256, 256, (p) => waveFx(p, Math.round(t * 6) / 6), W([4.35, 1.75, 2.6]), 0.7, 0.7, true); }
    S.P(CAST.auditor, "aud2", SEED.auditor, W([1.2, 0, -4.6]), { expr: "neutral", mode: "stand", look: 0.3 });
  } else if (id === 15) {
    const struck = f >= 1533, k = f < 1526 ? 0 : f < 1531 ? 0 : f < 1533 ? 0.5 : 1;
    S.P(CAST.judge, "judge", SEED.judge, WC(JUDGE), { expr: struck ? "stern" : "neutral", mode: "stand", prop: ["gavel", k], look: 0 });
    ROW.forEach((p, i) => {
      const nm = ROWCAST[i], o = CAST[nm] ?? CAST.friend;
      S.P(o, "row" + i, SEED[nm] ?? 40 + i, WC(p), { expr: f >= 1535 ? (i % 3 ? "shock" : "pained") : ROWEXPR[i], mode: "stand", look: i % 2 ? 0.4 : -0.4, headTilt: f >= 1535 ? (i % 2 ? 4 : -4) : 0 }, i % 2 === 1);
    });
    S.P(CAST.guard, "bailiff", SEED.guard, WC([5.6, 0, -10.2]), { expr: "stern", mode: "stand" });
    S.P(CAST.cust1, "gal1", SEED.cust1, WC([-3.0, 0, 1.0]), { expr: "nervous", mode: "sit" }, false, 0.1);
    S.P(CAST.cust2, "gal2", SEED.cust2, WC([-5.2, 0, -0.3]), { expr: "neutral", mode: "sit" }, true, 0.1);
    if (f >= 1533 && f < 1545) { const t = Math.min(3, f - 1533); S.card(`bang|${t}`, 512, 512, (p) => bang(p, t / 3, "BANG!"), WC(off([JUDGE[0], 2.35, JUDGE[2] + 1.2], 0.42, 0)), 0.62 * pop(f, 1533), 0.62 * pop(f, 1533)); }
  } else if (id === 16) {
    S.P(CAST.judge, "judge", SEED.judge, WC(JUDGE), { expr: "stern", mode: "stand", prop: ["gavel", 1] });
    S.P(CAST.guard, "bailiff", SEED.guard, WC([-1.0, 0, -9.0]), { expr: "stern", mode: "stand", look: -0.4 });
    S.P(CAST.agent, "agentE", SEED.agent, WC([-4.7, 0, -9.4]), { expr: f >= 1600 ? "grin" : "neutral", mode: "stand", look: 0.5 }, true);
    if (f >= 1598) {
      const s = pop(f, 1598), wob = f >= 1606 ? Math.sin((f - 1606) * 0.35) * 0.02 : 0;
      S.card("bigmoney", 1024, 380, bigMoney, WC([-2.5, 2.0 + 0.05 * Math.min(1, (f - 1598) / 20), -7.4]), 1.9 * s, 0.7 * s, false, wob);
    }
    if (f >= 1598 && f < 1608) { const t = Math.min(3, f - 1598); S.card(`mbang|${t}`, 512, 512, (p) => bang(p, t / 3, "", "#fff4c8"), WC([-2.5, 2.0, -7.5]), 2.4, 2.4); }
  }
};
export const OFFICE: SetDef = { name: "office", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
