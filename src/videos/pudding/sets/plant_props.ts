// PLANT set props: printing press, cage, forklift, pallets, van, car, palisade fence, crane, CRT desk, lamps.
// All in Put-local metres (y up). Owned by the PLANT agent.
import * as THREE from "three";
import { Put, C, WD, SHT, TIN, quad, V, lam, U, pick } from "../kit";
import { sheetTex, crtTex, hazardTex, plate } from "./plant_tex";

export const STEEL = "#8a7e70", DKSTEEL = "#3a3330", YEL = "#e8b52e", MACH = "#4f8a6a", MACH2 = "#3a6050";
export const HAZ = () => lam("hazardM", () => ({ map: hazardTex() }));
export const cylZ = (r: number, len: number, x: number, y: number, z: number, seg = 18) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2).translate(x, y, z);
export const cylX = (r: number, len: number, x: number, y: number, z: number, seg = 18) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2).translate(x, y, z);
export const cylY = (r: number, h: number, x: number, y0: number, z: number, seg = 18) => new THREE.CylinderGeometry(r, r, h, seg).translate(x, y0 + h / 2, z);
/** emissive (unlit) mesh: lamps, bulbs, screens */
export const glow = (root: THREE.Object3D, P: Put, geo: THREE.BufferGeometry, col: THREE.Color | THREE.Texture) => {
  const m = new THREE.Mesh(geo, col instanceof THREE.Texture ? new THREE.MeshBasicMaterial({ map: col }) : new THREE.MeshBasicMaterial({ color: col }));
  m.applyMatrix4(P.M); root.add(m); return m;
};

