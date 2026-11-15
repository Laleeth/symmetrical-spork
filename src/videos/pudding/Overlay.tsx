// 2D infographic layer for the pudding short: every number the narration says is shown, in the world's ink style
// (8 px dark outline, flat fills, Arial Black). Lives in the top 60 % of the frame; captions own ~71 %.
import React from "react";
import { AbsoluteFill } from "remotion";

const INK = "#1b1420", RED = "#c8323c", GOLD = "#f2c43b", CREAM = "#fbf6ea", GREEN = "#3f8a5a", BLUE = "#2f6a8a";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - (1 - clamp(x)) ** 3;
/** pop-in scale with overshoot; 0 before f0 */
const pop = (f: number, f0: number, d = 8) => { if (f < f0) return 0; const u = clamp((f - f0) / d); return u >= 1 ? 1 : ease(u) + 0.22 * Math.sin(u * Math.PI); };
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const T: React.FC<{ x: number; y: number; s: number; fill?: string; children: React.ReactNode; anchor?: "middle" | "start" | "end"; sw?: number; rot?: number }> =
  ({ x, y, s, fill = "#ffffff", children, anchor = "middle", sw, rot = 0 }) => (
    <text x={x} y={y} fontSize={s} fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} textAnchor={anchor} fill={fill}
      stroke={INK} strokeWidth={sw ?? s * 0.14} strokeLinejoin="round" paintOrder="stroke" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{children}</text>
  );
const G: React.FC<{ x: number; y: number; k: number; rot?: number; children: React.ReactNode }> = ({ x, y, k, rot = 0, children }) =>
  k <= 0 ? null : <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>{children}</g>;
const Panel: React.FC<{ w: number; h: number; fill?: string; r?: number }> = ({ w, h, fill = CREAM, r = 26 }) =>
  <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={fill} stroke={INK} strokeWidth={10} />;
