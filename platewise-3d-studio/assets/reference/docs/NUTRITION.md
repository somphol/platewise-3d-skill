# Nutrition methodology

This document is the authoritative explanation of every number PlateWise 3D
shows. It is written so that another developer or agent can reproduce the data,
the score and the curve, and so that a clinician can see exactly where the limits
are.

> **Educational use only.** PlateWise is not a medical device, does not measure
> glucose and does not personalize advice. Glycemic response varies with
> medication, activity, sleep, food preparation, portion size, gut microbiota and
> individual insulin sensitivity.

## 1. Sources and conversion

- **Macronutrients and energy:** USDA FoodData Central, SR Legacy / Foundation
  Foods, per 100 g edible portion. Values are rounded to one or two decimals in
  the app.
- **Glycemic index:** typical published values from the 2021 international
  tables (Atkinson et al., *Diabetes Care*) and the University of Sydney GI
  database. Values are population averages. A GI of 0 means no meaningful
  carbohydrate response (protein or pure fat).
- **Clinical framing:** American Diabetes Association *Standards of Care in
  Diabetes—2025*, Section 5; Evert et al. 2019 nutrition consensus report;
  Feinman et al. 2015 review of carbohydrate restriction.
- **Fiber convention:** US labeling convention, where total carbohydrate
  includes fiber. **Net carbs = total carbohydrate − dietary fiber.** If you are
  in a region where fiber is listed separately and excluded from carbohydrate,
  do not subtract it again.

Serving conversion:

```text
factor      = servingG / 100
carbs       = per100.carbs  × factor
fiber       = per100.fiber  × factor
netCarbs    = max(0, carbs − fiber)
protein     = per100.protein × factor
fat         = per100.fat     × factor
kcal        = round(per100.kcal × factor)
glycemicLoad = gi × netCarbs / 100
```

The per-100 g record never changes. Serving sizes are the only scaling factor.
Changing a serving size changes everything downstream, including the score.

## 2. The 18 safe foods, per serving

| Food | Zone | Serving | Net carbs | Fiber | Protein | Fat | kcal | GI | GL |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Broccoli | veg | 1 cup, chopped (91 g) | 3.67 | 2.37 | 2.57 | 0.34 | 31 | 15 | 0.55 |
| Spinach | veg | 2 cups, raw (60 g) | 0.86 | 1.32 | 1.72 | 0.23 | 14 | 15 | 0.13 |
| Cauliflower | veg | 1 cup, chopped (107 g) | 3.18 | 2.14 | 2.05 | 0.30 | 27 | 15 | 0.48 |
| Zucchini | veg | 1 cup, sliced (124 g) | 2.62 | 1.24 | 1.50 | 0.40 | 21 | 15 | 0.39 |
| Bell pepper | veg | 1 cup, sliced (119 g) | 5.41 | 2.50 | 1.18 | 0.36 | 37 | 15 | 0.81 |
| Asparagus | veg | 1 cup (134 g) | 2.39 | 2.81 | 2.95 | 0.16 | 27 | 15 | 0.36 |
| Wild salmon | protein | 3.5 oz fillet (100 g) | 0.00 | 0.00 | 19.84 | 6.34 | 142 | 0 | 0.00 |
| Egg | protein | 1 large egg (50 g) | 0.36 | 0.00 | 6.28 | 4.75 | 72 | 0 | 0.00 |
| Chicken breast | protein | 3.5 oz, raw (100 g) | 0.00 | 0.00 | 22.50 | 2.62 | 120 | 0 | 0.00 |
| Firm tofu | protein | 3 oz (85 g) | 0.93 | 1.02 | 14.71 | 7.39 | 122 | 0 | 0.00 |
| Avocado | fat | ½ small avocado (75 g) | 1.37 | 5.03 | 1.50 | 11.00 | 120 | 10 | 0.14 |
| Almonds | fat | 1 oz, 23 nuts (28 g) | 2.53 | 3.50 | 5.92 | 13.98 | 162 | 15 | 0.38 |
| Walnuts | fat | 1 oz, 14 halves (28 g) | 1.96 | 1.88 | 4.26 | 18.26 | 183 | 15 | 0.29 |
| Olive oil | fat | 1 tbsp (14 g) | 0.00 | 0.00 | 0.00 | 14.00 | 124 | 0 | 0.00 |
| Chia seeds | fat | 2 tbsp (24 g) | 1.85 | 8.26 | 3.97 | 7.38 | 117 | 15 | 0.28 |
| Strawberries | veg | 1 cup, sliced (100 g) | 5.68 | 2.00 | 0.67 | 0.30 | 32 | 40 | 2.27 |
| Raspberries | veg | 1 cup (100 g) | 5.44 | 6.50 | 1.20 | 0.65 | 52 | 32 | 1.74 |
| Blueberries | veg | ½ cup (75 g) | 9.07 | 1.80 | 0.55 | 0.25 | 43 | 53 | 4.81 |

