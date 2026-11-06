# Third-party notices

PlateWise 3D has no runtime dependency of its own. It loads one library from a
public CDN and cites published nutrition evidence.

## Three.js

- Package: `three`
- Version: **0.169.0** (pinned in the import map in `index.html`)
- License: MIT
- Source: <https://github.com/mrdoob/three.js>
- CDN: <https://cdn.jsdelivr.net/npm/three@0.169.0/>
- Used for: WebGL renderer, procedural geometry, lighting, shadows, orbit controls.

The add-on `examples/jsm/controls/OrbitControls.js` is part of the same MIT-licensed
package and is loaded from the matching version on the same CDN.

## Nutrition evidence

Nutrition values are derived from USDA FoodData Central (public domain), and the
clinical framing is drawn from the American Diabetes Association Standards of Care,
the 2019 nutrition consensus report and peer-reviewed carbohydrate-restriction
literature. Full citations and links are in [`docs/SOURCES.md`](docs/SOURCES.md)
and in the in-app Evidence dialog. These works are cited, not bundled.

## Fonts and assets

No web fonts, icon packs, stock photographs or audio files are downloaded at
runtime. The interface uses the operating system's UI and serif fonts. Every 3D
mesh is generated from Three.js primitives at runtime. The plate mark and favicon
are inline SVG authored for this project.

## Emoji

Food cards use the reader's system emoji font for recognition. Emoji are not
bundled and render differently across platforms.
