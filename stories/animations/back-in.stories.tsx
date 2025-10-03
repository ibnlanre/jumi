import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationShowcase } from '../components/animation-showcase'

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
        component: 'Back in animations create a dramatic entrance effect with scaling and rotation.',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Animations/Back In Effects',
} satisfies Meta<typeof AnimationShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const BackIn: Story = {
  args: {
    animationClass: 'jumi animate-back-in',
    description: 'Element scales from 0 with a full rotation entrance',
    show: true,
    title: 'Back In',
  },
}

export const BackInDown: Story = {
  args: {
    animationClass: 'jumi animate-back-in-down',
    description: 'Element scales and slides down from above with rotation',
    show: true,
    title: 'Back In Down',
  },
}

export const BackInLeft: Story = {
  args: {
    animationClass: 'jumi animate-back-in-left',
    description: 'Element scales and slides in from the left with rotation',
    show: true,
    title: 'Back In Left',
  },
}

export const BackInRight: Story = {
  args: {
    animationClass: 'jumi animate-back-in-right',
    description: 'Element scales and slides in from the right with rotation',
    show: true,
    title: 'Back In Right',
  },
}

export const BackInUp: Story = {
  args: {
    animationClass: 'jumi animate-back-in-up',
    description: 'Element scales and slides up from below with rotation',
    show: true,
    title: 'Back In Up',
  },
}
