import { AnimationShowcase } from '../components/animation-showcase'

import React from 'react'

export interface AnimationGridProps {
  /** Array of animation configurations */
  animations: Array<{
    backgroundClass?: string
    class: string
    description?: string
    duration?: string
    name: string
  }>
  /** Number of columns in the grid */
  columns?: number
  /** Default animation duration */
  defaultDuration?: string
  /** Description of the animation family */
  description?: string
  /** Title for the animation grid */
  title: string
}

export interface AnimationPlaygroundProps {
  /** Animation class to test */
  animationClass: string
  /** Available delay options */
  delays?: string[]
  /** Available duration options */
  durations?: string[]
  /** Available timing function options */
  timingFunctions?: string[]
}

export interface CategoryHeaderProps {
  /** Accessibility considerations */
  accessibility?: string
  /** Category description */
  description: string
  /** Performance notes */
  performance?: string
  /** Main category title */
  title: string
  /** Usage guidelines */
  usage?: string
}

export interface EffectComparisonProps {
  /** Array of effects to compare */
  effects: Array<{
    backgroundClass?: string
    bestFor: string
    class: string
    description: string
    name: string
  }>
  /** Title for the comparison */
  title: string
}

export function AnimationGrid({
  animations,
  columns = 3,
  defaultDuration = 'animation-duration-1',
  description,
  title,
}: AnimationGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            {description}
          </p>
        )}
      </div>

      <div className={`grid gap-6 ${gridClasses[columns as keyof typeof gridClasses] || gridClasses[3]}`}>
        {animations.map(animation => (
          <AnimationShowcase
            animationClass={`animate ${animation.class} ${animation.duration || defaultDuration}`}
            backgroundClass={animation.backgroundClass || 'bg-white'}
            description={animation.description || ''}
            key={animation.name}
            title={animation.name}
          />
        ))}
      </div>
    </div>
  )
}

export function AnimationPlayground({
  animationClass,
  delays = ['animation-delay-0', 'animation-delay-0.2', 'animation-delay-0.5', 'animation-delay-1'],
  durations = ['animation-duration-0.3', 'animation-duration-0.5', 'animation-duration-1', 'animation-duration-1.5', 'animation-duration-2'],
  timingFunctions = ['animation-timing-function-ease', 'animation-timing-function-ease-in', 'animation-timing-function-ease-out', 'animation-timing-function-ease-in-out'],
}: AnimationPlaygroundProps) {
  const [selectedDuration, setSelectedDuration] = React.useState(durations[2])
  const [selectedDelay, setSelectedDelay] = React.useState(delays[0])
  const [selectedTiming, setSelectedTiming] = React.useState(timingFunctions[0])
  const [key, setKey] = React.useState(0)

  const currentAnimation = `animate ${animationClass} ${selectedDuration} ${selectedDelay} ${selectedTiming}`

  return (
    <div className="p-6 space-y-6 rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-900">
        🎮 Animation Playground
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Duration
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={e => setSelectedDuration(e.target.value)}
            value={selectedDuration}
          >
            {durations.map(duration => (
              <option key={duration} value={duration}>
                {duration.replace('animation-duration-', '')}
                s
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Delay
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={e => setSelectedDelay(e.target.value)}
            value={selectedDelay}
          >
            {delays.map(delay => (
              <option key={delay} value={delay}>
                {delay.replace('animation-delay-', '')}
                s
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Timing Function
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={e => setSelectedTiming(e.target.value)}
            value={selectedTiming}
          >
            {timingFunctions.map(timing => (
              <option key={timing} value={timing}>
                {timing.replace('animation-timing-function-', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <AnimationShowcase
          animationClass={currentAnimation}
          backgroundClass="bg-blue-100"
          title="Live Preview"
          trigger={key > 0}
        />
      </div>

      <div className="space-y-2 text-center">
        <button
          className="px-6 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={() => setKey(prev => prev + 1)}
        >
          Replay Animation
        </button>

        <div className="p-3 font-mono text-sm bg-white border rounded">
          <code>{currentAnimation}</code>
        </div>
      </div>
    </div>
  )
}

export function CategoryHeader({
  accessibility,
  description,
  performance,
  title,
  usage,
}: CategoryHeaderProps) {
  return (
    <div className="mb-12 space-y-6">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="max-w-4xl mx-auto text-xl text-gray-600">
          {description}
        </p>
      </div>

      {(usage || performance || accessibility) && (
        <div className="grid gap-6 mt-8 md:grid-cols-3">
          {usage && (
            <div className="p-6 rounded-lg bg-blue-50">
              <h3 className="mb-3 text-lg font-semibold text-blue-900">
                💡 Usage Guidelines
              </h3>
              <p className="text-blue-800">{usage}</p>
            </div>
          )}

          {performance && (
            <div className="p-6 rounded-lg bg-green-50">
              <h3 className="mb-3 text-lg font-semibold text-green-900">
                ⚡ Performance
              </h3>
              <p className="text-green-800">{performance}</p>
            </div>
          )}

          {accessibility && (
            <div className="p-6 rounded-lg bg-purple-50">
              <h3 className="mb-3 text-lg font-semibold text-purple-900">
                ♿ Accessibility
              </h3>
              <p className="text-purple-800">{accessibility}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EffectComparison({ effects, title }: EffectComparisonProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-center text-gray-900">
        {title}
      </h3>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {effects.map(effect => (
          <div className="space-y-4" key={effect.name}>
            <AnimationShowcase
              animationClass={`animate ${effect.class} animation-duration-1`}
              backgroundClass={effect.backgroundClass || 'bg-white'}
              description={effect.description}
              title={effect.name}
            />
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-2 font-medium text-gray-900">Best For:</h4>
              <p className="text-sm text-gray-700">{effect.bestFor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
