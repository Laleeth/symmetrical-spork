// The cast of "The Man Who Stole $24 Million" (1990s America). Owned by the CHARACTER agent: outfits are upgraded in
// place (same export names). Variants: spread and override, e.g. { ...CAST.chief, shades: "aviator" }.
// Seeds drive blinks and per-person head shape. Characters with `letters` should not be mirrored (text would flip).
import type { Outfit } from "./toon";
const base = { boots: "#2e2228", hat: "hair", hair: "#3a2a26", hairStyle: "short", skin: "#f3e3cf", garment: "shirt", lower: "pants", feet: "shoe" } as const;
export const CAST: Record<string, Outfit> = {
  // head of security, ex-cop, 50s: navy blazer, white shirt, tie, photo ID on the lapel, grey hair + moustache
  chief: { ...base, garment: "blazer", jacket: "#2c3d66", pants: "#3a4152", shirt: "#f7f6f1", tie: "#a8323c", badge: "#3f8a5a",
    hair: "#a9a9b2", hairStyle: "neat", moustache: "#9a9aa4", mous: "bushy", build: "stout", skin: "#f1dfc8" },
  guard: { ...base, garment: "uniform", jacket: "#8ea3bd", pants: "#2f3846", hat: "guard", cap: "#2f3a4c", tie: "#22262e", tieW: "thin",
    shield: "#e0b84a", patch: "#2f3a4c", waistBelt: "#1e1e24", radio: true },
  pressman: { ...base, garment: "shirt", jacket: "#e9e2d0", sleeves: "short", overalls: "#3f6fa8", pants: "#3f6fa8", hat: "cap", cap: "#d8433a",
    hairStyle: "messy", hair: "#5a3b2a" },
  auditor: { ...base, garment: "blazer", jacket: "#6a6a72", pants: "#55555d", shirt: "#eef2f8", tie: "#3a5a8a", tieW: "thin", specs: true,
    hair: "#4a3a30", hairStyle: "neat" },
  friend: { ...base, garment: "windbreaker", jacket: "#5a3a8a", stripe: "#2fa39a", trim: "#f2c94a", pants: "#4a6a9a", jeans: true, feet: "sneaker",
    hat: "cap", cap: "#2fa39a", hair: "#3a2a26" },
  winner: { ...base, garment: "windbreaker", jacket: "#c8323c", stripe: "#1f2f5a", trim: "#ffffff", letters: "USA", pants: "#4a6a9a", jeans: true,
    feet: "sneaker", hair: "#7a4a2a", hairStyle: "messy", moustache: "#7a4a2a" },
  butcher: { ...base, garment: "shirt", jacket: "#f4f1ea", sleeves: "short", apron: "#fbfaf6", stains: true, pants: "#5a5a62", hat: "paper",
    cap: "#fbfbf6", hairStyle: "bald", hair: "#6a5a50", moustache: "#5a4a40", build: "stout" },
  psychic: { ...base, garment: "blouse", jacket: "#e0a63a", lower: "skirt", cloth: "#7a2f6a", pants: "#7a2f6a", trim: "#e0b84a", hat: "scarf",
    cap: "#3a6a8a", shawl: "#b8323f", earrings: "#e8c45a", beads: ["#d8433a", "#e8c45a", "#2fa39a", "#7a3a8a"], hairStyle: "bun", hair: "#2a1d2b", feet: "chappal", boots: "#7a4a2a" },
  mobster: { ...base, garment: "blazer", jacket: "#2e2c36", pinstripe: "#57556a", pants: "#2e2c36", shirt: "#3b3448", tie: "#e8d7a0", tieW: "wide",
    pocketSq: "#f4efe2", hat: "fedora", cap: "#3a3542", hatBand: "#1a181e", moustache: "#2a1d26", build: "stout" },
  agent: { ...base, garment: "blazer", jacket: "#23262e", pants: "#23262e", shirt: "#ffffff", tie: "#1a1b20", tieW: "thin", earpiece: true,
    hair: "#2a2020", hairStyle: "short" },
  agent2: { ...base, garment: "blazer", jacket: "#2a2e38", pants: "#2a2e38", shirt: "#ffffff", earpiece: true, hair: "#5a3a26", hairStyle: "bob",
    skin: "#f6e8d6" },
  crew: { ...base, garment: "tee", jacket: "#5d6f8a", vest: "#b8a77a", pants: "#4a4a52", hat: "cap", cap: "#2a2a30", phones: "#2e2e36",
    feet: "sneaker", stripe: undefined },
  judge: { ...base, garment: "robe", jacket: "#1e1e26", pants: "#1e1e24", collar: "#fbfaf6", tie: "#5a5a66", tieW: "thin", hair: "#dcdce2", hairStyle: "neat", specs: true },
  cust1: { ...base, garment: "shirt", jacket: "#9a3a3a", plaid: "#1f2a44", sleeves: "long", pants: "#4a6a9a", jeans: true, hat: "cap", cap: "#2f5a3a",
    hair: "#5a3b2a", feet: "sneaker" },
  cust2: { ...base, garment: "windbreaker", jacket: "#e07a9a", stripe: "#6ac0d8", trim: "#ffffff", pants: "#3a4a6a", jeans: true, hair: "#8a5a2a",
    hairStyle: "curly", feet: "sneaker", earrings: "#e8c45a" },
  kid: { ...base, garment: "tee", jacket: "#f2c94a", stripe: "#3a6fd0", lower: "shorts", pants: "#4a6a9a", build: "kid", hat: "cap", cap: "#3a6fd0",
    feet: "sneaker" },
  // generic 1990s burger-diner uniform: red short-sleeve shirt, white visor, name tag (no brand marks)
  cashier: { ...base, garment: "shirt", jacket: "#c8323c", sleeves: "short", pants: "#2a2a30", hat: "visor", cap: "#fbfbf6", tag: "#c8323c",
    hair: "#3a2a26", hairStyle: "bun" },
};
export const SEED: Record<string, number> = { chief: 3, guard: 5, pressman: 7, auditor: 9, friend: 11, winner: 13, butcher: 15, psychic: 17,
  mobster: 19, agent: 21, agent2: 23, crew: 25, judge: 27, cust1: 29, cust2: 31, kid: 33, cashier: 35 };
