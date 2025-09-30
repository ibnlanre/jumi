import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Fade Entrance Animations

The fade family provides smooth opacity transitions that are perfect for revealing content. These animations create elegant, professional entrances that work well in virtually any context.

## Animation Classes

- **fade-in**: Standard fade entrance
- **fade-in-up**: Fade in while moving up
- **fade-in-down**: Fade in while moving down  
- **fade-in-left**: Fade in while moving from left
- **fade-in-right**: Fade in while moving from right
- **fade-in-up-big**: Fade in with larger upward movement
- **fade-in-down-big**: Fade in with larger downward movement
- **fade-in-left-big**: Fade in with larger leftward movement
- **fade-in-right-big**: Fade in with larger rightward movement
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Fade Family',
}

export default meta
type Story = StoryObj

const fadeAnimations = [
  {
    class: 'fade-in',
    description: 'Simple opacity transition from 0 to 1',
    name: 'Fade In',
  },
  {
    class: 'fade-in-up',
    description: 'Fade in while sliding up from below',
    name: 'Fade In Up',
  },
  {
    class: 'fade-in-down',
    description: 'Fade in while sliding down from above',
    name: 'Fade In Down',
  },
  {
    class: 'fade-in-left',
    description: 'Fade in while sliding from the left',
    name: 'Fade In Left',
  },
  {
    class: 'fade-in-right',
    description: 'Fade in while sliding from the right',
    name: 'Fade In Right',
  },
  {
    class: 'fade-in-up-big',
    description: 'Fade in with larger upward movement',
    name: 'Fade In Up Big',
  },
  {
    class: 'fade-in-down-big',
    description: 'Fade in with larger downward movement',
    name: 'Fade In Down Big',
  },
  {
    class: 'fade-in-left-big',
    description: 'Fade in with larger leftward movement',
    name: 'Fade In Left Big',
  },
  {
    class: 'fade-in-right-big',
    description: 'Fade in with larger rightward movement',
    name: 'Fade In Right Big',
  },
]

const fadeComparison = [
  {
    bestFor: 'General content reveals, modal overlays, notifications',
    class: 'fade-in',
    description: 'Pure opacity animation without movement',
    name: 'Standard Fade',
  },
  {
    bestFor: 'Content sliding up from bottom, mobile slide-up panels',
    class: 'fade-in-up',
    description: 'Combines fade with upward slide motion',
    name: 'Fade Up',
  },
  {
    bestFor: 'Dropdown menus, toast notifications from top',
    class: 'fade-in-down',
    description: 'Combines fade with downward slide motion',
    name: 'Fade Down',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="All fade animations respect prefers-reduced-motion. Ensure sufficient contrast ratios during transition states."
        description="Smooth opacity transitions that create elegant, professional entrances. Perfect for revealing content without jarring movements."
        performance="Fade animations are GPU-accelerated and perform well across all devices. Opacity changes are among the most performant CSS animations."
        title="Fade Family Animations"
        usage="Use fade animations for content reveals, modal overlays, and any situation where you want smooth, subtle entrances."
      />

      <AnimationGrid
        animations={fadeAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Complete collection of fade entrance animations"
        title="All Fade Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={fadeComparison}
        title="Fade Animation Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="fade-in-up"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.5', 'animation-delay-1']}
        durations={['animation-duration-0.3', 'animation-duration-0.5', 'animation-duration-1', 'animation-duration-1.5', 'animation-duration-2']}
        timingFunctions={['animation-timing-function-ease', 'animation-timing-function-ease-in', 'animation-timing-function-ease-out', 'animation-timing-function-ease-in-out']}
      />
    </div>
  ),
}
