import { defineConfig } from 'astro/config'

// Vendored by `pnpm docs:prepare`: the docs are not a package here, so `@ibnlanre/jumi/vite` does not resolve.
// One entry, as documented: `jumi()` composes Tailwind's Vite plugin, registers Jumi in each Tailwind
// entrypoint (`catalog.css`, `motion.css` — and not in `global.css`, which Tailwind does not
// compile), and completes the stylesheet afterwards. The specifier is the path those stylesheets
// would register by, because the docs use the vendored bundle rather than the package.
import jumi from './vendor/jumi-vite.js'

// The built CSS carries a bare `@layer components;` between `base` and `utilities`. It is not
// Jumi's and it is not Tailwind's: Lightning CSS rewrites Tailwind's ordering statement
// (`@layer theme, base, components, utilities;`) into one declaration per layer, and a layer with
// no rules becomes an empty statement. Measured on this entry with the plugin and without it —
// both emit it — while a Tailwind CLI build emits neither. The minifier is preserving the order
// Tailwind declared, so there is nothing here for Jumi to strip.
export default defineConfig({
  output: 'static',
  // The site's own address, and the one place it is written. `llms.txt` links in absolute URLs because a
  // crawler has to attribute what it read, and the alternative is a second copy of the domain that goes
  // stale quietly.
  site: 'https://jumi-css.vercel.app',
  vite: { plugins: jumi({ plugin: '../../vendor/jumi.js' }) },
})
