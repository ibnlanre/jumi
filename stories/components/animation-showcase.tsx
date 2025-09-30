import { useEffect, useState } from 'react'

export interface AnimationShowcaseProps {
  /** Animation class to apply */
  animationClass: string
  /** Background class for the showcase container */
  backgroundClass?: string
  /** Custom content to animate */
  children?: React.ReactNode
  /** Description of the animation */
  description?: string
  /** Whether to show the element */
  show?: boolean
  /** Title of the animation */
  title: string
  /** Custom trigger to restart animation */
  trigger?: boolean
}

export function AnimationShowcase({
  animationClass,
  backgroundClass = 'bg-white',
  children,
  description,
  show = true,
  title,
  trigger = false,
}: AnimationShowcaseProps) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (trigger) {
      setKey(prev => prev + 1)
    }
  }, [trigger])

  const defaultContent = (
    <div className="flex items-center justify-center w-24 h-24 text-lg font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
      ✨
    </div>
  )

  return (
    <div className={`flex flex-col items-center gap-4 p-8 border rounded-lg shadow-sm overflow-hidden ${backgroundClass}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        <code className="inline-block px-2 py-1 mt-2 text-xs bg-gray-100 rounded">
          {animationClass}
        </code>
      </div>

      <div className="relative flex items-center justify-center w-full min-h-32">
        {show && (
          <div
            className={animationClass}
            key={key}
          >
            {children || defaultContent}
          </div>
        )}
      </div>

      <button
        className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
        onClick={() => setKey(prev => prev + 1)}
      >
        Replay Animation
      </button>
    </div>
  )
}
