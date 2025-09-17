import type { MatchProperty } from '@/types'

import { alignContent } from '@/theme/align-content'
import { alignItems } from '@/theme/align-items'
import { alignSelf } from '@/theme/align-self'
import { alignmentBaseline } from '@/theme/alignment-baseline'
import { all } from '@/theme/all'
import { animationComposition } from '@/theme/animation-composition'
import { animationDelay } from '@/theme/animation-delay'
import { animationDuration } from '@/theme/animation-duration'
import { animationFillMode } from '@/theme/animation-fill-mode'
import { animationIterationCount } from '@/theme/animation-iteration-count'
import { animationName } from '@/theme/animation-name'
import { animationPlayState } from '@/theme/animation-play-state'
import { animationRange } from '@/theme/animation-range'
import { animationTimeline } from '@/theme/animation-timeline'
import { animationTimelineAxis } from '@/theme/animation-timeline-axis'
import { animationTimelineInset } from '@/theme/animation-timeline-inset'
import { animationTimelineScroller } from '@/theme/animation-timeline-scroller'
import { animationTimingFunction } from '@/theme/animation-timing-function'
import { appearance } from '@/theme/appearance'
import { display } from '@/theme/display'
import { empty } from '@/theme/empty'
import { flexDirection } from '@/theme/flex-direction'
import { justifyContent } from '@/theme/justify-content'
import { overflow } from '@/theme/overflow'
import { percentage } from '@/theme/percentage'
import { position } from '@/theme/position'
import { textAlign } from '@/theme/text-align'
import { textShadow } from '@/theme/text-shadow'
import { transformStyle } from '@/theme/transform-style'
import { visibility } from '@/theme/visibility'

