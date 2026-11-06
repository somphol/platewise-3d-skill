/* ==========================================================================
   PlateWise 3D — application
   Vanilla ES modules. Three.js 0.169.0 via import map (pinned).
   No framework, no build step, no backend, no analytics.
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* --------------------------------------------------------------------------
   1. Constants and reference data
   -------------------------------------------------------------------------- */

const APP = {
  name: 'PlateWise 3D',
  version: '1.0.0',
  storeMeals: 'platewise.meals.v1',
  storePrefs: 'platewise.prefs.v1',
  maxServings: 12,
};

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ZONE_CAPS = { veg: 8, protein: 4, fat: 5 };
const ZONE_COLORS = { veg: '#7ac142', protein: '#d77b62', fat: '#e2b45a' };
const ZONE_LABELS = { veg: 'Veg & berries', protein: 'Protein', fat: 'Fats & seeds' };

/**
 * Nutrition values are per 100 g edible portion, rounded from USDA FoodData
 * Central (SR Legacy / Foundation Foods). Glycemic index values are typical
 * published values and are deliberately treated as approximations.
 * `servingG` converts the 100 g values to the serving shown in the UI.
 */
const FOODS = [
  {
    id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'cruciferous', zone: 'veg',
    serving: '1 cup, chopped', servingG: 91, gi: 15, scale: 0.92, ring: 0.55,
    per100: { kcal: 34, carbs: 6.64, fiber: 2.6, protein: 2.82, fat: 0.37 },
    blurb: 'Fiber, vitamin C and sulforaphane with about 3.7 g net carbs per cup.',
    tags: ['green', 'roasted', 'steamed', 'rice swap', 'cruciferous'],
    source: 'USDA FoodData Central: Broccoli, raw (SR Legacy)',
  },
  {
    id: 'spinach', name: 'Spinach', emoji: '🥬', category: 'leafy', zone: 'veg',
    serving: '2 cups, raw', servingG: 60, gi: 15, scale: 0.74, ring: 0.5,
    per100: { kcal: 23, carbs: 3.63, fiber: 2.2, protein: 2.86, fat: 0.39 },
    blurb: 'Leafy volume, folate and magnesium with almost no available carbohydrate.',
    tags: ['green', 'salad', 'leafy', 'raw', 'wilted'],
    source: 'USDA FoodData Central: Spinach, raw (SR Legacy)',
  },
  {
    id: 'cauliflower', name: 'Cauliflower', emoji: '🌼', category: 'cruciferous', zone: 'veg',
    serving: '1 cup, chopped', servingG: 107, gi: 15, scale: 0.9, ring: 0.55,
    per100: { kcal: 25, carbs: 4.97, fiber: 2.0, protein: 1.92, fat: 0.28 },
    blurb: 'The neutral canvas behind cauliflower rice and mash. About 3.2 g net carbs per cup.',
    tags: ['rice swap', 'mash swap', 'roasted', 'cruciferous', 'white'],
    source: 'USDA FoodData Central: Cauliflower, raw (SR Legacy)',
  },
  {
    id: 'zucchini', name: 'Zucchini', emoji: '🥒', category: 'veg', zone: 'veg',
    serving: '1 cup, sliced', servingG: 124, gi: 15, scale: 0.86, ring: 0.55,
    per100: { kcal: 17, carbs: 3.11, fiber: 1.0, protein: 1.21, fat: 0.32 },
    blurb: 'Water-rich and mild; spiralizes into pasta-shaped noodles with 2.6 g net carbs.',
    tags: ['noodles', 'pasta swap', 'grilled', 'green', 'summer'],
    source: 'USDA FoodData Central: Squash, summer, zucchini, includes skin, raw',
  },
  {
    id: 'bell-pepper', name: 'Bell pepper', emoji: '🫑', category: 'veg', zone: 'veg',
    serving: '1 cup, sliced', servingG: 119, gi: 15, scale: 0.84, ring: 0.52,
    per100: { kcal: 31, carbs: 6.65, fiber: 2.1, protein: 0.99, fat: 0.3 },
    blurb: 'Crunch and vitamin C. Sweeter than greens, but a cup still carries only ~4.5 g net carbs.',
    tags: ['red', 'crunchy', 'roasted', 'salad', 'pepper'],
    source: 'USDA FoodData Central: Peppers, sweet, red, raw (SR Legacy)',
  },
  {
    id: 'asparagus', name: 'Asparagus', emoji: '🌿', category: 'veg', zone: 'veg',
    serving: '1 cup', servingG: 134, gi: 15, scale: 0.86, ring: 0.55,
    per100: { kcal: 20, carbs: 3.88, fiber: 2.1, protein: 2.2, fat: 0.12 },
    blurb: 'Prebiotic fiber and a spring vegetable flavour with ~2.4 g net carbs per cup.',
    tags: ['green', 'roasted', 'grilled', 'fries swap', 'spring'],
    source: 'USDA FoodData Central: Asparagus, raw (SR Legacy)',
  },
  {
    id: 'salmon', name: 'Wild salmon', emoji: '🐟', category: 'protein', zone: 'protein',
    serving: '3.5 oz fillet', servingG: 100, gi: 0, scale: 1.0, ring: 0.58,
    per100: { kcal: 142, carbs: 0, fiber: 0, protein: 19.84, fat: 6.34 },
    blurb: 'Omega-3s and complete protein. No carbohydrate at all.',
    tags: ['fish', 'seafood', 'omega-3', 'baked', 'protein'],
    source: 'USDA FoodData Central: Fish, salmon, coho, wild, raw (SR Legacy)',
  },
  {
    id: 'egg', name: 'Egg', emoji: '🥚', category: 'protein', zone: 'protein',
    serving: '1 large egg', servingG: 50, gi: 0, scale: 0.8, ring: 0.4,
    per100: { kcal: 143, carbs: 0.72, fiber: 0, protein: 12.56, fat: 9.51 },
    blurb: 'Choline and complete protein. One large egg has under 1 g net carbs.',
    tags: ['breakfast', 'boiled', 'scrambled', 'protein', 'egg'],
    source: 'USDA FoodData Central: Egg, whole, raw, fresh (SR Legacy)',
  },
  {
    id: 'chicken', name: 'Chicken breast', emoji: '🍗', category: 'protein', zone: 'protein',
    serving: '3.5 oz, raw', servingG: 100, gi: 0, scale: 0.88, ring: 0.56,
    per100: { kcal: 120, carbs: 0, fiber: 0, protein: 22.5, fat: 2.62 },
    blurb: 'Lean complete protein that keeps the plate filling without adding carbohydrate.',
    tags: ['poultry', 'grilled', 'roasted', 'protein', 'lean'],
    source: 'USDA FoodData Central: Chicken, broilers or fryers, breast, meat only, raw',
  },
  {
    id: 'tofu', name: 'Firm tofu', emoji: '🧊', category: 'protein', zone: 'protein',
    serving: '3 oz', servingG: 85, gi: 0, scale: 0.7, ring: 0.42,
    per100: { kcal: 144, carbs: 2.3, fiber: 1.2, protein: 17.3, fat: 8.7 },
    blurb: 'Plant protein with a very low glycemic load; firm tofu holds a sear beautifully.',
    tags: ['plant', 'soy', 'vegan', 'stir-fry', 'protein'],
    source: 'USDA FoodData Central: Tofu, raw, firm, prepared with calcium sulfate',
  },
  {
    id: 'avocado', name: 'Avocado', emoji: '🥑', category: 'fat', zone: 'fat',
    serving: '½ small avocado', servingG: 75, gi: 10, scale: 0.9, ring: 0.48,
    per100: { kcal: 160, carbs: 8.53, fiber: 6.7, protein: 2.0, fat: 14.66 },
    blurb: 'Monounsaturated fat and 6.7 g fiber per 100 g. Creamy without any starch.',
    tags: ['creamy', 'salad', 'healthy fat', 'green', 'avocado'],
    source: 'USDA FoodData Central: Avocados, raw, all commercial varieties',
  },
  {
    id: 'almonds', name: 'Almonds', emoji: '🌰', category: 'fat', zone: 'fat',
    serving: '1 oz (23 nuts)', servingG: 28, gi: 15, scale: 0.8, ring: 0.46,
    per100: { kcal: 579, carbs: 21.55, fiber: 12.5, protein: 21.15, fat: 49.93 },
    blurb: 'Crunch, magnesium and 3.5 g fiber per ounce. A handful beats a biscuit.',
    tags: ['nuts', 'crunchy', 'snack', 'bread swap', 'healthy fat'],
    source: 'USDA FoodData Central: Nuts, almonds (SR Legacy)',
  },
  {
    id: 'walnuts', name: 'Walnuts', emoji: '🥜', category: 'fat', zone: 'fat',
    serving: '1 oz (14 halves)', servingG: 28, gi: 15, scale: 0.82, ring: 0.46,
    per100: { kcal: 654, carbs: 13.71, fiber: 6.7, protein: 15.23, fat: 65.21 },
    blurb: 'Plant omega-3 ALA and a satisfying stand-in for sugary snacks.',
    tags: ['nuts', 'snack', 'sweet craving', 'omega-3', 'healthy fat'],
    source: 'USDA FoodData Central: Nuts, walnuts, English (SR Legacy)',
  },
  {
    id: 'olive-oil', name: 'Olive oil', emoji: '🫒', category: 'fat', zone: 'fat',
    serving: '1 tbsp', servingG: 14, gi: 0, scale: 0.72, ring: 0.38,
    per100: { kcal: 884, carbs: 0, fiber: 0, protein: 0, fat: 100 },
    blurb: 'Pure fat, zero carbs. A measured drizzle adds richness without a glucose load.',
    tags: ['oil', 'drizzle', 'salad', 'cooking', 'healthy fat'],
    source: 'USDA FoodData Central: Oil, olive, salad or cooking',
  },
  {
    id: 'chia', name: 'Chia seeds', emoji: '🌱', category: 'fat', zone: 'fat',
    serving: '2 tbsp', servingG: 24, gi: 15, scale: 0.68, ring: 0.38,
    per100: { kcal: 486, carbs: 42.12, fiber: 34.4, protein: 16.54, fat: 30.74 },
    blurb: 'Gels into pudding and carries 9.8 g fiber per ounce, so most of its carb is fiber.',
    tags: ['seeds', 'pudding', 'fiber', 'bread swap', 'healthy fat'],
    source: 'USDA FoodData Central: Seeds, chia seeds, dried',
  },
  {
    id: 'strawberries', name: 'Strawberries', emoji: '🍓', category: 'berry', zone: 'veg',
    serving: '1 cup, sliced', servingG: 100, gi: 40, scale: 0.82, ring: 0.4,
    per100: { kcal: 32, carbs: 7.68, fiber: 2.0, protein: 0.67, fat: 0.3 },
    blurb: 'The lowest-GI berry here: 5.7 g net carbs per 100 g with vitamin C.',
    tags: ['berry', 'sweet', 'dessert', 'fruit', 'low gi'],
    source: 'USDA FoodData Central: Strawberries, raw (SR Legacy)',
  },
  {
    id: 'raspberries', name: 'Raspberries', emoji: '🍓', category: 'berry', zone: 'veg',
    serving: '1 cup', servingG: 100, gi: 32, scale: 0.84, ring: 0.4,
    per100: { kcal: 52, carbs: 11.94, fiber: 6.5, protein: 1.2, fat: 0.65 },
    blurb: 'A cup delivers 6.5 g fiber and only 5.4 g net carbs. The most fiber-forward berry.',
    tags: ['berry', 'sweet', 'dessert', 'fruit', 'fiber'],
    source: 'USDA FoodData Central: Raspberries, raw (SR Legacy)',
  },
  {
    id: 'blueberries', name: 'Blueberries', emoji: '🫐', category: 'berry', zone: 'veg',
    serving: '½ cup', servingG: 75, gi: 53, scale: 0.78, ring: 0.4,
    per100: { kcal: 57, carbs: 14.49, fiber: 2.4, protein: 0.74, fat: 0.33 },
    blurb: 'Higher in sugar than raspberries, so the plate keeps to a half-cup serving.',
    tags: ['berry', 'sweet', 'dessert', 'fruit', 'antioxidant'],
    source: 'USDA FoodData Central: Blueberries, raw (SR Legacy)',
  },
];