/** one print unit (tower) centred at x, spanning z0..z1 (machine depth), ink colour */
export const pressTower = (P: Put, x: number, z0: number, z1: number, ink: string, label?: string) => {
  const m = C(MACH), dk = C(MACH2), chrome = C("#c9ccd2"), inkM = C(ink), L = z1 - z0 - 0.4, zc = (z0 + z1) / 2;
  for (const z of [z0, z1 - 0.2]) {
    P.box(m, x - 1.0, x + 1.0, 0.3, 2.7, z, z + 0.2);
    P.box(dk, x - 1.05, x + 1.05, 0, 0.3, z - 0.05, z + 0.25);
    P.geo(cylZ(0.42, 0.06, x - 0.35, 1.7, z1 + 0.02, 22), dk); P.geo(cylZ(0.3, 0.06, x + 0.45, 1.05, z1 + 0.02, 20), dk); // gears on the front plate
    P.geo(cylZ(0.12, 0.1, x - 0.35, 1.7, z1 + 0.05, 12), chrome); P.geo(cylZ(0.1, 0.1, x + 0.45, 1.05, z1 + 0.05, 12), chrome);
  }
  P.geo(cylZ(0.3, L, x - 0.3, 1.55, zc), chrome); P.geo(cylZ(0.3, L, x + 0.3, 1.0, zc), chrome);
  P.geo(cylZ(0.17, L, x - 0.55, 2.1, zc), inkM); P.geo(cylZ(0.15, L, x + 0.05, 2.25, zc), inkM); P.geo(cylZ(0.14, L, x + 0.55, 1.95, zc), C("#8a8f96"));
  P.box(dk, x - 0.8, x + 0.8, 2.7, 3.0, z0, z1); P.box(inkM, x - 0.6, x + 0.6, 3.0, 3.25, z0 + 0.3, z1 - 0.3); // ink fountain
  if (label) P.box(plate("tw" + label, [label], "#efe6cc", "#2a2a30", 512, 160, [96]), x - 0.55, x + 0.55, 2.72, 2.98, z1, z1 + 0.03);
};
/** web-fed sticker press along x (x0..x1) at depth z0..z1 */
export const press = (P: Put, root: THREE.Object3D, x0: number, x1: number, z0: number, z1: number) => {
  const inks = ["#d8433a", "#2f6fd6", "#3f9a4a", "#e8a33a"];
  const n = 4, step = (x1 - x0) / n;
  P.box(C(DKSTEEL), x0 - 0.3, x1 + 0.3, 0, 0.35, z0 - 0.1, z1 + 0.1);
  for (let i = 0; i < n; i++) pressTower(P, x0 + step * (i + 0.5), z0, z1, inks[i], i === 1 ? "PRESS No.2" : `UNIT ${i + 1}`);
  // paper web through every tower + feeder roll + delivery conveyor with sheets
  const web = lam("web", () => ({ map: sheetTex() }));
  P.box(web, x0 - 2.2, x1 + 0.2, 1.24, 1.27, z0 + 0.35, z1 - 0.35, 1.2);
  P.geo(cylZ(0.8, z1 - z0 - 0.6, x0 - 2.6, 1.15, (z0 + z1) / 2, 28), C("#f1ead8")); P.geo(cylZ(0.18, z1 - z0 - 0.2, x0 - 2.6, 1.15, (z0 + z1) / 2), C("#8a6a4a"));
  for (const z of [z0 + 0.05, z1 - 0.25]) { P.box(C(MACH2), x0 - 2.8, x0 - 2.4, 0, 1.2, z, z + 0.2); }
  P.box(C(DKSTEEL), x1 + 0.3, x1 + 3.6, 0.85, 1.0, z0 + 0.2, z1 - 0.2);
  for (let x = x1 + 0.5; x < x1 + 3.6; x += 0.35) P.geo(cylZ(0.06, z1 - z0 - 0.4, x, 1.01, (z0 + z1) / 2, 8), C("#9aa2ac"));
  for (const x of [x1 + 0.5, x1 + 3.4]) for (const z of [z0 + 0.25, z1 - 0.35]) P.box(C(DKSTEEL), x - 0.05, x + 0.05, 0, 0.85, z, z + 0.1);
  P.box(C("#8a5530"), x1 + 3.8, x1 + 5.0, 0, 0.14, z0 + 0.2, z1 - 0.2); P.box(web, x1 + 3.85, x1 + 4.95, 0.14, 0.62, z0 + 0.3, z1 - 0.3, 1.0);
  // walkway + yellow safety rail in front, control desk with buttons
  const rail = C(YEL);
  P.box(HAZ(), x0 - 2.5, x1 + 3.6, 0.0, 0.02, z1 + 0.15, z1 + 0.45, 1.0);
  for (let x = x0 - 2.0; x <= x1 + 3.0; x += 2.0) P.box(rail, x - 0.04, x + 0.04, 0, 1.05, z1 + 0.9, z1 + 0.98);
  P.box(rail, x0 - 2.0, x1 + 3.0, 1.0, 1.08, z1 + 0.9, z1 + 0.98); P.box(rail, x0 - 2.0, x1 + 3.0, 0.5, 0.56, z1 + 0.91, z1 + 0.97);
  const cx = x0 + step * 1.0;
  P.box(C("#c9c2b0"), cx - 0.6, cx + 0.6, 0, 1.0, z1 + 0.25, z1 + 0.8); P.slab(C("#5a6470"), cx - 0.6, cx + 0.6, z1 + 0.25, 1.25, z1 + 0.8, 1.0, 0.04);
  for (let i = 0; i < 6; i++) glow(root, P, new THREE.SphereGeometry(0.035, 8, 6).translate(cx - 0.4 + i * 0.16, 1.16 - 0.0, z1 + 0.47 + (i % 2) * 0.1), new THREE.Color(...(i % 3 === 0 ? [2.2, 0.3, 0.2] : i % 3 === 1 ? [0.3, 2.0, 0.4] : [2.0, 1.6, 0.3]) as [number, number, number]));
};
/** welded-bar security cage x0..x1, z0..z1, front (z1) with a door gap at doorX */
export const cage = (P: Put, x0: number, x1: number, z0: number, z1: number, h: number, doorX: number) => {
  const m = C(STEEL), post = C(DKSTEEL);
  const bars = (ax: number, az: number, bx: number, bz: number, skip?: [number, number]) => {
    const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 0.16);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      if (skip && x > skip[0] && x < skip[1]) continue;
      P.box(m, x - 0.015, x + 0.015, 0, h, z - 0.015, z + 0.015);
    }
    for (const y of [0.1, 1.1, h - 0.05]) { if (skip && y < 2.2) { P.box(m, ax, skip[0], y - 0.03, y + 0.03, az - 0.03, az + 0.03); P.box(m, skip[1], bx, y - 0.03, y + 0.03, az - 0.03, az + 0.03); } else P.box(m, Math.min(ax, bx) - 0.03, Math.max(ax, bx) + 0.03, y - 0.03, y + 0.03, Math.min(az, bz) - 0.03, Math.max(az, bz) + 0.03); }
  };
  bars(x0, z1, x1, z1, [doorX - 0.55, doorX + 0.55]); bars(x0, z0, x0, z1); bars(x1, z0, x1, z1);
  for (const [x, z] of [[x0, z1], [x1, z1], [x0, z0], [x1, z0], [doorX - 0.6, z1], [doorX + 0.6, z1]]) P.box(post, x - 0.06, x + 0.06, 0, h + 0.05, z - 0.06, z + 0.06);
  P.box(post, doorX - 0.6, doorX + 0.6, 2.2, 2.3, z1 - 0.05, z1 + 0.05);
  // the door itself: open, swung out to +x
  const dz = z1 + 0.02; for (let i = 0; i <= 6; i++) P.box(m, doorX + 0.55 + 0.02, doorX + 0.55 + 0.05, 0.05, 2.15, dz + i * 0.17, dz + i * 0.17 + 0.03);
  P.box(m, doorX + 0.55, doorX + 0.6, 0.05, 0.11, dz, dz + 1.05); P.box(m, doorX + 0.55, doorX + 0.6, 2.1, 2.16, dz, dz + 1.05);
  P.box(C("#c8323c"), doorX + 0.5, doorX + 0.65, 1.0, 1.25, dz + 0.9, dz + 1.02); // padlock hasp
};
/** pallet with stacked, strapped paper reams */
export const paperPallet = (P: Put, r: () => number, x: number, z: number, h: number) => {
  P.box(WD("#b88a52"), x - 0.6, x + 0.6, 0, 0.14, z - 0.5, z + 0.5, 0.6);
  const layers = Math.round(h / 0.3);
  for (let k = 0; k < layers; k++) {
    const y = 0.14 + k * 0.3, c = pick(r, ["#f1ead8", "#ece2c8", "#f4efe2"]);
    P.box(C(c), x - 0.56 + U(r, -0.02, 0.02), x + 0.56, y, y + 0.29, z - 0.46, z + 0.46 + U(r, -0.02, 0.02));
  }
  const top = 0.14 + layers * 0.3;
  for (const s of [-0.3, 0.3]) { P.box(C("#c8323c"), x + s - 0.03, x + s + 0.03, 0.14, top + 0.01, z + 0.46, z + 0.475); P.box(C("#c8323c"), x + s - 0.03, x + s + 0.03, top, top + 0.012, z - 0.47, z + 0.47); }
};
export const paperRoll = (P: Put, x: number, z: number, r = 0.5, h = 1.2, y0 = 0) => {
  P.geo(cylY(r, h, x, y0, z, 22), C("#efe6d2")); P.geo(cylY(0.13, 0.02, x, y0 + h, z, 12), C("#5a4030"));
};
export const forklift = (P: Put, r: () => number) => {
  const body = C("#e8952a"), dk = C("#26262c"), cw = C("#3a3a42");
  P.box(body, -0.7, 0.8, 0.3, 1.1, -0.55, 0.55); P.box(cw, -1.05, -0.65, 0.3, 1.25, -0.55, 0.55);
  P.box(dk, -0.3, 0.2, 1.1, 1.35, -0.3, 0.3); P.box(dk, -0.45, -0.35, 1.1, 1.75, -0.3, 0.3); // seat
  for (const [x, z] of [[-0.6, -0.5], [-0.6, 0.5], [0.7, -0.5], [0.7, 0.5]]) P.rod(dk, [x, 1.1, z], [x * 0.9, 2.2, z * 0.9], 0.035);
  P.box(dk, -0.65, 0.75, 2.15, 2.22, -0.5, 0.5);
  for (const [x, rr] of [[-0.55, 0.3], [0.55, 0.34]] as const) for (const z of [-0.6, 0.6]) P.geo(cylZ(rr, 0.24, x, rr, z, 16), dk);
  P.geo(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 14).rotateX(1.1).translate(0.45, 1.5, 0), dk); P.rod(dk, [0.35, 1.1, 0], [0.45, 1.48, 0], 0.03);
  for (const z of [-0.35, 0.35]) P.box(C(STEEL), 0.95, 1.05, 0.05, 2.6, z - 0.05, z + 0.05);
  P.box(C(STEEL), 0.95, 1.08, 0.3, 1.0, -0.42, 0.42);
  for (const z of [-0.28, 0.28]) P.box(C("#3a3a42"), 1.05, 2.1, 0.08, 0.14, z - 0.06, z + 0.06);
  paperPallet(P, r, 1.6, 0, 0.6);
  P.box(C(YEL), 0.6, 0.85, 1.1, 1.12, -0.56, 0.56);
};
/** steel palisade fence along x at z (x0..x1), height h, optional gap */
export const palisade = (P: Put, x0: number, x1: number, z: number, h: number, gap?: [number, number]) => {
  const m = C("#4a5a52"), post = C("#2f3a36");
  const inGap = (x: number) => gap && x > gap[0] && x < gap[1];
  for (let x = x0; x <= x1; x += 2.6) if (!inGap(x)) P.box(post, x - 0.06, x + 0.06, 0, h + 0.1, z - 0.06, z + 0.06);
  const segs: [number, number][] = gap ? [[x0, gap[0]], [gap[1], x1]] : [[x0, x1]];
  for (const [a, b] of segs) {
    for (const y of [0.35, h - 0.35]) P.box(m, a, b, y - 0.04, y + 0.04, z - 0.1, z - 0.04);
    for (let x = a + 0.05; x < b; x += 0.2) { P.box(m, x - 0.035, x + 0.035, 0.05, h, z - 0.03, z); P.box(m, x - 0.012, x + 0.012, h, h + 0.12, z - 0.025, z - 0.005); }
  }
};
export const car = (P: Put, col: string) => {
  const b = C(col), gl = C("#2a3550"), dk = C("#1d1b22"), ch = C("#c9ccd2");
  P.box(b, -2.2, 2.2, 0.35, 0.95, -0.85, 0.85); P.box(b, -1.1, 0.9, 0.95, 1.45, -0.78, 0.78);
  P.box(gl, -1.0, 0.8, 1.0, 1.4, -0.8, 0.8); P.box(b, -0.18, -0.08, 0.95, 1.45, -0.81, 0.81);
  for (const x of [-1.4, 1.4]) for (const z of [-0.82, 0.82]) P.geo(cylZ(0.33, 0.2, x, 0.33, z, 16), dk);
  P.box(ch, 2.15, 2.28, 0.35, 0.5, -0.86, 0.86); P.box(ch, -2.28, -2.15, 0.35, 0.5, -0.86, 0.86);
  for (const z of [-0.6, 0.6]) P.box(C("#fff4c8"), 2.18, 2.22, 0.62, 0.78, z - 0.18, z + 0.18);
};
/** white delivery van along +x (cab at +x), rear doors at x = -2.7; right rear door swung open */
export const van = (P: Put, r: () => number) => {
  const w = C("#e2ded6"), gl = C("#2a3550"), dk = C("#1d1b22"), ch = C("#c9ccd2"), str = C("#2f5f9a");
  P.box(w, -2.7, 2.2, 0.45, 2.45, -1.0, 1.0);
  P.box(w, 2.2, 3.5, 0.45, 1.45, -1.0, 1.0); P.slab(w, -1.0, 1.0, 2.2, 2.45, 3.25, 1.45, 0.08);
  P.geo(quad(V(2.21, 1.55, -0.98), V(2.21, 1.55, 0.98), V(3.2, 1.5, 0.98), V(3.2, 1.5, -0.98)), gl);
  P.box(gl, 2.3, 3.05, 1.5, 2.1, 0.99, 1.01); P.box(gl, 2.3, 3.05, 1.5, 2.1, -1.01, -0.99); // side cab windows
  P.box(gl, 2.27, 2.33, 1.55, 2.3, -0.92, 0.92);
  P.box(str, -2.7, 2.2, 1.0, 1.18, -1.01, 1.01); P.box(str, 2.2, 3.5, 1.0, 1.1, -1.01, 1.01);
  P.box(plate("vanlogo", ["RAPID PARCEL"], "#eef0ee", "#2f5f9a", 1024, 200, [120]), -1.9, 0.9, 1.45, 1.95, 1.0, 1.02);
  P.box(plate("vanlogo", ["RAPID PARCEL"], "#eef0ee", "#2f5f9a", 1024, 200, [120]), -1.9, 0.9, 1.45, 1.95, -1.02, -1.0);
  for (const x of [-1.8, 2.7]) for (const z of [-0.95, 0.95]) { P.geo(cylZ(0.4, 0.26, x, 0.4, z, 18), dk); P.geo(cylZ(0.18, 0.28, x, 0.4, z, 12), ch); }
  P.box(ch, 3.45, 3.6, 0.45, 0.7, -1.02, 1.02); P.box(ch, -2.85, -2.7, 0.45, 0.62, -1.02, 1.02);
  for (const z of [-0.75, 0.75]) P.box(C("#fff4c8"), 3.48, 3.52, 0.95, 1.2, z - 0.15, z + 0.15);
  for (const z of [-0.85, 0.85]) P.box(C("#d8433a"), -2.74, -2.7, 1.2, 1.6, z - 0.1, z + 0.1);
  // rear: left door closed, right door swung out ~110 deg; dark cargo bay with cartons
  P.box(C("#2a2830"), -2.68, -2.6, 0.5, 2.38, -0.95, 0.95);
  P.box(w, -2.75, -2.68, 0.48, 2.42, -1.0, 0.0); P.box(gl, -2.77, -2.74, 1.6, 2.2, -0.85, -0.15);
  P.box(w, -3.7, -2.72, 0.48, 2.42, 1.0, 1.06); P.box(gl, -3.55, -2.85, 1.6, 2.2, 1.06, 1.08);
  for (let i = 0; i < 5; i++) P.box(WD("#c08a50"), -2.6 + U(r, 0, 0.05), -2.0, 0.5 + (i % 3) * 0.42, 0.9 + (i % 3) * 0.42, -0.85 + Math.floor(i / 3) * 0.9, -0.1 + Math.floor(i / 3) * 0.9);
};
export const securityDesk = (P: Put, root: THREE.Object3D) => {
  const d = WD("#7a5a3c");
  P.box(d, -1.6, 1.6, 0, 1.0, -0.4, 0.4, 1.0); P.box(C("#4a3626"), -1.7, 1.7, 1.0, 1.06, -0.5, 0.5);
  for (let i = 0; i < 4; i++) {
    const x = -1.2 + i * 0.8, y = i % 2 ? 1.06 : 1.06;
    P.box(C("#c8c0a8"), x - 0.3, x + 0.3, y, y + 0.5, -0.3, 0.2); P.box(C("#b0a890"), x - 0.22, x + 0.22, y + 0.08, y + 0.42, -0.45, -0.3);
    glow(root, P, new THREE.PlaneGeometry(0.46, 0.36).translate(x, y + 0.26, 0.205), crtTex(i));
  }
  for (let i = 0; i < 2; i++) { const x = -0.8 + i * 1.6, y = 1.56; P.box(C("#c8c0a8"), x - 0.3, x + 0.3, y, y + 0.5, -0.3, 0.2); glow(root, P, new THREE.PlaneGeometry(0.46, 0.36).translate(x, y + 0.26, 0.205), crtTex(i + 4)); }
  P.box(C("#26262c"), 1.0, 1.4, 1.06, 1.14, 0.1, 0.35); // phone
};
/** industrial pendant lamp: shade + glowing disc */
export const highBay = (P: Put, root: THREE.Object3D, x: number, y: number, z: number, top: number) => {
  P.rod(C(DKSTEEL), [x, y + 0.35, z], [x, top, z], 0.02);
  P.geo(new THREE.CylinderGeometry(0.12, 0.55, 0.4, 16, 1, true).translate(x, y + 0.2, z), C("#3a4a44"));
  glow(root, P, new THREE.CircleGeometry(0.5, 16).rotateX(Math.PI / 2).translate(x, y + 0.02, z), new THREE.Color(2.6, 2.3, 1.7));
};
export const roller = (P: Put, x0: number, x1: number, h: number, col: string) => P.box(SHT(col), x0, x1, 0, h, 0, 0.06, 1);
export const tinRoof = (P: Put, x0: number, x1: number, zA: number, yA: number, zB: number, yB: number) => P.slab(TIN("#8fa3b4"), x0, x1, zA, yA, zB, yB, 0.06, 1.5);
