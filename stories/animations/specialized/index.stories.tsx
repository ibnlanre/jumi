import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Specialized Visual Effects

Specialized effects encompass unique, creative animations that don't fit into standard categories. These include physics-based effects, visual distortions, and artistic transformations.

## Animation Categories

### Physics Effects
- **float**: Floating motion with gentle bobbing
- **magnetic**: Magnetic attraction and repulsion effects
- **elastic**: Elastic stretching and snapping
- **spring**: Spring-based bouncing motion
- **gravity**: Gravity-influenced falling motion

### Visual Effects
- **shimmer**: Shimmering light reflection
- **glitch**: Digital glitch distortion
- **blur**: Motion blur effects
- **distort**: Geometric distortion
- **morph**: Shape morphing transformation

### Water & Liquid Effects
- **ripple**: Water ripple propagation
- **wave**: Wave-like motion
- **splash**: Splash impact effect
- **drip**: Liquid dripping motion
- **bubble**: Bubble floating and popping

### Particle & Energy Effects
- **sparkle**: Sparkling particle effects
- **glow**: Energy glow emanation
- **plasma**: Plasma energy flow
- **lightning**: Lightning bolt effects
- **fire**: Flame-like dancing motion
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Specialized Effects',
}

export default meta
type Story = StoryObj

const physicsAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    class: 'float',
    description: 'Gentle floating motion with natural bobbing',
    name: 'Float',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-indigo-100',
    class: 'magnetic',
    description: 'Magnetic attraction and repulsion effects',
    name: 'Magnetic',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'elastic',
    description: 'Elastic stretching and snapping motion',
    name: 'Elastic',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'spring',
    description: 'Spring-based bouncing with physics',
    name: 'Spring',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-gray-100 to-slate-100',
    class: 'gravity',
    description: 'Gravity-influenced falling motion',
    name: 'Gravity',
  },
]

const visualEffectsAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'shimmer',
    description: 'Shimmering light reflection effect',
    name: 'Shimmer',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    class: 'glitch',
    description: 'Digital glitch distortion effect',
    name: 'Glitch',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    class: 'blur',
    description: 'Motion blur trailing effect',
    name: 'Blur',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'distort',
    description: 'Geometric distortion transformation',
    name: 'Distort',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'morph',
    description: 'Shape morphing transformation',
    name: 'Morph',
  },
]

const liquidAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'ripple',
    description: 'Water ripple propagation effect',
    name: 'Ripple',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'wave',
    description: 'Flowing wave-like motion',
    name: 'Wave',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'splash',
    description: 'Dynamic splash impact effect',
    name: 'Splash',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    class: 'drip',
    description: 'Liquid dripping motion effect',
    name: 'Drip',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-cyan-100',
    class: 'bubble',
    description: 'Bubble floating and interaction',
    name: 'Bubble',
  },
]

const energyAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-gold-100',
    class: 'sparkle',
    description: 'Twinkling sparkle particle effects',
    name: 'Sparkle',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'glow',
    description: 'Radiant energy glow emanation',
    name: 'Glow',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    class: 'plasma',
    description: 'Flowing plasma energy effect',
    name: 'Plasma',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-white',
    class: 'lightning',
    description: 'Electric lightning bolt effects',
    name: 'Lightning',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'fire',
    description: 'Flame-like dancing motion',
    name: 'Fire',
  },
]

const specializedComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    bestFor: 'Floating elements, cloud interfaces, weightless design',
    class: 'float',
    description: 'Natural floating motion with physics',
    name: 'Float',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    bestFor: 'Premium interfaces, luxury brands, attention highlights',
    class: 'shimmer',
    description: 'Elegant light reflection effect',
    name: 'Shimmer',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    bestFor: 'Tech interfaces, cyberpunk themes, error states',
    class: 'glitch',
    description: 'Digital distortion effect',
    name: 'Glitch',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    bestFor: 'Interactive elements, water themes, organic interfaces',
    class: 'ripple',
    description: 'Propagating wave effect',
    name: 'Ripple',
  },
]

export const Physics: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Physics Effects</h2>
      <AnimationGrid
        animations={physicsAnimations}
        columns={3}
        defaultDuration="animation-duration-2"
        description="Natural physics-based motion effects"
        title="Physics-Based Animations"
      />
    </div>
  ),
}

export const VisualEffects: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Visual Effects</h2>
      <AnimationGrid
        animations={visualEffectsAnimations}
        columns={3}
        defaultDuration="animation-duration-1.5"
        description="Visual distortion and transformation effects"
        title="Visual Effect Animations"
      />
    </div>
  ),
}

export const LiquidEffects: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Liquid & Water Effects</h2>
      <AnimationGrid
        animations={liquidAnimations}
        columns={3}
        defaultDuration="animation-duration-1.8"
        description="Water and liquid-inspired motion effects"
        title="Liquid Effect Animations"
      />
    </div>
  ),
}

export const EnergyEffects: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Energy & Particle Effects</h2>
      <AnimationGrid
        animations={energyAnimations}
        columns={3}
        defaultDuration="animation-duration-1.2"
        description="Energy and particle-based visual effects"
        title="Energy Effect Animations"
      />
    </div>
  ),
}

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Specialized effects can be complex and potentially overwhelming. Provide user controls, respect prefers-reduced-motion, and ensure core functionality doesn't depend on these effects."
        description="Unique, creative animations that push the boundaries of CSS and create memorable experiences. Use these effects to add personality and distinction to your interfaces."
        performance="Specialized effects may use complex CSS properties, filters, or pseudo-elements. Test performance thoroughly and consider providing simplified alternatives for lower-end devices."
        title="Specialized Visual Effects"
        usage="Use specialized effects sparingly to create signature moments, brand differentiation, or artistic flair. They work best as accent elements rather than primary interface components."
      />

      <EffectComparison
        effects={specializedComparison}
        title="Specialized Effect Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="shimmer"
        delays={['animation-delay-0', 'animation-delay-0.3', 'animation-delay-0.6', 'animation-delay-1']}
        durations={['animation-duration-1', 'animation-duration-1.5', 'animation-duration-2', 'animation-duration-2.5', 'animation-duration-3']}
        timingFunctions={['animation-timing-function-ease-in-out', 'animation-timing-function-linear', 'animation-timing-function-ease-out', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
