Yes. After looking at the repo, I think there are **two separate problems that should be fixed independently**.

The first is organizational. Right now `docs/` is doing two incompatible jobs:

* it is the Astro application that powers the public Jumi website, with `src/pages/docs/*`, `src/layouts`, `public`, and `astro.config.mjs`;
* it is also accumulating engineering records such as `migration.md`, `carrier-locality.md`, `dependency-gap.md`, `scanner-inventory.md`, `aggregate-representation.md`, and `upstream-limitation.md`.

I would separate those now.

### Public `docs/` should mean one thing

I’d reserve:

```text
docs/
```

for the **public Astro site only**.

That includes:

```text
docs/
  astro.config.mjs
  public/
  src/
    pages/
    layouts/
    styles/
    data/
  README.md
```

Your actual user documentation is already under `docs/src/pages/docs/`, which contains things like installation, controls, properties, transitions, accessibility, and stagger. That is the right public-facing layer.

The engineering material deserves a different home.

My preference would be:

```text
engineering/
  architecture/
  research/
  roadmap/
```

For example:

```text
engineering/
  architecture/
    aggregate-representation.md
    carrier-locality.md
    dependency-gap.md

  research/
    scanner-inventory.md
    upstream-limitation.md

  roadmap/
    migration.md
```

I prefer `engineering/` over `internal/` because this is a public repository, so none of it is really private. “Engineering” communicates **intended audience**, not access control.

`phrases.md` is the one I would classify based on its contents. If it explains user-visible phrase semantics, it may belong in public docs eventually. If it is primarily implementation history and investigations, move it under engineering too.

I would also consider moving `CTO.md` and `HOOKS.md` under this umbrella later, perhaps:

```text
engineering/
  decisions/
  architecture/
  research/
```

but I would not mix that cleanup into the immediate migration unless you want to tidy the whole repository now.

The rule going forward should be simple:

> `docs/` is product documentation. `engineering/` explains how and why Jumi is built.

That should stop future agents from interpreting every technical investigation as something intended for the website.

---

## The Vercel problem

I think the source of the confusion is visible in `package.json`.

The docs are **not their own package**. Astro lives in the root package's dev dependencies, and all docs commands are root-level scripts:

```json
"docs:dev": "astro dev --root docs",
"docs:build": "pnpm run bundle && pnpm run docs:prepare && astro build --root docs",
"docs:preview": "astro preview --root docs"
```

And your docs README explicitly says the build result is:

```text
docs/dist/
```

So **Vercel should not treat `docs/` as the project root**.

That is the trap.

If you configure Vercel with:

```text
Root Directory: docs
```

you are effectively telling it that `docs/` is an independent application/package. But it isn't. It depends on:

* the root `package.json`
* the root `node_modules`
* `pnpm run bundle`
* `scripts/prepare-docs.mjs`
* the generated root `dist`
* the vendoring process that produces `docs/vendor/*`

Your `astro.config.mjs` even documents that relationship explicitly: the docs use a vendored Jumi bundle because `docs` itself is not a package.

### I would configure Vercel like this

Keep the Vercel project root at the **repository root**.

Then configure:

```text
Framework Preset: Astro
Build Command: pnpm docs:build
Output Directory: docs/dist
```

The important part is:

```text
Root Directory: .
```

not:

```text
Root Directory: docs
```

Your build command already handles everything correctly:

```text
bundle
→ docs:prepare
→ astro build --root docs
```

and Astro then writes to `docs/dist`.

I strongly suspect Vercel is currently either:

1. using `docs` as Root Directory and therefore losing access to the parent build environment, or
2. running `pnpm docs:build` from the repository root correctly but expecting the default Vercel/Astro output at `dist/` instead of `docs/dist/`.

Either produces exactly the kind of failure you're describing.

---

## I would make the Vercel configuration explicit in the repo

Rather than relying on dashboard settings that someone will forget later, I'd add a root `vercel.json`:

```json
{
  "buildCommand": "pnpm docs:build",
  "outputDirectory": "docs/dist"
}
```

Then the repository itself says what gets deployed.

You could potentially specify the framework too, but I don't think that's necessary. The two important facts are the build command and output directory.

And I would **not** change:

```json
"docs:build": "pnpm run bundle && pnpm run docs:prepare && astro build --root docs"
```

just to appease Vercel. That script is already expressing the actual build correctly.

---

### One thing I noticed while inspecting the repo

There is also a separate top-level:

```text
documentation/
```

containing `effects.md` and `stagger.md`.

That now gives you **three documentation concepts**:

```text
docs/                  Astro site + engineering notes
documentation/         old Markdown docs
README.md              package/project entry
```

Before 1.0, I would collapse that ambiguity.

My desired end-state is:

```text
docs/                  public documentation website
engineering/           technical history, ADRs, investigations, migration notes
README.md               package/repository introduction
```

and either migrate `docs/src/pages/effects.astro` / `stagger.md` into the public Astro pages or archive them if `docs/src/pages/docs/*` supersedes them.

That gives both humans and agents a much harder structure to misunderstand.

If you want, the next thing I can do is inspect those engineering Markdown files and `documentation/` more closely and give you an **exact move map** of what belongs under `engineering/architecture`, `engineering/research`, public `docs`, or can be considered superseded.
