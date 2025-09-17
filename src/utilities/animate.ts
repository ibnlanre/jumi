/**
 * Helper function to create additive animation utilities
 * This will be used by transform, property, and effect utilities
 */
export function createAdditiveAnimation(
  animationName: string,
  customProperties: Record<string, string> = {},
  options: {
    delay?: string
    direction?: string
    duration?: string
    fillMode?: string
    iterationCount?: string
    playState?: string
    timingFunction?: string
  } = {},
): Record<string, string> {
  const styles: Record<string, string> = {
    '--jumi-animation-name': animationName,
  }

  // Add optional per-animation timing properties
  if (options.duration) {
    styles['--jumi-animation-duration'] = options.duration
  }
  if (options.timingFunction) {
    styles['--jumi-animation-timing-function'] = options.timingFunction
  }
  if (options.delay) {
    styles['--jumi-animation-delay'] = options.delay
  }
  if (options.direction) {
    styles['--jumi-animation-direction'] = options.direction
  }
  if (options.iterationCount) {
    styles['--jumi-animation-iteration-count'] = options.iterationCount
  }
  if (options.fillMode) {
    styles['--jumi-animation-fill-mode'] = options.fillMode
  }
  if (options.playState) {
    styles['--jumi-animation-play-state'] = options.playState
  }

  // Add custom properties for this specific animation
  Object.assign(styles, customProperties)

  return styles
}