/** Foods that are deliberately excluded. Clicking one opens the warning modal. */
const WARNINGS = [
  {
    id: 'white-rice', name: 'White rice', emoji: '🍚', kind: 'Refined starch',
    serving: '1 cup cooked (158 g)', net: 43.5, fiber: 0.6, gi: 73, gl: 31.8,
    swapId: 'rice',
    why: 'Milled rice has lost its bran and germ, so almost all of its 44 g of carbohydrate is available within minutes. A cup behaves like a large glucose dose with very little fiber to slow it down.',
    source: 'USDA FoodData Central: Rice, white, long-grain, regular, cooked, enriched',
  },
  {
    id: 'potato', name: 'Baked potato', emoji: '🥔', kind: 'Starchy vegetable',
    serving: '1 medium (173 g)', net: 32.7, fiber: 3.8, gi: 85, gl: 27.8,
    swapId: 'potato',
    why: 'Potatoes are botanically vegetables but nutritionally starch. Baking gelatinizes the starch and can push the glycemic index into the mid-80s — higher than many desserts.',
    source: 'USDA FoodData Central: Potatoes, baked, flesh and skin, without salt',
  },
  {
    id: 'fries', name: 'French fries', emoji: '🍟', kind: 'Ultra-processed',
    serving: 'small serving (117 g)', net: 44.1, fiber: 4.4, gi: 75, gl: 33.1,
    swapId: 'fries',
    why: 'Deep frying adds fat but does not blunt the refined starch. Fries combine a high glycemic load with a very high energy density, the opposite of a volume-eating plate.',
    source: 'USDA FoodData Central: Fast foods, potato, french fried, shoestring',
  },
  {
    id: 'white-bread', name: 'White bread', emoji: '🍞', kind: 'Refined grain',
    serving: '2 slices (56 g)', net: 26.2, fiber: 1.5, gi: 75, gl: 19.7,
    swapId: 'bread',
    why: 'Two slices can carry more than 26 g of fast carbohydrate with barely 1.5 g fiber. The soft texture also makes it easy to eat quickly, before satiety signals arrive.',
    source: 'USDA FoodData Central: Bread, white, commercially prepared',
  },
  {
    id: 'pasta', name: 'White pasta', emoji: '🍝', kind: 'Refined grain',
    serving: '1 cup cooked (140 g)', net: 40.7, fiber: 2.5, gi: 49, gl: 19.9,
    swapId: 'pasta',
    why: 'Durum pasta has a moderate glycemic index, but a restaurant portion easily doubles the serving. The carbohydrate load, not just the index, is what drives the curve.',
    source: 'USDA FoodData Central: Pasta, cooked, enriched, without added salt',
  },
  {
    id: 'cereal', name: 'Sugary cereal', emoji: '🥣', kind: 'Ultra-processed',
    serving: '1 cup (40 g)', net: 32.6, fiber: 1.2, gi: 82, gl: 26.7,
    swapId: 'snacks',
    why: 'Extruded, sugar-coated flakes are engineered to digest fast. A small bowl can deliver a dessert-sized glycemic load before you have even added milk.',
    source: 'USDA FoodData Central: Cereals ready-to-eat, sweetened (representative)',
  },
];

const SWAPS = [
  {
    id: 'rice', craving: 'White rice', title: 'Cauliflower rice', warningId: 'white-rice',
    addIds: ['cauliflower'], note: 'Pulse cauliflower to rice size and sauté in a dry pan. A cup saves roughly 40 g of net carbs.',
  },
  {
    id: 'pasta', craving: 'Pasta', title: 'Zucchini noodles', warningId: 'pasta',
    addIds: ['zucchini'], note: 'Spiralize, salt for ten minutes, squeeze dry, then warm briefly. Keep the sauce and lose the starch.',
  },
  {
    id: 'potato', craving: 'Mashed potatoes', title: 'Mashed cauliflower', warningId: 'potato',
    addIds: ['cauliflower'], note: 'Steam until soft, drain hard, then mash with olive oil and a little salt. Roasted radishes are another low-starch stand-in.',
  },
  {
    id: 'bread', craving: 'Wheat bread', title: 'Almond–chia cloud bread', warningId: 'white-bread',
    addIds: ['almonds', 'chia'], note: 'The pantry’s closest whole-food stand-in: almonds + chia. A real cloud bread also uses eggs, which are on the plate too.',
  },
  {
    id: 'snacks', craving: 'Sugary snacks', title: 'Walnuts & berries', warningId: 'cereal',
    addIds: ['walnuts', 'strawberries'], note: 'Fat, fiber and a little sweetness. Two squares of 85%+ dark chocolate can ride along; it is not a free food.',
  },
  {
    id: 'fries', craving: 'French fries', title: 'Roasted asparagus spears', warningId: 'fries',
    addIds: ['asparagus'], note: 'Toss with olive oil and roast at 220 °C until the tips crisp. Same salt-and-crunch ritual, no refined starch.',
  },
];

const SOURCES = [
  {
    kind: 'Clinical guideline',
    title: 'American Diabetes Association. Standards of Care in Diabetes—2025. Diabetes Care, Volume 48, Supplement 1.',
    detail: 'Section 5 covers nutrition therapy, the plate method, carbohydrate awareness and individualized glycemic goals.',
    url: 'https://diabetesjournals.org/care/issue/48/Supplement_1',
  },
  {
    kind: 'Consensus report',
    title: 'Evert AB, et al. Nutrition Therapy for Adults With Diabetes or Prediabetes: A Consensus Report. Diabetes Care. 2019;42(5):731–754.',
    detail: 'Reviews the evidence for reducing overall carbohydrate intake, emphasizing non-starchy vegetables and whole foods.',
    url: 'https://doi.org/10.2337/dci19-0014',
  },
  {
    kind: 'Nutrition database',
    title: 'USDA FoodData Central — SR Legacy and Foundation Foods.',
    detail: 'Per-100 g energy, macronutrient and fiber values for every food in the pantry. Serving sizes are converted in the app.',
    url: 'https://fdc.nal.usda.gov/',
  },
  {
    kind: 'Critical review',
    title: 'Feinman RD, et al. Dietary carbohydrate restriction as the first approach in diabetes management: critical review and evidence base. Nutrition. 2015;31(1):1–13.',
    detail: 'Summarizes the physiological rationale and clinical evidence for carbohydrate restriction in type 2 diabetes.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25287761/',
  },
  {
    kind: 'Glycemic index tables',
    title: 'Atkinson FS, et al. International tables of glycemic index and glycemic load values 2021: a systematic review. Diabetes Care. 2021;44(9):2172–2181.',
    detail: 'Source of typical GI values. The app uses these as population approximations, not individual predictions.',
    url: 'https://doi.org/10.2337/dc21-0658',
  },
  {
    kind: 'GI database',
    title: 'University of Sydney Glycemic Index Research Service — GI database.',
    detail: 'Additional reference values and the methodology behind testing glycemic response.',
    url: 'https://glycemicindex.com/',
  },
];

const SAMPLE_PLATE = ['broccoli', 'spinach', 'cauliflower', 'strawberries', 'salmon', 'egg', 'avocado', 'almonds'];
const BALANCED_PLATE = SAMPLE_PLATE;

const FOOD_BY_ID = new Map(FOODS.map((food) => [food.id, food]));
const WARNING_BY_ID = new Map(WARNINGS.map((food) => [food.id, food]));
const SWAP_BY_ID = new Map(SWAPS.map((swap) => [swap.id, swap]));

/* --------------------------------------------------------------------------
   2. Nutrition model
   -------------------------------------------------------------------------- */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const nutritionCache = new Map();

/** Per-serving nutrition for a safe food (net carbs = carbohydrate − fiber). */
function nutritionFor(food) {
  if (nutritionCache.has(food.id)) return nutritionCache.get(food.id);
  const factor = food.servingG / 100;
  const carbs = round(food.per100.carbs * factor, 2);
  const fiber = round(food.per100.fiber * factor, 2);
  const net = round(Math.max(0, carbs - fiber), 2);
  const protein = round(food.per100.protein * factor, 2);
  const fat = round(food.per100.fat * factor, 2);
  const kcal = Math.round(food.per100.kcal * factor);
  const gl = round((food.gi * net) / 100, 2);
  const result = { carbs, fiber, net, protein, fat, kcal, gl, gi: food.gi };
  nutritionCache.set(food.id, result);
  return result;
}

function warningNutrition(food) {
  return { net: food.net, fiber: food.fiber, gi: food.gi, gl: food.gl };
}

function bandFor(score, servings) {
  if (!servings) {
    return {
      label: 'Empty plate',
      tone: 'empty',
      advice: 'Add a vegetable, a protein and a fat to see how the plate balances.',
    };
  }
  if (score >= 85) {
    return { label: 'Metabolically calm', tone: 'safe', advice: 'A fiber-forward, low-load plate. Keep the portions honest and this is a steady one.' };
  }
  if (score >= 70) {
    return { label: 'Gentle on glucose', tone: 'safe', advice: 'A reasonable plate. More non-starchy veg or a little extra fiber would make it steadier.' };
  }
  if (score >= 55) {
    return { label: 'Watch the portions', tone: 'warn', advice: 'The load is creeping up. Shrink the sweeter items and add a green vegetable.' };
  }
  return { label: 'High spike risk', tone: 'risk', advice: 'This plate is carrying a starch-sized carbohydrate load. Rebuild around vegetables and protein.' };
}

/** Aggregate the plate and compute the teaching score. */
function summarize(plate = state.plate) {
  const totals = { net: 0, carbs: 0, fiber: 0, protein: 0, fat: 0, kcal: 0, gl: 0 };
  const zoneCounts = { veg: 0, protein: 0, fat: 0 };
  const items = [];

  for (const entry of plate) {
    const food = FOOD_BY_ID.get(entry.foodId);
    if (!food) continue;
    const n = nutritionFor(food);
    totals.net += n.net;
    totals.carbs += n.carbs;
    totals.fiber += n.fiber;
    totals.protein += n.protein;
    totals.fat += n.fat;
    totals.kcal += n.kcal;
    totals.gl += n.gl;
    zoneCounts[food.zone] += 1;
    items.push({ ...entry, food, nutrition: n });
  }

  for (const key of Object.keys(totals)) totals[key] = round(totals[key], 1);

  const servings = items.length;
  const vegShare = servings ? zoneCounts.veg / servings : 0;
  let score = 0;
  if (servings) {
    score = Math.round(
      96
      - 1.7 * totals.gl
      - 0.45 * totals.net
      + Math.min(8, 0.55 * totals.fiber)
      + Math.min(6, 0.08 * totals.protein)
      + 8 * vegShare
    );
    score = clamp(score, 0, 100);
  }

  let band = bandFor(score, servings);
  if (servings && (!zoneCounts.veg || !zoneCounts.protein || !zoneCounts.fat)) {
    const missing = !zoneCounts.veg ? 'non-starchy vegetables' : !zoneCounts.protein ? 'a protein' : 'a healthy fat';
    band = {
      label: 'Plate needs balance',
      tone: 'warn',
      advice: `Glycemically light so far, but add ${missing} to make it a complete plate.`,
    };
  }
  const advice = buildAdvice(band.advice, totals, zoneCounts, servings);
  return { totals, zoneCounts, servings, vegShare, score, band, advice, items };
}

function buildAdvice(base, totals, zones, servings) {
  if (!servings) return base;
  if (!zones.veg) return 'No non-starchy vegetables yet. That is the half of the plate doing the most work.';
  if (!zones.protein) return 'Add a palm of protein — salmon, eggs, chicken or tofu — to anchor satiety.';
  if (!zones.fat) return 'Add a measured fat or seed: avocado, nuts, olive oil or chia.';
  if (totals.net > 30) return 'Net carbs are above the 30 g gentle target. Shrink the berries or repeat a green vegetable.';
  if (totals.fiber < 8) return 'Fiber is under 8 g. Greens, chia or raspberries are the quickest fix.';
  return base;
}

/** Illustrative glucose response. A gamma-shaped curve that returns toward baseline. */
function glucoseCurve(summary, reference = false) {
  const baseline = 92;
  let gl;
  let fiber;
  let netCarbs;
  if (reference) {
    gl = 46;
    fiber = 5;
    netCarbs = 58;
  } else {
    gl = summary.totals.gl;
    fiber = summary.totals.fiber;
    netCarbs = summary.totals.net;
  }

  const rawRise = 3 + gl * 2.05;
  const fiberBrake = 1 - Math.min(0.4, (fiber / (fiber + 18)) * 0.5);
  const rise = summary.servings || reference ? clamp(rawRise, 3, 96) * fiberBrake : 0;
  const peakTime = reference ? 66 : 34 + Math.min(34, netCarbs * 0.9);
  const points = [];
  for (let minute = 0; minute <= 180; minute += 5) {
    const x = minute / peakTime;
    const shape = x <= 0 ? 0 : Math.pow(x, 1.6) * Math.exp(1.6 * (1 - x));
    points.push({ minute, value: round(baseline + rise * shape, 1) });
  }
  const peak = round(baseline + rise, 1);
  return { points, baseline, rise: round(rise, 1), peak, peakTime: Math.round(peakTime), gl: round(gl, 1) };
}

/** Score curve for the reference starchy meal once; used in the chart and copy. */
const REFERENCE_CURVE = glucoseCurve({ totals: { gl: 46, fiber: 5, net: 58 }, servings: 1 }, true);

/* --------------------------------------------------------------------------
   3. Local state and storage
   -------------------------------------------------------------------------- */

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const storedPrefs = readJSON(APP.storePrefs, {});
const storedMeals = readJSON(APP.storeMeals, []);

const state = {
  plate: [],
  selected: null,
  filter: 'all',
  query: '',
  theme: storedPrefs.theme === 'dark' ? 'dark' : storedPrefs.theme === 'light' ? 'light' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  autoRotate: storedPrefs.autoRotate === undefined ? !REDUCED_MOTION : Boolean(storedPrefs.autoRotate),
  meals: Array.isArray(storedMeals) ? storedMeals : [],
  warningId: null,
  seq: 1,
  lastPeak: null,
};

function uid() {
  state.seq += 1;
  return `serving-${state.seq}`;
}

/* --------------------------------------------------------------------------
   4. Theme
   -------------------------------------------------------------------------- */

function applyTheme(theme, { persist = false, scene = null } = {}) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#101713' : '#f5f1e6');
  const button = document.getElementById('btn-theme');
  if (button) {
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    button.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (persist) writeJSON(APP.storePrefs, { theme, autoRotate: state.autoRotate });
  if (scene) scene.setTheme(theme);
  if (chart) chart.refresh();
}

/* --------------------------------------------------------------------------
   5. Three.js plate scene
   -------------------------------------------------------------------------- */

