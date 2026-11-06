# Performance

PlateWise is a small static page. The largest cost is the Three.js module and the
initial WebGL scene; everything else is three text files.

## What ships

| Item | Approximate size |
| --- | ---: |
| `index.html` | ~30 KB |
| `style.css` | ~54 KB |
| `script.js` | ~107 KB |
| Screenshots (not loaded by the app) | ~500 KB total |
| Three.js module + OrbitControls (CDN, cached) | ~700 KB uncompressed |

There is no hero photograph, web font, icon pack, audio file or video. The page
has a handful of procedural canvas textures (background gradient, three zone
labels) generated at runtime.

## Measured in headless Chrome

At 1600 × 1000, a freshly loaded empty plate reported:

- 26 draw calls;
- about 4,090 triangles;
- 18 pantry cards;
- 0 console errors.

The balanced eight-item plate adds roughly 150–250 low-poly meshes; the scene
remains well within a laptop GPU's budget. The renderer caps DPR at 2, so a
Retina display does not render at 3× or 4×.

## Techniques used

- One renderer, one scene, one camera, one animation loop.
- Low-poly primitives (`IcosahedronGeometry`, `CapsuleGeometry`, spheres,
  cylinders, boxes, torus). No subdivision surfaces, no glTF loader.
- Procedural gradient and label textures; no image decoding.
- DPR cap and shadow map at 2048² (one shadow-casting light).
- Hover raycasting is throttled and only tests the placed groups.
- Removed foods dispose their geometries and materials.
- `document.hidden` pauses scene work.
- The chart redraws on data/theme changes, not on every animation frame; the
  draw-in animation is one 650 ms run.
- No post-processing, bloom, physics, ray-traced shadows or instanced particle
  systems.

## Network

- First load needs the pinned Three.js module and OrbitControls from jsDelivr.
  They are versioned and cacheable.
- No other runtime requests. Opening a source link is a user action.
- GitHub Pages may take a moment to propagate a new deployment; the app itself is
  static and has no cold start.

## Things that would change the budget

- Adding a second renderer or post-processing.
- Loading a 3D model per food instead of primitives.
- Rendering the plate at DPR 3.
- Putting the 47-check browser suite in the page itself.
- Adding a web font or a large hero image.

If you add one of these, measure again and update this page. The performance
claim is intentionally modest: fast on a typical laptop and phone, not a
benchmark record.

## Reproduce the numbers

```js
// in the page console after load
window.__platewise.sceneInfo()
// { items, calls, triangles, distance, webgl }
```

Or run:

```sh
node scripts/smoke.mjs
```

The smoke script prints `sceneInfo`, the selftest result and console-error count.