export const matchProperties: Partial<MatchProperty> = {
  'animate': {
    key: 'animation',
    property: value => ({
      animation: value,
    }),
    values: animationName,
  },
  'animate-accent-color': {
    key: 'accentColor',
    property: value => ({
      '--jumi-accent-color': value,
    }),
    values: {
      auto: 'auto',
    },
  },
  'animate-align-content': {
    property: value => ({
      '--jumi-align-content': value,
    }),
    values: alignContent,
  },
  'animate-align-items': {
    property: value => ({
      '--jumi-align-items': value,
    }),
    values: alignItems,
  },
  'animate-align-self': {
    property: value => ({
      '--jumi-align-self': value,
    }),
    values: alignSelf,
  },
  'animate-alignment-baseline': {
    property: value => ({
      '--jumi-alignment-baseline': value,
    }),
    values: alignmentBaseline,
  },
  'animate-all': {
    property: value => ({
      '--jumi-all': value,
    }),
    values: all,
  },
  'animate-appearance': {
    property: value => ({
      '--jumi-appearance': value,
    }),
    values: appearance,
  },
  'animate-backdrop-blur': {
    key: 'backdropBlur',
    property: value => ({
      '--jumi-backdrop-blur': value,
    }),
  },
  'animate-backdrop-brightness': {
    key: 'backdropBrightness',
    property: value => ({
      '--jumi-backdrop-brightness': value,
    }),
  },
  'animate-backdrop-contrast': {
    key: 'backdropContrast',
    property: value => ({
      '--jumi-backdrop-contrast': value,
    }),
  },
  'animate-backdrop-filter': {
    property: value => ({
      '--jumi-backdrop-filter': value,
    }),
    values: empty.none,
  },
  'animate-backdrop-grayscale': {
    key: 'backdropGrayscale',
    property: value => ({
      '--jumi-backdrop-grayscale': value,
    }),
  },
  'animate-backdrop-hue-rotate': {
    key: 'backdropHueRotate',
    property: value => ({
      '--jumi-backdrop-hue-rotate': value,
    }),
  },
  'animate-backdrop-invert': {
    key: 'backdropInvert',
    property: value => ({
      '--jumi-backdrop-invert': value,
    }),
  },
  'animate-backdrop-opacity': {
    key: 'backdropOpacity',
    property: value => ({
      '--jumi-backdrop-opacity': value,
    }),
  },
  'animate-backdrop-saturate': {
    key: 'backdropSaturate',
    property: value => ({
      '--jumi-backdrop-saturate': value,
    }),
  },
  'animate-backdrop-sepia': {
    key: 'backdropSepia',
    property: value => ({
      '--jumi-backdrop-sepia': value,
    }),
  },
  'animate-background': {
    property: value => ({
      '--jumi-background': value,
    }),
    values: empty.none,
  },
  'animate-background-color': {
    key: 'backgroundColor',
    property: value => ({
      '--jumi-background-color': value,
    }),
  },
  'animate-background-position': {
    key: 'backgroundPosition',
    property: value => ({
      '--jumi-background-position': value,
    }),
  },
  'animate-background-size': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size': value,
    }),
  },
  'animate-border-block-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-end-radius': value,
      '--jumi-border-end-start-radius': value,
    }),
  },
  'animate-border-block-end-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-block-end-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-block-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-start-end-radius': value,
      '--jumi-border-start-start-radius': value,
    }),
  },
  'animate-border-block-start-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-block-start-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-block-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-block-end-width': value,
      '--jumi-border-block-start-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-bottom-left-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-left-radius': value,
    }),
  },
  'animate-border-bottom-length': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        'animation-name': 'jumi-border-bottom-length',
        'background-color': 'var(--jumi-border-color, currentColor)',
        'bottom': '0',
        'content': '""',
        'height': value,
        'position': 'absolute',
        'right': '0',
        'width': '0%',
      },
      'position': 'relative',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-bottom-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-left-radius': value,
      '--jumi-border-bottom-right-radius': value,
    }),
  },
  'animate-border-bottom-right-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-right-radius': value,
    }),
  },
  'animate-border-bottom-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-bottom-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-color': {
    key: 'borderColor',
    property: value => ({
      '--jumi-border-color': value,
    }),
  },
  'animate-border-end-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-end-radius': value,
    }),
  },
  'animate-border-end-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-start-radius': value,
    }),
  },
  'animate-border-inline-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-end-radius': value,
      '--jumi-border-start-end-radius': value,
    }),
  },
  'animate-border-inline-end-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-inline-end-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-inline-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-start-radius': value,
      '--jumi-border-start-start-radius': value,
    }),
  },
  'animate-border-inline-start-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-inline-start-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-inline-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-inline-end-width': value,
      '--jumi-border-inline-start-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-left-length': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        'animation-name': 'jumi-border-left-length',
        'background-color': 'var(--jumi-border-color, currentColor)',
        'bottom': '0',
        'content': '""',
        'height': '0%',
        'left': '0',
        'position': 'absolute',
        'width': value,
      },
      'position': 'relative',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-left-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-left-radius': value,
      '--jumi-border-top-left-radius': value,
    }),
  },
  'animate-border-left-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-left-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-length': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        'animation-name': 'jumi-border-length',
        'background-color': 'var(--jumi-border-color, currentColor)',
        'content': '""',
        'height': value,
        'inset': '0',
        'position': 'absolute',
        'width': value,
      },
      'position': 'relative',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-radius': value,
    }),
  },
  'animate-border-right-length': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        'animation-name': 'jumi-border-right-length',
        'background-color': 'var(--jumi-border-color, currentColor)',
        'content': '""',
        'height': '0%',
        'position': 'absolute',
        'right': '0',
        'top': '0',
        'width': value,
      },
      'position': 'relative',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-right-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-right-radius': value,
      '--jumi-border-top-right-radius': value,
    }),
  },
  'animate-border-right-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-right-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-start-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-start-end-radius': value,
    }),
  },
  'animate-border-start-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-start-start-radius': value,
    }),
  },
  'animate-border-top-left-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-top-left-radius': value,
    }),
  },
  'animate-border-top-length': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        'animation-name': 'jumi-border-top-length',
        'background-color': 'var(--jumi-border-color, currentColor)',
        'content': '""',
        'height': value,
        'left': '0',
        'position': 'absolute',
        'top': '0',
        'width': '0%',
      },
      'position': 'relative',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-top-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-top-left-radius': value,
      '--jumi-border-top-right-radius': value,
    }),
  },
  'animate-border-top-right-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-top-right-radius': value,
    }),
  },
  'animate-border-top-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-top-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-width': value,
    }),
    type: ['line-width', 'length'],
  },
  'animate-bottom': {
    key: 'inset',
    property: value => ({
      '--jumi-bottom': value,
    }),
  },
  'animate-box-shadow': {
    key: 'boxShadow',
    property: value => ({
      '--jumi-box-shadow': value,
    }),
  },
  'animate-color': {
    key: 'colors',
    property: value => ({
      '--jumi-color': value,
    }),
  },
  'animate-composition': {
    property: value => ({
      '--jumi-animation-composition': value,
    }),
    values: animationComposition,
  },
  'animate-delay': {
    property: value => ({
      '--jumi-animation-delay': value,
    }),
    values: animationDelay,
  },
  'animate-direction': {
    property: value => ({
      '--jumi-animation-direction': value,
    }),
    values: animationDuration,
  },
  'animate-display': {
    property: value => ({
      '--jumi-display': value,
    }),
    values: display,
  },
  'animate-duration': {
    property: value => ({
      '--jumi-animation-duration': value,
    }),
    values: animationDuration,
  },
  'animate-fill': {
    key: 'colors',
    property: value => ({
      '--jumi-fill': value,
    }),
  },
  'animate-fill-mode': {
    property: value => ({
      '--jumi-animation-fill-mode': value,
    }),
    values: animationFillMode,
  },
  'animate-filter': {
    property: value => ({
      '--jumi-filter': value,
    }),
    values: empty.none,
  },
  'animate-flex': {
    key: 'flex',
    property: value => ({
      '--jumi-flex': value,
    }),
  },
  'animate-flex-basis': {
    key: 'flexBasis',
    property: value => ({
      '--jumi-flex-basis': value,
    }),
  },
  'animate-flex-direction': {
    property: value => ({
      '--jumi-flex-direction': value,
    }),
    values: flexDirection,
  },
  'animate-flex-grow': {
    key: 'flexGrow',
    property: value => ({
      '--jumi-flex-grow': value,
    }),
  },
  'animate-flex-shrink': {
    key: 'flexShrink',
    property: value => ({
      '--jumi-flex-shrink': value,
    }),
  },
  'animate-font-family': {
    key: 'fontFamily',
    property: value => ({
      '--jumi-font-family': value,
    }),
  },
  'animate-font-size': {
    key: 'fontSize',
    property: value => ({
      '--jumi-font-size': value,
    }),
  },
  'animate-font-weight': {
    key: 'fontWeight',
    property: value => ({
      '--jumi-font-weight': value,
    }),
  },
  'animate-gap': {
    key: 'gap',
    property: value => ({
      '--jumi-gap': value,
    }),
  },
  'animate-height': {
    key: 'height',
    property: value => ({
      '--jumi-height': value,
    }),
  },
  'animate-inset': {
    key: 'inset',
    property: value => ({
      '--jumi-inset': value,
    }),
  },
  'animate-iteration-count': {
    property: value => ({
      '--jumi-animation-iteration-count': value,
    }),
    type: 'number',
    values: animationIterationCount,
  },
  'animate-justify-content': {
    property: value => ({
      '--jumi-justify-content': value,
    }),
    values: justifyContent,
  },
  'animate-left': {
    key: 'inset',
    property: value => ({
      '--jumi-left': value,
    }),
  },
  'animate-letter-spacing': {
    key: 'letterSpacing',
    property: value => ({
      '--jumi-letter-spacing': value,
    }),
  },
  'animate-line-height': {
    key: 'lineHeight',
    property: value => ({
      '--jumi-line-height': value,
    }),
  },
  'animate-margin': {
    key: 'margin',
    property: value => ({
      '--jumi-margin': value,
    }),
  },
  'animate-margin-block': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-block': value,
    }),
  },
  'animate-margin-bottom': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-bottom': value,
    }),
  },
  'animate-margin-inline': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-inline': value,
    }),
  },
  'animate-margin-left': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-left': value,
    }),
  },
  'animate-margin-right': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-right': value,
    }),
  },
  'animate-margin-top': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-top': value,
    }),
  },
  'animate-max-height': {
    key: 'maxHeight',
    property: value => ({
      '--jumi-max-height': value,
    }),
  },
  'animate-max-width': {
    key: 'maxWidth',
    property: value => ({
      '--jumi-max-width': value,
    }),
  },
  'animate-min-height': {
    key: 'minHeight',
    property: value => ({
      '--jumi-min-height': value,
    }),
  },
  'animate-min-width': {
    key: 'minWidth',
    property: value => ({
      '--jumi-min-width': value,
    }),
  },
  'animate-opacity': {
    key: 'opacity',
    property: value => ({
      '--jumi-opacity': value,
    }),
  },
  'animate-order': {
    key: 'order',
    property: value => ({
      '--jumi-order': value,
    }),
  },
  'animate-outline': {
    key: 'outlineWidth',
    property: value => ({
      '--jumi-outline-width': value,
    }),
  },
  'animate-outline-color': {
    key: 'colors',
    property: value => ({
      '--jumi-outline-color': value,
    }),
  },
  'animate-outline-offset': {
    key: 'outlineOffset',
    property: value => ({
      '--jumi-outline-offset': value,
    }),
  },
  'animate-overflow': {
    property: value => ({
      '--jumi-overflow': value,
    }),
    values: overflow,
  },
  'animate-overflow-x': {
    property: value => ({
      '--jumi-overflow-x': value,
    }),
    values: overflow,
  },
  'animate-overflow-y': {
    property: value => ({
      '--jumi-overflow-y': value,
    }),
    values: overflow,
  },
  'animate-padding': {
    key: 'padding',
    property: value => ({
      '--jumi-padding': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-block': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-block': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-bottom': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-bottom': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-inline': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-inline': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-left': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-left': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-right': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-right': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-top': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-top': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-play-state': {
    property: value => ({
      '--jumi-animation-play-state': value,
    }),
    values: animationPlayState,
  },
  'animate-position': {
    property: value => ({
      '--jumi-position': value,
    }),
    values: position,
  },
  'animate-range': {
    property: value => ({
      '--jumi-animation-range': value,
    }),
    values: empty.default,
  },
  'animate-range-end': {
    property: value => ({
      '--jumi-animation-range-end': value,
    }),
    type: ['length', 'percentage', 'any'],
    values: empty.default,
  },
  'animate-range-end-length': {
    property: value => ({
      '--jumi-animation-range-end-length': value,
    }),
    type: ['length', 'percentage'],
    values: percentage,
  },
  'animate-range-end-name': {
    property: value => ({
      '--jumi-animation-range-end-name': value,
    }),
    values: animationRange,
  },
  'animate-range-start': {
    property: value => ({
      '--jumi-animation-range-start': value,
    }),
    type: ['length', 'percentage', 'any'],
    values: empty.default,
  },
  'animate-range-start-length': {
    property: value => ({
      '--jumi-animation-range-start-length': value,
    }),
    type: ['length', 'percentage'],
    values: percentage,
  },
  'animate-range-start-name': {
    property: value => ({
      '--jumi-animation-range-start-name': value,
    }),
    values: animationRange,
  },
  'animate-right': {
    key: 'inset',
    property: value => ({
      '--jumi-right': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-rotate': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate': 'rotate(' + value + ')',
      '--jumi-rotate-angle': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-rotate-3d': {
    property: value => ({
      '--jumi-rotate-3d': 'rotate3d(' + value + ')',
    }),
    values: empty.default,
  },
  'animate-rotate-3x': {
    property: value => ({
      '--jumi-rotate-3x': value,
    }),
    type: 'number',
    values: empty.default,
  },
  'animate-rotate-3y': {
    property: value => ({
      '--jumi-rotate-3y': value,
    }),
    type: 'number',
    values: empty.default,
  },
  'animate-rotate-3z': {
    property: value => ({
      '--jumi-rotate-3z': value,
    }),
    type: 'number',
    values: empty.default,
  },
  'animate-rotate-x': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-x': 'rotateX(' + value + ')',
    }),
  },
  'animate-rotate-y': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-y': 'rotateY(' + value + ')',
    }),
  },
  'animate-rotate-z': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-z': 'rotateZ(' + value + ')',
    }),
  },
  'animate-scale': {
    key: 'scale',
    property: value => ({
      '--jumi-scale': 'scale(' + value + ')',
    }),
    supportsNegativeValues: true,
  },
  'animate-scale-3x': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-3x': value,
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-3y': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-3y': value,
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-3z': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-3z': value,
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-x': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-x': 'scaleX(' + value + ')',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-y': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-y': 'scaleY(' + value + ')',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-z': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-z': 'scaleZ(' + value + ')',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-stroke': {
    key: 'colors',
    property: value => ({
      '--jumi-stroke': value,
    }),
  },
  'animate-stroke-width': {
    key: 'strokeWidth',
    property: value => ({
      '--jumi-stroke-width': value,
    }),
  },
  'animate-text-align': {
    property: value => ({
      '--jumi-text-align': value,
    }),
    values: textAlign,
  },
  'animate-text-shadow': {
    property: value => ({
      '--jumi-text-shadow': value,
    }),
    values: textShadow,
  },
  'animate-timeline': {
    property: value => ({
      '--jumi-animation-timeline': value,
    }),
    values: animationTimeline,
  },
  'animate-timeline-axis': {
    property: value => ({
      '--jumi-animation-timeline-axis': value,
    }),
    values: animationTimelineAxis,
  },
  'animate-timeline-inset-end': {
    property: value => ({
      '--jumi-animation-timeline-inset-end': value,
    }),
    type: 'length',
    values: animationTimelineInset,
  },
  'animate-timeline-inset-start': {
    property: value => ({
      '--jumi-animation-timeline-inset-start': value,
    }),
    type: 'length',
    values: animationTimelineInset,
  },
  'animate-timeline-scroller': {
    property: value => ({
      '--jumi-animation-timeline-scroller': value,
    }),
    type: 'length',
    values: animationTimelineScroller,
  },
  'animate-timing-function': {
    property: value => ({
      '--jumi-animation-timing-function': value,
    }),
    values: animationTimingFunction,
  },
  'animate-top': {
    key: 'inset',
    property: value => ({
      '--jumi-top': value,
    }),
  },
  'animate-transform': {
    property: value => ({
      '--jumi-transform': value,
    }),
    values: empty.none,
  },
  'animate-transform-style': {
    property: value => ({
      '--jumi-transform-style': value,
    }),
    values: transformStyle,
  },
  'animate-transition': {
    property: value => ({
      transition: value,
    }),
    values: empty.none,
  },
  'animate-visibility': {
    property: value => ({
      '--jumi-visibility': value,
    }),
    values: visibility,
  },
  'animate-width': {
    key: 'width',
    property: value => ({
      '--jumi-width': value,
    }),
  },
  'animate-z-index': {
    key: 'zIndex',
    property: value => ({
      '--jumi-z-index': value,
    }),
  },
}
