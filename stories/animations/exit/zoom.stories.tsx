import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Zoom Exit Animations

The zoom exit family creates scale-based departure animations that simulate content shrinking out of view. These animations provide dramatic, attention-focusing dismissals.

## Animation Classes

- **zoom-out**: Standard zoom exit
- **zoom-out-up**: Zoom out while moving up
- **zoom-out-down**: Zoom out while moving down
- **zoom-out-left**: Zoom out while moving left
- **zoom-out-right**: Zoom out while moving right
- **zoom-out-small**: Subtle zoom exit effect
- **zoom-out-big**: Dramatic zoom exit effect
- **zoom-out-center**: Zoom to center point
- **zoom-out-top-left**: Zoom to top-left corner
- **zoom-out-top-right**: Zoom to top-right corner
- **zoom-out-bottom-left**: Zoom to bottom-left corner
- **zoom-out-bottom-right**: Zoom to bottom-right corner
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Exit/Zoom Family',
}

export default meta
type Story = StoryObj

const zoomOutAnimations = [
  {
    class: 'zoom-out',
    description: 'Standard scaling animation from normal to small size',
    name: 'Zoom Out',
  },
  {
    class: 'zoom-out-up',
    description: 'Zoom out while sliding upward',
    name: 'Zoom Out Up',
  },
  {
    class: 'zoom-out-down',
    description: 'Zoom out while sliding downward',
    name: 'Zoom Out Down',
  },
  {
    class: 'zoom-out-left',
    description: 'Zoom out while sliding leftward',
    name: 'Zoom Out Left',
  },
  {
    class: 'zoom-out-right',
    description: 'Zoom out while sliding rightward',
    name: 'Zoom Out Right',
  },
  {
    class: 'zoom-out-small',
    description: 'Subtle zoom effect with minimal scaling',
    name: 'Zoom Out Small',
  },
  {
    class: 'zoom-out-big',
    description: 'Dramatic zoom effect with rapid scaling',
    name: 'Zoom Out Big',
  },
  {
    class: 'zoom-out-center',
    description: 'Zoom to exact center point',
    name: 'Zoom Out Center',
  },
  {
    class: 'zoom-out-top-left',
    description: 'Zoom toward top-left corner origin',
    name: 'Zoom Out Top Left',
  },
  {
    class: 'zoom-out-top-right',
    description: 'Zoom toward top-right corner origin',
    name: 'Zoom Out Top Right',
  },
  {
    class: 'zoom-out-bottom-left',
    description: 'Zoom toward bottom-left corner origin',
    name: 'Zoom Out Bottom Left',
  },
  {
    class: 'zoom-out-bottom-right',
    description: 'Zoom toward bottom-right corner origin',
    name: 'Zoom Out Bottom Right',
  },
]

const zoomOutComparison = [
  {
    bestFor: 'Modal dismissals, dialog closures, overlay removals',
    class: 'zoom-out',
    description: 'Clean scaling departure from center',
    name: 'Standard Zoom',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    bestFor: 'Gentle content removals, subtle dismissals',
    class: 'zoom-out-small',
    description: 'Subtle scaling for elegant departures',
    name: 'Zoom Small',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    bestFor: 'Dramatic closures, attention-grabbing dismissals',
    class: 'zoom-out-big',
    description: 'Rapid scaling for impactful exits',
    name: 'Zoom Big',
  },
  {
    bestFor: 'Directional dismissals, contextual panel closures',
    class: 'zoom-out-up',
    description: 'Combines scaling with directional movement',
    name: 'Zoom Directional',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Zoom exit animations can be disorienting when rapid. Use appropriate durations and respect prefers-reduced-motion settings."
        description="Scale-based departures that create focal points and dramatic closures. Perfect for emphasizing the completion of interactions."
        performance="Zoom exit animations use CSS transforms (scale) which are GPU-accelerated. Excellent performance for dismissal interactions."
        title="Zoom Exit Animations"
        usage="Use zoom exit animations for modal closures, dialog dismissals, and when you want to create a sense of completion or dramatic closure."
      />

      <AnimationGrid
        animations={zoomOutAnimations}
        columns={3}
        defaultDuration="animation-duration-0.4"
        description="Complete collection of zoom exit animations with various scaling effects and destinations"
        title="All Zoom Out Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={zoomOutComparison}
        title="Zoom Exit Scale Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="zoom-out"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.3']}
        durations={['animation-duration-0.3', 'animation-duration-0.4', 'animation-duration-0.5', 'animation-duration-0.6', 'animation-duration-0.8']}
        timingFunctions={['animation-timing-function-ease-in', 'animation-timing-function-ease-out', 'animation-timing-function-ease-in-out', 'animation-timing-function-back']}
      />
    </div>
  ),
}
