# Deployment: the Vercel contract, and the 2026-09-12 diagnosis

This is the engineering record for how the documentation site is deployed. The site's own README
keeps two lines and points here.

## The contract

The site is **not its own package**. It has no `package.json` of its own: it uses the root one, the
root `node_modules`, `pnpm run bundle`, `scripts/prepare-docs.mjs`, and the `docs/vendor/` bundle
that script produces. A Root Directory of `docs` therefore cannot reach any of that.

The contract lives in the root `vercel.json`, not in dashboard settings:

```json
{
  "buildCommand": "pnpm docs:build",
  "outputDirectory": "docs/dist"
}
```

`docs:build` runs `bundle → docs:prepare → astro build --root docs`, and Astro writes to `docs/dist`
because that is its root. Verified: exit 0, 9 pages, `docs/dist` (728K), and `docs/dist` is ignored
by git through the generic `dist` rule.

**The dashboard overrides `vercel.json`**, so Build Command and Output Directory must be _empty_
there for the file to win.

| Setting          | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Root Directory   | the repository root — **not** `docs`                                   |
| Framework Preset | Astro (its default output goes unused, because `vercel.json` sets one) |
| Build Command    | empty                                                                  |
| Output Directory | empty                                                                  |
| Install Command  | default                                                                |
| Node.js Version  | default (20.3+ or 22)                                                  |

## The diagnosis

The live deployment served a single stale `index.js` — Jumi's own bundle from an old build — with
404 everywhere else:

```text
GET /               200  text/javascript   "use client" + esbuild interop
GET /index.js       200   the only file deployed
GET /index.html     404
GET /postcss.js     404   (it is in dist/, which is the point)
GET /docs/…         404
```

The served bundle's hash differed from the current `dist/index.js`, so it was a _stale successful
build_, not a broken one. Two causes, both in project settings:

1. **`engines.node` said `>=16.0.0`.** Astro requires `18.20.8 || ^20.3.0 || >=22` and Tailwind v4
   needs Node 20+, so Vercel was free to install a Node the documentation build cannot run on.
   Builds were failing, which is why the last successful deployment was old rather than absent.
   Fixed to `>=20.3.0`.
2. **The output directory was the framework default (`dist`)** instead of `docs/dist`. `dist/` is
   Jumi's own bundle directory, which is exactly what the site was serving.

## Not committed, deliberately

A `packageManager` field (`"pnpm@11.9.0"`) would pin the package manager for Vercel and for
contributors. It is not committed because it makes Corepack fetch that exact pnpm on every install:
fine on Vercel, a slow first install locally, and it hangs a sandboxed terminal that has no network.
Add it when a CI or a second contributor makes the pin worth that cost.
