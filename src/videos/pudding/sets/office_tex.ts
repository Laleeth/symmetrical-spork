// Painted textures for the OFFICE set (FBI field office 2000 + courtroom). Flat colour fields, soft tone drift,
// thin dark seams (same recipe as kit.ts). Text is always drawn un-mirrored on quads facing the camera side.
import { ctex, jit } from "../paint";
import { U, W9, blot, SEAM } from "../kit";

/** office carpet tiles, 512 px = 2 m (0.5 m tiles), muted blue-grey with darker seams */
export const carpetTex = (col: string) => ctex("ofCarpet" + col, 512, 512, (g, r) => {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = jit(r, col, 0.05, 3, 0.08); g.fillRect(i * 128, j * 128, 128, 128); }
  for (let i = 0; i < 10; i++) { const x = U(r, 0, 512), y = U(r, 0, 512), rad = U(r, 60, 160); W9(512, 512, x, y, rad, (a, b) => blot(g, a, b, rad, r() > 0.5 ? "255,245,225" : "30,25,40", 0.08)); }
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "20,20,35" : "235,230,220"},${U(r, 0.06, 0.16)})`; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
  g.fillStyle = "rgba(25,20,30,0.45)"; for (let i = 0; i <= 4; i++) { g.fillRect(i * 128 - 1.5, 0, 3, 512); g.fillRect(0, i * 128 - 1.5, 512, 3); }
});
/** drop ceiling, 256 px = 1.2 m (0.6 m tiles), off-white with grey T-bars and pinholes */
export const ceilTex = () => ctex("ofCeil", 256, 256, (g, r) => {
  g.fillStyle = "#e9e2d2"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(90,80,70,${U(r, 0.1, 0.25)})`; g.fillRect(U(r, 0, 256), U(r, 0, 256), 1.5, 1.5); }
  for (let i = 0; i < 3; i++) blot(g, U(r, 0, 256), U(r, 0, 256), 60, "160,130,90", 0.12);
  g.fillStyle = "#8f8a84"; for (const k of [0, 128, 256]) { g.fillRect(k - 4, 0, 8, 256); g.fillRect(0, k - 4, 256, 8); }
  g.fillStyle = "rgba(30,25,25,0.5)"; for (const k of [0, 128, 256]) { g.fillRect(k + 3, 0, 1.5, 256); g.fillRect(0, k + 3, 256, 1.5); }
});
/** raised wood panelling (wainscot / courtroom walls), 512 px = 1.2 m wide x 1.2 m tall: frame + 2 raised panels */
export const panelTex = (col: string) => ctex("ofPanel" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  const grain = (x0: number, y0: number, w: number, h: number) => {
    for (let k = 0; k < w / 9; k++) { g.strokeStyle = r() < 0.3 ? "rgba(255,225,180,0.16)" : "rgba(50,22,8,0.22)"; g.lineWidth = U(r, 1, 2.5); const x = x0 + U(r, 4, w - 4); g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + U(r, -8, 8), y0 + h / 3, x + U(r, -8, 8), y0 + (2 * h) / 3, x + U(r, -5, 5), y0 + h); g.stroke(); }
  };
  grain(0, 0, 512, 512);
  for (const x0 of [40, 276]) {
    const w = 196, y0 = 40, h = 432;
    g.fillStyle = jit(r, col, 0.07, 2, 0.08); g.fillRect(x0, y0, w, h); grain(x0, y0, w, h);
    g.fillStyle = "rgba(255,230,190,0.25)"; g.fillRect(x0, y0, w, 6); g.fillRect(x0, y0, 6, h);
    g.fillStyle = "rgba(40,15,5,0.45)"; g.fillRect(x0, y0 + h - 7, w, 7); g.fillRect(x0 + w - 7, y0, 7, h);
    g.strokeStyle = SEAM; g.lineWidth = 4; g.strokeRect(x0, y0, w, h);
    g.strokeStyle = "rgba(42,22,14,0.55)"; g.lineWidth = 2; g.strokeRect(x0 + 16, y0 + 16, w - 32, h - 32);
  }
  for (let i = 0; i < 5; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 80, 160), r() > 0.5 ? "255,230,190" : "40,15,5", 0.1);
  g.fillStyle = SEAM; g.fillRect(0, 0, 512, 3); g.fillRect(0, 509, 512, 3); g.fillRect(0, 0, 3, 512); g.fillRect(509, 0, 3, 512);
});
/** plank floor, 512 px = 2 m, 8 planks with staggered butt joints */
export const plankTex = (col: string) => ctex("ofPlank" + col, 512, 512, (g, r) => {
  const B = 64;
  for (let i = 0; i < 8; i++) {
    const off = U(r, 0, 512);
    for (const y of [off - 512, off]) { g.fillStyle = jit(r, col, 0.09, 3, 0.1); g.fillRect(i * B, y, B, 512); g.fillStyle = SEAM; g.fillRect(i * B, y - 2, B, 4); }
    for (let k = 0; k < 4; k++) { g.strokeStyle = r() < 0.35 ? "rgba(255,230,190,0.18)" : "rgba(50,22,8,0.25)"; g.lineWidth = U(r, 1.2, 2.5); const x = i * B + U(r, 8, B - 8); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + U(r, -5, 5), 170, x + U(r, -5, 5), 340, x, 512); g.stroke(); }
    g.fillStyle = "rgba(255,235,200,0.2)"; g.fillRect(i * B + 3, 0, 3, 512);
  }
  g.fillStyle = SEAM; for (let i = 0; i <= 8; i++) g.fillRect(i * B - 2, 0, 4, 512);
});
/** office tower facade for the window view, 256 px = 4 m: window grid, some lit */
export const towerTex = (col: string, lit: string) => ctex("ofTower" + col, 256, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) blot(g, U(r, 0, 256), U(r, 0, 256), 90, "255,250,235", 0.12);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const v = r(); g.fillStyle = v < 0.25 ? lit : v < 0.6 ? "#5e7192" : "#46587a"; g.fillRect(x * 64 + 10, y * 64 + 14, 44, 34);
    g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(x * 64 + 10, y * 64 + 14, 44, 5);
    g.strokeStyle = "rgba(30,25,40,0.7)"; g.lineWidth = 2.5; g.strokeRect(x * 64 + 10, y * 64 + 14, 44, 34);
  }
});
/** venetian blind: beige slats with see-through gaps (alpha), 128 x 256 px = 1 m tall */
export const blindTex = () => ctex("ofBlind", 64, 256, (g) => {
  g.clearRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 21.33) {
    g.fillStyle = "#efe2c4"; g.fillRect(0, y, 64, 13);
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(0, y, 64, 3);
    g.fillStyle = "#9c8466"; g.fillRect(0, y + 10, 64, 3);
  }
});
/** light shaft through blinds on the floor (additive): stripes fading toward the far end */
export const stripeTex = () => ctex("ofStripe", 256, 512, (g) => {
  g.clearRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 32) {
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, "rgba(255,200,120,0)"); gr.addColorStop(0.15, "rgba(255,205,130,0.85)"); gr.addColorStop(0.85, "rgba(255,205,130,0.85)"); gr.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gr; g.fillRect(0, y, 256, 17);
  }
  const fade = g.createLinearGradient(0, 0, 0, 512); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = fade; g.fillRect(0, 0, 256, 512); g.globalCompositeOperation = "source-over";
});
/** warm radial glow pool (additive decal) */
export const poolTex = () => ctex("ofPool", 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,190,110,0.9)"); gr.addColorStop(0.45, "rgba(255,170,90,0.35)"); gr.addColorStop(1, "rgba(255,160,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});
/** CRT screen: dark teal glass, green text rows, vignette */
export const crtTex = (k: number) => ctex("ofCrt" + k, 256, 192, (g, r) => {
  const gr = g.createRadialGradient(128, 96, 10, 128, 96, 150); gr.addColorStop(0, k % 2 ? "#2f6f8a" : "#2c5f4c"); gr.addColorStop(1, "#0e1e26");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 192);
  g.fillStyle = k % 2 ? "#bfe8ff" : "#8dff9a";
  for (let y = 26; y < 170; y += 16) g.fillRect(24, y, U(r, 40, 200), 7);
  g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(80, 50, 70, 30, -0.4, 0, 7); g.fill();
});
/** file box (bankers box) side: cardboard, hand-hole, label */
export const boxTex = () => ctex("ofBox", 256, 192, (g, r) => {
  g.fillStyle = "#d8b47c"; g.fillRect(0, 0, 256, 192);
  for (let i = 0; i < 4; i++) blot(g, U(r, 0, 256), U(r, 0, 192), 60, "120,80,40", 0.15);
  g.fillStyle = "#2a1d18"; g.beginPath(); g.ellipse(128, 40, 34, 11, 0, 0, 7); g.fill();
  g.fillStyle = "#f6efe0"; g.fillRect(70, 90, 116, 56); g.strokeStyle = "#3a2a22"; g.lineWidth = 3; g.strokeRect(70, 90, 116, 56);
  g.fillStyle = "#3a3a52"; for (let y = 104; y < 140; y += 12) g.fillRect(80, y, U(r, 50, 90), 4);
  g.strokeStyle = "#4a3020"; g.lineWidth = 5; g.strokeRect(2, 2, 252, 188);
});
/** filing cabinet front: 4 drawers with handles + label slots */
export const cabTex = () => ctex("ofCab", 128, 256, (g) => {
  g.fillStyle = "#8a9188"; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 4; i++) {
    const y = i * 64; g.fillStyle = "#9aa198"; g.fillRect(6, y + 5, 116, 54);
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(6, y + 5, 116, 4);
    g.strokeStyle = "#2a2a30"; g.lineWidth = 3; g.strokeRect(6, y + 5, 116, 54);
    g.fillStyle = "#f2ead8"; g.fillRect(48, y + 14, 32, 12); g.strokeRect(48, y + 14, 32, 12);
    g.fillStyle = "#3a3a40"; g.fillRect(44, y + 34, 40, 8);
  }
});
/** corkboard: cork, pinned suspect cards (cartoon bean silhouettes), index cards, a map, red string between pins */
export const corkTex = () => ctex("ofCork", 1024, 640, (g, r) => {
  g.fillStyle = "#b9875a"; g.fillRect(0, 0, 1024, 640);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "90,50,25" : "235,200,150"},${U(r, 0.15, 0.4)})`; g.fillRect(U(r, 0, 1024), U(r, 0, 640), U(r, 1.5, 3.5), U(r, 1.5, 3)); }
  // map
  g.fillStyle = "#e8e0c4"; g.fillRect(620, 60, 330, 230); g.strokeStyle = "#7a9a6a"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(640, 120); g.bezierCurveTo(700, 90, 760, 170, 830, 120); g.bezierCurveTo(880, 90, 900, 200, 930, 180); g.stroke();
  g.strokeStyle = "#c0a070"; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(630, 80 + k * 45); g.lineTo(940, 70 + k * 48); g.stroke(); }
  g.strokeStyle = "#2a1d18"; g.lineWidth = 4; g.strokeRect(620, 60, 330, 230);
  const pins: [number, number][] = [];
  const photo = (x: number, y: number, bg: string, body: string, unk: boolean, rot: number) => {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = "#f8f4ea"; g.fillRect(-62, -78, 124, 156); g.fillStyle = bg; g.fillRect(-52, -68, 104, 112);
    g.fillStyle = body; g.beginPath(); g.ellipse(0, 46, 40, 34, 0, Math.PI, 0); g.fill();
    g.beginPath(); g.ellipse(0, -14, 26, 30, 0, 0, 7); g.fill();
    if (unk) { g.fillStyle = "#f8f4ea"; g.font = "900 52px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", 0, -10); }
    g.fillStyle = "#3a3a52"; g.fillRect(-40, 54, 80, 6); g.fillRect(-30, 64, 60, 5);
    g.strokeStyle = "#2a1d18"; g.lineWidth = 3; g.strokeRect(-62, -78, 124, 156);
    g.restore(); pins.push([x, y - 66]);
  };
  photo(150, 140, "#9fb6c8", "#2a2a36", false, -0.06);
  photo(330, 120, "#c8b49f", "#3a2a2a", false, 0.05);
  photo(500, 330, "#c89f9f", "#1e1e26", true, 0.02);
  photo(170, 450, "#b6c89f", "#2a3a2a", false, 0.07);
  photo(360, 500, "#c8c09f", "#3a3040", false, -0.05);
  photo(760, 460, "#9fa6c8", "#262632", false, 0.04);
  // index cards
  for (const [x, y, rot] of [[880, 360, 0.08], [640, 380, -0.05], [90, 300, 0.04]] as [number, number, number][]) {
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = "#fffbe8"; g.fillRect(-55, -36, 110, 72); g.fillStyle = "#d8433a"; g.fillRect(-55, -26, 110, 3);
    g.fillStyle = "#4a4a62"; for (let k = 0; k < 4; k++) g.fillRect(-45, -14 + k * 12, U(r, 50, 90), 4); g.strokeStyle = "#2a1d18"; g.lineWidth = 2.5; g.strokeRect(-55, -36, 110, 72); g.restore();
    pins.push([x, y - 30]);
  }
  // red string from the centre suspect (?) to everyone
  const c = pins[2];
  g.strokeStyle = "#c81e28"; g.lineWidth = 5; g.lineCap = "round";
  for (let i = 0; i < pins.length; i++) if (i !== 2) { g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(pins[i][0], pins[i][1]); g.stroke(); }
  g.beginPath(); g.moveTo(pins[0][0], pins[0][1]); g.lineTo(pins[1][0], pins[1][1]); g.stroke();
  for (const [x, y] of pins) { g.fillStyle = "#e8322e"; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.strokeStyle = "#2a1010"; g.lineWidth = 2.5; g.stroke(); g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.arc(x - 3, y - 3, 3, 0, 7); g.fill(); }
  g.strokeStyle = "#6a4a2a"; g.lineWidth = 26; g.strokeRect(13, 13, 998, 614); g.strokeStyle = "#2a1d18"; g.lineWidth = 5; g.strokeRect(2, 2, 1020, 636); g.strokeRect(26, 26, 972, 588);
});
/** wall sign plaque */
export const plaqueTex = (l1: string, l2: string) => ctex("ofPlaque" + l1, 768, 192, (g) => {
  g.fillStyle = "#1f2b45"; g.fillRect(0, 0, 768, 192);
  g.strokeStyle = "#d9b45a"; g.lineWidth = 8; g.strokeRect(14, 14, 740, 164); g.strokeStyle = "#141018"; g.lineWidth = 8; g.strokeRect(4, 4, 760, 184);
  g.fillStyle = "#e9cf86"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 72px Arial Black, Arial"; g.fillText(l1, 384, 80, 700); g.font = "700 36px Arial"; g.fillText(l2, 384, 145, 640);
});
/** round wall clock */
export const clockTex = () => ctex("ofClock", 256, 256, (g) => {
  g.fillStyle = "#f6f1e4"; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = "#1f1a24"; g.lineWidth = 14; g.stroke();
  g.fillStyle = "#1f1a24"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.fillRect(128 + Math.cos(a) * 92 - 5, 128 + Math.sin(a) * 92 - 5, 10, 10); }
  g.lineCap = "round"; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 50, 128 - 30); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 - 20, 128 - 82); g.stroke();
});
/** courtroom seal: scales of justice in a gold ring (generic) */
export const sealTex = () => ctex("ofSeal", 512, 512, (g) => {
  g.fillStyle = "#2a3a6a"; g.beginPath(); g.arc(256, 256, 240, 0, 7); g.fill();
  g.strokeStyle = "#e0b54e"; g.lineWidth = 26; g.beginPath(); g.arc(256, 256, 222, 0, 7); g.stroke();
  g.strokeStyle = "#1a1014"; g.lineWidth = 8; g.beginPath(); g.arc(256, 256, 244, 0, 7); g.stroke(); g.beginPath(); g.arc(256, 256, 200, 0, 7); g.stroke();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.fillStyle = "#f2e2b0"; g.beginPath(); g.arc(256 + Math.cos(a) * 222, 256 + Math.sin(a) * 222, 5, 0, 7); g.fill(); }
  g.strokeStyle = "#f2d27a"; g.fillStyle = "#f2d27a"; g.lineWidth = 12; g.lineCap = "round";
  g.beginPath(); g.moveTo(256, 120); g.lineTo(256, 380); g.stroke(); g.beginPath(); g.moveTo(150, 170); g.lineTo(362, 170); g.stroke();
  g.fillRect(200, 372, 112, 18);
  for (const x of [150, 362]) {
    g.lineWidth = 4; g.beginPath(); g.moveTo(x, 170); g.lineTo(x - 40, 270); g.moveTo(x, 170); g.lineTo(x + 40, 270); g.stroke();
    g.beginPath(); g.moveTo(x - 50, 270); g.quadraticCurveTo(x, 320, x + 50, 270); g.closePath(); g.fill();
  }
  g.beginPath(); g.arc(256, 112, 14, 0, 7); g.fill();
});
/** simplified US flag (allowed: not a brand mark) */
export const flagTex = () => ctex("ofFlag", 380, 200, (g) => {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#f4efe4" : "#b8303a"; g.fillRect(0, (i * 200) / 13, 380, 200 / 13 + 1); }
  g.fillStyle = "#2a3a6e"; g.fillRect(0, 0, 160, 108);
  g.fillStyle = "#f4efe4"; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { g.beginPath(); g.arc(14 + x * 26 + (y % 2) * 6, 12 + y * 21, 4, 0, 7); g.fill(); }
  for (let k = 0; k < 6; k++) blot(g, k * 70, k % 2 ? 40 : 160, 80, "40,20,30", 0.12);
});
/** cash bundle top: green note with paper band */
export const cashTex = () => ctex("ofCash", 256, 128, (g, r) => {
  g.fillStyle = "#a8c79a"; g.fillRect(0, 0, 256, 128);
  g.strokeStyle = "#4a6e48"; g.lineWidth = 5; g.strokeRect(10, 10, 236, 108);
  g.fillStyle = "#6f9a6a"; g.beginPath(); g.ellipse(128, 64, 30, 38, 0, 0, 7); g.fill(); g.strokeStyle = "#3a5a3a"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#3a5a3a"; g.font = "900 34px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("100", 44, 34); g.fillText("100", 212, 94);
  g.fillStyle = "#efe6c8"; g.fillRect(104, 0, 48, 128); g.strokeStyle = "#8a6a3a"; g.lineWidth = 3; g.strokeRect(104, -2, 48, 132);
  g.fillStyle = "#8a3a2a"; g.font = "800 18px Arial"; g.save(); g.translate(128, 64); g.rotate(-Math.PI / 2); g.fillText("$10,000", 0, 0); g.restore();
  for (let i = 0; i < 3; i++) blot(g, U(r, 0, 256), U(r, 0, 128), 50, "40,60,30", 0.12);
});
/** cash bundle side: stacked note edges */
export const cashSideTex = () => ctex("ofCashSide", 128, 64, (g) => {
  g.fillStyle = "#cfe0c4"; g.fillRect(0, 0, 128, 64);
  g.fillStyle = "#7f9f74"; for (let y = 0; y < 64; y += 6) g.fillRect(0, y, 128, 2);
  g.fillStyle = "#efe6c8"; g.fillRect(52, 0, 24, 64);
});
/** giant presentation check (invented bank, no brand) */
export const checkTex = (k: number) => ctex("ofCheck" + k, 1024, 460, (g, r) => {
  g.fillStyle = k ? "#e9f1e2" : "#eef0f8"; g.fillRect(0, 0, 1024, 460);
  for (let i = 0; i < 26; i++) { g.strokeStyle = k ? "rgba(90,140,90,0.12)" : "rgba(90,110,170,0.12)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, i * 18); g.bezierCurveTo(300, i * 18 + 20, 700, i * 18 - 20, 1024, i * 18); g.stroke(); }
  g.fillStyle = k ? "#3a6a4a" : "#2f4a8a"; g.fillRect(0, 0, 1024, 70);
  g.fillStyle = "#ffffff"; g.font = "900 44px Arial Black, Arial"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("PRIZE FUND TRUST", 34, 36);
  g.textAlign = "right"; g.font = "700 30px Arial"; g.fillText("No. " + (1041 + k * 337), 990, 36);
  g.fillStyle = "#2a2a3a"; g.textAlign = "left"; g.font = "700 30px Arial"; g.fillText("PAY TO THE ORDER OF", 34, 140);
  g.fillStyle = "#1f2a5a"; g.font = "italic 700 52px Georgia, serif"; g.fillText(k ? "Lucky Winner" : "Prize Winner", 380, 136);
  g.strokeStyle = "#2a2a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(360, 166); g.lineTo(700, 166); g.stroke();
  g.fillStyle = "#ffffff"; g.fillRect(730, 100, 260, 80); g.strokeRect(730, 100, 260, 80);
  g.fillStyle = "#b8202a"; g.font = "900 46px Arial Black, Arial"; g.textAlign = "center"; g.fillText("$1,000,000", 860, 142, 240);
  g.fillStyle = "#1f2a5a"; g.font = "italic 700 46px Georgia, serif"; g.textAlign = "left"; g.fillText("One Million and 00/100", 60, 250);
  g.beginPath(); g.moveTo(34, 280); g.lineTo(990, 280); g.stroke();
  g.font = "italic 700 40px Georgia, serif"; g.fillText("J. Smith", 690, 380); g.beginPath(); g.moveTo(640, 400); g.lineTo(990, 400); g.stroke();
  g.strokeStyle = "#1a1014"; g.lineWidth = 12; g.strokeRect(6, 6, 1012, 448);
  for (let i = 0; i < 4; i++) blot(g, U(r, 0, 1024), U(r, 0, 460), 120, "60,50,40", 0.06);
});
/** evidence tag (manila with red stripe) */
export const tagTex = (n: number) => ctex("ofTag" + n, 128, 96, (g) => {
  g.fillStyle = "#f2d98a"; g.fillRect(0, 0, 128, 96); g.fillStyle = "#c8323c"; g.fillRect(0, 0, 128, 20);
  g.fillStyle = "#1f1a24"; g.font = "900 44px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), 64, 60);
  g.strokeStyle = "#1f1a24"; g.lineWidth = 5; g.strokeRect(2, 2, 124, 92);
});
/** courtroom window view: soft painted trees + sky band (behind tall windows) */
export const parkTex = () => ctex("ofPark", 512, 512, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#6aa4e0"); gr.addColorStop(0.6, "#bcd6ee"); gr.addColorStop(1, "#d9e6ef");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(U(r, 0, 512), U(r, 40, 200), U(r, 40, 90), U(r, 12, 24), 0, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { const x = U(r, -20, 532), y = U(r, 330, 420), rr = U(r, 50, 90); g.fillStyle = ["#5f9a4a", "#4f8a40", "#6fae52"][i % 3]; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.strokeStyle = "rgba(30,50,30,0.5)"; g.lineWidth = 4; g.stroke(); }
  g.fillStyle = "#c9b48e"; g.fillRect(0, 440, 512, 72);
});
