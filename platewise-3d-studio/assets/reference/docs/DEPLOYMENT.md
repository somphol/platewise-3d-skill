# Deployment

PlateWise 3D is a static site. The repository root **is** the deployment artefact.
There is no build, no environment variable and no server runtime.

## GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. In **Settings → Pages**, choose **Deploy from a branch**, branch `main`,
   folder `/ (root)`.
3. Wait for the Pages build (usually under two minutes).
4. Open <https://somphol.github.io/platewise-3d/>.
5. Run the live verification:

```sh
TEST_URL=https://somphol.github.io/platewise-3d/ node tests/browser.test.mjs
```

`.nojekyll` is present so GitHub Pages does not run Jekyll over the files. The
root URL, docs folder and `404.html` are served as static files.

### Why not a Pages workflow?

The root can be served directly, so there is no artefact to upload. The CI
workflow verifies code only; it does not deploy. This keeps the release simple
and makes the deployed commit exactly the tested commit.

## Custom domain (optional)

1. Add a `CNAME` file containing the domain.
2. Configure the DNS records GitHub documents (A/AAAA for apex, CNAME for `www`).
3. Enable **Enforce HTTPS**.
4. Update `index.html` canonical/OG URLs, `sitemap.xml`, `robots.txt`,
   `README.md`, `state.json` and the tests that assert the Pages URL.

Do not commit a CNAME unless the DNS is ready; otherwise Pages will fail.

## Cache behaviour

- GitHub Pages serves with its own caching. `index.html` is usually revalidated;
  hashed assets are not used, so a hard reload is the quickest way to see a
  change.
- The Three.js CDN is cached by the browser. The version is pinned, so a cached
  copy is valid indefinitely.
- The local test server sends `cache-control: no-store`, so tests see edits
  immediately.

## Rollback

Pages serves the selected branch. Revert the commit and push; the previous
revision is restored. There is no database or migration.

## Security and privacy

- No secrets, tokens or environment files are required.
- No server headers can be configured on GitHub Pages; the app does not rely on
  CSP or HSTS.
- The only runtime network target is the pinned jsDelivr module.
- Meal names are escaped before insertion into the DOM.
- Do not add an analytics snippet to “see traffic”. It would break the privacy
  contract and the static test.

## Local production-like check

```sh
python3 -m http.server 8000
# visit http://localhost:8000/ and http://localhost:8000/?selftest
```

A file:// open is not supported: ES modules and the import map need an HTTP
origin, and the CDN needs network access.

## Fork checklist

- Change the canonical URL, OG URL, sitemap and robots URL.
- Change the GitHub repository links in the footer, README, AGENTS and state.
- Re-run `node --test tests/static.test.mjs` and the browser suite; the static
  suite asserts the canonical Pages URL.
- Re-generate screenshots only if your visual design changed.
- Keep the attribution and MIT license, or comply with their terms if you fork.
