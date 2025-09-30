import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Arc Entrance Animations

The arc family creates curved trajectory animations that simulate content following arc-shaped paths. These animations provide natural, physics-inspired motion that feels organic and pleasing.

## Animation Classes

- **arc-in-up**: Arc motion moving upward
- **arc-in-down**: Arc motion moving downward
- **arc-in-left**: Arc motion moving leftward
- **arc-in-right**: Arc motion moving rightward
- **arc-in-top-left**: Arc from top-left trajectory
- **arc-in-top-right**: Arc from top-right trajectory
- **arc-in-bottom-left**: Arc from bottom-left trajectory
- **arc-in-bottom-right**: Arc from bottom-right trajectory
- **arc-in-gentle**: Gentle arc motion
- **arc-in-steep**: Steep arc motion
- **arc-in-bounce**: Arc with bounce landing
- **arc-in-elastic**: Arc with elastic settling
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Arc Family',
}

export default meta
type Story = StoryObj

const arcAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    class: 'arc-in-up',
    description: 'Curved upward trajectory with natural arc motion',
    name: 'Arc In Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    class: 'arc-in-down',
    description: 'Curved downward trajectory with natural arc motion',
    name: 'Arc In Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'arc-in-left',
    description: 'Curved leftward trajectory with natural arc motion',
    name: 'Arc In Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-yellow-100',
    class: 'arc-in-right',
    description: 'Curved rightward trajectory with natural arc motion',
    name: 'Arc In Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'arc-in-top-left',
    description: 'Arc motion from top-left corner with curved path',
    name: 'Arc In Top Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    class: 'arc-in-top-right',
    description: 'Arc motion from top-right corner with curved path',
    name: 'Arc In Top Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'arc-in-bottom-left',
    description: 'Arc motion from bottom-left corner with curved path',
    name: 'Arc In Bottom Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    class: 'arc-in-bottom-right',
    description: 'Arc motion from bottom-right corner with curved path',
    name: 'Arc In Bottom Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    class: 'arc-in-gentle',
    description: 'Subtle arc motion with gentle curvature',
    name: 'Arc In Gentle',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'arc-in-steep',
    description: 'Dramatic arc motion with steep curvature',
    name: 'Arc In Steep',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-orange-100',
    class: 'arc-in-bounce',
    description: 'Arc motion with bouncy landing effect',
    name: 'Arc In Bounce',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'arc-in-elastic',
    description: 'Arc motion with elastic settling effect',
    name: 'Arc In Elastic',
  },
]

const arcComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    bestFor: 'Subtle content reveals, elegant transitions, professional interfaces',
    class: 'arc-in-gentle',
    description: 'Soft, natural curve that feels organic',
    name: 'Gentle Arc',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    bestFor: 'Dramatic reveals, hero sections, attention-grabbing elements',
    class: 'arc-in-steep',
    description: 'Sharp curve for dynamic, energetic feel',
    name: 'Steep Arc',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-orange-100',
    bestFor: 'Playful interactions, game interfaces, fun elements',
    class: 'arc-in-bounce',
    description: 'Arc with playful bounce landing',
    name: 'Bounce Arc',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    bestFor: 'Premium interfaces, smooth interactions, fluid design',
    class: 'arc-in-elastic',
    description: 'Arc with sophisticated elastic settling',
    name: 'Elastic Arc',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Arc animations use complex motion paths that may affect motion-sensitive users. Respect prefers-reduced-motion preferences."
        description="Physics-inspired curved trajectories that create natural, organic motion. Perfect for sophisticated, fluid user experiences."
        performance="Arc animations use CSS transforms with complex timing functions. Performance is good but may require testing on lower-end devices for complex arcs."
        title="Arc Family Animations"
        usage="Use arc animations when you want natural, physics-inspired motion that feels organic and sophisticated. Great for premium interfaces."
      />

      <AnimationGrid
        animations={arcAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Complete collection of arc entrance animations with natural, curved trajectories"
        title="All Arc Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={arcComparison}
        title="Arc Curvature Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="arc-in-gentle"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.3', 'animation-delay-0.5']}
        durations={['animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5', 'animation-duration-2']}
        timingFunctions={['animation-timing-function-ease-in-out', 'animation-timing-function-ease-out', 'animation-timing-function-cubic-bezier', 'animation-timing-function-spring']}
      />
    </div>
  ),
}
