// THE MAN WHO STOLE $24 MILLION: 18 shots timed to the narration (frames at 30 fps, total 1782 = 59.4 s).
// Shot boundaries, WORDS and TOTAL are LOCKED to the voice. Each set file owns the cameras, DOF, kicks, light
// overrides and staging of its own shots; this file only merges them.
import { V3, FPS } from "./core";
import { run, Cam, Key, Dof } from "./cam";
import type { Put } from "./kit";
import type { StageAPI } from "./stagekit";
import * as THREE from "three";
import { DINER } from "./sets/diner";
import { PLANT } from "./sets/plant";
import { SUBURB } from "./sets/suburb";
import { OFFICE } from "./sets/office";
export { FPS };
export type { V3 };
export const TOTAL = 1782;
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; set: string; sunAz?: number; sunEl?: number };
export type SetDef = {
  name: string; ORIGIN: V3;
  /** W = outdoor batch (casts/receives sun shadows), WI = interior batch (no received shadows); both already moved to ORIGIN */
  build: (W: Put, WI: Put, root: THREE.Object3D, r: () => number) => void;
  CAMS: Record<number, Key[]>;   // world coordinates (ORIGIN + local)
  DOF: Dof[];
  KICKS?: [number, number][];    // [frame, gain] impact flip-shakes
  LIGHT?: Record<number, { light?: Light; sunAz?: number; sunEl?: number }>;
  stage: (id: number, f: number, S: StageAPI) => void;
};
export const SETS: SetDef[] = [DINER, PLANT, SUBURB, OFFICE];
const BASE: Omit<ShotDef, "light">[] = [
  { id: 1, a: 0, b: 98, set: "diner" },      // For years, people thought they were winning McDonald's Monopoly.
  { id: 2, a: 98, b: 229, set: "plant" },    // But the biggest prizes were already being stolen before the game even began.
  { id: 3, a: 229, b: 375, set: "plant" },   // The winning pieces were printed in secret, and locked in sealed, tamper-proof envelopes.
  { id: 4, a: 375, b: 517, set: "plant" },   // Only one man carried them to the factories: the head of security, a former cop.
  { id: 5, a: 517, b: 559, set: "plant" },   // And that was the problem.
  { id: 6, a: 559, b: 678, set: "plant" },   // Along the way, he'd slip the million-dollar pieces into his own pocket.
  { id: 7, a: 678, b: 799, set: "diner" },   // Then he sold them to friends, relatives, even strangers, for cash.  (parking lot)
  { id: 8, a: 799, b: 909, set: "diner" },   // Each fake winner made up a story about finding it on a soda cup.
  { id: 9, a: 909, b: 976, set: "suburb" },  // A butcher. A psychic. Even a mobster.
  { id: 10, a: 976, b: 1096, set: "suburb" }, // For twelve years, almost every big prize went to his secret network.
  { id: 11, a: 1096, b: 1199, set: "office" }, // Then, in two thousand, the FBI got an anonymous tip.
  { id: 12, a: 1199, b: 1255, set: "office" }, // Agents tapped his phone,
  { id: 13, a: 1255, b: 1384, set: "suburb" }, // and even posed as a TV crew, filming the lucky winners with giant checks.
  { id: 14, a: 1384, b: 1466, set: "suburb" }, // In two thousand one, it all came crashing down.
  { id: 15, a: 1466, b: 1555, set: "office" }, // More than fifty people were eventually convicted.  (courtroom)
  { id: 16, a: 1555, b: 1628, set: "office" }, // The total? About twenty-four million dollars.  (courtroom)
  { id: 17, a: 1628, b: 1705, set: "diner" },  // For everyone else, the odds were one in millions.
  { id: 18, a: 1705, b: TOTAL, set: "diner" }, // For his friends, they were one in one.
];
export const setOf = (id: number) => SETS.find((s) => s.name === BASE[id - 1].set)!;
export const SHOTS: ShotDef[] = BASE.map((s) => ({ light: "day", ...s, ...(setOf(s.id).LIGHT?.[s.id] ?? {}) } as ShotDef));
export const XFADE: Record<number, number> = {};
export const FLASH_AT = 98;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
const KICKS: [number, number][] = SETS.flatMap((s) => s.KICKS ?? []);
export const kickAt = (t: number) => {
  let a = 0;
  for (const [f0, g] of KICKS) {
    const n = Math.floor(t * FPS - f0 + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const keys = setOf(id).CAMS[id];
  const c = keys ? run(keys, f) : { pos: [0, 1.6, 6] as V3, look: [0, 1.4, 0] as V3, fov: 40, roll: 0 };
  const a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
const DOF: Dof[] = SETS.flatMap((s) => s.DOF).sort((a, b) => a.f - b.f);
export const dofAt = (f: number) => {
  if (!DOF.length) return { cInf: 0, focus: undefined };
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const WORDS: [number, number, string][] = [
  [4, 9, "for"],
  [10, 20, "years"],
  [22, 30, "people"],
  [31, 41, "thought"],
  [42, 48, "they"],
  [49, 56, "were"],
  [56, 66, "winning"],
  [67, 78, "mcdonald's"],
  [80, 93, "monopoly"],
  [98, 105, "but"],
  [106, 112, "the"],
  [113, 124, "biggest"],
  [125, 135, "prizes"],
  [136, 144, "were"],
  [145, 156, "already"],
  [157, 166, "being"],
  [167, 177, "stolen"],
  [178, 188, "before"],
  [189, 196, "the"],
  [197, 204, "game"],
  [205, 213, "even"],
  [214, 226, "began"],
  [231, 237, "the"],
  [238, 248, "winning"],
  [250, 259, "pieces"],
  [260, 268, "were"],
  [269, 279, "printed"],
  [280, 286, "in"],
  [286, 299, "secret"],
  [301, 307, "and"],
  [307, 317, "locked"],
  [318, 323, "in"],
  [324, 337, "sealed"],
  [338, 353, "tamper-proof"],
  [355, 372, "envelopes"],
  [377, 384, "only"],
  [385, 392, "one"],
  [392, 399, "man"],
  [399, 410, "carried"],
  [412, 419, "them"],
  [420, 425, "to"],
  [426, 432, "the"],
  [433, 449, "factories"],
  [451, 458, "the"],
  [458, 466, "head"],
  [467, 472, "of"],
  [472, 488, "security"],
  [490, 494, "a"],
  [494, 504, "former"],
  [505, 515, "cop"],
  [519, 525, "and"],
  [525, 532, "that"],
  [532, 538, "was"],
  [538, 544, "the"],
  [544, 556, "problem"],
  [561, 570, "along"],
  [571, 577, "the"],
  [577, 587, "way"],
  [588, 594, "he'd"],
  [595, 602, "slip"],
  [603, 609, "the"],
  [610, 627, "million-dollar"],
  [629, 639, "pieces"],
  [640, 647, "into"],
  [648, 654, "his"],
  [655, 661, "own"],
  [662, 675, "pocket"],
  [680, 687, "then"],
  [688, 693, "he"],
  [694, 702, "sold"],
  [702, 710, "them"],
  [711, 716, "to"],
  [717, 731, "friends"],
  [733, 749, "relatives"],
  [751, 759, "even"],
  [760, 776, "strangers"],
  [778, 785, "for"],
  [785, 796, "cash"],
  [801, 808, "each"],
  [809, 816, "fake"],
  [817, 826, "winner"],
  [827, 834, "made"],
  [835, 840, "up"],
  [840, 844, "a"],
  [844, 853, "story"],
  [853, 862, "about"],
  [862, 873, "finding"],
  [874, 879, "it"],
  [879, 884, "on"],
  [885, 889, "a"],
  [889, 896, "soda"],
  [897, 906, "cup"],
  [911, 914, "a"],
  [915, 928, "butcher"],
  [929, 933, "a"],
  [933, 946, "psychic"],
  [948, 955, "even"],
  [955, 959, "a"],
  [959, 972, "mobster"],
  [978, 984, "for"],
  [985, 994, "twelve"],
  [995, 1008, "years"],
  [1009, 1019, "almost"],
  [1020, 1028, "every"],
  [1029, 1036, "big"],
  [1036, 1045, "prize"],
  [1046, 1054, "went"],
  [1054, 1060, "to"],
  [1060, 1067, "his"],
  [1067, 1077, "secret"],
  [1078, 1093, "network"],
  [1098, 1109, "then"],
  [1111, 1116, "in"],
  [1117, 1123, "two"],
  [1124, 1141, "thousand"],
  [1142, 1149, "the"],
  [1150, 1156, "fbi"],
  [1157, 1164, "got"],
  [1165, 1170, "an"],
  [1171, 1185, "anonymous"],
  [1186, 1197, "tip"],
  [1201, 1212, "agents"],
  [1213, 1223, "tapped"],
  [1225, 1231, "his"],
  [1232, 1245, "phone"],
  [1247, 1253, "and"],
  [1254, 1262, "even"],
  [1263, 1272, "posed"],
  [1273, 1279, "as"],
  [1279, 1284, "a"],
  [1284, 1290, "tv"],
  [1290, 1302, "crew"],
  [1303, 1315, "filming"],
  [1316, 1323, "the"],
  [1324, 1333, "lucky"],
  [1334, 1346, "winners"],
  [1347, 1355, "with"],
  [1356, 1365, "giant"],
  [1366, 1380, "checks"],
  [1386, 1390, "in"],
  [1391, 1397, "two"],
  [1398, 1409, "thousand"],
  [1410, 1420, "one"],
  [1421, 1426, "it"],
  [1426, 1432, "all"],
  [1433, 1440, "came"],
  [1441, 1452, "crashing"],
  [1453, 1464, "down"],
  [1468, 1476, "more"],
  [1477, 1485, "than"],
  [1486, 1495, "fifty"],
  [1496, 1507, "people"],
  [1508, 1516, "were"],
  [1517, 1532, "eventually"],
  [1534, 1551, "convicted"],
  [1557, 1563, "the"],
  [1563, 1575, "total"],
  [1576, 1584, "about"],
  [1585, 1598, "twenty-four"],
  [1600, 1610, "million"],
  [1611, 1625, "dollars"],
  [1630, 1635, "for"],
  [1636, 1646, "everyone"],
  [1647, 1657, "else"],
  [1658, 1663, "the"],
  [1664, 1670, "odds"],
  [1671, 1677, "were"],
  [1678, 1683, "one"],
  [1684, 1688, "in"],
  [1689, 1702, "millions"],
  [1707, 1712, "for"],
  [1712, 1717, "his"],
  [1718, 1729, "friends"],
  [1730, 1735, "they"],
  [1736, 1742, "were"],
  [1742, 1747, "one"],
  [1748, 1752, "in"],
  [1752, 1759, "one"]
];
