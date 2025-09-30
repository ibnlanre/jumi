import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Bounce Exit Animations

The bounce exit family creates playful, elastic departure animations that add personality to dismissals. These animations provide a sense of liveliness and engagement even when removing content.

## Animation Classes

- **bounce-out**: Standard bounce exit
- **bounce-out-up**: Bounce out upward
- **bounce-out-down**: Bounce out downward
- **bounce-out-left**: Bounce out leftward
- **bounce-out-right**: Bounce out rightward
- **bounce-out-up-small**: Subtle upward bounce exit
- **bounce-out-down-small**: Subtle downward bounce exit
- **bounce-out-left-small**: Subtle leftward bounce exit
- **bounce-out-right-small**: Subtle rightward bounce exit
- **bounce-out-up-big**: Dramatic upward bounce exit
- **bounce-out-down-big**: Dramatic downward bounce exit
- **bounce-out-left-big**: Dramatic leftward bounce exit
- **bounce-out-right-big**: Dramatic rightward bounce exit
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Exit/Bounce Family',
}

export default meta
type Story = StoryObj

const bounceOutAnimations = [
  {
    class: 'bounce-out',
    description: 'Elastic scaling animation with bounce departure',
    name: 'Bounce Out',
  },
  {
    class: 'bounce-out-up',
    description: 'Bounce upward with elastic departure',
    name: 'Bounce Out Up',
  },
  {
    class: 'bounce-out-down',
    description: 'Bounce downward with elastic departure',
    name: 'Bounce Out Down',
  },
  {
    class: 'bounce-out-left',
    description: 'Bounce leftward with elastic departure',
    name: 'Bounce Out Left',
  },
  {
    class: 'bounce-out-right',
    description: 'Bounce rightward with elastic departure',
    name: 'Bounce Out Right',
  },
  {
    class: 'bounce-out-up-small',
    description: 'Subtle upward bounce with gentle elastic departure',
    name: 'Bounce Out Up Small',
  },
  {
    class: 'bounce-out-down-small',
    description: 'Subtle downward bounce with gentle elastic departure',
    name: 'Bounce Out Down Small',
  },
  {
    class: 'bounce-out-left-small',
    description: 'Subtle leftward bounce with gentle elastic departure',
    name: 'Bounce Out Left Small',
  },
  {
    class: 'bounce-out-right-small',
    description: 'Subtle rightward bounce with gentle elastic departure',
    name: 'Bounce Out Right Small',
  },
  {
    class: 'bounce-out-up-big',
    description: 'Dramatic upward bounce with strong elastic departure',
    name: 'Bounce Out Up Big',
  },
  {
    class: 'bounce-out-down-big',
    description: 'Dramatic downward bounce with strong elastic departure',
    name: 'Bounce Out Down Big',
  },
  {
    class: 'bounce-out-left-big',
    description: 'Dramatic leftward bounce with strong elastic departure',
    name: 'Bounce Out Left Big',
  },
  {
    class: 'bounce-out-right-big',
    description: 'Dramatic rightward bounce with strong elastic departure',
    name: 'Bounce Out Right Big',
  },
]

const bounceOutComparison = [
  {
    bestFor: 'Playful dismissals, game UI elements, fun interactions',
    class: 'bounce-out',
    description: 'Pure elastic scaling departure without directional movement',
    name: 'Standard Bounce',
  },
  {
    bestFor: 'Mobile sheet dismissals with personality, playful closures',
    class: 'bounce-out-down',
    description: 'Combines downward movement with elastic bounce',
    name: 'Bounce Down',
  },
  {
    bestFor: 'Side panel closures with character, engaging dismissals',
    class: 'bounce-out-left',
    description: 'Combines leftward movement with elastic bounce',
    name: 'Bounce Left',
  },
  {
    bestFor: 'Celebration completions, success dismissals, achievement UI',
    class: 'bounce-out-up-big',
    description: 'Dramatic upward bounce for memorable exits',
    name: 'Bounce Up Big',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Bounce exit animations can be attention-grabbing. Use them thoughtfully and respect prefers-reduced-motion settings."
        description="Playful, elastic departures that add character and delight to dismissals. Perfect for maintaining engagement during removals."
        performance="Bounce exit animations use CSS transforms with elastic timing functions. GPU-accelerated with good performance across devices."
        title="Bounce Exit Animations"
        usage="Use bounce exits for playful interfaces, success states, and when you want dismissals to feel lively rather than abrupt."
      />

      <AnimationGrid
        animations={bounceOutAnimations}
        columns={3}
        defaultDuration="animation-duration-0.8"
        description="Complete collection of bounce exit animations with elastic, playful character"
        title="All Bounce Out Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={bounceOutComparison}
        title="Bounce Exit Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="bounce-out"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.4']}
        durations={['animation-duration-0.6', 'animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5']}
        timingFunctions={['animation-timing-function-ease-in', 'animation-timing-function-bounce', 'animation-timing-function-elastic', 'animation-timing-function-back']}
      />
    </div>
  ),
}
