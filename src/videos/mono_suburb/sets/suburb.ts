// SET "suburb" — a 1990s American suburb: one long street (local +z recedes to the hills), two rows of houses with
// lawns, porches, picket fences, mailboxes, driveways with 90s cars, street trees, power poles + wires.
// Shots: 9 (three fake winners), 10 (golden crane over the network), 13 (fake TV crew), 14 (dusk arrest).
import * as THREE from "three";
import { Put, C, lam, U, pick, WD, rng } from "../kit";
import { grassHD } from "../paint";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, head } from "../cam";
import type { StageAPI } from "../stagekit";
import { fxStars } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import type { Outfit } from "../toon";
import { house, HO, garageX, picket, mailbox, flamingo, oak, pine, pole, wire, car, CarKind, CONC, SHING, TRIM } from "./suburb_props";
import { asphaltTex, checkCard, glow, thread, micCard, earCard, badgeCard, TX } from "./suburb_tex";
export const ORIGIN: V3 = [0, 0, 400];
/** local -> world */
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];
const GRASS = () => lam("subGrass", () => ({ map: grassHD() }));
const ASPH = () => lam("asph", () => ({ map: asphaltTex() }));

// ---------------- lots ----------------
/** right lots face -x (front at x = 15), left lots face +x (front at x = -15) */
const zR = (i: number) => -120 + 15 * i, zL = (i: number) => -127.5 + 15 * i;
/** lot frame (a along the facade, b toward the street) -> local [x, z] */
const lotXZ = (side: 1 | -1, zc: number, a: number, b: number): [number, number] => side > 0 ? [15 - b, zc + a] : [-15 + b, zc - a];
const WALLS = ["#e9d48c", "#9fb4c8", "#e8dcc0", "#a9bb98", "#ece6d8", "#d9a08a", "#cfb48c", "#b8c4d4", "#f0e2b8", "#c9b8a0"];
const ROOFS = ["#5f5658", "#6e5a50", "#4f5462", "#7a5a48", "#5a5f58"];
const SHUTS = ["#3f5f4a", "#36466a", "#7a3038", "#2e2a30", "#5a4a3a", "#4a6a7a"];
const DOORS = ["#7a3038", "#36466a", "#3f5f4a", "#f4efe4", "#8a5a3a"];
const CARS: [CarKind, string][] = [["sedan", "#7a2a35"], ["wagon", "#d8c8a4"], ["van", "#2f6a72"], ["sedan", "#c9c4bc"], ["sedan", "#33405e"], ["van", "#8a2a2a"], ["wagon", "#5a6a4a"], ["sedan", "#b8b49a"]];
/** fixed lots for the story beats */
const SPECIAL: Record<string, HO> = {
  "1,8": { kind: "colonial", w: 10, wall: "#e9d48c", roof: "#6e5a50", shut: "#3f5f4a", door: "#7a3038", garage: 1, curtain: "#f4efe4", hoop: true },    // butcher
  "1,9": { kind: "gable", w: 8.4, wall: "#b9a6cf", roof: "#4f4a62", shut: "#5a3a6a", door: "#5a3a6a", garage: 0, curtain: "#8a3a9a" },                  // psychic
  "1,10": { kind: "ranch", w: 13, wall: "#d8cdb8", roof: "#4a4650", shut: "#2e2a30", door: "#2e2a30", garage: -1, brick: true, curtain: "#c9b07a" },   // mobster
  "-1,3": { kind: "gable", w: 8.4, wall: "#9fb4c8", roof: "#5f5658", shut: "#36466a", door: "#f4efe4", garage: 0, curtain: "#f4efe4" },                  // TV crew yard
  "1,1": { kind: "colonial", w: 10, wall: "#ece6d8", roof: "#4f5462", shut: "#36466a", door: "#36466a", garage: 1, curtain: "#e8d8a8", warm: true },     // the chief
};
const lotHouse = (side: 1 | -1, i: number, r: () => number): HO => {
  const s = SPECIAL[`${side},${i}`];
  if (s) return s;
  const kind = pick(r, ["colonial", "ranch", "gable", "colonial", "ranch"] as const);
  return { kind, w: kind === "ranch" ? U(r, 12, 14) : kind === "gable" ? U(r, 7.6, 8.8) : U(r, 9.2, 10.6), wall: pick(r, WALLS), roof: pick(r, ROOFS), shut: pick(r, SHUTS),
    door: pick(r, DOORS), garage: kind === "gable" && r() < 0.5 ? 0 : (r() < 0.5 ? 1 : -1), brick: kind === "ranch" && r() < 0.5, curtain: r() < 0.6 ? pick(r, ["#f4efe4", "#e8c8a8", "#c9d8b8"]) : null, hoop: r() < 0.3 };
};
const psychicSign = () => TX("psychic", 512, 384, (g) => {
  g.fillStyle = "#5a2a6a"; g.fillRect(0, 0, 512, 384); g.strokeStyle = "#f2c94a"; g.lineWidth = 14; g.strokeRect(14, 14, 484, 356);
  g.fillStyle = "#f2c94a"; g.font = "900 78px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PSYCHIC", 256, 92, 440);
  g.font = "900 54px Arial Black, Arial"; g.fillText("READINGS", 256, 170, 440);
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(256, 280, 90, 46, 0, 0, 7); g.fill(); g.fillStyle = "#3a8ad8"; g.beginPath(); g.arc(256, 280, 34, 0, 7); g.fill();
  g.fillStyle = "#1a1014"; g.beginPath(); g.arc(256, 280, 15, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = "#1a1014"; g.beginPath(); g.ellipse(256, 280, 90, 46, 0, 0, 7); g.stroke();
});
const towerTx = () => TX("tower", 1024, 256, (g) => {
  g.fillStyle = "#d9dde2"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#2f5a8a"; g.font = "900 150px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("MAPLE HILLS", 512, 130, 960);
});

