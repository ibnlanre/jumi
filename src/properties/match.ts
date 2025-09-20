import type { MatchProperty } from '@/types'

import { merge } from '@/helpers/merge'
import { modifiers } from '@/keyframes/property'
import { alignContent } from '@/theme/align-content'
import { alignItems } from '@/theme/align-items'
import { alignSelf } from '@/theme/align-self'
import { alignmentBaseline } from '@/theme/alignment-baseline'
import { all } from '@/theme/all'
import { animationComposition } from '@/theme/animation-composition'
import { animationDelay } from '@/theme/animation-delay'
import { animationDirection } from '@/theme/animation-direction'
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
import { backfaceVisibility } from '@/theme/backface-visibility'
import { backgroundAttachment } from '@/theme/background-attachment'
import { backgroundClip } from '@/theme/background-clip'
import { backgroundOrigin } from '@/theme/background-origin'
import { backgroundPosition } from '@/theme/background-position'
import { backgroundRepeat, backgroundRepeatAxis } from '@/theme/background-repeat'
import { borderCollapse } from '@/theme/border-collapse'
import { borderImageRepeat } from '@/theme/border-image-repeat'
import { boxShadowInset } from '@/theme/box-shadow-inset'
import { clipPathGeometry } from '@/theme/clip-path-geometry'
import { display } from '@/theme/display'
import { empty } from '@/theme/empty'
import { flexDirection } from '@/theme/flex-direction'
import { imageRendering } from '@/theme/image-rendering'
import { justifyContent } from '@/theme/justify-content'
import { mixBlendMode } from '@/theme/mix-blend-mode'
import { overflow } from '@/theme/overflow'
import { percentage } from '@/theme/percentage'
import { position } from '@/theme/position'
import { textAlign } from '@/theme/text-align'
import { textShadow } from '@/theme/text-shadow'
import { transformStyle } from '@/theme/transform-style'
import { visibility } from '@/theme/visibility'

