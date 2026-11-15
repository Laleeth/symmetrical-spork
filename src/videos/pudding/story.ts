// THE PUDDING LOOPHOLE: 16 shots timed to the narration (frames at 30 fps, total 1615 = 53.8 s).
// Shot boundaries, WORDS and TOTAL are LOCKED to the voice. Each set file owns the cameras, DOF, kicks, light
// overrides and staging of its own shots; this file only merges them.
import { V3, FPS } from "./core";
import { run, Cam, Key, Dof } from "./cam";
import type { Put } from "./kit";
import type { StageAPI } from "./stagekit";
import * as THREE from "three";
import { STORE } from "./sets/store";
import { HALL } from "./sets/hall";
import { STREET } from "./sets/street";
export { FPS };
export type { V3 };
export const TOTAL = 1615;
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
export const SETS: SetDef[] = [STORE, HALL, STREET];
const BASE: Omit<ShotDef, "light">[] = [
  { id: 1, a: 0, b: 165, set: "store" },     // This engineer turned 25-cent pudding cups into over a million airline miles.
  { id: 2, a: 165, b: 271, set: "hall" },    // And the strangest part? He gave the pudding away to pull it off.
  { id: 3, a: 271, b: 394, set: "store" },   // 1999. David Phillips spots a Healthy Choice deal:
  { id: 4, a: 394, b: 460, set: "store" },   // ten barcodes, five hundred miles.
  { id: 5, a: 460, b: 543, set: "store" },   // Mail them by May 31st, and it doubles.
  { id: 6, a: 543, b: 625, set: "store" },   // Then he finds the pudding, twenty-five cents a cup.
  { id: 7, a: 625, b: 743, set: "store" },   // Ten cups, $2.50. Ten barcodes, 1,000 miles.
  { id: 8, a: 743, b: 814, set: "store" },   // So he buys every cup, in ten stores.
  { id: 9, a: 814, b: 970, set: "store" },   // Then orders more. Over twelve thousand cups, for $3,140.
  { id: 10, a: 970, b: 1082, set: "store" }, // But he has three weeks, and every barcode must be cut off by hand.
  { id: 11, a: 1082, b: 1170, set: "hall" }, // So he donates the pudding to the Salvation Army,
  { id: 12, a: 1170, b: 1242, set: "hall" }, // and their volunteers peel the labels for him.
  { id: 13, a: 1242, b: 1295, set: "hall" }, // He even gets a tax write-off.
  { id: 14, a: 1295, b: 1430, set: "street" }, // Healthy Choice pays out: 1,253,000 miles.
  { id: 15, a: 1430, b: 1492, set: "street" }, // That's thirty-one round trips to Europe.
  { id: 16, a: 1492, b: TOTAL, set: "hall" },  // Not rich in cash. Rich in miles. All from a pudding cup.
];
export const setOf = (id: number) => SETS.find((s) => s.name === BASE[id - 1].set)!;
export const SHOTS: ShotDef[] = BASE.map((s) => ({ light: "day", ...s, ...(setOf(s.id).LIGHT?.[s.id] ?? {}) } as ShotDef));
export const XFADE: Record<number, number> = {};
export const FLASH_AT = 165;
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
  [4, 12, "this"],
  [13, 28, "engineer"],
  [29, 41, "turned"],
  [42, 62, "twenty-five"],
  [63, 72, "cent"],
  [73, 87, "pudding"],
  [88, 96, "cups"],
  [97, 106, "into"],
  [107, 116, "over"],
  [117, 120, "a"],
  [121, 135, "million"],
  [136, 149, "airline"],
  [150, 161, "miles"],
  [165, 171, "and"],
  [172, 178, "the"],
  [179, 193, "strangest"],
  [194, 201, "part"],
  [202, 206, "he"],
  [207, 214, "gave"],
  [215, 221, "the"],
  [222, 233, "pudding"],
  [234, 241, "away"],
  [242, 246, "to"],
  [247, 254, "pull"],
  [255, 260, "it"],
  [261, 266, "off"],
  [271, 286, "nineteen"],
  [287, 306, "ninety-nine"],
  [307, 317, "david"],
  [318, 333, "phillips"],
  [334, 344, "spots"],
  [345, 349, "a"],
  [350, 363, "healthy"],
  [364, 375, "choice"],
  [376, 385, "deal"],
  [394, 401, "ten"],
  [402, 418, "barcodes"],
  [419, 428, "five"],
  [429, 443, "hundred"],
  [444, 455, "miles"],
  [460, 468, "mail"],
  [469, 477, "them"],
  [478, 483, "by"],
  [484, 490, "may"],
  [491, 511, "thirty-first"],
  [512, 519, "and"],
  [520, 525, "it"],
  [526, 538, "doubles"],
  [543, 550, "then"],
  [551, 555, "he"],
  [556, 564, "finds"],
  [565, 571, "the"],
  [572, 583, "pudding"],
  [584, 600, "twenty-five"],
  [601, 609, "cents"],
  [610, 613, "a"],
  [614, 620, "cup"],
  [625, 632, "ten"],
  [633, 642, "cups"],
  [643, 650, "two"],
  [651, 665, "dollars"],
  [666, 677, "fifty"],
  [678, 685, "ten"],
  [686, 702, "barcodes"],
  [703, 710, "one"],
  [711, 726, "thousand"],
  [727, 738, "miles"],
  [743, 748, "so"],
  [749, 754, "he"],
  [755, 764, "buys"],
  [765, 775, "every"],
  [776, 783, "cup"],
  [784, 789, "in"],
  [790, 797, "ten"],
  [798, 809, "stores"],
  [814, 822, "then"],
  [823, 834, "orders"],
  [835, 843, "more"],
  [844, 852, "over"],
  [853, 864, "twelve"],
  [865, 879, "thousand"],
  [880, 888, "cups"],
  [889, 895, "for"],
  [896, 905, "three"],
  [906, 920, "thousand"],
  [921, 928, "one"],
  [929, 941, "hundred"],
  [942, 952, "forty"],
  [953, 965, "dollars"],
  [970, 976, "but"],
  [977, 981, "he"],
  [982, 988, "has"],
  [989, 998, "three"],
  [999, 1007, "weeks"],
  [1008, 1014, "and"],
  [1015, 1024, "every"],
  [1025, 1036, "barcode"],
  [1037, 1044, "must"],
  [1045, 1050, "be"],
  [1051, 1057, "cut"],
  [1058, 1063, "off"],
  [1064, 1069, "by"],
  [1070, 1077, "hand"],
  [1082, 1086, "so"],
  [1087, 1092, "he"],
  [1093, 1104, "donates"],
  [1105, 1111, "the"],
  [1112, 1124, "pudding"],
  [1125, 1129, "to"],
  [1130, 1136, "the"],
  [1137, 1152, "salvation"],
  [1153, 1160, "army"],
  [1170, 1176, "and"],
  [1177, 1185, "their"],
  [1186, 1200, "volunteers"],
  [1201, 1208, "peel"],
  [1209, 1214, "the"],
  [1215, 1225, "labels"],
  [1226, 1231, "for"],
  [1232, 1238, "him"],
  [1242, 1247, "he"],
  [1248, 1255, "even"],
  [1256, 1264, "gets"],
  [1265, 1268, "a"],
  [1269, 1275, "tax"],
  [1276, 1291, "write-off"],
  [1295, 1308, "healthy"],
  [1309, 1320, "choice"],
  [1321, 1330, "pays"],
  [1331, 1337, "out"],
  [1338, 1345, "one"],
  [1346, 1359, "million"],
  [1360, 1366, "two"],
  [1367, 1380, "hundred"],
  [1381, 1400, "fifty-three"],
  [1401, 1415, "thousand"],
  [1416, 1426, "miles"],
  [1430, 1439, "that's"],
  [1440, 1454, "thirty-one"],
  [1455, 1463, "round"],
  [1464, 1472, "trips"],
  [1473, 1477, "to"],
  [1478, 1487, "europe"],
  [1492, 1498, "not"],
  [1499, 1507, "rich"],
  [1508, 1513, "in"],
  [1514, 1522, "cash"],
  [1523, 1531, "rich"],
  [1532, 1537, "in"],
  [1538, 1547, "miles"],
  [1548, 1555, "all"],
  [1556, 1564, "from"],
  [1565, 1568, "a"],
  [1569, 1582, "pudding"],
  [1583, 1589, "cup"]
];