const lot = (P: Put, side: 1 | -1, i: number, r: () => number) => {
  const zc = side > 0 ? zR(i) : zL(i);
  const L = P.at(side * 15, zc, side > 0 ? -Math.PI / 2 : Math.PI / 2);
  const o = lotHouse(side, i, r);
  if (i > 12) { house(L, { ...o, garage: 0 }, r, true); if (i % 2) oak(L, r, -5, 6, 1.1); return; }
  house(L, o, r);
  const gx = garageX(o), walkX = o.kind === "ranch" ? o.w * 0.06 - 0.6 : o.kind === "gable" ? 0 : 0;
  // driveway (to the kerb), front walk, back yard fence
  L.box(CONC("#d4cab8"), gx - 2.6, gx + 2.6, 0, 0.025, -0.6, 8.2, 1.5);
  L.box(CONC("#d4cab8"), gx - 2.6, gx + 2.6, 0, 0.025, 9.7, 10.75, 1.5);
  L.box(CONC(), walkX - 0.6, walkX + 0.6, 0, 0.02, o.kind === "ranch" ? 1.8 : 3.0, 8.2, 1.5);
  L.box(WD("#a8805a"), -7.5, 7.5, 0, 1.8, -16.05, -15.95, 2.5);
  // picket fence along the sidewalk (gaps for the walk and the driveway)
  if (r() < 0.55 && !["1,1", "1,5", "-1,5", "1,6", "1,8", "1,9", "1,10", "-1,3"].includes(`${side},${i}`)) {
    const gaps: [number, number][] = [[walkX - 0.8, walkX + 0.8], [gx - 2.8, gx + 2.8]].sort((a, b) => a[0] - b[0]) as [number, number][];
    let x = -7.45;
    for (const [a, b] of gaps) { if (a - x > 0.4) picket(L.at(0, 7.95), x, a); x = Math.max(x, b); }
    if (7.45 - x > 0.4) picket(L.at(0, 7.95), x, 7.45);
  }
  if (!["1,8", "1,9", "1,10"].includes(`${side},${i}`)) mailbox(L.at(gx + 3.1, 10.25, Math.PI / 2), pick(r, ["#2a2a30", "#f4f1ea", "#3f5f4a", "#7a3038"]), r);
  // trees: front-lawn oak, parkway tree, back yard
  const tx = gx > 0 ? -U(r, 3.5, 6) : U(r, 3.5, 6);
  if (`${side},${i}` !== "-1,3") oak(L, r, tx, U(r, 4.5, 6.5), U(r, 0.9, 1.25));
  if (r() < 0.7 && `${side},${i}` !== "1,1") oak(L, r, gx > 0 ? -5.5 : 5.5, 9.25, U(r, 0.75, 1.0));
  for (let k = 0; k < 1; k++) (r() < 0.35 ? pine(L, U(r, -6, 6), U(r, -14, -11), U(r, 1.1, 1.6)) : oak(L, r, U(r, -6, 6), U(r, -15, -11), U(r, 1.0, 1.5)));
  if (r() < 0.2 || `${side},${i}` === "1,10") { flamingo(L.at(tx + 1.4, 5.2, 0.4)); flamingo(L.at(tx + 2.0, 5.6, -0.3)); }
  // car in the driveway
  if (o.garage && r() < 0.65 && `${side},${i}` !== "1,1") { const [k, c] = pick(r, CARS); car(L.at(gx + U(r, -0.5, 0.5), 3.4, Math.PI + U(r, -0.05, 0.05)), k, c); }
  if (`${side},${i}` === "1,10") car(L.at(gx, 3.6, Math.PI), "sedan", "#1d1b22");
  if (`${side},${i}` === "1,9") { const s = L.at(3.4, 6.6, 0.5); s.box(C("#3a2a22"), -0.04, 0.04, 0, 1.1, -0.04, 0.04); s.box(psychicSign(), -0.55, 0.55, 1.0, 1.82, -0.03, 0.03); }
  // back-row house (seen over the back fences), facing away
  if (r() < 0.7) { const B = P.at(side * 44, zc + U(r, -3, 3)), w = U(r, 9, 12), h = U(r, 3, 5.6), col = pick(r, WALLS);
    B.box(C(col), -4, 4, 0, h, -w / 2, w / 2); B.slab(SHING(pick(r, ROOFS)), -w / 2 - 0.4, w / 2 + 0.4, 4.4, h - 0.3, 0, h + 2, 0.15, 4); B.slab(SHING(pick(r, ROOFS)), w / 2 + 0.4, -w / 2 - 0.4, -4.4, h - 0.3, 0, h + 2, 0.15, 4); }
};
const reflector = (P: Put) => {
  const m = C("#2a2a30");
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; P.rod(m, [Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45], [0, 1.1, 0], 0.025, 5); }
  P.rod(m, [0, 1.1, 0], [0, 1.7, 0], 0.03, 5);
  P.geo(new THREE.CylinderGeometry(0.62, 0.62, 0.03, 24).rotateX(Math.PI / 2 - 0.35).translate(0, 1.9, 0), C("#f2d27a"));
};

