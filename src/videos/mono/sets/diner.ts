// SET "diner" — BIG BUN BURGERS, a generic 1990s American burger diner + its parking lot and the suburb across the road.
// Shots: 1 (hook, interior), 7 (parking lot, golden), 8 (counter), 17 (booth, TRY AGAIN), 18 (booth, golden, the gift).
// Local coordinates: metres, y up. Interior x -7..7, z -6..4 (front window wall at z = 4 faces the lot, +z).
import * as THREE from "three";
import { Put, C, PL, KERB } from "../kit";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, head, glide } from "../cam";
import type { StageAPI, Outfit, FrontOpts } from "../stagekit";
import { fxSparkle } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import * as K from "./diner_kit";
import type { Pen } from "../toon";
const { lam, quad, V, U, rep } = K;
export const ORIGIN: V3 = [0, 0, 0];
/** local -> world */
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];

// ---------------- camera frames (local) ----------------
type CF = { pos: V3; look: V3 };
const fwdOf = (c: CF) => { const x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z); return [x / n, z / n]; };
/** ground point f metres ahead of the camera, r metres to screen-right */
const fr = (c: CF, f: number, r: number, y = 0): V3 => { const [fx, fz] = fwdOf(c); return [c.pos[0] + fx * f - fz * r, y, c.pos[2] + fz * f + fx * r]; };
const C1: CF = { pos: [0.25, 1.5, 3.55], look: [-0.15, 1.35, -4.8] };
const C7: CF = { pos: [8.4, 1.45, 17.2], look: [4.6, 1.3, 8.6] };
const C8: CF = { pos: [2.8, 1.4, 0.6], look: [-0.4, 1.45, -3.6] };
const C17: CF = { pos: [-2.95, 1.22, 1.05], look: [-2.3, 1.0, 3.2] };
const C18: CF = { pos: [-5.5, 1.32, -0.2], look: [-5.5, 1.02, 3.3] };
// chief's car in shot 7: rear (open trunk) just right-behind the chief, nose pointing screen-right
const CAR7 = (() => { const [fx, fz] = fwdOf(C7), rear = fr(C7, 6.6, 0.85); const dx = -fz, dz = fx; return { x: rear[0] + dx * 2.4, z: rear[2] + dz * 2.4, rot: Math.atan2(-dz, dx) }; })();

