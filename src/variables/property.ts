import type { PropertyType, PropertyVariable } from '@/types'

import {
  animationRange,
  animationRangeEnd,
  animationRangeStart,
} from '@/composition/animation-range'
import { animationTimelineInset, animationTimelineScroll, animationTimelineView } from '@/composition/animation-timeline'
import { aspectRatio } from '@/composition/aspect-ratio'
import { backdropFilter } from '@/composition/backdrop-filter'
import { backdropFilterDropShadow } from '@/composition/backdrop-filter-drop-shadow'
import { background } from '@/composition/background'
import { backgroundPosition, backgroundPositionX, backgroundPositionY } from '@/composition/background-position'
import { backgroundRepeat } from '@/composition/background-repeat'
import { backgroundSize } from '@/composition/background-size'
import { border } from '@/composition/border'
import { borderBlock } from '@/composition/border-block'
import { borderBlockEnd } from '@/composition/border-block-end'
import { borderBlockRadius } from '@/composition/border-block-radius'
import { borderBlockStart } from '@/composition/border-block-start'
import { borderBottom } from '@/composition/border-bottom'
import { borderImage } from '@/composition/border-image'
import { borderImageOutset, borderImageOutsetX, borderImageOutsetY } from '@/composition/border-image-outset'
import { borderImageRepeat } from '@/composition/border-image-repeat'
import { borderInline } from '@/composition/border-inline'
import { borderInlineEnd } from '@/composition/border-inline-end'
import { borderInlineRadius } from '@/composition/border-inline-radius'
import { borderInlineStart } from '@/composition/border-inline-start'
import { borderLeft } from '@/composition/border-left'
import { borderRadius } from '@/composition/border-radius'
import { borderRight } from '@/composition/border-right'
import { borderTop } from '@/composition/border-top'
import { boxShadow, boxShadowInset, boxShadowOutset } from '@/composition/box-shadow'
import { columnRule } from '@/composition/column-rule'
import { columns } from '@/composition/columns'
import { container } from '@/composition/container'
import { filter } from '@/composition/filter'
import { filterDropShadow } from '@/composition/filter-drop-shadow'
import { flex } from '@/composition/flex'
import { flexFlow } from '@/composition/flex-flow'
import { font } from '@/composition/font'
import { fontSynthesis } from '@/composition/font-synthesis'
import { grid } from '@/composition/grid'
import { gridArea } from '@/composition/grid-area'
import { gridColumn } from '@/composition/grid-column'
import { gridRow } from '@/composition/grid-row'
import { gridTemplate } from '@/composition/grid-template'
import { hyphenateLimitChars } from '@/composition/hyphenate-limit-chars'
import { inset } from '@/composition/inset'
import { insetBlock } from '@/composition/inset-block'
import { insetInline } from '@/composition/inset-inline'
import { listStyle } from '@/composition/list-style'
import { margin } from '@/composition/margin'
import { marginBlock } from '@/composition/margin-block'
import { marginInline } from '@/composition/margin-inline'
import { marker } from '@/composition/marker'
import { maskBorderOutset, maskBorderOutsetX, maskBorderOutsetY } from '@/composition/mask-border-outset'
import { maskBorderRepeat } from '@/composition/mask-border-repeat'
import { maskBorderSlice, maskBorderSliceX, maskBorderSliceY } from '@/composition/mask-border-slice'
import { maskPosition } from '@/composition/mask-position'
import { objectPosition, objectPositionX, objectPositionY } from '@/composition/object-position'
import { offsetAnchor, offsetAnchorX, offsetAnchorY } from '@/composition/offset-anchor'
import { offsePosition, offsetPositionX, offsetPositionY } from '@/composition/offset-position'
import { outline } from '@/composition/outline'
import { overflow } from '@/composition/overflow'
import { overscrollBehavior } from '@/composition/overscroll-behavior'
import { padding } from '@/composition/padding'
import { paddingBlock } from '@/composition/padding-block'
import { paddingInline } from '@/composition/padding-inline'
import { positionArea } from '@/composition/position-area'
import { positionTry } from '@/composition/position-try'
import { rotate } from '@/composition/rotate'
import { scale } from '@/composition/scale'
import { scrollTimeline } from '@/composition/scroll-timeline'
import { textShadow } from '@/composition/text-shadow'
import {
  matrix,
  matrix3d,
  perspective,
  rotate3d,
  scale3d,
  skew,
  transform,
  translate3d,
} from '@/composition/transform'
import { transition } from '@/composition/transition'
import { translate } from '@/composition/translate'
import { viewTimeline } from '@/composition/view-timeline'
import { css } from '@/helpers/css'

type DependencyGraph = Record<PropertyType, DependencyNode>
type DependencyNode = {
  dependencies?: Array<PropertyType>
  value?: string
  variable: PropertyVariable
}

