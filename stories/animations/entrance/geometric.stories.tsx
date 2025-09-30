import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Geometric Shape Entrance Animations

The geometric family creates shape-based entrance animations that utilize triangular, square, diamond, and polygonal transformation paths. These animations provide structured, mathematical precision.

## Animation Classes

### Triangle Family
- **triangle-in**: Triangle-shaped entrance path
- **triangle-in-up**: Upward triangular motion
- **triangle-in-down**: Downward triangular motion
- **triangle-in-left**: Leftward triangular motion
- **triangle-in-right**: Rightward triangular motion

### Square Family
- **square-in**: Square-shaped entrance path
- **square-in-clockwise**: Clockwise square motion
- **square-in-counter-clockwise**: Counter-clockwise square motion
- **square-in-expand**: Expanding square motion
- **square-in-contract**: Contracting square motion

### Diamond Family
- **diamond-in**: Diamond-shaped entrance path
- **diamond-in-rotate**: Rotating diamond motion
- **diamond-in-pulse**: Pulsing diamond effect
- **diamond-in-sparkle**: Sparkling diamond animation

### Polygon Family
- **polygon-in-hexagon**: Hexagonal entrance path
- **polygon-in-octagon**: Octagonal entrance path
- **polygon-in-star**: Star-shaped entrance motion
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Geometric Shapes',
}

export default meta
type Story = StoryObj

const triangleAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    class: 'triangle-in',
    description: 'Triangular path entrance animation',
    name: 'Triangle In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'triangle-in-up',
    description: 'Upward triangular motion path',
    name: 'Triangle In Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    class: 'triangle-in-down',
    description: 'Downward triangular motion path',
    name: 'Triangle In Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'triangle-in-left',
    description: 'Leftward triangular motion path',
    name: 'Triangle In Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    class: 'triangle-in-right',
    description: 'Rightward triangular motion path',
    name: 'Triangle In Right',
  },
]

const squareAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'square-in',
    description: 'Square-shaped entrance path',
    name: 'Square In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    class: 'square-in-clockwise',
    description: 'Clockwise square motion',
    name: 'Square In Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'square-in-counter-clockwise',
    description: 'Counter-clockwise square motion',
    name: 'Square In Counter-Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'square-in-expand',
    description: 'Expanding square motion',
    name: 'Square In Expand',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'square-in-contract',
    description: 'Contracting square motion',
    name: 'Square In Contract',
  },
]

const diamondAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'diamond-in',
    description: 'Diamond-shaped entrance path',
    name: 'Diamond In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-rose-100 to-red-100',
    class: 'diamond-in-rotate',
    description: 'Rotating diamond motion',
    name: 'Diamond In Rotate',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-pink-100',
    class: 'diamond-in-pulse',
    description: 'Pulsing diamond effect',
    name: 'Diamond In Pulse',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'diamond-in-sparkle',
    description: 'Sparkling diamond animation',
    name: 'Diamond In Sparkle',
  },
]

const polygonAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-green-100',
    class: 'polygon-in-hexagon',
    description: 'Hexagonal entrance path',
    name: 'Hexagon In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-emerald-100',
    class: 'polygon-in-octagon',
    description: 'Octagonal entrance path',
    name: 'Octagon In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'polygon-in-star',
    description: 'Star-shaped entrance motion',
    name: 'Star In',
  },
]

const geometricComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    bestFor: 'Dynamic interfaces, gaming UI, energetic brands',
    class: 'triangle-in',
    description: 'Sharp, angular motion with energy',
    name: 'Triangle',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    bestFor: 'Structured layouts, professional interfaces, grid systems',
    class: 'square-in',
    description: 'Precise, orderly rectangular motion',
    name: 'Square',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    bestFor: 'Luxury brands, jewelry sites, premium interfaces',
    class: 'diamond-in',
    description: 'Elegant, sophisticated diamond motion',
    name: 'Diamond',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    bestFor: 'Achievement systems, ratings, special highlights',
    class: 'polygon-in-star',
    description: 'Celebratory star-shaped motion',
    name: 'Star',
  },
]

export const TriangleAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Triangle Family</h2>
      <AnimationGrid
        animations={triangleAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Sharp, dynamic triangular motion paths"
        title="Triangle Entrance Animations"
      />
    </div>
  ),
}

export const SquareAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Square Family</h2>
      <AnimationGrid
        animations={squareAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Precise, structured square motion paths"
        title="Square Entrance Animations"
      />
    </div>
  ),
}

export const DiamondAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Diamond Family</h2>
      <AnimationGrid
        animations={diamondAnimations}
        columns={2}
        defaultDuration="animation-duration-1.2"
        description="Elegant, sophisticated diamond motion effects"
        title="Diamond Entrance Animations"
      />
    </div>
  ),
}

export const PolygonAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Polygon Family</h2>
      <AnimationGrid
        animations={polygonAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Complex polygonal motion paths"
        title="Polygon Entrance Animations"
      />
    </div>
  ),
}

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Geometric animations use precise motion paths that are generally well-tolerated, but respect prefers-reduced-motion for complex polygons."
        description="Mathematical precision meets visual artistry. Geometric shapes create structured, purposeful motion that adds sophistication to interfaces."
        performance="Geometric animations use optimized CSS transforms following mathematical paths. Performance is excellent across all devices."
        title="Geometric Shape Animations"
        usage="Use geometric animations when you want precise, structured motion that reflects order, professionalism, or mathematical beauty."
      />

      <EffectComparison
        effects={geometricComparison}
        title="Geometric Shape Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="diamond-in-rotate"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.3', 'animation-delay-0.5']}
        durations={['animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5', 'animation-duration-2']}
        timingFunctions={['animation-timing-function-ease-in-out', 'animation-timing-function-ease-out', 'animation-timing-function-linear', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
