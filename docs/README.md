# Jumi documentation

An Astro static site built with Tailwind CSS v4 and the local Jumi plugin.
Run commands from the repository root:

```sh
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
```

The build generates `docs/dist/`. Deploy that directory to a static host.

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
