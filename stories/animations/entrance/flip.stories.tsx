import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Flip Entrance Animations

The flip family creates 3D rotation animations that simulate content flipping into view around various axes. These animations add dimension and dynamic visual interest.

## Animation Classes

- **flip-in-x**: Flip around X-axis (horizontal)
- **flip-in-y**: Flip around Y-axis (vertical)
- **flip-in-diagonal**: Flip around diagonal axis
- **flip-in-x-up**: Flip X-axis from bottom
- **flip-in-x-down**: Flip X-axis from top
- **flip-in-y-left**: Flip Y-axis from right
- **flip-in-y-right**: Flip Y-axis from left
- **flip-in-clockwise**: Clockwise flip rotation
- **flip-in-counter-clockwise**: Counter-clockwise flip rotation
- **flip-in-cube**: 3D cube flip effect
- **flip-in-card**: Card-like flip animation
- **flip-in-book**: Book-opening flip effect
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Flip Family',
}

export default meta
type Story = StoryObj

const flipAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'flip-in-x',
    description: 'Horizontal flip around X-axis',
    name: 'Flip In X',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'flip-in-y',
    description: 'Vertical flip around Y-axis',
    name: 'Flip In Y',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'flip-in-diagonal',
    description: 'Diagonal flip around angled axis',
    name: 'Flip In Diagonal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'flip-in-x-up',
    description: 'X-axis flip originating from bottom edge',
    name: 'Flip In X Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'flip-in-x-down',
    description: 'X-axis flip originating from top edge',
    name: 'Flip In X Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'flip-in-y-left',
    description: 'Y-axis flip originating from right edge',
    name: 'Flip In Y Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'flip-in-y-right',
    description: 'Y-axis flip originating from left edge',
    name: 'Flip In Y Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'flip-in-clockwise',
    description: 'Clockwise rotational flip motion',
    name: 'Flip In Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'flip-in-counter-clockwise',
    description: 'Counter-clockwise rotational flip motion',
    name: 'Flip In Counter-Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    class: 'flip-in-cube',
    description: '3D cube-like flip transformation',
    name: 'Flip In Cube',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    class: 'flip-in-card',
    description: 'Card-style flip with perspective',
    name: 'Flip In Card',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-rose-100 to-pink-100',
    class: 'flip-in-book',
    description: 'Book-opening style flip animation',
    name: 'Flip In Book',
  },
]

const flipComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    bestFor: 'Cards, panels, content reveals with dimension',
    class: 'flip-in-x',
    description: 'Classic horizontal flip around X-axis',
    name: 'Horizontal Flip',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    bestFor: 'Vertical panels, door-like reveals, side content',
    class: 'flip-in-y',
    description: 'Classic vertical flip around Y-axis',
    name: 'Vertical Flip',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    bestFor: 'Interactive cards, hover effects, game elements',
    class: 'flip-in-card',
    description: 'Realistic card flip with perspective',
    name: 'Card Flip',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    bestFor: 'Complex 3D interfaces, premium effects, immersive experiences',
    class: 'flip-in-cube',
    description: '3D cube transformation effect',
    name: 'Cube Flip',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="3D flip animations can be disorienting and may trigger motion sensitivity. Always respect prefers-reduced-motion settings."
        description="3D rotation effects that add dimensional depth and visual sophistication. Perfect for creating engaging, interactive experiences."
        performance="Flip animations use 3D CSS transforms which are GPU-accelerated but can be intensive. Test performance on mobile and older devices."
        title="Flip Family Animations"
        usage="Use flip animations for interactive elements like cards, panels, and content reveals where you want to emphasize transformation and dimension."
      />

      <AnimationGrid
        animations={flipAnimations}
        columns={3}
        defaultDuration="animation-duration-0.8"
        description="Complete collection of 3D flip entrance animations with various axes and perspectives"
        title="All Flip Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={flipComparison}
        title="Flip Axis Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="flip-in-y"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.4']}
        durations={['animation-duration-0.5', 'animation-duration-0.6', 'animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2']}
        timingFunctions={['animation-timing-function-ease-out', 'animation-timing-function-ease-in-out', 'animation-timing-function-back', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
