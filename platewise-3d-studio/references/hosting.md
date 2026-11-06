# Hosting and catalog

## GitHub Pages for the app

1. Create `somphol/platewise-3d` (public) with the default branch `main`.
2. Push the repository root.
3. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
4. Wait for the build; open `https://somphol.github.io/platewise-3d/`.
5. Verify `/`, `/docs/`, `/404.html`, `/sitemap.xml`, `/?selftest`.
6. Run `TEST_URL=... node tests/browser.test.mjs`.

No workflow is needed because the root is the artefact. `.nojekyll` prevents
Jekyll processing. `docs/index.html` makes `/docs/` a real HTML page instead of a
raw Markdown directory. `404.html` handles unknown paths under the repository.

## Skill repository

Mirror the reference layout:

```text
platewise-3d-skill/
├── README.md
├── AGENTS.md
├── ATTRIBUTION.md
├── LICENSE
├── index.json              # catalog, at the base URL
├── docs/preview.png
├── scripts/sync-index.mjs  # hashes the skill folder
└── platewise-3d-studio/
    ├── SKILL.md
    ├── ATTRIBUTION.md
    ├── LICENSE
    ├── assets/reference/   # the complete app
    ├── references/
    └── scripts/
```

The catalog base is `https://<user>.github.io/<repo>/`; `index.json` lists
`name`, `version` (12-hex content hash), `description`, `license`, `files`. Every
listed path is relative to `<base>/<name>/`, no `..`, no absolute URLs. The
version must change whenever any file changes; let the sync script compute it.

The install line is:

```jsonc
{ "skills": ["https://somphol.github.io/platewise-3d-skill/"] }
```

## Credentials without repeated prompts

The app repo and the skill repo require two pushes. Read the macOS keychain once:

```sh
umask 077
printf "protocol=https\nhost=github.com\n\n" | git credential fill > /tmp/.pw_session
```

Use an askpass helper that reads that file, and disable the helper for the
command:

```sh
#!/bin/sh
case "$1" in
  *Username*) echo x-access-token ;;
  *Password*) sed -n 's/^password=//p' /tmp/.pw_session ;;
esac
```

```sh
GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=/tmp/askpass.sh \
  git -c credential.helper= push -u origin main
```

Never print the token, never embed it in a remote URL, delete the temp file when
finished. Chrome tests use `--use-mock-keychain` and `--password-store=basic` with
a throwaway profile; those flags are the reason the browser suite does not prompt.

## Creating repos and Pages via API

The token needs `repo` (and `workflow` if you push workflows). Create:

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"platewise-3d","description":"...","homepage":"...","private":false}'
```

Enable Pages:

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<repo>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Poll `/pages/builds/latest` until `status` is `built`; then curl the URL. A
missing `delete_repo` scope makes deletion return 403, not silently fail.

## Final release checklist

- [ ] 22/22 static, 47/47 local browser, 47/47 live, 29/29 selftest.
- [ ] `state.json` generated from the session DB with final totals.
- [ ] Screenshots regenerated after the last visual change.
- [ ] `/`, `/docs/`, `/404.html`, `/sitemap.xml` return 200.
- [ ] Tag `v1.0.0` and create a release.
- [ ] Skill repo contains the final reference and a matching `index.json`.
- [ ] Scaffold from the skill into a clean directory; run 22 + 47 there.
- [ ] Catalog `index.json` fetches, and listed files return 200.
- [ ] Remove temporary credentials and any `/tmp` artifacts.