const Barcode: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 70, h = 50 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#fff" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 11 }, (_, i) => <rect key={i} x={-w / 2 + 8 + i * ((w - 16) / 11)} y={-h / 2 + 7} width={i % 3 ? 2.5 : 5} height={h - 14} fill={INK} />)}
  </g>
);
const Plane: React.FC<{ x: number; y: number; s?: number; rot?: number; fill?: string }> = ({ x, y, s = 1, rot = 0, fill = "#fff" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -40 0 Q -40 -9 -30 -9 L 34 -9 Q 46 -6 46 0 Q 46 6 34 9 L -30 9 Q -40 9 -40 0 Z M -6 -8 L -22 -42 L -12 -42 L 14 -8 Z M -6 8 L -22 42 L -12 42 L 14 8 Z M -34 -8 L -42 -24 L -34 -24 L -26 -8 Z"
      fill={fill} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const Cup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -26 -30 L 26 -30 L 19 30 L -19 30 Z" fill="#efe8da" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -24 -12 L 24 -12 L 21 18 L -21 18 Z" fill="#7a4a2e" /><rect x={-24} y={-9} width={48} height={7} fill={GREEN} />
    <ellipse cx={0} cy={-30} rx={29} ry={7} fill="#d4dbe2" stroke={INK} strokeWidth={5} />
  </g>
);

export const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const els: React.ReactNode[] = [];
  // ---- 1: one 25c cup -> over a million miles ----
  if (f < 165) {
    els.push(<G key="t1" x={250} y={330} k={pop(f, 42)} rot={-8}><Panel w={250} h={130} fill={GOLD} /><T x={0} y={34} s={92} fill={RED}>25¢</T></G>);
    if (f >= 97) {
      const v = 1_000_000 * ease((f - 97) / 52) ** 1.6;
      els.push(<G key="m1" x={540} y={560} k={pop(f, 97, 6)}><Panel w={880} h={250} fill={BLUE} />
        <T x={0} y={18} s={120} fill={GOLD}>{fmt(v)}{f >= 150 ? "+" : ""}</T><T x={0} y={92} s={54}>AIRLINE MILES</T>
        <Plane x={-380} y={-118} s={1.1} rot={-12} fill={GOLD} /></G>);
    }
  }
  // ---- 3: 1999 ----
  if (f >= 271 && f < 394) els.push(<G key="y" x={540} y={330} k={pop(f, 287)} rot={-4}><Panel w={420} h={170} fill={RED} /><T x={0} y={48} s={130}>1999</T></G>);
  // ---- 4: ten barcodes = 500 miles ----
  if (f >= 394 && f < 460) {
    const n = Math.min(10, Math.floor((f - 394) / 2.4) + 1);
    els.push(<g key="bc">{Array.from({ length: n }, (_, i) => <G key={i} x={170 + (i % 5) * 185} y={300 + Math.floor(i / 5) * 95} k={pop(f, 394 + i * 2.4, 5)}><Barcode x={0} y={0} w={130} h={74} /></G>)}</g>);
    els.push(<G key="eq" x={540} y={620} k={pop(f, 419)}><Panel w={720} h={170} fill={BLUE} /><T x={0} y={44} s={110} fill={GOLD}>= 500 MILES</T></G>);
  }
  // ---- 5: May 31, doubles ----
  if (f >= 460 && f < 543) {
    els.push(<G key="cal" x={270} y={430} k={pop(f, 484)} rot={-6}>
      <rect x={-150} y={-170} width={300} height={340} rx={18} fill={CREAM} stroke={INK} strokeWidth={10} />
      <rect x={-150} y={-170} width={300} height={100} rx={18} fill={RED} stroke={INK} strokeWidth={10} />
      <T x={0} y={-100} s={64}>MAY</T><T x={0} y={110} s={170} fill={RED}>31</T></G>);
    const dbl = f >= 526;
    els.push(<G key="d5" x={760} y={430} k={pop(f, 466)}>
      <Panel w={430} h={240} fill={dbl ? GOLD : CREAM} />
      <T x={0} y={-20} s={dbl ? 64 : 120} fill={dbl ? "#8a8a8a" : BLUE}>500</T>
      {dbl ? <><line x1={-110} y1={-40} x2={110} y2={-40} stroke={RED} strokeWidth={14} /><T x={0} y={92} s={120} fill={RED}>1,000</T></> : <T x={0} y={80} s={52} fill={INK}>MILES</T>}
    </G>);
    if (dbl) els.push(<G key="x2" x={940} y={260} k={pop(f, 530)} rot={12}><circle r={88} fill={RED} stroke={INK} strokeWidth={10} /><T x={0} y={30} s={86}>×2</T></G>);
  }
  // ---- 6: 25 cents a cup ----
  if (f >= 543 && f < 625 && f >= 596) {
    const sw = 10 * Math.sin((f - 601) * 0.35) * Math.exp(-(f - 601) / 14);
    els.push(<G key="tag" x={540} y={380} k={pop(f, 598, 6)} rot={sw}>
      <line x1={0} y1={-330} x2={0} y2={-130} stroke={INK} strokeWidth={8} />
      <path d="M -230 -130 L 230 -130 L 230 130 L -230 130 L -300 0 Z" fill={GOLD} stroke={INK} strokeWidth={12} strokeLinejoin="round" />
      <circle cx={-230} cy={0} r={18} fill={CREAM} stroke={INK} strokeWidth={6} />
      <T x={30} y={70} s={210} fill={RED}>25¢</T></G>);
  }
  // ---- 7: the math, as a balance scale ----
  if (f >= 625 && f < 743) {
    const tilt = f < 703 ? 0 : -16 * ease((f - 703) / 14) + 2.5 * Math.sin((f - 703) * 0.5) * Math.exp(-(f - 703) / 10);
    const a = (tilt * Math.PI) / 180, L = 330, lx = -L * Math.cos(a), ly = -L * Math.sin(a), rx = L * Math.cos(a), ry = L * Math.sin(a);
    els.push(<G key="sc" x={540} y={200} k={0.85 * pop(f, 625, 10)}>
      <path d="M -70 300 L 70 300 L 20 40 L -20 40 Z" fill="#8a5a34" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <circle cx={0} cy={30} r={30} fill={GOLD} stroke={INK} strokeWidth={8} />
      <line x1={lx} y1={30 + ly} x2={rx} y2={30 + ry} stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <line x1={lx} y1={30 + ly} x2={rx} y2={30 + ry} stroke="#b8864e" strokeWidth={14} strokeLinecap="round" />
      {[[lx, ly, -1], [rx, ry, 1]].map(([x, y, s]) => <g key={s}><line x1={x - 110} y1={150 + y} x2={x} y2={30 + y} stroke={INK} strokeWidth={6} /><line x1={x + 110} y1={150 + y} x2={x} y2={30 + y} stroke={INK} strokeWidth={6} />
        <path d={`M ${x - 150} ${150 + y} L ${x + 150} ${150 + y} Q ${x} ${230 + y} ${x - 150} ${150 + y} Z`} fill="#c9ced6" stroke={INK} strokeWidth={8} /></g>)}
      <G x={lx} y={70 + ly} k={pop(f, 633)}><Cup x={-60} y={10} s={1.1} /><Cup x={0} y={0} s={1.1} /><Cup x={60} y={10} s={1.1} /><T x={0} y={-62} s={58} fill={GOLD}>$2.50</T></G>
      <G x={rx} y={70 + ry} k={pop(f, 703)}><Plane x={0} y={0} s={1.8} rot={-10} fill={GOLD} /><T x={0} y={-62} s={58} fill={GOLD}>1,000 MI</T></G>
    </G>);
    els.push(<G key="sc1" x={540} y={120} k={pop(f, 633)}><T x={0} y={0} s={56}>10 CUPS</T></G>);
  }
  // ---- 8: ten stores ----
  if (f >= 743 && f < 814) {
    const n = Math.max(1, Math.min(10, 1 + Math.floor((f - 765) / 3.6)));
    els.push(<G key="st" x={540} y={330} k={pop(f, 755)}><Panel w={600} h={200} fill={GREEN} /><T x={0} y={36} s={96}>STORE {n}/10</T></G>);
    els.push(<g key="dots">{Array.from({ length: 10 }, (_, i) => <circle key={i} cx={270 + i * 60} cy={480} r={20} fill={i < n ? GOLD : "#ffffff55"} stroke={INK} strokeWidth={6} />)}</g>);
  }
  // ---- 9: 12,000+ cups, $3,140 ----
  if (f >= 814 && f < 970) {
    if (f >= 844) { const v = 12000 * ease((f - 844) / 36); els.push(<G key="cups" x={540} y={300} k={pop(f, 844)}><Panel w={780} h={220} fill={BLUE} /><T x={0} y={30} s={120} fill={GOLD}>{fmt(v)}{f >= 880 ? "+" : ""}</T><T x={0} y={92} s={48}>PUDDING CUPS</T></G>); }
    if (f >= 896) els.push(<G key="cost" x={720} y={560} k={pop(f, 896)} rot={5}><Panel w={440} h={160} fill={GOLD} /><T x={0} y={40} s={100} fill={RED}>{f < 953 ? "$" + fmt(3140 * ease((f - 896) / 50)) : "$3,140"}</T></G>);
  }
  // ---- 10: three weeks, burning down ----
  if (f >= 970 && f < 1082) {
    const left = f < 989 ? 21 : Math.max(1, 21 - Math.floor((f - 989) / 3.8));
    els.push(<G key="wk" x={540} y={360} k={pop(f, 982)} rot={-3}>
      <rect x={-210} y={-180} width={420} height={330} rx={20} fill={CREAM} stroke={INK} strokeWidth={10} />
      <rect x={-210} y={-180} width={420} height={90} rx={20} fill={RED} stroke={INK} strokeWidth={10} />
      <T x={0} y={-114} s={52}>DAYS LEFT</T><T x={0} y={100} s={190} fill={left <= 5 ? RED : INK}>{left}</T></G>);
    if (f >= 1051) els.push(<G key="hand" x={540} y={640} k={pop(f, 1051)}><Panel w={560} h={130} fill={RED} /><T x={0} y={34} s={78}>BY HAND ✂</T></G>);
  }
  // ---- 11: donated ----
  if (f >= 1082 && f < 1170 && f >= 1093) els.push(<G key="don" x={540} y={300} k={pop(f, 1093)}><Panel w={760} h={210} fill={RED} /><T x={0} y={-6} s={64}>DONATED TO</T><T x={0} y={70} s={64} fill={GOLD}>THE SALVATION ARMY</T></G>);
  // ---- 13: tax write-off ----
  if (f >= 1242 && f < 1295 && f >= 1262) els.push(<G key="tax" x={720} y={400} k={pop(f, 1262)} rot={6}>
    <path d="M -200 -230 L 200 -230 L 200 210 L 170 230 L 140 210 L 110 230 L 80 210 L 50 230 L 20 210 L -10 230 L -40 210 L -70 230 L -100 210 L -130 230 L -160 210 L -200 230 Z" fill={CREAM} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <T x={0} y={-150} s={44} fill={INK}>TAX WRITE-OFF</T>{[0, 1, 2].map((i) => <rect key={i} x={-150} y={-100 + i * 40} width={300 - i * 60} height={14} fill="#c9c4bc" />)}
    <T x={0} y={130} s={120} fill={GREEN}>$815</T></G>);
  // ---- 14: 1,253,000 miles ----
  if (f >= 1295 && f < 1430 && f >= 1338) {
    const v = f >= 1410 ? 1253000 : 1253000 * ease((f - 1338) / 72);
    els.push(<G key="mi" x={540} y={330} k={pop(f, 1338)}><Panel w={940} h={260} fill={BLUE} /><T x={0} y={34} s={140} fill={GOLD}>{fmt(v)}</T><T x={0} y={104} s={54}>AIRLINE MILES</T></G>);
    if (f >= 1416) els.push(<G key="stamp" x={830} y={560} k={pop(f, 1416, 5)} rot={-14}><rect x={-190} y={-70} width={380} height={140} rx={16} fill="none" stroke={RED} strokeWidth={14} /><T x={0} y={28} s={78} fill={RED} sw={0}>PAID!</T></G>);
  }
  // ---- 15: 31 round trips to Europe ----
  if (f >= 1430 && f < 1492) {
    const n = Math.min(31, Math.max(0, Math.floor((f - 1440) / 1.1)));
    els.push(<G key="map" x={540} y={420} k={pop(f, 1432)}>
      <rect x={-470} y={-260} width={940} height={520} rx={30} fill="#9fd0ea" stroke={INK} strokeWidth={10} />
      <path d="M -460 -200 Q -380 -240 -260 -190 Q -200 -120 -230 -40 Q -260 40 -330 80 Q -400 160 -460 140 Z" fill="#8cc06a" stroke={INK} strokeWidth={8} />
      <path d="M 250 -230 Q 330 -250 420 -200 L 460 -200 L 460 120 Q 400 140 350 90 Q 300 40 270 -40 Q 230 -120 250 -230 Z" fill="#e8c46a" stroke={INK} strokeWidth={8} />
      <T x={-350} y={-10} s={40}>USA</T><T x={360} y={-30} s={40}>EUROPE</T>
      {Array.from({ length: n }, (_, i) => { const y0 = -140 + (i % 8) * 36, y1 = -170 + ((i * 3) % 9) * 30, cy = -230 - (i % 5) * 18;
        return <path key={i} d={`M -240 ${y0} Q 0 ${cy} 280 ${y1}`} fill="none" stroke={i % 2 ? RED : "#ffffff"} strokeWidth={5} strokeDasharray="14 10" opacity={0.9} />; })}
      {n > 0 ? <Plane x={20} y={-200} s={1.3} rot={-6} fill={GOLD} /> : null}
    </G>);
    els.push(<G key="31" x={540} y={140} k={pop(f, 1440)}><T x={0} y={0} s={88} fill={GOLD}>{Math.max(1, n)} ROUND TRIPS</T></G>);
  }
  // ---- 16: not rich in cash, rich in miles ----
  if (f >= 1492) {
    els.push(<G key="cash" x={540} y={260} k={pop(f, 1499)}><T x={0} y={0} s={96} fill={f >= 1514 ? "#9a9a9a" : "#ffffff"}>RICH IN CASH</T>
      {f >= 1514 ? <line x1={-380} y1={-30} x2={380 * ease((f - 1514) / 6)} y2={-30} stroke={RED} strokeWidth={16} strokeLinecap="round" /> : null}</G>);
    if (f >= 1523) els.push(<G key="miles" x={540} y={420} k={pop(f, 1523)} rot={-3}><Panel w={820} h={190} fill={GOLD} /><T x={0} y={42} s={110} fill={RED}>RICH IN MILES</T><Plane x={350} y={-110} s={1.4} rot={-15} /></G>);
  }
  if (!els.length) return null;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="0" floodColor={INK} floodOpacity="0.35" /></filter></defs>
        <g filter="url(#sh)">{els}</g>
      </svg>
    </AbsoluteFill>
  );
};
