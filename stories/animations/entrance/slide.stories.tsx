import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Slide Entrance Animations

The slide family provides directional movement animations that simulate content sliding into view from various directions. These animations are perfect for creating spatial awareness and guiding user attention.

## Animation Classes

- **slide-in-up**: Slide in from bottom
- **slide-in-down**: Slide in from top
- **slide-in-left**: Slide in from left
- **slide-in-right**: Slide in from right
- **slide-in-up-small**: Subtle upward slide
- **slide-in-down-small**: Subtle downward slide
- **slide-in-left-small**: Subtle leftward slide
- **slide-in-right-small**: Subtle rightward slide
- **slide-in-up-big**: Dramatic upward slide
- **slide-in-down-big**: Dramatic downward slide
- **slide-in-left-big**: Dramatic leftward slide
- **slide-in-right-big**: Dramatic rightward slide
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Slide Family',
}

export default meta
type Story = StoryObj

const slideAnimations = [
  {
    class: 'slide-in-up',
    description: 'Slide upward from below the viewport',
    name: 'Slide In Up',
  },
  {
    class: 'slide-in-down',
    description: 'Slide downward from above the viewport',
    name: 'Slide In Down',
  },
  {
    class: 'slide-in-left',
    description: 'Slide rightward from the left side',
    name: 'Slide In Left',
  },
  {
    class: 'slide-in-right',
    description: 'Slide leftward from the right side',
    name: 'Slide In Right',
  },
  {
    class: 'slide-in-up-small',
    description: 'Subtle upward slide with smaller movement',
    name: 'Slide In Up Small',
  },
  {
    class: 'slide-in-down-small',
    description: 'Subtle downward slide with smaller movement',
    name: 'Slide In Down Small',
  },
  {
    class: 'slide-in-left-small',
    description: 'Subtle leftward slide with smaller movement',
    name: 'Slide In Left Small',
  },
  {
    class: 'slide-in-right-small',
    description: 'Subtle rightward slide with smaller movement',
    name: 'Slide In Right Small',
  },
  {
    class: 'slide-in-up-big',
    description: 'Dramatic upward slide with larger movement',
    name: 'Slide In Up Big',
  },
  {
    class: 'slide-in-down-big',
    description: 'Dramatic downward slide with larger movement',
    name: 'Slide In Down Big',
  },
  {
    class: 'slide-in-left-big',
    description: 'Dramatic leftward slide with larger movement',
    name: 'Slide In Left Big',
  },
  {
    class: 'slide-in-right-big',
    description: 'Dramatic rightward slide with larger movement',
    name: 'Slide In Right Big',
  },
]

const slideComparison = [
  {
    bestFor: 'Mobile slide-up panels, bottom sheets, chat messages',
    class: 'slide-in-up',
    description: 'Content slides up from bottom',
    name: 'Slide Up',
  },
  {
    bestFor: 'Dropdown menus, top notifications, header reveals',
    class: 'slide-in-down',
    description: 'Content slides down from top',
    name: 'Slide Down',
  },
  {
    bestFor: 'Side navigation, drawer menus, off-canvas content',
    class: 'slide-in-left',
    description: 'Content slides in from left',
    name: 'Slide Left',
  },
  {
    bestFor: 'Right sidebars, contextual panels, secondary content',
    class: 'slide-in-right',
    description: 'Content slides in from right',
    name: 'Slide Right',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Slide animations respect prefers-reduced-motion. Consider the reading direction (LTR/RTL) when choosing slide directions."
        description="Directional movement animations that create spatial awareness and guide user attention. Perfect for navigation, content reveals, and transitions."
        performance="Slide animations use transform: translateX/Y which are GPU-accelerated. Performance is excellent across all devices."
        title="Slide Family Animations"
        usage="Use slide animations for navigation panels, content reveals, and anywhere you want to show spatial relationships between UI elements."
      />

      <AnimationGrid
        animations={slideAnimations}
        columns={3}
        defaultDuration="animation-duration-0.8"
        description="Complete collection of slide entrance animations with small, normal, and big variants"
        title="All Slide Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={slideComparison}
        title="Slide Direction Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="slide-in-up"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.3', 'animation-delay-0.5']}
        durations={['animation-duration-0.4', 'animation-duration-0.6', 'animation-duration-0.8', 'animation-duration-1.2', 'animation-duration-1.5']}
        timingFunctions={['animation-timing-function-ease-out', 'animation-timing-function-ease', 'animation-timing-function-ease-in-out', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
