# Jumi documentation

This directory is the **public documentation site**, and nothing else. Engineering records —
architecture decisions, investigations, the migration roadmap — live in `engineering/`; see
`engineering/README.md` for the rule.

An Astro static site built with Tailwind CSS v4 and the local Jumi plugin.
Run commands from the repository root:

```sh
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
```

The build generates `docs/dist/`. Deploy that directory to a static host.

## Deploying to Vercel

The site is **not its own package**. It has no `package.json` of its own: it uses the root one, the
root `node_modules`, `pnpm run bundle`, `scripts/prepare-docs.mjs`, and the `docs/vendor/` bundle
that script produces. Treating `docs/` as a project root therefore breaks the build, because none of
that is reachable from inside it.

So the Vercel project root is the **repository root** (`Root Directory: .`), not `docs`, and the
build contract is in the root `vercel.json` rather than in dashboard settings:

```json
{
  "buildCommand": "pnpm docs:build",
  "outputDirectory": "docs/dist"
}
```

`docs:build` already runs `bundle → docs:prepare → astro build --root docs`, and Astro writes to
`docs/dist` because that is its root. The two failure modes that look identical from the outside are
a Root Directory of `docs`, and a default output directory of `dist/` being expected at the
repository root.

`scripts/prepare-docs.mjs` copies the current bundled plugin to the ignored
`docs/vendor/` directory and synchronizes `src/data/effects.json` from Jumi's
keyframe catalog. Run `docs:prepare` after editing the library while the Astro
development server is running.

Pages live in `src/pages/`. Documentation pages use Markdown and `layouts/Docs.astro`.
The marketing page and catalog intentionally compile separate Tailwind/Jumi
stylesheets, avoiding the full effect inventory on the landing page.

Live specimens use Jumi classes. Site JavaScript only manages replay, pause,
clipboard actions, and catalog filtering. Reduced motion disables animations.

The current art direction is dark ink, electric chartreuse, apricot, and lilac,
with oversized typography and animated geometric specimens. The supplied numeric
style reference needs a visual or description before a precise match can be made.
