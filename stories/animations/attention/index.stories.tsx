import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Attention-Seeking Animations

Attention-seeking animations are designed to draw user focus to important elements. These animations repeat or have distinctive motions that naturally catch the eye without being entrance or exit animations.

## Animation Classes

### Shake & Wobble Family
- **shake**: Horizontal shaking motion
- **shake-vertical**: Vertical shaking motion
- **wobble**: Side-to-side wobbling motion
- **jello**: Jello-like elastic wobble

### Pulse & Heartbeat Family
- **pulse**: Gentle scaling pulse
- **heartbeat**: Rhythmic heartbeat-like pulse
- **pulse-grow**: Growing pulse animation
- **pulse-shrink**: Shrinking pulse animation

### Swing & Movement Family
- **swing**: Pendulum-like swinging motion
- **wiggle**: Quick left-right wiggle
- **tada**: Celebratory scaling and rotation
- **rubber-band**: Elastic rubber band effect

### Flash & Glow Family
- **flash**: Quick opacity flash
- **glow**: Glowing light effect
- **neon**: Neon light pulsing
- **strobe**: Strobe light effect
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Attention-Seeking',
}

export default meta
type Story = StoryObj

const shakeWobbleAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-orange-100',
    class: 'shake',
    description: 'Horizontal shaking motion for alerts and errors',
    name: 'Shake',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-yellow-100',
    class: 'shake-vertical',
    description: 'Vertical shaking motion for emphasis',
    name: 'Shake Vertical',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    class: 'wobble',
    description: 'Side-to-side wobbling motion',
    name: 'Wobble',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    class: 'jello',
    description: 'Jello-like elastic wobble effect',
    name: 'Jello',
  },
]

const pulseBeatAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'pulse',
    description: 'Gentle scaling pulse for notifications',
    name: 'Pulse',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-rose-100 to-red-100',
    class: 'heartbeat',
    description: 'Rhythmic heartbeat-like pulsing',
    name: 'Heartbeat',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'pulse-grow',
    description: 'Growing pulse that expands outward',
    name: 'Pulse Grow',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    class: 'pulse-shrink',
    description: 'Shrinking pulse that contracts inward',
    name: 'Pulse Shrink',
  },
]

const swingMovementAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'swing',
    description: 'Pendulum-like swinging motion',
    name: 'Swing',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    class: 'wiggle',
    description: 'Quick left-right wiggling motion',
    name: 'Wiggle',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'tada',
    description: 'Celebratory scaling and rotation',
    name: 'Tada',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'rubber-band',
    description: 'Elastic rubber band stretching effect',
    name: 'Rubber Band',
  },
]

const flashGlowAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'flash',
    description: 'Quick opacity flash for urgent attention',
    name: 'Flash',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'glow',
    description: 'Soft glowing light effect',
    name: 'Glow',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    class: 'neon',
    description: 'Bright neon light pulsing effect',
    name: 'Neon',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-gray-100 to-slate-100',
    class: 'strobe',
    description: 'Rapid strobe light flashing',
    name: 'Strobe',
  },
]

const attentionComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-orange-100',
    bestFor: 'Form validation errors, urgent alerts, warning states',
    class: 'shake',
    description: 'Immediate attention for errors',
    name: 'Shake',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    bestFor: 'Notifications, badges, available actions',
    class: 'pulse',
    description: 'Gentle rhythmic attention',
    name: 'Pulse',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    bestFor: 'Success celebrations, achievements, positive feedback',
    class: 'tada',
    description: 'Celebratory attention-getter',
    name: 'Tada',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    bestFor: 'Critical alerts, emergency states, immediate action required',
    class: 'flash',
    description: 'Urgent flashing attention',
    name: 'Flash',
  },
]

export const ShakeWobble: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Shake & Wobble Family</h2>
      <AnimationGrid
        animations={shakeWobbleAnimations}
        columns={2}
        defaultDuration="animation-duration-0.8"
        description="Motion-based attention effects using shaking and wobbling"
        title="Shake & Wobble Animations"
      />
    </div>
  ),
}

export const PulseBeat: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Pulse & Heartbeat Family</h2>
      <AnimationGrid
        animations={pulseBeatAnimations}
        columns={2}
        defaultDuration="animation-duration-1.5"
        description="Rhythmic scaling effects for gentle attention"
        title="Pulse & Heartbeat Animations"
      />
    </div>
  ),
}

export const SwingMovement: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Swing & Movement Family</h2>
      <AnimationGrid
        animations={swingMovementAnimations}
        columns={2}
        defaultDuration="animation-duration-1"
        description="Playful movement effects for engaging attention"
        title="Swing & Movement Animations"
      />
    </div>
  ),
}

export const FlashGlow: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Flash & Glow Family</h2>
      <AnimationGrid
        animations={flashGlowAnimations}
        columns={2}
        defaultDuration="animation-duration-1"
        description="Light-based effects for urgent or ambient attention"
        title="Flash & Glow Animations"
      />
    </div>
  ),
}

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Attention-seeking animations can be overwhelming for users with ADHD, epilepsy, or vestibular disorders. Always provide controls to pause or disable, and respect prefers-reduced-motion."
        description="Eye-catching animations designed to draw focus to important elements. Use thoughtfully to guide user attention without overwhelming the interface."
        performance="Most attention-seeking animations use transforms and opacity changes which are GPU-accelerated. However, repeating animations can impact battery life on mobile devices."
        title="Attention-Seeking Animations"
        usage="Use attention-seeking animations sparingly for notifications, errors, success states, and important calls-to-action. Provide user controls for persistent animations."
      />

      <EffectComparison
        effects={attentionComparison}
        title="Attention-Seeking Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="pulse"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.5', 'animation-delay-1']}
        durations={['animation-duration-0.5', 'animation-duration-1', 'animation-duration-1.5', 'animation-duration-2', 'animation-duration-3']}
        timingFunctions={['animation-timing-function-ease-in-out', 'animation-timing-function-ease-out', 'animation-timing-function-linear', 'animation-timing-function-elastic']}
      />
    </div>
  ),
}
