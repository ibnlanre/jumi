import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Fade Exit Animations

The fade exit family provides smooth opacity transitions for content disappearing from view. These animations create elegant departures that feel natural and unobtrusive.

## Animation Classes

- **fade-out**: Standard fade exit
- **fade-out-up**: Fade out while moving up
- **fade-out-down**: Fade out while moving down
- **fade-out-left**: Fade out while moving left
- **fade-out-right**: Fade out while moving right
- **fade-out-up-big**: Fade out with larger upward movement
- **fade-out-down-big**: Fade out with larger downward movement
- **fade-out-left-big**: Fade out with larger leftward movement
- **fade-out-right-big**: Fade out with larger rightward movement
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Exit/Fade Family',
}

export default meta
type Story = StoryObj

const fadeOutAnimations = [
  {
    class: 'fade-out',
    description: 'Simple opacity transition from 1 to 0',
    name: 'Fade Out',
  },
  {
    class: 'fade-out-up',
    description: 'Fade out while sliding up and away',
    name: 'Fade Out Up',
  },
  {
    class: 'fade-out-down',
    description: 'Fade out while sliding down and away',
    name: 'Fade Out Down',
  },
  {
    class: 'fade-out-left',
    description: 'Fade out while sliding left and away',
    name: 'Fade Out Left',
  },
  {
    class: 'fade-out-right',
    description: 'Fade out while sliding right and away',
    name: 'Fade Out Right',
  },
  {
    class: 'fade-out-up-big',
    description: 'Fade out with larger upward movement',
    name: 'Fade Out Up Big',
  },
  {
    class: 'fade-out-down-big',
    description: 'Fade out with larger downward movement',
    name: 'Fade Out Down Big',
  },
  {
    class: 'fade-out-left-big',
    description: 'Fade out with larger leftward movement',
    name: 'Fade Out Left Big',
  },
  {
    class: 'fade-out-right-big',
    description: 'Fade out with larger rightward movement',
    name: 'Fade Out Right Big',
  },
]

const fadeOutComparison = [
  {
    bestFor: 'Modal dismissals, notification clearing, general content removal',
    class: 'fade-out',
    description: 'Pure opacity animation without movement',
    name: 'Standard Fade',
  },
  {
    bestFor: 'Mobile slide-up panel dismissals, bottom sheet closures',
    class: 'fade-out-down',
    description: 'Combines fade with downward slide motion',
    name: 'Fade Down',
  },
  {
    bestFor: 'Side navigation closures, drawer dismissals',
    class: 'fade-out-left',
    description: 'Combines fade with leftward slide motion',
    name: 'Fade Left',
  },
  {
    bestFor: 'Dramatic exits, attention-grabbing dismissals',
    class: 'fade-out-up-big',
    description: 'Dramatic fade with large upward movement',
    name: 'Fade Up Big',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Exit animations should be quick and non-blocking. Always respect prefers-reduced-motion and provide instant dismissal options."
        description="Smooth, elegant departures that provide closure without jarring interruptions. Perfect for dismissing content gracefully."
        performance="Fade out animations are GPU-accelerated and highly performant. Ideal for frequent UI state changes and dismissals."
        title="Fade Exit Animations"
        usage="Use fade out animations for dismissing modals, removing notifications, clearing content, or any graceful departure scenario."
      />

      <AnimationGrid
        animations={fadeOutAnimations}
        columns={3}
        defaultDuration="animation-duration-0.6"
        description="Complete collection of fade exit animations for elegant content departures"
        title="All Fade Out Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={fadeOutComparison}
        title="Fade Out Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="fade-out-up"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.4']}
        durations={['animation-duration-0.3', 'animation-duration-0.4', 'animation-duration-0.6', 'animation-duration-0.8', 'animation-duration-1']}
        timingFunctions={['animation-timing-function-ease-in', 'animation-timing-function-ease-out', 'animation-timing-function-ease-in-out', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