const build = (P: Put, PI: Put, root: THREE.Object3D, r0: () => number) => {
  const r = rng(4242);
  // ground: asphalt road (top y = -0.15), concrete kerbs, grass, sidewalks
  P.box(ASPH(), -4, 4, -0.5, -0.15, -140, 260, 8);
  for (const s of [-1, 1]) {
    P.box(C("#cfc6b6"), s > 0 ? 4 : -4.25, s > 0 ? 4.25 : -4, -0.5, 0.0, -140, 260);
    P.box(GRASS(), s > 0 ? 4.25 : -90, s > 0 ? 90 : -4.25, -0.5, 0, -140, 260, 4);
    P.box(CONC(), s > 0 ? 5.3 : -6.8, s > 0 ? 6.8 : -5.3, 0, 0.03, -140, 230, 1.5);
  }
  for (let z = -136; z < 230; z += 9) P.box(C("#e8c25a"), -0.08, 0.08, -0.15, -0.14, z, z + 3.2);
  // lots
  for (let i = 0; i < 19; i++) { lot(P, 1, i, r); lot(P, -1, i, r); }
  // parked cars along the kerbs
  for (const [x, z, rot, k] of [[2.9, -60, 0, 0], [-2.9, -30, Math.PI, 2], [2.9, 22, 0, 3], [-2.9, 50, Math.PI, 4], [2.9, 95, 0, 6], [-2.9, 120, Math.PI, 1], [-2.9, -112, Math.PI, 7]] as const)
    car(P.at(x, z, rot), CARS[k][0], CARS[k][1]);
  // power poles + wires on the right parkway
  let prev: V3[] | null = null;
  for (let z = -135; z < 215; z += 32) { const pts = pole(P, 4.85, z, (z / 32) % 3 === 0); if (prev) for (let k = 0; k < 3; k++) wire(P, prev[k], pts[k], 0.6); prev = pts; }
  // hills + far trees + water tower
  const HILL = ["#86a356", "#7a9a52", "#8faa5c", "#71914c"];
  for (let k = 0; k < 9; k++) { const x = -160 + k * 40 + U(r, -10, 10); P.geo(new THREE.SphereGeometry(1, 28, 14).scale(U(r, 45, 70), U(r, 16, 30), U(r, 30, 45)).translate(x, -6, 250 + U(r, 0, 40)), C(HILL[k % 4])); }
  for (let k = 0; k < 6; k++) { const x = -140 + k * 55 + U(r, -10, 10); P.geo(new THREE.SphereGeometry(1, 24, 12).scale(U(r, 60, 90), U(r, 30, 45), 40).translate(x, -10, 320), C("#9ab07a")); }
  for (let k = 0; k < 12; k++) { const x = U(r, -110, 110), z = U(r, 205, 240); if (Math.abs(x) < 8) continue; oak(P, r, x, z, U(r, 1.2, 1.8)); }
  const T = P.at(-34, 236);
  for (const [a, b] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) T.rod(C("#8a9098"), [a * 1.3, 8, b * 1.3], [a * 0.8, 26, b * 0.8], 0.25, 6);
  T.geo(new THREE.CylinderGeometry(5, 5, 6, 24).translate(0, 29, 0), C("#d9dde2"));
  T.geo(new THREE.SphereGeometry(5, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1).translate(0, 32, 0), C("#c4c9d0"));
  T.box(towerTx(), -4.2, 4.2, 27.4, 30.6, 4.6, 5.02);
  // shot 13: TV van at the kerb + light reflector on the lawn
  car(P.at(-2.75, -87.5, Math.PI), "tvvan", "#f1ece0");
  reflector(P.at(-11.9, -79.4, 0));
  // shot 14: police cars at the chief's house
  car(P.at(3.6, -107.2, 0.62), "police", "#f4f1ea");
  car(P.at(9.4, -96.9, -Math.PI / 2 + 0.12), "police", "#f4f1ea");
};

