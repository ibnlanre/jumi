import { defineConfig } from 'astro/config';

// Vendored by `pnpm docs:prepare`: the docs are not a package here, so `@ibnlanre/jumi/vite` does not resolve.
// One entry, as documented: `jumi()` composes Tailwind's Vite plugin, registers Jumi in each Tailwind
// entrypoint (`catalog.css`, `motion.css` — and not in `global.css`, which Tailwind does not
// compile), and completes the stylesheet afterwards. The specifier is the path those stylesheets
// would register by, because the docs use the vendored bundle rather than the package.
import jumi from './vendor/jumi-vite.js';

export default defineConfig({
  output: 'static',
  vite: { plugins: jumi({ plugin: '../../vendor/jumi.js' }) },
})
