// DINER set helpers: painted textures, 1990s diner furniture, cars, signs and effect-card painters.
import * as THREE from "three";
import { Put, C, PL, WD, ctex, rep, lam, quad, V, U, blot, W9, SEAM, Pen, INK, tree, rng } from "../kit";
import { roofHD, grassHD } from "../paint";
import { NOINK } from "../ink";
import type { V3 } from "../core";

// ---------------- textures ----------------
/** checkered floor: 4 x 4 tiles of 0.45 m per 512 px (tile the box every 1.8 m) */
export const checkerTex = () => ctex("dinerChecker", 512, 512, (g, r) => {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    g.fillStyle = (i + j) % 2 ? "#e9dbbb" : "#4f7f7c"; g.fillRect(i * 128, j * 128, 128, 128);
    blot(g, i * 128 + 64, j * 128 + 64, 90, (i + j) % 2 ? "255,250,235" : "30,60,60", 0.12);
  }
  for (let i = 0; i < 10; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 60, 140); W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, "90,70,50", 0.1)); }
  g.fillStyle = "rgba(40,30,30,0.55)"; for (let i = 0; i <= 4; i++) { g.fillRect(i * 128 - 2, 0, 4, 512); g.fillRect(0, i * 128 - 2, 512, 4); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = "rgba(60,40,30,0.25)"; g.lineWidth = 2; const x = U(r, 0, 512), y = U(r, 0, 512); g.beginPath(); g.moveTo(x, y); g.lineTo(x + U(r, -30, 30), y + U(r, -8, 8)); g.stroke(); }
});
/** red tufted vinyl (vertical tuck seams), 256 px = 0.6 m */
export const vinylTex = (col: string) => ctex("vinyl" + col, 256, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 64) {
    const gr = g.createLinearGradient(x, 0, x + 64, 0); gr.addColorStop(0, "rgba(40,10,10,0.35)"); gr.addColorStop(0.25, "rgba(255,220,200,0.18)"); gr.addColorStop(0.6, "rgba(255,220,200,0.05)"); gr.addColorStop(1, "rgba(40,10,10,0.3)");
    g.fillStyle = gr; g.fillRect(x, 0, 64, 256); g.fillStyle = "rgba(40,10,15,0.7)"; g.fillRect(x - 2, 0, 4, 256);
  }
  for (let i = 0; i < 5; i++) blot(g, U(r, 0, 256), U(r, 0, 256), U(r, 30, 70), "255,230,210", 0.12);
});
/** counter front: red enamel panels with chrome strips, 512 px = 2 m */
export const counterTex = () => ctex("counterFront", 512, 256, (g, r) => {
  g.fillStyle = "#b8322f"; g.fillRect(0, 0, 512, 256);
  for (let x = 0; x < 512; x += 128) { blot(g, x + 64, 128, 110, "255,200,180", 0.12); g.fillStyle = "rgba(30,10,10,0.6)"; g.fillRect(x - 2, 0, 4, 256); }
  g.fillStyle = "#d9dde2"; g.fillRect(0, 96, 512, 20); g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(0, 98, 512, 5); g.fillStyle = "rgba(30,30,40,0.6)"; g.fillRect(0, 114, 512, 3);
  g.fillStyle = "#2a1c1c"; g.fillRect(0, 236, 512, 20);
  for (let i = 0; i < 4; i++) blot(g, U(r, 0, 512), U(r, 150, 236), U(r, 20, 50), "50,20,20", 0.2);
});
/** cream upper wall with soft drift; lower wainscot of small red/white tiles, 512 px = 2 m */
export const wainTex = () => ctex("wainscot", 512, 256, (g, r) => {
  for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? "#f2ead8" : "#c4423c"; g.fillRect(i * 32, j * 32, 32, 32); }
  g.fillStyle = "rgba(50,30,30,0.45)"; for (let i = 0; i <= 16; i++) g.fillRect(i * 32 - 1, 0, 2, 256); for (let j = 0; j <= 8; j++) g.fillRect(0, j * 32 - 1, 512, 2);
  for (let i = 0; i < 6; i++) blot(g, U(r, 0, 512), U(r, 0, 256), U(r, 50, 120), "90,60,40", 0.12);
});
export const steelTex = () => ctex("steel", 256, 256, (g, r) => {
  g.fillStyle = "#b9bfc6"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "60,70,80"},${U(r, 0.05, 0.15)})`; g.fillRect(U(r, 0, 256), 0, U(r, 1, 4), 256); }
  g.fillStyle = "rgba(40,45,55,0.6)"; g.fillRect(0, 0, 256, 3); g.fillRect(0, 0, 3, 256);
});
export const ceilTex = () => ctex("ceilTile", 256, 256, (g, r) => {
  g.fillStyle = "#f0e8d6"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(120,100,80,${U(r, 0.1, 0.25)})`; g.fillRect(U(r, 0, 256), U(r, 0, 256), 2, 2); }
  g.fillStyle = "#b8ad98"; g.fillRect(0, 0, 256, 6); g.fillRect(0, 0, 6, 256);
});
/** horizontal clapboard siding, 256 px = 1.5 m */
export const sidingTex = (col: string) => ctex("siding" + col, 256, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 21.33) { g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, y + 2, 256, 4); g.fillStyle = "rgba(40,30,40,0.35)"; g.fillRect(0, y + 18, 256, 3); }
  for (let i = 0; i < 4; i++) { const x = U(r, 0, 256), y = U(r, 0, 256), rad = U(r, 40, 90); W9(256, 256, x, y, rad, (a, b) => blot(g, a, b, rad, "90,70,60", 0.12)); }
});
/** stucco exterior with a drift */
export const stuccoTex = (col: string) => PL(col);
/** asphalt with painted stall lines; the texture covers the whole lot (w x d metres) */
export const lotTex = (w: number, d: number, lines: (g: CanvasRenderingContext2D, s: number) => void) => ctex("lot" + w + "x" + d, 2048, Math.round((2048 * d) / w), (g, r) => {
  const H = Math.round((2048 * d) / w), s = 2048 / w;
  g.fillStyle = "#6d6a72"; g.fillRect(0, 0, 2048, H);
  for (let i = 0; i < 70; i++) { const rad = U(r, 60, 220); blot(g, U(r, 0, 2048), U(r, 0, H), rad, r() > 0.5 ? "150,140,150" : "40,38,52", 0.18); }
  for (let i = 0; i < 26; i++) { const rad = U(r, 20, 60); blot(g, U(r, 0, 2048), U(r, 0, H), rad, "30,28,40", 0.35); } // oil stains
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "190,185,190" : "40,35,50"},${U(r, 0.1, 0.3)})`; g.fillRect(U(r, 0, 2048), U(r, 0, H), 2, 2); }
  g.strokeStyle = "rgba(30,25,35,0.6)"; g.lineWidth = 2;
  for (let i = 0; i < 22; i++) { let x = U(r, 0, 2048), y = U(r, 0, H); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += U(r, -30, 30); y += U(r, -30, 30); g.lineTo(x, y); } g.stroke(); }
  lines(g, s);
});
export const roadTex = () => ctex("dinerRoad", 1024, 256, (g, r) => {
  g.fillStyle = "#5f5c66"; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 30; i++) { const rad = U(r, 30, 90); W9(1024, 256, U(r, 0, 1024), U(r, 0, 256), rad, (a, b) => blot(g, a, b, rad, r() > 0.5 ? "150,140,150" : "35,32,45", 0.18)); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "190,185,190" : "40,35,50"},${U(r, 0.1, 0.3)})`; g.fillRect(U(r, 0, 1024), U(r, 0, 256), 2, 2); }
  g.fillStyle = "#e7b53a"; g.fillRect(0, 120, 1024, 6); g.fillRect(0, 132, 1024, 6);
  g.fillStyle = "#ece6d6"; g.fillRect(0, 10, 1024, 5); g.fillRect(0, 241, 1024, 5);
});
export const concreteTex = () => ctex("concrete", 256, 256, (g, r) => {
  g.fillStyle = "#c9c0b0"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) blot(g, U(r, 0, 256), U(r, 0, 256), U(r, 40, 90), r() > 0.5 ? "255,250,240" : "110,100,90", 0.15);
  g.fillStyle = "rgba(70,60,55,0.55)"; g.fillRect(0, 0, 256, 3); g.fillRect(0, 0, 3, 256);
});

