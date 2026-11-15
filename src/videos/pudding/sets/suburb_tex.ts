// SUBURB set: painted textures (flat colour fields, soft tone drift, thin dark seams) + effect-card painters.
import { ctex, U, W9, blot, SEAM, jit, Pen, INK, lam } from "../kit";

/** horizontal lap siding: 512 px tile = 2 m, 10 boards, light top lip, dark shadow seam under every board */
export const sidingTex = (col: string) => ctex("sid" + col, 512, 512, (g, r) => {
  const B = 51.2;
  for (let i = 0; i < 10; i++) {
    const y = i * B;
    g.fillStyle = jit(r, col, 0.025, 2, 0.05); g.fillRect(0, y, 512, B);
    const gr = g.createLinearGradient(0, y, 0, y + B);
    gr.addColorStop(0, "rgba(255,250,238,0.22)"); gr.addColorStop(0.25, "rgba(255,250,238,0.0)"); gr.addColorStop(1, "rgba(50,30,50,0.16)");
    g.fillStyle = gr; g.fillRect(0, y, 512, B);
    g.fillStyle = "rgba(42,22,30,0.62)"; g.fillRect(0, y + B - 4, 512, 4);
    for (let k = 0; k < 2; k++) if (r() < 0.6) { const x = U(r, 0, 512); g.fillStyle = "rgba(42,22,30,0.45)"; g.fillRect(x, y, 2.5, B - 4); }
  }
  for (let i = 0; i < 10; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 70, 170), light = r() > 0.5; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,250,232" : "90,60,70", light ? 0.12 : 0.1)); }
});
/** concrete slabs: 512 px = 1.5 m slab, dark joint grid, hairline cracks, speckle */
export const concreteTex = (col = "#d9cfbf") => ctex("conc" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 10; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 60, 160), light = r() > 0.5; W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "255,250,240" : "110,90,80", light ? 0.16 : 0.14)); }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "90,70,60" : "255,250,240"},${U(r, 0.08, 0.2)})`; g.fillRect(U(r, 0, 512), U(r, 0, 512), U(r, 1.5, 3), U(r, 1.5, 3)); }
  g.strokeStyle = "rgba(60,40,40,0.5)"; g.lineWidth = 2;
  for (let i = 0; i < 2; i++) { let x = U(r, 40, 470), y = U(r, 40, 470); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += U(r, -30, 30); y += U(r, -30, 30); g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = "rgba(52,34,34,0.75)"; g.fillRect(0, 0, 512, 5); g.fillRect(0, 0, 5, 512);
});
/** asphalt: 1024 px = 8 m, warm grey-violet, patch repairs, tar snakes */
export const asphaltTex = () => ctex("asph", 1024, 1024, (g, r) => {
  g.fillStyle = "#8d8590"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 22; i++) { const x = U(r, 0, 1024), y = U(r, 0, 1024), rad = U(r, 90, 260), light = r() > 0.5; W9(1024, 1024, x, y, rad, (a, b) => blot(g, a, b, rad, light ? "200,190,190" : "70,60,75", 0.16)); }
  for (let i = 0; i < 4; i++) { const x = U(r, 60, 900), y = U(r, 60, 900), w = U(r, 80, 200), h = U(r, 60, 160); g.fillStyle = "rgba(70,62,76,0.35)"; g.fillRect(x, y, w, h); g.strokeStyle = "rgba(40,30,40,0.5)"; g.lineWidth = 3; g.strokeRect(x, y, w, h); }
  g.strokeStyle = "rgba(38,30,40,0.55)"; g.lineWidth = 4; g.lineCap = "round";
  for (let i = 0; i < 7; i++) { let x = U(r, 0, 1024), y = U(r, 0, 1024); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += U(r, -40, 40); y += U(r, 10, 50); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "60,52,62" : "220,212,210"},${U(r, 0.1, 0.25)})`; g.fillRect(U(r, 0, 1024), U(r, 0, 1024), U(r, 2, 4), U(r, 2, 4)); }
});
/** sectional garage door: 4 x 4 raised panels */
export const garageTex = (col: string) => ctex("gar" + col, 512, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 4; row++) for (let c = 0; c < 4; c++) {
    const x = 14 + c * 122, y = 10 + row * 61, w = 108, h = 46;
    if (row === 0 && r() < 2) { g.fillStyle = "#6f80b0"; g.fillRect(x + 8, y + 8, w - 16, h - 16); g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(x + 14, y + 10, 10, h - 20); }
    else { g.fillStyle = "rgba(255,255,250,0.35)"; g.fillRect(x, y, w, 4); g.fillRect(x, y, 4, h); g.fillStyle = "rgba(40,30,40,0.35)"; g.fillRect(x, y + h - 4, w, 4); g.fillRect(x + w - 4, y, 4, h); }
  }
  for (let row = 1; row < 4; row++) { g.fillStyle = "rgba(42,26,30,0.7)"; g.fillRect(0, row * 61 + 3, 512, 3); }
  g.strokeStyle = SEAM; g.lineWidth = 8; g.strokeRect(0, 0, 512, 256);
});
/** six-panel front door with knob and a small light */
export const doorTex = (col: string) => ctex("door" + col, 256, 512, (g) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 512);
  for (const [x, y, w, h] of [[28, 30, 88, 90], [140, 30, 88, 90], [28, 150, 88, 150], [140, 150, 88, 150], [28, 330, 88, 150], [140, 330, 88, 150]]) {
    g.fillStyle = "rgba(255,250,240,0.25)"; g.fillRect(x, y, w, 5); g.fillRect(x, y, 5, h);
    g.fillStyle = "rgba(30,20,30,0.4)"; g.fillRect(x, y + h - 5, w, 5); g.fillRect(x + w - 5, y, 5, h);
  }
  g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(215, 280, 12, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.strokeStyle = SEAM; g.lineWidth = 10; g.strokeRect(0, 0, 256, 512);
});
/** double-hung window: white trim, mid blue-violet glass with two glints, colonial grid, optional curtains */
export const windowTex = (curtain: string | null, warm = false) => ctex("win" + curtain + warm, 256, 384, (g) => {
  g.fillStyle = "#f4efe4"; g.fillRect(0, 0, 256, 384);
  const gr = g.createLinearGradient(0, 0, 256, 384);
  gr.addColorStop(0, warm ? "#ffd89a" : "#9fb2dc"); gr.addColorStop(1, warm ? "#e8a868" : "#6476ad");
  g.fillStyle = gr; g.fillRect(22, 22, 212, 340);
  if (curtain) { g.fillStyle = curtain; g.fillRect(22, 22, 52, 340); g.fillRect(182, 22, 52, 340); g.fillStyle = "rgba(40,20,30,0.3)"; for (const x of [40, 58, 198, 216]) g.fillRect(x, 22, 4, 340); }
  g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.moveTo(80, 22); g.lineTo(130, 22); g.lineTo(60, 190); g.lineTo(22, 190); g.lineTo(22, 160); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.moveTo(150, 200); g.lineTo(175, 200); g.lineTo(120, 362); g.lineTo(95, 362); g.closePath(); g.fill();
  g.fillStyle = "#f4efe4"; g.fillRect(0, 182, 256, 20); g.fillRect(122, 0, 12, 384); g.fillRect(0, 100, 256, 8); g.fillRect(0, 280, 256, 8);
  g.strokeStyle = "rgba(42,26,30,0.8)"; g.lineWidth = 4; g.strokeRect(22, 22, 212, 340); g.lineWidth = 8; g.strokeRect(0, 0, 256, 384);
});
/** louvred shutter */
export const louvreTex = (col: string) => ctex("louv" + col, 128, 384, (g) => {
  g.fillStyle = col; g.fillRect(0, 0, 128, 384);
  for (let y = 20; y < 364; y += 16) { g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(14, y, 100, 5); g.fillStyle = "rgba(20,10,20,0.4)"; g.fillRect(14, y + 10, 100, 4); }
  g.strokeStyle = "rgba(20,10,20,0.75)"; g.lineWidth = 8; g.strokeRect(4, 4, 120, 376); g.strokeRect(14, 14, 100, 356);
});
/** painted lettering panel (van logos, police doors, water tower, signs) */
export const textTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => ctex("txt" + key, w, h, draw);
export const TX = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => lam("txt" + key, () => ({ map: textTex(key, w, h, draw) }));
export const woodPanelTex = () => ctex("woodpanel", 512, 128, (g, r) => {
  g.fillStyle = "#9a6438"; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 30; i++) { g.strokeStyle = r() < 0.5 ? "rgba(60,30,10,0.35)" : "rgba(255,220,170,0.2)"; g.lineWidth = U(r, 1, 3); const y = U(r, 0, 128); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + U(r, -8, 8), 340, y + U(r, -8, 8), 512, y); g.stroke(); }
  g.strokeStyle = "#e8dcc0"; g.lineWidth = 10; g.strokeRect(5, 5, 502, 118);
});

