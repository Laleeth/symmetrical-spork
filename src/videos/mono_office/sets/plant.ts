// SET "plant" — placeholder skeleton (replace everything). Shots: 2,3,4,5,6. Local coordinates: metres, y up, built at ORIGIN.
import * as THREE from "three";
import { Put, C, KERB } from "../kit";
import { V3 } from "../core";
import { Key, Dof, dolly, pushK, head } from "../cam";
import type { StageAPI } from "../stagekit";
import type { SetDef } from "../story";
import { CAST, SEED } from "../castMono";
export const ORIGIN: V3 = [400, 0, 0];
/** local -> world */
const W = (p: V3): V3 => [p[0] + ORIGIN[0], p[1] + ORIGIN[1], p[2] + ORIGIN[2]];
const build = (P: Put, PI: Put, root: THREE.Object3D, r: () => number) => {
  P.box(C("#b98a5a"), -8, 8, -0.05, 0, -8, 8);
  P.box(C("#d9b98a"), -8, 8, 0, 4, -4.2, -4);
};
const CAMS: Record<number, Key[]> = {
  2: [{ f: 0, s: (f) => dolly(W([0.2, 1.55, 5.5]), W([0, 1.25, 0]), pushK(f, 0, 0.002), { fov: 44 }) }],
  3: [{ f: 0, s: (f) => dolly(W([0.2, 1.55, 5.5]), W([0, 1.25, 0]), pushK(f, 0, 0.002), { fov: 44 }) }],
  4: [{ f: 0, s: (f) => dolly(W([0.2, 1.55, 5.5]), W([0, 1.25, 0]), pushK(f, 0, 0.002), { fov: 44 }) }],
  5: [{ f: 0, s: (f) => dolly(W([0.2, 1.55, 5.5]), W([0, 1.25, 0]), pushK(f, 0, 0.002), { fov: 44 }) }],
  6: [{ f: 0, s: (f) => dolly(W([0.2, 1.55, 5.5]), W([0, 1.25, 0]), pushK(f, 0, 0.002), { fov: 44 }) }],
};
const DOF: Dof[] = [];
const stage = (id: number, f: number, S: StageAPI) => {
  S.P(CAST.chief, "chief", SEED.chief, W([0, 0, 0]), { expr: "neutral", facing: 0 });
};
export const PLANT: SetDef = { name: "plant", ORIGIN, build, CAMS, DOF, stage };
