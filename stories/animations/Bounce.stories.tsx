import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationShowcase } from '../components/AnimationShowcase'

const meta = {
  argTypes: {
    show: {
      control: 'boolean',
      description: 'Whether to show the animation',
    },
    trigger: {
      control: 'boolean',
      description: 'Trigger to restart the animation',
    },
  },
  component: AnimationShowcase,
  parameters: {
    docs: {
      description: {
        component: 'Bounce animations create a playful elastic effect with scaling transitions.',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Animations/Bounce Effects',
} satisfies Meta<typeof AnimationShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const BounceIn: Story = {
  args: {
    animationClass: 'animate-bounce-in',
    description: 'Element bounces in with elastic scaling effect',
    show: true,
    title: 'Bounce In',
  },
}

export const BounceOut: Story = {
  args: {
    animationClass: 'animate-bounce-out',
    description: 'Element bounces out with elastic scaling effect',
    show: true,
    title: 'Bounce Out',
  },
}
