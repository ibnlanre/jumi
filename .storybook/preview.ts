import type { Preview } from '@storybook/react'

import { withThemeByClassName } from '@storybook/addon-themes'

import '../stories/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export const decorators = [
  withThemeByClassName({
    defaultTheme: 'light',
    themes: {
      dark: 'dark',
      light: 'light',
    },
  }),
]

export default preview