// ---------------- staging helpers ----------------
const PAYEES = ["Sal M.", "Madame Zora", "Vinnie R.", "Dot K.", "Earl B.", "Gus P.", "Ruth A.", "Lou F."];
const TINT: Record<number, string> = { 9: "#ffffff", 10: "#ffd4a6", 13: "#ffffff", 14: "#f2c0a0" };
const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
/** pop 0..1 with overshoot, starting at frame f0 */
const pop = (f: number, f0: number, n = 7) => { const t = (f - f0) / n; if (t <= 0) return 0; if (t >= 1.6) return 1; return t < 1 ? smooth(t) * 1.12 : 1.12 - 0.12 * smooth((t - 1) / 0.6); };
const toCam = (S: StageAPI, at: V3, d: number): V3 => { const dx = S.cam.pos.x - at[0], dz = S.cam.pos.z - at[2], n = Math.hypot(dx, dz) || 1; return [at[0] + (dx / n) * d, at[1], at[2] + (dz / n) * d]; };
const sideOf = (S: StageAPI, a: V3, b: V3) => Math.sign((b[0] - a[0]) * S.cam.right.x + (b[2] - a[2]) * S.cam.right.z) || 1;
const offR = (S: StageAPI, p: V3, d: number, dy = 0): V3 => [p[0] + S.cam.right.x * d, p[1] + dy, p[2] + S.cam.right.z * d];
/** a giant check held at chest height in front of the person at `at` (world feet) */
const holdCheck = (S: StageAPI, id: number, at: V3, payee: number, k = 1, rot = 0, dy = 0, hands = true) => {
  if (k <= 0.02) return;
  const c = toCam(S, at, 0.22);
  S.card(`chk|${payee}|${TINT[id]}|${hands}`, 768, 360, (p) => checkCard(p, PAYEES[payee % PAYEES.length], TINT[id], hands ? "#f3e3cf" : null, payee + 1),
    [c[0], c[1] + 0.96 + dy - (1 - Math.min(1, k)) * 0.5, c[2]], 1.5 * k, 0.703 * k, false, rot);
};
const stars = (S: StageAPI, key: string, at: V3, f: number, f0: number, w = 1.3) => {
  const t = f - f0; if (t < 0 || t > 16) return;
  S.card(`stars|${key}|${Math.round(t)}`, 420, 220, (p) => fxStars(p, t / 16), at, w, w * 0.52);
};

