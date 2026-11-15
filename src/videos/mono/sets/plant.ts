// SET "plant" — the secure printing plant of an invented company (SENTINEL SECURE PRINTING CO., 1990s USA).
// Shots 2 (vault annex, lamp + high window), 3 (press hall), 4 + 5 (front yard), 6 (roadside van).
// Local metres, y up, built at ORIGIN. Hall: x -16..16, z -30..0 (front face z = 0, facing +z). Vault annex: x -43.5..-36.5,
// z -20.5..-12. Yard z 0..24 (palisade fence + gate), road z 27..35 along x, field/hills/skyline beyond.
import * as THREE from "three";
import { Put, C, PL, WD, SHT, lam, tree, U } from "../kit";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, glide } from "../cam";
import type { StageAPI, FrontOpts } from "../stagekit";
import { fxStars } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import { brickTex, blockTex, concreteTex, roadTex, grassTex, plate, fxSticker, fxGlow, fxEnvelope, fxBriefcase, fxCopPhoto, fxStamp, fxPuff } from "./plant_tex";
import { press, cage, paperPallet, paperRoll, forklift, palisade, car, van, securityDesk, highBay, glow, cylZ, cylY, HAZ, STEEL, DKSTEEL, YEL } from "./plant_props";

export const ORIGIN: V3 = [400, 0, 0];
/** local -> world */
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];
/** fallback held props (briefcase / envelope cards) until the character kit draws "briefcase" / "envelope" in hand */
export const HELD_FALLBACK = false;
const BRIEFCASE: FrontOpts["prop"] = ["briefcase", 0];

const BRICK = () => lam("plantBrick", () => ({ map: brickTex("#a85a3e") }));
const BLOCK = () => lam("vaultBlock", () => ({ map: blockTex("#6e5a4a") }));
const CONC = (c: string, k = "") => lam("conc" + c + k, () => ({ map: concreteTex(c, k) }));

// ---------------- hall + annex + yard + road ----------------
const HX = 16, HZ = -30, HH = 9, T = 0.4;
const DOOR: [number, number] = [-7, -5]; // personnel door in the front wall
const VX0 = -43.5, VX1 = -36.5, VZ0 = -20.5, VZ1 = -12, VH = 3.6, VT = 0.5; // vault interior
const WIN = { z0: -18.7, z1: -17.3, y0: 2.6, y1: 3.3 };                       // vault high window (left wall, x = VX0)

