import type { StorybookConfig } from '@storybook/react-vite';
import type { UserConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.mdx'
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;
 
    const viteConfig: UserConfig = {
      plugins: [tailwindcss()],
    }
    
    return mergeConfig(config, viteConfig);
    
  },
}

export default config
