// SET "street" — reuses the suburb geometry from the McDonald's short (same ORIGIN) with new shots:
// 14 (David at his mailbox, the miles arrive) and 15 (golden sky, an airliner climbs overhead).
import * as THREE from "three";
import { Put, C } from "../kit";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, glide } from "../cam";
import type { StageAPI, Outfit, FrontOpts } from "../stagekit";
import { fxStars, INK } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
import { SUBURB } from "./suburb";
import { mailbox } from "./suburb_props";
import type { Pen } from "../toon";
const ORIGIN = SUBURB.ORIGIN;
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];
const zR = (i: number) => -120 + 15 * i;
const MB: V3 = [5.0, 0, zR(4) - 6.4]; // David's mailbox at the kerb, between two lots
const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  SUBURB.build(P, PI, root, r);
  mailbox(P.at(MB[0], MB[2], Math.PI / 2), "#2f6a8a", () => 0.9);
};
const CAMS: Record<number, Key[]> = {
  14: [{ f: 1295, s: (f) => dolly(W([MB[0] - 2.6, 1.4, MB[2] + 4.2]), W([MB[0] - 0.4, 1.3, MB[2] + 1.6]), pushK(f, 1295, 0.002), { fov: 40 }) },
    { f: 1346, dur: 10, s: (f) => dolly(W([MB[0] - 2.6, 1.4, MB[2] + 4.2]), W([MB[0] - 0.5, 1.5, MB[2] + 2.0]), 0.62 * pushK(f, 1346, 0.003), { fov: 40, roll: 0.05 }) }],
  15: [{ f: 1430, s: (f) => { const u = glide((f - 1430) / 62); return { pos: W([0.5, 0.6, MB[2] - 2.0]), look: W([2.0 - 2.0 * u, 7.0 + 2.0 * u, MB[2] + 20]), fov: 50, roll: -0.08 + 0.06 * u }; } }],
};
const DOF: Dof[] = [
  { f: 1295, cInf: 10, focus: () => W([MB[0] - 0.7, 1.4, MB[2] + 2.3]) },
  { f: 1430, cInf: 0 },
];
const KICKS: [number, number][] = [[1346, 1.4], [1440, 0.8]];
const LIGHT: SetDef["LIGHT"] = { 14: { light: "golden", sunAz: 150, sunEl: 18 }, 15: { light: "golden", sunAz: 170, sunEl: 10 } };
const pop = (f: number, f0: number, d = 6) => { const u = Math.max(0, Math.min(1, (f - f0) / d)); return u <= 0 ? 0 : 1 + 0.25 * Math.sin(u * Math.PI); };
/** airliner seen from below-side, climbing (ink style) */
const jet = (p: Pen) => {
  const g = p.g; g.strokeStyle = INK; g.lineJoin = "round"; g.lineWidth = 10;
  g.fillStyle = "#c8ccd4"; g.beginPath(); g.moveTo(300, 250); g.lineTo(120, 420); g.lineTo(190, 430); g.lineTo(380, 270); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#f4f6f8"; g.beginPath(); g.ellipse(310, 240, 270, 52, -0.25, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#c8ccd4"; g.beginPath(); g.moveTo(320, 220); g.lineTo(470, 70); g.lineTo(520, 80); g.lineTo(400, 230); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#c8323c"; g.beginPath(); g.moveTo(80, 300); g.lineTo(40, 170); g.lineTo(95, 170); g.lineTo(140, 280); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#2f6a8a"; for (let i = 0; i < 12; i++) { g.save(); g.translate(170 + i * 26, 250 - i * 6.8); g.rotate(-0.25); g.fillRect(-6, -8, 12, 12); g.restore(); }
  g.fillStyle = "#8a8e98"; for (const [x, y] of [[250, 330], [400, 180]]) { g.beginPath(); g.ellipse(x, y, 34, 20, -0.25, 0, 7); g.fill(); g.stroke(); }
};
const stage = (id: number, f: number, S: StageAPI) => {
  const P = (o: Outfit, key: string, seed: number, at: V3, opts: FrontOpts, mirror = false, y?: number) => S.P(o, key, seed, W(at), opts, mirror, y);
  if (id === 14) {
    const open = f >= 1321, big = f >= 1346;
    P(CAST.david, "david", SEED.david, [MB[0] - 0.7, 0, MB[2] + 2.3], { expr: big ? "shock" : open ? "smile" : "neutral", facing: 0, prop: ["envelope", 0] as FrontOpts["prop"], tilt: big ? -5 : 0 });
    if (big) S.card("stars" + (f % 16), 420, 220, (p) => fxStars(p, (f % 16) / 16), W([MB[0] - 0.7, 2.3, MB[2] + 2.3]), 1.0 * pop(f, 1346), 0.52);
    P(CAST.wife, "wife", SEED.wife, [MB[0] + 1.2, 0, MB[2] + 0.4], { expr: big ? "laugh" : "smile", facing: -1, look: -0.5 });
  } else if (id === 15) {
    const u = (f - 1430) / 62;
    S.card("jet", 600, 480, jet, W([6 - 9 * u, 9 + 6 * u, MB[2] + 30 + 6 * u]), 14, 11.2);
  }
};
export const STREET: SetDef = { name: "street", ORIGIN, build, CAMS, DOF, KICKS, LIGHT, stage };
