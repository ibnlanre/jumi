import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Circle Entrance Animations

The circle family creates curved, orbital movement animations that simulate content following circular paths. These animations add elegance and sophistication to entrances.

## Animation Classes

- **circle-in-center**: Circle from center outward
- **circle-in-top-left**: Circle from top-left corner
- **circle-in-top-right**: Circle from top-right corner
- **circle-in-bottom-left**: Circle from bottom-left corner
- **circle-in-bottom-right**: Circle from bottom-right corner
- **circle-in-clockwise**: Clockwise circular motion
- **circle-in-counter-clockwise**: Counter-clockwise circular motion
- **circle-in-up**: Circular motion moving upward
- **circle-in-down**: Circular motion moving downward
- **circle-in-left**: Circular motion moving leftward
- **circle-in-right**: Circular motion moving rightward
- **circle-in-spiral**: Spiral inward motion
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Circle Family',
}

export default meta
type Story = StoryObj

const circleAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'circle-in-center',
    description: 'Circular expansion from center point',
    name: 'Circle In Center',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-teal-100',
    class: 'circle-in-top-left',
    description: 'Circular motion originating from top-left',
    name: 'Circle In Top Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    class: 'circle-in-top-right',
    description: 'Circular motion originating from top-right',
    name: 'Circle In Top Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    class: 'circle-in-bottom-left',
    description: 'Circular motion originating from bottom-left',
    name: 'Circle In Bottom Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    class: 'circle-in-bottom-right',
    description: 'Circular motion originating from bottom-right',
    name: 'Circle In Bottom Right',
  },
  {
    backgroundClass: 'bg-gradient-to-r from-cyan-100 to-blue-100',
    class: 'circle-in-clockwise',
    description: 'Clockwise circular entrance motion',
    name: 'Circle In Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-r from-emerald-100 to-green-100',
    class: 'circle-in-counter-clockwise',
    description: 'Counter-clockwise circular entrance motion',
    name: 'Circle In Counter-Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'circle-in-up',
    description: 'Circular motion with upward trajectory',
    name: 'Circle In Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'circle-in-down',
    description: 'Circular motion with downward trajectory',
    name: 'Circle In Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-rose-100 to-red-100',
    class: 'circle-in-left',
    description: 'Circular motion with leftward trajectory',
    name: 'Circle In Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-cyan-100',
    class: 'circle-in-right',
    description: 'Circular motion with rightward trajectory',
    name: 'Circle In Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    class: 'circle-in-spiral',
    description: 'Spiral inward motion with circular path',
    name: 'Circle In Spiral',
  },
]

const circleComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    bestFor: 'Loading indicators, central focus elements, spotlight effects',
    class: 'circle-in-center',
    description: 'Radial expansion from center point',
    name: 'Center Circle',
  },
  {
    backgroundClass: 'bg-gradient-to-r from-cyan-100 to-blue-100',
    bestFor: 'Interactive elements, navigation items, playful transitions',
    class: 'circle-in-clockwise',
    description: 'Smooth clockwise circular motion',
    name: 'Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    bestFor: 'Complex reveals, artistic elements, premium interfaces',
    class: 'circle-in-spiral',
    description: 'Hypnotic spiral inward motion',
    name: 'Spiral',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Circular animations can be disorienting or trigger motion sensitivity. Always respect prefers-reduced-motion settings."
        description="Elegant curved motions that add sophistication and visual interest. Perfect for creating unique, memorable entrance experiences."
        performance="Circle animations use complex CSS transforms and may be more computationally intensive than linear animations. Test on lower-end devices."
        title="Circle Family Animations"
        usage="Use circle animations sparingly for premium experiences, artistic elements, or when you want to create a distinctive visual signature."
      />

      <AnimationGrid
        animations={circleAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Complete collection of circular entrance animations with curved, orbital motions"
        title="All Circle Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={circleComparison}
        title="Circle Motion Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="circle-in-center"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.4', 'animation-delay-0.6']}
        durations={['animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5', 'animation-duration-2']}
        timingFunctions={['animation-timing-function-ease-in-out', 'animation-timing-function-ease-out', 'animation-timing-function-cubic-bezier', 'animation-timing-function-elastic']}
      />
    </div>
  ),
}
