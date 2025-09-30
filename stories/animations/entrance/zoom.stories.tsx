import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Zoom Entrance Animations

The zoom family creates scale-based animations that simulate content zooming into view. These animations are perfect for drawing attention and creating focal points.

## Animation Classes

- **zoom-in**: Standard zoom entrance
- **zoom-in-up**: Zoom in while moving up
- **zoom-in-down**: Zoom in while moving down
- **zoom-in-left**: Zoom in while moving from left
- **zoom-in-right**: Zoom in while moving from right
- **zoom-in-small**: Subtle zoom effect
- **zoom-in-big**: Dramatic zoom effect
- **zoom-in-center**: Zoom from center point
- **zoom-in-top-left**: Zoom from top-left corner
- **zoom-in-top-right**: Zoom from top-right corner
- **zoom-in-bottom-left**: Zoom from bottom-left corner
- **zoom-in-bottom-right**: Zoom from bottom-right corner
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Zoom Family',
}

export default meta
type Story = StoryObj

const zoomAnimations = [
  {
    class: 'zoom-in',
    description: 'Standard scaling animation from small to normal size',
    name: 'Zoom In',
  },
  {
    class: 'zoom-in-up',
    description: 'Zoom in while sliding upward',
    name: 'Zoom In Up',
  },
  {
    class: 'zoom-in-down',
    description: 'Zoom in while sliding downward',
    name: 'Zoom In Down',
  },
  {
    class: 'zoom-in-left',
    description: 'Zoom in while sliding from left',
    name: 'Zoom In Left',
  },
  {
    class: 'zoom-in-right',
    description: 'Zoom in while sliding from right',
    name: 'Zoom In Right',
  },
  {
    class: 'zoom-in-small',
    description: 'Subtle zoom effect with minimal scaling',
    name: 'Zoom In Small',
  },
  {
    class: 'zoom-in-big',
    description: 'Dramatic zoom effect with large scaling',
    name: 'Zoom In Big',
  },
  {
    class: 'zoom-in-center',
    description: 'Zoom from exact center point',
    name: 'Zoom In Center',
  },
  {
    class: 'zoom-in-top-left',
    description: 'Zoom from top-left corner origin',
    name: 'Zoom In Top Left',
  },
  {
    class: 'zoom-in-top-right',
    description: 'Zoom from top-right corner origin',
    name: 'Zoom In Top Right',
  },
  {
    class: 'zoom-in-bottom-left',
    description: 'Zoom from bottom-left corner origin',
    name: 'Zoom In Bottom Left',
  },
  {
    class: 'zoom-in-bottom-right',
    description: 'Zoom from bottom-right corner origin',
    name: 'Zoom In Bottom Right',
  },
]

const zoomComparison = [
  {
    bestFor: 'Modal dialogs, image galleries, spotlight effects',
    class: 'zoom-in',
    description: 'Pure scaling animation from center',
    name: 'Standard Zoom',
  },
  {
    bestFor: 'Hero sections, featured content, call-to-action emphasis',
    class: 'zoom-in-up',
    description: 'Combines scaling with upward movement',
    name: 'Zoom Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    bestFor: 'Card reveals, content previews, interactive thumbnails',
    class: 'zoom-in-small',
    description: 'Subtle scaling for elegant reveals',
    name: 'Zoom Small',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    bestFor: 'Attention-grabbing alerts, celebration effects, dramatic reveals',
    class: 'zoom-in-big',
    description: 'Dramatic scaling for maximum impact',
    name: 'Zoom Big',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Zoom animations can be disorienting for some users. Respect prefers-reduced-motion and consider providing alternatives for critical interactions."
        description="Scale-based animations that create focal points and draw attention. Perfect for emphasizing important content and creating dramatic reveals."
        performance="Zoom animations use CSS transforms (scale) which are GPU-accelerated. Performance is excellent, but very large scale factors may impact memory usage."
        title="Zoom Family Animations"
        usage="Use zoom animations for modals, image galleries, featured content, and anywhere you want to create a sense of emergence or importance."
      />

      <AnimationGrid
        animations={zoomAnimations}
        columns={3}
        defaultDuration="animation-duration-0.6"
        description="Complete collection of zoom entrance animations with various scaling effects and origins"
        title="All Zoom Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={zoomComparison}
        title="Zoom Scale Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="zoom-in"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.4']}
        durations={['animation-duration-0.3', 'animation-duration-0.5', 'animation-duration-0.6', 'animation-duration-0.8', 'animation-duration-1']}
        timingFunctions={['animation-timing-function-ease-out', 'animation-timing-function-ease', 'animation-timing-function-back', 'animation-timing-function-elastic']}
      />
    </div>
  ),
}