export const matchProperties: Partial<MatchProperty> = {
  'animate': {
    modifiers,
    property: (value, { modifier }) => {
      return {
        'animation-name': value,
        'animation-timeline': modifier ? `view(${modifier})` : 'auto',
      }
    },
    values: animationName,
  },
  'animate-accent-color': {
    key: 'accentColor',
    property: value => ({
      '--jumi-accent-color': value,
    }),
    type: 'color',
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
  'animate-anchor-name': {
    property: value => ({
      'anchor-name': value,
    }),
    type: 'any',
    values: empty.none,
  },
  'animate-appearance': {
    property: value => ({
      '--jumi-appearance': value,
    }),
    values: appearance,
  },
  'animate-aspect-ratio': {
    key: 'aspectRatio',
    property: value => ({
      '--jumi-aspect-ratio': value,
    }),
    type: ['ratio', 'any'],
    values: empty.auto,
  },
  'animate-aspect-ratio-height': {
    property: value => ({
      '--jumi-aspect-ratio-height': value,
    }),
    type: 'ratio',
    values: empty.auto,
  },
  'animate-aspect-ratio-width': {
    property: value => ({
      '--jumi-aspect-ratio-width': value,
    }),
    type: 'ratio',
    values: empty.auto,
  },
  'animate-backdrop-blur': {
    key: 'backdropBlur',
    property: value => ({
      '--jumi-backdrop-blur': 'blur(' + value + ')',
    }),
    type: 'length',
  },
  'animate-backdrop-brightness': {
    key: 'backdropBrightness',
    property: value => ({
      '--jumi-backdrop-brightness': 'brightness(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-contrast': {
    key: 'backdropContrast',
    property: value => ({
      '--jumi-backdrop-contrast': 'contrast(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-drop-shadow': {
    property: value => ({
      '--jumi-backdrop-drop-shadow': 'drop-shadow(' + value + ')',
    }),
    type: 'shadow',
    values: empty.none,
  },
  'animate-backdrop-drop-shadow-blur': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-blur': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-backdrop-drop-shadow-color': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-color': value,
    }),
    type: 'color',
  },
  'animate-backdrop-drop-shadow-offset-x': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-offset-x': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-backdrop-drop-shadow-offset-y': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-offset-y': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-backdrop-drop-shadow-opacity': {
    key: 'opacity',
    property: value => ({
      '--jumi-backdrop-drop-shadow-opacity': value,
    }),
    type: ['number', 'percentage'],
    values: empty.number,
  },
  'animate-backdrop-filter': {
    property: value => ({
      '--jumi-backdrop-filter': value,
    }),
    type: 'any',
    values: empty.none,
  },
  'animate-backdrop-grayscale': {
    key: 'backdropGrayscale',
    property: value => ({
      '--jumi-backdrop-grayscale': 'grayscale(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-hue-rotate': {
    key: 'backdropHueRotate',
    property: value => ({
      '--jumi-backdrop-hue-rotate': 'hue-rotate(' + value + ')',
    }),
    type: 'angle',
  },
  'animate-backdrop-invert': {
    key: 'backdropInvert',
    property: value => ({
      '--jumi-backdrop-invert': 'invert(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-opacity': {
    key: 'backdropOpacity',
    property: value => ({
      '--jumi-backdrop-opacity': 'opacity(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-saturate': {
    key: 'backdropSaturate',
    property: value => ({
      '--jumi-backdrop-saturate': 'saturate(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-sepia': {
    key: 'backdropSepia',
    property: value => ({
      '--jumi-backdrop-sepia': 'sepia(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-url': {
    property: value => ({
      '--jumi-backdrop-url': `url(${value})`,
    }),
    type: 'url',
    values: empty.string,
  },
  'animate-backface-visibility': {
    property: value => ({
      '--jumi-backface-visibility': value,
    }),
    values: backfaceVisibility,
  },
  'animate-background': {
    property: value => ({
      '--jumi-background': value,
    }),
    type: 'any',
    values: empty.none,
  },
  'animate-background-attachment': {
    property: value => ({
      '--jumi-background-attachment': value,
    }),
    values: backgroundAttachment,
  },
  'animate-background-blend-mode': {
    property: value => ({
      '--jumi-background-blend-mode': value,
    }),
    values: mixBlendMode,
  },
  'animate-background-clip': {
    property: value => ({
      '--jumi-background-clip': value,
    }),
    values: backgroundClip,
  },
  'animate-background-color': {
    key: 'backgroundColor',
    property: value => ({
      '--jumi-background-color': value,
    }),
    type: 'color',
  },
  'animate-background-image': {
    key: 'backgroundImage',
    property: value => ({
      '--jumi-background-image': value,
    }),
    type: 'image',
  },
  'animate-background-origin': {
    property: value => ({
      '--jumi-background-origin': value,
    }),
    values: backgroundOrigin,
  },
  'animate-background-position': {
    key: 'backgroundPosition',
    property: value => ({
      '--jumi-background-position': value,
    }),
    type: ['position', 'percentage', 'length', 'any'],
  },
  'animate-background-position-x': {
    property: value => ({
      '--jumi-background-position-x': value,
    }),
    type: ['position', 'percentage', 'length', 'any'],
    values: merge(backgroundPosition, percentage),
  },
  'animate-background-position-x-edge': {
    property: value => ({
      '--jumi-background-position-x-edge': value,
    }),
    values: backgroundPosition,
  },
  'animate-background-position-x-offset': {
    property: value => ({
      '--jumi-background-position-x-offset': value,
    }),
    type: ['percentage', 'length'],
    values: percentage,
  },
  'animate-background-position-y': {
    property: value => ({
      '--jumi-background-position-y': value,
    }),
    type: ['position', 'percentage', 'length', 'any'],
    values: merge(backgroundPosition, percentage),
  },
  'animate-background-position-y-edge': {
    property: value => ({
      '--jumi-background-position-y-edge': value,
    }),
    values: backgroundPosition,
  },
  'animate-background-position-y-offset': {
    property: value => ({
      '--jumi-background-position-y-offset': value,
    }),
    type: ['percentage', 'length'],
    values: percentage,
  },
  'animate-background-repeat': {
    property: value => ({
      '--jumi-background-repeat': value,
    }),
    values: backgroundRepeat,
  },
  'animate-background-repeat-x': {
    property: value => ({
      '--jumi-background-repeat-x': value,
    }),
    values: backgroundRepeatAxis,
  },
  'animate-background-repeat-y': {
    property: value => ({
      '--jumi-background-repeat-y': value,
    }),
    values: backgroundRepeatAxis,
  },
  'animate-background-size': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size': value,
    }),
  },
  'animate-background-size-height': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size-height': value,
    }),
    type: ['length', 'percentage'],
  },
  'animate-background-size-width': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size-width': value,
    }),
    type: ['length', 'percentage'],
  },
  'animate-block-size': {
    property: value => ({
      '--jumi-block-size': value,
    }),
    type: ['length', 'percentage', 'any'],
    values: empty.auto,
  },
  'animate-border': {
    property: value => ({
      '--jumi-border': value,
    }),
    type: ['line-width', 'length'],
    values: empty.none,
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
  'animate-border-collapse': {
    property: value => ({
      '--jumi-border-collapse': value,
    }),
    values: borderCollapse,
  },
  'animate-border-color': {
    key: 'borderColor',
    property: value => ({
      '--jumi-border-color': value,
    }),
    type: 'color',
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
  'animate-border-image': {
    property: value => ({
      '--jumi-border-image': value,
    }),
    type: 'any',
  },
  'animate-border-image-outset': {
    property: value => ({
      '--jumi-border-image-outset': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-bottom': {
    property: value => ({
      '--jumi-border-image-outset-bottom': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-left': {
    property: value => ({
      '--jumi-border-image-outset-left': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-right': {
    property: value => ({
      '--jumi-border-image-outset-right': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-top': {
    property: value => ({
      '--jumi-border-image-outset-top': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-x': {
    property: value => ({
      '--jumi-border-image-outset-left': value,
      '--jumi-border-image-outset-right': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-y': {
    property: value => ({
      '--jumi-border-image-outset-bottom': value,
      '--jumi-border-image-outset-top': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-repeat': {
    property: value => ({
      '--jumi-border-image-repeat': value,
    }),
    values: borderImageRepeat,
  },
  'animate-border-image-repeat-x': {
    property: value => ({
      '--jumi-border-image-repeat-x': value,
    }),
    values: borderImageRepeat,
  },
  'animate-border-image-repeat-y': {
    property: value => ({
      '--jumi-border-image-repeat-y': value,
    }),
    values: borderImageRepeat,
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
  'animate-border-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-radius': value,
    }),
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
  'animate-box-shadow-blur': {
    property: value => ({
      '--jumi-box-shadow-blur': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-box-shadow-color': {
    key: 'boxShadowColor',
    property: value => ({
      '--jumi-box-shadow-color': value,
    }),
    type: 'color',
  },
  'animate-box-shadow-inset': {
    property: value => ({
      '--jumi-box-shadow-inset': value,
    }),
    values: boxShadowInset,
  },
  'animate-box-shadow-offset-x': {
    property: value => ({
      '--jumi-box-shadow-offset-x': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-box-shadow-offset-y': {
    property: value => ({
      '--jumi-box-shadow-offset-y': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-box-shadow-spread': {
    property: value => ({
      '--jumi-box-shadow-spread': value,
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-clip-path-geometry': {
    property: value => ({
      '--jumi-clip-path-geometry': value,
      '--jumi-clip-path-geometry-keyframes': 'jumi-clip-path-geometry',
    }),
    values: clipPathGeometry,
  },
  'animate-color': {
    key: 'colors',
    property: value => ({
      '--jumi-color': value,
    }),
    type: 'color',
  },
  'animate-column-gap': {
    property: value => ({
      '--jumi-column-gap': value,
    }),
    values: empty.number,
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
    values: animationDirection,
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
      '--jumi-filter-filter': value,
    }),
    type: 'any',
    values: empty.none,
  },
  'animate-filter-blur': {
    key: 'backdropBlur',
    property: value => ({
      '--jumi-filter-blur': 'blur(' + value + ')',
    }),
    type: 'length',
  },
  'animate-filter-brightness': {
    key: 'backdropBrightness',
    property: value => ({
      '--jumi-filter-brightness': 'brightness(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-contrast': {
    key: 'backdropContrast',
    property: value => ({
      '--jumi-filter-contrast': 'contrast(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-grayscale': {
    key: 'backdropGrayscale',
    property: value => ({
      '--jumi-filter-grayscale': 'grayscale(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-hue-rotate': {
    key: 'backdropHueRotate',
    property: value => ({
      '--jumi-filter-hue-rotate': 'hue-rotate(' + value + ')',
    }),
    type: 'angle',
  },
  'animate-filter-invert': {
    key: 'backdropInvert',
    property: value => ({
      '--jumi-filter-invert': 'invert(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-opacity': {
    key: 'backdropOpacity',
    property: value => ({
      '--jumi-filter-opacity': 'opacity(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-saturate': {
    key: 'backdropSaturate',
    property: value => ({
      '--jumi-filter-saturate': 'saturate(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-sepia': {
    key: 'backdropSepia',
    property: value => ({
      '--jumi-filter-sepia': 'sepia(' + value + ')',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-url': {
    property: value => ({
      '--jumi-filter-url': `url(${value})`,
    }),
    type: 'url',
    values: empty.string,
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
  'animate-image-rendering': {
    property: value => ({
      '--jumi-image-rendering': value,
    }),
    values: imageRendering,
  },
  'animate-initial-letter': {
    property: value => ({
      '--jumi-initial-letter': value,
      '--jumi-initial-letter-keyframes': 'jumi-initial-letter',
      '-webkit-initial-letter': 'normal',
    }),
    values: empty.string,
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
      '--jumi-line-height-keyframes': 'jumi-line-height',
    }),
    type: ['number', 'length', 'percentage'],
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
    values: empty.string,
  },
  'animate-range-end': {
    property: value => ({
      '--jumi-animation-range-end': value,
    }),
    type: ['length', 'percentage', 'any'],
    values: empty.string,
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
    values: empty.string,
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
  'animate-reveal-bottom': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        '--jumi-width': value,
        'animation-name': 'reveal-bottom',
        'background-color': 'var(--jumi-border-color)',
        'content': '""',
        'position': 'absolute',
      },
      'position': 'relative',
    }),
    type: ['line-width', 'length'],
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
    type: 'angle',
  },
  'animate-rotate-3d': {
    property: value => ({
      '--jumi-rotate-3d': 'rotate3d(' + value + ')',
    }),
    values: empty.string,
  },
  'animate-rotate-3x': {
    property: value => ({
      '--jumi-rotate-3x': value,
    }),
    type: 'number',
    values: empty.string,
  },
  'animate-rotate-3y': {
    property: value => ({
      '--jumi-rotate-3y': value,
    }),
    type: 'number',
    values: empty.string,
  },
  'animate-rotate-3z': {
    property: value => ({
      '--jumi-rotate-3z': value,
    }),
    type: 'number',
    values: empty.string,
  },
  'animate-rotate-x': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-x': 'rotateX(' + value + ')',
    }),
    type: 'angle',
  },

  'animate-rotate-y': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-y': 'rotateY(' + value + ')',
    }),
    type: 'angle',
  },
  'animate-rotate-z': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-z': 'rotateZ(' + value + ')',
    }),
    type: 'angle',
  },
  'animate-row-gap': {
    property: value => ({
      '--jumi-row-gap': value,
    }),
    values: empty.number,
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
  'animate-skew': {
    key: 'skew',
    property: value => ({
      '--jumi-skew': 'skew(' + value + ')',
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-sx': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-sx': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-sy': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-sy': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-x': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-x': 'skewX(' + value + ')',
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-y': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-y': 'skewY(' + value + ')',
    }),
    supportsNegativeValues: true,
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
      '--jumi-text-align-keyframes': 'jumi-text-align',
    }),
    values: textAlign,
  },
  'animate-text-shadow': {
    property: value => ({
      '--jumi-text-shadow': value,
      '--jumi-text-shadow-keyframes': 'jumi-text-shadow',
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
      '--jumi-inset-keyframes': 'jumi-inset',
      '--jumi-top': value,
    }),
  },
  'animate-transform': {
    property: value => ({
      '--jumi-transform': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    values: empty.none,
  },
  'animate-transform-style': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-transform-style': value,
    }),
    values: transformStyle,
  },
  'animate-translate-3d': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-3d': 'translate3d(' + value + ')',
    }),
    type: ['length', 'percentage', 'any'],
    values: empty.string,
  },
  'animate-translate-3x': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-3x': value,
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-translate-3y': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-3y': value,
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-translate-3z': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-3z': value,
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-translate-x': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-x': 'translateX(' + value + ')',
    }),
    supportsNegativeValues: true,
    values: empty.string,
  },
  'animate-translate-y': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-y': 'translateY(' + value + ')',
    }),
    supportsNegativeValues: true,
    values: empty.string,
  },
  'animate-translate-z': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-z': 'translateZ(' + value + ')',
    }),
    supportsNegativeValues: true,
    values: empty.string,
  },
  'animate-visibility': {
    property: value => ({
      '--jumi-visibility': value,
      '--jumi-visibility-keyframes': 'jumi-visibility',
    }),
    values: visibility,
  },
  'animate-width': {
    key: 'width',
    property: value => ({
      '--jumi-width': value,
      '--jumi-width-keyframes': 'jumi-width',
    }),
  },
  'animate-z-index': {
    key: 'zIndex',
    property: value => ({
      '--jumi-z-index': value,
      '--jumi-z-index-keyframes': 'jumi-z-index',
    }),
  },
}
