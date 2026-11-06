# Three.js scene

## Camera and renderer

- One `WebGLRenderer` on `<canvas id="scene">`.
- `PerspectiveCamera(40)`, position `(0, 7.4, 8.8)`, target `(0, 0.35, 0)`.
- OrbitControls: damping 0.07, distance 7–18, polar 0.32–1.36, auto-rotate 0.55.
- sRGB output, ACES tone mapping exposure 1.0, PCF soft shadows, DPR cap 2.
- Lights: hemisphere 1.15, key directional 2.0 with 2048² shadows, cool fill 0.58,
  warm rim point 18. Reduce the key on dark theme to 1.8.
- Table radius 18 at y=−0.26, cloth plane at y=−0.255.
- CSS vignette overlay; do not fake it in the scene.

## Plate

- Base cylinder radius 3.4, rim torus radius 3.3, white well at y≈0.
- Three ring sectors, unlit `MeshBasicMaterial`, opacity 0.32. World-space
  zones: veg `0…π`, protein `π…3π/2`, fat `3π/2…2π`. Because RingGeometry is
  rotated onto XZ, theta starts are mirrored: veg `π…2π`, protein `π/2…π`, fat
  `0…π/2`. The reference already had this bug once — verify a render.
- White divider lines at 0, π, 3π/2.
- Labels: canvas sprites at radius 2.62, pill background, `depthTest:false`,
  renderOrder 3. HTML zone legend is authoritative.
- Cutlery boxes/cylinders at x=±4.35, y=−0.23.

## Slots

```js
veg:     [[2.22,28],[2.22,72],[2.22,110],[2.22,152],
          [1.28,42],[1.28,90],[1.28,138],[0.72,90]]
protein: [[2.08,206],[2.08,242],[2.08,268],[1.2,238],[0.62,238]]
fat:     [[2.08,292],[2.08,316],[2.08,340],[1.2,316],[0.62,316]]
```

`targetFor` counts earlier entries in the same zone and picks that index. Overflow
shifts radius inward by 0.18 and angle by 7°. Y = `PLATE_TOP` 0.06. Food group
base must be local y=0. Spawn 1.1 above, scale in 520 ms cubic, bob ±0.012, scale
out 260 ms, dispose after.

Caps: 12 total, veg 8, protein 4, fat 5. `addFood` refuses with a toast.

## Food factories

`FOOD_FACTORIES` maps ID → function returning a `THREE.Group`.

- **broccoli**: stalk cylinder, 6 icosahedron florets.
- **spinach**: 6 flat scaled spheres (leaves) + thin stems.
- **cauliflower**: cream icosahedron head + 6 bumps + 3 leaves.
- **zucchini**: horizontal cylinder, 2 end spheres, pale top strip, 3 light lines.
- **bell pepper**: 3-lobed red body, stem, leaf, half-torus creases.
- **asparagus**: 5 tilted cylinders + cone tips.
- **salmon**: pink capsule, 4 pale top stripes at y≈0.345, dark skin base.
- **egg**: sunny-side-up white + yolk hemisphere.
- **chicken**: beige capsule + 3 char lines.
- **tofu**: 3 ivory cubes with edge lines.
- **avocado**: dark hemisphere shell + green flesh + brown pit.
- **almonds**: 7 flat tan ellipsoids + a thin ring.
- **walnuts**: 3 lumpy brown icosahedra + bumps.
- **olive oil**: green glass bottle, oil, neck, cork, cream label.
- **chia**: bowl + 22 tiny seeds.
- **strawberry**: upside-down cone + 10 seeds + 5 leaf spheres + stem.
- **raspberry**: 9 pink drupes + 4 leaves.
- **blueberries**: 7 dusty blue spheres.

The expanded pantry adds 22 reusable form families (`leafy`, `floret`, `cabbage`,
`long`, `bean`, `okra`, `round`, `mushroom`, `artichoke`, `bulb`, `shrimp`,
`fillet`, `smallfish`, `poultry`, `steak`, `meat`, `tempeh`, `yogurt`, `nut`,
`seed`, `olives`, `oilbottle`). They read `food.form`, `food.color` and
`food.accent`. Do not use external models or textures. All materials are
`MeshStandardMaterial` unless a zone label/zone sector is unlit.

## Pointer and selection

- `pointerdown` records position; `pointerup` ignores movement >7 px.
- Raycast `[...items.values()].map(i => i.group)` recursively. Walk parents to
  `userData.servingUid`.
- `scene.onSelect(uid|null)` toggles DOM selection.
- Gold torus at plate surface follows selected group; scales with `food.ring`.
- Hover raycasts show a small tooltip with name + net carbs. Do not block
  OrbitControls.

## Theme

`setTheme` replaces the background gradient, fog, table/cloth colors and key
intensity. The plate stays white; food keeps its materials. Call `chart.refresh()`
after a theme change.

## Failure

If WebGL construction throws, keep the pantry/score/chart/log usable, show a clear
message and do **not** hide the loading/error panel. Set
`document.body.dataset.scene = "fallback"`.
