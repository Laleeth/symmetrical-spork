// The cast of "The Pudding Loophole" (California, May 1999). Same export names as the McDonald's engine (CAST/SEED).
// David Phillips: civil engineer, glasses, teal polo, khakis. Store staff in green aprons, volunteers in red aprons.
import type { Outfit } from "./toon";
const base = { boots: "#2e2228", hat: "hair", hair: "#3a2a26", hairStyle: "short", skin: "#f3e3cf", garment: "shirt", lower: "pants", feet: "shoe" } as const;
export const CAST: Record<string, Outfit> = {
  david: { ...base, garment: "shirt", jacket: "#2f8f8a", sleeves: "short", pants: "#c9b48a", shirt: "#f7f6f1", specs: true,
    hair: "#5a3b2a", hairStyle: "neat", feet: "sneaker", skin: "#f3dfc6" },
  cashier: { ...base, garment: "shirt", jacket: "#f4efe2", sleeves: "short", apron: "#3f8a5a", pants: "#2a2a30", tag: "#3f8a5a",
    hair: "#7a4a2a", hairStyle: "bun", earrings: "#e8c45a" },
  manager: { ...base, garment: "shirt", jacket: "#eef2f8", sleeves: "long", tie: "#3f8a5a", tieW: "thin", apron: "#3f8a5a", pants: "#3a4152",
    hair: "#a9a9b2", hairStyle: "bald", moustache: "#8d8d95", build: "stout", tag: "#3f8a5a" },
  stocker: { ...base, garment: "tee", jacket: "#3f8a5a", pants: "#4a6a9a", jeans: true, hat: "cap", cap: "#2a5a3a", feet: "sneaker", hair: "#2a1d18" },
  vol1: { ...base, garment: "shirt", jacket: "#f4efe2", sleeves: "short", apron: "#c8323c", pants: "#3a4a6a", jeans: true, hair: "#8a5a2a",
    hairStyle: "curly", feet: "sneaker", earrings: "#e8c45a" },
  vol2: { ...base, garment: "shirt", jacket: "#9ab4d8", sleeves: "long", apron: "#c8323c", pants: "#4a4a52", hair: "#dcdce2", hairStyle: "neat",
    specs: true, moustache: "#c8c8d0", build: "stout" },
  vol3: { ...base, garment: "tee", jacket: "#f2c94a", apron: "#c8323c", pants: "#4a6a9a", jeans: true, hat: "cap", cap: "#c8323c", feet: "sneaker" },
  vol4: { ...base, garment: "blouse", jacket: "#e07a9a", apron: "#c8323c", lower: "skirt", cloth: "#3a4a6a", pants: "#3a4a6a", hair: "#2a1d2b",
    hairStyle: "bob" },
  vol5: { ...base, garment: "shirt", jacket: "#6a9a5a", sleeves: "short", apron: "#c8323c", pants: "#5a5a62", hair: "#3a2a26", hairStyle: "messy",
    skin: "#c99a74" },
  vol6: { ...base, garment: "tee", jacket: "#7a5aa8", apron: "#c8323c", pants: "#4a6a9a", jeans: true, hair: "#a8642a", hairStyle: "bun", skin: "#e8c8a8" },
  shopper: { ...base, garment: "windbreaker", jacket: "#e07a9a", stripe: "#6ac0d8", trim: "#ffffff", pants: "#3a4a6a", jeans: true, hair: "#8a5a2a",
    hairStyle: "curly", feet: "sneaker" },
  shopper2: { ...base, garment: "shirt", jacket: "#9a3a3a", plaid: "#1f2a44", sleeves: "long", pants: "#4a6a9a", jeans: true, hat: "cap", cap: "#2f5a3a",
    feet: "sneaker" },
  kid: { ...base, garment: "tee", jacket: "#f2c94a", stripe: "#3a6fd0", lower: "shorts", pants: "#4a6a9a", build: "kid", hat: "cap", cap: "#3a6fd0", feet: "sneaker" },
  wife: { ...base, garment: "blouse", jacket: "#e0a63a", pants: "#3a4a6a", hair: "#3a2a26", hairStyle: "bob", earrings: "#e8c45a" },
  postman: { ...base, garment: "shirt", jacket: "#8ea3bd", sleeves: "short", pants: "#2f3846", hat: "cap", cap: "#2f3a4c", patch: "#c8323c", feet: "shoe" },
};
export const SEED: Record<string, number> = { david: 3, cashier: 5, manager: 7, stocker: 9, vol1: 11, vol2: 13, vol3: 15, vol4: 17, vol5: 19, vol6: 21,
  shopper: 23, shopper2: 25, kid: 27, wife: 29, postman: 31 };