// ---------------- effect cards (unlit: tint by the shot light) ----------------
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const tintOf = (base: string, tint: string) => { const a = hex(base), b = hex(tint); return "#" + a.map((v, i) => Math.round((v * b[i]) / 255).toString(16).padStart(2, "0")).join(""); };
/** giant presentation check, 768 x 360 canvas; hands = skin colour of the holder's hands at both ends (or null) */
export const checkCard = (p: Pen, payee: string, tint: string, hands: string | null, no = 1) => {
  const g = p.g, T = (c: string) => tintOf(c, tint);
  g.save();
  const x0 = 34, y0 = 26, w = 700, h = 300;
  g.fillStyle = T("#2a1a26"); g.fillRect(x0 - 8, y0 - 8, w + 16, h + 16);
  g.fillStyle = T("#fbf6e6"); g.fillRect(x0, y0, w, h);
  g.fillStyle = T("#d9ecd6"); for (let i = 0; i < 8; i++) g.fillRect(x0, y0 + 60 + i * 30, w, 12);
  g.fillStyle = T("#2f7a4a"); g.fillRect(x0, y0, w, 54);
  g.fillStyle = T("#f4c430"); g.font = "900 34px Arial Black, Arial"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("BIG BUN BURGERS  PRIZE GAME", x0 + 18, y0 + 28, 520);
  g.fillStyle = T("#fbf6e6"); g.font = "700 26px Arial"; g.textAlign = "right"; g.fillText("No. " + (1000 + no * 37), x0 + w - 18, y0 + 28);
  g.fillStyle = T("#3a3040"); g.font = "700 24px Arial"; g.textAlign = "left";
  g.fillText("PAY TO THE", x0 + 20, y0 + 92); g.fillText("ORDER OF", x0 + 20, y0 + 118);
  g.font = "italic 700 46px Georgia, serif"; g.fillStyle = T("#1d2a5a"); g.fillText(payee, x0 + 170, y0 + 108, 360);
  g.fillStyle = T("#3a3040"); g.fillRect(x0 + 160, y0 + 134, 380, 4);
  // amount box
  g.fillStyle = T("#fff2b0"); g.fillRect(x0 + 470, y0 + 150, 214, 70); g.strokeStyle = T("#2a1a26"); g.lineWidth = 5; g.strokeRect(x0 + 470, y0 + 150, 214, 70);
  g.fillStyle = T("#c0282e"); g.font = "900 44px Arial Black, Arial"; g.textAlign = "center"; g.fillText("$1,000,000", x0 + 577, y0 + 187, 200);
  g.fillStyle = T("#3a3040"); g.font = "900 30px Arial Black, Arial"; g.textAlign = "left"; g.fillText("ONE MILLION & 00/100", x0 + 20, y0 + 186, 430);
  g.fillRect(x0 + 20, y0 + 212, 430, 3);
  g.strokeStyle = T("#1d2a5a"); g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + 430, y0 + 270);
  for (let k = 0; k < 9; k++) g.lineTo(x0 + 440 + k * 26, y0 + 262 + (k % 2 ? -18 : 12)); g.stroke();
  g.fillStyle = T("#3a3040"); g.fillRect(x0 + 420, y0 + 284, 260, 3); g.font = "700 18px Arial"; g.fillText("MEMO  WINNER", x0 + 20, y0 + 280);
  g.restore();
  if (hands) for (const hx of [x0 + 4, x0 + w - 4]) { p.ell(hx, y0 + 200, 26, 32, T(hands), 6); p.stroke([[hx - 10, y0 + 186], [hx + 10, y0 + 186]], 3, INK); }
};
/** soft radial glow (police lights, sun flares) */
export const glow = (p: Pen, col: string, core = "#ffffff") => {
  const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, core); gr.addColorStop(0.18, col); gr.addColorStop(0.5, col + "66"); gr.addColorStop(1, col + "00");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
};
/** gold network thread (ground line), 512 x 32 */
export const thread = (p: Pen) => {
  const g = p.g, gr = g.createLinearGradient(0, 0, 0, 32);
  gr.addColorStop(0, "rgba(255,210,90,0)"); gr.addColorStop(0.35, "rgba(255,214,100,0.75)"); gr.addColorStop(0.5, "rgba(255,250,215,1)"); gr.addColorStop(0.65, "rgba(255,214,100,0.75)"); gr.addColorStop(1, "rgba(255,210,90,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 32);
};
/** shoulder TV camera seen from the side (facing right; card mirror via rot) */
export const tvCam = (p: Pen, dir: number) => {
  const g = p.g; g.save(); if (dir < 0) { g.translate(256, 0); g.scale(-1, 1); }
  p.poly([[40, 70], [170, 70], [170, 150], [40, 150]], "#3a3a44", 6);
  p.poly([[170, 88], [236, 76], [236, 144], [170, 132]], "#26262e", 6);
  p.ell(236, 110, 10, 34, "#7a8ac0", 5);
  p.poly([[60, 40], [140, 40], [140, 70], [60, 70]], "#26262e", 5);
  p.ell(54, 110, 16, 16, "#d8433a", 4);
  p.poly([[70, 150], [90, 150], [90, 190], [70, 190]], "#26262e", 4);
  g.restore();
};
/** handheld microphone with a TV flag */
export const micCard = (p: Pen) => {
  p.poly([[58, 70], [70, 70], [70, 240], [58, 240]], "#26262e", 4);
  p.poly([[40, 70], [88, 70], [88, 110], [40, 110]], "#f2c94a", 4);
  const g = p.g; g.fillStyle = INK; g.font = "900 26px Arial Black"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("8", 64, 91);
  p.ell(64, 50, 26, 28, "#4a4a55", 5);
};
/** boom pole with a fluffy windscreen at the right end, 1024 x 128 */
export const boomCard = (p: Pen, dir: number) => {
  const g0 = p.g; g0.save(); if (dir < 0) { g0.translate(1024, 0); g0.scale(-1, 1); }
  p.poly([[0, 58], [860, 58], [860, 70], [0, 70]], "#4a4a55", 4);
  p.ell(930, 64, 86, 40, "#8a8a92", 6);
  const g = p.g; g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 4; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(860 + i * 11, 34 + (i % 3) * 4); g.lineTo(866 + i * 11, 44 + (i % 3) * 4); g.stroke(); }
  g0.restore();
};
/** coiled earpiece wire (the wink) */
export const earCard = (p: Pen) => {
  p.ell(40, 26, 12, 14, "#d9dde6", 4);
  const g = p.g; g.strokeStyle = "#d9dde6"; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 40);
  for (let k = 0; k < 9; k++) g.arc(40 + (k % 2 ? 6 : -6), 48 + k * 9, 6, 0, Math.PI, k % 2 === 0); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
};
/** FBI badge peeking out of a pocket */
export const badgeCard = (p: Pen) => {
  const pts: [number, number][] = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 40 : 58; pts.push([64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr]); }
  p.poly(pts, "#f2c94a", 6); p.ell(64, 64, 26, 26, "#d9a83a", 4);
  const g = p.g; g.fillStyle = INK; g.font = "900 22px Arial Black"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("FBI", 64, 66);
};
