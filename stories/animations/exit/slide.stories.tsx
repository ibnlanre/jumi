import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Slide Exit Animations

The slide exit family provides directional movement animations for content sliding out of view. These animations create natural, spatial awareness during dismissals and removals.

## Animation Classes

- **slide-out-up**: Slide out upward
- **slide-out-down**: Slide out downward  
- **slide-out-left**: Slide out leftward
- **slide-out-right**: Slide out rightward
- **slide-out-up-small**: Subtle upward slide exit
- **slide-out-down-small**: Subtle downward slide exit
- **slide-out-left-small**: Subtle leftward slide exit
- **slide-out-right-small**: Subtle rightward slide exit
- **slide-out-up-big**: Dramatic upward slide exit
- **slide-out-down-big**: Dramatic downward slide exit
- **slide-out-left-big**: Dramatic leftward slide exit
- **slide-out-right-big**: Dramatic rightward slide exit
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Exit/Slide Family',
}

export default meta
type Story = StoryObj

const slideOutAnimations = [
  {
    class: 'slide-out-up',
    description: 'Slide upward and out of viewport',
    name: 'Slide Out Up',
  },
  {
    class: 'slide-out-down',
    description: 'Slide downward and out of viewport',
    name: 'Slide Out Down',
  },
  {
    class: 'slide-out-left',
    description: 'Slide leftward and out of viewport',
    name: 'Slide Out Left',
  },
  {
    class: 'slide-out-right',
    description: 'Slide rightward and out of viewport',
    name: 'Slide Out Right',
  },
  {
    class: 'slide-out-up-small',
    description: 'Subtle upward slide with smaller movement',
    name: 'Slide Out Up Small',
  },
  {
    class: 'slide-out-down-small',
    description: 'Subtle downward slide with smaller movement',
    name: 'Slide Out Down Small',
  },
  {
    class: 'slide-out-left-small',
    description: 'Subtle leftward slide with smaller movement',
    name: 'Slide Out Left Small',
  },
  {
    class: 'slide-out-right-small',
    description: 'Subtle rightward slide with smaller movement',
    name: 'Slide Out Right Small',
  },
  {
    class: 'slide-out-up-big',
    description: 'Dramatic upward slide with larger movement',
    name: 'Slide Out Up Big',
  },
  {
    class: 'slide-out-down-big',
    description: 'Dramatic downward slide with larger movement',
    name: 'Slide Out Down Big',
  },
  {
    class: 'slide-out-left-big',
    description: 'Dramatic leftward slide with larger movement',
    name: 'Slide Out Left Big',
  },
  {
    class: 'slide-out-right-big',
    description: 'Dramatic rightward slide with larger movement',
    name: 'Slide Out Right Big',
  },
]

const slideOutComparison = [
  {
    bestFor: 'Mobile bottom sheet dismissals, panel closures',
    class: 'slide-out-down',
    description: 'Content slides down and away',
    name: 'Slide Down',
  },
  {
    bestFor: 'Side navigation closures, drawer dismissals',
    class: 'slide-out-left',
    description: 'Content slides left and away',
    name: 'Slide Left',
  },
  {
    bestFor: 'Toast notifications, temporary alerts',
    class: 'slide-out-up',
    description: 'Content slides up and away',
    name: 'Slide Up',
  },
  {
    bestFor: 'Right panel closures, contextual menu dismissals',
    class: 'slide-out-right',
    description: 'Content slides right and away',
    name: 'Slide Right',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Exit slides should be quick and predictable. Respect prefers-reduced-motion and consider the reading direction (LTR/RTL)."
        description="Directional departures that maintain spatial relationships and provide clear visual feedback about where content is going."
        performance="Slide out animations use transform: translateX/Y which are GPU-accelerated. Excellent performance for frequent dismissals."
        title="Slide Exit Animations"
        usage="Use slide out animations for navigation dismissals, panel closures, and anywhere spatial direction matters for user understanding."
      />

      <AnimationGrid
        animations={slideOutAnimations}
        columns={3}
        defaultDuration="animation-duration-0.5"
        description="Complete collection of slide exit animations with small, normal, and big variants"
        title="All Slide Out Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={slideOutComparison}
        title="Slide Direction Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="slide-out-left"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.3']}
        durations={['animation-duration-0.3', 'animation-duration-0.4', 'animation-duration-0.5', 'animation-duration-0.6', 'animation-duration-0.8']}
        timingFunctions={['animation-timing-function-ease-in', 'animation-timing-function-ease-out', 'animation-timing-function-ease-in-out', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