Berries are placed in the **veg** zone because they occupy the plant half of the
plate. The filter chip still separates them. Blueberries have the highest GI and
net carbs of the three; the half-cup serving is deliberate.

Per-100 g source descriptions, as recorded in the app:

| Food | USDA description |
| --- | --- |
| Broccoli | Broccoli, raw (SR Legacy) |
| Spinach | Spinach, raw (SR Legacy) |
| Cauliflower | Cauliflower, raw (SR Legacy) |
| Zucchini | Squash, summer, zucchini, includes skin, raw |
| Bell pepper | Peppers, sweet, red, raw (SR Legacy) |
| Asparagus | Asparagus, raw (SR Legacy) |
| Wild salmon | Fish, salmon, coho, wild, raw (SR Legacy) |
| Egg | Egg, whole, raw, fresh (SR Legacy) |
| Chicken breast | Chicken, broilers or fryers, breast, meat only, raw |
| Firm tofu | Tofu, raw, firm, prepared with calcium sulfate |
| Avocado | Avocados, raw, all commercial varieties |
| Almonds | Nuts, almonds (SR Legacy) |
| Walnuts | Nuts, walnuts, English (SR Legacy) |
| Olive oil | Oil, olive, salad or cooking |
| Chia seeds | Seeds, chia seeds, dried |
| Strawberries | Strawberries, raw (SR Legacy) |
| Raspberries | Raspberries, raw (SR Legacy) |
| Blueberries | Blueberries, raw (SR Legacy) |

Values were rounded for teaching. Use FDC's exact records for clinical work.

## 3. The excluded foods

These are never placeable. Clicking one opens the warning modal, which shows its
per-serving load and the matching swap.

| Food | Serving | Net carbs | Fiber | GI | GL | Why it is excluded |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| White rice | 1 cup cooked (158 g) | 43.5 | 0.6 | 73 | 31.8 | Milled starch, almost no fiber brake |
| Baked potato | 1 medium (173 g) | 32.7 | 3.8 | 85 | 27.8 | Gelatinized starch, very high GI |
| French fries | small serving (117 g) | 44.1 | 4.4 | 75 | 33.1 | Refined starch plus high energy density |
| White bread | 2 slices (56 g) | 26.2 | 1.5 | 75 | 19.7 | Refined flour, soft and fast to eat |
| White pasta | 1 cup cooked (140 g) | 40.7 | 2.5 | 49 | 19.9 | Moderate GI, but a large typical load |
| Sugary cereal | 1 cup (40 g) | 32.6 | 1.2 | 82 | 26.7 | Extruded, sugar-coated, fast digesting |

These values are representative per-serving values, not a universal truth. Rice
and potato varieties, cooking method and cooling/reheating all change the
response.

## 4. Glycemic Safety Score

```text
score = 96
      − 1.7 × glycemicLoad
      − 0.45 × netCarbs
      + min(8, 0.55 × fiber)
      + min(6, 0.08 × protein)
      + 8 × vegShare
score = clamp(round(score), 0, 100)
```

- `vegShare` = number of veg/berry servings ÷ total servings.
- The score is **not** a nutrient-density or calorie score. It is a teaching
  heuristic for glycemic load and plate composition.
- If the plate is missing a zone, the band is replaced with **“Plate needs
  balance”** and an advice line names the missing component. The numeric score
  still reflects the glycemic math; a lone protein can be glycemically calm and
  still be an incomplete meal.

Bands:

| Score | Label | Tone |
| ---: | --- | --- |
| 0 with no food | Empty plate | neutral |
| 85–100 | Metabolically calm | green |
| 70–84 | Gentle on glucose | green |
| 55–69 | Watch the portions | amber |
| 0–54 | High spike risk | red |
| any, missing a zone | Plate needs balance | amber |

