import type { StorybookConfig } from '@storybook/react-vite'
import type { UserConfig } from 'vite'

const config: StorybookConfig = {
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-themes',
  ],
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')

    // From `dist/`, like the `@plugin` in `stories/globals.css`: stories are a real consumer, and
    // without the finalizer every carrier resolves `animation-name: none` — with no error, because
    // a carrier with no aggregate looks exactly like a carrier with no slots.
    //
    // `jumi()` replaces `tailwindcss()`: one entry, as the docs describe. The specifier is what this
    // project's stylesheet registers by — `stories/globals.css` names the bundle by path — so the
    // integration recognises it as already registered instead of adding a second directive.
    const { default: jumi } = await import('../dist/vite.js')

    const viteConfig: UserConfig = {
      plugins: jumi({ plugin: '../dist/index.js' }),
    }

    return mergeConfig(config, viteConfig)
  },
}

export default config
