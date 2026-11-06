# Nutrition model

## Inputs

Each safe food has:

```js
{ id, name, emoji, category, zone, serving, servingG, gi, scale, ring,
  per100: { kcal, carbs, fiber, protein, fat }, blurb, tags, source }
```

`per100` comes from USDA FoodData Central. `servingG` is the only scaler.
`gi` is a typical published value; 0 for protein/oil.

## Per serving

```js
factor = servingG / 100
carbs = per100.carbs * factor
fiber = per100.fiber * factor
net = max(0, carbs - fiber)
protein = per100.protein * factor
fat = per100.fat * factor
kcal = round(per100.kcal * factor)
gl = gi * net / 100
```

Cache by food ID. Do not recompute per render.

## Plate totals

Accumulate net, carbs, fiber, protein, fat, kcal, GL and zone counts. Round
totals to one decimal before using them in the score (this is what the reference
does; document it if you change it).

`vegShare = vegCount / servings`, where berries count as veg because they occupy
the plant half.

## Score

```text
96
− 1.7 × GL
− 0.45 × net
+ min(8, 0.55 × fiber)
+ min(6, 0.08 × protein)
+ 8 × vegShare
```

Clamp 0–100, round. Empty plate → 0. If any zone is missing, replace the band with
**Plate needs balance** and name the missing zone; keep the number. A lone salmon
is glycemically calm but incomplete.

Bands: 85–100 “Metabolically calm”, 70–84 “Gentle on glucose”, 55–69 “Watch the
portions”, <55 “High spike risk”.

## Curve

```text
baseline  = 92
rawRise   = 3 + 2.05 × GL
brake     = 1 − min(0.4, 0.5 × fiber/(fiber+18))
rise      = clamp(rawRise, 3, 96) × brake
peakTime  = 34 + min(34, net × 0.9)      // reference 66
x         = t / peakTime
shape     = x^1.6 × e^(1.6 × (1 − x))
glucose   = 92 + rise × shape
```

37 samples, t = 0…180 step 5. Reference meal: GL 46, fiber 5, net 58 → rise
≈85.6, peak ≈177.6, peakTime 66.

Balanced sample (8 foods): GL 4.0, fiber 16.4, net 17.7 → rise 8.53, peak 100.5,
peakTime ≈50.

## Warnings

Per-serving, not per-100 g:

| Food | Net | Fiber | GI | GL |
| --- | ---: | ---: | ---: | ---: |
| White rice, 1 cup | 43.5 | 0.6 | 73 | 31.8 |
| Baked potato, medium | 32.7 | 3.8 | 85 | 27.8 |
| French fries, small | 44.1 | 4.4 | 75 | 33.1 |
| White bread, 2 slices | 26.2 | 1.5 | 75 | 19.7 |
| White pasta, 1 cup | 40.7 | 2.5 | 49 | 19.9 |
| Sugary cereal, 1 cup | 32.6 | 1.2 | 82 | 26.7 |

They are not in `FOODS`. The modal shows the three numbers, a plain explanation
and the swap.

## Swaps

Saved net = warning.net − sum(net of `addIds`), rounded for display. The
alternatives must exist in `FOODS`. A swap can add two items (bread → almonds +
chia; snacks → walnuts + strawberries).

## Sources

- USDA FoodData Central, SR Legacy / Foundation Foods, per 100 g.
- ADA Standards of Care in Diabetes—2025, Section 5.
- Evert et al., *Diabetes Care* 2019, doi:10.2337/dci19-0014.
- Atkinson et al., *Diabetes Care* 2021, doi:10.2337/dc21-0658.
- University of Sydney GI database.
- Feinman et al., *Nutrition* 2015, PMID 25287761.

## Non-negotiables

- Never call the curve a CGM or a prediction of a person's glucose.
- Never claim ADA endorsement.
- Keep the medical disclaimer and the “simulation, not a sensor” label.
- GI is an average; food prep changes it. Say so.
- The 30 g net-carb note is a teaching reference, not a prescription.