// ---------------- signs / posters (canvas) ----------------
const txt = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, fill: string, stroke = INK, lw = 0, w?: number, weight = "900") => {
  g.font = `${weight} ${size}px Arial Black, Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.strokeText(s, x, y, w); }
  g.fillStyle = fill; g.fillText(s, x, y, w);
};
/** a cartoon burger in a canvas */
export const drawBurger = (p: Pen, cx: number, cy: number, s: number) => {
  p.ol = 5 * s;
  p.ell(cx, cy + 22 * s, 62 * s, 16 * s, "#e0a24a");
  p.ell(cx, cy + 8 * s, 66 * s, 12 * s, "#6a3a24");
  p.poly([[cx - 66 * s, cy], [cx - 40 * s, cy + 8 * s], [cx - 10 * s, cy - 2 * s], [cx + 22 * s, cy + 10 * s], [cx + 66 * s, cy]], "#7cc04a");
  p.ell(cx, cy - 4 * s, 64 * s, 8 * s, "#f2c43b");
  p.ell(cx, cy - 18 * s, 62 * s, 34 * s, "#eaa64e", undefined, 180, 360);
  for (let i = 0; i < 6; i++) p.ell(cx - 36 * s + i * 14 * s, cy - 32 * s - (i % 2) * 6 * s, 3 * s, 2 * s, "#fff4d8", 0);
};
export const drawFries = (p: Pen, cx: number, cy: number, s: number) => {
  p.ol = 5 * s;
  for (let i = 0; i < 7; i++) p.poly([[cx - 30 * s + i * 10 * s, cy], [cx - 26 * s + i * 10 * s, cy - (48 + (i % 3) * 10) * s], [cx - 20 * s + i * 10 * s, cy - (48 + (i % 3) * 10) * s], [cx - 22 * s + i * 10 * s, cy]], "#f6cf4a");
  p.poly([[cx - 36 * s, cy - 18 * s], [cx + 36 * s, cy - 18 * s], [cx + 28 * s, cy + 40 * s], [cx - 28 * s, cy + 40 * s]], "#d63a32");
  p.ell(cx, cy + 8 * s, 12 * s, 12 * s, "#f6cf4a", 3 * s);
};
export const drawCup = (p: Pen, cx: number, cy: number, s: number, gold = false) => {
  p.ol = 5 * s;
  p.poly([[cx - 34 * s, cy - 50 * s], [cx + 34 * s, cy - 50 * s], [cx + 26 * s, cy + 50 * s], [cx - 26 * s, cy + 50 * s]], "#f5efe2");
  p.poly([[cx - 32 * s, cy - 30 * s], [cx + 32 * s, cy - 30 * s], [cx + 30 * s, cy - 8 * s], [cx - 30 * s, cy - 8 * s]], "#d63a32", 0);
  p.poly([[cx - 38 * s, cy - 58 * s], [cx + 38 * s, cy - 58 * s], [cx + 36 * s, cy - 48 * s], [cx - 36 * s, cy - 48 * s]], "#e9e4da");
  p.line([[cx + 6 * s, cy - 56 * s], [cx + 16 * s, cy - 92 * s]], "#d63a32", 6 * s);
  if (gold) {
    p.poly([[cx - 18 * s, cy - 4 * s], [cx + 18 * s, cy - 4 * s], [cx + 17 * s, cy + 30 * s], [cx - 17 * s, cy + 30 * s]], "#ffd447", 4 * s);
    p.poly([[cx - 18 * s, cy - 4 * s], [cx + 18 * s, cy - 4 * s], [cx + 18 * s, cy + 4 * s], [cx - 18 * s, cy + 4 * s]], "#c8323c", 0);
  }
};
export const menuTex = () => ctex("menuBoard", 1536, 512, (g) => {
  g.fillStyle = "#2b2124"; g.fillRect(0, 0, 1536, 512);
  g.fillStyle = "#c8323c"; g.fillRect(0, 0, 1536, 86);
  txt(g, "BIG BUN  MENU", 768, 46, 62, "#ffd447", INK, 8);
  const p = new Pen(g), items: [string, string, number][] = [["BIG BUN", "$1.99", 0], ["DOUBLE BUN", "$2.49", 0], ["FRIES", "$0.89", 1], ["SODA", "$0.79", 2], ["SHAKE", "$1.29", 2], ["COMBO #1", "$3.49", 0]];
  items.forEach(([n, pr, k], i) => {
    const x = 128 + i * 256;
    g.fillStyle = "#3a2e30"; g.fillRect(x - 118, 104, 236, 392); g.strokeStyle = "#d9b25a"; g.lineWidth = 4; g.strokeRect(x - 118, 104, 236, 392);
    if (k === 0) drawBurger(p, x, 230, 1.35); else if (k === 1) drawFries(p, x, 225, 1.3); else drawCup(p, x, 230, 1.15);
    txt(g, n, x, 370, 40, "#f5efe2", INK, 0, 220); txt(g, pr, x, 440, 58, "#ffd447", INK, 0, 220);
  });
});
export const facadeSignTex = () => ctex("bigBunSign", 2048, 384, (g) => {
  g.fillStyle = "#c8323c"; g.fillRect(0, 0, 2048, 384);
  g.fillStyle = "#f2ead8"; g.fillRect(0, 300, 2048, 84); g.fillStyle = "#1c1418"; g.fillRect(0, 296, 2048, 8);
  txt(g, "BIG BUN BURGERS", 1024, 160, 190, "#ffd447", "#3a1418", 26, 1800);
  txt(g, "BURGERS  •  FRIES  •  SHAKES  •  OPEN 24 HRS", 1024, 342, 54, "#c8323c", INK, 0, 1800, "800");
  const p = new Pen(g); drawBurger(p, 110, 170, 1.0); drawBurger(p, 1938, 170, 1.0);
});
export const poleSignTex = () => ctex("bigBunPole", 1024, 800, (g) => {
  g.fillStyle = "#f2ead8"; g.fillRect(0, 0, 1024, 800);
  g.fillStyle = "#c8323c"; g.fillRect(24, 24, 976, 520); g.strokeStyle = "#1c1418"; g.lineWidth = 16; g.strokeRect(8, 8, 1008, 784);
  const p = new Pen(g); drawBurger(p, 512, 190, 2.4);
  txt(g, "BIG BUN", 512, 430, 170, "#ffd447", "#3a1418", 22, 920);
  txt(g, "COLLECT & WIN!", 512, 640, 96, "#c8323c", INK, 0, 940);
  txt(g, "GAME STICKERS ON EVERY CUP", 512, 735, 48, "#2b2124", INK, 0, 940, "800");
});
/** the promo game poster: a big gold sticker and the jackpot */
export const gamePosterTex = (k: number) => ctex("gamePoster" + k, 400, 560, (g) => {
  const bg = ["#c8323c", "#2f6fa8", "#e8a83a"][k % 3];
  g.fillStyle = bg; g.fillRect(0, 0, 400, 560);
  for (let i = 0; i < 16; i++) { g.fillStyle = "rgba(255,240,200,0.18)"; g.beginPath(); g.moveTo(200, 250); const a = (i / 16) * Math.PI * 2; g.lineTo(200 + Math.cos(a) * 400, 250 + Math.sin(a) * 400); g.lineTo(200 + Math.cos(a + 0.2) * 400, 250 + Math.sin(a + 0.2) * 400); g.fill(); }
  txt(g, k === 1 ? "PEEL" : "COLLECT", 200, 62, 62, "#ffffff", INK, 10, 370);
  txt(g, k === 1 ? "& WIN!" : "& WIN!", 200, 126, 62, "#ffd447", INK, 10, 370);
  const p = new Pen(g); p.ol = 8;
  p.poly([[110, 180], [290, 180], [290, 400], [110, 400]], "#ffd447");
  p.poly([[110, 180], [290, 180], [290, 225], [110, 225]], "#c8323c", 0);
  txt(g, "$1,000,000", 200, 315, 40, "#3a1418", INK, 0, 170);
  txt(g, k === 2 ? "INSTANT PRIZES!" : "1 IN EVERY CUP!", 200, 470, 40, "#ffffff", INK, 7, 370);
  g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, 390, 550);
});
export const promoTex = () => ctex("promoPoster", 400, 560, (g) => {
  g.fillStyle = "#f2c43b"; g.fillRect(0, 0, 400, 560);
  txt(g, "NEW!", 200, 70, 80, "#c8323c", INK, 10);
  const p = new Pen(g); drawBurger(p, 200, 260, 2.2);
  txt(g, "DOUBLE BUN", 200, 420, 54, "#3a1418", INK, 0, 370); txt(g, "ONLY $2.49", 200, 490, 46, "#c8323c", INK, 0, 370);
  g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, 390, 550);
});

// ---------------- effect painters ----------------
/** peel-off game sticker on a 256 x 320 canvas: gold winner or white TRY AGAIN */
export const fxSticker = (p: Pen, gold: boolean, peel = 0) => {
  const g = p.g; p.ol = 9;
  if (gold) { const gr = g.createLinearGradient(0, 0, 256, 320); gr.addColorStop(0, "#fff2a0"); gr.addColorStop(0.45, "#ffd447"); gr.addColorStop(1, "#e0a020"); p.poly([[28, 28], [228, 28], [228, 292], [28, 292]], null, 0); g.fillStyle = gr; g.fill(); p.poly([[28, 28], [228, 28], [228, 292], [28, 292]], null); }
  else p.poly([[28, 28], [228, 28], [228, 292], [28, 292]], "#f8f4ea");
  p.poly([[28, 28], [228, 28], [228, 84], [28, 84]], gold ? "#c8323c" : "#3f7fc4");
  if (gold) { txt(g, "WINNER", 128, 140, 40, "#3a1418", INK, 0, 190); txt(g, "$1,000,000", 128, 210, 42, "#3a1418", INK, 0, 196); txt(g, "★ ★ ★", 128, 262, 30, "#c8323c", INK, 0, 190); }
  else { txt(g, "TRY", 128, 150, 58, "#3a3440", INK, 0, 190); txt(g, "AGAIN", 128, 220, 54, "#3a3440", INK, 0, 196); txt(g, "sorry!", 128, 268, 26, "#7a7480", INK, 0, 190, "700"); }
  if (peel > 0) { const k = 60 * peel; p.poly([[228 - k, 292], [228, 292 - k], [228 - k * 0.7, 292 - k * 0.7]], "#e9e4da", 6); }
};
export const fxDollar = (p: Pen) => {
  p.ol = 10; p.ell(128, 128, 104, 104, "#5fb04a"); p.ell(128, 128, 80, 80, null, 5);
  txt(p.g, "$", 128, 136, 150, "#f5f0dc", INK, 12);
};
export const fxCupCard = (p: Pen) => drawCup(p, 128, 150, 1.6, true);
export const fxSadCloud = (p: Pen, t: number) => {
  p.ol = 9;
  for (const [x, y, rr] of [[90, 110, 52], [150, 90, 62], [205, 118, 46], [130, 130, 50]] as const) p.ell(x, y, rr, rr * 0.86, "#9aa0b4");
  p.ell(150, 140, 100, 30, "#9aa0b4", 0);
  for (let i = 0; i < 4; i++) { const y = 190 + ((t * 120 + i * 37) % 90); p.poly([[70 + i * 40, y], [76 + i * 40, y + 22], [64 + i * 40, y + 22]], "#7fb6e8", 5); }
};
export const fxBang = (p: Pen, t: number) => { // cheer burst lines
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2, r0 = 70 + 20 * t, r1 = 110 + 40 * t; p.line([[128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0], [128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1]], "#ffd447", 12); }
};
export const fxWink = (p: Pen) => { txt(p.g, "✦", 64, 70, 90, "#ffe9a0", INK, 8); };
export const fxGlow = (p: Pen) => { const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,230,140,0.95)"); gr.addColorStop(0.4, "rgba(255,200,90,0.45)"); gr.addColorStop(1, "rgba(255,180,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); };

// ---------------- unlit picture planes (signs, posters, menu) ----------------
export const plane = (root: THREE.Object3D, M: THREE.Matrix4, tex: THREE.Texture, w: number, h: number, pos: V3, ry = 0, tint = 0xeeeeee, ink = false) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: tint }));
  m.position.set(...pos); m.rotation.y = ry; m.applyMatrix4(M); if (!ink) m.layers.set(NOINK); root.add(m); return m;
};
/** additive light (sun shafts / floor patches / lamp glow) */
export const glowPlane = (root: THREE.Object3D, M: THREE.Matrix4, w: number, h: number, pos: V3, rot: [number, number, number], col: string, op: number, fade: "v" | "none" = "v") => {
  const tex = ctex("shaft" + fade, 64, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(fade === "v" ? 1 : 0.999, fade === "v" ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); const hx = g.createLinearGradient(0, 0, 64, 0); hx.addColorStop(0, "rgba(0,0,0,1)"); hx.addColorStop(0.2, "rgba(0,0,0,0)"); hx.addColorStop(0.8, "rgba(0,0,0,0)"); hx.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = hx; g.fillRect(0, 0, 64, 256); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(col), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.position.set(...pos); m.rotation.set(...rot); m.applyMatrix4(M); m.layers.set(NOINK); root.add(m); return m;
};
export const emissive = (root: THREE.Object3D, M: THREE.Matrix4, geo: THREE.BufferGeometry, k: [number, number, number]) => {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(...k) })); m.applyMatrix4(M); root.add(m); return m;
};

// ---------------- props ----------------
const CHROME = "#c9ced6";
export const cup3 = (P: Put, x: number, y: number, z: number, s = 1, col = "#d63a32") => {
  P.geo(new THREE.CylinderGeometry(0.05 * s, 0.038 * s, 0.17 * s, 10).translate(x, y + 0.085 * s, z), C("#f5efe2"));
  P.geo(new THREE.CylinderGeometry(0.0505 * s, 0.047 * s, 0.05 * s, 10).translate(x, y + 0.11 * s, z), C(col));
  P.geo(new THREE.CylinderGeometry(0.054 * s, 0.054 * s, 0.015 * s, 10).translate(x, y + 0.177 * s, z), C("#e9e4da"));
  P.rod(C(col), [x + 0.01, y + 0.18 * s, z], [x + 0.03, y + 0.29 * s, z + 0.01], 0.006);
};
export const fries3 = (P: Put, x: number, y: number, z: number, r: () => number) => {
  P.geo(new THREE.CylinderGeometry(0.055, 0.04, 0.12, 4).rotateY(Math.PI / 4).translate(x, y + 0.06, z), C("#d63a32"));
  for (let i = 0; i < 7; i++) P.box(C("#f6cf4a"), x - 0.035 + i * 0.011, x - 0.027 + i * 0.011, y + 0.08, y + 0.15 + 0.03 * r(), z - 0.01 + 0.015 * Math.sin(i * 2), z + 0.0 + 0.015 * Math.sin(i * 2));
};
export const burger3 = (P: Put, x: number, y: number, z: number) => {
  P.geo(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12).translate(x, y + 0.015, z), C("#e0a24a"));
  P.geo(new THREE.CylinderGeometry(0.064, 0.064, 0.02, 12).translate(x, y + 0.04, z), C("#6a3a24"));
  P.geo(new THREE.CylinderGeometry(0.066, 0.066, 0.008, 12).translate(x, y + 0.054, z), C("#7cc04a"));
  P.geo(new THREE.SphereGeometry(0.062, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1).translate(x, y + 0.058, z), C("#eaa64e"));
};
/** a lunch tray with a cup, fries and a burger (or wrapper) */
export const tray = (P: Put, x: number, y: number, z: number, r: () => number, rot = 0) => {
  const Q = P.at(x, z, rot, y);
  Q.box(C("#a0603a"), -0.22, 0.22, 0, 0.02, -0.16, 0.16);
  Q.box(C("#f2ead8"), -0.18, 0.04, 0.02, 0.024, -0.13, 0.13);
  cup3(Q, 0.12, 0.02, -0.06, 1, r() > 0.5 ? "#d63a32" : "#2f6fa8");
  fries3(Q, -0.1, 0.02, 0.06, r);
  if (r() > 0.4) burger3(Q, -0.06, 0.024, -0.06); else Q.box(C("#f2c43b"), -0.12, 0.0, 0.024, 0.034, -0.12, -0.02);
};
export const napkins = (P: Put, x: number, y: number, z: number) => {
  P.box(C(CHROME), x - 0.07, x + 0.07, y, y + 0.14, z - 0.05, z + 0.05);
  P.box(C("#f8f4ea"), x - 0.05, x + 0.05, y + 0.02, y + 0.13, z + 0.05, z + 0.052);
  P.geo(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8).translate(x + 0.12, y + 0.06, z), C("#d63a32")); // ketchup
  P.geo(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8).translate(x + 0.18, y + 0.06, z), C("#f2c43b")); // mustard
};
/** booth: table against the window, two benches (x = c +- 0.5..1.05), z from z0 (aisle end) to z1 (wall) */
export const booth = (P: Put, cx: number, z0: number, z1: number, vin: string) => {
  const v = lam("vin" + vin, () => ({ map: vinylTex(vin) }));
  for (const s of [-1, 1]) {
    const xa = cx + s * 0.5, xb = cx + s * 1.05, lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    P.box(C("#5a2a26"), lo, hi, 0, 0.36, z0, z1);
    P.box(v, lo, hi, 0.36, 0.48, z0, z1, 0.6);
    const bl = s > 0 ? hi - 0.18 : lo, bh = s > 0 ? hi : lo + 0.18;
    P.box(v, bl, bh, 0.48, 1.25, z0, z1, 0.6);
    P.box(C(CHROME), bl - 0.01, bh + 0.01, 1.25, 1.29, z0 - 0.01, z1);
    P.box(C(CHROME), lo, hi, 0.45, 0.48, z0 - 0.02, z0);
  }
  P.box(C("#e8dcc0"), cx - 0.45, cx + 0.45, 0.72, 0.76, z0 + 0.05, z1);
  P.box(C(CHROME), cx - 0.46, cx + 0.46, 0.7, 0.72, z0 + 0.04, z1);
  P.geo(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8).translate(cx, 0.35, (z0 + z1) / 2), C(CHROME));
  P.geo(new THREE.CylinderGeometry(0.22, 0.25, 0.03, 12).translate(cx, 0.015, (z0 + z1) / 2), C("#5a5e66"));
};
export const stool = (P: Put, x: number, z: number) => {
  P.geo(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 8).translate(x, 0.36, z), C(CHROME));
  P.geo(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 14).translate(x, 0.02, z), C("#5a5e66"));
  P.geo(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16).translate(x, 0.77, z), C("#c23b35"));
  P.geo(new THREE.CylinderGeometry(0.205, 0.205, 0.03, 16).translate(x, 0.72, z), C(CHROME));
};
export const table4 = (P: Put, x: number, z: number, r: () => number, food = true) => {
  P.box(C("#e8dcc0"), x - 0.42, x + 0.42, 0.72, 0.76, z - 0.42, z + 0.42);
  P.box(C(CHROME), x - 0.43, x + 0.43, 0.7, 0.72, z - 0.43, z + 0.43);
  P.geo(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8).translate(x, 0.35, z), C(CHROME));
  P.geo(new THREE.CylinderGeometry(0.22, 0.25, 0.03, 12).translate(x, 0.015, z), C("#5a5e66"));
  for (const [dx, dz, ry] of [[-0.62, 0, 0], [0.62, 0, Math.PI]] as const) {
    const Q = P.at(x + dx, z + dz, ry);
    Q.box(C("#c23b35"), -0.2, 0.2, 0.44, 0.52, -0.2, 0.2);
    Q.box(C("#c23b35"), -0.24, -0.18, 0.52, 0.95, -0.2, 0.2);
    for (const a of [-0.17, 0.17]) for (const b of [-0.17, 0.17]) Q.rod(C(CHROME), [a, 0, b], [a, 0.44, b], 0.015);
  }
  if (food) { tray(P, x - 0.12, 0.76, z + 0.05, r, 0.3); napkins(P, x + 0.18, 0.76, z - 0.3); }
};
export const lampPost = (P: Put, x: number, z: number, h = 7.5) => {
  P.geo(new THREE.CylinderGeometry(0.09, 0.13, h, 8).translate(x, h / 2, z), C("#4a4e58"));
  P.geo(new THREE.CylinderGeometry(0.3, 0.35, 0.5, 8).translate(x, 0.25, z), C("#b8b0a0"));
  P.box(C("#4a4e58"), x - 0.08, x + 1.2, h - 0.12, h, z - 0.06, z + 0.06);
  P.box(C("#3a3e48"), x + 0.7, x + 1.5, h - 0.28, h - 0.08, z - 0.25, z + 0.25);
  P.box(C("#f4ecd0"), x + 0.75, x + 1.45, h - 0.3, h - 0.28, z - 0.2, z + 0.2);
};
export const shrub = (P: Put, r: () => number, x: number, z: number, s = 1) => {
  for (let i = 0; i < 4; i++) P.geo(new THREE.SphereGeometry(U(r, 0.35, 0.55) * s, 12, 9).scale(1, 0.8, 1).translate(x + U(r, -0.4, 0.4) * s, 0.35 * s + U(r, 0, 0.2) * s, z + U(r, -0.3, 0.3) * s), C(["#4f9a3a", "#3f8a35", "#62ad44"][i % 3]));
};

// ---------------- 1990s cars (extruded side profiles), length along local x (front +x) ----------------
export type CarKind = "sedan" | "wagon" | "pickup" | "hatch";
const PROFILE: Record<CarKind, { body: [number, number][]; win: [number, number][]; L: number }> = {
  sedan: { L: 4.8, body: [[-2.4, 0.3], [2.4, 0.3], [2.45, 0.6], [2.35, 0.85], [1.25, 0.95], [0.5, 1.38], [-0.85, 1.4], [-1.45, 0.98], [-2.38, 0.92], [-2.48, 0.62]],
    win: [[1.18, 0.98], [0.47, 1.34], [-0.82, 1.36], [-1.38, 1.0]] },
  wagon: { L: 5.0, body: [[-2.5, 0.3], [2.5, 0.3], [2.55, 0.6], [2.45, 0.86], [1.35, 0.96], [0.6, 1.42], [-2.4, 1.44], [-2.52, 0.98], [-2.58, 0.62]],
    win: [[1.28, 0.99], [0.57, 1.38], [-2.36, 1.4], [-2.44, 1.0]] },
  hatch: { L: 4.1, body: [[-2.0, 0.3], [2.05, 0.3], [2.1, 0.6], [2.0, 0.82], [1.0, 0.92], [0.3, 1.34], [-1.7, 1.36], [-2.02, 0.95], [-2.08, 0.6]],
    win: [[0.94, 0.95], [0.27, 1.3], [-1.66, 1.32], [-1.94, 0.98]] },
  pickup: { L: 5.2, body: [[-2.6, 0.35], [2.6, 0.35], [2.65, 0.66], [2.55, 0.98], [1.45, 1.05], [0.95, 1.6], [-0.15, 1.62], [-0.25, 1.05], [-2.55, 1.05], [-2.65, 0.66]],
    win: [[1.38, 1.08], [0.92, 1.56], [-0.11, 1.58], [-0.18, 1.08]] },
};
const extrude = (pts: [number, number][], w: number) => {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 1 }).translate(0, 0, -w / 2);
};
/** a parked car; `trunk` opens the trunk lid (sedans) */
export const car = (P: Put, x: number, z: number, rot: number, col: string, kind: CarKind, trunk = false) => {
  const Q = P.at(x, z, rot), pr = PROFILE[kind], w = 1.78, body = C(col), glass = C("#33405e"), blk = C("#1d1b22"), chrome = C(CHROME);
  if (trunk && kind === "sedan") {
    // body without the rear deck: cut the profile at the rear wheel, add the trunk well and the raised lid
    const pts = pr.body.map(([a, b]) => [a, b] as [number, number]);
    Q.geo(extrude(pts.map(([a, b]) => [a, a < -1.45 ? Math.min(b, 0.62) : b] as [number, number]), w), body);
    Q.box(C("#2a2230"), -2.36, -1.5, 0.6, 0.8, -0.8, 0.8);
    Q.box(body, -2.48, -2.3, 0.3, 0.92, -0.89, 0.89); Q.box(body, -2.4, -1.45, 0.3, 0.92, 0.79, 0.89); Q.box(body, -2.4, -1.45, 0.3, 0.92, -0.89, -0.79);
    const lid = new THREE.BoxGeometry(0.95, 0.05, 1.7).translate(-0.47, 0, 0).rotateZ(-1.15).translate(-1.45, 0.98, 0);
    Q.geo(lid, body);
    // cardboard boxes of stickers in the trunk
    Q.box(C("#c9a06a"), -2.2, -1.75, 0.8, 1.02, -0.6, -0.1); Q.box(C("#d8b47e"), -2.1, -1.7, 0.8, 0.98, 0.05, 0.55);
    Q.box(C("#f2ead8"), -2.15, -1.8, 1.02, 1.03, -0.55, -0.15);
  } else Q.geo(extrude(pr.body, w), body);
  if (kind === "pickup") Q.box(C("#2a2230"), -2.5, -0.3, 0.75, 1.06, -0.8, 0.8);
  Q.geo(extrude(pr.win, w + 0.02), glass);
  Q.box(C("#d9d4c8"), -0.05, 0.05, 0.38, 0.95, -w / 2 - 0.012, w / 2 + 0.012); // door seam / pillar
  for (const s of [-1, 1]) {
    Q.box(chrome, -pr.L / 2 + 0.3, pr.L / 2 - 0.3, 0.55, 0.6, s * (w / 2) - 0.01, s * (w / 2) + 0.01); // side moulding
    for (const xw of [pr.L / 2 - 0.85, -pr.L / 2 + 0.85]) {
      Q.geo(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 16).rotateX(Math.PI / 2).translate(xw, 0.33, s * (w / 2 - 0.08)), blk);
      Q.geo(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 12).rotateX(Math.PI / 2).translate(xw, 0.33, s * (w / 2 + 0.05)), chrome);
    }
    Q.box(C("#f4ecd0"), pr.L / 2 - 0.02, pr.L / 2 + 0.03, 0.62, 0.78, s * 0.55 - 0.22, s * 0.55 + 0.22);   // headlights
    Q.box(C("#c8323c"), -pr.L / 2 - 0.05, -pr.L / 2 + 0.02, 0.62, 0.8, s * 0.6 - 0.2, s * 0.6 + 0.2);       // tail lights
  }
  Q.box(chrome, pr.L / 2 - 0.05, pr.L / 2 + 0.1, 0.3, 0.48, -w / 2, w / 2);
  Q.box(chrome, -pr.L / 2 - 0.1, -pr.L / 2 + 0.05, 0.3, 0.48, -w / 2, w / 2);
  Q.box(C("#2a2a30"), pr.L / 2 + 0.02, pr.L / 2 + 0.06, 0.62, 0.8, -0.3, 0.3); // grille
};

// ---------------- suburban house across the road (front faces local +z) ----------------
export const house = (P: Put, r: () => number, x: number, z: number, rot: number, wall: string, roofc: string) => {
  const Q = P.at(x, z, rot), w = U(r, 8, 11), d = 8, h = 3.0, sid = lam("sid" + wall, () => ({ map: sidingTex(wall) })), trim = C("#f4efe4");
  Q.box(sid, -w / 2, w / 2, 0, h, -d, 0, 1.5);
  const rf = lam("rf" + roofc, () => ({ map: roofHD(roofc) }));
  Q.slab(rf, -w / 2 - 0.4, w / 2 + 0.4, 0.5, h - 0.3, -d / 2, h + 2.2, 0.12, 2);
  Q.slab(rf, w / 2 + 0.4, -w / 2 - 0.4, -d - 0.5, h - 0.3, -d / 2, h + 2.2, 0.12, 2);
  Q.box(sid, -w / 2, w / 2, h, h + 2.15, -d / 2 - 0.02, -d / 2 + 0.02); // gable fill (hidden mostly)
  // windows + door + garage
  for (const wx of [-w / 2 + 1.6, -w / 2 + 3.4]) { Q.box(trim, wx - 0.6, wx + 0.6, 0.9, 2.3, 0, 0.06); Q.box(C("#3a4a6a"), wx - 0.5, wx + 0.5, 1.0, 2.2, 0, 0.07); Q.box(C("#5a7a5a"), wx - 0.85, wx - 0.62, 0.9, 2.3, 0, 0.08); Q.box(C("#5a7a5a"), wx + 0.62, wx + 0.85, 0.9, 2.3, 0, 0.08); }
  Q.box(trim, -0.15, 0.95, 0, 2.3, 0, 0.06); Q.box(C("#8a3a2e"), -0.05, 0.85, 0, 2.2, 0, 0.08);
  Q.box(C("#e8e0d0"), w / 2 - 3.2, w / 2 - 0.4, 0, 2.3, 0, 0.08);
  for (let k = 1; k < 4; k++) Q.box(C("#c8c0b0"), w / 2 - 3.2, w / 2 - 0.4, k * 0.57 - 0.02, k * 0.57 + 0.02, 0, 0.09);
  Q.box(C("#b0a898"), w / 2 - 3.4, w / 2 - 0.2, -0.01, 0.02, 0, 6); // driveway
  Q.box(C("#e9e2d2"), -0.2, 1.0, 0, 0.18, 0, 0.6);
  shrub(Q, r, -w / 2 + 2.5, 0.8, 0.8);
  // mailbox
  Q.rod(C("#6a4a33"), [1.6, 0, 6], [1.6, 1.0, 6], 0.04); Q.box(C("#2a3a5a"), 1.45, 1.75, 1.0, 1.22, 5.75, 6.25);
};
export { tree, rng, grassHD, roofHD, rep, lam, quad, V, U, SEAM, WD };
