# FAQ

## Is this medical advice?

No. PlateWise is an educational visualization. It does not diagnose, treat or
predict your glucose response, and it does not know your medication, activity,
diabetes type or targets. Talk to your clinician or a registered dietitian.

## Why are potatoes, corn, rice and bread excluded?

The brief is a **non-starchy whole-food** picker. Those foods are starchy or
refined and carry a large fast carbohydrate load. They are shown in the
watch-outs with their GI, GL and net carbs, plus a whole-food swap. They are never
placeable, by design. Corn is a grain; it is excluded on the same basis, though it
is not one of the six named warning cards.

## Are beans, lentils or chickpeas included?

No. Legumes are whole foods and can fit many carbohydrate-aware plans, but they
are higher in starch than the non-starchy vegetables this app is built around.
Adding them would require a different plate model and honest portion guidance.

## Why are berries in the veggie zone?

They are plant foods and occupy the 50% plant half of the plate. The pantry
filter still separates them, and each berry has an explicit serving: strawberries
1 cup, raspberries 1 cup, blueberries **½ cup** because of their higher sugar and
GI.

## What does the Glycemic Safety Score mean?

It is a transparent teaching formula:

```text
96 − 1.7·GL − 0.45·netCarbs + fiber credit + protein credit + veg share
```

It rewards fiber, protein and vegetable share and penalizes glycemic load and
net-carb density. It is not an ADA score, not a CGM prediction and not a
nutrient-density score. See [NUTRITION.md](NUTRITION.md).

## Why does a plate of only salmon score 98?

Because the score is about glycemic load, and salmon has none. The band still
says **Plate needs balance** and tells you to add vegetables and fat. The number
and the label answer different questions on purpose.

## Is the glucose curve real?

No. It is a deterministic gamma-shaped illustration with a 92 mg/dL baseline and
a fixed starchy reference. It is useful for comparing a low-load plate with a
rice-and-potato plate. It is **not** a CGM, a physiological model or a prediction
about you.

## Can I connect my CGM?

No. The project has no backend, account or device integration. That is a
deliberate privacy and scope decision.

## Where is my data stored?

Only in your browser's `localStorage`: saved meals under `platewise.meals.v1` and
theme/auto-rotate under `platewise.prefs.v1`. Nothing is uploaded. Export writes
a local JSON file. See [PRIVACY.md](PRIVACY.md).

## Why did my plate disappear after reload?

The current plate is a scratch space and is not persisted. Saved meals are. Press
**Save this meal** before reloading, or load it from the log.

## Does it work offline?

After a first successful load, the browser may have cached the pinned Three.js
module, but the project does not ship a service worker or a fully offline bundle.
The pantry and calculations can still run if WebGL is unavailable, but a cold
first load needs the CDN.

## Is it accessible?

The DOM is the primary interface: add, remove, inspect, search, save, load and
swap all work without the canvas. There is a skip link, labelled dialogs, a live
announcer and reduced-motion support. It has not had a formal assistive-technology
audit. See [ACCESSIBILITY.md](ACCESSIBILITY.md).

## Can I use it in a clinic or classroom?

Yes, with the medical disclaimer intact and without implying endorsement by the
ADA, USDA, NIH or any cited author. For teaching, the methodology page and the
sources are the useful companion. If you adapt it, keep the attribution and MIT
license.

## Can I fork it and add my own foods?

Yes. Read [REPRODUCTION.md](REPRODUCTION.md) and [ARCHITECTURE.md](ARCHITECTURE.md).
Add the USDA description, a 3D factory, the docs row and tests. Do not add a food
without a source or a serving size.

## Why does the site need internet on first load?

Three.js is loaded from a pinned jsDelivr URL so the repository stays a
three-file static app. Vendoring it would add ~700 KB and a license/version
maintenance burden; that is a possible future change, not a current feature.

## How do I report a bug or a nutrition error?

Use GitHub Issues. For a nutrition error, include the food, the value you
believe is wrong, the correct value and the USDA/GI source. For security, use the
private advisory channel, not a public issue.
