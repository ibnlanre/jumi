import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Rotate Transform Animations

The rotate family creates spinning and rotation effects that transform content around various axes. These animations add dynamic movement and can create engaging visual effects.

## Animation Classes

- **rotate**: Standard 360-degree rotation
- **rotate-clockwise**: Clockwise rotation
- **rotate-counter-clockwise**: Counter-clockwise rotation
- **rotate-90**: 90-degree rotation
- **rotate-180**: 180-degree rotation
- **rotate-270**: 270-degree rotation
- **rotate-x**: Rotation around X-axis (horizontal flip)
- **rotate-y**: Rotation around Y-axis (vertical flip)
- **rotate-z**: Rotation around Z-axis (standard spin)
- **rotate-diagonal**: Diagonal axis rotation
- **rotate-wobble**: Wobbly rotation effect
- **rotate-swing**: Pendulum-like swing rotation
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Transforms/Rotate Family',
}

export default meta
type Story = StoryObj

const rotateAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'rotate',
    description: 'Complete 360-degree rotation',
    name: 'Rotate',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'rotate-clockwise',
    description: 'Smooth clockwise rotation',
    name: 'Rotate Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'rotate-counter-clockwise',
    description: 'Smooth counter-clockwise rotation',
    name: 'Rotate Counter-Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'rotate-90',
    description: '90-degree rotation (quarter turn)',
    name: 'Rotate 90°',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'rotate-180',
    description: '180-degree rotation (half turn)',
    name: 'Rotate 180°',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'rotate-270',
    description: '270-degree rotation (three-quarter turn)',
    name: 'Rotate 270°',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'rotate-x',
    description: 'Rotation around horizontal X-axis',
    name: 'Rotate X',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'rotate-y',
    description: 'Rotation around vertical Y-axis',
    name: 'Rotate Y',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    class: 'rotate-z',
    description: 'Rotation around Z-axis (depth)',
    name: 'Rotate Z',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    class: 'rotate-diagonal',
    description: 'Rotation around diagonal axis',
    name: 'Rotate Diagonal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-pink-100',
    class: 'rotate-wobble',
    description: 'Wobbly, elastic rotation effect',
    name: 'Rotate Wobble',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-orange-100',
    class: 'rotate-swing',
    description: 'Pendulum-like swinging rotation',
    name: 'Rotate Swing',
  },
]

const rotateComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    bestFor: 'Loading indicators, refresh buttons, processing states',
    class: 'rotate',
    description: 'Continuous 360-degree rotation',
    name: 'Full Rotate',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    bestFor: 'Toggle states, reveal effects, simple transforms',
    class: 'rotate-180',
    description: 'Half rotation for state changes',
    name: 'Half Rotate',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    bestFor: 'Card flips, 3D interfaces, dimensional effects',
    class: 'rotate-x',
    description: '3D horizontal axis rotation',
    name: '3D Rotate X',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-pink-100',
    bestFor: 'Playful interactions, attention-grabbing elements',
    class: 'rotate-wobble',
    description: 'Elastic wobbly rotation',
    name: 'Wobble Rotate',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Rotation animations can be disorienting, especially continuous rotations. Respect prefers-reduced-motion and provide pause controls for infinite rotations."
        description="Dynamic spinning and rotation effects that add movement and visual interest. Perfect for state changes, loading indicators, and interactive feedback."
        performance="Rotation animations use CSS transforms which are GPU-accelerated. Continuous rotations are performant but monitor battery usage on mobile devices."
        title="Rotate Transform Animations"
        usage="Use rotate animations for loading indicators, state toggles, interactive feedback, and anywhere you want to add dynamic spinning movement."
      />

      <AnimationGrid
        animations={rotateAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Complete collection of rotation transform animations with various axes and effects"
        title="All Rotate Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={rotateComparison}
        title="Rotation Type Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="rotate"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.4', 'animation-delay-0.6']}
        durations={['animation-duration-0.5', 'animation-duration-1', 'animation-duration-1.5', 'animation-duration-2', 'animation-duration-3']}
        timingFunctions={['animation-timing-function-linear', 'animation-timing-function-ease-in-out', 'animation-timing-function-ease', 'animation-timing-function-elastic']}
      />
    </div>
  ),
}
