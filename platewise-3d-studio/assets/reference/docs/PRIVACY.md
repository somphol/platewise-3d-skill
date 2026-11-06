# Privacy

PlateWise is built to have almost no privacy surface. There is no account, no
server, no database, no cookie and no analytics.

## What stays in your browser

| Key | Contents | Lifetime |
| --- | --- | --- |
| `platewise.meals.v1` | Saved meal names, food IDs, summary numbers, timestamps | Until you delete them or clear site data |
| `platewise.prefs.v1` | `theme` (`light`/`dark`) and `autoRotate` | Until you clear site data |

The current plate is held in memory only. It is not saved unless you press
**Save this meal**. Meal names are free text and can contain personal information
if you type it there; the app never sends them anywhere.

Clearing data:

- **Delete all** in the meal log removes `platewise.meals.v1` contents through
  the app.
- Clearing site data / “Cookies and site data” for the site removes both keys.
- The export button writes a local `.json` file through a Blob URL; it does not
  upload.

## Network requests

The app makes exactly one kind of third-party request:

1. **jsDelivr CDN** for the pinned Three.js module and `OrbitControls` at
   `https://cdn.jsdelivr.net/npm/three@0.169.0/...`.

That request necessarily exposes your IP address, user agent and the requested
URL to jsDelivr, as any CDN request does. It is not used for analytics by this
project, and the app sets no cookies. GitHub Pages, which serves the site,
likewise receives standard server-log information under GitHub's privacy
statement.

There are **no** requests to USDA, PubMed, ADA, font services, image hosts,
analytics vendors, error-reporting services or advertising networks at runtime.
The source links open only when you click them.

## localStorage and private browsing

Storage helpers catch quota and privacy-mode errors. If storage is unavailable,
the app still works; saving reports that it could not persist. Nothing is
silently transmitted as a fallback.

## Children and health data

The app does not ask for age, weight, diagnosis, medication, glucose readings or
any other health information. It is not designed to collect data from children or
anyone else.

## Changes

If a future version adds analytics, accounts, cloud sync or a real CGM
integration, it must update this page, add a consent flow, and change the static
tests that currently forbid trackers. Do not slip a tracker in as a “small
improvement”.

## Contact

For a privacy concern, open an issue without including personal data, or use the
repository's private security reporting channel if the concern is sensitive.
