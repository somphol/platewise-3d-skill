# Security policy

## What this project is

PlateWise 3D is a static client-side site. It has no server, database, login,
cookies, API keys or user accounts. Meals and theme preferences are kept in the
browser's `localStorage`.

## Supported versions

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |

## Reporting a vulnerability

Please **do not open a public issue** for a security problem. Use GitHub's
[private vulnerability reporting](https://github.com/somphol/platewise-3d/security/advisories/new)
for this repository. Include:

- the affected file or URL;
- steps to reproduce;
- the impact you believe it has;
- any suggested fix.

You should receive an acknowledgement within a reasonable time. This is a
volunteer project; please allow for that.

## Scope

In scope:

- Cross-site scripting through meal names, imported data or URL parameters.
- A dependency compromise in the pinned Three.js CDN path.
- Leakage of `localStorage` data to a third party.
- A logic flaw that makes a starchy warning food placeable.

Out of scope:

- Missing security headers that GitHub Pages does not allow configuring.
- The accuracy of nutrition or glycemic values (see the methodology; report
  factual errors as normal issues with a source).
- Medical outcomes. This is not a medical device.
- Denial of service against your own browser via enormous local data.

## Data handling

There is no server-side data. “Delete all” in the meal log clears the local
array. Clearing site data removes everything. Export writes a local JSON file.

## Dependency hygiene

Three.js is pinned to `0.169.0` in the import map and loaded over HTTPS from
jsDelivr. There is no npm install at runtime or in CI. When upgrading, review the
release notes and rerun the full browser suite.