const PLATE_TOP = 0.06;

const SLOTS = {
  veg: [
    [2.22, 28], [2.22, 72], [2.22, 110], [2.22, 152],
    [1.28, 42], [1.28, 90], [1.28, 138],
    [0.72, 90],
  ],
  protein: [
    [2.08, 206], [2.08, 242], [2.08, 268],
    [1.2, 238], [0.62, 238],
  ],
  fat: [
    [2.08, 292], [2.08, 316], [2.08, 340],
    [1.2, 316], [0.62, 316],
  ],
};

function polar(radius, degrees) {
  const radians = (degrees * Math.PI) / 180;
  return { x: Math.cos(radians) * radius, z: Math.sin(radians) * radius };
}

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: options.roughness ?? 0.62,
    metalness: options.metalness ?? 0.02,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ? new THREE.Color(options.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: options.emissiveIntensity ?? 0,
  });
}

function part(group, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function blob(radius = 1, detail = 1) {
  return new THREE.IcosahedronGeometry(radius, detail);
}

function makeBroccoli() {
  const g = new THREE.Group();
  const stemMat = material('#7ea25b', { roughness: 0.8 });
  const floretMat = material('#3f7d3a', { roughness: 0.85 });
  const floretLight = material('#4f9245', { roughness: 0.85 });
  part(g, new THREE.CylinderGeometry(0.07, 0.11, 0.5, 8), stemMat, [0, 0.25, 0]);
  const florets = [
    [0, 0.56, 0, 0.27], [-0.19, 0.48, 0.08, 0.2], [0.18, 0.51, 0.09, 0.21],
    [0.03, 0.47, -0.2, 0.2], [-0.05, 0.67, -0.04, 0.18], [0.14, 0.62, -0.13, 0.15],
  ];
  florets.forEach(([x, y, z, r], index) => {
    part(g, blob(r, 1), index % 2 ? floretLight : floretMat, [x, y, z], [index, index * 0.7, 0], [1, 0.9, 1]);
  });
  return g;
}

function makeSpinach() {
  const g = new THREE.Group();
  const leafMat = material('#427f36', { roughness: 0.75 });
  const leafLight = material('#589a45', { roughness: 0.75 });
  const stemMat = material('#7fa35a', { roughness: 0.8 });
  const leaves = [
    [-0.16, 0.2, 0.02, 0.45], [0.14, 0.24, 0.05, -0.5], [0.02, 0.28, -0.15, 0.1],
    [-0.08, 0.3, 0.19, 1.3], [0.22, 0.2, -0.12, 2.2], [-0.25, 0.17, -0.12, -1.2],
  ];
  leaves.forEach(([x, y, z, rot], index) => {
    part(g, new THREE.SphereGeometry(1, 10, 6), index % 2 ? leafMat : leafLight, [x, y, z], [0.25, rot, -0.12], [0.3, 0.05, 0.18]);
    part(g, new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), stemMat, [x * 0.55, y - 0.1, z * 0.55], [0.4, rot, 0.2]);
  });
  return g;
}

function makeCauliflower() {
  const g = new THREE.Group();
  const headMat = material('#f2e8cf', { roughness: 0.82 });
  const bumpMat = material('#e9ddc0', { roughness: 0.85 });
  const leafMat = material('#5d8a45', { roughness: 0.8 });
  part(g, blob(0.36, 2), headMat, [0, 0.4, 0], [0.2, 0.3, 0], [1, 0.92, 1]);
  const bumps = [[0.22, 0.52, 0.1], [-0.2, 0.5, 0.14], [0.02, 0.62, -0.16], [-0.24, 0.38, -0.18], [0.2, 0.34, -0.2], [0.0, 0.55, 0.25]];
  bumps.forEach(([x, y, z], index) => {
    part(g, blob(0.11, 1), index % 2 ? bumpMat : headMat, [x, y, z], [index, 0, 0]);
  });
  [[-0.28, 0.12, 0.1, -0.6], [0.3, 0.12, 0.08, 0.7], [0.05, 0.1, -0.3, 2.4]].forEach(([x, y, z, rot]) => {
    part(g, new THREE.SphereGeometry(1, 9, 5), leafMat, [x, y, z], [0.3, rot, 0], [0.26, 0.04, 0.15]);
  });
  return g;
}

function makeZucchini() {
  const g = new THREE.Group();
  const skin = material('#4c7a2d', { roughness: 0.55 });
  const light = material('#7fa34a', { roughness: 0.6 });
  const body = part(g, new THREE.CylinderGeometry(0.17, 0.17, 0.95, 14), skin, [0, 0.17, 0], [0, 0, Math.PI / 2]);
  body.rotation.z = Math.PI / 2;
  part(g, new THREE.SphereGeometry(0.17, 12, 8), skin, [-0.48, 0.17, 0], [0, 0, 0], [0.55, 0.55, 1]);
  part(g, new THREE.SphereGeometry(0.17, 12, 8), skin, [0.48, 0.17, 0], [0, 0, 0], [0.55, 0.55, 1]);
  [0, 0.05, -0.05].forEach((offset) => {
    part(g, new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), light, [0, 0.325 + offset, 0.04], [0, 0, Math.PI / 2], [1, 1, 0.5]);
  });
  part(g, new THREE.BoxGeometry(0.66, 0.018, 0.16), material('#c6d98a', { roughness: 0.5 }), [0, 0.335, 0.03], [0, 0, 0]);
  part(g, new THREE.CylinderGeometry(0.035, 0.05, 0.12, 6), material('#6f8f3a'), [0.52, 0.18, 0], [0, 0, Math.PI / 2]);
  return g;
}

function makePepper() {
  const g = new THREE.Group();
  const red = material('#c94f3d', { roughness: 0.45 });
  const redDark = material('#ae3f31', { roughness: 0.5 });
  part(g, new THREE.SphereGeometry(0.42, 18, 14), red, [0, 0.46, 0], [0, 0, 0], [1, 1.16, 0.92]);
  part(g, new THREE.SphereGeometry(0.2, 12, 10), redDark, [-0.24, 0.46, 0.14], [0, 0, 0], [1, 1.3, 0.9]);
  part(g, new THREE.SphereGeometry(0.2, 12, 10), redDark, [0.25, 0.46, 0.12], [0, 0, 0], [1, 1.3, 0.9]);
  part(g, new THREE.SphereGeometry(0.2, 12, 10), red, [0, 0.46, -0.24], [0, 0, 0], [1, 1.2, 0.85]);
  part(g, new THREE.CylinderGeometry(0.035, 0.05, 0.2, 6), material('#4f7a2e'), [0, 0.99, 0], [0.1, 0, 0.05]);
  [-0.18, 0, 0.18].forEach((angle) => {
    part(g, new THREE.TorusGeometry(0.36, 0.012, 4, 24, Math.PI), material('#a53f31', { roughness: 0.5 }), [0, 0.56, 0], [Math.PI / 2, 0, angle], [1, 0.7, 1]);
  });
  part(g, new THREE.SphereGeometry(1, 9, 5), material('#5f8f3a'), [0.16, 0.96, 0.02], [0.2, 0.5, 0.3], [0.16, 0.03, 0.09]);
  return g;
}

function makeAsparagus() {
  const g = new THREE.Group();
  const stalk = material('#6f9a44', { roughness: 0.7 });
  const tip = material('#557d33', { roughness: 0.72 });
  for (let i = 0; i < 5; i += 1) {
    const x = (i - 2) * 0.075;
    const tilt = (i - 2) * 0.035;
    part(g, new THREE.CylinderGeometry(0.032, 0.038, 0.95, 7), stalk, [x, 0.09, 0], [Math.PI / 2 + tilt, 0, 0]);
    part(g, new THREE.ConeGeometry(0.06, 0.17, 7), tip, [x, 0.09, -0.54], [Math.PI / 2 + tilt, 0, 0]);
  }
  return g;
}

function makeSalmon() {
  const g = new THREE.Group();
  const flesh = material('#e88a70', { roughness: 0.48 });
  const pale = material('#ffd4c2', { roughness: 0.5 });
  const skin = material('#8b5f52', { roughness: 0.7 });
  part(g, new THREE.CapsuleGeometry(0.23, 0.5, 5, 12), flesh, [0, 0.18, 0], [0, 0, Math.PI / 2], [1, 0.62, 1.25]);
  part(g, new THREE.CapsuleGeometry(0.2, 0.45, 4, 10), skin, [0, 0.075, 0], [0, 0, Math.PI / 2], [1, 0.18, 1.22]);
  for (let i = 0; i < 4; i += 1) {
    part(g, new THREE.BoxGeometry(0.045, 0.014, 0.43), pale, [-0.25 + i * 0.16, 0.345, 0], [0, 0.12, 0]);
  }
  part(g, new THREE.BoxGeometry(0.02, 0.012, 0.4), material('#d56f57'), [0.05, 0.35, 0], [0, -0.1, 0]);
  return g;
}

function makeEgg() {
  const g = new THREE.Group();
  const white = material('#faf5e8', { roughness: 0.38 });
  const yolk = material('#e9a72d', { roughness: 0.3, emissive: '#5a3600', emissiveIntensity: 0.08 });
  // Sunny-side-up: a low, wavy white with a visible yolk dome.
  part(g, new THREE.SphereGeometry(0.4, 20, 12), white, [0, 0.04, 0], [0, 0.2, 0], [1, 0.22, 0.86]);
  part(g, new THREE.SphereGeometry(0.2, 14, 10), white, [0.16, 0.05, 0.12], [0, 0.5, 0], [0.55, 0.2, 0.5]);
  part(g, new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), yolk, [0.01, 0.08, 0.02], [0, 0, 0], [1, 1, 1]);
  return g;
}

function makeChicken() {
  const g = new THREE.Group();
  const meat = material('#d6a06d', { roughness: 0.65 });
  const char = material('#94603d', { roughness: 0.8 });
  part(g, new THREE.CapsuleGeometry(0.22, 0.52, 5, 12), meat, [0, 0.2, 0], [0, 0, Math.PI / 2], [1, 0.62, 1.12]);
  [-0.2, 0, 0.2].forEach((x, index) => {
    part(g, new THREE.BoxGeometry(0.035, 0.012, 0.33), char, [x, 0.3, 0.02], [0, 0.2 + index * 0.08, 0]);
  });
  return g;
}

function makeTofu() {
  const g = new THREE.Group();
  const curd = material('#f1e7d2', { roughness: 0.7 });
  const edge = new THREE.LineBasicMaterial({ color: new THREE.Color('#d8c8a8'), transparent: true, opacity: 0.7 });
  const positions = [[-0.06, 0.17, 0.02, 0.15], [0.02, 0.38, -0.03, -0.1], [0.08, 0.58, 0.04, 0.35]];
  positions.forEach(([x, y, z, rot]) => {
    const size = 0.34;
    const cube = part(g, new THREE.BoxGeometry(size, size, size), curd, [x, y, z], [0, rot, 0.03]);
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), edge);
    lines.position.copy(cube.position);
    lines.rotation.copy(cube.rotation);
    g.add(lines);
  });
  return g;
}

function makeAvocado() {
  const g = new THREE.Group();
  const skin = material('#3f5d27', { roughness: 0.62 });
  const flesh = material('#a9c76a', { roughness: 0.4 });
  const inner = material('#c9d98d', { roughness: 0.42 });
  part(g, new THREE.SphereGeometry(0.46, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), skin, [0, 0.01, 0], [0, 0.4, 0], [1, 0.62, 1]);
  part(g, new THREE.SphereGeometry(0.41, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), flesh, [0, 0.035, 0], [0, 0.4, 0], [1, 0.58, 1]);
  part(g, new THREE.CircleGeometry(0.4, 24), inner, [0, 0.04, 0], [-Math.PI / 2, 0, 0], [1, 0.92, 1]);
  part(g, new THREE.SphereGeometry(0.16, 14, 10), material('#7c4a2b', { roughness: 0.8 }), [0.02, 0.2, 0.02], [0, 0.3, 0], [1, 0.9, 1]);
  return g;
}

function makeAlmonds() {
  const g = new THREE.Group();
  const tan = material('#b07a43', { roughness: 0.82 });
  const dark = material('#93602f', { roughness: 0.85 });
  const spots = [[-0.32, 0.1, 0.16, 0.5], [0.18, 0.1, 0.23, -0.4], [0.33, 0.1, -0.12, 1.1], [-0.08, 0.11, -0.27, 0.2], [-0.37, 0.09, -0.18, 2.1], [0.06, 0.12, 0.03, -1.2], [0.3, 0.12, 0.2, 0.9]];
  spots.forEach(([x, y, z, rot], index) => {
    part(g, new THREE.SphereGeometry(1, 10, 8), index % 2 ? tan : dark, [x, y, z], [0.18, rot, 0.14], [0.12, 0.16, 0.055]);
  });
  part(g, new THREE.TorusGeometry(0.18, 0.012, 4, 16), material('#d5b086', { roughness: 0.9 }), [0, 0.15, 0], [Math.PI / 2, 0, 0]);
  return g;
}

function makeWalnuts() {
  const g = new THREE.Group();
  const shell = material('#8b5e3c', { roughness: 0.85 });
  const light = material('#a7784f', { roughness: 0.82 });
  const spots = [[-0.18, 0.16, 0.08, 0.3], [0.16, 0.17, -0.02, -0.4], [0.0, 0.15, -0.2, 1.2]];
  spots.forEach(([x, y, z, rot], index) => {
    part(g, blob(0.17, 1), index % 2 ? shell : light, [x, y, z], [0.2, rot, 0.1], [1.25, 0.8, 0.9]);
    part(g, blob(0.08, 1), shell, [x + 0.08, y + 0.08, z], [0.4, rot, 0], [1, 0.7, 1]);
  });
  return g;
}