const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  const brick = BRICK(), trimM = C("#d9cdb4"), dk = C(DKSTEEL);
  // ground: grass everywhere, concrete yard, road
  P.box(lam("pgrass", () => ({ map: grassTex() })), -150, 150, -0.12, -0.06, -150, 150, 6);
  P.box(CONC("#cdb89a", "yard"), -60, 60, -0.06, 0, -40, 26, 4);
  P.box(lam("proad", () => ({ map: roadTex() })), -150, 150, -0.06, 0.004, 27, 35, 8);
  P.box(C("#b9b0a0"), -150, 150, -0.06, 0.08, 26, 27); P.box(C("#b9b0a0"), -150, 150, -0.06, 0.08, 35, 36);
  P.box(CONC("#b8b4ae", "drive"), -3, 3, -0.06, 0.006, 24, 27.1, 4);

  // ===== HALL shell (W: receives sun through the skylights and clerestory windows) =====
  PI.box(CONC("#b8a68e", "floor"), -HX, HX, 0, 0.012, HZ, 0, 4);
  for (let x = -12; x <= 12; x += 6) PI.box(C(YEL), x - 0.06, x + 0.06, 0.012, 0.016, HZ + 1, -1); // lane lines
  PI.box(C(YEL), -HX + 1, HX - 1, 0.012, 0.016, -9.2, -9.08);
  // front wall with door gap
  PI.box(brick, -HX - T, DOOR[0], 0, HH, -T, 0, 2); PI.box(brick, DOOR[1], HX + T, 0, HH, -T, 0, 2); PI.box(brick, DOOR[0], DOOR[1], 2.6, HH, -T, 0, 2);
  PI.box(brick, -HX - T, HX + T, 0, HH, HZ - T, HZ, 2); // back wall
  // side walls with clerestory windows (y 6..8)
  const wz = [-5, -11, -17, -23];
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? -HX - T : HX, x1 = sx < 0 ? -HX : HX + T;
    PI.box(brick, x0, x1, 0, 6, HZ, 0, 2); PI.box(brick, x0, x1, 8, HH, HZ, 0, 2);
    let z = HZ;
    for (const c of wz.slice().reverse()) { PI.box(brick, x0, x1, 6, 8, z, c - 1.6, 2); z = c + 1.6; }
    PI.box(brick, x0, x1, 6, 8, z, 0, 2);
    for (const c of wz) {
      for (let k = 0; k <= 4; k++) PI.box(dk, x0 + 0.1, x1 - 0.1, 6, 8, c - 1.6 + k * 0.8 - 0.03, c - 1.6 + k * 0.8 + 0.03);
      PI.box(dk, x0 + 0.1, x1 - 0.1, 6.97, 7.03, c - 1.6, c + 1.6);
      PI.box(trimM, x0 - 0.05, x1 + 0.05, 5.85, 6.0, c - 1.7, c + 1.7);
    }
  }
  // inner painted dado (grey lower band + hazard stripe) and steel columns
  PI.box(PL("#8f979c"), -HX + 0.01, HX - 0.01, 0, 1.4, HZ + 0.01, HZ + 0.06, 2.5);
  PI.box(HAZ(), -HX, HX, 1.4, 1.62, HZ + 0.02, HZ + 0.07, 1);
  for (const sx of [-1, 1]) { PI.box(PL("#8f979c"), sx * HX - sx * 0.06, sx * HX - sx * 0.01, 0, 1.4, HZ, 0, 2.5); }
  for (let z = HZ + 3; z < 0; z += 6) for (const sx of [-1, 1]) {
    const x = sx * (HX - 0.25);
    PI.box(C("#8a4a36"), x - 0.18, x + 0.18, 0, HH, z - 0.06, z + 0.06); PI.box(C("#8a4a36"), x - 0.06, x + 0.06, 0, HH, z - 0.18, z + 0.18);
    PI.box(C("#8a4a36"), x - 0.3, x + 0.3, 7.0, 7.2, z - 0.3, z + 0.3);
  }
  // roof with three skylight strips + trusses
  const solid: [number, number][] = [[HZ - T, -25], [-23.5, -17], [-15.5, -9], [-7.5, 0]];
  for (const [a, b] of solid) PI.box(C("#7a6a5e"), -HX - T, HX + T, HH, HH + 0.4, a, b);
  for (const [a, b] of [[-25, -23.5], [-17, -15.5], [-9, -7.5]]) {
    for (let x = -HX; x <= HX; x += 1.6) PI.box(dk, x - 0.04, x + 0.04, HH, HH + 0.5, a, b);
    for (const z of [a, b]) PI.box(C("#8a8f96"), -HX - T, HX + T, HH + 0.4, HH + 0.75, z - 0.12, z + 0.12);
  }
  for (let z = HZ + 3; z < 0; z += 6) { PI.box(dk, -HX, HX, 8.3, 8.45, z - 0.06, z + 0.06); for (let x = -HX + 2; x < HX; x += 4) PI.rod(dk, [x, 8.45, z], [x + 2, HH, z], 0.04); }
  P.box(trimM, -HX - T - 0.1, HX + T + 0.1, HH + 0.4, HH + 1.3, -T, 0.08); // parapet (front)
  P.box(C("#6f6a64"), -HX - T - 0.15, HX + T + 0.15, HH + 1.3, HH + 1.42, -T - 0.05, 0.14);
  // gantry crane: rails on column brackets + yellow bridge with hoist
  for (const sx of [-1, 1]) PI.box(dk, sx * (HX - 0.5) - 0.15, sx * (HX - 0.5) + 0.15, 7.2, 7.4, HZ + 0.5, -0.5);
  PI.box(C(YEL), -HX + 0.4, HX - 0.4, 7.4, 7.9, -13.3, -12.7); PI.box(HAZ(), -HX + 0.4, HX - 0.4, 7.4, 7.6, -12.69, -12.66, 1);
  PI.box(C("#3a3a42"), -3.4, -2.4, 6.9, 7.4, -13.4, -12.6); PI.rod(dk, [-2.9, 6.9, -13], [-2.9, 4.6, -13], 0.03);
  PI.box(C(YEL), -3.1, -2.7, 4.3, 4.6, -13.15, -12.85); PI.geo(new THREE.TorusGeometry(0.15, 0.04, 6, 14, 4.2).rotateZ(3.6).translate(-2.9, 4.15, -13), dk);
  // lamps
  for (const x of [-10, 0, 10]) for (const z of [-5, -13, -21, -27]) highBay(PI, root, x, 7.6, z, 8.3);

  // ===== HALL contents (PI: read lit like overhead work light) =====
  press(PI, root, -9, 3, -17.2, -15.0);
  cage(PI, 8.5, 15.5, -29.5, -19.5, 3.0, 10.2);
  PI.box(plate("authp", ["AUTHORIZED", "PERSONNEL ONLY"], "#c8323c", "#fff6e0", 1024, 400, [130, 100]), 11.4, 13.8, 2.0, 2.95, -19.42, -19.38);
  PI.box(plate("cageb", ["SECURE STORAGE - CAGE B"], "#efe6cc", "#2a2a30", 1024, 160, [96]), 8.7, 10.9, 2.35, 2.7, -19.42, -19.38);
  for (let i = 0; i < 4; i++) { // shelving with sealed cartons inside the cage
    const x = 9.2 + i * 1.6;
    for (const y of [0.1, 1.0, 1.9]) { PI.box(C(STEEL), x - 0.7, x + 0.7, y, y + 0.05, -29.3, -28.3); for (let k = 0; k < 3; k++) PI.box(WD("#c08a50"), x - 0.62 + k * 0.45, x - 0.25 + k * 0.45, y + 0.05, y + 0.42 + (k % 2) * 0.12, -29.2, -28.5); }
    for (const dx of [-0.7, 0.7]) PI.box(C(DKSTEEL), x + dx - 0.03, x + dx + 0.03, 0, 2.6, -29.3, -28.3);
  }
  for (let i = 0; i < 3; i++) paperPallet(PI.at(13.2, -24 + i * 1.6), r, 0, 0, 0.6 + i * 0.3);
  // paper stores on the left: pallets, standing rolls, the forklift
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) paperPallet(PI, r, -14.2 + j * 1.4, -28.4 + i * 1.3, 0.9 + ((i + j) % 3) * 0.3);
  for (let i = 0; i < 6; i++) paperRoll(PI, -10.5 + (i % 3) * 1.1, -27.8 + Math.floor(i / 3) * 1.1);
  paperRoll(PI, -10.5, -27.8, 0.5, 1.2, 1.2);
  forklift(PI.at(-12.8, -9.5, 0.4), r);
  PI.box(plate("nosmoke", ["NO SMOKING"], "#efe6cc", "#c8323c", 1024, 200, [120]), -12.5, -9.5, 3.2, 3.9, HZ + 0.07, HZ + 0.1);
  PI.box(plate("hands", ["CAUTION", "KEEP HANDS CLEAR"], YEL, "#1f1a22", 1024, 360, [120, 80]), -3.4, -0.6, 3.4, 4.4, HZ + 0.07, HZ + 0.1);
  PI.box(plate("plantname", ["SENTINEL SECURE PRINTING CO.", "PLANT 2 - SECURITY PRINT DIVISION"], "#2f4f7a", "#f3ead6", 2048, 420, [150, 80]), 0.5, 7.5, 4.0, 5.4, HZ + 0.07, HZ + 0.1);
  // seal table (shot 3 "sealed / tamper-proof")
  const tb = WD("#8a5a34");
  PI.box(tb, 5.8, 8.6, 0.82, 0.9, -11.0, -10.0, 1.0); for (const [x, z] of [[5.9, -10.9], [8.5, -10.9], [5.9, -10.1], [8.5, -10.1]]) PI.box(C(DKSTEEL), x - 0.04, x + 0.04, 0, 0.82, z - 0.04, z + 0.04);
  for (let i = 0; i < 4; i++) { const x = 6.0 + i * 0.32; PI.box(C("#e0b46e"), x, x + 0.28, 0.9, 0.9 + 0.05 + i * 0.03, -10.95, -10.6); }
  PI.box(C("#d8433a"), 8.0, 8.4, 0.9, 1.05, -10.9, -10.55); // wax pot / tape dispenser
  PI.geo(cylY(0.09, 0.08, 7.9, 0.9, -10.3, 14), C("#c8323c"));
  PI.box(C("#e9e1d0"), 6.0, 6.35, 0.9, 0.915, -10.45, -10.05); PI.box(C("#7a5a3c"), 6.12, 6.24, 0.915, 0.93, -10.4, -10.35); // clipboard
  // security desk with CRT monitors near the entrance
  securityDesk(PI.at(12.6, -6.8), root);
  PI.box(plate("secchk", ["SECURITY CHECKPOINT"], "#1f2a44", "#f3ead6", 1024, 160, [96]), 10.8, 14.4, 3.3, 3.75, -7.32, -7.28);

  // ===== VAULT annex (W walls so the high window throws the only sun shaft) =====
  const bl = BLOCK(), vf = CONC("#7a6a5c", "vault");
  P.box(vf, VX0 - VT, VX1 + VT, 0, 0.012, VZ0 - VT, VZ1 + VT, 3);
  PI.box(bl, VX0 - VT, VX1 + VT, 0, VH, VZ0 - VT, VZ0, 2.4); PI.box(bl, VX0 - VT, VX1 + VT, 0, VH, VZ1, VZ1 + VT, 2.4); PI.box(bl, VX1, VX1 + VT, 0, VH, VZ0, VZ1, 2.4);
  PI.box(bl, VX0 - VT, VX0, 0, WIN.y0, VZ0, VZ1, 2.4); PI.box(bl, VX0 - VT, VX0, WIN.y1, VH, VZ0, VZ1, 2.4);
  PI.box(bl, VX0 - VT, VX0, WIN.y0, WIN.y1, VZ0, WIN.z0, 2.4); PI.box(bl, VX0 - VT, VX0, WIN.y0, WIN.y1, WIN.z1, VZ1, 2.4);
  for (let k = 1; k < 4; k++) { const z = WIN.z0 + (k * (WIN.z1 - WIN.z0)) / 4; PI.box(dk, VX0 - 0.35, VX0 - 0.25, WIN.y0, WIN.y1, z - 0.025, z + 0.025); }
  PI.box(C("#4a4e58"), VX0 - VT - 0.05, VX1 + VT + 0.05, VH, VH + 0.45, VZ0 - VT - 0.05, VZ1 + VT + 0.05);
  PI.box(C("#5e4e44"), VX0 + 0.01, VX1 - 0.01, VH - 0.02, VH, VZ0 + 0.01, VZ1 - 0.01);
  // vault door (round, back wall) with locking wheel and bolts
  const vd = C("#9aa3ad"), vx = -41.3, vy = 1.3, vz = VZ0;
  P.geo(cylZ(1.2, 0.12, vx, vy, vz + 0.06, 40), dk); P.geo(cylZ(1.05, 0.3, vx, vy, vz + 0.2, 40), vd); P.geo(cylZ(0.8, 0.06, vx, vy, vz + 0.37, 36), C("#b8c0c8"));
  P.geo(new THREE.TorusGeometry(0.38, 0.04, 8, 28).translate(vx, vy, vz + 0.48), C("#d8b24a"));
  for (let i = 0; i < 3; i++) P.geo(new THREE.BoxGeometry(0.76, 0.05, 0.05).rotateZ((i * Math.PI) / 3).translate(vx, vy, vz + 0.48), C("#d8b24a"));
  P.geo(cylZ(0.08, 0.2, vx, vy, vz + 0.45, 12), C("#d8b24a"));
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; P.geo(cylZ(0.05, 0.08, vx + Math.cos(a) * 0.92, vy + Math.sin(a) * 0.92, vz + 0.38, 8), dk); }
  P.box(dk, vx + 1.05, vx + 1.25, vy - 0.5, vy + 0.5, vz, vz + 0.3);
  // safe-deposit drawers (back wall, right of the door)
  P.box(dk, -39.7, -36.6, 0.0, 2.7, VZ0, VZ0 + 0.35);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 10; j++) {
    const x = -39.6 + i * 0.43, y = 0.12 + j * 0.255;
    P.box(C(j % 3 === 0 ? "#a8b0b8" : "#8f98a2"), x, x + 0.39, y, y + 0.22, VZ0 + 0.35, VZ0 + 0.39);
    P.box(C("#d8b24a"), x + 0.16, x + 0.23, y + 0.08, y + 0.12, VZ0 + 0.39, VZ0 + 0.42);
  }
  P.box(plate("vlt", ["VAULT 1", "DUAL CONTROL"], "#c8323c", "#fff6e0", 512, 256, [80, 52]), vx - 0.45, vx + 0.45, 2.75, 3.2, VZ0 + 0.01, VZ0 + 0.04);
  // right wall: steel shelving with sealed cartons; left: filing cabinet
  for (const y of [0.3, 1.1, 1.9]) {
    P.box(C(STEEL), VX1 - 0.6, VX1, y, y + 0.05, -18.5, -13.2);
    for (let k = 0; k < 8; k++) P.box(WD(k % 3 ? "#c08a50" : "#b07a44"), VX1 - 0.55, VX1 - 0.08, y + 0.05, y + 0.38 + (k % 2) * 0.1, -18.4 + k * 0.62, -17.9 + k * 0.62);
  }
  for (const z of [-18.5, -15.9, -13.2]) P.box(C(DKSTEEL), VX1 - 0.6, VX1 - 0.55, 0, 2.5, z - 0.03, z + 0.03);
  P.box(C("#5f6a74"), VX0, VX0 + 0.6, 0, 1.35, -14.4, -13.4); for (let k = 0; k < 3; k++) P.box(C("#d8b24a"), VX0 + 0.6, VX0 + 0.63, 0.3 + k * 0.42, 0.36 + k * 0.42, -14.0, -13.8);
  // the lamp-lit table (PI: reads lit), chair, hanging lamp
  const tx = -40.2, tz = -16.8;
  PI.box(WD("#7a4a2c"), tx - 0.95, tx + 0.95, 0.84, 0.9, tz - 0.5, tz + 0.5, 1.0);
  for (const [x, z] of [[-0.85, -0.42], [0.85, -0.42], [-0.85, 0.42], [0.85, 0.42]]) PI.box(C("#4a2e1c"), tx + x - 0.04, tx + x + 0.04, 0, 0.84, tz + z - 0.04, tz + z + 0.04);
  for (let i = 0; i < 5; i++) PI.box(C("#e0b46e"), tx + 0.25 + (i % 2) * 0.03, tx + 0.75, 0.9 + i * 0.025, 0.92 + i * 0.025, tz - 0.3, tz + 0.05);
  PI.box(C("#9aa2ac"), tx - 0.85, tx - 0.35, 0.9, 1.05, tz - 0.35, tz + 0.05); // metal case on the table
  PI.box(C("#26262c"), tx - 0.62, tx - 0.58, 1.05, 1.08, tz - 0.2, tz - 0.1);
  P.rod(dk, [tx, VH, tz], [tx, 2.55, tz], 0.012);
  P.geo(new THREE.CylinderGeometry(0.06, 0.32, 0.26, 18, 1, true).translate(tx, 2.42, tz), C("#2f4a3c"));
  glow(root, P, new THREE.SphereGeometry(0.09, 12, 9).translate(tx, 2.32, tz), new THREE.Color(3.2, 2.5, 1.4));
  // outside of the annex + a link corridor to the hall
  P.box(bl, VX1 + VT, -HX - T, 0, 3.2, -16.5, -14.5, 2.4); P.box(C("#4a4e58"), VX1 + VT, -HX - T, 3.2, 3.5, -16.7, -14.3);

  // ===== FRONT (exterior): signage, door canopy, dock, lights =====
  P.box(plate("front", ["SENTINEL SECURE PRINTING CO."], "#1f2a44", "#f3ead6", 2048, 220, [150]), -11, 11, HH + 0.5, HH + 1.2, 0.08, 0.12);
  P.box(trimM, DOOR[0] - 0.15, DOOR[1] + 0.15, 0, 2.75, 0.0, 0.1); P.box(C("#2a2830"), DOOR[0], DOOR[1], 0, 2.6, -0.02, 0.11);
  P.box(C("#4f5a62"), DOOR[0] - 0.6, DOOR[1] + 0.6, 2.95, 3.1, 0, 1.4); for (const x of [DOOR[0] - 0.5, DOOR[1] + 0.5]) P.rod(dk, [x, 3.0, 1.3], [x, 3.8, 0.05], 0.025);
  P.box(C("#4f5a62"), DOOR[1] + 0.05, DOOR[1] + 0.12, 0, 2.5, 0.05, 1.0); // open steel door leaf
  P.box(plate("authf", ["AUTHORIZED", "PERSONNEL ONLY"], "#c8323c", "#fff6e0", 1024, 400, [130, 100]), -10.4, -8.0, 1.4, 2.35, 0.0, 0.04);
  P.box(plate("visit", ["ALL VISITORS", "REPORT TO SECURITY"], "#efe6cc", "#1f2a44", 1024, 360, [100, 80]), -4.6, -2.8, 1.5, 2.15, 0.0, 0.04);
  P.box(plate("bh", ["BLDG 2"], "#efe6cc", "#1f2a44", 512, 256, [140]), -6.5, -5.5, 3.25, 3.75, 0.0, 0.04);
  for (const x of [-12, -1, 4]) { P.box(dk, x - 0.15, x + 0.15, 4.4, 4.5, 0, 0.4); glow(root, P, new THREE.BoxGeometry(0.26, 0.1, 0.2).translate(x, 4.35, 0.32), new THREE.Color(2.4, 2.1, 1.5)); }
  for (let i = 0; i < 4; i++) { const x = -14 + i * 2.4; P.box(C("#4a5056"), x - 0.7, x + 0.7, 5.6, 6.6, -0.02, 0.03); P.box(C("#2a3550"), x - 0.6, x + 0.6, 5.7, 6.5, 0.0, 0.04); }
  // loading dock (right side of the facade)
  P.box(CONC("#b8b0a2", "dock"), 5, 15.8, 0, 1.2, 0, 2.6, 3); P.box(HAZ(), 5, 15.8, 1.0, 1.2, 2.6, 2.62, 1);
  for (const [a, b, n] of [[5.8, 9.6, 1], [11.0, 14.8, 2]] as const) {
    P.box(SHT("#8f98a2"), a, b, 1.2, 4.6, 0.0, 0.05, 1); P.box(C("#3f4a54"), a - 0.15, b + 0.15, 4.6, 5.0, 0, 0.35);
    P.box(plate("dock" + n, [`DOCK ${n}`], YEL, "#1f1a22", 512, 200, [120]), (a + b) / 2 - 0.6, (a + b) / 2 + 0.6, 5.1, 5.55, 0.0, 0.04);
    for (const x of [a + 0.2, b - 0.2]) P.box(C("#1d1b22"), x - 0.12, x + 0.12, 0.7, 1.15, 2.6, 2.75);
  }
  for (let x = 5.3; x < 15.8; x += 3.4) P.rod(C(YEL), [x, 1.2, 2.45], [x, 2.2, 2.45], 0.04);
  P.box(C(YEL), 5.1, 15.7, 2.15, 2.22, 2.4, 2.5);
  P.box(C("#3a5a4a"), 16.6, 18.6, 0, 1.6, 1, 2.6); P.slab(C("#2f4a3c"), 16.5, 18.7, 0.9, 1.6, 2.7, 1.75, 0.08); // dumpster
  for (let i = 0; i < 3; i++) P.box(WD("#b88a52"), 16.8, 18.0, i * 0.15, i * 0.15 + 0.13, 3.2, 4.2, 0.6);
  for (const x of [-15, -9.5]) { P.geo(cylY(0.12, 1.0, x, 0, 1.2, 12), C(YEL)); P.box(HAZ(), x - 0.13, x + 0.13, 0.75, 0.85, 1.07, 1.33); }
  // yard: parked cars, lamp posts, guard booth + boom gate, palisade fence
  car(P.at(22, 8, Math.PI / 2), "#8a2e2e"); car(P.at(25.6, 8, Math.PI / 2), "#2f4f7a"); car(P.at(-22, 9, -Math.PI / 2), "#c9c2a8");
  for (const [x, z] of [[-14, 12], [12, 14], [-30, 14], [32, 12]]) { P.rod(dk, [x, 0, z], [x, 7, z], 0.07); P.box(dk, x - 0.1, x + 0.1, 6.95, 7.05, z - 0.8, z); glow(root, P, new THREE.BoxGeometry(0.3, 0.06, 0.5).translate(x, 6.92, z - 0.6), new THREE.Color(2.2, 2.0, 1.6)); }
  palisade(P, -32, 40, 24, 2.4, [-3.2, 3.2]);
  palisade(P.at(-32, 24, -Math.PI / 2), -37, 0, 0, 2.4); palisade(P.at(40, 24, -Math.PI / 2), -44, 0, 0, 2.4);
  P.box(plate("notres", ["NO TRESPASSING"], "#c8323c", "#fff6e0", 1024, 200, [110]), -9.4, -7.4, 1.3, 1.75, 24.02, 24.06);
  P.box(plate("gatesg", ["SENTINEL SECURE PRINTING", "PLANT 2  -  DELIVERIES AT DOCK"], "#1f2a44", "#f3ead6", 1024, 300, [86, 56]), 4.4, 8.4, 2.6, 3.6, 24.02, 24.06);
  for (const x of [4.6, 8.2]) P.box(dk, x - 0.06, x + 0.06, 0, 3.6, 23.9, 24.02);
  const bx = 5.6, bz = 21.6;
  P.box(PL("#d9cdb4"), bx - 1.1, bx + 1.1, 0, 2.6, bz - 1.0, bz + 1.0, 2.5); P.box(C("#2a3550"), bx - 1.12, bx + 1.12, 1.1, 2.1, bz - 0.8, bz + 0.8);
  P.box(C("#2a3550"), bx - 0.8, bx + 0.8, 1.1, 2.1, bz - 1.02, bz + 1.02); P.box(C("#4f5a62"), bx - 1.35, bx + 1.35, 2.6, 2.85, bz - 1.25, bz + 1.25);
  P.box(plate("secb", ["SECURITY"], "#c8323c", "#fff6e0", 512, 160, [100]), bx - 0.8, bx + 0.8, 2.3, 2.55, bz + 1.0, bz + 1.04);
  P.box(dk, 3.3, 3.6, 0, 1.0, 22.6, 22.9); P.box(lam("boom", () => ({ map: ctex2() })), -3.2, 3.4, 0.9, 1.0, 22.7, 22.8, 1.0);
  // ===== ROAD + far country: poles, trees, field, hills, industrial skyline =====
  for (let x = -140; x <= 140; x += 22) { P.rod(C("#6a4a33"), [x, 0, 37], [x, 8.5, 37], 0.12); P.box(C("#6a4a33"), x - 1.0, x + 1.0, 7.9, 8.05, 36.93, 37.07); }
  for (let x = -140; x < 140; x += 22) for (const dz of [-0.9, 0.9]) P.rod(C("#2a2830"), [x + dz, 8.0, 37], [x + 22 + dz, 8.0, 37], 0.015, 4);
  const tr = [[-30, 44, 1.0], [-18, 48, 1.2], [8, 45, 0.9], [20, 50, 1.3], [44, 46, 1.1], [52, 52, 1.0], [74, 47, 1.2], [88, 44, 0.9], [-50, 47, 1.1], [34, 58, 1.4], [66, 60, 1.3], [-8, 60, 1.2], [96, 56, 1.1], [-70, 50, 1.2]];
  for (const [x, z, s] of tr) tree(P, r, x, z, s);
  for (const [x, z] of [[-55, 10], [-50, -10], [50, -12], [55, 6], [-62, 30], [62, 22]]) tree(P, r, x, z, U(r, 1.0, 1.4));
  const hillC = ["#7f9a6a", "#6e8a64", "#8fa274", "#76906c"];
  for (let i = 0; i < 9; i++) { const x = -160 + i * 42 + U(r, -10, 10), z = 140 + U(r, -10, 15), s = U(r, 34, 54); P.geo(new THREE.SphereGeometry(1, 24, 12).scale(s, s * U(r, 0.28, 0.4), s * 0.6).translate(x, -2, z), C(hillC[i % 4])); }
  // distant industrial skyline (left of the field)
  const sk = ["#8a8f9c", "#9a9aa6", "#7f8494", "#a29a96"];
  for (let i = 0; i < 12; i++) { const x = -20 + i * 9 + U(r, -2, 2), z = 105 + U(r, -6, 6), w = U(r, 5, 9), h = U(r, 6, 16); P.box(C(sk[i % 4]), x - w / 2, x + w / 2, 0, h, z - 4, z + 4); }
  for (const [x, z, h] of [[-2, 102, 34], [20, 108, 40], [58, 100, 30]]) { P.geo(cylY(1.4, h, x, 0, z, 16), C("#b9b0aa")); for (let k = 0; k < 2; k++) P.geo(cylY(1.45, 2, x, h - 3 - k * 4.5, z, 16), C("#c8545a")); }
  P.geo(cylY(6, 9, 38, 0, 112, 24), C("#a8aab2")); P.geo(new THREE.SphereGeometry(6, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1).translate(38, 9, 112), C("#a8aab2"));
  P.geo(cylY(3, 3.2, 74, 16, 104, 18), C("#a29a96")); for (const dx of [-2, 2]) for (const dz of [-2, 2]) P.rod(C("#6a6670"), [74 + dx, 0, 104 + dz], [74 + dx * 0.7, 16, 104 + dz * 0.7], 0.2);
  // roadside spot of shot 6: the van, a mailbox, a road sign
  van(P.at(60.2, 39.7), r);
  P.rod(C("#3a3a42"), [52.5, 0, 37.2], [52.5, 2.4, 37.2], 0.05); P.box(plate("rt9", ["ROUTE 9"], "#2f6a3a", "#f3ead6", 512, 256, [110]), 51.9, 53.1, 1.9, 2.5, 37.25, 37.29);
  P.rod(C("#5a4a3a"), [66, 0, 37.4], [66, 1.1, 37.4], 0.05); P.box(C("#3a5a8a"), 65.75, 66.25, 1.1, 1.4, 37.2, 37.75);
  P.box(C("#d0c8b0"), 40, 80, -0.06, 0.02, 36, 42, 4); // gravel shoulder
};
/** red / white boom-barrier stripes */
const ctex2 = () => { const cv = document.createElement("canvas"); cv.width = 256; cv.height = 32; const g = cv.getContext("2d")!; for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f3ead6" : "#c8323c"; g.fillRect(i * 32, 0, 32, 32); } const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

// ---------------- cameras ----------------
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const sm = (f: number, a: number, b: number) => glide((f - a) / (b - a));
/** persistent punch-in factor at frame fp (multiplies the dolly distance) */
const punch = (f: number, fp: number, amt: number, dur = 5) => Math.exp(-amt * glide((f - fp + 2) / dur));
// shot 4 walk: chief steps out of the door and walks into the yard
const WALK0: V3 = [-6, 0, 0.9], WALK1: V3 = [-4.4, 0, 5.4];
const walkAt = (f: number): { at: V3; phase: number; moving: boolean } => {
  const k = Math.min(1, Math.max(0, (f - 377) / (468 - 377))), e = k < 1 ? k : 1;
  const at = lerp3(WALK0, WALK1, e), d = Math.hypot(WALK1[0] - WALK0[0], WALK1[2] - WALK0[2]) * e;
  return { at, phase: d / 1.35, moving: k > 0 && k < 1 };
};
const CHIEF5: V3 = [-4.4, 0, 5.4];
const VAN_CHIEF: V3 = [56.7, 0, 37.7];
const CAMS: Record<number, Key[]> = {
  2: [
    { f: 98, s: (f) => dolly(W([-37.9, 1.85, -12.9]), W([-40.3, 1.3, -17.0]), pushK(f, 98, 0.0022), { fov: 42 }) },
    { f: 163, dur: 7, s: (f) => dolly(W([-38.7, 1.62, -14.6]), W([-40.15, 1.42, -17.05]), pushK(f, 98, 0.0016), { fov: 38, roll: -0.06 * sm(f, 163, 200) }) },
  ],
  3: [
    { f: 229, s: (f) => { const k = sm(f, 229, 300); return dolly(W(lerp3([-10.5, 2.0, -9.0], [-1.5, 2.9, -9.6], k)), W(lerp3([-7.2, 1.45, -16], [1.6, 1.25, -16], k)), pushK(f, 229, 0.0012), { fov: 44 }); } },
    { f: 296, dur: 26, s: (f) => dolly(W([4.9, 2.25, -6.6]), W([7.1, 1.15, -10.4]), pushK(f, 229, 0.0016) * punch(f, 324, 0.14) * punch(f, 338, 0.1), { fov: 40, roll: 0.03 * sm(f, 320, 345) }) },
  ],
  4: [
    { f: 375, s: (f) => {
      const c = walkAt(f).at, a = 0.55 + (-0.4 - 0.55) * sm(f, 375, 517), rr = 4.4 - 0.6 * sm(f, 375, 517);
      const look: V3 = [c[0], 1.32, c[2]], pos: V3 = [c[0] + Math.sin(a) * rr, 1.15, c[2] + Math.cos(a) * rr];
      return dolly(W(pos), W(look), punch(f, 385, 0.12) * punch(f, 472, 0.1), { fov: 42, roll: 0.035 * sm(f, 470, 500) });
    } },
  ],
  5: [
    { f: 517, s: (f) => {
      const h: V3 = [CHIEF5[0], 1.55, CHIEF5[2]];
      return dolly(W([h[0] - 0.9, 1.45, h[2] - 2.4]), W(h), pushK(f, 517, 0.004) * punch(f, 544, 0.18, 6), { fov: 34, roll: 0.075 * sm(f, 517, 546) });
    } },
  ],
  6: [
    { f: 559, s: (f) => dolly(W([51.2, 1.6, 33.6]), W([57.0, 1.3, 38.4]), pushK(f, 559, 0.0018), { fov: 40 }) },
    { f: 640, dur: 14, s: (f) => dolly(W([52.4, 1.5, 34.6]), W([56.9, 1.35, 38.0]), pushK(f, 559, 0.0015) * punch(f, 662, 0.2, 5), { fov: 38, roll: -0.05 * sm(f, 655, 675) }) },
  ],
};
const DOF: Dof[] = [
  { f: 98, cInf: 6, focus: () => W([-40.2, 1.4, -17.3]) },
  { f: 163, dur: 8, cInf: 12, focus: () => W([-40.15, 1.42, -17.05]) },
  { f: 229, cInf: 4, focus: () => W([-3, 1.4, -15]) },
  { f: 300, dur: 20, cInf: 10, focus: () => W([7.1, 1.15, -10.6]) },
  { f: 375, cInf: 10, focus: (f) => { const c = walkAt(f).at; return W([c[0], 1.4, c[2]]); } },
  { f: 517, cInf: 16 },
  { f: 559, cInf: 11, focus: () => W([VAN_CHIEF[0], 1.4, VAN_CHIEF[2]]) },
];
const KICKS: [number, number][] = [[167, 1.2], [324, 0.7], [338, 0.5], [385, 0.6], [472, 0.7], [544, 1.1], [662, 1.1]];
const LIGHT: SetDef["LIGHT"] = {
  2: { light: "golden", sunAz: -145, sunEl: 32 },
  3: { light: "day", sunAz: 155, sunEl: 55 },
  4: { light: "day", sunAz: 145, sunEl: 40 },
  5: { light: "day", sunAz: 150, sunEl: 38 },
  6: { light: "golden", sunAz: 160, sunEl: 18 },
};

// ---------------- staging ----------------
const towards = (S: StageAPI, p: V3, d: number): V3 => { const c = S.cam.pos, dx = c.x - p[0], dz = c.z - p[2], l = Math.hypot(dx, dz) || 1; return [p[0] + (dx / l) * d, p[1], p[2] + (dz / l) * d]; };
/** world point offset along the camera's screen-right by dx metres and up by dy (from feet position p) */
const side = (S: StageAPI, p: V3, dx: number, dy: number, toCam = 0.05): V3 => { const R = S.cam.right; const q = towards(S, p, toCam); return [q[0] + R.x * dx, p[1] + dy, q[2] + R.z * dx]; };
const flat = (S: StageAPI, key: string, cw: number, ch: number, draw: (p: import("../stagekit").Pen) => void, at: V3, w: number, h: number, rot = 0, soft = false) =>
  S.st.fx.push({ key, cw, ch, draw, x: at[0], y: at[1], z: at[2], w, h, flat: true, rot, soft });
const pop = (f: number, f0: number) => { const x = (f - f0) / 6; return x <= 0 ? 0 : x >= 1 ? 1 : 1 + 0.25 * Math.sin(x * Math.PI) ; };

const stage = (id: number, f: number, S: StageAPI) => {
  const ch = CAST.chief, cs = SEED.chief;
  if (id === 2) {
    // vault: chief behind the lamp-lit table, lifts the glowing gold sticker out of an envelope
    const at = W([-40.25, 0, -17.55]);
    const lift = sm(f, 128, 164);
    S.P(ch, "chief", cs, at, { expr: f < 150 ? "stern" : f < 167 ? "greedy" : "sly", look: f < 140 ? 0.5 : -0.3, prop: f < 150 ? ["envelope", 0] : ["sticker", 1], headTilt: f > 167 ? -4 : 0 });
    flat(S, "envP", 256, 192, (p) => fxEnvelope(p, true, 0, 0), W([-40.0, 0.915, -16.75]), 0.5, 0.38, 0.15);
    const hand = side(S, at, 0.42 - 0.12 * lift, 1.0 + 0.62 * lift, 0.25);
    const g = 0.55 + 0.35 * lift + 0.08 * Math.sin(f * 0.4);
    S.card("glowS", 128, 128, (p) => fxGlow(p, "255,206,110", 0.95), hand, 0.9 * g, 0.9 * g, true);
    if (S.after(167)) S.card(`stars${Math.floor(f / 3) % 4}`, 256, 256, (p) => fxStars(p, Math.floor(f / 3) % 4), side(S, hand, 0.05, 0.12, 0.03), 0.55, 0.55);
    // lamp + window glow, the warm pool on the table and floor
    S.card("bulb", 128, 128, (p) => fxGlow(p, "255,200,120", 1), W([-40.2, 2.32, -16.8]), 1.0, 1.0, true);
    flat(S, "poolT", 128, 128, (p) => fxGlow(p, "255,190,110", 0.55), W([-40.2, 0.93, -16.8]), 2.6, 2.0, 0, true);
    flat(S, "poolF", 128, 128, (p) => fxGlow(p, "255,170,90", 0.35), W([-40.2, 0.03, -16.6]), 4.0, 4.0, 0, true);
    S.card("winG", 128, 128, (p) => fxGlow(p, "255,190,120", 0.8), W([-43.1, 2.95, -18.0]), 1.8, 1.4, true);
    return;
  }
  if (id === 3) {
    // press hall: pressman at the console, a guard on the cage door, a guard patrolling, the auditor sealing envelopes
    S.P(CAST.pressman, "pressman", SEED.pressman, W([-4.6, 0, -13.7]), { expr: "neutral", look: -0.4 });
    S.P(CAST.guard, "guard", SEED.guard, W([10.4, 0, -18.7]), { expr: "stern", look: -0.3 });
    const px = -1.5 + 3.5 * Math.sin((f - 229) / 70);
    S.P(CAST.guard, "guard", SEED.guard + 40, W([px, 0, -11.6]), { mode: "stroll", phase: (f - 229) / 18, expr: "stern" }, Math.cos((f - 229) / 70) < 0);
    const sw = f < 318 ? 0 : f < 324 ? sm(f, 318, 324) : f < 330 ? 1 - sm(f, 326, 332) * 0.6 : f < 338 ? 0.4 + 0.6 * sm(f, 333, 338) : 1 - 0.6 * sm(f, 341, 348);
    const aud = W([7.25, 0, -11.55]);
    S.P(CAST.auditor, "auditor", SEED.auditor, aud, { expr: f > 324 ? "smile" : "neutral", prop: ["hammer", sw] as FrontOpts["prop"], look: 0.2 });
    // stamp in the hand + the hero envelope propped on the table
    const env = W([7.0, 0.9, -10.35]);
    S.card("stamp", 128, 192, fxStamp, side(S, aud, 0.55 - 0.05 * sw, 1.45 - 0.45 * sw, 0.7), 0.22, 0.33);
    const seal = S.after(324) ? pop(f, 324) : 0, tape = S.after(338) ? Math.min(1, (f - 336) / 5) : 0;
    S.card(`env${seal.toFixed(2)}_${tape.toFixed(2)}`, 256, 192, (p) => fxEnvelope(p, false, seal, tape), [env[0], env[1] + 0.17, env[2]], 0.46, 0.345);
    if (S.after(324) && f < 340) S.card(`st3${Math.floor(f / 3) % 4}`, 256, 256, (p) => fxStars(p, Math.floor(f / 3) % 4), [env[0] + 0.1, env[1] + 0.45, env[2]], 0.5, 0.5);
    // sticker sheets riding the delivery conveyor
    for (let i = 0; i < 6; i++) { const u = ((f - 229) * 0.045 + i * 0.55) % 3.3; flat(S, "sheetF", 128, 128, (p) => sheetCard(p), W([3.5 + u, 1.03, -16.1]), 0.75, 0.55, 0); }
    return;
  }
  if (id === 4) {
    const w = walkAt(f);
    S.P(ch, "chief", cs, W(w.at), { mode: w.moving ? "stroll" : "stand", phase: w.phase, expr: f < 488 ? "stern" : "smile", prop: BRIEFCASE, look: f > 495 ? 0.4 : 0 });
    if (HELD_FALLBACK) S.card("brief", 256, 192, fxBriefcase, side(S, W(w.at), 0.4, 0.62, 0.12), 0.5, 0.375);
    const nod = (f0: number) => (f > f0 && f < f0 + 16 ? 8 * Math.sin(((f - f0) / 16) * Math.PI) : 0);
    S.P(CAST.guard, "guard", SEED.guard, W([-8.0, 0, 1.0]), { expr: "stern", headTilt: nod(468), look: 0.5 });
    S.P(CAST.guard, "guard", SEED.guard + 40, W([-3.6, 0, 0.8]), { expr: "stern", headTilt: -nod(472), look: -0.5 }, true);
    S.P(CAST.guard, "guard", SEED.guard + 80, W([5.2, 0, 23.2]), { expr: "neutral" });
    if (S.after(503)) {
      const k = pop(f, 503), c = w.at;
      S.card("copphoto", 320, 400, fxCopPhoto, side(S, W(c), -0.95, 1.95, 0.6), 0.62 * k, 0.775 * k, false, -0.08);
      S.card(`stc${Math.floor(f / 3) % 4}`, 256, 256, (p) => fxStars(p, Math.floor(f / 3) % 4), side(S, W(c), -1.3, 2.55, 0.7), 0.5, 0.5);
    }
    smoke(S, f);
    return;
  }
  if (id === 5) {
    S.P(ch, "chief", cs, W(CHIEF5), { expr: f < 542 ? "sly" : "wink", look: f < 530 ? -0.7 : 0.35, headTilt: f > 542 ? -6 : 0, prop: BRIEFCASE });
    if (HELD_FALLBACK) S.card("brief", 256, 192, fxBriefcase, side(S, W(CHIEF5), 0.4, 0.62, 0.12), 0.5, 0.375);
    if (S.after(544)) S.card(`st5${Math.floor(f / 3) % 4}`, 256, 256, (p) => fxStars(p, Math.floor(f / 3) % 4), side(S, W(CHIEF5), 0.55, 2.0, 0.3), 0.45, 0.45);
    smoke(S, f);
    return;
  }
  if (id === 6) {
    // roadside: alone at the van's open rear door, opens the envelope, glances around, pockets the sticker
    const at = W(VAN_CHIEF);
    const look = f < 572 ? 0 : f < 588 ? -0.9 : f < 604 ? 0.9 : f < 640 ? 0 : 0.6;
    const out = sm(f, 606, 628), inP = sm(f, 640, 662);
    S.P(ch, "chief", cs, at, { expr: f < 606 ? "nervous" : f < 662 ? "greedy" : "smirk", look, prop: f < 606 ? ["envelope", 0] : f < 640 ? ["sticker", 1] : null });
    if (f >= 640 && f < 664) {
      const from = side(S, at, 0.38, 1.3 + 0.22 * out, 0.33), to = side(S, at, -0.16, 1.02, 0.36);
      const p = lerp3(from, to, inP), s = 1 - 0.55 * inP;
      S.card("glow6", 128, 128, (q) => fxGlow(q, "255,206,110", 0.9), p, 0.75 * s, 0.75 * s, true);
      S.card("sticker", 256, 192, fxSticker, side(S, p, 0, 0, 0.02), 0.3 * s, 0.225 * s);
    }
    if (S.after(662) && f < 676) S.card(`st6${Math.floor(f / 3) % 4}`, 256, 256, (p) => fxStars(p, Math.floor(f / 3) % 4), side(S, at, -0.2, 1.25, 0.4), 0.42, 0.42);
    smoke(S, f);
  }
};
const sheetCard = (p: import("../stagekit").Pen) => { const g = p.g; g.fillStyle = "#1f1a24"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#f6f1e4"; g.fillRect(4, 4, 120, 120); const cols = ["#d8433a", "#2f6fd6", "#3f9a4a", "#e8a33a"]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.fillStyle = "#ffffff"; g.fillRect(10 + i * 38, 10 + j * 38, 32, 32); g.fillStyle = cols[(i + j) % 4]; g.fillRect(10 + i * 38, 10 + j * 38, 32, 9); } };
/** slow smoke from the distant stacks */
const smoke = (S: StageAPI, f: number) => {
  for (const [x, z, h] of [[-2, 102, 34], [20, 108, 40], [58, 100, 30]] as const) for (let i = 0; i < 3; i++) {
    const t = ((f * 0.01 + i / 3) % 1);
    S.card(`puff${i}`, 128, 128, (p) => fxPuff(p, i), W([x + t * 10, h + 3 + t * 9, z]), 7 + t * 9, 6 + t * 7, true);
  }
};
export const PLANT: SetDef = { name: "plant", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
