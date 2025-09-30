import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Bounce Entrance Animations

The bounce family creates playful, elastic animations that simulate objects bouncing into view. These animations add personality and delight to user interfaces.

## Animation Classes

- **bounce-in**: Standard bounce entrance
- **bounce-in-up**: Bounce in from bottom
- **bounce-in-down**: Bounce in from top
- **bounce-in-left**: Bounce in from left
- **bounce-in-right**: Bounce in from right
- **bounce-in-up-small**: Subtle upward bounce
- **bounce-in-down-small**: Subtle downward bounce
- **bounce-in-left-small**: Subtle leftward bounce
- **bounce-in-right-small**: Subtle rightward bounce
- **bounce-in-up-big**: Dramatic upward bounce
- **bounce-in-down-big**: Dramatic downward bounce
- **bounce-in-left-big**: Dramatic leftward bounce
- **bounce-in-right-big**: Dramatic rightward bounce
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Bounce Family',
}

export default meta
type Story = StoryObj

const bounceAnimations = [
  {
    class: 'bounce-in',
    description: 'Elastic scaling animation with bounce effect',
    name: 'Bounce In',
  },
  {
    class: 'bounce-in-up',
    description: 'Bounce upward with elastic settling',
    name: 'Bounce In Up',
  },
  {
    class: 'bounce-in-down',
    description: 'Bounce downward with elastic settling',
    name: 'Bounce In Down',
  },
  {
    class: 'bounce-in-left',
    description: 'Bounce from left with elastic settling',
    name: 'Bounce In Left',
  },
  {
    class: 'bounce-in-right',
    description: 'Bounce from right with elastic settling',
    name: 'Bounce In Right',
  },
  {
    class: 'bounce-in-up-small',
    description: 'Subtle upward bounce with gentle elastic effect',
    name: 'Bounce In Up Small',
  },
  {
    class: 'bounce-in-down-small',
    description: 'Subtle downward bounce with gentle elastic effect',
    name: 'Bounce In Down Small',
  },
  {
    class: 'bounce-in-left-small',
    description: 'Subtle leftward bounce with gentle elastic effect',
    name: 'Bounce In Left Small',
  },
  {
    class: 'bounce-in-right-small',
    description: 'Subtle rightward bounce with gentle elastic effect',
    name: 'Bounce In Right Small',
  },
  {
    class: 'bounce-in-up-big',
    description: 'Dramatic upward bounce with strong elastic effect',
    name: 'Bounce In Up Big',
  },
  {
    class: 'bounce-in-down-big',
    description: 'Dramatic downward bounce with strong elastic effect',
    name: 'Bounce In Down Big',
  },
  {
    class: 'bounce-in-left-big',
    description: 'Dramatic leftward bounce with strong elastic effect',
    name: 'Bounce In Left Big',
  },
  {
    class: 'bounce-in-right-big',
    description: 'Dramatic rightward bounce with strong elastic effect',
    name: 'Bounce In Right Big',
  },
]

const bounceComparison = [
  {
    bestFor: 'Call-to-action buttons, success notifications, playful interactions',
    class: 'bounce-in',
    description: 'Pure elastic scaling without directional movement',
    name: 'Standard Bounce',
  },
  {
    bestFor: 'Mobile bottom sheets, success messages, interactive elements',
    class: 'bounce-in-up',
    description: 'Combines upward movement with elastic bounce',
    name: 'Bounce Up',
  },
  {
    bestFor: 'Dropdown alerts, top notifications with personality',
    class: 'bounce-in-down',
    description: 'Combines downward movement with elastic bounce',
    name: 'Bounce Down',
  },
  {
    bestFor: 'Side panels with playful character, game UI elements',
    class: 'bounce-in-left',
    description: 'Combines leftward movement with elastic bounce',
    name: 'Bounce Left',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Bounce animations can be intense for motion-sensitive users. Always respect prefers-reduced-motion settings."
        description="Playful, elastic animations that add personality and delight. Perfect for creating engaging, memorable user interactions."
        performance="Bounce animations use CSS transforms and are GPU-accelerated. The elastic timing functions are optimized for smooth playback."
        title="Bounce Family Animations"
        usage="Use bounce animations sparingly for emphasis, success states, and playful interactions. Great for CTAs and celebratory moments."
      />

      <AnimationGrid
        animations={bounceAnimations}
        columns={3}
        defaultDuration="animation-duration-1.2"
        description="Complete collection of bounce entrance animations with elastic, playful character"
        title="All Bounce Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={bounceComparison}
        title="Bounce Animation Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="bounce-in"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.4', 'animation-delay-0.6']}
        durations={['animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5', 'animation-duration-2']}
        timingFunctions={['animation-timing-function-ease-out', 'animation-timing-function-bounce', 'animation-timing-function-elastic', 'animation-timing-function-back']}
      />
    </div>
  ),
}