function makeOliveOil() {
  const g = new THREE.Group();
  const glass = material('#7d9440', { roughness: 0.15, metalness: 0.05, opacity: 0.78 });
  const oil = material('#c8a52f', { roughness: 0.25, opacity: 0.85 });
  part(g, new THREE.CylinderGeometry(0.17, 0.21, 0.52, 16), glass, [0, 0.26, 0]);
  part(g, new THREE.CylinderGeometry(0.15, 0.17, 0.36, 16), oil, [0, 0.22, 0]);
  part(g, new THREE.CylinderGeometry(0.07, 0.13, 0.16, 12), glass, [0, 0.59, 0]);
  part(g, new THREE.CylinderGeometry(0.07, 0.07, 0.18, 12), glass, [0, 0.72, 0]);
  part(g, new THREE.CylinderGeometry(0.075, 0.075, 0.07, 10), material('#a87b45', { roughness: 0.9 }), [0, 0.83, 0]);
  part(g, new THREE.BoxGeometry(0.24, 0.19, 0.01), material('#efe4c8', { roughness: 0.9 }), [0, 0.31, 0.185]);
  return g;
}

function makeChia() {
  const g = new THREE.Group();
  const bowl = material('#eee7d6', { roughness: 0.38 });
  const seedA = material('#3a332b', { roughness: 0.9 });
  const seedB = material('#d8cdb8', { roughness: 0.9 });
  part(g, new THREE.CylinderGeometry(0.36, 0.28, 0.13, 20), bowl, [0, 0.07, 0]);
  part(g, new THREE.CylinderGeometry(0.3, 0.3, 0.02, 20), material('#d9cfb9', { roughness: 0.95 }), [0, 0.075, 0]);
  for (let i = 0; i < 22; i += 1) {
    const angle = i * 2.399;
    const radius = 0.27 * Math.sqrt((i + 1) / 22);
    part(g, new THREE.SphereGeometry(0.022, 6, 5), i % 3 ? seedA : seedB, [Math.cos(angle) * radius, 0.105 + (i % 2) * 0.012, Math.sin(angle) * radius]);
  }
  return g;
}

function makeStrawberry() {
  const g = new THREE.Group();
  const red = material('#cf3f45', { roughness: 0.45 });
  const seed = material('#e8c66a', { roughness: 0.6 });
  const leaf = material('#4d8237', { roughness: 0.7 });
  part(g, new THREE.ConeGeometry(0.24, 0.52, 16), red, [0, 0.31, 0], [Math.PI, 0, 0], [1, 1, 1]);
  for (let i = 0; i < 10; i += 1) {
    const angle = i * 2.399;
    const y = 0.16 + (i % 4) * 0.08;
    const radius = 0.2 * (1 - (y - 0.1) / 0.6);
    part(g, new THREE.SphereGeometry(0.014, 5, 4), seed, [Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
  }
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    part(g, new THREE.SphereGeometry(1, 7, 5), leaf, [Math.cos(angle) * 0.12, 0.58, Math.sin(angle) * 0.12], [0.3, angle, 0.2], [0.13, 0.03, 0.06]);
  }
  part(g, new THREE.CylinderGeometry(0.02, 0.025, 0.11, 5), leaf, [0, 0.63, 0]);
  return g;
}

function makeRaspberry() {
  const g = new THREE.Group();
  const pink = material('#b23a5e', { roughness: 0.55 });
  const pinkLight = material('#c95372', { roughness: 0.55 });
  const leaf = material('#55853d', { roughness: 0.7 });
  const drupes = [[0, 0.32, 0], [0.13, 0.3, 0.03], [-0.12, 0.3, 0.04], [0.05, 0.3, 0.13], [0.04, 0.3, -0.13], [0.16, 0.22, -0.05], [-0.16, 0.22, -0.03], [0, 0.19, 0.14], [0, 0.19, -0.15]];
  drupes.forEach(([x, y, z], index) => {
    part(g, new THREE.SphereGeometry(0.085, 9, 7), index % 2 ? pink : pinkLight, [x, y, z]);
  });
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    part(g, new THREE.SphereGeometry(1, 7, 5), leaf, [Math.cos(angle) * 0.1, 0.42, Math.sin(angle) * 0.1], [0.2, angle, 0.2], [0.11, 0.025, 0.05]);
  }
  return g;
}

function makeBlueberry() {
  const g = new THREE.Group();
  const blue = material('#3d4d86', { roughness: 0.85 });
  const blueLight = material('#52649e', { roughness: 0.85 });
  const spots = [[-0.16, 0.14, 0.08], [0.15, 0.14, 0.11], [0.06, 0.15, -0.16], [-0.1, 0.25, -0.03], [0.02, 0.12, 0.02], [0.23, 0.24, -0.08], [-0.24, 0.25, -0.06]];
  spots.forEach(([x, y, z], index) => {
    part(g, new THREE.SphereGeometry(0.12, 10, 8), index % 2 ? blue : blueLight, [x, y, z], [0, index, 0], [1, 0.9, 1]);
  });
  return g;
}

const FOOD_FACTORIES = {
  broccoli: makeBroccoli,
  spinach: makeSpinach,
  cauliflower: makeCauliflower,
  zucchini: makeZucchini,
  'bell-pepper': makePepper,
  asparagus: makeAsparagus,
  salmon: makeSalmon,
  egg: makeEgg,
  chicken: makeChicken,
  tofu: makeTofu,
  avocado: makeAvocado,
  almonds: makeAlmonds,
  walnuts: makeWalnuts,
  'olive-oil': makeOliveOil,
  chia: makeChia,
  strawberries: makeStrawberry,
  raspberries: makeRaspberry,
  blueberries: makeBlueberry,
};

function gradientTexture(top, bottom) {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 8, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function textSprite(text, color = '#3c5147', size = 42) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = `700 ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
  const pillWidth = Math.min(470, Math.max(220, ctx.measureText(text).width + 96));
  ctx.beginPath();
  ctx.roundRect((512 - pillWidth) / 2, 18, pillWidth, 92, 46);
  ctx.fillStyle = 'rgba(255, 252, 244, 0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 81, 71, 0.14)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `700 ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false, opacity: 0.92 });
}

class PlateScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.host = canvas.parentElement;
    this.items = new Map();
    this.selectedUid = null;
    this.hoveredUid = null;
    this.pointerStart = null;
    this.clock = new THREE.Clock();
    this.frame = 0;
    this.onSelect = null;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.theme = state.theme;
    this.background = gradientTexture(this.theme === 'dark' ? '#1c2a21' : '#f0ead9', this.theme === 'dark' ? '#111b15' : '#e6dfcd');
    this.scene.background = this.background;
    this.scene.fog = new THREE.Fog(this.theme === 'dark' ? '#111b15' : '#e6dfcd', 16, 30);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    this.camera.position.set(0, 7.4, 8.8);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.target.set(0, 0.35, 0);
    this.controls.minDistance = 7;
    this.controls.maxDistance = 18;
    this.controls.minPolarAngle = 0.32;
    this.controls.maxPolarAngle = 1.36;
    this.controls.autoRotate = state.autoRotate;
    this.controls.autoRotateSpeed = 0.55;
    this.controls.update();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.setupLights();
    this.setupTable();
    this.setupPlate();
    this.setupSelection();
    this.setupPointer();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.loop = this.loop.bind(this);
    this.frame = requestAnimationFrame(this.loop);
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xfff7e7, 0x58664f, 1.15));

    const key = new THREE.DirectionalLight(0xfff1d4, 2.0);
    key.position.set(5.5, 10, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);
    this.keyLight = key;

    const fill = new THREE.DirectionalLight(0xd9ecff, 0.58);
    fill.position.set(-7, 5, -5);
    this.scene.add(fill);

    const rim = new THREE.PointLight(0xffe1b0, 18, 22, 1.8);
    rim.position.set(0, 4.5, -7);
    this.scene.add(rim);
  }

  setupTable() {
    const tableMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.theme === 'dark' ? '#1a241d' : '#d9cfb8'),
      roughness: 0.95,
      metalness: 0,
    });
    const table = new THREE.Mesh(new THREE.CircleGeometry(18, 72), tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.26;
    table.receiveShadow = true;
    this.scene.add(table);
    this.table = table;

    const clothMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.theme === 'dark' ? '#243528' : '#b8c4a6'),
      roughness: 0.98,
    });
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(12, 8.4), clothMat);
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(0, -0.255, 0.4);
    cloth.receiveShadow = true;
    this.scene.add(cloth);
    this.cloth = cloth;
  }

  setupPlate() {
    const group = new THREE.Group();
    this.scene.add(group);
    this.plateGroup = group;

    const china = new THREE.MeshStandardMaterial({ color: new THREE.Color('#fbf8ee'), roughness: 0.32, metalness: 0.02 });
    const chinaSoft = new THREE.MeshStandardMaterial({ color: new THREE.Color('#f4efe2'), roughness: 0.5, metalness: 0.01 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.34, 0.24, 72), china);
    base.position.y = -0.12;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const well = new THREE.Mesh(new THREE.CircleGeometry(3.16, 72), chinaSoft);
    well.rotation.x = -Math.PI / 2;
    well.position.y = 0.002;
    well.receiveShadow = true;
    group.add(well);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.105, 14, 96), china);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.035;
    rim.castShadow = true;
    group.add(rim);

    const zoneDefs = [
      { zone: 'veg', start: 0, length: Math.PI },
      { zone: 'protein', start: Math.PI, length: Math.PI / 2 },
      { zone: 'fat', start: (3 * Math.PI) / 2, length: Math.PI / 2 },
    ];
    for (const def of zoneDefs) {
      const geo = new THREE.RingGeometry(0.34, 3.08, 72, 1, def.start, def.length);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ZONE_COLORS[def.zone]),
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.012;
      ring.receiveShadow = true;
      group.add(ring);
    }

    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color('#ffffff'), transparent: true, opacity: 0.65 });
    [0, Math.PI, (3 * Math.PI) / 2].forEach((angle) => {
      const points = [
        new THREE.Vector3(Math.cos(angle) * 0.38, 0.02, Math.sin(angle) * 0.38),
        new THREE.Vector3(Math.cos(angle) * 3.05, 0.02, Math.sin(angle) * 3.05),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geometry, lineMat));
    });

    const labelDefs = [
      { text: '50% VEG', angle: Math.PI / 2, radius: 2.62, color: '#2f6b47' },
      { text: '25% PROTEIN', angle: (5 * Math.PI) / 4, radius: 2.62, color: '#8e4433' },
      { text: '25% FATS', angle: (7 * Math.PI) / 4, radius: 2.62, color: '#8a5c00' },
    ];
    for (const def of labelDefs) {
      const sprite = new THREE.Sprite(textSprite(def.text, def.color, 40));
      const p = polar(def.radius, (def.angle * 180) / Math.PI);
      sprite.position.set(p.x, 0.12, p.z);
      sprite.scale.set(1.5, 0.38, 1);
      sprite.renderOrder = 3;
      group.add(sprite);
    }

    this.setupCutlery(group);
  }

  setupCutlery(group) {
    const metal = new THREE.MeshStandardMaterial({ color: new THREE.Color('#c8c4b9'), roughness: 0.28, metalness: 0.88 });
    const handle = new THREE.MeshStandardMaterial({ color: new THREE.Color('#5b4a3a'), roughness: 0.55, metalness: 0.1 });

    const fork = new THREE.Group();
    const forkHandle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 1.35), handle);
    forkHandle.position.z = 0.72;
    fork.add(forkHandle);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.38), metal);
    neck.position.z = -0.02;
    fork.add(neck);
    for (let i = 0; i < 4; i += 1) {
      const tine = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.42), metal);
      tine.position.set(-0.13 + i * 0.088, 0, -0.4);
      fork.add(tine);
    }
    fork.position.set(-4.35, -0.23, 0.5);
    fork.rotation.y = 0.28;
    fork.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    group.add(fork);

    const knife = new THREE.Group();
    const knifeHandle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 1.2), handle);
    knifeHandle.position.z = 0.8;
    knife.add(knifeHandle);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 1.65), metal);
    blade.position.z = -0.22;
    knife.add(blade);
    knife.position.set(4.35, -0.23, 0.5);
    knife.rotation.y = -0.28;
    knife.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    group.add(knife);
  }

  setupSelection() {
    const geometry = new THREE.TorusGeometry(0.55, 0.025, 8, 40);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#d8a23c'), transparent: true, opacity: 0.9 });
    this.selectionRing = new THREE.Mesh(geometry, mat);
    this.selectionRing.rotation.x = Math.PI / 2;
    this.selectionRing.position.y = PLATE_TOP + 0.005;
    this.selectionRing.visible = false;
    this.scene.add(this.selectionRing);
  }

  setupPointer() {
    const canvas = this.canvas;
    const previous = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', (event) => {
      this.pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
      previous.x = event.clientX;
      previous.y = event.clientY;
    });
    canvas.addEventListener('pointerup', (event) => {
      const start = this.pointerStart;
      this.pointerStart = null;
      if (!start) return;
      const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (distance > 7) return;
      const hit = this.pick(event);
      if (this.onSelect) this.onSelect(hit ? hit.uid : null);
    });
    canvas.addEventListener('pointermove', (event) => {
      const dx = Math.abs(event.clientX - previous.x);
      const dy = Math.abs(event.clientY - previous.y);
      previous.x = event.clientX;
      previous.y = event.clientY;
      if (event.pointerType === 'touch') return;
      if (dx + dy < 2 && this.frame % 2 === 0) return;
      const hit = this.pick(event);
      this.host.classList.toggle('is-hovering', Boolean(hit));
      this.setHover(hit);
    });
    canvas.addEventListener('pointerleave', () => {
      this.host.classList.remove('is-hovering');
      this.setHover(null);
    });
  }

  setHover(hit) {
    this.hoveredUid = hit ? hit.uid : null;
    let tip = document.getElementById('scene-tip');
    if (!this.tip) {
      tip = document.createElement('div');
      tip.id = 'scene-tip';
      tip.className = 'scene-tip';
      this.host.appendChild(tip);
      this.tip = tip;
    }
    if (!hit) {
      this.tip.classList.remove('is-visible');
      return;
    }
    const food = FOOD_BY_ID.get(hit.uid ? this.items.get(hit.uid)?.entry.foodId : null);
    if (!food) {
      this.tip.classList.remove('is-visible');
      return;
    }
    const rect = this.host.getBoundingClientRect();
    this.tip.textContent = `${food.name} · ${nutritionFor(food).net.toFixed(1)} g net carbs`;
    this.tip.style.left = `${hit.x - rect.left + 14}px`;
    this.tip.style.top = `${hit.y - rect.top + 12}px`;
    this.tip.classList.add('is-visible');
  }

  pick(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const groups = [...this.items.values()].map((item) => item.group);
    if (!groups.length) return null;
    const intersections = this.raycaster.intersectObjects(groups, true);
    if (!intersections.length) return null;
    let node = intersections[0].object;
    while (node && !node.userData.servingUid) node = node.parent;
    if (!node) return null;
    return { uid: node.userData.servingUid, x: event.clientX, y: event.clientY };
  }

  add(entry) {
    const food = FOOD_BY_ID.get(entry.foodId);
    if (!food) return;
    const factory = FOOD_FACTORIES[food.id];
    if (!factory) return;
    const group = factory();
    group.userData.servingUid = entry.uid;
    group.userData.baseScale = food.scale * 1.18;
    group.userData.phase = (state.seq * 1.7) % 6.28;
    group.userData.born = performance.now();
    group.userData.removing = false;
    group.userData.foodId = food.id;
    group.scale.setScalar(0.001);
    const target = this.targetFor(entry, state.plate);
    group.position.set(target.x, target.y + 1.1, target.z);
    group.userData.target = target;
    this.scene.add(group);
    this.items.set(entry.uid, { group, entry, food });
    this.layout();
  }

  remove(entryUid) {
    const item = this.items.get(entryUid);
    if (!item) return;
    item.group.userData.removing = true;
    item.group.userData.removeStart = performance.now();
    this.layout();
    if (this.selectedUid === entryUid) this.highlight(null);
  }

  clear() {
    for (const uid of [...this.items.keys()]) this.remove(uid);
    this.layout();
  }

  targetFor(entry, plate) {
    const food = FOOD_BY_ID.get(entry.foodId);
    if (!food) return new THREE.Vector3(0, PLATE_TOP, 0);
    const sameZone = plate.filter((item) => {
      const f = FOOD_BY_ID.get(item.foodId);
      return f && f.zone === food.zone;
    });
    const index = Math.max(0, sameZone.findIndex((item) => item.uid === entry.uid));
    const slots = SLOTS[food.zone];
    const slot = slots[index % slots.length];
    const overflow = Math.floor(index / slots.length);
    const p = polar(slot[0] - overflow * 0.18, slot[1] + overflow * 7);
    return new THREE.Vector3(p.x, PLATE_TOP, p.z);
  }

  layout() {
    const live = state.plate;
    for (const item of this.items.values()) {
      if (item.group.userData.removing) continue;
      const target = this.targetFor(item.entry, live);
      item.group.userData.target = target;
    }
    this.syncSelection();
  }

  highlight(entryUid) {
    this.selectedUid = entryUid;
    this.syncSelection();
  }

  syncSelection() {
    if (!this.selectedUid || !this.items.has(this.selectedUid)) {
      this.selectionRing.visible = false;
      return;
    }
    const item = this.items.get(this.selectedUid);
    const target = item.group.userData.target;
    this.selectionRing.position.set(target.x, PLATE_TOP + 0.006, target.z);
    this.selectionRing.scale.setScalar((item.food.ring || 0.5) * 1.18);
    this.selectionRing.visible = true;
  }

  setAutoRotate(enabled) {
    this.controls.autoRotate = enabled;
  }

  resetView() {
    this.camera.position.set(0, 7.4, 8.8);
    this.controls.target.set(0, 0.35, 0);
    this.controls.update();
  }

  setTheme(theme) {
    this.theme = theme;
    this.scene.background?.dispose?.();
    this.background = gradientTexture(theme === 'dark' ? '#1c2a21' : '#f0ead9', theme === 'dark' ? '#111b15' : '#e6dfcd');
    this.scene.background = this.background;
    this.scene.fog = new THREE.Fog(theme === 'dark' ? '#111b15' : '#e6dfcd', 16, 30);
    this.table.material.color.set(new THREE.Color(theme === 'dark' ? '#1a241d' : '#d9cfb8'));
    this.cloth.material.color.set(new THREE.Color(theme === 'dark' ? '#243528' : '#b8c4a6'));
    this.keyLight.intensity = theme === 'dark' ? 1.8 : 2.0;
  }

  resize() {
    const rect = this.host.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  loop() {
    this.frame = requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const now = performance.now();
    const elapsed = this.clock.getElapsedTime();

    for (const [entryUid, item] of [...this.items]) {
      const { group } = item;
      const target = group.userData.target;
      const born = group.userData.born || now;
      const age = now - born;
      const t = clamp(age / 520, 0, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      let removeFactor = 1;
      if (group.userData.removing) {
        const rt = clamp((now - (group.userData.removeStart || now)) / 260, 0, 1);
        removeFactor = 1 - rt;
        if (rt >= 1) {
          this.scene.remove(group);
          group.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) child.material.forEach((mat) => mat.dispose());
              else child.material.dispose();
            }
          });
          this.items.delete(entryUid);
          if (this.selectedUid === entryUid) this.highlight(null);
          continue;
        }
      }
      const scale = (group.userData.baseScale || 1) * Math.max(0.001, ease * removeFactor);
      group.scale.setScalar(scale);
      group.position.x = target.x;
      group.position.z = target.z;
      group.position.y = target.y + (1 - ease) * 1.0 + Math.sin(elapsed * 1.15 + group.userData.phase) * 0.012;
      group.rotation.y = Math.sin(elapsed * 0.35 + group.userData.phase) * 0.035;
    }

    if (this.selectionRing.visible) {
      const pulse = 1 + Math.sin(elapsed * 2.4) * 0.035;
      this.selectionRing.scale.multiplyScalar(1);
      this.selectionRing.material.opacity = 0.65 + Math.sin(elapsed * 2.4) * 0.2;
      this.selectionRing.scale.setScalar((this.items.get(this.selectedUid)?.food.ring || 0.5) * 1.18 * pulse);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  info() {
    return {
      items: this.items.size,
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      distance: round(this.camera.position.distanceTo(this.controls.target), 1),
      webgl: Boolean(this.renderer.getContext()),
    };
  }
}

/* --------------------------------------------------------------------------
   6. Glucose chart
   -------------------------------------------------------------------------- */

class GlucoseChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.summary = null;
    this.animation = 0;
    this.progress = 1;
    this.resizeObserver = new ResizeObserver(() => this.draw(this.progress));
    this.resizeObserver.observe(canvas.parentElement);
    this.draw(1);
  }

  setSummary(summary) {
    this.summary = summary;
    const safe = glucoseCurve(summary);
    this.safe = safe;
    this.reference = REFERENCE_CURVE;
    cancelAnimationFrame(this.animation);
    if (REDUCED_MOTION) {
      this.progress = 1;
      this.draw(1);
      return;
    }
    const start = performance.now();
    const duration = 650;
    const step = (now) => {
      this.progress = clamp((now - start) / duration, 0, 1);
      this.draw(this.progress);
      if (this.progress < 1) this.animation = requestAnimationFrame(step);
    };
    this.animation = requestAnimationFrame(step);
  }

  refresh() {
    this.draw(this.progress);
  }

  draw(progress = 1) {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = rect.width;
    const height = rect.height;
    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue('--ink').trim() || '#15251d';
    const muted = styles.getPropertyValue('--muted').trim() || '#6f7f75';
    const faint = styles.getPropertyValue('--faint').trim() || '#98a59c';
    const line = styles.getPropertyValue('--line').trim() || '#ddd5c3';
    const green = '#7ac142';
    const warn = styles.getPropertyValue('--warn').trim() || '#c4502f';

    ctx.clearRect(0, 0, width, height);
    const margin = { top: 13, right: 8, bottom: 20, left: 29 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    if (plotW < 20 || plotH < 20) return;

    const xMin = 0;
    const xMax = 180;
    const yMin = 60;
    const yMax = 200;
    const x = (minute) => margin.left + ((minute - xMin) / (xMax - xMin)) * plotW;
    const y = (value) => margin.top + (1 - (value - yMin) / (yMax - yMin)) * plotH;

    // Target band
    ctx.fillStyle = 'rgba(122, 193, 66, 0.075)';
    ctx.fillRect(margin.left, y(140), plotW, y(70) - y(140));
    ctx.strokeStyle = 'rgba(122, 193, 66, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(margin.left, y(70));
    ctx.lineTo(margin.left + plotW, y(70));
    ctx.moveTo(margin.left, y(140));
    ctx.lineTo(margin.left + plotW, y(140));
    ctx.stroke();
    ctx.setLineDash([]);

    // Grid and y labels
    ctx.font = '8.5px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = faint;
    [70, 100, 140, 180].forEach((value) => {
      ctx.strokeStyle = line;
      ctx.globalAlpha = value === 70 || value === 140 ? 0 : 0.55;
      ctx.beginPath();
      ctx.moveTo(margin.left, y(value));
      ctx.lineTo(margin.left + plotW, y(value));
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillText(String(value), margin.left - 5, y(value));
    });

    // Baseline
    ctx.strokeStyle = muted;
    ctx.globalAlpha = 0.35;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(margin.left, y(92));
    ctx.lineTo(margin.left + plotW, y(92));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = faint;
    [0, 30, 60, 90, 120, 150, 180].forEach((minute) => {
      ctx.textAlign = minute === 0 ? 'left' : minute === 180 ? 'right' : 'center';
      ctx.fillText(minute === 180 ? '180 min' : String(minute), x(minute), height - margin.bottom + 5);
    });
    ctx.textAlign = 'center';

    if (!this.reference || !this.safe) {
      this.drawEmpty(ctx, width, height, muted);
      return;
    }

    const clipW = plotW * clamp(progress, 0, 1);
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin.left, margin.top, clipW, plotH);
    ctx.clip();

    // Reference (starchy) curve
    this.drawLine(ctx, this.reference.points, x, y, warn, 1.6, [4, 4]);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(margin.left, margin.top, clipW, plotH);
    ctx.clip();

    // Safe fill
    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + plotH);
    gradient.addColorStop(0, 'rgba(122, 193, 66, 0.26)');
    gradient.addColorStop(1, 'rgba(122, 193, 66, 0.01)');
    ctx.beginPath();
    const safePoints = this.safe.points;
    ctx.moveTo(x(safePoints[0].minute), y(safePoints[0].value));
    for (const point of safePoints) ctx.lineTo(x(point.minute), y(point.value));
    ctx.lineTo(x(180), y(92));
    ctx.lineTo(x(0), y(92));
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    this.drawLine(ctx, safePoints, x, y, green, 2.4, []);
    ctx.restore();

    // Peak markers
    if (progress > 0.65) {
      const alpha = clamp((progress - 0.65) / 0.35, 0, 1);
      ctx.globalAlpha = alpha;
      this.drawPeak(ctx, this.safe, x, y, green, ink, true);
      this.drawPeak(ctx, this.reference, x, y, warn, muted, false);
      ctx.globalAlpha = 1;
    }

    // Y axis caption
    ctx.save();
    ctx.translate(8, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '7.5px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = faint;
    ctx.fillText('mg/dL', 0, 0);
    ctx.restore();

    if (progress < 1) {
      // A subtle leading dot makes the draw-in legible.
      const idx = Math.min(safePoints.length - 1, Math.floor(progress * safePoints.length));
      const point = safePoints[idx];
      ctx.beginPath();
      ctx.arc(x(point.minute), y(point.value), 2.6, 0, Math.PI * 2);
      ctx.fillStyle = green;
      ctx.fill();
    }
  }

  drawLine(ctx, points, x, y, color, width, dash) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.setLineDash(dash);
    ctx.beginPath();
    points.forEach((point, index) => {
      const px = x(point.minute);
      const py = y(point.value);
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawPeak(ctx, curve, x, y, color, labelColor, isSafe) {
    const peakPoint = curve.points.reduce((best, point) => (point.value > best.value ? point : best), curve.points[0]);
    ctx.beginPath();
    ctx.arc(x(peakPoint.minute), y(peakPoint.value), isSafe ? 3.1 : 2.4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    const label = `+${Math.round(curve.rise)}`;
    ctx.font = '700 8px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = labelColor;
    ctx.fillText(label, x(peakPoint.minute) + 4, y(peakPoint.value) - 3);
  }

  drawEmpty(ctx, width, height, color) {
    ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText('Add food to model your plate', width / 2, height / 2 + 6);
  }
}

/* --------------------------------------------------------------------------
   7. DOM references and formatting helpers
   -------------------------------------------------------------------------- */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const dom = {
  foodGrid: $('#food-grid'),
  foodCount: $('#food-count'),
  emptyResults: $('#empty-results'),
  searchInput: $('#food-search-input'),
  searchClear: $('#search-clear'),
  watchoutList: $('#watchout-list'),
  swapList: $('#swap-list'),
  swapsMeta: $('#swaps-meta'),
  plateList: $('#plate-list'),
  plateListEmpty: $('#plate-list-empty'),
  selectedCard: $('#selected-card'),
  selectedName: $('#selected-name'),
  selectedMeta: $('#selected-meta'),
  selectedWhy: $('#selected-why'),
  scoreNumber: $('#score-number'),
  scoreBand: $('#score-band'),
  scoreAdvice: $('#score-advice'),
  ringValue: $('#ring-value'),
  macroCarbs: $('#macro-carbs'),
  macroFiber: $('#macro-fiber'),
  macroProtein: $('#macro-protein'),
  macroKcal: $('#macro-kcal'),
  macroCarbsNote: $('#macro-carbs-note'),
  macroFiberNote: $('#macro-fiber-note'),
  hudScore: $('#hud-score'),
  hudCarbs: $('#hud-carbs'),
  hudFiber: $('#hud-fiber'),
  hudGl: $('#hud-gl'),
  balanceVeg: $('#balance-veg'),
  balanceProtein: $('#balance-protein'),
  balanceFat: $('#balance-fat'),
  balanceNote: $('#balance-note'),
  plateCount: $('#plate-count'),
  plateEmpty: $('#plate-empty'),
  stageWrap: $('#stage-wrap'),
  stageLoading: $('#stage-loading'),
  chart: $('#cgm-chart'),
  cgmSafePeak: $('#cgm-safe-peak'),
  cgmStarchPeak: $('#cgm-starch-peak'),
  cgmRise: $('#cgm-rise'),
  cgmTime: $('#cgm-time'),
  cgmLoad: $('#cgm-load'),
  cgmNote: $('#cgm-note'),
  logList: $('#log-list'),
  logEmpty: $('#log-empty'),
  savePreview: $('#save-preview'),
  warningDialog: $('#warning-dialog'),
  warningTitle: $('#warning-title'),
  warningDesc: $('#warning-desc'),
  warningStats: $('#warning-stats'),
  warningWhy: $('#warning-why'),
  warningSwapList: $('#warning-swap-list'),
  warningSource: $('#warning-source'),
  toastRegion: $('#toast-region'),
  saveDialog: $('#save-dialog'),
  saveName: $('#save-name'),
  guideDialog: $('#guide-dialog'),
  sourcesDialog: $('#sources-dialog'),
  sourceList: $('#source-list'),
  mobileDock: $('#mobile-dock'),
  dockScore: $('#dock-score'),
  dockCarbs: $('#dock-carbs'),
};

const nf1 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

/* --------------------------------------------------------------------------
   8. Toast / dialog utilities
   -------------------------------------------------------------------------- */

let toastCount = 0;

function toast(message, tone = '') {
  if (!dom.toastRegion) return;
  while (dom.toastRegion.children.length >= 3) dom.toastRegion.firstElementChild.remove();
  const element = document.createElement('div');
  element.className = `toast ${tone}`.trim();
  element.textContent = message;
  dom.toastRegion.appendChild(element);
  toastCount += 1;
  const current = toastCount;
  window.setTimeout(() => {
    element.classList.add('is-out');
    window.setTimeout(() => element.remove(), 300);
  }, 3400 + current * 20);
}

function openDialog(dialog) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog && dialog.open) dialog.close();
}