// lots of the story
const at9 = [0, 1, 2].map((k) => { const [x, z] = lotXZ(1, zR(8 + k), -1.2, 6.3); return W([x, 0, z]); });
// shot 10 winners on lawns (both sides), hub = the chief's lawn far down the street
const HUB: V3 = W([9.6, 0.06, zR(12) + 1.2]);
const W10: V3[] = [];
{ const r = rng(77); for (let i = 5; i < 17; i++) for (const s of [1, -1] as const) { if (s > 0 && i === 12) continue; const zc = s > 0 ? zR(i) : zL(i); const [x, z] = lotXZ(s, zc, U(r, -4.5, 1.5), U(r, 4.5, 6.4)); W10.push(W([x, 0, z])); } }
const OUT10: Outfit[] = [CAST.winner, CAST.friend, CAST.cust1, CAST.cust2, { ...CAST.friend, jacket: "#4f86c6" }, { ...CAST.winner, jacket: "#7a9a4a" }, { ...CAST.cust1, jacket: "#d0703a" }, { ...CAST.cust2, jacket: "#8a5a8f" }];
// shot 13 (left lot 3) and 14 (right lot 1)
const Z13 = zL(3), Z14 = zR(1);
const P13 = { win: W([-10.7, 0, Z13 + 0.1]), rep: W([-10.1, 0, Z13 + 1.5]), cam: W([-7.4, 0, Z13 - 2.4]), boom: W([-7.9, 0, Z13 + 2.3]) };
const walk14 = (f: number, dz: number): V3 => { const t = smooth((f - 1384) / 82) * 0.55 + Math.max(0, (f - 1384) / 82) * 0.45; return W([12.3 - 4.4 * t, 0, Z14 + dz - 0.6 * t]); };

// ---------------- cameras ----------------
const truck9 = (k: number) => (f: number) => {
  const p = at9[k];
  return dolly([p[0] - 6.0, 1.45, p[2] - 4.4], [p[0] + 0.2, 1.15, p[2] + 0.5], pushK(f, 909, 0.0022), { fov: 38 });
};
const CAMS: Record<number, Key[]> = {
  9: [
    { f: 909, s: truck9(0) },
    { f: 922, dur: 10, s: truck9(1) },
    { f: 947, dur: 11, s: truck9(2) },
  ],
  10: [
    { f: 976, s: (f) => dolly([W10[0][0] - 3.4, 1.35, W10[0][2] - 6.2], [W10[0][0] + 0.2, 1.25, W10[0][2] + 0.4], pushK(f, 976, 0.002), { fov: 40 }) },
    { f: 994, dur: 66, s: (f) => ({ pos: W([-0.4, 13 + (f - 1060) * 0.02, -60 - (f - 1060) * 0.04]), look: W([0.6, 0.5, 20]), fov: 44 }) },
  ],
  13: [
    { f: 1255, s: (f) => dolly(W([-13.4, 1.5, Z13 + 6.3]), W([-6.6, 1.15, Z13 - 3.6]), pushK(f, 1255, 0.0018), { fov: 40 }) },
    { f: 1298, dur: 26, s: (f) => dolly(W([-4.6, 1.45, Z13 - 6.6]), W([-10.2, 1.2, Z13 + 0.0]), pushK(f, 1298, 0.0012), { fov: 38 }) },
    { f: 1362, dur: 14, s: (f) => dolly(W([-4.6, 1.45, Z13 - 6.6]), W([-10.6, 1.15, Z13 + 0.15]), pushK(f, 1362, 0.004, 0.022, 14) * 0.62, { fov: 38 }) },
  ],
  14: [
    { f: 1384, s: (f) => { const c = walk14(f, 0); return dolly(W([3.6, 1.35, Z14 - 9.0]), [c[0] + 0.3, 1.2, c[2] + 0.3], pushK(f, 1384, 0.003), { fov: 40, roll: f > 1441 ? 0.06 : 0 }); } },
  ],
};
const DOF: Dof[] = [
  { f: 909, cInf: 10, focus: (f) => head(at9[f < 930 ? 0 : f < 955 ? 1 : 2], 1.2) },
  { f: 976, cInf: 10, focus: () => head(W10[0], 1.2) },
  { f: 994, dur: 30, cInf: 0 },
  { f: 1255, cInf: 9, focus: () => head(P13.cam, 1.2) },
  { f: 1298, dur: 20, cInf: 11, focus: () => head(P13.win, 1.2) },
  { f: 1384, cInf: 9, focus: (f) => head(walk14(f, 0), 1.2) },
];
const KICKS: [number, number][] = [[913, 1.2], [931, 1.2], [957, 1.6], [1441, 4.5]];
const LIGHT: SetDef["LIGHT"] = { 10: { light: "golden", sunAz: 165, sunEl: 16 }, 14: { light: "golden", sunAz: 160, sunEl: 12 } };

