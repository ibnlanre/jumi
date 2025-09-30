import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Circle Exit Animations

The circle exit family creates curved, orbital departure animations that simulate content following circular paths out of view. These animations add elegance and sophistication to dismissals.

## Animation Classes

- **circle-out-center**: Circle outward from center
- **circle-out-top-left**: Circle toward top-left corner
- **circle-out-top-right**: Circle toward top-right corner
- **circle-out-bottom-left**: Circle toward bottom-left corner
- **circle-out-bottom-right**: Circle toward bottom-right corner
- **circle-out-clockwise**: Clockwise circular departure
- **circle-out-counter-clockwise**: Counter-clockwise circular departure
- **circle-out-up**: Circular motion moving upward
- **circle-out-down**: Circular motion moving downward
- **circle-out-left**: Circular motion moving leftward
- **circle-out-right**: Circular motion moving rightward
- **circle-out-spiral**: Spiral outward motion
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Exit/Circle Family',
}

export default meta
type Story = StoryObj

const circleOutAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'circle-out-center',
    description: 'Circular contraction toward center point',
    name: 'Circle Out Center',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-teal-100',
    class: 'circle-out-top-left',
    description: 'Circular motion departing toward top-left',
    name: 'Circle Out Top Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    class: 'circle-out-top-right',
    description: 'Circular motion departing toward top-right',
    name: 'Circle Out Top Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    class: 'circle-out-bottom-left',
    description: 'Circular motion departing toward bottom-left',
    name: 'Circle Out Bottom Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    class: 'circle-out-bottom-right',
    description: 'Circular motion departing toward bottom-right',
    name: 'Circle Out Bottom Right',
  },
  {
    backgroundClass: 'bg-gradient-to-r from-cyan-100 to-blue-100',
    class: 'circle-out-clockwise',
    description: 'Clockwise circular departure motion',
    name: 'Circle Out Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-r from-emerald-100 to-green-100',
    class: 'circle-out-counter-clockwise',
    description: 'Counter-clockwise circular departure motion',
    name: 'Circle Out Counter-Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'circle-out-up',
    description: 'Circular motion with upward departure',
    name: 'Circle Out Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'circle-out-down',
    description: 'Circular motion with downward departure',
    name: 'Circle Out Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-rose-100 to-red-100',
    class: 'circle-out-left',
    description: 'Circular motion with leftward departure',
    name: 'Circle Out Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-cyan-100',
    class: 'circle-out-right',
    description: 'Circular motion with rightward departure',
    name: 'Circle Out Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    class: 'circle-out-spiral',
    description: 'Spiral outward motion with circular path',
    name: 'Circle Out Spiral',
  },
]

const circleOutComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    bestFor: 'Closing modals with sophistication, elegant dismissals',
    class: 'circle-out-center',
    description: 'Radial contraction to center point',
    name: 'Center Circle',
  },
  {
    backgroundClass: 'bg-gradient-to-r from-cyan-100 to-blue-100',
    bestFor: 'Interactive element dismissals, playful closures',
    class: 'circle-out-clockwise',
    description: 'Smooth clockwise circular departure',
    name: 'Clockwise',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    bestFor: 'Artistic interfaces, premium dismissals, memorable closures',
    class: 'circle-out-spiral',
    description: 'Hypnotic spiral outward motion',
    name: 'Spiral',
  },
]

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Circular exit animations can be disorienting. Use them thoughtfully and always respect prefers-reduced-motion settings."
        description="Elegant curved departures that add sophistication and visual interest to dismissals. Perfect for creating memorable closure experiences."
        performance="Circle exit animations use complex CSS transforms. Monitor performance on lower-end devices and consider simpler fallbacks."
        title="Circle Exit Animations"
        usage="Use circle exit animations for premium interfaces, artistic elements, or when you want dismissals to have a distinctive, sophisticated character."
      />

      <AnimationGrid
        animations={circleOutAnimations}
        columns={3}
        defaultDuration="animation-duration-0.8"
        description="Complete collection of circular exit animations with curved, orbital departure motions"
        title="All Circle Out Animations"
      />
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="p-8">
      <EffectComparison
        effects={circleOutComparison}
        title="Circle Exit Motion Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="circle-out-center"
        delays={['animation-delay-0', 'animation-delay-0.1', 'animation-delay-0.2', 'animation-delay-0.4']}
        durations={['animation-duration-0.6', 'animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5']}
        timingFunctions={['animation-timing-function-ease-in', 'animation-timing-function-ease-in-out', 'animation-timing-function-cubic-bezier', 'animation-timing-function-elastic']}
      />
    </div>
  ),
}
