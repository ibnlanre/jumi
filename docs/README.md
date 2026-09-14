# Jumi documentation

This directory is the **public documentation site**, and nothing else. Engineering records live in
`engineering/`; see `engineering/README.md` for the rule.

An Astro static site built with Tailwind CSS v4 and the local Jumi plugin. Run the commands from the
repository root:

```sh
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
```

The build writes `docs/dist/`. That directory is what gets deployed, and the deploy contract lives in
the root `vercel.json` — see `engineering/research/deployment.md`.

## How the site is built

`scripts/prepare-docs.mjs` copies the bundled plugin, integration and runtime into the ignored
`docs/vendor/` directory — each with its declaration, because the files that import them are typed — and
writes `src/data/effects.json` from Jumi's keyframe catalog. Run `docs:prepare` after editing the
library while the development server is running.

Pages live in `src/pages/`: Markdown guides with `layouts/Docs.astro`, plus a kinetic landing page and
an effect catalog. Those two compile their own Tailwind/Jumi stylesheets, so a visitor reading the
introduction does not download the whole effect collection.

Live specimens use Jumi classes. The site's JavaScript only handles replay, pause, clipboard actions
and catalog filtering, and reduced motion disables animations.

Art direction is dark ink, electric chartreuse, apricot and lilac, with oversized typography and
animated geometric specimens.