/* --------------------------------------------------------------------------
   9. Rendering: pantry, watch-outs, swaps, plate, log
   -------------------------------------------------------------------------- */

function matchesQuery(food, query) {
  if (!query) return true;
  const haystack = [food.name, food.category, food.zone, food.blurb, ...(food.tags || []), food.serving].join(' ').toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
}

function categoryMatches(food, filter) {
  if (filter === 'all') return true;
  if (filter === 'veg') return food.zone === 'veg' && food.category !== 'berry';
  return food.category === filter;
}

function renderPalette() {
  const query = state.query.trim();
  const filter = state.filter;
  const activeFoodId = document.activeElement?.dataset?.food || null;
  const previousScroll = dom.foodGrid.scrollTop;
  const safeMatches = FOODS.filter((food) => categoryMatches(food, filter) && matchesQuery(food, query));
  const warningMatches = query ? WARNINGS.filter((food) => matchesQuery(food, query)) : [];
  const total = safeMatches.length + warningMatches.length;

  const cardForFood = (food) => {
    const nutrition = nutritionFor(food);
    const count = state.plate.filter((entry) => entry.foodId === food.id).length;
    const giClass = nutrition.gi > 50 ? 'medium' : '';
    return `
      <button class="food-card${count ? ' is-added' : ''}" type="button" data-food="${food.id}" aria-label="Add ${escapeHtml(food.name)} to the plate. ${nutrition.net.toFixed(1)} grams net carbs per serving." title="${escapeHtml(food.blurb)}">
        <span class="food-add" aria-hidden="true">${count > 1 ? count : '+'}</span>
        <span class="food-emoji" aria-hidden="true">${food.emoji}</span>
        <span class="food-name">${escapeHtml(food.name)}</span>
        <span class="food-sub">${escapeHtml(food.serving)}</span>
        <span class="food-macros"><b>${nutrition.net.toFixed(1)} g</b> net <span class="gi-dot ${giClass}">GI ${food.gi}</span></span>
      </button>`;
  };

  const cardForWarning = (food) => `
    <button class="food-card watchout-result" type="button" data-warning="${food.id}" aria-label="Warning: ${escapeHtml(food.name)} is high glycemic. See the safe swap.">
      <span class="food-add" aria-hidden="true">!</span>
      <span class="food-emoji" aria-hidden="true">${food.emoji}</span>
      <span class="food-name">${escapeHtml(food.name)}</span>
      <span class="food-sub">${escapeHtml(food.kind)} · ${food.net.toFixed(0)} g net carbs</span>
      <span class="food-macros"><b class="danger">High</b> spike risk <span class="gi-dot medium">GI ${food.gi}</span></span>
    </button>`;

  dom.foodGrid.innerHTML = warningMatches.map(cardForWarning).join('') + safeMatches.map(cardForFood).join('');
  dom.foodGrid.scrollTop = previousScroll;
  if (activeFoodId) {
    const card = dom.foodGrid.querySelector(`[data-food="${activeFoodId}"]`);
    if (card) card.focus({ preventScroll: true });
  }
  dom.foodCount.textContent = query || filter !== 'all' ? `${total} match${total === 1 ? '' : 'es'}` : `${FOODS.length} foods`;
  dom.emptyResults.hidden = total !== 0;
  dom.searchClear.hidden = !query;
  dom.watchoutList.hidden = Boolean(query && warningMatches.length);
}

function renderWatchouts() {
  dom.watchoutList.innerHTML = WARNINGS.map((food) => `
    <button class="watchout-card" type="button" data-warning="${food.id}" aria-label="${escapeHtml(food.name)}: high glycemic. Open the warning and safe swap.">
      <strong>${food.emoji} ${escapeHtml(food.name)}</strong>
      GL ${food.gl.toFixed(1)} <span>· ${food.net.toFixed(0)} g net</span>
    </button>`).join('');
}

function renderSwaps() {
  dom.swapsMeta.textContent = `${SWAPS.length} swaps`;
  dom.swapList.innerHTML = SWAPS.map((swap) => {
    const warning = WARNING_BY_ID.get(swap.warningId);
    const added = swap.addIds.map((id) => FOOD_BY_ID.get(id)).filter(Boolean);
    const savedNet = warning ? Math.max(0, warning.net - added.reduce((sum, food) => sum + nutritionFor(food).net, 0)) : 0;
    return `
      <article class="swap-card">
        <div class="swap-head">
          <span class="swap-from">${escapeHtml(swap.craving)}</span>
          <span class="swap-arrow" aria-hidden="true">→</span>
          <span class="swap-to">${escapeHtml(swap.title)}</span>
        </div>
        <div class="swap-meta">
          <span class="swap-saved">−${savedNet.toFixed(0)} g net carbs</span>
          <button class="swap-add" type="button" data-swap="${swap.id}" aria-label="Add the safe swap for ${escapeHtml(swap.craving)}: ${escapeHtml(swap.title)}">Add swap +</button>
        </div>
        <p class="swap-note">${escapeHtml(swap.note)}</p>
      </article>`;
  }).join('');
}

function renderPlateList() {
  const summary = summarize();
  if (!summary.items.length) {
    dom.plateList.innerHTML = '';
    dom.plateListEmpty.hidden = false;
    dom.selectedCard.hidden = true;
    return;
  }
  dom.plateListEmpty.hidden = true;
  dom.plateList.innerHTML = summary.items.map(({ uid, food, nutrition }) => `
    <li class="plate-row${state.selected === uid ? ' is-selected' : ''}" data-uid="${uid}">
      <span class="plate-row-emoji" aria-hidden="true">${food.emoji}</span>
      <button class="plate-row-main" type="button" data-select="${uid}" aria-label="Inspect ${escapeHtml(food.name)} on the plate" aria-pressed="${state.selected === uid}">
        <span class="plate-row-name">${escapeHtml(food.name)}</span>
        <span class="plate-row-carbs">${nutrition.net.toFixed(1)} g net</span>
      </button>
      <button class="plate-row-remove" type="button" data-remove="${uid}" aria-label="Remove ${escapeHtml(food.name)} from the plate">&times;</button>
    </li>`).join('');
  renderSelected();
}

function renderSelected() {
  if (!state.selected) {
    dom.selectedCard.hidden = true;
    return;
  }
  const entry = state.plate.find((item) => item.uid === state.selected);
  const food = entry && FOOD_BY_ID.get(entry.foodId);
  if (!food) {
    state.selected = null;
    dom.selectedCard.hidden = true;
    return;
  }
  const n = nutritionFor(food);
  dom.selectedCard.hidden = false;
  dom.selectedName.textContent = food.name;
  dom.selectedMeta.textContent = `${food.serving} · ${n.net.toFixed(1)} g net carbs · ${n.fiber.toFixed(1)} g fiber · ${n.protein.toFixed(1)} g protein · GI ${food.gi}`;
  dom.selectedWhy.textContent = food.blurb;
}

function renderLog() {
  const meals = state.meals.slice(0, 24);
  if (!meals.length) {
    dom.logList.innerHTML = '';
    dom.logEmpty.hidden = false;
    return;
  }
  dom.logEmpty.hidden = true;
  dom.logList.innerHTML = meals.map((meal) => {
    const date = new Date(meal.createdAt);
    const stamp = Number.isNaN(date.getTime()) ? 'Saved meal' : `${dateFormat.format(date)} · ${timeFormat.format(date)}`;
    return `
      <li class="log-row">
        <button class="log-main" type="button" data-load="${escapeHtml(meal.id)}" aria-label="Load meal ${escapeHtml(meal.name)}">
          <span class="log-name">${escapeHtml(meal.name)}</span>
          <span class="log-meta">${stamp} · ${nf1.format(meal.summary?.net ?? 0)} g net · ${meal.summary?.servings ?? 0} servings</span>
        </button>
        <span class="log-score" title="Safety score">${meal.summary?.score ?? 0}</span>
        <button class="log-delete" type="button" data-delete="${escapeHtml(meal.id)}" aria-label="Delete saved meal ${escapeHtml(meal.name)}">&times;</button>
      </li>`;
  }).join('');
}

/* --------------------------------------------------------------------------
   10. Rendering: HUD, score, CGM
   -------------------------------------------------------------------------- */

let chart = null;

function setRing(score, tone) {
  const circumference = 2 * Math.PI * 50;
  const fraction = clamp(score, 0, 100) / 100;
  dom.ringValue.setAttribute('stroke-dasharray', `${round(circumference * fraction, 2)} ${round(circumference, 2)}`);
  dom.ringValue.classList.toggle('band-warn', tone === 'warn');
  dom.ringValue.classList.toggle('band-risk', tone === 'risk');
}

function updateCGM(summary) {
  const safe = glucoseCurve(summary);
  const reference = REFERENCE_CURVE;
  state.lastPeak = safe.peak;
  if (chart) chart.setSummary(summary);

  dom.cgmSafePeak.textContent = `${Math.round(safe.peak)} mg/dL`;
  dom.cgmStarchPeak.textContent = `${Math.round(reference.peak)} mg/dL`;
  dom.cgmRise.textContent = summary.servings ? `+${Math.round(safe.rise)}` : '—';
  dom.cgmTime.textContent = summary.servings ? `~${safe.peakTime} min` : '—';
  dom.cgmLoad.textContent = summary.servings ? `${safe.gl.toFixed(1)} GL` : '—';

  if (!summary.servings) {
    dom.cgmNote.textContent = 'Add food to compare your plate with a rice-and-potato reference meal. Curves are illustrative population averages, not your CGM.';
  } else if (summary.totals.gl > 25) {
    dom.cgmNote.textContent = `This plate is carrying a starch-sized load (GL ${summary.totals.gl.toFixed(1)}). Check the plate list for the item to shrink.`;
  } else {
    const delta = Math.round(reference.peak - safe.peak);
    dom.cgmNote.textContent = `Modeled peak ${Math.round(safe.peak)} mg/dL — about ${Math.max(0, delta)} mg/dL below the reference starchy meal. Illustrative, not a CGM.`;
  }
  dom.chart.setAttribute('aria-label', summary.servings
    ? `Simulated glucose curve. Your plate peaks around ${Math.round(safe.peak)} milligrams per deciliter at ${safe.peakTime} minutes; the starchy reference peaks around ${Math.round(reference.peak)}.`
    : 'Simulated glucose chart. Add food to compare your plate with a starchy reference meal.');
}