### Worked example: the balanced sample

`broccoli + spinach + cauliflower + strawberries + salmon + egg + avocado + almonds`

| Total | Value |
| --- | ---: |
| Servings | 8 |
| Net carbs | 17.7 g |
| Fiber | 16.4 g |
| Protein | 40.6 g |
| Fat | 37.3 g |
| Energy | 600 kcal |
| Glycemic load | 4.0 |
| Veg share | 0.50 |
| Score | **96** |

Calculation:

```text
96 − 1.7(4.0) − 0.45(17.7) + min(8, 0.55×16.4) + min(6, 0.08×40.6) + 8(0.50)
= 96 − 6.8 − 7.965 + 8 + 3.248 + 4
= 96.48 → 96
```

### Worked example: a lone salmon fillet

Net 0, fiber 0, GL 0, protein 19.84, vegShare 0 → `96 + 1.587 = 97.59 → 98`.
The band becomes **“Plate needs balance”** because there are no vegetables or
fats. This is intentional: the number describes glycemic load, the band describes
the plate.

## 5. The curve model

The curve is an illustrative population-style response, not a physiological
simulation and not personalized.

```text
baseline   = 92 mg/dL
rawRise    = 3 + 2.05 × GL
fiberBrake = 1 − min(0.40, 0.5 × fiber / (fiber + 18))
rise       = clamp(rawRise, 3, 96) × fiberBrake
peakTime   = reference ? 66 : 34 + min(34, netCarbs × 0.9)   // minutes
x          = minute / peakTime
shape      = x^1.6 × e^(1.6 × (1 − x))
glucose(t) = baseline + rise × shape
```

Samples: minutes 0, 5, 10 … 180 (37 samples). Peak is at `t = peakTime`, where
`shape = 1`. The reference meal is fixed at GL 46, fiber 5, net carbs 58, giving
`rise ≈ 85.6`, `peak ≈ 177.6 mg/dL`, `peakTime = 66 min`.

The balanced sample has GL 4.0, fiber 16.4 and net carbs 17.7:

```text
rawRise    = 3 + 2.05(4.0) = 11.2
fiberBrake = 1 − min(0.4, 0.5×16.4/(16.4+18)) = 1 − 0.2384 = 0.7616
rise       = 11.2 × 0.7616 = 8.53
peakTime   = 34 + min(34, 15.93) = 49.9 → ~50 min
peak       = 92 + 8.53 = 100.5 mg/dL
```

The chart draws the user curve in green and the reference in dashed orange. It
marks peaks with `+rise`. The target band is 70–140 mg/dL, but the app does not
diagnose anything from it.

## 6. Swaps and their arithmetic

The saved net carbs shown on a swap card are
`warning.net − sum(net of addIds)`, rounded to a whole gram.

| Craving | Swap | Pantry items | Net carbs saved (approx.) |
| --- | --- | --- | ---: |
| White rice | Cauliflower rice | cauliflower | 40 g |
| Pasta | Zucchini noodles | zucchini | 38 g |
| Mashed potatoes | Mashed cauliflower | cauliflower | 30 g |
| Wheat bread | Almond–chia cloud bread | almonds + chia | 22 g |
| Sugary snacks | Walnuts & berries | walnuts + strawberries | 25 g |
| French fries | Roasted asparagus | asparagus | 42 g |

These are teaching comparisons, not isocaloric replacements. Almond–chia is a
stand-in for the bread idea, not a literal cloud-bread recipe; a real recipe also
uses eggs.

## 7. Limitations, stated plainly

- **GI is variable.** It changes with ripeness, variety, processing, cooking,
  cooling, accompanying fat/fiber/protein and the individual. A single number
  cannot capture that.
- **USDA records are averages.** Brand, cultivar and preparation differ.
- **Net carbs are not the whole story.** Protein and fat affect satiety and
  gastric emptying; the score gives them a small credit but does not model
  calories, medication or insulin.
- **The curve is a shape, not a measurement.** It exists to compare a safe plate
  with a starchy reference, not to predict a reader's CGM.
- **The 30 g “gentle target”** in the UI is a teaching reference for this app's
  portions, not an ADA prescription. Individual targets are clinical decisions.
- **No personalization.** The app does not ask for weight, medication, diabetes
  type, activity or glucose data, by design.

If you change any number in this document, change the corresponding constant in
`script.js` and rerun the self-test and browser suite.
