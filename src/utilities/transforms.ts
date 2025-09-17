import type { PluginAPI } from 'tailwindcss/types/config'

import type { Direction, DirectionConfig } from '@/types'

import { defaultTheme } from '../config/defaults'
import { mergeTheme } from '../helpers/merge-theme'
import { createAdditiveAnimation } from './animate'

/**
 * Transform utilities with intelligent defaults
 * - animate-scale-{value} implies uniform scaling
 * - animate-rotate-{value} implies z-axis clockwise
 * - animate-translate-{direction}-{value} requires explicit direction
 */

// Direction mappings for transforms
const directionMappings: Record<Direction, DirectionConfig> = {
  'bottom': {
    axis: 'y',
    x: 0,
    y: 1,
    z: 0,
  },
  'bottom-end': {
    axis: 'd',
    x: 1,
    y: 1,
    z: 0,
  },
  'bottom-left': {
    axis: 'd',
    x: -1,
    y: 1,
    z: 0,
  },

  'bottom-right': {
    axis: 'd',
    x: 1,
    y: 1,
    z: 0,
  },
  'bottom-start': {
    axis: 'd',
    x: -1,
    y: 1,
    z: 0,
  },
  'end': {
    axis: 'x',
    x: 1,
    y: 0,
    z: 0,
  }, // Maps to right in LTR, left in RTL
  'end-end': {
    axis: 'd',
    x: 1,
    y: 1,
    z: 0,
  },

  'end-start': {
    axis: 'd',
    x: 1,
    y: -1,
    z: 0,
  },
  'left': {
    axis: 'x',
    x: -1,
    y: 0,
    z: 0,
  },

  'right': {
    axis: 'x',
    x: 1,
    y: 0,
    z: 0,
  },
  // Logical directions (i18n-friendly)
  'start': {
    axis: 'x',
    x: -1,
    y: 0,
    z: 0,
  }, // Maps to left in LTR, right in RTL
  'start-end': {
    axis: 'd',
    x: -1,
    y: 1,
    z: 0,
  },
  'start-start': {
    axis: 'd',
    x: -1,
    y: -1,
    z: 0,
  }, // Alternative naming

  // Semantic directions (physical)
  'top': {
    axis: 'y',
    x: 0,
    y: -1,
    z: 0,
  },
  'top-end': {
    axis: 'd',
    x: 1,
    y: -1,
    z: 0,
  },
  // Diagonal directions (physical)
  'top-left': {
    axis: 'd',
    x: -1,
    y: -1,
    z: 0,
  },
  'top-right': {
    axis: 'd',
    x: 1,
    y: -1,
    z: 0,
  },
  // Diagonal directions (logical)
  'top-start': {
    axis: 'd',
    x: -1,
    y: -1,
    z: 0,
  },
  // Axis-based (explicit)
  'x': {
    axis: 'x',
    x: 1,
    y: 0,
    z: 0,
  },
  'y': {
    axis: 'y',
    x: 0,
    y: 1,
    z: 0,
  },
  'z': {
    axis: 'z',
    x: 0,
    y: 0,
    z: 1,
  },
}