function updateHUD() {
  const summary = summarize();
  const totals = summary.totals;
  const servings = summary.servings;

  dom.scoreNumber.textContent = String(summary.score);
  dom.scoreBand.textContent = summary.band.label;
  dom.scoreBand.className = `score-band band-${summary.band.tone}`;
  dom.scoreAdvice.textContent = summary.advice;
  setRing(summary.score, summary.band.tone);
  dom.hudScore.textContent = servings ? String(summary.score) : '—';
  dom.hudScore.classList.toggle('warn', summary.band.tone === 'risk' || summary.band.tone === 'warn');
  dom.hudCarbs.textContent = totals.net.toFixed(1);
  dom.hudFiber.textContent = totals.fiber.toFixed(1);
  dom.hudGl.textContent = totals.gl.toFixed(1);

  dom.macroCarbs.innerHTML = `${totals.net.toFixed(1)}<small>g</small>`;
  dom.macroFiber.innerHTML = `${totals.fiber.toFixed(1)}<small>g</small>`;
  dom.macroProtein.innerHTML = `${totals.protein.toFixed(1)}<small>g</small>`;
  dom.macroKcal.innerHTML = `${nf0.format(totals.kcal)}<small>kcal</small>`;
  dom.macroCarbsNote.textContent = totals.net > 30 ? 'above the 30 g gentle target' : 'of a 30 g gentle target';
  dom.macroFiberNote.textContent = totals.fiber >= 8 ? 'at or above the 8 g aim' : 'aim for 8 g+';

  const shares = servings
    ? { veg: summary.zoneCounts.veg / servings, protein: summary.zoneCounts.protein / servings, fat: summary.zoneCounts.fat / servings }
    : { veg: 0, protein: 0, fat: 0 };
  dom.balanceVeg.style.width = `${Math.round(shares.veg * 100)}%`;
  dom.balanceProtein.style.width = `${Math.round(shares.protein * 100)}%`;
  dom.balanceFat.style.width = `${Math.round(shares.fat * 100)}%`;
  dom.balanceNote.textContent = `${servings} serving${servings === 1 ? '' : 's'}`;
  dom.plateCount.textContent = `${servings} serving${servings === 1 ? '' : 's'}`;

  dom.plateEmpty.classList.toggle('is-hidden', servings > 0);
  dom.mobileDock.hidden = servings === 0;
  dom.dockScore.textContent = String(summary.score);
  dom.dockCarbs.textContent = totals.net.toFixed(1);

  renderPlateList();
  updateCGM(summary);
  renderPalette();
  renderSwaps();
}

/* --------------------------------------------------------------------------
   11. Plate actions
   -------------------------------------------------------------------------- */

function addFood(foodId, { silent = false } = {}) {
  if (WARNING_BY_ID.has(foodId)) {
    openWarning(foodId);
    return false;
  }
  const food = FOOD_BY_ID.get(foodId);
  if (!food) return false;

  if (state.plate.length >= APP.maxServings) {
    toast(`The plate holds ${APP.maxServings} servings. Remove one first.`, 'warn');
    return false;
  }
  const zoneCount = state.plate.filter((entry) => FOOD_BY_ID.get(entry.foodId)?.zone === food.zone).length;
  if (zoneCount >= ZONE_CAPS[food.zone]) {
    toast(`The ${ZONE_LABELS[food.zone].toLowerCase()} zone is full. Remove one to add another.`, 'warn');
    return false;
  }

  const entry = { uid: uid(), foodId: food.id };
  state.plate.push(entry);
  if (scene) scene.add(entry);
  updateHUD();
  if (!silent) {
    const n = nutritionFor(food);
    toast(`${food.name} added · ${n.net.toFixed(1)} g net carbs`, 'good');
  }
  announce(`${food.name} added. ${summarize().servings} servings on the plate.`);
  return true;
}

function removeFood(entryUid, { silent = false } = {}) {
  const entry = state.plate.find((item) => item.uid === entryUid);
  if (!entry) return false;
  const food = FOOD_BY_ID.get(entry.foodId);
  state.plate = state.plate.filter((item) => item.uid !== entryUid);
  if (state.selected === entryUid) state.selected = null;
  if (scene) {
    scene.remove(entryUid);
    scene.highlight(state.selected);
  }
  updateHUD();
  if (!silent && food) toast(`${food.name} removed`);
  return true;
}

function clearPlate({ silent = false } = {}) {
  if (!state.plate.length) return;
  state.plate = [];
  state.selected = null;
  if (scene) {
    scene.clear();
    scene.highlight(null);
  }
  updateHUD();
  if (!silent) toast('Plate cleared');
}

function buildExample({ silent = false } = {}) {
  clearPlate({ silent: true });
  const added = [];
  for (const id of BALANCED_PLATE) {
    const before = state.plate.length;
    addFood(id, { silent: true });
    if (state.plate.length > before) added.push(FOOD_BY_ID.get(id)?.name);
  }
  updateHUD();
  if (!silent) toast(`Balanced plate built: ${added.length} whole foods`, 'good');
  announce('Balanced example plate built.');
  return added.length;
}

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildSurprise() {
  clearPlate({ silent: true });
  const veg = shuffled(FOODS.filter((food) => food.zone === 'veg' && food.category !== 'berry')).slice(0, 3);
  const berry = shuffled(FOODS.filter((food) => food.category === 'berry'))[0];
  const protein = shuffled(FOODS.filter((food) => food.zone === 'protein')).slice(0, 2);
  const fat = shuffled(FOODS.filter((food) => food.zone === 'fat')).slice(0, 2);
  const picks = [...veg, berry, ...protein, ...fat].filter(Boolean);
  let added = 0;
  for (const food of picks) {
    if (addFood(food.id, { silent: true })) added += 1;
  }
  updateHUD();
  toast(`Surprise plate: ${added} whole foods, ${summarize().totals.net.toFixed(1)} g net carbs`, 'good');
  announce('A surprise balanced plate was built.');
  return added;
}

function buildSwap(swapId, { close = false } = {}) {
  const swap = SWAP_BY_ID.get(swapId);
  if (!swap) return false;
  let added = 0;
  for (const id of swap.addIds) {
    if (addFood(id, { silent: true })) added += 1;
  }
  updateHUD();
  if (added) {
    toast(`Swap in: ${swap.title} (+${added} serving${added === 1 ? '' : 's'})`, 'good');
    announce(`Safe swap added: ${swap.title}.`);
  } else {
    toast('The swap could not fit — the plate or that zone is full.', 'warn');
  }
  if (close) closeDialog(dom.warningDialog);
  return added > 0;
}

function selectFood(entryUid) {
  state.selected = state.selected === entryUid ? null : entryUid;
  if (scene) scene.highlight(state.selected);
  renderPlateList();
}

function announce(message) {
  const region = document.getElementById('sr-announcer');
  if (region) region.textContent = message;
}

/* --------------------------------------------------------------------------
   12. Warnings and swaps UI
   -------------------------------------------------------------------------- */

function openWarning(warningId) {
  const food = WARNING_BY_ID.get(warningId);
  if (!food) return;
  state.warningId = warningId;
  const swap = SWAP_BY_ID.get(food.swapId);
  const alternatives = swap ? swap.addIds.map((id) => FOOD_BY_ID.get(id)).filter(Boolean) : [];

  dom.warningTitle.textContent = `${food.name} is a fast carb.`;
  dom.warningDesc.textContent = `A ${food.serving} serving carries about ${food.net.toFixed(1)} g of net carbohydrate and a glycemic load near ${food.gl.toFixed(1)}.`;
  dom.warningStats.innerHTML = `
    <div><span>Net carbs</span><strong class="danger">${food.net.toFixed(1)} g</strong></div>
    <div><span>Glycemic index</span><strong class="danger">${food.gi}</strong></div>
    <div><span>Glycemic load</span><strong class="danger">${food.gl.toFixed(1)}</strong></div>`;
  dom.warningWhy.textContent = food.why;
  dom.warningSwapList.innerHTML = alternatives.map((alt) => {
    const n = nutritionFor(alt);
    return `<div class="warning-swap-item"><span class="swap-plus" aria-hidden="true">+</span><span><strong>${escapeHtml(alt.name)}</strong> · ${n.net.toFixed(1)} g net carbs · GL ${n.gl.toFixed(1)}</span></div>`;
  }).join('');
  dom.warningSource.textContent = `Reference: ${food.source}. Glycemic index and load are population approximations.`;
  const buildButton = document.getElementById('warning-build-swap');
  buildButton.disabled = !swap;
  buildButton.textContent = swap ? `Add ${swap.title}` : 'No swap available';
  openDialog(dom.warningDialog);
  announce(`Warning. ${food.name} is a high-glycemic food. A safe swap is ${swap?.title || 'not available'}.`);
}

/* --------------------------------------------------------------------------
   13. Meal log
   -------------------------------------------------------------------------- */

function openSaveDialog() {
  if (!state.plate.length) {
    toast('Add at least one food before saving.', 'warn');
    return;
  }
  const summary = summarize();
  dom.savePreview.innerHTML = `<strong>${summary.servings} servings</strong> · ${summary.totals.net.toFixed(1)} g net carbs · ${summary.totals.fiber.toFixed(1)} g fiber · score ${summary.score}/100`;
  dom.saveName.value = defaultMealName();
  openDialog(dom.saveDialog);
  window.setTimeout(() => dom.saveName.select(), 50);
}

function defaultMealName() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Whole-food breakfast';
  if (hour < 15) return 'Steady lunch plate';
  if (hour < 21) return 'Calm dinner plate';
  return 'Late, light plate';
}

function saveMeal(name) {
  if (!state.plate.length) return null;
  const summary = summarize();
  const curve = glucoseCurve(summary);
  const meal = {
    id: `meal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: String(name || defaultMealName()).trim().slice(0, 60) || defaultMealName(),
    createdAt: new Date().toISOString(),
    foods: state.plate.map((entry) => entry.foodId),
    summary: {
      net: summary.totals.net,
      fiber: summary.totals.fiber,
      protein: summary.totals.protein,
      kcal: summary.totals.kcal,
      gl: summary.totals.gl,
      score: summary.score,
      servings: summary.servings,
      peak: curve.peak,
    },
  };
  state.meals.unshift(meal);
  state.meals = state.meals.slice(0, 30);
  const saved = writeJSON(APP.storeMeals, state.meals);
  if (!saved) toast('Browser storage is unavailable; the meal was not saved.', 'warn');
  renderLog();
  return meal;
}

function loadMeal(mealId) {
  const meal = state.meals.find((item) => item.id === mealId);
  if (!meal) return false;
  clearPlate({ silent: true });
  let added = 0;
  for (const foodId of meal.foods || []) {
    if (addFood(foodId, { silent: true })) added += 1;
  }
  updateHUD();
  toast(`Loaded “${meal.name}” · ${added} servings`, 'good');
  if (window.matchMedia('(max-width: 760px)').matches) {
    dom.stageWrap.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'center' });
  }
  return true;
}

function deleteMeal(mealId) {
  const meal = state.meals.find((item) => item.id === mealId);
  state.meals = state.meals.filter((item) => item.id !== mealId);
  writeJSON(APP.storeMeals, state.meals);
  renderLog();
  if (meal) toast(`Deleted “${meal.name}”`);
}

function clearMeals() {
  if (!state.meals.length) return;
  state.meals = [];
  writeJSON(APP.storeMeals, state.meals);
  renderLog();
  toast('Meal log cleared');
}

function exportMeals() {
  if (!state.meals.length) {
    toast('Nothing to export yet.', 'warn');
    return;
  }
  const payload = {
    schema: 1,
    app: APP.name,
    version: APP.version,
    exportedAt: new Date().toISOString(),
    meals: state.meals,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `platewise-meals-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Meal log exported as JSON', 'good');
}

/* --------------------------------------------------------------------------
   14. Sources and theme
   -------------------------------------------------------------------------- */

function renderSources() {
  dom.sourceList.innerHTML = SOURCES.map((source) => `
    <article class="source-item">
      <span class="source-kind">${escapeHtml(source.kind)}</span>
      <a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a>
      <p>${escapeHtml(source.detail)}</p>
    </article>`).join('');
}

function toggleTheme() {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next, { persist: true, scene });
}

/* --------------------------------------------------------------------------
   15. Event wiring
   -------------------------------------------------------------------------- */

let scene = null;

