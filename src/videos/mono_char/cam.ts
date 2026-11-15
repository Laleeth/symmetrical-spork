// Camera grammar (reference study): hard cuts on big reframes, smootherstep glides 18-40 f, every hold creeps in,
// flip kicks on impacts, 4-5 deg rolls. A shot = list of keys; each key's s(f) returns pos/look/fov/roll at frame f.
import { V3, clamp01 } from "./core";
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Shot = Partial<Cam> & { pos: V3; look: V3 };
export type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mixc = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
export const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixc(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** creeping push-in factor (distance multiplier) from frame f0: rate per frame, optional punch burst */
export const pushK = (f: number, f0: number, rate: number, punch = 0, n = 30) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** camera at pos looking at look, pulled toward look by factor k (k<1 = closer) */
export const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
export const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });
/** orbit around c at radius r from angle a0 to a1 (radians, 0 = +z) over frames f0..f1, height y */
export const orbit = (c: V3, r: number, a0: number, a1: number, y: number, f0: number, f1: number, rest: Partial<Cam> = {}) => (f: number): Shot => {
  const a = a0 + (a1 - a0) * glide((f - f0) / (f1 - f0));
  return { pos: [c[0] + Math.sin(a) * r, y, c[2] + Math.cos(a) * r], look: c, ...rest };
};
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const head = (p: V3, h = 1.62): V3 => [p[0], p[1] + h, p[2]];
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
