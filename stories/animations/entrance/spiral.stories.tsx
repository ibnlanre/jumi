import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Spiral Entrance Animations

The spiral family creates hypnotic, swirling motions that combine rotation with scaling and movement. These animations are perfect for creating mesmerizing, artistic effects.

## Animation Classes

- **spiral-in**: Classic spiral inward motion
- **spiral-in-clockwise**: Clockwise spiral entrance
- **spiral-in-counter-clockwise**: Counter-clockwise spiral entrance
- **spiral-in-up**: Spiral motion moving upward
- **spiral-in-down**: Spiral motion moving downward
- **spiral-in-left**: Spiral motion moving leftward
- **spiral-in-right**: Spiral motion moving rightward
- **spiral-in-tight**: Tight spiral with small radius
- **spiral-in-wide**: Wide spiral with large radius
- **spiral-in-elastic**: Spiral with elastic settling
- **spiral-in-bounce**: Spiral with bounce effect
- **spiral-in-galaxy**: Galaxy-like spiral motion
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Spiral Family',
}

export default meta
type Story = StoryObj

const spiralAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-indigo-100',
    class: 'spiral-in',
    description: 'Classic spiral inward motion with rotation',
    name: 'Spiral In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    class: 'spiral-in-clockwise',
    description: 'Clockwise spiral rotation entrance',
    name: 'Spiral In Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-green-100',
    class: 'spiral-in-counter-clockwise',
    description: 'Counter-clockwise spiral rotation entrance',
    name: 'Spiral In Counter-Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    class: 'spiral-in-up',
    description: 'Spiral motion with upward trajectory',
    name: 'Spiral In Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'spiral-in-down',
    description: 'Spiral motion with downward trajectory',
    name: 'Spiral In Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'spiral-in-left',
    description: 'Spiral motion with leftward trajectory',
    name: 'Spiral In Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    class: 'spiral-in-right',
    description: 'Spiral motion with rightward trajectory',
    name: 'Spiral In Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'spiral-in-tight',
    description: 'Tight spiral with concentrated rotation',
    name: 'Spiral In Tight',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    class: 'spiral-in-wide',
    description: 'Wide spiral with expansive rotation',
    name: 'Spiral In Wide',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    class: 'spiral-in-elastic',
    description: 'Spiral motion with elastic settling effect',
    name: 'Spiral In Elastic',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'spiral-in-bounce',
    description: 'Spiral motion with bouncy landing effect',
    name: 'Spiral In Bounce',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-violet-100',
    class: 'spiral-in-galaxy',
    description: 'Galaxy-like spiral motion with cosmic feel',
    name: 'Spiral In Galaxy',
  },
]

const spiralComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    bestFor: 'Compact interfaces, detailed elements, precision effects',
    class: 'spiral-in-tight',
    description: 'Concentrated spiral with small radius',
    name: 'Tight Spiral',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    bestFor: 'Hero sections, large elements, dramatic reveals',
    class: 'spiral-in-wide',
    description: 'Expansive spiral with large radius',
    name: 'Wide Spiral',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    bestFor: 'Interactive elements, smooth UX, premium interfaces',
    class: 'spiral-in-elastic',
    description: 'Spiral with sophisticated elastic settling',
    name: 'Elastic Spiral',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-violet-100',
    bestFor: 'Artistic interfaces, space themes, creative portfolios',
    class: 'spiral-in-galaxy',
    description: 'Cosmic spiral with galaxy-like motion',
    name: 'Galaxy Spiral',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Spiral animations can be hypnotic and potentially trigger motion sensitivity or vestibular disorders. Use sparingly and respect prefers-reduced-motion."
        description="Hypnotic swirling motions that combine rotation, scaling, and movement. Perfect for creating artistic, mesmerizing entrance effects."
        performance="Spiral animations use complex transforms combining rotation, scale, and translation. Monitor performance on mobile devices and older hardware."
        title="Spiral Family Animations"
        usage="Use spiral animations for artistic elements, loading indicators, or when you want to create a distinctive, memorable visual impact."
      />

      <AnimationGrid
        animations={spiralAnimations}
        columns={3}
        defaultDuration="animation-duration-1.5"
        description="Complete collection of spiral entrance animations with swirling, hypnotic motions"
        title="All Spiral Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={spiralComparison}
        title="Spiral Radius & Style Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="spiral-in"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.4', 'animation-delay-0.6']}
        durations={['animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5', 'animation-duration-2', 'animation-duration-2.5']}
        timingFunctions={['animation-timing-function-ease-in-out', 'animation-timing-function-ease-out', 'animation-timing-function-cubic-bezier', 'animation-timing-function-elastic']}
      />
    </div>
  ),
}