// ---------------- staging ----------------
const stage = (id: number, f: number, S: StageAPI) => {
  if (id === 9) {
    const who: [Outfit, string, number, number][] = [[CAST.butcher, "butcher", SEED.butcher, 913], [CAST.psychic, "psychic", SEED.psychic, 931], [CAST.mobster, "mobster", SEED.mobster, 957]];
    who.forEach(([o, key, seed, f0], k) => {
      const at = at9[k], on = f >= f0 - 1;
      const expr = !on ? "neutral" : k === 0 ? (f < f0 + 12 ? "laugh" : "grin") : k === 1 ? (f < f0 + 10 ? "smile_closed" : "whistle") : "smile_closed";
      S.P(o, key, seed, at, { expr, facing: 0, mode: "stand", tilt: on ? (k === 2 ? -3 : 4 * Math.sin((f - f0) * 0.3) * Math.exp(-(f - f0) / 20)) : 0 });
      holdCheck(S, id, at, k, pop(f, f0 - 2), (k - 1) * 0.06 + (on ? 0.04 * Math.sin((f - f0) * 0.5) * Math.exp(-(f - f0) / 12) : 0));
      stars(S, key, [at[0], 2.25, at[2]], f, f0, 1.4);
      if (k === 1 && on) S.card(`stars|psy|${f % 24}`, 420, 220, (p) => fxStars(p, (f % 24) / 24), toCam(S, [at[0], 2.0, at[2]], 0.3), 0.9, 0.47);
    });
  } else if (id === 10) {
    W10.forEach((at, i) => {
      const o = OUT10[i % OUT10.length];
      const near = i === 0;
      S.P(o, "w10_" + (i % OUT10.length), 40 + i, at, { expr: (i + Math.floor(f / 20)) % 3 ? "grin" : "laugh", facing: 0, wave: near ? undefined : undefined });
      const lit = f >= 1078 + 0.35 * Math.hypot(at[0] - HUB[0], at[2] - HUB[2]) * 0.4;
      holdCheck(S, id, at, i, 1, ((i % 3) - 1) * 0.05 + (lit ? 0.05 * Math.sin(f * 0.6 + i) : 0), lit ? 0.12 : 0);
      if (f >= 1076) { // the network: gold threads on the ground from the chief's lawn to every winner
        const g = smooth((f - 1076 - (i % 5)) / 12);
        if (g > 0) {
          const dx = at[0] - HUB[0], dz = at[2] - HUB[2], L = Math.hypot(dx, dz);
          S.st.fx.push({ key: "thread", cw: 512, ch: 32, draw: thread, x: HUB[0] + (dx * g) / 2, y: 0.09, z: HUB[2] + (dz * g) / 2, w: L * g, h: 1.1, flat: true, rot: Math.atan2(-dz, dx), soft: true });
        }
        if (g >= 1) stars(S, "w" + i, [at[0], 2.4, at[2]], f, 1076 + (i % 5) + 12, 1.6);
      }
    });
    S.P(CAST.chief, "chief10", SEED.chief, [HUB[0], 0, HUB[2]], { expr: f >= 1078 ? "smile_closed" : "neutral", facing: 0 });
    if (f >= 1076) S.card("hubglow", 256, 256, (p) => glow(p, "#ffcf5a", "#fff6d8"), [HUB[0], 1.0, HUB[2]], 6 * smooth((f - 1076) / 8), 6 * smooth((f - 1076) / 8), true);
  } else if (id === 13) {
    const w = P13.win, rp = P13.rep, cm = P13.cam, bm = P13.boom;
    const beam = f >= 1302;
    S.P(CAST.winner, "winner13", SEED.winner, w, { expr: f >= 1328 ? "laugh" : beam ? "grin" : "smile", facing: 0, tilt: f >= 1364 ? 3 * Math.sin((f - 1364) * 0.4) : 0 });
    holdCheck(S, id, w, 3, 1, -0.04 + (f >= 1364 ? 0.05 * Math.sin((f - 1364) * 0.45) * Math.exp(-(f - 1364) / 14) : 0), 0.02);
    if (f >= 1364) stars(S, "w13", [w[0], 2.15, w[2]], f, 1364, 1.3);
    // reporter (agent) with a mic and the wink: an earpiece coil
    const sR = sideOf(S, rp, w);
    S.P(CAST.agent, "rep13", SEED.agent, rp, { expr: "smile", facing: sR as 1 | -1, prop: ["point", 0.35] }, sR < 0);
    S.card("mic", 128, 256, micCard, offR(S, toCam(S, rp, 0.15), 0.36 * sR, 1.15), 0.18, 0.36, false, -0.5 * sR);
    S.card("ear", 80, 140, earCard, offR(S, toCam(S, rp, 0.1), -0.27 * sR, 1.22), 0.08, 0.14);
    // camera operator (crew) with a shoulder camera and an FBI badge peeking out of the pocket
    const sC = sideOf(S, cm, w);
    S.P(CAST.crew, "crew13", SEED.crew, cm, { expr: "stern", facing: sC as 1 | -1, prop: ["camera", 1] as any }, sC < 0);
    S.card("badge", 128, 128, badgeCard, offR(S, toCam(S, cm, 0.18), -0.08 * sC, 0.82), 0.15, 0.15);
    // boom operator (agent2)
    const sB = sideOf(S, bm, w);
    S.P(CAST.agent2, "boom13", SEED.agent2, bm, { expr: "neutral", facing: sB as 1 | -1, prop: ["boom", 1] as any }, sB < 0);
  } else if (id === 14) {
    const crash = 1441;
    const c = walk14(f, 0), a1 = walk14(f, -0.75), a2 = walk14(f, 0.8);
    const ph = ((f - 1384) * 0.035) % 1;
    S.P(CAST.agent, "ag14", SEED.agent, a1, { expr: "stern", mode: "stroll", phase: ph, facing: 0 });
    S.P(CAST.chief, "chief14", SEED.chief, c, { expr: f >= crash ? "shock" : "nervous", mode: "stroll", phase: (ph + 0.5) % 1, facing: 0, tilt: f >= crash ? -4 : 0 });
    S.P(CAST.agent2, "ag214", SEED.agent2, a2, { expr: "stern", mode: "stroll", phase: (ph + 0.25) % 1, facing: 0 });
    // flashing red / blue light bars
    const flash = Math.floor(f / 4) % 2;
    for (const [x, z, rot] of [[3.6, -107.2, 0.62], [9.4, -96.9, -Math.PI / 2 + 0.12]] as const) {
      for (const s of [-1, 1]) {
        const a = s * 0.36, b = -0.25, lx = x + a * Math.cos(rot) + b * Math.sin(rot), lz = z - a * Math.sin(rot) + b * Math.cos(rot);
        const on = (s > 0) === (flash === 0);
        if (on) S.card(`flash|${s}`, 256, 256, (p) => glow(p, s > 0 ? "#3f6fff" : "#ff3a3a"), W([lx, 1.64, lz]), 1.9, 1.9, true);
      }
      S.st.fx.push({ key: `gflash|${flash}`, cw: 256, ch: 256, draw: (p) => glow(p, flash ? "#ff3a3a" : "#3f6fff", flash ? "#ff8a8a" : "#9ab4ff"), x: W([x, 0, z])[0], y: 0.06, z: W([x, 0, z])[2], w: 7, h: 7, flat: true, soft: true });
    }
    // giant checks leaning on the porch rail + one on an easel: they topple on "crashing"
    const fall = (k: number, d: number) => { const t = Math.max(0, f - crash - d) / 9; return Math.min(1, t * t); };
    const leaned: [V3, number, number][] = [[W([12.95, 0.5, Z14 - 2.6]), 0.12, 0], [W([12.95, 0.5, Z14 + 2.5]), -0.1, 2], [W([10.3, 0, Z14 - 4.6]), 0.05, 1]];
    leaned.forEach(([p, r0, d], k) => {
      const t = fall(k, d), dir = k === 1 ? 1 : -1;
      holdCheck(S, id, p, 4 + k, 1, r0 + dir * t * 1.45, (k === 2 ? 0.25 : 0.12) - t * (k === 2 ? 0.75 : 0.4), false);
    });
    // the chief's own check slips from his hands and flutters down
    const t = Math.max(0, f - crash + 1);
    holdCheck(S, id, c, 7, 1, -0.2 * Math.min(1, t / 4) - t * 0.05, -Math.min(0.78, 0.0035 * t * t), t === 0);
  }
};
export const SUBURB: SetDef = { name: "suburb", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