export function addTransformUtilities({ matchUtilities, theme }: PluginAPI) {
  // === SCALE UTILITIES ===

  // Uniform scale (default behavior) - Additive approach
  matchUtilities(
    {
      'animate-scale': (value: string) =>
        createAdditiveAnimation('jumi-scale-uniform', {
          '--jumi-scale': value,
        }),
    },
    {
      supportsNegativeValues: true,
      type: 'number',
      values: mergeTheme(defaultTheme.scales, theme('jumi.scales')),
    },
  )

  // Axis-specific scale - Additive approach
  ;['x', 'y', 'z'].forEach(axis => {
    matchUtilities(
      {
        [`animate-scale-${axis}`]: (value: string) =>
          createAdditiveAnimation(`jumi-scale-${axis}`, {
            [`--jumi-scale-${axis}`]: value,
          }),
      },
      {
        supportsNegativeValues: true,
        type: 'number',
        values: mergeTheme(defaultTheme.scales, theme('jumi.scales')),
      },
    )
  })

  // === ROTATION UTILITIES ===

  // Default rotation (z-axis clockwise) - Additive approach
  matchUtilities(
    {
      'animate-rotate': (value: string) =>
        createAdditiveAnimation('jumi-rotate-z', {
          '--jumi-rotate-z': value,
        }),
    },
    {
      supportsNegativeValues: true,
      type: 'any',
      values: mergeTheme(defaultTheme.rotations, theme('jumi.rotations')),
    },
  )

  // Counter-clockwise rotation - Additive approach
  matchUtilities(
    {
      'animate-rotate-ccw': (value: string) =>
        createAdditiveAnimation('jumi-rotate-z', {
          '--jumi-rotate-z': `calc(-1 * ${value})`,
        }),
    },
    {
      supportsNegativeValues: true,
      type: 'any',
      values: mergeTheme(defaultTheme.rotations, theme('jumi.rotations')),
    },
  )

  // Axis-specific rotation - Additive approach
  ;['x', 'y', 'z'].forEach(axis => {
    matchUtilities(
      {
        [`animate-rotate-${axis}`]: (value: string) =>
          createAdditiveAnimation(`jumi-rotate-${axis}`, {
            [`--jumi-rotate-${axis}`]: value,
          }),
      },
      {
        type: 'any',
        values: mergeTheme(defaultTheme.rotations, theme('jumi.rotations')),
      },
    )
  })

  // === SKEW UTILITIES (Legacy, Non-Additive) ===

  ;['x', 'y'].forEach(axis => {
    matchUtilities(
      {
        [`animate-skew-${axis}`]: (value: string) => ({
          [`--jumi-skew-${axis}`]: value,
          'animation-name': `jumi-skew-${axis}`,
        }),
      },
      {
        supportsNegativeValues: true,
        type: 'any',
        values: mergeTheme(defaultTheme.rotations, theme('jumi.rotations')),
      },
    )
  })

  // === TRANSLATE UTILITIES (Explicit Direction Required) ===

  Object.entries(directionMappings).forEach(([direction, config]) => {
    const { x, y, z } = config

    matchUtilities(
      {
        [`animate-translate-${direction}`]: (value: string) => {
          const styles: Record<string, string> = {
            'animation-name': `jumi-translate-${direction}`,
          }

          // Set the target translate values
          if (x !== 0) styles['--jumi-translate-x'] = `calc(${value} * ${x})`
          if (y !== 0) styles['--jumi-translate-y'] = `calc(${value} * ${y})`
          if (z !== 0) styles['--jumi-translate-z'] = `calc(${value} * ${z})`

          return styles
        },
      },
      {
        supportsNegativeValues: true,
        type: 'length',
        values: mergeTheme(defaultTheme.distances, theme('jumi.distances')),
      },
    )
  })

  // === PERSPECTIVE UTILITIES ===

  matchUtilities(
    {
      'animate-perspective': (value: string) => ({
        '--jumi-perspective': value,
        'animation-name': 'jumi-perspective',
      }),
    },
    {
      type: 'length',
      values: mergeTheme(defaultTheme.perspectives, theme('jumi.perspectives')),
    },
  )

  // Transform origin utilities
  matchUtilities(
    {
      'animate-origin': (value: string) => ({
        '--jumi-transform-origin': value,
        'animation-name': 'jumi-origin',
      }),
    },
    {
      type: 'lookup',
      values: mergeTheme(defaultTheme.origins, theme('jumi.origins')),
    },
  )
}

// Generate transform keyframes for the new system
export function generateTransformKeyframes(): Record<string, any> {
  const keyframes: Record<string, any> = {}

  // Scale keyframes
  keyframes['@keyframes jumi-scale-uniform'] = {
    to: {
      transform: 'scale(var(--jumi-scale, 1))',
    },
  }

  ;['x', 'y', 'z'].forEach(axis => {
    const scaleFunc =
      axis === 'z' ? 'scaleZ' : axis === 'y' ? 'scaleY' : 'scaleX'

    keyframes[`@keyframes jumi-scale-${axis}`] = {
      to: {
        transform: `${scaleFunc}(var(--jumi-scale-${axis}, 1))`,
      },
    }
  })

  // Rotation keyframes
  ;['x', 'y', 'z'].forEach(axis => {
    const rotateFunc =
      axis === 'z' ? 'rotateZ' : axis === 'y' ? 'rotateY' : 'rotateX'
    keyframes[`@keyframes jumi-rotate-${axis}`] = {
      to: {
        transform: `${rotateFunc}(var(--jumi-rotate-${axis}, 0deg))`,
      },
    }
  })

  // Translation keyframes
  Object.keys(directionMappings).forEach(direction => {
    keyframes[`@keyframes jumi-translate-${direction}`] = {
      to: {
        transform:
          'translate3d(var(--jumi-translate-x, 0), var(--jumi-translate-y, 0), var(--jumi-translate-z, 0))',
      },
    }
  })

  // Perspective keyframes
  keyframes['@keyframes jumi-perspective'] = {
    to: {
      perspective: 'var(--jumi-perspective, none)',
    },
  }

  // Transform origin keyframes
  keyframes['@keyframes jumi-origin'] = {
    to: {
      'transform-origin': 'var(--jumi-transform-origin, center)',
    },
  }

  return keyframes
}