// ---------------- geometry ----------------
const HX = 7, Z0 = -6, Z1 = 4, T = 0.25, CEIL = 3.4, TOP = 4.3;
const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  const M = P.M;
  const stucco = PL("#e9d2a8"), brickBand = PL("#a8503a"), floor = lam("dinerFloor", () => ({ map: K.checkerTex() }));
  const wain = lam("wain", () => ({ map: K.wainTex() })), wallIn = PL("#f1dba6"), steel = lam("steel", () => ({ map: K.steelTex() }));
  const ceil = lam("ceil", () => ({ map: K.ceilTex() })), chrome = C("#c9ced6"), red = C("#c23b35");
  // ---------- ground: lot, sidewalk, grass, road ----------
  const LW = 60, LD = 26, LX0 = -26, LZ0 = Z1 + T + 1.6;
  const lot = lam("lot", () => ({ map: K.lotTex(LW, LD, (g, s) => {
    g.fillStyle = "#ece6d6";
    for (let x = -14; x <= 22; x += 2.8) { if (x > 2.6 && x < 7.8) continue; g.fillRect((x - LX0) * s - 3, 0, 6, 5.2 * s); g.fillRect((x - LX0) * s - 3, (LD - 5.5) * s, 6, 5.5 * s); }
    g.fillStyle = "#e7b53a"; for (let x = 3.0; x < 7.4; x += 0.7) { g.save(); g.translate((x - LX0) * s, 2.6 * s); g.rotate(0.6); g.fillRect(-4, -1.2 * s, 8, 2.4 * s); g.restore(); }
    g.fillStyle = "#ece6d6"; g.font = `900 ${Math.round(1.1 * s)}px Arial`; g.textAlign = "center";
    for (let i = 0; i < 3; i++) { g.save(); g.translate((-6 + i * 14 - LX0) * s, 13 * s); g.fillText("EXIT  →", 0, 0); g.restore(); }
  }) }));
  P.geo(quad(V(LX0, 0, LZ0 + LD), V(LX0 + LW, 0, LZ0 + LD), V(LX0 + LW, 0, LZ0), V(LX0, 0, LZ0)), lot);
  const conc = lam("concrete", () => ({ map: K.concreteTex() }));
  P.box(conc, -HX - 2.2, HX + 2.2, -0.02, 0.12, Z1 + T, LZ0, 1.6); P.box(conc, -HX - 2.2, HX + 2.2, -0.02, 0.12, Z0 - 5.0, Z0 - 3.4, 1.6); // sidewalk ring around the building
  P.box(conc, -HX - 2.2, -HX - T, -0.02, 0.12, Z0 - 3.4, Z1 + T, 1.6); P.box(conc, HX + T, HX + 2.2, -0.02, 0.12, Z0 - 3.4, Z1 + T, 1.6);
  P.box(C("#d8d2c4"), -HX - 2.2, HX + 2.2, 0.0, 0.14, LZ0 - 0.15, LZ0 + 0.05);
  const grass = lam("dGrass", () => ({ map: rep(K.grassHD(), 1, 1) }));
  P.box(grass, -150, 150, -0.1, -0.01, -120, 31, 10);
  P.box(grass, -150, 150, -0.1, -0.01, 39.5, 150, 10);
  // road along x at z 31..39 + far sidewalk
  const road = lam("dRoad", () => ({ map: K.roadTex() }));
  P.geo(quad(V(-150, 0.005, 39), V(150, 0.005, 39), V(150, 0.005, 31), V(-150, 0.005, 31), 30, 1), road);
  P.box(conc, -150, 150, -0.02, 0.12, 39, 40.6, 1.6); P.box(conc, -150, 150, -0.02, 0.12, 29.6, 31, 1.6);
  P.box(conc, -150, 150, -0.02, 0.005, LZ0 + LD, 29.6, 1.6);
  // ---------- building shell (outdoor batch) ----------
  const WY0 = 0.85, WY1 = 2.9, DOOR: [number, number] = [4.6, 6.0];
  P.box(brickBand, -HX - T, HX + T, 0, 0.5, Z0 - T, Z1 + T, 1.2);
  P.box(stucco, -HX - T, -HX, 0.5, TOP, Z0 - T, Z1 + T, 2.5); P.box(stucco, HX, HX + T, 0.5, TOP, Z0 - T, Z1 + T, 2.5);
  P.box(stucco, -HX, -5.4, 0.5, TOP, Z0 - T, Z0, 2.5); P.box(stucco, -3.4, HX, 0.5, TOP, Z0 - T, Z0, 2.5);
  P.box(stucco, -5.4, -3.4, 0.5, 1.1, Z0 - T, Z0, 2.5); P.box(stucco, -5.4, -3.4, 2.1, TOP, Z0 - T, Z0, 2.5);
  // front wall: sill below windows, header above, piers between panes, door
  P.box(stucco, -HX, HX, 0.5, WY0, Z1, Z1 + T, 2.5); P.box(stucco, -HX, HX, WY1, TOP, Z1, Z1 + T, 2.5);
  const panes: [number, number][] = [[-6.8, -4.6], [-4.4, -2.2], [-2.0, 0.2], [0.4, 2.6], [2.8, 4.3], [6.3, 6.8]];
  const piers = [-HX, -6.8, -4.6, -4.4, -2.2, -2.0, 0.2, 0.4, 2.6, 2.8, 4.3, 6.3, 6.8, HX];
  for (let i = 0; i < piers.length; i += 2) if (piers[i + 1] - piers[i] > 0.01) P.box(stucco, piers[i], piers[i + 1], WY0, WY1, Z1, Z1 + T, 2.5);
  P.box(stucco, 4.3, DOOR[0], 0, WY1, Z1, Z1 + T, 2.5); P.box(stucco, DOOR[1], 6.3, 0, WY1, Z1, Z1 + T, 2.5);
  P.box(stucco, DOOR[0], DOOR[1], 2.3, WY1, Z1, Z1 + T, 2.5);
  for (const [a, b] of panes) { P.box(chrome, a, b, WY0 - 0.04, WY0, Z1 - 0.05, Z1 + T + 0.03); P.box(chrome, a, b, WY1 - 0.04, WY1, Z1 - 0.02, Z1 + T + 0.02); P.box(chrome, (a + b) / 2 - 0.025, (a + b) / 2 + 0.025, WY0, WY1, Z1 + 0.08, Z1 + 0.14); }
  // glass door (open frame) with a push bar
  P.box(chrome, DOOR[0], DOOR[0] + 0.06, 0, 2.3, Z1 + 0.05, Z1 + 0.15); P.box(chrome, DOOR[1] - 0.06, DOOR[1], 0, 2.3, Z1 + 0.05, Z1 + 0.15);
  P.box(chrome, DOOR[0], DOOR[1], 2.24, 2.3, Z1 + 0.05, Z1 + 0.15); P.box(chrome, (DOOR[0] + DOOR[1]) / 2 - 0.03, (DOOR[0] + DOOR[1]) / 2 + 0.03, 0, 2.3, Z1 + 0.05, Z1 + 0.15);
  P.box(chrome, DOOR[0] + 0.1, DOOR[1] - 0.1, 1.0, 1.06, Z1 + 0.15, Z1 + 0.2);
  // mansard roof band (all four sides) + flat roof + rooftop units
  const shing = lam("mansard", () => ({ map: K.roofHD("#9a3e2e") }));
  P.slab(shing, -HX - T - 0.6, HX + T + 0.6, Z1 + T + 0.9, TOP - 1.1, Z1 + T - 0.2, TOP + 0.6, 0.1, 1.6);
  P.slab(shing, HX + T + 0.6, -HX - T - 0.6, Z0 - T - 0.9, TOP - 1.1, Z0 - T + 0.2, TOP + 0.6, 0.1, 1.6);
  P.geo(new THREE.BoxGeometry(1.2, 1.7, Z1 - Z0 + 2 * T + 1.6).rotateZ(-0.83).translate(-HX - T - 0.15, TOP - 0.3, (Z0 + Z1) / 2), shing);
  P.geo(new THREE.BoxGeometry(1.2, 1.7, Z1 - Z0 + 2 * T + 1.6).rotateZ(0.83).translate(HX + T + 0.15, TOP - 0.3, (Z0 + Z1) / 2), shing);
  P.box(C("#7a7068"), -HX - T, HX + T, TOP, TOP + 0.5, Z0 - T, Z1 + T);
  P.box(C("#c9c4bc"), -3, -1, TOP + 0.5, TOP + 1.4, -3, -1); P.box(C("#c9c4bc"), 2, 3.4, TOP + 0.5, TOP + 1.1, -2, -0.6);
  // facade sign on the mansard + red/white awning stripe under it
  const sgn = K.plane(root, M, K.facadeSignTex(), 9.0, 1.69, [0, TOP - 0.15, Z1 + T + 0.62], 0, 0xf2f2f2);
  sgn.rotation.x = -0.52; sgn.updateMatrix();
  P.box(C("#3b2f2a"), -4.6, 4.6, TOP - 0.95, TOP - 0.85, Z1 + T + 0.2, Z1 + T + 1.0);
  // back kitchen extension
  P.box(stucco, -HX - T, 0.2, 0, 3.6, Z0 - 3.4, Z0 - T, 2.5);
  P.box(C("#7a7068"), -HX - T, 0.2, 3.6, 3.8, Z0 - 3.4, Z0 - T);
  P.box(C("#5a5048"), -4.5, -3.0, 0, 2.2, Z0 - 3.42, Z0 - 3.38); // back door
  for (const [x, z] of [[-6.4, -10.4], [-5.2, -10.4]]) P.box(C("#3f6a4a"), x, x + 1.0, 0, 1.2, z - 0.6, z + 0.6); // dumpsters
  // planters along the front
  for (const x of [-6.2, -3.3, -0.4, 2.5]) { P.box(PL("#a8503a"), x - 1.0, x + 1.0, 0.12, 0.6, Z1 + T + 0.1, Z1 + T + 0.7, 1); K.shrub(P, r, x, Z1 + T + 0.4, 0.6); }
  // ---------- pole sign + lamp posts + cars + trees ----------
  P.geo(new THREE.CylinderGeometry(0.22, 0.26, 9.5, 12).translate(12.5, 4.75, 7.5), C("#5a5e66"));
  P.box(C("#c8323c"), 10.2, 14.8, 7.8, 11.6, 7.25, 7.75);
  K.plane(root, M, K.poleSignTex(), 4.4, 3.44, [12.5, 9.7, 7.76], 0, 0xf2f2f2);
  K.plane(root, M, K.poleSignTex(), 4.4, 3.44, [12.5, 9.7, 7.24], Math.PI, 0xf2f2f2);
  for (const [x, z] of [[-11, 12.5], [-1.5, 19], [16, 19], [9.5, 25.5], [-17, 25]] as const) K.lampPost(P, x, z);
  const CARS: [number, number, number, string, K.CarKind][] = [
    [-12.6, 8.2, -Math.PI / 2, "#2f8f8a", "sedan"], [-9.8, 8.4, -Math.PI / 2, "#7a2f3a", "wagon"], [-4.2, 8.3, -Math.PI / 2, "#e8e4da", "hatch"],
    [-1.4, 8.6, -Math.PI / 2, "#c9b48a", "sedan"], [9.0, 8.3, -Math.PI / 2, "#3f6a4a", "pickup"], [14.6, 8.4, -Math.PI / 2, "#5a6f94", "sedan"],
    [-8.4, 25.6, Math.PI / 2, "#b8483a", "sedan"], [-2.8, 25.4, Math.PI / 2, "#e2d8b8", "wagon"], [11.2, 25.6, Math.PI / 2, "#2f3f6a", "hatch"], [17.0, 25.3, Math.PI / 2, "#8a8a92", "sedan"],
  ];
  for (const [x, z, rot, col, k] of CARS) K.car(P, x, z, rot, col, k);
  K.car(P, CAR7.x, CAR7.z, CAR7.rot, "#2c3550", "sedan", true);
  for (const [x, z, s] of [[-22, 2, 1.1], [-21, 14, 1.0], [24, 3, 1.2], [26, 16, 0.9], [-10, -14, 1.2], [-2, -16, 1.0], [6, -13, 1.3], [14, -15, 1.1], [-18, -12, 1.0], [30, -8, 1.2]] as const) K.tree(P, r, x, z, s);
  for (let x = -26; x < 34; x += 3.4) K.shrub(P, r, x, LZ0 + LD + 1.4, 0.8);
  // ---------- suburb across the road ----------
  const HC: [string, string][] = [["#e9e2c8", "#5a4a48"], ["#a8c4d8", "#4a4a58"], ["#f2d8a8", "#7a3a2e"], ["#c8d8b0", "#5a4a48"], ["#e8c0b0", "#4a4a58"], ["#f4efe4", "#3f4a5a"]];
  for (let i = 0; i < 12; i++) { const x = -66 + i * 12 + U(r, -1, 1); K.house(P, r, x, 46 + U(r, -0.5, 0.5), Math.PI, HC[i % 6][0], HC[i % 6][1]); }
  for (let i = 0; i < 12; i++) K.tree(P, r, -60 + i * 12 + U(r, -2, 2), 44.5 + U(r, -1, 1), U(r, 0.9, 1.3));
  for (let i = 0; i < 10; i++) K.tree(P, r, -70 + i * 15, 66 + U(r, -3, 3), U(r, 1.2, 1.6));
  for (let x = -60; x <= 60; x += 20) { P.rod(C("#6a4a33"), [x, 0, 41], [x, 9, 41], 0.12); P.box(C("#6a4a33"), x - 1.0, x + 1.0, 8.2, 8.35, 40.93, 41.07); }
  // distant gas station roof + water tower to break the skyline
  P.box(C("#e8e4da"), 40, 52, 4.2, 4.8, 52, 60); for (const x of [41, 51]) P.rod(C("#c9ced6"), [x, 0, 56], [x, 4.2, 56], 0.2);
  P.box(C("#c8323c"), 40, 52, 4.4, 4.6, 59.98, 60.05);
  P.geo(new THREE.CylinderGeometry(4, 4, 4, 16).translate(-40, 22, 95), C("#c9c4bc")); P.geo(new THREE.ConeGeometry(4.3, 1.6, 16).translate(-40, 24.8, 95), C("#a8a49c"));
  for (const a of [0, 1.6, 3.2, 4.8]) P.rod(C("#8a8680"), [-40 + Math.cos(a) * 3.5, 0, 95 + Math.sin(a) * 3.5], [-40 + Math.cos(a) * 3, 20, 95 + Math.sin(a) * 3], 0.25);

  // ---------- interior (no received shadows) ----------
  const e = 0.006;
  PI.box(floor, -HX, HX, 0, 0.02, Z0, Z1, 1.8);
  // inner wall skins: wainscot below 1.0, cream above
  const skin = (xa: number, xb: number, ya: number, yb: number, z: number, nz: 1 | -1, mat: THREE.Material, tile: number) => {
    const L = Math.abs(xb - xa), Hh = yb - ya;
    if (nz > 0) PI.geo(quad(V(xa, ya, z), V(xb, ya, z), V(xb, yb, z), V(xa, yb, z), L / tile, Hh / tile), mat);
    else PI.geo(quad(V(xb, ya, z), V(xa, ya, z), V(xa, yb, z), V(xb, yb, z), L / tile, Hh / tile), mat);
  };
  const skinX = (za: number, zb: number, ya: number, yb: number, x: number, nx: 1 | -1, mat: THREE.Material, tile: number) => {
    const L = Math.abs(zb - za), Hh = yb - ya;
    if (nx > 0) PI.geo(quad(V(x, ya, zb), V(x, ya, za), V(x, yb, za), V(x, yb, zb), L / tile, Hh / tile), mat);
    else PI.geo(quad(V(x, ya, za), V(x, ya, zb), V(x, yb, zb), V(x, yb, za), L / tile, Hh / tile), mat);
  };
  // back wall (faces +z): pass-through opening x -5.4..-3.4, y 1.1..2.1
  skin(-HX, HX, 0.02, 1.0, Z0 + e, 1, wain, 2); skin(-HX, -5.4, 1.0, CEIL, Z0 + e, 1, wallIn, 2.5); skin(-3.4, HX, 1.0, CEIL, Z0 + e, 1, wallIn, 2.5);
  skin(-5.4, -3.4, 2.1, CEIL, Z0 + e, 1, wallIn, 2.5); skin(-5.4, -3.4, 1.0, 1.1, Z0 + e, 1, wallIn, 2.5);
  // side walls
  skinX(Z0, Z1, 0.02, 1.0, -HX + e, 1, wain, 2); skinX(Z0, Z1, 1.0, CEIL, -HX + e, 1, wallIn, 2.5);
  skinX(Z0, Z1, 0.02, 1.0, HX - e, -1, wain, 2); skinX(Z0, Z1, 1.0, CEIL, HX - e, -1, wallIn, 2.5);
  // front wall inside (faces -z)
  skin(-HX, HX, 0.02, WY0, Z1 - e, -1, wain, 2); skin(-HX, HX, WY1, CEIL, Z1 - e, -1, wallIn, 2.5);
  for (let i = 0; i < piers.length; i += 2) if (piers[i + 1] - piers[i] > 0.01) skin(piers[i], piers[i + 1], WY0, WY1, Z1 - e, -1, wallIn, 2.5);
  skin(4.3, DOOR[0], WY0, WY1, Z1 - e, -1, wallIn, 2.5); skin(DOOR[1], 6.3, WY0, WY1, Z1 - e, -1, wallIn, 2.5);
  // chrome rail at wainscot top
  PI.box(chrome, -HX, HX, 0.98, 1.04, Z0, Z0 + 0.04); PI.box(chrome, -HX, -HX + 0.04, 0.98, 1.04, Z0, Z1); PI.box(chrome, HX - 0.04, HX, 0.98, 1.04, Z0, Z1);
  // ceiling + soffit trim
  PI.geo(quad(V(-HX, CEIL, Z0), V(HX, CEIL, Z0), V(HX, CEIL, Z1), V(-HX, CEIL, Z1), 14 / 1.2, 10 / 1.2), ceil);
  PI.box(red, -HX, HX, CEIL - 0.25, CEIL, Z0, Z0 + 0.12); PI.box(red, -HX, HX, CEIL - 0.25, CEIL, Z1 - 0.12, Z1);
  // kitchen behind the pass-through: steel walls, heat-lamp shelf with wrapped burgers
  PI.box(steel, -7, -1.2, 0.02, 3.4, Z0 - 3.2, Z0 - 3.0, 0.8); PI.box(steel, -7, -6.8, 0.02, 3.4, Z0 - 3.2, Z0 - T);
  PI.box(steel, -1.4, -1.2, 0.02, 3.4, Z0 - 3.2, Z0 - T); PI.box(C("#d8d0c0"), -7, -1.2, 0.0, 0.02, Z0 - 3.2, Z0 - T);
  PI.box(steel, -6.5, -2.0, 0, 0.95, Z0 - 2.9, Z0 - 2.2); PI.box(C("#3a3a40"), -6.3, -4.5, 0.95, 1.0, Z0 - 2.85, Z0 - 2.25);
  PI.box(steel, -5.4, -3.4, 1.1, 1.14, Z0 - 0.3, Z0 + 0.25);
  for (let i = 0; i < 6; i++) PI.box(C(i % 2 ? "#f2c43b" : "#f2ead8"), -5.25 + i * 0.32, -5.0 + i * 0.32, 1.14, 1.22, Z0 - 0.15, Z0 + 0.1);
  PI.box(C("#5a5e66"), -5.3, -3.5, 1.85, 1.95, Z0 - 0.3, Z0 + 0.1);
  K.emissive(root, M, new THREE.BoxGeometry(1.6, 0.04, 0.25).translate(-4.4, 1.83, Z0 - 0.1), [2.2, 1.0, 0.45]);
  // ---------- counter (customer side faces +z at z = -2.6) ----------
  const CX0 = -4.6, CX1 = 3.6, CZ0 = -3.4, CZ1 = -2.6;
  PI.box(lam("counterF", () => ({ map: K.counterTex() })), CX0, CX1, 0.02, 1.0, CZ0, CZ1, 2);
  PI.box(C("#e8dcc0"), CX0 - 0.05, CX1 + 0.05, 1.0, 1.06, CZ0 - 0.05, CZ1 + 0.12);
  PI.box(chrome, CX0 - 0.06, CX1 + 0.06, 0.96, 1.0, CZ1, CZ1 + 0.13);
  PI.box(C("#2a1c1c"), CX0, CX1, 0.02, 0.15, CZ1, CZ1 + 0.18); // foot rail base
  PI.rod(chrome, [CX0, 0.22, CZ1 + 0.22], [CX1, 0.22, CZ1 + 0.22], 0.025);
  for (let x = CX0 + 0.5; x <= CX1 - 0.3; x += 0.9) K.stool(PI, x, -2.05);
  // registers, napkins, trays and cups on the counter
  for (const x of [-1.9, 0.6]) { PI.box(C("#4a4a52"), x - 0.22, x + 0.22, 1.06, 1.22, CZ0 + 0.1, CZ0 + 0.5); PI.box(C("#2a2a30"), x - 0.2, x + 0.2, 1.22, 1.42, CZ0 + 0.15, CZ0 + 0.25); PI.box(C("#7af0a0"), x - 0.15, x + 0.15, 1.3, 1.38, CZ0 + 0.25, CZ0 + 0.26); }
  K.tray(PI, 1.8, 1.06, -3.0, r, 0.2); K.tray(PI, -3.3, 1.06, -3.0, r, -0.3); K.napkins(PI, -0.7, 1.06, -3.1); K.napkins(PI, 2.9, 1.06, -3.1);
  for (let i = 0; i < 5; i++) K.cup3(PI, -2.9 + i * 0.12, 1.06, -3.25, 1, "#d63a32");
  // back bar along the back wall: soda fountain, fryers, shake machine, cup stacks
  PI.box(steel, -3.2, 5.6, 0.02, 0.95, Z0 + 0.02, Z0 + 0.75, 0.8); PI.box(C("#d8d0c0"), -3.2, 5.6, 0.95, 1.0, Z0, Z0 + 0.8);
  PI.box(C("#c8323c"), -1.6, 0.2, 1.0, 1.9, Z0 + 0.05, Z0 + 0.6); PI.box(C("#2a2a30"), -1.5, 0.1, 1.2, 1.3, Z0 + 0.4, Z0 + 0.62);
  for (let i = 0; i < 5; i++) PI.box(C("#e9e4da"), -1.45 + i * 0.32, -1.3 + i * 0.32, 1.32, 1.5, Z0 + 0.55, Z0 + 0.64);
  PI.box(steel, 1.0, 2.6, 1.0, 1.3, Z0 + 0.1, Z0 + 0.7); PI.box(C("#f2c43b"), 1.1, 1.7, 1.3, 1.34, Z0 + 0.15, Z0 + 0.6); PI.box(C("#f2c43b"), 1.9, 2.5, 1.3, 1.34, Z0 + 0.15, Z0 + 0.6);
  PI.box(C("#e9e4da"), 3.0, 3.8, 1.0, 2.0, Z0 + 0.05, Z0 + 0.6); PI.box(C("#e8668e"), 3.05, 3.75, 1.6, 1.9, Z0 + 0.6, Z0 + 0.62);
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) K.cup3(PI, 4.3 + i * 0.13, 1.0 + k * 0.17, Z0 + 0.35, 1, i % 2 ? "#2f6fa8" : "#d63a32");
  // menu board over the back bar (lit sign box)
  PI.box(C("#2a1c1c"), -2.75, 2.75, 2.05, 3.3, Z0 + 0.0, Z0 + 0.12);
  K.plane(root, M, K.menuTex(), 5.3, 1.77 * 5.3 / 5.3 * 0.66, [0, 2.67, Z0 + 0.125], 0, 0xf4f4f4);
  K.emissive(root, M, new THREE.BoxGeometry(5.5, 0.05, 0.08).translate(0, 3.28, Z0 + 0.2), [2.2, 2.0, 1.6]);
  // ---------- booths along the window, tables in the middle ----------
  const BOOTHS: [number, string][] = [[-5.5, "#c23b35"], [-3.0, "#c23b35"], [2.4, "#c23b35"]];
  for (const [cx, col] of BOOTHS) K.booth(PI, cx, 2.35, Z1, col);
  K.tray(PI, -5.82, 0.76, 3.3, r, 0.4); K.napkins(PI, -5.25, 0.76, 3.75);
  K.tray(PI, -3.32, 0.76, 2.95, r, -0.2); K.napkins(PI, -2.8, 0.76, 3.75); K.cup3(PI, -2.7, 0.76, 3.1);
  K.tray(PI, 2.1, 0.76, 3.0, r, 0.1); K.tray(PI, 2.7, 0.76, 3.3, r, 2.9); K.napkins(PI, 2.4, 0.76, 3.8);
  K.table4(PI, -0.35, 1.15, r); K.table4(PI, -3.4, -0.2, r); K.table4(PI, 3.4, 0.3, r);
  // left side wall: jukebox + posters; right: restrooms + trash
  PI.box(C("#7a2f3a"), -HX + 0.05, -HX + 0.75, 0.02, 1.5, -1.3, -0.3); PI.geo(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).translate(-HX + 0.4, 1.5, -0.8), C("#e8b23a"));
  K.emissive(root, M, new THREE.BoxGeometry(0.02, 0.5, 0.7).translate(-HX + 0.76, 1.0, -0.8), [1.6, 1.0, 1.6]);
  K.plane(root, M, K.gamePosterTex(0), 0.9, 1.26, [-HX + 0.02, 1.95, 1.3], Math.PI / 2);
  K.plane(root, M, K.gamePosterTex(1), 0.9, 1.26, [-HX + 0.02, 1.95, -2.5], Math.PI / 2);
  K.plane(root, M, K.promoTex(), 0.8, 1.12, [-HX + 0.02, 1.95, -4.4], Math.PI / 2);
  K.plane(root, M, K.gamePosterTex(2), 0.9, 1.26, [HX - 0.02, 1.95, -1.0], -Math.PI / 2);
  K.plane(root, M, K.gamePosterTex(1), 0.9, 1.26, [HX - 0.02, 1.95, 1.8], -Math.PI / 2);
  K.plane(root, M, K.gamePosterTex(0), 0.8, 1.12, [3.4, 2.0, Z0 + 0.02], 0);
  K.plane(root, M, K.gamePosterTex(2), 0.8, 1.12, [-6.2, 2.0, Z0 + 0.02], 0);
  K.plane(root, M, K.gamePosterTex(0), 0.75, 1.05, [-0.85, 1.9, Z1 - 0.15], Math.PI); // window cling (seen from inside)
  for (const z of [-4.8, -3.4]) { PI.box(C("#5a6f94"), HX - 0.06, HX - 0.02, 0.02, 2.2, z - 0.45, z + 0.45); PI.box(chrome, HX - 0.1, HX - 0.06, 1.0, 1.05, z + 0.25, z + 0.35); }
  PI.box(C("#8a5a3c"), HX - 0.7, HX - 0.05, 0.02, 1.1, 2.6, 3.4); PI.box(chrome, HX - 0.72, HX - 0.03, 0.8, 0.9, 2.62, 3.38);
  // pendant drum lamps (emissive) + ceiling fans
  const lampAt = (x: number, z: number) => { PI.rod(C("#3a3a40"), [x, CEIL, z], [x, 2.55, z], 0.012); PI.geo(new THREE.CylinderGeometry(0.2, 0.26, 0.24, 14, 1, true).translate(x, 2.45, z), red); K.emissive(root, M, new THREE.CylinderGeometry(0.22, 0.22, 0.02, 14).translate(x, 2.33, z), [2.4, 2.1, 1.6]); };
  for (const [cx] of BOOTHS) lampAt(cx, 3.2);
  for (const x of [-3.6, -1.2, 1.2, 3.2]) lampAt(x, -2.2);
  for (const [x, z] of [[-1.5, 0.5], [3.4, 1.0]]) { PI.rod(C("#3a3a40"), [x, CEIL, z], [x, 2.95, z], 0.02); PI.geo(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 12).translate(x, 2.9, z), C("#8a5a3c")); for (let i = 0; i < 4; i++) PI.geo(new THREE.BoxGeometry(0.7, 0.02, 0.13).translate(0.42, 0, 0).rotateY(i * 1.57 + x).translate(x, 2.88, z), C("#8a5a3c")); }
  // window sun: floor patches + soft shafts
  for (const [a, b] of panes.slice(0, 5)) {
    K.glowPlane(root, M, b - a - 0.1, 1.6, [(a + b) / 2 - 0.5, 0.035, Z1 - 1.3], [-Math.PI / 2, 0, 0], "#ffd9a0", 0.22, "none");
    K.glowPlane(root, M, b - a - 0.2, 3.2, [(a + b) / 2 - 0.3, 1.6, Z1 - 1.0], [-0.55, 0, 0], "#ffe2b0", 0.07);
  }
};

