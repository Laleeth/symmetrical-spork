// PLANT set helpers: painted textures (brick, block, concrete, asphalt road, hazard stripes, signs, sticker sheets, CRT)
// and effect-card painters (gold sticker, envelope, briefcase, seal, badge photo). Owned by the PLANT agent.
import * as THREE from "three";
import { ctex, lam, blot, W9, U, jit, Pen, INK } from "../kit";

const lamMap = (key: string, t: () => THREE.Texture) => lam(key, () => ({ map: t() }));

/** red-brown brick, 512 px = 2 m: running bond, per-brick jitter, dark mortar seams, soot/grime drift */
export const brickTex = (col: string, mortar = "#3a2420") => ctex("brick" + col, 512, 512, (g, r) => {
  g.fillStyle = mortar; g.fillRect(0, 0, 512, 512);
  const bh = 19.2, bw = 59;
  for (let row = 0; row < 512 / bh; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let x = -bw; x < 512 + bw; x += bw) {
      g.fillStyle = jit(r, col, 0.12, 4, 0.15);
      g.fillRect(x + off + 2, row * bh + 2, bw - 4, bh - 4);
      if (r() < 0.25) { g.fillStyle = "rgba(255,235,210,0.18)"; g.fillRect(x + off + 3, row * bh + 3, bw - 8, 3); }
    }
  }
  for (let i = 0; i < 14; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 60, 170), light = r() > 0.55; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,225,190" : "40,20,15", light ? 0.12 : 0.2)); }
  for (let i = 0; i < 5; i++) { const x = U(r, 0, 500), y = U(r, 0, 300), l = U(r, 80, 220); const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, "rgba(30,20,20,0.3)"); gr.addColorStop(1, "rgba(30,20,20,0)"); g.fillStyle = gr; g.fillRect(x, y, U(r, 10, 30), l); }
});
/** painted concrete block, 512 px = 2.4 m (0.4 x 0.2 m blocks), thick dark seams */
export const blockTex = (col: string) => ctex("block" + col, 512, 512, (g, r) => {
  g.fillStyle = "#1e1a22"; g.fillRect(0, 0, 512, 512);
  const bh = 512 / 12, bw = 512 / 6;
  for (let row = 0; row < 12; row++) for (let x = -bw; x < 512 + bw; x += bw) {
    const off = row % 2 ? bw / 2 : 0; g.fillStyle = jit(r, col, 0.06, 3, 0.1); g.fillRect(x + off + 3, row * bh + 3, bw - 6, bh - 6);
  }
  for (let i = 0; i < 12; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 60, 160); W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, r() > 0.5 ? "255,250,235" : "40,30,40", 0.14)); }
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,250,235" : "30,25,35"},${U(r, 0.08, 0.2)})`; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2.5, 2.5); }
});
/** concrete floor / yard, 512 px = 4 m: soft drift, oil stains, saw-cut joint lines on the tile edge */
export const concreteTex = (col: string, key = "") => ctex("conc" + col + key, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 16; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 50, 160), light = r() > 0.5; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,250,240" : "70,60,70", light ? 0.13 : 0.12)); }
  for (let i = 0; i < 4; i++) { const x = U(r, 40, 470), y = U(r, 40, 470), rad = U(r, 18, 46); g.fillStyle = "rgba(40,35,45,0.28)"; g.beginPath(); g.ellipse(x, y, rad, rad * 0.6, U(r, 0, 3), 0, 7); g.fill(); }
  g.strokeStyle = "rgba(45,35,40,0.5)"; g.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) { let x = U(r, 40, 470), y = U(r, 30, 380); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += U(r, -18, 18); y += U(r, 8, 22); g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = "rgba(35,28,35,0.75)"; g.fillRect(0, 0, 512, 4); g.fillRect(0, 0, 4, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,245" : "50,45,55"},${U(r, 0.08, 0.2)})`; g.fillRect(U(r, 0, 512), U(r, 0, 512), U(r, 1.5, 3), U(r, 1.5, 3)); }
});
/** two-lane road: u along the road (8 m per tile), v across (0..1 = 8 m): edge lines, double yellow centre line */
export const roadTex = () => ctex("plantRoad", 1024, 1024, (g, r) => {
  g.fillStyle = "#5a5866"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 26; i++) { const x = U(r, 0, 1024), y = U(r, 0, 1024), rad = U(r, 60, 200), light = r() > 0.5; W9(1024, 1024, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "200,195,210" : "30,28,40", 0.16)); }
  for (const y of [56, 968]) { g.fillStyle = "#ece6d6"; g.fillRect(0, y - 9, 1024, 18); }
  for (const y of [500, 524]) { g.fillStyle = "#e8b83a"; g.fillRect(0, y - 8, 1024, 16); }
  g.strokeStyle = "rgba(25,22,30,0.7)"; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) { let x = U(r, 0, 1024), y = U(r, 100, 900); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += U(r, 10, 40); y += U(r, -20, 20); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "230,225,235" : "20,18,28"},${U(r, 0.1, 0.25)})`; g.fillRect(U(r, 0, 1024), U(r, 0, 1024), 3, 3); }
});
export const grassTex = () => ctex("plantGrass", 512, 512, (g, r) => {
  g.fillStyle = "#8aa05a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 22; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 50, 150), light = r() > 0.5; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "220,210,140" : "50,80,40", 0.2)); }
  for (let i = 0; i < 1600; i++) { const x = U(r, 0, 512), y = U(r, 0, 512); g.strokeStyle = r() > 0.5 ? "rgba(60,90,40,0.35)" : "rgba(220,215,150,0.3)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + U(r, -2, 2), y - U(r, 4, 9)); g.stroke(); }
});
/** yellow / black diagonal hazard stripes, 256 px = 1 m */
export const hazardTex = () => ctex("hazard", 256, 64, (g) => {
  g.fillStyle = "#e8b52e"; g.fillRect(0, 0, 256, 64);
  g.fillStyle = "#1f1a22"; for (let k = -2; k < 8; k++) { g.beginPath(); g.moveTo(k * 64, 64); g.lineTo(k * 64 + 32, 64); g.lineTo(k * 64 + 96, 0); g.lineTo(k * 64 + 64, 0); g.closePath(); g.fill(); }
  g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(0, 4, 256, 6);
});
/** flat painted sign with 1-3 lines of text (key must be unique) */
export const plateTex = (key: string, lines: string[], bg: string, fg: string, w = 1024, h = 256, sizes = [110, 64, 52]) => ctex("plate" + key, w, h, (g, r) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) blot(g, U(r, 0, w), U(r, 0, h), U(r, 60, 140), r() > 0.5 ? "255,255,240" : "40,30,30", 0.1);
  g.strokeStyle = fg; g.lineWidth = Math.max(6, h * 0.03); g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
  g.strokeStyle = "#1a1014"; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  const n = lines.length, tot = lines.reduce((s, _l, i) => s + sizes[i] * 1.15, 0); let y = h / 2 - tot / 2;
  lines.forEach((l, i) => { const s = sizes[i]; g.font = `900 ${s}px Arial Black, Arial, sans-serif`; g.fillText(l, w / 2, y + s * 0.6, w * 0.88); y += s * 1.15; });
  void n;
});
export const plate = (key: string, lines: string[], bg: string, fg: string, w = 1024, h = 256, sizes?: number[]) => lamMap("plt" + key, () => plateTex(key, lines, bg, fg, w, h, sizes));
/** a sheet of peel-off game stickers (white, coloured property bar), 256 x 256 */
export const sheetTex = () => ctex("stickerSheet", 256, 256, (g) => {
  g.fillStyle = "#f6f1e4"; g.fillRect(0, 0, 256, 256);
  const cols = ["#d8433a", "#2f6fd6", "#3f9a4a", "#e8a33a", "#8a4fb0", "#2fa3a8"];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = 12 + i * 60, y = 12 + j * 60;
    g.fillStyle = "#ffffff"; g.fillRect(x, y, 52, 52); g.fillStyle = cols[(i + j * 2) % 6]; g.fillRect(x, y, 52, 13);
    g.fillStyle = "#3a3440"; g.fillRect(x + 8, y + 24, 36, 4); g.fillRect(x + 12, y + 34, 28, 4);
    g.strokeStyle = "rgba(40,30,40,0.6)"; g.lineWidth = 2; g.strokeRect(x, y, 52, 52);
  }
});
/** CRT security monitor screen: green-grey camera image with scanlines (k = variant) */
export const crtTex = (k: number) => ctex("crt" + k, 256, 192, (g, r) => {
  g.fillStyle = "#24453c"; g.fillRect(0, 0, 256, 192);
  g.fillStyle = "#3f7062"; g.fillRect(0, 110 - k * 8, 256, 90);
  for (let i = 0; i < 4; i++) { g.fillStyle = "#6fae94"; g.fillRect(20 + i * 58 + k * 6, 60 + (i % 2) * 10, 30, 60); }
  g.fillStyle = "#a8e8c8"; g.beginPath(); g.arc(70 + k * 40, 70, 12, 0, 7); g.fill(); g.fillRect(60 + k * 40, 82, 20, 34);
  for (let y = 0; y < 192; y += 4) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, y, 256, 2); }
  g.fillStyle = "#c8ffe0"; g.font = "700 18px monospace"; g.fillText(`CAM ${k + 1}  REC`, 10, 22); g.fillStyle = "#ff5a4a"; g.beginPath(); g.arc(240, 16, 6, 0, 7); g.fill();
  const gr = g.createRadialGradient(128, 96, 40, 128, 96, 160); gr.addColorStop(0, "rgba(255,255,255,0.08)"); gr.addColorStop(1, "rgba(0,0,0,0.5)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 192);
  void r;
});
/** dark sky window glass (seen from inside = bright warm sky) */
export const skyGlassTex = (key: string, top: string, bot: string) => ctex("skyglass" + key, 64, 128, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(8, 0); g.lineTo(26, 0); g.lineTo(6, 128); g.lineTo(0, 128); g.lineTo(0, 30); g.closePath(); g.fill();
});

// ---------------- effect-card painters (Pen on a cw x ch canvas) ----------------
const outlineText = (g: CanvasRenderingContext2D, t: string, x: number, y: number, size: number, fill: string, lw: number, maxW?: number) => {
  g.font = `900 ${size}px Arial Black, Arial`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = lw; g.strokeStyle = INK; g.strokeText(t, x, y, maxW); g.fillStyle = fill; g.fillText(t, x, y, maxW);
};
/** the winning gold sticker, 256 x 192 */
export const fxSticker = (p: Pen) => {
  const g = p.g;
  g.lineJoin = "round"; g.fillStyle = INK; roundRect(g, 8, 8, 240, 176, 22); g.fill();
  const gr = g.createLinearGradient(0, 16, 0, 176); gr.addColorStop(0, "#ffe68a"); gr.addColorStop(0.5, "#f2bf3a"); gr.addColorStop(1, "#d8932a");
  g.fillStyle = gr; roundRect(g, 18, 18, 220, 156, 16); g.fill();
  g.fillStyle = "#c8323c"; g.fillRect(18, 34, 220, 30);
  outlineText(g, "WINNER", 128, 50, 26, "#fff6e0", 6);
  outlineText(g, "$1,000,000", 128, 112, 40, "#fff8e6", 9, 210);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(30, 150); g.lineTo(70, 70); g.lineTo(84, 70); g.lineTo(44, 150); g.closePath(); g.fill();
  g.fillStyle = "#7a4a1a"; g.font = "700 15px Arial"; g.textAlign = "center"; g.fillText("PEEL HERE", 128, 156);
};
export const fxGlow = (p: Pen, rgb = "255,214,120", a = 0.9) => {
  const g = p.g, w = g.canvas.width, h = g.canvas.height, gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) / 2);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.35, `rgba(${rgb},${a * 0.45})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
};
/** manila security envelope, 256 x 192; open = flap up, sealed = red wax seal + TAMPER-PROOF tape */
export const fxEnvelope = (p: Pen, open: boolean, seal: number, tape: number) => {
  const g = p.g; g.lineJoin = "round";
  if (open) { g.fillStyle = INK; g.beginPath(); g.moveTo(14, 70); g.lineTo(128, 6); g.lineTo(242, 70); g.closePath(); g.fill(); g.fillStyle = "#c99a58"; g.beginPath(); g.moveTo(26, 68); g.lineTo(128, 14); g.lineTo(230, 68); g.closePath(); g.fill(); }
  g.fillStyle = INK; roundRect(g, 10, 60, 236, 126, 10); g.fill();
  g.fillStyle = "#e0b46e"; roundRect(g, 18, 68, 220, 110, 6); g.fill();
  if (!open) { g.strokeStyle = "#9a6a30"; g.lineWidth = 5; g.beginPath(); g.moveTo(22, 72); g.lineTo(128, 132); g.lineTo(234, 72); g.stroke(); }
  g.fillStyle = "#7a4a1a"; g.font = "800 15px Arial"; g.textAlign = "left"; g.fillText("CONFIDENTIAL", 28, 168);
  if (tape > 0) { g.save(); g.globalAlpha = Math.min(1, tape); g.fillStyle = "#d8433a"; g.fillRect(18, 110, 220 * Math.min(1, tape), 22); g.fillStyle = "#fff6e0"; g.font = "900 14px Arial Black, Arial"; g.textAlign = "center"; g.fillText("TAMPER-PROOF  TAMPER-PROOF", 128, 126, 210); g.restore(); }
  if (seal > 0) { const s = seal; g.fillStyle = INK; g.beginPath(); g.arc(128, 122, 30 * s, 0, 7); g.fill(); g.fillStyle = "#b8222c"; g.beginPath(); g.arc(128, 122, 25 * s, 0, 7); g.fill(); g.fillStyle = "#e85a5a"; g.beginPath(); g.arc(120, 114, 8 * s, 0, 7); g.fill(); g.strokeStyle = "#7a1018"; g.lineWidth = 3; g.beginPath(); g.arc(128, 122, 15 * s, 0, 7); g.stroke(); }
};
/** metal briefcase (fallback while the character kit has no held prop), 256 x 192 */
export const fxBriefcase = (p: Pen) => {
  const g = p.g; g.lineJoin = "round";
  g.fillStyle = INK; roundRect(g, 84, 8, 88, 50, 16); g.fill(); g.fillStyle = "#6a7078"; roundRect(g, 98, 20, 60, 30, 8); g.fill(); g.clearRect(108, 28, 40, 30);
  g.fillStyle = INK; roundRect(g, 8, 44, 240, 144, 16); g.fill();
  const gr = g.createLinearGradient(0, 50, 0, 180); gr.addColorStop(0, "#e2e6ea"); gr.addColorStop(1, "#9aa2ac"); g.fillStyle = gr; roundRect(g, 16, 52, 224, 128, 10); g.fill();
  g.fillStyle = "#6a7280"; for (const y of [86, 120, 154]) g.fillRect(16, y, 224, 5);
  g.fillStyle = INK; g.fillRect(54, 52, 22, 26); g.fillRect(180, 52, 22, 26); g.fillStyle = "#e8c04a"; g.fillRect(58, 56, 14, 18); g.fillRect(184, 56, 14, 18);
};
/** old framed police photo + badge (flash on "cop"), 320 x 400 */
export const fxCopPhoto = (p: Pen) => {
  const g = p.g; g.lineJoin = "round";
  g.fillStyle = INK; g.fillRect(6, 6, 308, 388); g.fillStyle = "#8a5a32"; g.fillRect(14, 14, 292, 372); g.fillStyle = "#f1e6cc"; g.fillRect(34, 34, 252, 300);
  g.fillStyle = "#b9c3cc"; g.fillRect(44, 44, 232, 200);
  p.ell(160, 150, 62, 70, "#f3e3cf", 7); g.fillStyle = "#1f2a44"; g.beginPath(); g.moveTo(92, 120); g.lineTo(228, 120); g.lineTo(212, 80); g.lineTo(108, 80); g.closePath(); g.fill(); g.fillRect(84, 116, 152, 14);
  g.fillStyle = "#e8c04a"; g.beginPath(); g.arc(160, 100, 9, 0, 7); g.fill();
  p.dot(138, 156, 6); p.dot(182, 156, 6); g.fillStyle = "#8d8d95"; g.fillRect(140, 178, 40, 9);
  g.fillStyle = "#1f2a44"; g.fillRect(90, 214, 140, 30);
  outlineText(g, "POLICE", 160, 290, 52, "#2a3a66", 0);
  g.fillStyle = "#3a3440"; g.font = "700 22px Arial"; g.textAlign = "center"; g.fillText("CLASS OF '72", 160, 318);
  // badge
  const bx = 252, by = 330; g.fillStyle = INK; star(g, bx, by, 58, 32); g.fill(); g.fillStyle = "#f2c94a"; star(g, bx, by, 48, 26); g.fill(); g.fillStyle = "#c8902a"; g.beginPath(); g.arc(bx, by, 16, 0, 7); g.fill();
};
/** rubber stamp (handle + red pad), 128 x 192 */
export const fxStamp = (p: Pen) => {
  const g = p.g; g.lineJoin = "round";
  p.ell(64, 40, 30, 30, "#7a3a20", 6); g.fillStyle = INK; g.fillRect(52, 50, 24, 80); g.fillStyle = "#8a5a32"; g.fillRect(57, 50, 14, 80);
  g.fillStyle = INK; roundRect(g, 16, 124, 96, 56, 8); g.fill(); g.fillStyle = "#c8323c"; roundRect(g, 22, 130, 84, 44, 5); g.fill();
};
export const fxPuff = (p: Pen, k: number) => {
  const g = p.g, w = g.canvas.width, h = g.canvas.height;
  for (let i = 0; i < 6; i++) { const x = w * (0.3 + 0.4 * Math.sin(i * 2.1 + k)), y = h * (0.35 + 0.3 * Math.cos(i * 1.7)), rr = w * 0.22; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(235,232,240,0.5)"); gr.addColorStop(1, "rgba(235,232,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
};
export const roundRect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
};
const star = (g: CanvasRenderingContext2D, x: number, y: number, R: number, r: number) => {
  g.beginPath(); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
};
