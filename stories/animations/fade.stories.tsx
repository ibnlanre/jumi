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
        component: 'Fade animations create smooth opacity and movement transitions.',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Animations/Fade Effects',
} satisfies Meta<typeof AnimationShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const FadeIn: Story = {
  args: {
    animationClass: 'animate animate-fade-in',
    description: 'Element fades in with smooth opacity transition',
    show: true,
    title: 'Fade In',
  },
}

export const FadeOut: Story = {
  args: {
    animationClass: 'animate animate-fade-out',
    description: 'Element fades out with smooth opacity transition',
    show: true,
    title: 'Fade Out',
  },
}

export const FadeDown: Story = {
  args: {
    animationClass: 'animate animate-fade-down',
    description: 'Element fades and slides down',
    show: true,
    title: 'Fade Down',
  },
}

export const FadeUp: Story = {
  args: {
    animationClass: 'animate animate-fade-up',
    description: 'Element fades and slides up',
    show: true,
    title: 'Fade Up',
  },
}

export const FadeLeft: Story = {
  args: {
    animationClass: 'animate animate-fade-left',
    description: 'Element fades and slides to the left',
    show: true,
    title: 'Fade Left',
  },
}

export const FadeRight: Story = {
  args: {
    animationClass: 'animate animate-fade-right',
    description: 'Element fades and slides to the right',
    show: true,
    title: 'Fade Right',
  },
}
