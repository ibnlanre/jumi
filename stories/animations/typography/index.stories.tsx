import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimationGrid, AnimationPlayground, CategoryHeader, EffectComparison } from '../components'

const meta: Meta = {
  parameters: {
    docs: {
      description: {
        component: `
# Typography Animations

Typography animations are specialized effects designed specifically for text content. These animations enhance readability, create engaging reveals, and add personality to textual elements.

## Animation Categories

### Typing & Reveal Effects
- **typing**: Typewriter-style character-by-character reveal
- **typing-cursor**: Typing effect with blinking cursor
- **word-reveal**: Word-by-word revelation
- **line-reveal**: Line-by-line text revelation
- **character-fade**: Individual character fade-in

### Letter Spacing Effects
- **letter-space-in**: Expanding letter spacing
- **letter-space-out**: Contracting letter spacing
- **letter-space-wave**: Wave-like letter spacing animation
- **letter-space-elastic**: Elastic letter spacing effect

### Text Movement Effects
- **word-slide-up**: Words sliding up individually
- **word-slide-down**: Words sliding down individually
- **word-slide-left**: Words sliding left individually
- **word-slide-right**: Words sliding right individually
- **text-wave**: Wave motion through text
- **text-bounce**: Bouncing text effect

### Character Effects
- **character-rotate**: Individual character rotation
- **character-scale**: Individual character scaling
- **character-color-shift**: Character color transitions
- **character-glow**: Individual character glow effects
- **character-dance**: Dancing character animation

### Reading & Focus Effects
- **focus-line**: Reading focus line animation
- **highlight-sweep**: Text highlighting sweep
- **underline-draw**: Animated underline drawing
- **text-spotlight**: Text spotlight effect
        `,
      },
    },
    layout: 'fullscreen',
  },
  title: 'Animations/Typography',
}

export default meta
type Story = StoryObj

const typingAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    class: 'typing',
    description: 'Classic typewriter character-by-character reveal',
    name: 'Typing',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    class: 'typing-cursor',
    description: 'Typing effect with animated blinking cursor',
    name: 'Typing with Cursor',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    class: 'word-reveal',
    description: 'Word-by-word text revelation effect',
    name: 'Word Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'line-reveal',
    description: 'Line-by-line progressive text reveal',
    name: 'Line Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
    class: 'character-fade',
    description: 'Individual character fade-in sequence',
    name: 'Character Fade',
  },
]

const letterSpacingAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    class: 'letter-space-in',
    description: 'Letters expand outward with growing spacing',
    name: 'Letter Space In',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    class: 'letter-space-out',
    description: 'Letters contract inward with shrinking spacing',
    name: 'Letter Space Out',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'letter-space-wave',
    description: 'Wave-like motion through letter spacing',
    name: 'Letter Space Wave',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
    class: 'letter-space-elastic',
    description: 'Elastic bouncing letter spacing effect',
    name: 'Letter Space Elastic',
  },
]

const textMovementAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    class: 'word-slide-up',
    description: 'Words slide up individually in sequence',
    name: 'Word Slide Up',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-rose-100 to-pink-100',
    class: 'word-slide-down',
    description: 'Words slide down individually in sequence',
    name: 'Word Slide Down',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    class: 'text-wave',
    description: 'Flowing wave motion through entire text',
    name: 'Text Wave',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-lime-100 to-green-100',
    class: 'text-bounce',
    description: 'Playful bouncing motion through text',
    name: 'Text Bounce',
  },
]

const characterEffectsAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    class: 'character-rotate',
    description: 'Individual character rotation effects',
    name: 'Character Rotate',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    class: 'character-scale',
    description: 'Individual character scaling animations',
    name: 'Character Scale',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-pink-100',
    class: 'character-color-shift',
    description: 'Character-by-character color transitions',
    name: 'Character Color Shift',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-orange-100 to-red-100',
    class: 'character-dance',
    description: 'Playful dancing character animation',
    name: 'Character Dance',
  },
]

