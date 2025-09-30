import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Mask & Reveal Entrance Animations

The mask and reveal family creates sophisticated entrance effects using clipping, masking, and progressive disclosure techniques. These animations provide elegant, cinematic reveals.

## Animation Classes

### Mask Family
- **mask-in-wipe-up**: Upward wipe reveal
- **mask-in-wipe-down**: Downward wipe reveal
- **mask-in-wipe-left**: Leftward wipe reveal
- **mask-in-wipe-right**: Rightward wipe reveal
- **mask-in-circle**: Circular mask reveal
- **mask-in-diamond**: Diamond mask reveal
- **mask-in-triangle**: Triangle mask reveal

### Reveal Family
- **reveal-in-typewriter**: Typewriter-style reveal
- **reveal-in-curtain**: Curtain opening reveal
- **reveal-in-blinds**: Venetian blinds reveal
- **reveal-in-spotlight**: Spotlight reveal effect
- **reveal-in-iris**: Iris opening reveal
- **reveal-in-split**: Split screen reveal
- **reveal-in-peel**: Page peel reveal
- **reveal-in-unfold**: Unfolding reveal
- **reveal-in-accordion**: Accordion-style reveal
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Entrance/Mask & Reveal',
}

export default meta
type Story = StoryObj

const maskAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'mask-in-wipe-up',
    description: 'Content revealed by upward wipe motion',
    name: 'Mask Wipe Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'mask-in-wipe-down',
    description: 'Content revealed by downward wipe motion',
    name: 'Mask Wipe Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'mask-in-wipe-left',
    description: 'Content revealed by leftward wipe motion',
    name: 'Mask Wipe Left',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'mask-in-wipe-right',
    description: 'Content revealed by rightward wipe motion',
    name: 'Mask Wipe Right',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'mask-in-circle',
    description: 'Content revealed through expanding circle',
    name: 'Mask Circle',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'mask-in-diamond',
    description: 'Content revealed through expanding diamond',
    name: 'Mask Diamond',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'mask-in-triangle',
    description: 'Content revealed through expanding triangle',
    name: 'Mask Triangle',
  },
]

const revealAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-slate-100 to-gray-100',
    class: 'reveal-in-typewriter',
    description: 'Typewriter-style character-by-character reveal',
    name: 'Typewriter Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    class: 'reveal-in-curtain',
    description: 'Theater curtain opening effect',
    name: 'Curtain Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    class: 'reveal-in-blinds',
    description: 'Venetian blinds opening effect',
    name: 'Blinds Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    class: 'reveal-in-spotlight',
    description: 'Spotlight illumination reveal',
    name: 'Spotlight Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'reveal-in-iris',
    description: 'Camera iris opening effect',
    name: 'Iris Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'reveal-in-split',
    description: 'Split screen reveal from center',
    name: 'Split Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    class: 'reveal-in-peel',
    description: 'Page corner peel reveal',
    name: 'Peel Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'reveal-in-unfold',
    description: 'Origami-style unfolding reveal',
    name: 'Unfold Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    class: 'reveal-in-accordion',
    description: 'Accordion-style expanding reveal',
    name: 'Accordion Reveal',
  },
]

const maskRevealComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    bestFor: 'Image galleries, content reveals, progressive disclosure',
    class: 'mask-in-wipe-up',
    description: 'Clean, directional wipe reveal',
    name: 'Wipe Mask',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    bestFor: 'Spotlight effects, featured content, dramatic reveals',
    class: 'mask-in-circle',
    description: 'Radial expansion from center',
    name: 'Circle Mask',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-red-100 to-pink-100',
    bestFor: 'Presentations, theater-like reveals, formal interfaces',
    class: 'reveal-in-curtain',
    description: 'Elegant theater curtain effect',
    name: 'Curtain Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    bestFor: 'Interactive elements, playful interfaces, creative reveals',
    class: 'reveal-in-peel',
    description: 'Realistic page peel effect',
    name: 'Peel Reveal',
  },
]

export const MaskAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Mask Family</h2>
      <AnimationGrid
        animations={maskAnimations}
        columns={3}
        defaultDuration="animation-duration-1"
        description="Clipping and masking effects for precise content reveals"
        title="Mask Entrance Animations"
      />
    </div>
  ),
}

export const RevealAnimations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Reveal Family</h2>
      <AnimationGrid
        animations={revealAnimations}
        columns={3}
        defaultDuration="animation-duration-1.2"
        description="Sophisticated reveal techniques with cinematic flair"
        title="Reveal Entrance Animations"
      />
    </div>
  ),
}

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Mask and reveal animations use complex visual effects that may be challenging for users with visual processing differences. Provide clear alternatives."
        description="Cinematic entrance effects using masking, clipping, and progressive disclosure. Perfect for sophisticated, professional presentations."
        performance="Mask and reveal animations may use CSS clip-path and complex transforms. Test performance and consider fallbacks for older browsers."
        title="Mask & Reveal Animations"
        usage="Use mask and reveal animations for premium interfaces, presentations, galleries, or when you want to create a sense of unveiling and discovery."
      />

      <EffectComparison
        effects={maskRevealComparison}
        title="Mask & Reveal Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="mask-in-circle"
        delays={['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.4', 'animation-delay-0.6']}
        durations={['animation-duration-0.8', 'animation-duration-1', 'animation-duration-1.2', 'animation-duration-1.5', 'animation-duration-2']}
        timingFunctions={['animation-timing-function-ease-out', 'animation-timing-function-ease-in-out', 'animation-timing-function-cubic-bezier', 'animation-timing-function-steps']}
      />
    </div>
  ),
}