// ---------------- cameras ----------------
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const WP = (c: CF) => ({ pos: W(c.pos), look: W(c.look) });
const CAMS: Record<number, Key[]> = {
  // hook: fast dolly in (punch over the first ~20 f), then a slow creep
  1: [{ f: 0, s: (f) => dolly(WP(C1).pos, WP(C1).look, pushK(f, 0, 0.0014, 0.013, 20), { fov: 46 }) }],
  7: [{ f: 0, s: (f) => dolly(WP(C7).pos, WP(C7).look, pushK(f, 678, 0.0014), { fov: 40, roll: -0.03 }) },
    { f: 772, dur: 14, s: (f) => dolly(WP(C7).pos, WP(C7).look, pushK(f, 678, 0.0014) * 0.86, { fov: 40, roll: -0.045 }) }],
  8: [{ f: 0, s: (f) => dolly(WP(C8).pos, WP(C8).look, pushK(f, 799, 0.0016), { fov: 42 }) },
    { f: 893, dur: 10, s: (f) => { const w = fr(C8, 2.6, -0.3); const look: V3 = W([w[0] + 0.18, 1.8, w[2] - 0.1]); return dolly(W(C8.pos), look, 0.62 * pushK(f, 893, 0.002), { fov: 40, roll: 0.05 }); } }],
  17: [{ f: 0, s: (f) => dolly(WP(C17).pos, WP(C17).look, pushK(f, 1628, 0.0018), { fov: 40 }) }],
  18: [{ f: 0, s: (f) => dolly(WP(C18).pos, WP(C18).look, pushK(f, 1705, 0.0012), { fov: 42 }) },
    { f: 1738, dur: 44, s: () => ({ pos: W([-5.25, 1.75, -2.1]), look: W([-5.5, 1.05, 3.0]), fov: 44, roll: 0 }) }],
};
const DOF: Dof[] = [
  { f: 0, cInf: 9, focus: () => W(fr(C1, 3.4, 0.25, 1.2)) },
  { f: 678, cInf: 8, focus: () => W(fr(C7, 6.0, 0.35, 1.5)) },
  { f: 799, cInf: 10, focus: () => W(fr(C8, 2.6, -0.3, 1.5)) },
  { f: 893, dur: 10, cInf: 13, focus: () => W(fr(C8, 2.6, -0.3, 1.8)) },
  { f: 1628, cInf: 11, focus: () => W([-2.22, 1.05, 3.0]) },
  { f: 1705, cInf: 9, focus: () => W([-5.5, 1.0, 3.0]) },
];
const KICKS: [number, number][] = [[52, 0.8], [783, 0.6], [1662, 0.5]];
const LIGHT: SetDef["LIGHT"] = { 1: { sunAz: 155, sunEl: 38 }, 8: { sunAz: 150, sunEl: 38 }, 17: { sunAz: 205, sunEl: 34 }, 7: { light: "golden", sunAz: 130, sunEl: 14 }, 18: { light: "golden", sunAz: 160, sunEl: 12 } };