const readingEffectsAnimations = [
  {
    backgroundClass: 'bg-gradient-to-br from-slate-100 to-gray-100',
    class: 'focus-line',
    description: 'Reading focus line that guides attention',
    name: 'Focus Line',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    class: 'highlight-sweep',
    description: 'Text highlighting sweep effect',
    name: 'Highlight Sweep',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    class: 'underline-draw',
    description: 'Animated underline drawing effect',
    name: 'Underline Draw',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    class: 'text-spotlight',
    description: 'Spotlight effect illuminating text',
    name: 'Text Spotlight',
  },
]

const typographyComparison = [
  {
    backgroundClass: 'bg-gradient-to-br from-green-100 to-emerald-100',
    bestFor: 'Code demonstrations, storytelling, dramatic reveals',
    class: 'typing',
    description: 'Classic typewriter character reveal',
    name: 'Typing',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-purple-100 to-violet-100',
    bestFor: 'Headlines, announcements, sequential content',
    class: 'word-reveal',
    description: 'Progressive word-by-word revelation',
    name: 'Word Reveal',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    bestFor: 'Emphasis, modern typography, spacing adjustments',
    class: 'letter-space-in',
    description: 'Dynamic letter spacing expansion',
    name: 'Letter Spacing',
  },
  {
    backgroundClass: 'bg-gradient-to-br from-sky-100 to-blue-100',
    bestFor: 'Playful content, music lyrics, artistic text',
    class: 'text-wave',
    description: 'Flowing wave motion through text',
    name: 'Text Wave',
  },
]

export const TypingEffects: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Typing & Reveal Effects</h2>
      <AnimationGrid
        animations={typingAnimations}
        columns={3}
        defaultDuration="animation-duration-2"
        description="Character and word revelation effects for dramatic text reveals"
        title="Typing & Text Reveal Animations"
      />
    </div>
  ),
}

export const LetterSpacing: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Letter Spacing Effects</h2>
      <AnimationGrid
        animations={letterSpacingAnimations}
        columns={2}
        defaultDuration="animation-duration-1.5"
        description="Dynamic letter spacing animations for emphasis and style"
        title="Letter Spacing Animations"
      />
    </div>
  ),
}

export const TextMovement: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Text Movement Effects</h2>
      <AnimationGrid
        animations={textMovementAnimations}
        columns={2}
        defaultDuration="animation-duration-1.8"
        description="Word and text-level movement animations"
        title="Text Movement Animations"
      />
    </div>
  ),
}

export const CharacterEffects: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Character Effects</h2>
      <AnimationGrid
        animations={characterEffectsAnimations}
        columns={2}
        defaultDuration="animation-duration-1.2"
        description="Individual character-level animation effects"
        title="Character Effect Animations"
      />
    </div>
  ),
}

export const ReadingEffects: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">Reading & Focus Effects</h2>
      <AnimationGrid
        animations={readingEffectsAnimations}
        columns={2}
        defaultDuration="animation-duration-1"
        description="Effects that enhance reading experience and focus"
        title="Reading Enhancement Animations"
      />
    </div>
  ),
}

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <CategoryHeader
        accessibility="Typography animations can significantly impact readability. Ensure animated text remains legible, provide static alternatives, and respect prefers-reduced-motion settings."
        description="Specialized text animations that enhance typography, improve readability, and create engaging textual experiences. Perfect for storytelling and content emphasis."
        performance="Typography animations may affect text rendering performance, especially with many characters. Consider using CSS containment and limiting simultaneous animations."
        title="Typography Animations"
        usage="Use typography animations to enhance storytelling, create dramatic reveals, emphasize important content, and add personality to text-heavy interfaces."
      />

      <EffectComparison
        effects={typographyComparison}
        title="Typography Animation Comparison"
      />
    </div>
  ),
}

export const Playground: Story = {
  render: () => (
    <div className="p-8">
      <AnimationPlayground
        animationClass="typing"
        delays={['animation-delay-0', 'animation-delay-0.5', 'animation-delay-1', 'animation-delay-1.5']}
        durations={['animation-duration-1', 'animation-duration-2', 'animation-duration-3', 'animation-duration-4', 'animation-duration-5']}
        timingFunctions={['animation-timing-function-linear', 'animation-timing-function-ease-out', 'animation-timing-function-steps', 'animation-timing-function-cubic-bezier']}
      />
    </div>
  ),
}