function wireEvents() {
  // Pantry filtering and search
  dom.searchInput.addEventListener('input', () => {
    state.query = dom.searchInput.value;
    renderPalette();
  });
  dom.searchClear.addEventListener('click', () => {
    state.query = '';
    dom.searchInput.value = '';
    dom.searchInput.focus();
    renderPalette();
  });
  dom.searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dom.searchInput.value = '';
      state.query = '';
      renderPalette();
    }
    if (event.key === 'Enter') {
      const first = dom.foodGrid.querySelector('[data-food]');
      if (first) {
        event.preventDefault();
        addFood(first.dataset.food);
      }
    }
  });

  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter;
      $$('.chip').forEach((other) => {
        const active = other === chip;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      renderPalette();
    });
  });

  dom.foodGrid.addEventListener('click', (event) => {
    const warning = event.target.closest('[data-warning]');
    if (warning) {
      openWarning(warning.dataset.warning);
      return;
    }
    const card = event.target.closest('[data-food]');
    if (card) addFood(card.dataset.food);
  });

  dom.watchoutList.addEventListener('click', (event) => {
    const item = event.target.closest('[data-warning]');
    if (item) openWarning(item.dataset.warning);
  });

  // Plate list
  dom.plateList.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      removeFood(remove.dataset.remove);
      return;
    }
    const select = event.target.closest('[data-select]');
    if (select) selectFood(select.dataset.select);
  });

  // Stage controls
  $('#btn-rotate').addEventListener('click', () => {
    state.autoRotate = !state.autoRotate;
    const button = $('#btn-rotate');
    button.setAttribute('aria-pressed', String(state.autoRotate));
    button.setAttribute('aria-label', state.autoRotate ? 'Pause automatic rotation' : 'Start automatic rotation');
    if (scene) scene.setAutoRotate(state.autoRotate);
    writeJSON(APP.storePrefs, { theme: state.theme, autoRotate: state.autoRotate });
  });
  $('#btn-reset-view').addEventListener('click', () => {
    if (scene) scene.resetView();
    toast('Camera reset');
  });
  $('#btn-fullscreen').addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await dom.stageWrap.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      toast('Fullscreen is not available in this browser.', 'warn');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const button = $('#btn-fullscreen');
    const active = Boolean(document.fullscreenElement);
    button.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    if (scene) window.setTimeout(() => scene.resize(), 60);
  });

  // Plate actions
  $('#btn-clear').addEventListener('click', () => clearPlate());
  $('#btn-clear-2').addEventListener('click', () => clearPlate());
  $('#btn-example').addEventListener('click', () => buildExample());
  $('#btn-empty-example').addEventListener('click', () => buildExample());
  $('#btn-surprise').addEventListener('click', () => buildSurprise());
  $('#btn-save-open').addEventListener('click', openSaveDialog);

  // Selected item
  $('#selected-close').addEventListener('click', () => {
    selectFood(state.selected);
  });
  $('#selected-remove').addEventListener('click', () => {
    if (state.selected) removeFood(state.selected);
  });

  // Swaps
  dom.swapList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-swap]');
    if (button) buildSwap(button.dataset.swap);
  });

  // Log
  dom.logList.addEventListener('click', (event) => {
    const load = event.target.closest('[data-load]');
    if (load) {
      loadMeal(load.dataset.load);
      return;
    }
    const remove = event.target.closest('[data-delete]');
    if (remove) deleteMeal(remove.dataset.delete);
  });
  $('#btn-export-log').addEventListener('click', exportMeals);
  $('#btn-clear-log').addEventListener('click', () => {
    if (state.meals.length && window.confirm('Delete all saved meals from this browser?')) clearMeals();
  });
  $('#save-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const meal = saveMeal(dom.saveName.value);
    if (meal) {
      closeDialog(dom.saveDialog);
      toast(`Saved “${meal.name}” on this device`, 'good');
      announce(`Meal saved: ${meal.name}.`);
    }
  });

  // Dialogs
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
  });
  $('#btn-guide').addEventListener('click', () => openDialog(dom.guideDialog));
  $('#btn-intro-guide').addEventListener('click', () => openDialog(dom.guideDialog));
  $('#btn-sources').addEventListener('click', () => openDialog(dom.sourcesDialog));
  $('#btn-sources-2').addEventListener('click', () => openDialog(dom.sourcesDialog));
  $('#warning-build-swap').addEventListener('click', () => {
    const food = WARNING_BY_ID.get(state.warningId);
    if (food) buildSwap(food.swapId, { close: true });
  });

  // Theme + mobile dock
  $('#btn-theme').addEventListener('click', toggleTheme);
  $('#dock-view').addEventListener('click', () => {
    dom.stageWrap.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'center' });
  });

  // Self-test
  $('#selftest-close').addEventListener('click', hideSelfTest);
  $('#selftest-hide').addEventListener('click', hideSelfTest);

  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable);
    if (event.key === 'Escape' && !typing) {
      if (state.selected) {
        selectFood(state.selected);
        return;
      }
    }
    if (typing) return;
    if (event.key === '/') {
      event.preventDefault();
      dom.searchInput.focus();
      dom.searchInput.select();
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      $('#btn-rotate').click();
      return;
    }
    if (event.key === 'g' || event.key === 'G' || event.key === '?') {
      openDialog(dom.guideDialog);
      return;
    }
    if (/^[1-7]$/.test(event.key)) {
      const chips = $$('.chip');
      const chip = chips[Number(event.key) - 1];
      if (chip) chip.click();
    }
  });
}

/* --------------------------------------------------------------------------
   16. Self-test
   -------------------------------------------------------------------------- */

function hideSelfTest() {
  const panel = $('#selftest-panel');
  if (panel) panel.hidden = true;
}

async function runSelfTest({ show = false } = {}) {
  const results = [];
  const check = (name, fn) => {
    try {
      const value = fn();
      results.push({ name, ok: Boolean(value), detail: value === true || value === undefined ? '' : String(value) });
    } catch (error) {
      results.push({ name, ok: false, detail: error.message });
    }
  };

  check('18 safe whole foods are defined', () => FOODS.length === 18 || `${FOODS.length}`);
  check('6 starch/processed warnings are defined', () => WARNINGS.length === 6 || `${WARNINGS.length}`);
  check('6 smart swaps are defined', () => SWAPS.length === 6 || `${SWAPS.length}`);
  check('Food IDs are unique', () => new Set(FOODS.map((food) => food.id)).size === FOODS.length);
  check('Warning IDs are unique', () => new Set(WARNINGS.map((food) => food.id)).size === WARNINGS.length);
  check('Every swap target exists in the pantry', () => SWAPS.every((swap) => swap.addIds.every((id) => FOOD_BY_ID.has(id))));
  check('Every warning links to a valid swap', () => WARNINGS.every((food) => SWAP_BY_ID.has(food.swapId)));
  check('Per-100 g data is non-negative', () => FOODS.every((food) => Object.values(food.per100).every((value) => value >= 0)));
  check('Serving weights are positive', () => FOODS.every((food) => food.servingG > 0));
  check('Net carbs never exceed total carbs', () => FOODS.every((food) => {
    const n = nutritionFor(food);
    return n.net <= n.carbs + 0.001 && n.carbs >= n.fiber - 0.001;
  }));
  check('GI values are in range', () => FOODS.every((food) => food.gi >= 0 && food.gi <= 100));
  check('Warning loads are high (> 15)', () => WARNINGS.every((food) => food.gl > 15));
  check('Empty plate scores zero', () => summarize([]).score === 0);
  check('A balanced plate scores 70+', () => {
    const plate = BALANCED_PLATE.map((id, index) => ({ uid: `t${index}`, foodId: id }));
    return summarize(plate).score >= 70 || `score ${summarize(plate).score}`;
  });
  check('All three plate zones can be filled', () => {
    const plate = [{ uid: 'a', foodId: 'broccoli' }, { uid: 'b', foodId: 'salmon' }, { uid: 'c', foodId: 'avocado' }];
    const s = summarize(plate);
    return s.zoneCounts.veg === 1 && s.zoneCounts.protein === 1 && s.zoneCounts.fat === 1;
  });
  check('Fiber credit changes the score', () => {
    const low = summarize([{ uid: 'a', foodId: 'salmon' }]).score;
    const high = summarize([{ uid: 'a', foodId: 'broccoli' }]).score;
    return high > low;
  });
  check('Safe curve peaks below the starchy reference', () => {
    const plate = BALANCED_PLATE.map((id, index) => ({ uid: `t${index}`, foodId: id }));
    const safe = glucoseCurve(summarize(plate));
    return safe.peak < REFERENCE_CURVE.peak - 20;
  });
  check('Curve has 37 samples from 0 to 180 minutes', () => {
    const curve = glucoseCurve(summarize(BALANCED_PLATE.map((id, index) => ({ uid: `t${index}`, foodId: id }))));
    return curve.points.length === 37 && curve.points[0].minute === 0 && curve.points.at(-1).minute === 180;
  });
  check('Zone caps sum to a usable plate', () => ZONE_CAPS.veg + ZONE_CAPS.protein + ZONE_CAPS.fat >= APP.maxServings);
  check('Local storage round-trips a test key', () => {
    const key = `${APP.storePrefs}.selftest`;
    const ok = writeJSON(key, { ok: true });
    const value = readJSON(key, null);
    window.localStorage.removeItem(key);
    return ok && value && value.ok === true;
  });
  check('All source links are HTTPS', () => SOURCES.every((source) => source.url.startsWith('https://')));
  check('Six evidence sources are present', () => SOURCES.length >= 6 || `${SOURCES.length}`);
  check('No duplicate element IDs', () => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    return new Set(ids).size === ids.length;
  });
  check('WebGL context is live', () => Boolean(scene && scene.renderer.getContext()));
  check('3D scene rendered at least one frame', () => Boolean(scene && scene.renderer.info.render.frame > 0));
  check('Canvas has non-zero size', () => {
    const rect = dom.chart.getBoundingClientRect();
    return rect.width > 100 && rect.height > 80;
  });
  check('Safety score formula is bounded', () => {
    const plate = Array.from({ length: 10 }, (_, index) => ({ uid: `t${index}`, foodId: 'strawberries' }));
    const score = summarize(plate).score;
    return score >= 0 && score <= 100;
  });
  check('Every pantry food has a 3D factory', () => FOODS.every((food) => typeof FOOD_FACTORIES[food.id] === 'function'));
  check('Every warning has a source note', () => WARNINGS.every((food) => food.source && food.source.length > 10));

  const passed = results.filter((item) => item.ok).length;
  const total = results.length;
  const panel = $('#selftest-panel');
  const summary = $('#selftest-summary');
  const list = $('#selftest-list');
  if (summary) summary.textContent = `${passed} of ${total} checks passed${passed === total ? ' — the plate is ready.' : '.'}`;
  if (list) {
    list.innerHTML = results.map((item) => `<li class="${item.ok ? '' : 'fail'}"><b>${item.ok ? 'PASS' : 'FAIL'}</b> ${escapeHtml(item.name)}${item.detail ? ` — ${escapeHtml(item.detail)}` : ''}</li>`).join('');
  }
  if (show && panel) panel.hidden = false;

  window.__platewise.selftest = { passed, total, results };
  window.__platewise.selftestPassed = passed === total;
  return { passed, total, results };
}

/* --------------------------------------------------------------------------
   17. Boot
   -------------------------------------------------------------------------- */

function boot() {
  applyTheme(state.theme, { persist: false });

  try {
    scene = new PlateScene(document.getElementById('scene'));
    scene.onSelect = (entryUid) => {
      if (entryUid) selectFood(entryUid);
      else if (state.selected) selectFood(state.selected);
    };
    scene.setAutoRotate(state.autoRotate);
    const rotateButton = $('#btn-rotate');
    rotateButton.setAttribute('aria-pressed', String(state.autoRotate));
    rotateButton.setAttribute('aria-label', state.autoRotate ? 'Pause automatic rotation' : 'Start automatic rotation');
  } catch (error) {
    console.error('WebGL initialization failed', error);
    dom.stageLoading.querySelector('span:last-child').textContent = 'WebGL unavailable — the pantry and calculations still work.';
    dom.stageLoading.classList.remove('is-hidden');
  }

  chart = new GlucoseChart(dom.chart);

  const arena = document.createElement('div');
  arena.id = 'sr-announcer';
  arena.className = 'sr-only';
  arena.setAttribute('aria-live', 'polite');
  document.body.appendChild(arena);

  renderWatchouts();
  renderSwaps();
  renderSources();
  renderLog();
  updateHUD();
  wireEvents();

  if (scene) window.setTimeout(() => dom.stageLoading.classList.add('is-hidden'), 450);

  window.__platewise = {
    version: APP.version,
    foods: FOODS,
    warnings: WARNINGS,
    swaps: SWAPS,
    sources: SOURCES,
    state,
    get scene() { return scene; },
    sceneInfo: () => (scene ? scene.info() : { items: 0, webgl: false }),
    addFood,
    removeFood,
    clearPlate,
    buildExample,
    buildSurprise,
    buildSwap,
    selectFood,
    openWarning,
    getSummary: () => summarize(),
    getCurve: () => glucoseCurve(summarize()),
    getReferenceCurve: () => REFERENCE_CURVE,
    saveMeal,
    getMeals: () => state.meals.slice(),
    loadMeal,
    deleteMeal,
    clearMeals,
    exportMeals,
    openDialog: (id) => openDialog(document.getElementById(id)),
    closeDialog: (id) => closeDialog(document.getElementById(id)),
    runSelfTest,
    selftest: null,
    selftestPassed: false,
  };

  document.body.dataset.ready = 'true';
  document.body.dataset.scene = scene ? 'ready' : 'fallback';

  const query = new URLSearchParams(window.location.search);
  if (query.has('selftest')) {
    window.requestAnimationFrame(() => window.setTimeout(() => runSelfTest({ show: true }), 120));
  } else {
    window.setTimeout(() => runSelfTest({ show: false }), 900);
  }

  window.setTimeout(() => {
    if (!state.plate.length) announce('Plate builder ready. 18 whole foods available.');
  }, 1200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