// ---------------- staging ----------------
type Prop = FrontOpts["prop"];
const PR = (s: string, k = 1) => [s, k] as unknown as Prop;
const X = (o: Outfit, patch: Partial<Outfit>) => ({ ...o, ...patch }) as Outfit;
const card = (S: StageAPI, key: string, draw: (p: Pen) => void, at: V3, w: number, h: number, cw = 256, ch = 256, soft = false, rot = 0) => S.card(key, cw, ch, draw, W(at), w, h, soft, rot);
const pop = (f: number, f0: number, d = 6) => { const u = Math.max(0, Math.min(1, (f - f0) / d)); return u <= 0 ? 0 : 1 + 0.25 * Math.sin(u * Math.PI) ; };
/** seated card: feet on the floor, body lowered so the hips sit on the seat */
const SIT = -0.38;
const stage = (id: number, f: number, S: StageAPI) => {
  const P = (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y?: number) => S.P(o, key, seed, W(at), opts, mirror, y);
  if (id === 1) {
    const cheer = f >= 52, hop = cheer ? Math.max(0, Math.sin(((f - 52) / 9) * Math.PI)) * 0.14 * (f < 80 ? 1 : 0.4) : 0;
    const kid = fr(C1, 5.3, 0.3);
    P(CAST.kid, "kid", SEED.kid, kid, { expr: cheer ? "laugh" : "grin", facing: 0, prop: cheer ? undefined : PR("sticker"), wave: cheer ? 0.5 + 0.5 * Math.sin(f * 0.7) : undefined, look: cheer ? 0 : 0.4 }, false, kid[1] + hop);
    if (cheer) { card(S, "bang" + Math.min(6, Math.floor((f - 52) / 2)), (p) => K.fxBang(p, Math.min(1, (f - 52) / 12)), [kid[0], 1.3 + hop, kid[2]], 0.75 * pop(f, 52, 8), 0.75); }
    // foreground table: a customer peeling a sticker off her cup
    P(CAST.cust2, "cust2", SEED.cust2, [0.75, 0, 0.35], { expr: f > 56 ? "grin" : "neutral", facing: -1, prop: PR("cup"), look: -0.4 }, false, SIT);
    // counter: two customers on stools, cashiers behind
    P(CAST.cust1, "cust1", SEED.cust1, [-0.85, 0, -2.0], { expr: f > 58 ? "shock" : "neutral", facing: 1, prop: PR("fries") }, false, SIT + 0.3);
    P(X(CAST.cust1, { jacket: "#6a9a5a", hairStyle: "messy" } as Partial<Outfit>), "custC", 41, [0.95, 0, -2.0], { expr: "grin", facing: -1, prop: PR("sticker") }, false, SIT + 0.3);
    P(CAST.cashier, "cashier", SEED.cashier, [0.15, 0, -4.05], { expr: "neutral", facing: 0, look: Math.sin(f * 0.05) * 0.5 });
    P(X(CAST.cashier, { hair: "#a8642a" } as Partial<Outfit>), "cashier2", 43, [-2.1, 0, -4.2], { expr: "neutral", facing: 1 });
    P(X(CAST.cust2, { jacket: "#e8b23a", hairStyle: "short" } as Partial<Outfit>), "custD", 45, [-3.0, 0, -0.2], { expr: "grin", facing: 1, prop: PR("cup") }, false, SIT);
    P(X(CAST.cust1, { jacket: "#7a5aa8" } as Partial<Outfit>), "custE", 47, [2.8, 0, 0.3], { expr: "neutral", facing: -1, prop: PR("sticker") }, false, SIT);
  } else if (id === 7) {
    const chief = fr(C7, 6.0, 0.42);
    const sell = Math.floor((f - 690) / 26); // envelopes change hands every ~0.9 s
    P({ ...CAST.chief, shades: "aviator" } as Outfit, "chiefAv", SEED.chief, chief, { expr: f >= 783 ? "greedy" : "sly", facing: -1, prop: PR(f % 52 < 26 ? "sticker" : "cash"), look: -0.6 });
    const Q: [Outfit, string, number][] = [[CAST.friend, "friend", SEED.friend], [X(CAST.cust2, { jacket: "#4f86c6" } as Partial<Outfit>), "q2", 51], [X(CAST.cust1, { jacket: "#a85a3a" } as Partial<Outfit>), "q3", 53], [CAST.winner, "winner", SEED.winner], [X(CAST.cust1, { jacket: "#5a8a6a" } as Partial<Outfit>), "q5", 57]];
    const step = Math.max(0, Math.min(1, ((f - 690) % 26) / 10)) * (f > 690 ? 1 : 0);
    Q.forEach(([o, k, s], i) => {
      const fwd = 6.7 + i * 1.3 - (sell >= 0 ? step * 0.25 : 0), rr = -0.5 + (i % 2 ? -0.12 : 0.1);
      P(o, k, s, fr(C7, fwd, rr), { expr: i === 0 ? (f >= 783 ? "laugh" : "grin") : (i % 2 ? "nervous" : "neutral"), facing: 1, prop: PR("cash"), mode: "stand", look: 0.5 });
    });
    if (S.after(785)) for (let i = 0; i < 3; i++) { const t0 = 783 + i * 3, at = fr(C7, 6.3 + i * 0.5, -0.2 + i * 0.35, 2.05 + 0.25 * i + 0.012 * (f - t0)); card(S, "dollar", K.fxDollar, at, 0.42 * pop(f, t0), 0.42 * pop(f, t0)); }
  } else if (id === 8) {
    const w = fr(C8, 2.6, -0.3), cash = fr(C8, 5.3, 0.35);
    const big = f >= 893;
    P(CAST.winner, "winner", SEED.winner, w, { expr: f < 850 ? "shock" : f < 899 ? "laugh" : "wink", facing: 1, wave: 0.15 + 0.08 * Math.sin(f * 0.4), look: 0.5, tilt: f < 850 ? -4 : 3 });
    P(CAST.cashier, "cashier", SEED.cashier, cash, { expr: f < 845 ? "shock" : "nervous", facing: -1, look: -0.5 });
    const cupAt: V3 = [w[0] + 0.38 * 0.85, 2.02 + 0.03 * Math.sin(f * 0.4), w[2] - 0.38 * 0.52];
    card(S, "cupGold", K.fxCupCard, cupAt, 0.36, 0.42, 256, 300);
    card(S, "glow", K.fxGlow, [cupAt[0], cupAt[1] - 0.02, cupAt[2] + 0.02], 0.6, 0.6, 256, 256, true);
    card(S, "stars" + (f % 16), (p) => fxSparkle(p, (f % 16) / 16), [cupAt[0], cupAt[1] + 0.2, cupAt[2]], 0.6, 0.3, 420, 220);
    if (big && f >= 899) card(S, "wink", K.fxWink, [w[0] - 0.05, 1.86, w[2] + 0.05], 0.14 * pop(f, 899), 0.14 * pop(f, 899), 128, 128);
    // background customers
    P(X(CAST.cust2, { jacket: "#3fb7a8" } as Partial<Outfit>), "custF", 61, [-2.0, 0, -2.0], { expr: f > 820 ? "shock" : "neutral", facing: 1, look: 0.6 }, false, SIT + 0.3);
    P(CAST.kid, "kid", SEED.kid, [-1.2, 0, -0.4], { expr: "shock", facing: 1, look: 0.5 });
  } else if (id === 17) {
    const reveal = f >= 1662, sad = f >= 1676;
    const at: V3 = [-2.22, 0, 3.05];
    P(CAST.cust1, "cust1", SEED.cust1, at, { expr: !reveal ? "grin" : sad ? "sad" : "shock", facing: -1, look: -0.3, tilt: sad ? -5 : 0, prop: PR("cup") }, false, SIT - (sad ? 0.04 : 0));
    const peel = Math.max(0, Math.min(1, (f - 1636) / 24));
    const sAt: V3 = [-2.62, 0.98 + (reveal ? 0.1 : 0), 2.75];
    card(S, reveal ? "stickerTry" : "stickerBack" + Math.round(peel * 5), (p) => K.fxSticker(p, false, reveal ? 0 : 1 - peel), sAt, reveal ? 0.2 : 0.14, reveal ? 0.25 : 0.175, 256, 320, false, reveal ? 0.08 : -0.15);
    if (sad) card(S, "sad" + (f % 20), (p) => K.fxSadCloud(p, (f % 20) / 20), [at[0] + 0.05, 1.68, at[2]], 0.42 * pop(f, 1676), 0.42, 300, 300);
    // across the booth: an empty seat with a tray; outside customers walk past the window
    const u = (f - 1628) / 77;
    P(X(CAST.cust2, { jacket: "#d0607a" } as Partial<Outfit>), "walker", 63, [-7 + 6 * u, 0, 7.2], { mode: "stroll", phase: (f / 30) % 1, expr: "grin", facing: 1 });
  } else if (id === 18) {
    const slide = glide((f - 1709) / 22), give = f >= 1731;
    const chief: V3 = [-6.25, 0, 3.0], friend: V3 = [-4.75, 0, 3.0];
    P(CAST.chief, "chief", SEED.chief, chief, { expr: f >= 1744 ? "wink" : give ? "sly" : "smirk", facing: -1, look: -0.5, prop: f < 1712 ? PR("sticker") : undefined }, false, SIT);
    P(CAST.friend, "friend", SEED.friend, friend, { expr: f >= 1742 ? "laugh" : give ? "grin" : "shock", facing: 1, look: 0.6 }, false, SIT);
    const sx = -5.95 + 1.0 * slide, sy = 0.8 + 0.22 * Math.sin(Math.PI * Math.min(1, slide)) * 0, sAt: V3 = [sx, sy + 0.06, 2.85];
    card(S, "glow", K.fxGlow, [sAt[0], sAt[1] + 0.05, sAt[2] - 0.05], 0.55, 0.45, 256, 256, true);
    card(S, "stickerGold", (p) => K.fxSticker(p, true), sAt, 0.17, 0.21, 256, 320, false, -0.25 + 0.25 * slide);
    card(S, "stars" + (f % 16), (p) => fxSparkle(p, (f % 16) / 16), [sAt[0], sAt[1] + 0.22, sAt[2]], 0.5, 0.26, 420, 220);
    if (f >= 1744) card(S, "wink", K.fxWink, [chief[0] + 0.02, 1.4, chief[2] - 0.1], 0.14 * pop(f, 1744), 0.14 * pop(f, 1744), 128, 128);
  }
};
export const DINER: SetDef = { name: "diner", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
