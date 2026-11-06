# Sources

PlateWise cites published evidence; it does not bundle or redistribute it. The
in-app Evidence dialog lists the same references. Links were checked on
2026-11-05. The research records below live in the NIH/PubMed literature
system; access dates and publisher pages may change.

## Clinical guidance

1. **American Diabetes Association Professional Practice Committee.**
   *Standards of Care in Diabetes—2025.* Diabetes Care 2025;48(Suppl 1).
   <https://diabetesjournals.org/care/issue/48/Supplement_1>
   Used for the plate method, carbohydrate awareness, individualized nutrition
   goals and the framing that nutrition therapy is not one-size-fits-all.

2. **Evert AB, Dennison M, Gardner CD, et al.** *Nutrition Therapy for Adults
   With Diabetes or Prediabetes: A Consensus Report.* Diabetes Care.
   2019;42(5):731–754. <https://doi.org/10.2337/dci19-0014>
   Used for the emphasis on non-starchy vegetables, whole foods and reduced
   overall carbohydrate intake as one valid approach.

3. **Feinman RD, Pogozelski WK, Astrup A, et al.** *Dietary carbohydrate
   restriction as the first approach in diabetes management: critical review and
   evidence base.* Nutrition. 2015;31(1):1–13.
   <https://pubmed.ncbi.nlm.nih.gov/25287761/>
   Used for the physiological rationale and the clinical context of
   carbohydrate restriction. It is cited as context, not as a promise that any
   reader should restrict carbohydrates.

## Nutrition data

4. **USDA FoodData Central.** SR Legacy and Foundation Foods.
   <https://fdc.nal.usda.gov/>
   Used for per-100 g energy, carbohydrate, fiber, protein and fat. Every food
   card's `source` field names the USDA description used. The app converts to
   the displayed serving with `servingG / 100`.

5. **Atkinson FS, Brand-Miller JC, Foster-Powell K, Buyken AE, Goletzke J.**
   *International tables of glycemic index and glycemic load values 2021: a
   systematic review.* Diabetes Care. 2021;44(9):2172–2181.
   <https://doi.org/10.2337/dc21-0658>
   Used for typical GI values and the GL definition.

6. **University of Sydney Glycemic Index Research Service.** GI database.
   <https://glycemicindex.com/>
   Used as a cross-check for typical GI values and methodology.

## How the values map to the app

| App concept | Source | Notes |
| --- | --- | --- |
| Per-100 g macros | USDA FDC | Rounded |
| Serving size | Author's realistic serving | Explicit on every card |
| Glycemic index | Published tables | Population approximations, not a measurement of the reader |
| Glycemic load | GI × net carbs / 100 | Derived in the app |
| Plate proportions | ADA plate method | 50% non-starchy veg, 25% protein, 25% fat |
| Safety score | This project | A teaching heuristic, not a clinical score |
| Glucose curve | This project | Illustrative shape, not a CGM |

### A note on precision

USDA values are averages across samples. GI values vary by cultivar, ripeness,
processing and preparation, and published tables differ. PlateWise uses
representative, rounded values suitable for teaching and comparison; it does not
claim that a given number is the unique correct value for every broccoli floret
or every bowl of rice. For clinical or research use, query FDC and the primary GI
literature directly.

## What is deliberately not cited

- No commercial CGM vendor data is used.
- No social-media nutrition claims are used.
- No supplement marketing is used.
- The app does not claim ADA endorsement. The ADA and other publishers are cited
  as evidence sources only.

## Medical disclaimer

PlateWise is an educational visualization. It does not diagnose, treat, cure or
prevent diabetes or any condition. Do not start, stop or change medication,
insulin or a therapeutic diet based on this app. Consult a clinician or
registered dietitian.
