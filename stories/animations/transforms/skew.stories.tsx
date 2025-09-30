import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Skew Transform Animations

The skew family creates slanting and distortion effects that transform content by tilting along various axes. These animations add dynamic, angular movement and can create striking visual effects.

## Animation Classes

- **skew**: Standard skew transformation
- **skew-x**: Horizontal skew (X-axis distortion)
- **skew-y**: Vertical skew (Y-axis distortion)
- **skew-diagonal**: Diagonal skew transformation
- **skew-left**: Leftward skew animation
- **skew-right**: Rightward skew animation
- **skew-up**: Upward skew animation
- **skew-down**: Downward skew animation
- **skew-wobble**: Wobbly skew effect
- **skew-wave**: Wave-like skew motion
- **skew-elastic**: Elastic skew transformation
- **skew-perspective**: Perspective skew effect
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Transforms/Skew Family',
}

export default meta
type Story = StoryObj

const skewAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'skew',
    description: 'Standard skew transformation with angular distortion',
    name: 'Skew',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'skew-x',
    description: 'Horizontal skew along X-axis',
    name: 'Skew X',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'skew-y',
    description: 'Vertical skew along Y-axis',
    name: 'Skew Y',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'skew-diagonal',
    description: 'Diagonal skew transformation',
    name: 'Skew Diagonal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'skew-left',
    description: 'Leftward slanting skew animation',
    name: 'Skew Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'skew-right',
    description: 'Rightward slanting skew animation',
    name: 'Skew Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'skew-up',
    description: 'Upward slanting skew animation',
    name: 'Skew Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'skew-down',
    description: 'Downward slanting skew animation',
    name: 'Skew Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    class: 'skew-wobble',
    description: 'Wobbly, elastic skew effect',
    name: 'Skew Wobble',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    class: 'skew-wave',
    description: 'Wave-like rhythmic skew motion',
    name: 'Skew Wave',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-pink-100',
    class: 'skew-elastic',
    description: 'Elastic skew with bounce-back effect',
    name: 'Skew Elastic',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-orange-100',
    class: 'skew-perspective',
    description: 'Perspective-based skew transformation',
    name: 'Skew Perspective',
  },
]

const skewComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    bestFor: 'Horizontal emphasis, speed effects, dynamic headers',
    class: 'skew-x',
    description: 'Clean horizontal distortion',
    name: 'Horizontal Skew',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    bestFor: 'Vertical emphasis, height effects, column animations',
    class: 'skew-y',
    description: 'Clean vertical distortion',
    name: 'Vertical Skew',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    bestFor: 'Playful interactions, attention-grabbing elements',
    class: 'skew-wobble',
    description: 'Elastic wobbly skew effect',
    name: 'Wobble Skew',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-orange-100',
    bestFor: '3D interfaces, depth effects, isometric designs',
    class: 'skew-perspective',
    description: 'Perspective-based transformation',
    name: 'Perspective Skew',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Skew animations can distort text readability and may be challenging for users with dyslexia. Use sparingly and respect prefers-reduced-motion."
        description="Angular distortion effects that add dynamic, geometric movement. Perfect for creating speed effects, emphasis, and modern geometric aesthetics."
        performance="Skew animations use CSS transforms which are GPU-accelerated. Performance is excellent, though extreme skew values may affect text rendering."
        title="Skew Transform Animations"
        usage="Use skew animations for modern, geometric interfaces, speed effects, emphasis, and anywhere you want to add angular, dynamic movement."
      />

      <AnimationGrid
        animations={skewAnimations}
        columns={3}
        defaultDuration="animation-duration-0.8"
        description="Complete collection of skew transform animations with various distortion effects"
        title="All Skew Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={skewComparison}
        title="Skew Direction Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="skew-x"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.3', 'animation-delay-0.5']}
        durations={['animation-duration-0.5', 'animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5']}
        timingFunctions={['animation-timing-function-ease-out', 'animation-timing-function-ease-in-out', 'animation-timing-function-elastic', 'animation-timing-function-back']}
      />
    </div>
  ),
}