export const propertyVariables: DependencyGraph = {
  'accent-color': {
    value: 'auto',
    variable: '--jumi-accent-color',
  },
  'align-content': {
    value: 'normal',
    variable: '--jumi-align-content',
  },
  'align-items': {
    value: 'normal',
    variable: '--jumi-align-items',
  },
  'align-self': {
    value: 'auto',
    variable: '--jumi-align-self',
  },
  'alignment-baseline': {
    value: 'baseline',
    variable: '--jumi-alignment-baseline',
  },
  'all': {
    value: 'initial',
    variable: '--jumi-all',
  },
  'anchor-name': {
    value: 'none',
    variable: '--jumi-anchor-name',
  },
  'animation': {
    dependencies: [
      'animation-composition',
      'animation-delay',
      'animation-direction',
      'animation-duration',
      'animation-fill-mode',
      'animation-iteration-count',
      'animation-play-state',
      'animation-timeline',
      'animation-timing-function',
    ],
    variable: '--jumi-animation',
  },
  'animation-composition': {
    value: 'replace',
    variable: '--jumi-animation-composition',
  },
  'animation-delay': {
    value: '0s',
    variable: '--jumi-animation-delay',
  },
  'animation-direction': {
    value: 'normal',
    variable: '--jumi-animation-direction',
  },
  'animation-duration': {
    value: '1s',
    variable: '--jumi-animation-duration',
  },
  'animation-fill-mode': {
    value: 'forwards',
    variable: '--jumi-animation-fill-mode',
  },
  'animation-iteration-count': {
    value: '1',
    variable: '--jumi-animation-iteration-count',
  },
  'animation-name': {
    value: 'none',
    variable: '--jumi-animation-name',
  },
  'animation-play-state': {
    value: 'running',
    variable: '--jumi-animation-play-state',
  },
  'animation-range': {
    dependencies: ['animation-range-start', 'animation-range-end'],
    value: animationRange,
    variable: '--jumi-animation-range',
  },
  'animation-range-end': {
    dependencies: ['animation-range-end-timeline', 'animation-range-end-offset'],
    value: animationRangeEnd,
    variable: '--jumi-animation-range-end',
  },
  'animation-range-end-offset': {
    value: '100%',
    variable: '--jumi-animation-range-end-offset',
  },
  'animation-range-end-timeline': {
    value: 'normal',
    variable: '--jumi-animation-range-end-timeline',
  },
  'animation-range-start': {
    dependencies: ['animation-range-start-timeline', 'animation-range-start-offset'],
    value: animationRangeStart,
    variable: '--jumi-animation-range-start',
  },
  'animation-range-start-offset': {
    value: '0%',
    variable: '--jumi-animation-range-start-offset',
  },
  'animation-range-start-timeline': {
    value: 'normal',
    variable: '--jumi-animation-range-start-timeline',
  },
  'animation-timeline': {
    dependencies: ['animation-timeline-scroll', 'animation-timeline-view'],
    value: 'auto',
    variable: '--jumi-animation-timeline',
  },
  'animation-timeline-axis': {
    value: 'block',
    variable: '--jumi-animation-timeline-axis',
  },
  'animation-timeline-inset': {
    dependencies: ['animation-timeline-inset-start', 'animation-timeline-inset-end'],
    value: animationTimelineInset,
    variable: '--jumi-animation-timeline-inset',
  },
  'animation-timeline-inset-end': {
    value: 'auto',
    variable: '--jumi-animation-timeline-inset-end',
  },
  'animation-timeline-inset-start': {
    value: 'auto',
    variable: '--jumi-animation-timeline-inset-start',
  },
  'animation-timeline-scroll': {
    dependencies: ['animation-timeline-scroller', 'animation-timeline-axis'],
    value: animationTimelineScroll,
    variable: '--jumi-animation-timeline-scroll',
  },
  'animation-timeline-scroller': {
    value: 'nearest',
    variable: '--jumi-animation-timeline-scroller',
  },
  'animation-timeline-view': {
    dependencies: ['animation-timeline-axis', 'animation-timeline-inset'],
    value: animationTimelineView,
    variable: '--jumi-animation-timeline-view',
  },
  'animation-timing-function': {
    value: 'ease',
    variable: '--jumi-animation-timing-function',
  },
  'appearance': {
    value: 'none',
    variable: '--jumi-appearance',
  },
  'aspect-ratio': {
    dependencies: ['aspect-ratio-width', 'aspect-ratio-height'],
    value: aspectRatio,
    variable: '--jumi-aspect-ratio',
  },
  'aspect-ratio-height': {
    value: 'auto',
    variable: '--jumi-aspect-ratio-height',
  },
  'aspect-ratio-width': {
    value: 'auto',
    variable: '--jumi-aspect-ratio-width',
  },
  'backdrop-filter': {
    dependencies: [
      'backdrop-filter-blur',
      'backdrop-filter-brightness',
      'backdrop-filter-contrast',
      'backdrop-filter-drop-shadow',
      'backdrop-filter-grayscale',
      'backdrop-filter-hue-rotate',
      'backdrop-filter-invert',
      'backdrop-filter-opacity',
      'backdrop-filter-saturate',
      'backdrop-filter-sepia',
    ],
    value: backdropFilter,
    variable: '--jumi-backdrop-filter',
  },
  'backdrop-filter-blur': {
    value: css('blur', '0'),
    variable: '--jumi-backdrop-filter-blur',
  },
  'backdrop-filter-brightness': {
    value: css('brightness', '1'),
    variable: '--jumi-backdrop-filter-brightness',
  },
  'backdrop-filter-contrast': {
    value: css('contrast', '1'),
    variable: '--jumi-backdrop-filter-contrast',
  },
  'backdrop-filter-drop-shadow': {
    dependencies: [
      'backdrop-filter-drop-shadow-offset-x',
      'backdrop-filter-drop-shadow-offset-y',
      'backdrop-filter-drop-shadow-blur',
      'backdrop-filter-drop-shadow-color',
    ],
    value: backdropFilterDropShadow,
    variable: '--jumi-backdrop-filter-drop-shadow',
  },
  'backdrop-filter-drop-shadow-blur': {
    value: '0',
    variable: '--jumi-backdrop-filter-drop-shadow-blur',
  },
  'backdrop-filter-drop-shadow-color': {
    value: 'transparent',
    variable: '--jumi-backdrop-filter-drop-shadow-color',
  },
  'backdrop-filter-drop-shadow-offset-x': {
    value: '0',
    variable: '--jumi-backdrop-filter-drop-shadow-offset-x',
  },
  'backdrop-filter-drop-shadow-offset-y': {
    value: '0',
    variable: '--jumi-backdrop-filter-drop-shadow-offset-y',
  },
  'backdrop-filter-grayscale': {
    value: css('grayscale', '0'),
    variable: '--jumi-backdrop-filter-grayscale',
  },
  'backdrop-filter-hue-rotate': {
    value: css('hue-rotate', '0deg'),
    variable: '--jumi-backdrop-filter-hue-rotate',
  },
  'backdrop-filter-invert': {
    value: css('invert', '0'),
    variable: '--jumi-backdrop-filter-invert',
  },
  'backdrop-filter-opacity': {
    value: css('opacity', '1'),
    variable: '--jumi-backdrop-filter-opacity',
  },
  'backdrop-filter-saturate': {
    value: css('saturate', '1'),
    variable: '--jumi-backdrop-filter-saturate',
  },
  'backdrop-filter-sepia': {
    value: css('sepia', '0'),
    variable: '--jumi-backdrop-filter-sepia',
  },
  'backdrop-filter-url': {
    value: css('url'),
    variable: '--jumi-backdrop-filter-url',
  },
  'backface-visibility': {
    value: 'visible',
    variable: '--jumi-backface-visibility',
  },
  'background': {
    dependencies: [
      'background-attachment',
      'background-clip',
      'background-color',
      'background-image',
      'background-origin',
      'background-position',
      'background-repeat',
      'background-size',
    ],
    value: background,
    variable: '--jumi-background',
  },
  'background-attachment': {
    value: 'scroll',
    variable: '--jumi-background-attachment',
  },
  'background-blend-mode': {
    value: 'normal',
    variable: '--jumi-background-blend-mode',
  },
  'background-clip': {
    value: 'border-box',
    variable: '--jumi-background-clip',
  },
  'background-color': {
    value: 'transparent',
    variable: '--jumi-background-color',
  },
  'background-image': {
    value: 'none',
    variable: '--jumi-background-image',
  },
  'background-origin': {
    value: 'padding-box',
    variable: '--jumi-background-origin',
  },
  'background-position': {
    dependencies: ['background-position-x', 'background-position-y'],
    value: backgroundPosition,
    variable: '--jumi-background-position',
  },
  'background-position-x': {
    dependencies: ['background-position-x-edge', 'background-position-x-offset'],
    value: backgroundPositionX,
    variable: '--jumi-background-position-x',
  },
  'background-position-x-edge': {
    value: 'left',
    variable: '--jumi-background-position-x-edge',
  },
  'background-position-x-offset': {
    value: '0%',
    variable: '--jumi-background-position-x-offset',
  },
  'background-position-y': {
    dependencies: ['background-position-y-edge', 'background-position-y-offset'],
    value: backgroundPositionY,
    variable: '--jumi-background-position-y',
  },
  'background-position-y-edge': {
    value: 'top',
    variable: '--jumi-background-position-y-edge',
  },
  'background-position-y-offset': {
    value: '0%',
    variable: '--jumi-background-position-y-offset',
  },
  'background-repeat': {
    dependencies: ['background-repeat-x', 'background-repeat-y'],
    value: backgroundRepeat,
    variable: '--jumi-background-repeat',
  },
  'background-repeat-x': {
    value: 'repeat',
    variable: '--jumi-background-repeat-x',
  },
  'background-repeat-y': {
    value: 'repeat',
    variable: '--jumi-background-repeat-y',
  },
  'background-size': {
    dependencies: ['background-size-width', 'background-size-height'],
    value: backgroundSize,
    variable: '--jumi-background-size',
  },
  'background-size-height': {
    value: 'auto',
    variable: '--jumi-background-size-height',
  },
  'background-size-width': {
    value: 'auto',
    variable: '--jumi-background-size-width',
  },
  'block-size': {
    value: 'auto',
    variable: '--jumi-block-size',
  },
  'border': {
    dependencies: ['border-width', 'border-style', 'border-color'],
    value: border,
    variable: '--jumi-border',
  },
  'border-block': {
    dependencies: ['border-block-width', 'border-block-style', 'border-block-color'],
    value: borderBlock,
    variable: '--jumi-border-block',
  },
  'border-block-color': {
    value: 'currentColor',
    variable: '--jumi-border-block-color',
  },
  'border-block-end': {
    dependencies: ['border-block-end-width', 'border-block-end-style', 'border-block-end-color'],
    value: borderBlockEnd,
    variable: '--jumi-border-block-end',
  },
  'border-block-end-color': {
    value: 'currentColor',
    variable: '--jumi-border-block-end-color',
  },
  'border-block-end-radius': {
    value: '0',
    variable: '--jumi-border-block-end-radius',
  },
  'border-block-end-style': {
    value: 'none',
    variable: '--jumi-border-block-end-style',
  },
  'border-block-end-width': {
    value: 'medium',
    variable: '--jumi-border-block-end-width',
  },
  'border-block-radius': {
    dependencies: ['border-block-start-radius', 'border-block-end-radius'],
    value: borderBlockRadius,
    variable: '--jumi-border-block-radius',
  },
  'border-block-start': {
    dependencies: ['border-block-start-width', 'border-block-start-style', 'border-block-start-color'],
    value: borderBlockStart,
    variable: '--jumi-border-block-start',
  },
  'border-block-start-color': {
    value: 'currentColor',
    variable: '--jumi-border-block-start-color',
  },
  'border-block-start-radius': {
    value: '0',
    variable: '--jumi-border-block-start-radius',
  },
  'border-block-start-style': {
    value: 'none',
    variable: '--jumi-border-block-start-style',
  },
  'border-block-start-width': {
    value: 'medium',
    variable: '--jumi-border-block-start-width',
  },
  'border-block-style': {
    value: 'none',
    variable: '--jumi-border-block-style',
  },
  'border-block-width': {
    value: 'medium',
    variable: '--jumi-border-block-width',
  },
  'border-bottom': {
    dependencies: ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
    value: borderBottom,
    variable: '--jumi-border-bottom',
  },
  'border-bottom-color': {
    value: 'currentColor',
    variable: '--jumi-border-bottom-color',
  },
  'border-bottom-left-radius': {
    value: '0',
    variable: '--jumi-border-bottom-left-radius',
  },
  'border-bottom-radius': {
    value: '0',
    variable: '--jumi-border-bottom-radius',
  },
  'border-bottom-right-radius': {
    value: '0',
    variable: '--jumi-border-bottom-right-radius',
  },
  'border-bottom-style': {
    value: 'none',
    variable: '--jumi-border-bottom-style',
  },
  'border-bottom-width': {
    value: 'medium',
    variable: '--jumi-border-bottom-width',
  },
  'border-collapse': {
    value: 'separate',
    variable: '--jumi-border-collapse',
  },
  'border-color': {
    value: 'currentColor',
    variable: '--jumi-border-color',
  },
  'border-end-end-radius': {
    value: '0',
    variable: '--jumi-border-end-end-radius',
  },
  'border-end-start-radius': {
    value: '0',
    variable: '--jumi-border-end-start-radius',
  },
  'border-image': {
    dependencies: [
      'border-image-outset',
      'border-image-repeat',
      'border-image-slice',
      'border-image-source',
      'border-image-width',
    ],
    value: borderImage,
    variable: '--jumi-border-image',
  },
  'border-image-outset': {
    dependencies: [
      'border-image-outset-top',
      'border-image-outset-right',
      'border-image-outset-bottom',
      'border-image-outset-left',
    ],
    value: borderImageOutset,
    variable: '--jumi-border-image-outset',
  },
  'border-image-outset-bottom': {
    value: '0',
    variable: '--jumi-border-image-outset-bottom',
  },
  'border-image-outset-left': {
    value: '0',
    variable: '--jumi-border-image-outset-left',
  },
  'border-image-outset-right': {
    value: '0',
    variable: '--jumi-border-image-outset-right',
  },
  'border-image-outset-top': {
    value: '0',
    variable: '--jumi-border-image-outset-top',
  },
  'border-image-outset-x': {
    dependencies: ['border-image-outset-left', 'border-image-outset-right'],
    value: borderImageOutsetX,
    variable: '--jumi-border-image-outset-x',
  },
  'border-image-outset-y': {
    dependencies: ['border-image-outset-top', 'border-image-outset-bottom'],
    value: borderImageOutsetY,
    variable: '--jumi-border-image-outset-y',
  },
  'border-image-repeat': {
    dependencies: ['border-image-repeat-x', 'border-image-repeat-y'],
    value: borderImageRepeat,
    variable: '--jumi-border-image-repeat',
  },
  'border-image-repeat-x': {
    value: 'stretch',
    variable: '--jumi-border-image-repeat-x',
  },
  'border-image-repeat-y': {
    value: 'stretch',
    variable: '--jumi-border-image-repeat-y',
  },
  'border-image-slice': {
    value: '100%',
    variable: '--jumi-border-image-slice',
  },
  'border-image-source': {
    value: 'none',
    variable: '--jumi-border-image-source',
  },
  'border-image-width': {
    value: '1',
    variable: '--jumi-border-image-width',
  },
  'border-inline': {
    dependencies: ['border-inline-width', 'border-inline-style', 'border-inline-color'],
    value: borderInline,
    variable: '--jumi-border-inline',
  },
  'border-inline-color': {
    value: 'currentColor',
    variable: '--jumi-border-inline-color',
  },
  'border-inline-end': {
    dependencies: ['border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color'],
    value: borderInlineEnd,
    variable: '--jumi-border-inline-end',
  },
  'border-inline-end-color': {
    value: 'currentColor',
    variable: '--jumi-border-inline-end-color',
  },
  'border-inline-end-radius': {
    value: '0',
    variable: '--jumi-border-inline-end-radius',
  },
  'border-inline-end-style': {
    value: 'none',
    variable: '--jumi-border-inline-end-style',
  },
  'border-inline-end-width': {
    value: 'medium',
    variable: '--jumi-border-inline-end-width',
  },
  'border-inline-radius': {
    dependencies: ['border-inline-start-radius', 'border-inline-end-radius'],
    value: borderInlineRadius,
    variable: '--jumi-border-inline-radius',
  },
  'border-inline-start': {
    dependencies: ['border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color'],
    value: borderInlineStart,
    variable: '--jumi-border-inline-start',
  },
  'border-inline-start-color': {
    value: 'currentColor',
    variable: '--jumi-border-inline-start-color',
  },
  'border-inline-start-radius': {
    value: '0',
    variable: '--jumi-border-inline-start-radius',
  },
  'border-inline-start-style': {
    value: 'none',
    variable: '--jumi-border-inline-start-style',
  },
  'border-inline-start-width': {
    value: 'medium',
    variable: '--jumi-border-inline-start-width',
  },
  'border-inline-style': {
    value: 'none',
    variable: '--jumi-border-inline-style',
  },
  'border-inline-width': {
    value: 'medium',
    variable: '--jumi-border-inline-width',
  },
  'border-left': {
    dependencies: ['border-left-width', 'border-left-style', 'border-left-color'],
    value: borderLeft,
    variable: '--jumi-border-left',
  },
  'border-left-color': {
    value: 'currentColor',
    variable: '--jumi-border-left-color',
  },
  'border-left-radius': {
    value: '0',
    variable: '--jumi-border-left-radius',
  },
  'border-left-style': {
    value: 'none',
    variable: '--jumi-border-left-style',
  },
  'border-left-width': {
    value: 'medium',
    variable: '--jumi-border-left-width',
  },
  'border-radius': {
    dependencies: [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ],
    value: borderRadius,
    variable: '--jumi-border-radius',
  },
  'border-right': {
    dependencies: ['border-right-width', 'border-right-style', 'border-right-color'],
    value: borderRight,
    variable: '--jumi-border-right',
  },
  'border-right-color': {
    value: 'currentColor',
    variable: '--jumi-border-right-color',
  },
  'border-right-radius': {
    value: '0',
    variable: '--jumi-border-right-radius',
  },
  'border-right-style': {
    value: 'none',
    variable: '--jumi-border-right-style',
  },
  'border-right-width': {
    value: 'medium',
    variable: '--jumi-border-right-width',
  },
  'border-spacing': {
    value: '0',
    variable: '--jumi-border-spacing',
  },
  'border-start-end-radius': {
    value: '0',
    variable: '--jumi-border-start-end-radius',
  },
  'border-start-start-radius': {
    value: '0',
    variable: '--jumi-border-start-start-radius',
  },
  'border-style': {
    value: 'none',
    variable: '--jumi-border-style',
  },
  'border-top': {
    dependencies: ['border-top-width', 'border-top-style', 'border-top-color'],
    value: borderTop,
    variable: '--jumi-border-top',
  },
  'border-top-color': {
    value: 'currentColor',
    variable: '--jumi-border-top-color',
  },
  'border-top-left-radius': {
    value: '0',
    variable: '--jumi-border-top-left-radius',
  },
  'border-top-radius': {
    value: '0',
    variable: '--jumi-border-top-radius',
  },
  'border-top-right-radius': {
    value: '0',
    variable: '--jumi-border-top-right-radius',
  },
  'border-top-style': {
    value: 'none',
    variable: '--jumi-border-top-style',
  },
  'border-top-width': {
    value: 'medium',
    variable: '--jumi-border-top-width',
  },
  'border-width': {
    value: 'medium',
    variable: '--jumi-border-width',
  },
  'bottom': {
    value: 'auto',
    variable: '--jumi-bottom',
  },
  'box-decoration-break': {
    value: 'slice',
    variable: '--jumi-box-decoration-break',
  },
  'box-shadow': {
    dependencies: ['box-shadow-inset', 'box-shadow-outset'],
    value: boxShadow,
    variable: '--jumi-box-shadow',
  },
  'box-shadow-blur': {
    value: '0',
    variable: '--jumi-box-shadow-blur',
  },
  'box-shadow-color': {
    value: 'transparent',
    variable: '--jumi-box-shadow-color',
  },
  'box-shadow-inset': {
    dependencies: [
      'box-shadow-offset-x',
      'box-shadow-offset-y',
      'box-shadow-blur',
      'box-shadow-spread',
      'box-shadow-color',
    ],
    value: boxShadowInset,
    variable: '--jumi-box-shadow-inset',
  },
  'box-shadow-offset-x': {
    value: '0',
    variable: '--jumi-box-shadow-offset-x',
  },
  'box-shadow-offset-y': {
    value: '0',
    variable: '--jumi-box-shadow-offset-y',
  },
  'box-shadow-outset': {
    dependencies: [
      'box-shadow-offset-x',
      'box-shadow-offset-y',
      'box-shadow-blur',
      'box-shadow-spread',
      'box-shadow-color',
    ],
    value: boxShadowOutset,
    variable: '--jumi-box-shadow-outset',
  },
  'box-shadow-spread': {
    value: '0',
    variable: '--jumi-box-shadow-spread',
  },
  'box-sizing': {
    value: 'content-box',
    variable: '--jumi-box-sizing',
  },
  'break-after': {
    value: 'auto',
    variable: '--jumi-break-after',
  },
  'break-before': {
    value: 'auto',
    variable: '--jumi-break-before',
  },
  'break-inside': {
    value: 'auto',
    variable: '--jumi-break-inside',
  },
  'caption-side': {
    value: 'top',
    variable: '--jumi-caption-side',
  },
  'caret-color': {
    value: 'auto',
    variable: '--jumi-caret-color',
  },
  'clear': {
    value: 'none',
    variable: '--jumi-clear',
  },
  'clip-path': {
    value: 'none',
    variable: '--jumi-clip-path',
  },
  'clip-rule': {
    value: 'nonzero',
    variable: '--jumi-clip-rule',
  },
  'color': {
    value: 'canvastext',
    variable: '--jumi-color',
  },
  'color-interpolation': {
    value: 'auto',
    variable: '--jumi-color-interpolation',
  },
  'color-interpolation-filters': {
    value: 'linearRGB',
    variable: '--jumi-color-interpolation-filters',
  },
  'color-scheme': {
    value: 'normal',
    variable: '--jumi-color-scheme',
  },
  'column-count': {
    value: 'auto',
    variable: '--jumi-column-count',
  },
  'column-fill': {
    value: 'balance',
    variable: '--jumi-column-fill',
  },
  'column-gap': {
    value: 'normal',
    variable: '--jumi-column-gap',
  },
  'column-rule': {
    dependencies: ['column-rule-width', 'column-rule-style', 'column-rule-color'],
    value: columnRule,
    variable: '--jumi-column-rule',
  },
  'column-rule-color': {
    value: 'medium',
    variable: '--jumi-column-rule-color',
  },
  'column-rule-style': {
    value: 'none',
    variable: '--jumi-column-rule-style',
  },
  'column-rule-width': {
    value: 'currentColor',
    variable: '--jumi-column-rule-width',
  },
  'column-span': {
    value: 'none',
    variable: '--jumi-column-span',
  },
  'column-width': {
    value: 'auto',
    variable: '--jumi-column-width',
  },
  'columns': {
    dependencies: ['column-width', 'column-count'],
    value: columns,
    variable: '--jumi-columns',
  },
  'contain': {
    value: 'none',
    variable: '--jumi-contain',
  },
  'contain-intrinsic-block-size': {
    value: 'none',
    variable: '--jumi-contain-intrinsic-block-size',
  },
  'contain-intrinsic-height': {
    value: 'none',
    variable: '--jumi-contain-intrinsic-height',
  },
  'contain-intrinsic-inline-size': {
    value: 'none',
    variable: '--jumi-contain-intrinsic-inline-size',
  },
  'contain-intrinsic-size': {
    value: 'none',
    variable: '--jumi-contain-intrinsic-size',
  },
  'contain-intrinsic-width': {
    value: 'none',
    variable: '--jumi-contain-intrinsic-width',
  },
  'container': {
    dependencies: ['container-type', 'container-name'],
    value: container,
    variable: '--jumi-container',
  },
  'container-name': {
    value: 'none',
    variable: '--jumi-container-name',
  },
  'container-type': {
    value: 'normal',
    variable: '--jumi-container-type',
  },
  'content': {
    value: 'normal',
    variable: '--jumi-content',
  },
  'content-visibility': {
    value: 'visible',
    variable: '--jumi-content-visibility',
  },
  'counter-increment': {
    value: 'none',
    variable: '--jumi-counter-increment',
  },
  'counter-reset': {
    value: 'none',
    variable: '--jumi-counter-reset',
  },
  'counter-set': {
    value: 'none',
    variable: '--jumi-counter-set',
  },
  'cursor': {
    value: 'auto',
    variable: '--jumi-cursor',
  },
  'cx': {
    value: '0',
    variable: '--jumi-cx',
  },
  'cy': {
    value: '0',
    variable: '--jumi-cy',
  },
  'd': {
    value: 'none',
    variable: '--jumi-d',
  },
  'direction': {
    value: 'ltr',
    variable: '--jumi-direction',
  },
  'display': {
    value: 'inline',
    variable: '--jumi-display',
  },
  'display-inside': {
    value: 'flow',
    variable: '--jumi-display-inside',
  },
  'display-outside': {
    value: 'block',
    variable: '--jumi-display-outside',
  },
  'dominant-baseline': {
    value: 'auto',
    variable: '--jumi-dominant-baseline',
  },
  'empty-cells': {
    value: 'show',
    variable: '--jumi-empty-cells',
  },
  'fill': {
    value: 'black',
    variable: '--jumi-fill',
  },
  'fill-opacity': {
    value: '1',
    variable: '--jumi-fill-opacity',
  },
  'fill-rule': {
    value: 'nonzero',
    variable: '--jumi-fill-rule',
  },
  'filter': {
    dependencies: [
      'filter-blur',
      'filter-brightness',
      'filter-contrast',
      'filter-grayscale',
      'filter-hue-rotate',
      'filter-invert',
      'filter-saturate',
      'filter-sepia',
      'filter-opacity',
      'filter-drop-shadow',
    ],
    value: filter,
    variable: '--jumi-filter',
  },
  'filter-blur': {
    value: css('blur', '0'),
    variable: '--jumi-filter-blur',
  },
  'filter-brightness': {
    value: css('brightness', '1'),
    variable: '--jumi-filter-brightness',
  },
  'filter-contrast': {
    value: css('contrast', '1'),
    variable: '--jumi-filter-contrast',
  },
  'filter-drop-shadow': {
    dependencies: [
      'filter-drop-shadow-offset-x',
      'filter-drop-shadow-offset-y',
      'filter-drop-shadow-blur',
      'filter-drop-shadow-color',
    ],
    value: filterDropShadow,
    variable: '--jumi-filter-drop-shadow',
  },
  'filter-drop-shadow-blur': {
    value: '0',
    variable: '--jumi-filter-drop-shadow-blur',
  },
  'filter-drop-shadow-color': {
    value: 'transparent',
    variable: '--jumi-filter-drop-shadow-color',
  },
  'filter-drop-shadow-offset-x': {
    value: '0',
    variable: '--jumi-filter-drop-shadow-offset-x',
  },
  'filter-drop-shadow-offset-y': {
    value: '0',
    variable: '--jumi-filter-drop-shadow-offset-y',
  },
  'filter-grayscale': {
    value: css('grayscale', '0'),
    variable: '--jumi-filter-grayscale',
  },
  'filter-hue-rotate': {
    value: css('hue-rotate', '0deg'),
    variable: '--jumi-filter-hue-rotate',
  },
  'filter-invert': {
    value: css('invert', '0'),
    variable: '--jumi-filter-invert',
  },
  'filter-opacity': {
    value: css('opacity', '1'),
    variable: '--jumi-filter-opacity',
  },
  'filter-saturate': {
    value: css('saturate', '1'),
    variable: '--jumi-filter-saturate',
  },
  'filter-sepia': {
    value: css('sepia', '0'),
    variable: '--jumi-filter-sepia',
  },
  'filter-url': {
    value: css('url'),
    variable: '--jumi-filter-url',
  },
  'flex': {
    dependencies: ['flex-grow', 'flex-shrink', 'flex-basis'],
    value: flex,
    variable: '--jumi-flex',
  },
  'flex-basis': {
    value: 'auto',
    variable: '--jumi-flex-basis',
  },
  'flex-direction': {
    value: 'row',
    variable: '--jumi-flex-direction',
  },
  'flex-flow': {
    dependencies: ['flex-direction', 'flex-wrap'],
    value: flexFlow,
    variable: '--jumi-flex-flow',
  },
  'flex-grow': {
    value: '0',
    variable: '--jumi-flex-grow',
  },
  'flex-shrink': {
    value: '1',
    variable: '--jumi-flex-shrink',
  },
  'flex-wrap': {
    value: 'nowrap',
    variable: '--jumi-flex-wrap',
  },
  'float': {
    value: 'none',
    variable: '--jumi-float',
  },
  'flood-color': {
    value: 'black',
    variable: '--jumi-flood-color',
  },
  'flood-opacity': {
    value: '1',
    variable: '--jumi-flood-opacity',
  },
  'font': {
    dependencies: [
      'font-family',
      'font-size',
      'font-style',
      'font-variant',
      'font-weight',
      'line-height',
    ],
    value: font,
    variable: '--jumi-font',
  },
  'font-family': {
    value: 'inherit',
    variable: '--jumi-font-family',
  },
  'font-feature-settings': {
    value: 'normal',
    variable: '--jumi-font-feature-settings',
  },
  'font-kerning': {
    value: 'auto',
    variable: '--jumi-font-kerning',
  },
  'font-language-override': {
    value: 'normal',
    variable: '--jumi-font-language-override',
  },
  'font-optical-sizing': {
    value: 'auto',
    variable: '--jumi-font-optical-sizing',
  },
  'font-palette': {
    value: 'normal',
    variable: '--jumi-font-palette',
  },
  'font-size': {
    value: 'medium',
    variable: '--jumi-font-size',
  },
  'font-size-adjust': {
    value: 'none',
    variable: '--jumi-font-size-adjust',
  },
  'font-smooth': {
    value: 'auto',
    variable: '--jumi-font-smooth',
  },
  'font-style': {
    value: 'normal',
    variable: '--jumi-font-style',
  },
  'font-synthesis': {
    value: fontSynthesis,
    variable: '--jumi-font-synthesis',
  },
  'font-synthesis-small-caps': {
    value: 'auto',
    variable: '--jumi-font-synthesis-small-caps',
  },
  'font-synthesis-style': {
    value: 'auto',
    variable: '--jumi-font-synthesis-style',
  },
  'font-synthesis-weight': {
    value: 'auto',
    variable: '--jumi-font-synthesis-weight',
  },
  'font-variant': {
    value: 'normal',
    variable: '--jumi-font-variant',
  },
  'font-variant-alternates': {
    value: 'normal',
    variable: '--jumi-font-variant-alternates',
  },
  'font-variant-caps': {
    value: 'normal',
    variable: '--jumi-font-variant-caps',
  },
  'font-variant-east-asian': {
    value: 'normal',
    variable: '--jumi-font-variant-east-asian',
  },
  'font-variant-emoji': {
    value: 'normal',
    variable: '--jumi-font-variant-emoji',
  },
  'font-variant-ligatures': {
    value: 'normal',
    variable: '--jumi-font-variant-ligatures',
  },
  'font-variant-numeric': {
    value: 'normal',
    variable: '--jumi-font-variant-numeric',
  },
  'font-variant-position': {
    value: 'normal',
    variable: '--jumi-font-variant-position',
  },
  'font-variation-settings': {
    value: 'normal',
    variable: '--jumi-font-variation-settings',
  },
  'font-weight': {
    value: 'normal',
    variable: '--jumi-font-weight',
  },
  'forced-color-adjust': {
    value: 'auto',
    variable: '--jumi-forced-color-adjust',
  },
  'gap': {
    value: '0',
    variable: '--jumi-gap',
  },
  'grid': {
    value: grid,
    variable: '--jumi-grid',
  },
  'grid-area': {
    dependencies: [
      'grid-row-start',
      'grid-column-start',
      'grid-row-end',
      'grid-column-end',
    ],
    value: gridArea,
    variable: '--jumi-grid-area',
  },
  'grid-auto-columns': {
    value: 'auto',
    variable: '--jumi-grid-auto-columns',
  },
  'grid-auto-flow': {
    value: 'row',
    variable: '--jumi-grid-auto-flow',
  },
  'grid-auto-rows': {
    value: 'auto',
    variable: '--jumi-grid-auto-rows',
  },
  'grid-column': {
    dependencies: ['grid-column-start', 'grid-column-end'],
    value: gridColumn,
    variable: '--jumi-grid-column',
  },
  'grid-column-end': {
    value: 'auto',
    variable: '--jumi-grid-column-end',
  },
  'grid-column-start': {
    value: 'auto',
    variable: '--jumi-grid-column-start',
  },
  'grid-row': {
    dependencies: ['grid-row-start', 'grid-row-end'],
    value: gridRow,
    variable: '--jumi-grid-row',
  },
  'grid-row-end': {
    value: 'auto',
    variable: '--jumi-grid-row-end',
  },
  'grid-row-start': {
    value: 'auto',
    variable: '--jumi-grid-row-start',
  },
  'grid-template': {
    dependencies: ['grid-template-areas', 'grid-template-columns', 'grid-template-rows'],
    value: gridTemplate,
    variable: '--jumi-grid-template',
  },
  'grid-template-areas': {
    value: 'none',
    variable: '--jumi-grid-template-areas',
  },
  'grid-template-columns': {
    value: 'none',
    variable: '--jumi-grid-template-columns',
  },
  'grid-template-rows': {
    value: 'none',
    variable: '--jumi-grid-template-rows',
  },
  'hanging-punctuation': {
    value: 'none',
    variable: '--jumi-hanging-punctuation',
  },
  'height': {
    value: 'auto',
    variable: '--jumi-height',
  },
  'hyphenate-character': {
    value: 'auto',
    variable: '--jumi-hyphenate-character',
  },
  'hyphenate-limit-chars': {
    dependencies: [
      'hyphenate-limit-minimum-word-length',
      'hyphenate-limit-minimum-characters-before',
      'hyphenate-limit-minimum-characters-after',
    ],
    value: hyphenateLimitChars,
    variable: '--jumi-hyphenate-limit-chars',
  },
  'hyphenate-limit-minimum-characters-after': {
    value: 'auto',
    variable: '--jumi-hyphenate-limit-minimum-characters-after',
  },
  'hyphenate-limit-minimum-characters-before': {
    value: 'auto',
    variable: '--jumi-hyphenate-limit-minimum-characters-before',
  },
  'hyphenate-limit-minimum-word-length': {
    value: 'auto',
    variable: '--jumi-hyphenate-limit-minimum-word-length',
  },
  'hyphens': {
    value: 'manual',
    variable: '--jumi-hyphens',
  },
  'image-orientation': {
    value: 'from-image',
    variable: '--jumi-image-orientation',
  },
  'image-rendering': {
    value: 'auto',
    variable: '--jumi-image-rendering',
  },
  'initial-letter': {
    value: 'normal',
    variable: '--jumi-initial-letter',
  },
  'inline-size': {
    value: 'auto',
    variable: '--jumi-inline-size',
  },
  'inset': {
    dependencies: ['top', 'right', 'bottom', 'left'],
    value: inset,
    variable: '--jumi-inset',
  },
  'inset-block': {
    dependencies: ['inset-block-start', 'inset-block-end'],
    value: insetBlock,
    variable: '--jumi-inset-block',
  },
  'inset-block-end': {
    value: 'auto',
    variable: '--jumi-inset-block-end',
  },
  'inset-block-start': {
    value: 'auto',
    variable: '--jumi-inset-block-start',
  },
  'inset-inline': {
    dependencies: ['inset-inline-start', 'inset-inline-end'],
    value: insetInline,
    variable: '--jumi-inset-inline',
  },
  'inset-inline-end': {
    value: 'auto',
    variable: '--jumi-inset-inline-end',
  },
  'inset-inline-start': {
    value: 'auto',
    variable: '--jumi-inset-inline-start',
  },
  'isolation': {
    value: 'auto',
    variable: '--jumi-isolation',
  },
  'justify-content': {
    value: 'normal',
    variable: '--jumi-justify-content',
  },
  'justify-items': {
    value: 'legacy',
    variable: '--jumi-justify-items',
  },
  'justify-self': {
    value: 'auto',
    variable: '--jumi-justify-self',
  },
  'left': {
    value: 'auto',
    variable: '--jumi-left',
  },
  'letter-spacing': {
    value: 'normal',
    variable: '--jumi-letter-spacing',
  },
  'lighting-color': {
    value: 'white',
    variable: '--jumi-lighting-color',
  },
  'line-break': {
    value: 'auto',
    variable: '--jumi-line-break',
  },
  'line-clamp': {
    value: 'none',
    variable: '--jumi-line-clamp',
  },
  'line-height': {
    value: 'normal',
    variable: '--jumi-line-height',
  },
  'list-style': {
    dependencies: ['list-style-type', 'list-style-position', 'list-style-image'],
    value: listStyle,
    variable: '--jumi-list-style',
  },
  'list-style-image': {
    value: 'none',
    variable: '--jumi-list-style-image',
  },
  'list-style-position': {
    value: 'outside',
    variable: '--jumi-list-style-position',
  },
  'list-style-type': {
    value: 'disc',
    variable: '--jumi-list-style-type',
  },
  'margin': {
    dependencies: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    value: margin,
    variable: '--jumi-margin',
  },
  'margin-block': {
    dependencies: ['margin-block-start', 'margin-block-end'],
    value: marginBlock,
    variable: '--jumi-margin-block',
  },
  'margin-block-end': {
    value: '0',
    variable: '--jumi-margin-block-end',
  },
  'margin-block-start': {
    value: '0',
    variable: '--jumi-margin-block-start',
  },
  'margin-bottom': {
    value: '0',
    variable: '--jumi-margin-bottom',
  },
  'margin-inline': {
    dependencies: ['margin-inline-start', 'margin-inline-end'],
    value: marginInline,
    variable: '--jumi-margin-inline',
  },
  'margin-inline-end': {
    value: '0',
    variable: '--jumi-margin-inline-end',
  },
  'margin-inline-start': {
    value: '0',
    variable: '--jumi-margin-inline-start',
  },
  'margin-left': {
    value: '0',
    variable: '--jumi-margin-left',
  },
  'margin-right': {
    value: '0',
    variable: '--jumi-margin-right',
  },
  'margin-top': {
    value: '0',
    variable: '--jumi-margin-top',
  },
  'marker': {
    dependencies: ['marker-start', 'marker-mid', 'marker-end'],
    value: marker,
    variable: '--jumi-marker',
  },
  'marker-end': {
    value: 'none',
    variable: '--jumi-marker-end',
  },
  'marker-mid': {
    value: 'none',
    variable: '--jumi-marker-mid',
  },
  'marker-start': {
    value: 'none',
    variable: '--jumi-marker-start',
  },
  'mask': {
    value: 'none',
    variable: '--jumi-mask',
  },
  'mask-border': {
    value: 'none',
    variable: '--jumi-mask-border',
  },
  'mask-border-mode': {
    value: 'alpha',
    variable: '--jumi-mask-border-mode',
  },
  'mask-border-outset': {
    dependencies: [
      'mask-border-outset-top',
      'mask-border-outset-right',
      'mask-border-outset-bottom',
      'mask-border-outset-left',
    ],
    value: maskBorderOutset,
    variable: '--jumi-mask-border-outset',
  },
  'mask-border-outset-bottom': {
    value: '0',
    variable: '--jumi-mask-border-outset-bottom',
  },
  'mask-border-outset-left': {
    value: '0',
    variable: '--jumi-mask-border-outset-left',
  },
  'mask-border-outset-right': {
    value: '0',
    variable: '--jumi-mask-border-outset-right',
  },
  'mask-border-outset-top': {
    value: '0',
    variable: '--jumi-mask-border-outset-top',
  },
  'mask-border-outset-x': {
    dependencies: ['mask-border-outset-left', 'mask-border-outset-right'],
    value: maskBorderOutsetX,
    variable: '--jumi-mask-border-outset-x',
  },
  'mask-border-outset-y': {
    dependencies: ['mask-border-outset-top', 'mask-border-outset-bottom'],
    value: maskBorderOutsetY,
    variable: '--jumi-mask-border-outset-y',
  },
  'mask-border-repeat': {
    dependencies: ['mask-border-repeat-x', 'mask-border-repeat-y'],
    value: maskBorderRepeat,
    variable: '--jumi-mask-border-repeat',
  },
  'mask-border-repeat-x': {
    value: 'stretch',
    variable: '--jumi-mask-border-repeat-x',
  },
  'mask-border-repeat-y': {
    value: 'stretch',
    variable: '--jumi-mask-border-repeat-y',
  },
  'mask-border-slice': {
    dependencies: [
      'mask-border-slice-top',
      'mask-border-slice-right',
      'mask-border-slice-bottom',
      'mask-border-slice-left',
    ],
    value: maskBorderSlice,
    variable: '--jumi-mask-border-slice',
  },
  'mask-border-slice-bottom': {
    value: '0',
    variable: '--jumi-mask-border-slice-bottom',
  },
  'mask-border-slice-left': {
    value: '0',
    variable: '--jumi-mask-border-slice-left',
  },
  'mask-border-slice-right': {
    value: '0',
    variable: '--jumi-mask-border-slice-right',
  },
  'mask-border-slice-top': {
    value: '0',
    variable: '--jumi-mask-border-slice-top',
  },
  'mask-border-slice-x': {
    dependencies: ['mask-border-slice-left', 'mask-border-slice-right'],
    value: maskBorderSliceX,
    variable: '--jumi-mask-border-slice-x',
  },
  'mask-border-slice-y': {
    dependencies: ['mask-border-slice-top', 'mask-border-slice-bottom'],
    value: maskBorderSliceY,
    variable: '--jumi-mask-border-slice-y',
  },
  'mask-border-source': {
    value: 'none',
    variable: '--jumi-mask-border-source',
  },
  'mask-border-width': {
    value: 'auto',
    variable: '--jumi-mask-border-width',
  },
  'mask-clip': {
    value: 'border-box',
    variable: '--jumi-mask-clip',
  },
  'mask-composite': {
    value: 'add',
    variable: '--jumi-mask-composite',
  },
  'mask-image': {
    value: 'none',
    variable: '--jumi-mask-image',
  },
  'mask-mode': {
    value: 'match-source',
    variable: '--jumi-mask-mode',
  },
  'mask-origin': {
    value: 'border-box',
    variable: '--jumi-mask-origin',
  },
  'mask-position': {
    dependencies: ['mask-position-x', 'mask-position-y'],
    value: maskPosition,
    variable: '--jumi-mask-position',
  },
  'mask-position-x': {
    value: '0%',
    variable: '--jumi-mask-position-x',
  },
  'mask-position-y': {
    value: '0%',
    variable: '--jumi-mask-position-y',
  },
  'mask-repeat': {
    value: 'repeat',
    variable: '--jumi-mask-repeat',
  },
  'mask-size': {
    value: 'auto',
    variable: '--jumi-mask-size',
  },
  'mask-type': {
    value: 'luminance',
    variable: '--jumi-mask-type',
  },
  'math-depth': {
    value: '0',
    variable: '--jumi-math-depth',
  },
  'math-depth-add': {
    value: '0',
    variable: '--jumi-math-depth-add',
  },
  'math-style': {
    value: 'normal',
    variable: '--jumi-math-style',
  },
  'matrix': {
    dependencies: [
      'matrix-a',
      'matrix-b',
      'matrix-c',
      'matrix-d',
      'matrix-tx',
      'matrix-ty',
    ],
    value: matrix,
    variable: '--jumi-matrix',
  },
  'matrix-3d': {
    dependencies: [
      'matrix-a1',
      'matrix-b1',
      'matrix-c1',
      'matrix-d1',
      'matrix-a2',
      'matrix-b2',
      'matrix-c2',
      'matrix-d2',
      'matrix-a3',
      'matrix-b3',
      'matrix-c3',
      'matrix-d3',
      'matrix-a4',
      'matrix-b4',
      'matrix-c4',
      'matrix-d4',
    ],
    value: matrix3d,
    variable: '--jumi-matrix-3d',
  },
  'matrix-a': {
    value: '1',
    variable: '--jumi-matrix-a',
  },
  'matrix-a1': {
    value: '1',
    variable: '--jumi-matrix-a1',
  },
  'matrix-a2': {
    value: '0',
    variable: '--jumi-matrix-a2',
  },
  'matrix-a3': {
    value: '0',
    variable: '--jumi-matrix-a3',
  },
  'matrix-a4': {
    value: '0',
    variable: '--jumi-matrix-a4',
  },
  'matrix-b': {
    value: '0',
    variable: '--jumi-matrix-b',
  },
  'matrix-b1': {
    value: '0',
    variable: '--jumi-matrix-b1',
  },
  'matrix-b2': {
    value: '1',
    variable: '--jumi-matrix-b2',
  },
  'matrix-b3': {
    value: '0',
    variable: '--jumi-matrix-b3',
  },
  'matrix-b4': {
    value: '0',
    variable: '--jumi-matrix-b4',
  },
  'matrix-c': {
    value: '0',
    variable: '--jumi-matrix-c',
  },
  'matrix-c1': {
    value: '0',
    variable: '--jumi-matrix-c1',
  },
  'matrix-c2': {
    value: '0',
    variable: '--jumi-matrix-c2',
  },
  'matrix-c3': {
    value: '1',
    variable: '--jumi-matrix-c3',
  },
  'matrix-c4': {
    value: '0',
    variable: '--jumi-matrix-c4',
  },
  'matrix-d': {
    value: '1',
    variable: '--jumi-matrix-d',
  },
  'matrix-d1': {
    value: '0',
    variable: '--jumi-matrix-d1',
  },
  'matrix-d2': {
    value: '0',
    variable: '--jumi-matrix-d2',
  },
  'matrix-d3': {
    value: '0',
    variable: '--jumi-matrix-d3',
  },
  'matrix-d4': {
    value: '1',
    variable: '--jumi-matrix-d4',
  },
  'matrix-tx': {
    value: '0',
    variable: '--jumi-matrix-tx',
  },
  'matrix-ty': {
    value: '0',
    variable: '--jumi-matrix-ty',
  },
  'max-block-size': {
    value: 'none',
    variable: '--jumi-max-block-size',
  },
  'max-height': {
    value: 'none',
    variable: '--jumi-max-height',
  },
  'max-inline-size': {
    value: 'none',
    variable: '--jumi-max-inline-size',
  },
  'max-width': {
    value: 'none',
    variable: '--jumi-max-width',
  },
  'min-block-size': {
    value: '0',
    variable: '--jumi-min-block-size',
  },
  'min-height': {
    value: 'auto',
    variable: '--jumi-min-height',
  },
  'min-inline-size': {
    value: '0',
    variable: '--jumi-min-inline-size',
  },
  'min-width': {
    value: 'auto',
    variable: '--jumi-min-width',
  },
  'mix-blend-mode': {
    value: 'normal',
    variable: '--jumi-mix-blend-mode',
  },
  'object-fit': {
    value: 'fill',
    variable: '--jumi-object-fit',
  },
  'object-position': {
    dependencies: ['object-position-x', 'object-position-y'],
    value: objectPosition,
    variable: '--jumi-object-position',
  },
  'object-position-x': {
    dependencies: ['object-position-x-edge', 'object-position-x-offset'],
    value: objectPositionX,
    variable: '--jumi-object-position-x',
  },
  'object-position-x-edge': {
    value: 'left',
    variable: '--jumi-object-position-x-edge',
  },
  'object-position-x-offset': {
    value: '50%',
    variable: '--jumi-object-position-x-offset',
  },
  'object-position-y': {
    dependencies: ['object-position-y-edge', 'object-position-y-offset'],
    value: objectPositionY,
    variable: '--jumi-object-position-y',
  },
  'object-position-y-edge': {
    value: 'top',
    variable: '--jumi-object-position-y-edge',
  },
  'object-position-y-offset': {
    value: '50%',
    variable: '--jumi-object-position-y-offset',
  },
  'offset': {
    value: 'none',
    variable: '--jumi-offset',
  },
  'offset-anchor': {
    dependencies: ['offset-anchor-x', 'offset-anchor-y'],
    value: offsetAnchor,
    variable: '--jumi-offset-anchor',
  },
  'offset-anchor-x': {
    dependencies: ['offset-anchor-x-edge', 'offset-anchor-x-offset'],
    value: offsetAnchorX,
    variable: '--jumi-offset-anchor-x',
  },
  'offset-anchor-x-edge': {
    value: 'center',
    variable: '--jumi-offset-anchor-x-edge',
  },
  'offset-anchor-x-offset': {
    value: '0',
    variable: '--jumi-offset-anchor-x-offset',
  },
  'offset-anchor-y': {
    dependencies: ['offset-anchor-y-edge', 'offset-anchor-y-offset'],
    value: offsetAnchorY,
    variable: '--jumi-offset-anchor-y',
  },
  'offset-anchor-y-edge': {
    value: 'center',
    variable: '--jumi-offset-anchor-y-edge',
  },
  'offset-anchor-y-offset': {
    value: '0',
    variable: '--jumi-offset-anchor-y-offset',
  },
  'offset-distance': {
    value: '0',
    variable: '--jumi-offset-distance',
  },
  'offset-path': {
    value: 'none',
    variable: '--jumi-offset-path',
  },
  'offset-position': {
    dependencies: ['offset-position-x', 'offset-position-y'],
    value: offsePosition,
    variable: '--jumi-offset-position',
  },
  'offset-position-x': {
    dependencies: ['offset-position-x-edge', 'offset-position-x-offset'],
    value: offsetPositionX,
    variable: '--jumi-offset-position-x',
  },
  'offset-position-x-edge': {
    value: 'left',
    variable: '--jumi-offset-position-x-edge',
  },
  'offset-position-x-offset': {
    value: '50%',
    variable: '--jumi-offset-position-x-offset',
  },
  'offset-position-y': {
    dependencies: ['offset-position-y-edge', 'offset-position-y-offset'],
    value: offsetPositionY,
    variable: '--jumi-offset-position-y',
  },
  'offset-position-y-edge': {
    value: 'top',
    variable: '--jumi-offset-position-y-edge',
  },
  'offset-position-y-offset': {
    value: '50%',
    variable: '--jumi-offset-position-y-offset',
  },
  'offset-rotate': {
    value: 'auto',
    variable: '--jumi-offset-rotate',
  },
  'opacity': {
    value: '1',
    variable: '--jumi-opacity',
  },
  'order': {
    value: '0',
    variable: '--jumi-order',
  },
  'orphans': {
    value: '2',
    variable: '--jumi-orphans',
  },
  'outline': {
    dependencies: ['outline-color', 'outline-style', 'outline-width'],
    value: outline,
    variable: '--jumi-outline',
  },
  'outline-color': {
    value: 'currentColor',
    variable: '--jumi-outline-color',
  },
  'outline-offset': {
    value: '0',
    variable: '--jumi-outline-offset',
  },
  'outline-style': {
    value: 'none',
    variable: '--jumi-outline-style',
  },
  'outline-width': {
    value: 'medium',
    variable: '--jumi-outline-width',
  },
  'overflow': {
    dependencies: ['overflow-x', 'overflow-y'],
    value: overflow,
    variable: '--jumi-overflow',
  },
  'overflow-anchor': {
    value: 'auto',
    variable: '--jumi-overflow-anchor',
  },
  'overflow-block': {
    value: 'auto',
    variable: '--jumi-overflow-block',
  },
  'overflow-clip-margin': {
    value: '0px',
    variable: '--jumi-overflow-clip-margin',
  },
  'overflow-inline': {
    value: 'auto',
    variable: '--jumi-overflow-inline',
  },
  'overflow-wrap': {
    value: 'normal',
    variable: '--jumi-overflow-wrap',
  },
  'overflow-x': {
    value: 'visible',
    variable: '--jumi-overflow-x',
  },
  'overflow-y': {
    value: 'visible',
    variable: '--jumi-overflow-y',
  },
  'overscroll-behavior': {
    dependencies: ['overscroll-behavior-x', 'overscroll-behavior-y'],
    value: overscrollBehavior,
    variable: '--jumi-overscroll-behavior',
  },
  'overscroll-behavior-block': {
    value: 'auto',
    variable: '--jumi-overscroll-behavior-block',
  },
  'overscroll-behavior-inline': {
    value: 'auto',
    variable: '--jumi-overscroll-behavior-inline',
  },
  'overscroll-behavior-x': {
    value: 'auto',
    variable: '--jumi-overscroll-behavior-x',
  },
  'overscroll-behavior-y': {
    value: 'auto',
    variable: '--jumi-overscroll-behavior-y',
  },
  'padding': {
    dependencies: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    value: padding,
    variable: '--jumi-padding',
  },
  'padding-block': {
    dependencies: ['padding-block-start', 'padding-block-end'],
    value: paddingBlock,
    variable: '--jumi-padding-block',
  },
  'padding-block-end': {
    value: '0',
    variable: '--jumi-padding-block-end',
  },
  'padding-block-start': {
    value: '0',
    variable: '--jumi-padding-block-start',
  },
  'padding-bottom': {
    value: '0',
    variable: '--jumi-padding-bottom',
  },
  'padding-inline': {
    dependencies: ['padding-inline-start', 'padding-inline-end'],
    value: paddingInline,
    variable: '--jumi-padding-inline',
  },
  'padding-inline-end': {
    value: '0',
    variable: '--jumi-padding-inline-end',
  },
  'padding-inline-start': {
    value: '0',
    variable: '--jumi-padding-inline-start',
  },
  'padding-left': {
    value: '0',
    variable: '--jumi-padding-left',
  },
  'padding-right': {
    value: '0',
    variable: '--jumi-padding-right',
  },
  'padding-top': {
    value: '0',
    variable: '--jumi-padding-top',
  },
  'page': {
    value: 'auto',
    variable: '--jumi-page',
  },
  'paint-order': {
    value: 'normal',
    variable: '--jumi-paint-order',
  },
  'perspective': {
    value: perspective,
    variable: '--jumi-perspective',
  },
  'perspective-origin': {
    value: 'center',
    variable: '--jumi-perspective-origin',
  },
  'place-content': {
    value: 'normal',
    variable: '--jumi-place-content',
  },
  'place-items': {
    value: 'normal',
    variable: '--jumi-place-items',
  },
  'place-self': {
    value: 'auto',
    variable: '--jumi-place-self',
  },
  'pointer-events': {
    value: 'auto',
    variable: '--jumi-pointer-events',
  },
  'position': {
    value: 'static',
    variable: '--jumi-position',
  },
  'position-anchor': {
    value: 'auto',
    variable: '--jumi-position-anchor',
  },
  'position-area': {
    dependencies: ['position-area-x', 'position-area-y'],
    value: positionArea,
    variable: '--jumi-position-area',
  },
  'position-area-x': {
    value: 'center',
    variable: '--jumi-position-area-x',
  },
  'position-area-y': {
    value: 'center',
    variable: '--jumi-position-area-y',
  },
  'position-try': {
    dependencies: ['position-try-fallbacks', 'position-try-order'],
    value: positionTry,
    variable: '--jumi-position-try',
  },
  'position-try-fallbacks': {
    value: 'none',
    variable: '--jumi-position-try-fallbacks',
  },
  'position-try-order': {
    value: 'normal',
    variable: '--jumi-position-try-order',
  },
  'print-color-adjust': {
    value: 'economy',
    variable: '--jumi-print-color-adjust',
  },
  'quotes': {
    value: 'auto',
    variable: '--jumi-quotes',
  },
  'r': {
    value: '0',
    variable: '--jumi-r',
  },
  'resize': {
    value: 'none',
    variable: '--jumi-resize',
  },
  'right': {
    value: 'auto',
    variable: '--jumi-right',
  },
  'rotate': {
    dependencies: ['rotate-x', 'rotate-y', 'rotate-z', 'rotate-angle'],
    value: rotate,
    variable: '--jumi-rotate',
  },
  'rotate-3d': {
    dependencies: ['rotate-x', 'rotate-y', 'rotate-z', 'rotate-angle'],
    value: rotate3d,
    variable: '--jumi-rotate-3d',
  },
  'rotate-angle': {
    value: '0deg',
    variable: '--jumi-rotate-angle',
  },
  'rotate-x': {
    value: '0',
    variable: '--jumi-rotate-x',
  },
  'rotate-y': {
    value: '0',
    variable: '--jumi-rotate-y',
  },
  'rotate-z': {
    value: '1',
    variable: '--jumi-rotate-z',
  },
  'row-gap': {
    value: '0',
    variable: '--jumi-row-gap',
  },
  'ruby-align': {
    value: 'space-around',
    variable: '--jumi-ruby-align',
  },
  'ruby-overhang': {
    value: 'auto',
    variable: '--jumi-ruby-overhang',
  },
  'ruby-position': {
    value: 'alternate',
    variable: '--jumi-ruby-position',
  },
  'rx': {
    value: '0',
    variable: '--jumi-rx',
  },
  'ry': {
    value: '0',
    variable: '--jumi-ry',
  },
  'scale': {
    dependencies: ['scale-x', 'scale-y', 'scale-z'],
    value: scale,
    variable: '--jumi-scale',
  },
  'scale-3d': {
    dependencies: ['scale-x', 'scale-y', 'scale-z'],
    value: scale3d,
    variable: '--jumi-scale-3d',
  },
  'scale-x': {
    value: '1',
    variable: '--jumi-scale-x',
  },
  'scale-y': {
    value: '1',
    variable: '--jumi-scale-y',
  },
  'scale-z': {
    value: '1',
    variable: '--jumi-scale-z',
  },
  'scroll-behavior': {
    value: 'auto',
    variable: '--jumi-scroll-behavior',
  },
  'scroll-margin': {
    value: '0',
    variable: '--jumi-scroll-margin',
  },
  'scroll-margin-block': {
    value: '0',
    variable: '--jumi-scroll-margin-block',
  },
  'scroll-margin-block-end': {
    value: '0',
    variable: '--jumi-scroll-margin-block-end',
  },
  'scroll-margin-block-start': {
    value: '0',
    variable: '--jumi-scroll-margin-block-start',
  },
  'scroll-margin-bottom': {
    value: '0',
    variable: '--jumi-scroll-margin-bottom',
  },
  'scroll-margin-inline': {
    value: '0',
    variable: '--jumi-scroll-margin-inline',
  },
  'scroll-margin-inline-end': {
    value: '0',
    variable: '--jumi-scroll-margin-inline-end',
  },
  'scroll-margin-inline-start': {
    value: '0',
    variable: '--jumi-scroll-margin-inline-start',
  },
  'scroll-margin-left': {
    value: '0',
    variable: '--jumi-scroll-margin-left',
  },
  'scroll-margin-right': {
    value: '0',
    variable: '--jumi-scroll-margin-right',
  },
  'scroll-margin-top': {
    value: '0',
    variable: '--jumi-scroll-margin-top',
  },
  'scroll-padding': {
    value: '0',
    variable: '--jumi-scroll-padding',
  },
  'scroll-padding-block': {
    value: '0',
    variable: '--jumi-scroll-padding-block',
  },
  'scroll-padding-block-end': {
    value: '0',
    variable: '--jumi-scroll-padding-block-end',
  },
  'scroll-padding-block-start': {
    value: '0',
    variable: '--jumi-scroll-padding-block-start',
  },
  'scroll-padding-bottom': {
    value: '0',
    variable: '--jumi-scroll-padding-bottom',
  },
  'scroll-padding-inline': {
    value: '0',
    variable: '--jumi-scroll-padding-inline',
  },
  'scroll-padding-inline-end': {
    value: '0',
    variable: '--jumi-scroll-padding-inline-end',
  },
  'scroll-padding-inline-start': {
    value: '0',
    variable: '--jumi-scroll-padding-inline-start',
  },
  'scroll-padding-left': {
    value: '0',
    variable: '--jumi-scroll-padding-left',
  },
  'scroll-padding-right': {
    value: '0',
    variable: '--jumi-scroll-padding-right',
  },
  'scroll-padding-top': {
    value: '0',
    variable: '--jumi-scroll-padding-top',
  },
  'scroll-snap-align': {
    value: 'none',
    variable: '--jumi-scroll-snap-align',
  },
  'scroll-snap-stop': {
    value: 'normal',
    variable: '--jumi-scroll-snap-stop',
  },
  'scroll-snap-type': {
    value: 'none',
    variable: '--jumi-scroll-snap-type',
  },
  'scroll-timeline': {
    dependencies: ['scroll-timeline-name', 'scroll-timeline-axis'],
    value: scrollTimeline,
    variable: '--jumi-scroll-timeline',
  },
  'scroll-timeline-axis': {
    value: 'block',
    variable: '--jumi-scroll-timeline-axis',
  },
  'scroll-timeline-name': {
    value: 'none',
    variable: '--jumi-scroll-timeline-name',
  },
  'scrollbar-color': {
    value: 'auto',
    variable: '--jumi-scrollbar-color',
  },
  'scrollbar-gutter': {
    value: 'auto',
    variable: '--jumi-scrollbar-gutter',
  },
  'scrollbar-width': {
    value: 'auto',
    variable: '--jumi-scrollbar-width',
  },
  'shape-image-threshold': {
    value: '0.0',
    variable: '--jumi-shape-image-threshold',
  },
  'shape-margin': {
    value: '0',
    variable: '--jumi-shape-margin',
  },
  'shape-outside': {
    value: 'none',
    variable: '--jumi-shape-outside',
  },
  'shape-rendering': {
    value: 'auto',
    variable: '--jumi-shape-rendering',
  },
  'skew': {
    dependencies: ['skew-x', 'skew-y'],
    value: skew,
    variable: '--jumi-skew',
  },
  'skew-x': {
    value: '0deg',
    variable: '--jumi-skew-x',
  },
  'skew-y': {
    value: '0deg',
    variable: '--jumi-skew-y',
  },
  'stop-color': {
    value: 'black',
    variable: '--jumi-stop-color',
  },
  'stop-opacity': {
    value: '1',
    variable: '--jumi-stop-opacity',
  },
  'stroke': {
    value: 'none',
    variable: '--jumi-stroke',
  },
  'stroke-dasharray': {
    value: 'none',
    variable: '--jumi-stroke-dasharray',
  },
  'stroke-dashoffset': {
    value: '0',
    variable: '--jumi-stroke-dashoffset',
  },
  'stroke-linecap': {
    value: 'butt',
    variable: '--jumi-stroke-linecap',
  },
  'stroke-linejoin': {
    value: 'miter',
    variable: '--jumi-stroke-linejoin',
  },
  'stroke-miterlimit': {
    value: '4',
    variable: '--jumi-stroke-miterlimit',
  },
  'stroke-opacity': {
    value: '1',
    variable: '--jumi-stroke-opacity',
  },
  'stroke-width': {
    value: '1px',
    variable: '--jumi-stroke-width',
  },
  'tab-size': {
    value: '8',
    variable: '--jumi-tab-size',
  },
  'table-layout': {
    value: 'auto',
    variable: '--jumi-table-layout',
  },
  'text-align': {
    value: 'baseline',
    variable: '--jumi-text-align',
  },
  'text-align-last': {
    value: 'auto',
    variable: '--jumi-text-align-last',
  },
  'text-anchor': {
    value: 'start',
    variable: '--jumi-text-anchor',
  },
  'text-autospace': {
    value: 'normal',
    variable: '--jumi-text-autospace',
  },
  'text-box': {
    value: 'normal',
    variable: '--jumi-text-box',
  },
  'text-box-edge': {
    value: 'leading',
    variable: '--jumi-text-box-edge',
  },
  'text-box-trim': {
    value: 'none',
    variable: '--jumi-text-box-trim',
  },
  'text-combine-upright': {
    value: 'none',
    variable: '--jumi-text-combine-upright',
  },
  'text-decoration': {
    value: 'none',
    variable: '--jumi-text-decoration',
  },
  'text-decoration-color': {
    value: 'currentColor',
    variable: '--jumi-text-decoration-color',
  },
  'text-decoration-line': {
    value: 'none',
    variable: '--jumi-text-decoration-line',
  },
  'text-decoration-skip-ink': {
    value: 'auto',
    variable: '--jumi-text-decoration-skip-ink',
  },
  'text-decoration-style': {
    value: 'solid',
    variable: '--jumi-text-decoration-style',
  },
  'text-decoration-thickness': {
    value: 'auto',
    variable: '--jumi-text-decoration-thickness',
  },
  'text-emphasis': {
    value: 'none',
    variable: '--jumi-text-emphasis',
  },
  'text-emphasis-color': {
    value: 'currentColor',
    variable: '--jumi-text-emphasis-color',
  },
  'text-emphasis-position': {
    value: 'over right',
    variable: '--jumi-text-emphasis-position',
  },
  'text-emphasis-style': {
    value: 'none',
    variable: '--jumi-text-emphasis-style',
  },
  'text-indent': {
    value: '0',
    variable: '--jumi-text-indent',
  },
  'text-justify': {
    value: 'auto',
    variable: '--jumi-text-justify',
  },
  'text-orientation': {
    value: 'mixed',
    variable: '--jumi-text-orientation',
  },
  'text-overflow': {
    value: 'clip',
    variable: '--jumi-text-overflow',
  },
  'text-rendering': {
    value: 'auto',
    variable: '--jumi-text-rendering',
  },
  'text-shadow': {
    dependencies: [
      'text-shadow-offset-x',
      'text-shadow-offset-y',
      'text-shadow-blur',
      'text-shadow-color',
    ],
    value: textShadow,
    variable: '--jumi-text-shadow',
  },
  'text-shadow-blur': {
    value: '0',
    variable: '--jumi-text-shadow-blur',
  },
  'text-shadow-color': {
    value: 'currentColor',
    variable: '--jumi-text-shadow-color',
  },
  'text-shadow-offset-x': {
    value: '0px',
    variable: '--jumi-text-shadow-offset-x',
  },
  'text-shadow-offset-y': {
    value: '0px',
    variable: '--jumi-text-shadow-offset-y',
  },
  'text-transform': {
    value: 'none',
    variable: '--jumi-text-transform',
  },
  'text-underline-offset': {
    value: 'auto',
    variable: '--jumi-text-underline-offset',
  },
  'text-underline-position': {
    value: 'auto',
    variable: '--jumi-text-underline-position',
  },
  'text-wrap': {
    value: 'wrap',
    variable: '--jumi-text-wrap',
  },
  'text-wrap-mode': {
    value: 'wrap',
    variable: '--jumi-text-wrap-mode',
  },
  'text-wrap-style': {
    value: 'auto',
    variable: '--jumi-text-wrap-style',
  },
  'timeline-scope': {
    value: 'none',
    variable: '--jumi-timeline-scope',
  },
  'top': {
    value: 'auto',
    variable: '--jumi-top',
  },
  'touch-action': {
    value: 'auto',
    variable: '--jumi-touch-action',
  },
  'transform': {
    dependencies: [
      'perspective',
      'matrix',
      'matrix-3d',
      'rotate-3d',
      'scale-3d',
      'skew',
      'translate-3d',
    ],
    value: transform,
    variable: '--jumi-transform',
  },
  'transform-box': {
    value: 'view-box',
    variable: '--jumi-transform-box',
  },
  'transform-origin': {
    value: 'center',
    variable: '--jumi-transform-origin',
  },
  'transform-origin-x': {
    value: '50%',
    variable: '--jumi-transform-origin-x',
  },
  'transform-origin-y': {
    value: '50%',
    variable: '--jumi-transform-origin-y',
  },
  'transform-origin-z': {
    value: '0px',
    variable: '--jumi-transform-origin-z',
  },
  'transform-style': {
    value: 'flat',
    variable: '--jumi-transform-style',
  },
  'transition': {
    dependencies: [
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
    ],
    value: transition,
    variable: '--jumi-transition',
  },
  'transition-behavior': {
    value: 'normal',
    variable: '--jumi-transition-behavior',
  },
  'transition-delay': {
    value: '0s',
    variable: '--jumi-transition-delay',
  },
  'transition-duration': {
    value: '0s',
    variable: '--jumi-transition-duration',
  },
  'transition-property': {
    value: 'all',
    variable: '--jumi-transition-property',
  },
  'transition-timing-function': {
    value: 'ease',
    variable: '--jumi-transition-timing-function',
  },
  'translate': {
    dependencies: ['translate-x', 'translate-y', 'translate-z'],
    value: translate,
    variable: '--jumi-translate',
  },
  'translate-3d': {
    dependencies: ['translate-x', 'translate-y', 'translate-z'],
    value: translate3d,
    variable: '--jumi-translate-3d',
  },
  'translate-x': {
    value: '0px',
    variable: '--jumi-translate-x',
  },
  'translate-y': {
    value: '0px',
    variable: '--jumi-translate-y',
  },
  'translate-z': {
    value: '0px',
    variable: '--jumi-translate-z',
  },
  'unicode-bidi': {
    value: 'normal',
    variable: '--jumi-unicode-bidi',
  },
  'user-select': {
    value: 'auto',
    variable: '--jumi-user-select',
  },
  'vector-effect': {
    value: 'none',
    variable: '--jumi-vector-effect',
  },
  'vertical-align': {
    value: 'baseline',
    variable: '--jumi-vertical-align',
  },
  'view-timeline': {
    dependencies: ['view-timeline-axis', 'view-timeline-name', 'view-timeline-inset'],
    value: viewTimeline,
    variable: '--jumi-view-timeline',
  },
  'view-timeline-axis': {
    value: 'block',
    variable: '--jumi-view-timeline-axis',
  },
  'view-timeline-inset': {
    value: 'auto',
    variable: '--jumi-view-timeline-inset',
  },
  'view-timeline-name': {
    value: 'none',
    variable: '--jumi-view-timeline-name',
  },
  'view-transition-class': {
    value: 'none',
    variable: '--jumi-view-transition-class',
  },
  'view-transition-name': {
    value: 'none',
    variable: '--jumi-view-transition-name',
  },
  'visibility': {
    value: 'visible',
    variable: '--jumi-visibility',
  },
  'white-space': {
    value: 'normal',
    variable: '--jumi-white-space',
  },
  'white-space-collapse': {
    value: 'collapse',
    variable: '--jumi-white-space-collapse',
  },
  'widows': {
    value: '2',
    variable: '--jumi-widows',
  },
  'width': {
    value: 'auto',
    variable: '--jumi-width',
  },
  'will-change': {
    value: 'auto',
    variable: '--jumi-will-change',
  },
  'word-break': {
    value: 'normal',
    variable: '--jumi-word-break',
  },
  'word-spacing': {
    value: 'normal',
    variable: '--jumi-word-spacing',
  },
  'writing-mode': {
    value: 'horizontal-tb',
    variable: '--jumi-writing-mode',
  },
  'x': {
    value: '0',
    variable: '--jumi-x',
  },
  'y': {
    value: '0',
    variable: '--jumi-y',
  },
  'z-index': {
    value: 'auto',
    variable: '--jumi-z-index',
  },
  'zoom': {
    value: '1',
    variable: '--jumi-zoom',
  },
}
