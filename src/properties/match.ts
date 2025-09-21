import type { MatchProperty } from '@/types'

import { css } from '@/helpers/css'
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
import { animationRange, animationRangeTimeline } from '@/theme/animation-range'
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
import { boxDecorationBreak } from '@/theme/box-decoration-break'
import { boxSizing } from '@/theme/box-sizing'
import { breakAfter } from '@/theme/break-after'
import { breakBefore } from '@/theme/break-before'
import { breakInside } from '@/theme/break-inside'
import { captionSide } from '@/theme/caption-side'
import { clear } from '@/theme/clear'
import { clipPath } from '@/theme/clip-path'
import { clipRule } from '@/theme/clip-rule'
import { colorInterpolation } from '@/theme/color-interpolation'
import { colorScheme } from '@/theme/color-scheme'
import { columnFill } from '@/theme/column-fill'
import { columnRuleStyle } from '@/theme/column-rule-style'
import { columnRuleWidth } from '@/theme/column-rule-width'
import { columnSpan } from '@/theme/column-span'
import { columnWidth } from '@/theme/column-width'
import { contain } from '@/theme/contain'
import { containIntrinsic } from '@/theme/contain-intrinsic'
import { content } from '@/theme/content'
import { contentVisibility } from '@/theme/content-visibility'
import { cursor } from '@/theme/cursor'
import { display, displayInside, displayOutside } from '@/theme/display'
import { dominantBaseline } from '@/theme/dominant-baseline'
import { empty } from '@/theme/empty'
import { emptyCells } from '@/theme/empty-cell'
import { fill } from '@/theme/fill'
import { fillRule } from '@/theme/fill-rule'
import { flexDirection } from '@/theme/flex-direction'
import { flexWrap } from '@/theme/flex-wrap'
import { float } from '@/theme/float'
import { fontFamily } from '@/theme/font-family'
import { fontFeatureSettings } from '@/theme/font-feature-settings'
import { fontKerning } from '@/theme/font-kerning'
import { fontSize } from '@/theme/font-size'
import { fontSizeAdjust, fontSizeAdjustMetric } from '@/theme/font-size-adjust'
import { fontStyle } from '@/theme/font-style'
import { fontSynthesisPosition } from '@/theme/font-synthesis-position'
import { fontSynthesisSmallCaps } from '@/theme/font-synthesis-small-caps'
import { fontSynthesisStyle } from '@/theme/font-synthesis-style'
import { fontSynthesisWeight } from '@/theme/font-synthesis-weight'
import { fontVariantAlternates } from '@/theme/font-variant-alternates'
import { fontVariantCaps } from '@/theme/font-variant-caps'
import { fontVariantEastAsian, fontVariantEastAsianWidth } from '@/theme/font-variant-east-asian'
import { fontVariantLigatures } from '@/theme/font-variant-ligatures'
import { fontVariantNumeric } from '@/theme/font-variant-numeric'
import { fontVariantPosition } from '@/theme/font-variant-position'
import { fontWeight } from '@/theme/font-weight'
import { forcedColorAdjust } from '@/theme/forced-color-adjust'
import { imageRendering } from '@/theme/image-rendering'
import { justifyContent } from '@/theme/justify-content'
import { justifyItems } from '@/theme/justify-items'
import { justifySelf } from '@/theme/justify-self'
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
    property: (value) => {
      return {
        'animation-name': value,
      }
    },
    values: animationName,
  },
  'animate-accent-color': {
    key: 'accentColor',
    property: value => ({
      '--jumi-accent-color': value,
      '--jumi-accent-color-keyframes': 'jumi-accent-color',
    }),
    type: 'color',
  },
  'animate-align-content': {
    property: value => ({
      '--jumi-align-content': value,
      '--jumi-align-content-keyframes': 'jumi-align-content',
    }),
    values: alignContent,
  },
  'animate-align-items': {
    property: value => ({
      '--jumi-align-items': value,
      '--jumi-align-items-keyframes': 'jumi-align-items',
    }),
    values: alignItems,
  },
  'animate-align-self': {
    property: value => ({
      '--jumi-align-self': value,
      '--jumi-align-self-keyframes': 'jumi-align-self',
    }),
    values: alignSelf,
  },
  'animate-alignment-baseline': {
    property: value => ({
      '--jumi-alignment-baseline': value,
      '--jumi-alignment-baseline-keyframes': 'jumi-alignment-baseline',
    }),
    values: alignmentBaseline,
  },
  'animate-all': {
    property: value => ({
      '--jumi-all': value,
      '--jumi-all-keyframes': 'jumi-all',
    }),
    values: all,
  },
  'animate-anchor-name': {
    property: value => ({
      'anchor-name': value,
    }),
    values: empty.none,
  },
  'animate-appearance': {
    property: value => ({
      '--jumi-appearance': value,
      '--jumi-appearance-keyframes': 'jumi-appearance',
    }),
    values: appearance,
  },
  'animate-aspect-ratio': {
    property: value => ({
      '--jumi-aspect-ratio': value,
      '--jumi-aspect-ratio-keyframes': 'jumi-aspect-ratio',
    }),
    type: 'ratio',
    values: empty.auto,
  },
  'animate-aspect-ratio-height': {
    property: value => ({
      '--jumi-aspect-ratio-height': value,
      '--jumi-aspect-ratio-keyframes': 'jumi-aspect-ratio',
    }),
    type: 'ratio',
    values: empty.auto,
  },
  'animate-aspect-ratio-width': {
    property: value => ({
      '--jumi-aspect-ratio-keyframes': 'jumi-aspect-ratio',
      '--jumi-aspect-ratio-width': value,
    }),
    type: 'ratio',
    values: empty.auto,
  },
  'animate-backdrop-blur': {
    key: 'backdropBlur',
    property: value => ({
      '--jumi-backdrop-blur': css('blur', value),
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: 'length',
  },
  'animate-backdrop-brightness': {
    key: 'backdropBrightness',
    property: value => ({
      '--jumi-backdrop-brightness': css('brightness', value),
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-contrast': {
    key: 'backdropContrast',
    property: value => ({
      '--jumi-backdrop-contrast': css('contrast', value),
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-drop-shadow': {
    property: value => ({
      '--jumi-backdrop-drop-shadow': css('drop-shadow', value),
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: ['length', 'shadow', 'any'],
    values: empty.none,
  },
  'animate-backdrop-drop-shadow-blur': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-blur': value,
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: ['length', 'percentage'],
    values: empty.length,
  },
  'animate-backdrop-drop-shadow-color': {
    key: 'boxShadowColor',
    property: value => ({
      '--jumi-backdrop-drop-shadow-color': value,
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: 'color',
  },
  'animate-backdrop-drop-shadow-offset-x': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-offset-x': value,
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-backdrop-drop-shadow-offset-y': {
    property: value => ({
      '--jumi-backdrop-drop-shadow-offset-y': value,
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    type: ['length', 'percentage'],
    values: empty.string,
  },
  'animate-backdrop-filter': {
    property: value => ({
      '--jumi-backdrop-filter': value,
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
    }),
    values: empty.none,
  },
  'animate-backdrop-grayscale': {
    key: 'backdropGrayscale',
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-grayscale': css('grayscale', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-hue-rotate': {
    key: 'backdropHueRotate',
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-hue-rotate': css('hue-rotate', value),
    }),
    type: 'angle',
  },
  'animate-backdrop-invert': {
    key: 'backdropInvert',
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-invert': css('invert', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-opacity': {
    key: 'backdropOpacity',
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-opacity': css('opacity', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-saturate': {
    key: 'backdropSaturate',
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-saturate': css('saturate', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-sepia': {
    key: 'backdropSepia',
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-sepia': css('sepia', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-backdrop-url': {
    property: value => ({
      '--jumi-backdrop-filter-keyframes': 'jumi-backdrop-filter',
      '--jumi-backdrop-url': css('url', value),
    }),
    type: 'url',
    values: empty.string,
  },
  'animate-backface-visibility': {
    property: value => ({
      '--jumi-backface-visibility': value,
      '--jumi-backface-visibility-keyframes': 'jumi-backface-visibility',
    }),
    values: backfaceVisibility,
  },
  'animate-background': {
    property: value => ({
      '--jumi-background': value,
      '--jumi-background-keyframes': 'jumi-background',
    }),
    type: ['color', 'image', 'position', 'url', 'any'],
    values: empty.none,
  },
  'animate-background-attachment': {
    property: value => ({
      '--jumi-background-attachment': value,
      '--jumi-background-attachment-keyframes': 'jumi-background-attachment',
    }),
    values: backgroundAttachment,
  },
  'animate-background-blend-mode': {
    property: value => ({
      '--jumi-background-blend-mode': value,
      '--jumi-background-blend-mode-keyframes': 'jumi-background-blend-mode',
    }),
    values: mixBlendMode,
  },
  'animate-background-clip': {
    property: value => ({
      '--jumi-background-clip': value,
      '--jumi-background-clip-keyframes': 'jumi-background-clip',
    }),
    values: backgroundClip,
  },
  'animate-background-color': {
    key: 'backgroundColor',
    property: value => ({
      '--jumi-background-color': value,
      '--jumi-background-color-keyframes': 'jumi-background-color',
    }),
    type: 'color',
  },
  'animate-background-image': {
    key: 'backgroundImage',
    property: value => ({
      '--jumi-background-image': value,
      '--jumi-background-image-keyframes': 'jumi-background-image',
    }),
    type: 'image',
  },
  'animate-background-origin': {
    property: value => ({
      '--jumi-background-origin': value,
      '--jumi-background-origin-keyframes': 'jumi-background-origin',
    }),
    values: backgroundOrigin,
  },
  'animate-background-position': {
    key: 'backgroundPosition',
    property: value => ({
      '--jumi-background-position': value,
      '--jumi-background-position-keyframes': 'jumi-background-position',
    }),
    type: ['position', 'percentage', 'length', 'any'],
  },
  'animate-background-position-x': {
    property: value => ({
      '--jumi-background-position-keyframes': 'jumi-background-position',
      '--jumi-background-position-x': value,
    }),
    type: ['position', 'percentage', 'length', 'any'],
    values: merge(backgroundPosition, percentage),
  },
  'animate-background-position-x-edge': {
    property: value => ({
      '--jumi-background-position-keyframes': 'jumi-background-position',
      '--jumi-background-position-x-edge': value,
    }),
    values: backgroundPosition,
  },
  'animate-background-position-x-offset': {
    property: value => ({
      '--jumi-background-position-keyframes': 'jumi-background-position',
      '--jumi-background-position-x-offset': value,
    }),
    type: ['percentage', 'length'],
    values: percentage,
  },
  'animate-background-position-y': {
    property: value => ({
      '--jumi-background-position-keyframes': 'jumi-background-position',
      '--jumi-background-position-y': value,
    }),
    type: ['position', 'percentage', 'length', 'any'],
    values: merge(backgroundPosition, percentage),
  },
  'animate-background-position-y-edge': {
    property: value => ({
      '--jumi-background-position-keyframes': 'jumi-background-position',
      '--jumi-background-position-y-edge': value,
    }),
    values: backgroundPosition,
  },
  'animate-background-position-y-offset': {
    property: value => ({
      '--jumi-background-position-keyframes': 'jumi-background-position',
      '--jumi-background-position-y-offset': value,
    }),
    type: ['percentage', 'length'],
    values: percentage,
  },
  'animate-background-repeat': {
    property: value => ({
      '--jumi-background-repeat': value,
      '--jumi-background-repeat-keyframes': 'jumi-background-repeat',
    }),
    values: backgroundRepeat,
  },
  'animate-background-repeat-x': {
    property: value => ({
      '--jumi-background-repeat-keyframes': 'jumi-background-repeat',
      '--jumi-background-repeat-x': value,
    }),
    values: backgroundRepeatAxis,
  },
  'animate-background-repeat-y': {
    property: value => ({
      '--jumi-background-repeat-keyframes': 'jumi-background-repeat',
      '--jumi-background-repeat-y': value,
    }),
    values: backgroundRepeatAxis,
  },
  'animate-background-size': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size': value,
      '--jumi-background-size-keyframes': 'jumi-background-size',
    }),
  },
  'animate-background-size-height': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size-height': value,
      '--jumi-background-size-keyframes': 'jumi-background-size',
    }),
    type: ['length', 'percentage'],
  },
  'animate-background-size-width': {
    key: 'backgroundSize',
    property: value => ({
      '--jumi-background-size-keyframes': 'jumi-background-size',
      '--jumi-background-size-width': value,
    }),
    type: ['length', 'percentage'],
  },
  'animate-block-size': {
    property: value => ({
      '--jumi-block-size': value,
      '--jumi-block-size-keyframes': 'jumi-block-size',
    }),
    type: ['length', 'percentage', 'any'],
    values: empty.auto,
  },
  'animate-border': {
    property: value => ({
      '--jumi-border': value,
      '--jumi-border-keyframes': 'jumi-border',
    }),
    type: ['line-width', 'length'],
    values: empty.none,
  },
  'animate-border-block-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-block-end-radius-keyframes': 'jumi-border-block-end-radius',
      '--jumi-border-end-end-radius': value,
      '--jumi-border-end-start-radius': value,
    }),
  },
  'animate-border-block-end-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-block-end-width': value,
      '--jumi-border-block-end-width-keyframes': 'jumi-border-block-end-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-block-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-block-start-radius-keyframes': 'jumi-border-block-start-radius',
      '--jumi-border-start-end-radius': value,
      '--jumi-border-start-start-radius': value,
    }),
  },
  'animate-border-block-start-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-block-start-width': value,
      '--jumi-border-block-start-width-keyframes': 'jumi-border-block-start-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-block-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-block-end-width': value,
      '--jumi-border-block-start-width': value,
      '--jumi-border-block-width-keyframes': 'jumi-border-block-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-bottom-left-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-left-radius': value,
      '--jumi-border-bottom-left-radius-keyframes': 'jumi-border-bottom-left-radius',
    }),
  },
  'animate-border-bottom-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-left-radius': value,
      '--jumi-border-bottom-radius-keyframes': 'jumi-border-bottom-radius',
      '--jumi-border-bottom-right-radius': value,
    }),
  },
  'animate-border-bottom-right-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-right-radius': value,
      '--jumi-border-bottom-right-radius-keyframes': 'jumi-border-bottom-right-radius',
    }),
  },
  'animate-border-bottom-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-bottom-width': value,
      '--jumi-border-bottom-width-keyframes': 'jumi-border-bottom-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-collapse': {
    property: value => ({
      '--jumi-border-collapse': value,
      '--jumi-border-collapse-keyframes': 'jumi-border-collapse',
    }),
    values: borderCollapse,
  },
  'animate-border-color': {
    key: 'borderColor',
    property: value => ({
      '--jumi-border-color': value,
      '--jumi-border-color-keyframes': 'jumi-border-color',
    }),
    type: 'color',
  },
  'animate-border-end-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-end-radius': value,
      '--jumi-border-end-end-radius-keyframes': 'jumi-border-end-end-radius',
    }),
  },
  'animate-border-end-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-start-radius': value,
      '--jumi-border-end-start-radius-keyframes': 'jumi-border-end-start-radius',
    }),
  },
  'animate-border-image': {
    property: value => ({
      '--jumi-border-image': value,
      '--jumi-border-image-keyframes': 'jumi-border-image',
    }),
    type: 'image',
    values: empty.none,
  },
  'animate-border-image-outset': {
    property: value => ({
      '--jumi-border-image-outset': value,
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-bottom': {
    property: value => ({
      '--jumi-border-image-outset-bottom': value,
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-left': {
    property: value => ({
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
      '--jumi-border-image-outset-left': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-right': {
    property: value => ({
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
      '--jumi-border-image-outset-right': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-top': {
    property: value => ({
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
      '--jumi-border-image-outset-top': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-x': {
    property: value => ({
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
      '--jumi-border-image-outset-left': value,
      '--jumi-border-image-outset-right': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-outset-y': {
    property: value => ({
      '--jumi-border-image-outset-bottom': value,
      '--jumi-border-image-outset-keyframes': 'jumi-border-image-outset',
      '--jumi-border-image-outset-top': value,
    }),
    type: ['number', 'length'],
    values: empty.number,
  },
  'animate-border-image-repeat': {
    property: value => ({
      '--jumi-border-image-repeat': value,
      '--jumi-border-image-repeat-keyframes': 'jumi-border-image-repeat',
    }),
    values: borderImageRepeat,
  },
  'animate-border-image-repeat-x': {
    property: value => ({
      '--jumi-border-image-repeat-keyframes': 'jumi-border-image-repeat',
      '--jumi-border-image-repeat-x': value,
    }),
    values: borderImageRepeat,
  },
  'animate-border-image-repeat-y': {
    property: value => ({
      '--jumi-border-image-repeat-keyframes': 'jumi-border-image-repeat',
      '--jumi-border-image-repeat-y': value,
    }),
    values: borderImageRepeat,
  },
  'animate-border-inline-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-end-radius': value,
      '--jumi-border-inline-end-radius-keyframes': 'jumi-border-inline-end-radius',
      '--jumi-border-start-end-radius': value,
    }),
  },
  'animate-border-inline-end-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-inline-end-width': value,
      '--jumi-border-inline-end-width-keyframes': 'jumi-border-inline-end-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-inline-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-end-start-radius': value,
      '--jumi-border-inline-start-radius-keyframes': 'jumi-border-inline-start-radius',
      '--jumi-border-start-start-radius': value,
    }),
  },
  'animate-border-inline-start-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-inline-start-width': value,
      '--jumi-border-inline-start-width-keyframes': 'jumi-border-inline-start-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-inline-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-inline-end-width': value,
      '--jumi-border-inline-start-width': value,
      '--jumi-border-inline-width-keyframes': 'jumi-border-inline-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-left-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-left-radius': value,
      '--jumi-border-left-radius-keyframes': 'jumi-border-left-radius',
      '--jumi-border-top-left-radius': value,
    }),
  },
  'animate-border-left-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-left-width': value,
      '--jumi-border-left-width-keyframes': 'jumi-border-left-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-radius': value,
      '--jumi-border-radius-keyframes': 'jumi-border-radius',
    }),
  },
  'animate-border-right-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-bottom-right-radius': value,
      '--jumi-border-right-radius-keyframes': 'jumi-border-right-radius',
      '--jumi-border-top-right-radius': value,
    }),
  },
  'animate-border-right-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-right-width': value,
      '--jumi-border-right-width-keyframes': 'jumi-border-right-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-start-end-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-start-end-radius': value,
      '--jumi-border-start-end-radius-keyframes': 'jumi-border-start-end-radius',
    }),
  },
  'animate-border-start-start-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-start-start-radius': value,
      '--jumi-border-start-start-radius-keyframes': 'jumi-border-start-start-radius',
    }),
  },
  'animate-border-top-left-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-top-left-radius': value,
      '--jumi-border-top-left-radius-keyframes': 'jumi-border-top-left-radius',
    }),
  },
  'animate-border-top-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-top-left-radius': value,
      '--jumi-border-top-radius-keyframes': 'jumi-border-top-radius',
      '--jumi-border-top-right-radius': value,
    }),
  },
  'animate-border-top-right-radius': {
    key: 'borderRadius',
    property: value => ({
      '--jumi-border-top-right-radius': value,
      '--jumi-border-top-right-radius-keyframes': 'jumi-border-top-right-radius',
    }),
  },
  'animate-border-top-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-top-width': value,
      '--jumi-border-top-width-keyframes': 'jumi-border-top-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-border-width': {
    key: 'borderWidth',
    property: value => ({
      '--jumi-border-width': value,
      '--jumi-border-width-keyframes': 'jumi-border-width',
    }),
    type: ['line-width', 'length'],
  },
  'animate-bottom': {
    key: 'inset',
    property: value => ({
      '--jumi-bottom': value,
      '--jumi-bottom-keyframes': 'jumi-bottom',
    }),
    supportsNegativeValues: true,
    type: ['number', 'length', 'percentage'],
  },
  'animate-box-decoration-break': {
    property: value => ({
      '--jumi-box-decoration-break': value,
      '--jumi-box-decoration-break-keyframes': 'jumi-box-decoration-break',
    }),
    values: boxDecorationBreak,
  },
  'animate-box-shadow': {
    key: 'boxShadow',
    property: value => ({
      '--jumi-box-shadow': value,
      '--jumi-box-shadow-keyframes': 'jumi-box-shadow',
    }),
    type: ['length', 'shadow', 'any'],
  },
  'animate-box-shadow-blur': {
    key: 'blur',
    property: value => ({
      '--jumi-box-shadow-blur': value,
      '--jumi-box-shadow-keyframes': 'jumi-box-shadow',
    }),
    type: ['length', 'percentage'],
  },
  'animate-box-shadow-color': {
    key: 'boxShadowColor',
    property: value => ({
      '--jumi-box-shadow-color': value,
      '--jumi-box-shadow-keyframes': 'jumi-box-shadow',
    }),
    type: 'color',
  },
  'animate-box-shadow-inset': {
    key: 'boxShadow',
    property: value => ({
      '--jumi-box-shadow-inset': value,
      '--jumi-box-shadow-inset-keyframes': 'jumi-box-shadow-inset',
    }),
    type: ['length', 'shadow', 'any'],
  },
  'animate-box-shadow-inset-blur': {
    key: 'blur',
    property: value => ({
      '--jumi-box-shadow-inset-blur': value,
      '--jumi-box-shadow-inset-keyframes': 'jumi-box-shadow-inset',
    }),
    type: ['length', 'percentage'],
  },
  'animate-box-shadow-inset-color': {
    key: 'boxShadowColor',
    property: value => ({
      '--jumi-box-shadow-inset-color': value,
      '--jumi-box-shadow-inset-keyframes': 'jumi-box-shadow-inset',
    }),
    type: 'color',
  },
  'animate-box-shadow-inset-offset-x': {
    property: value => ({
      '--jumi-box-shadow-inset-keyframes': 'jumi-box-shadow-inset',
      '--jumi-box-shadow-inset-offset-x': value,
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-box-shadow-inset-offset-y': {
    property: value => ({
      '--jumi-box-shadow-inset-keyframes': 'jumi-box-shadow-inset',
      '--jumi-box-shadow-inset-offset-y': value,
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-box-shadow-inset-spread': {
    property: value => ({
      '--jumi-box-shadow-inset-keyframes': 'jumi-box-shadow-inset',
      '--jumi-box-shadow-inset-spread': value,
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-box-shadow-offset-x': {
    property: value => ({
      '--jumi-box-shadow-keyframes': 'jumi-box-shadow',
      '--jumi-box-shadow-offset-x': value,
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-box-shadow-offset-y': {
    property: value => ({
      '--jumi-box-shadow-keyframes': 'jumi-box-shadow',
      '--jumi-box-shadow-offset-y': value,
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-box-shadow-spread': {
    property: value => ({
      '--jumi-box-shadow-keyframes': 'jumi-box-shadow',
      '--jumi-box-shadow-spread': value,
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-box-sizing': {
    property: value => ({
      '--jumi-box-sizing': value,
      '--jumi-box-sizing-keyframes': 'jumi-box-sizing',
    }),
    values: boxSizing,
  },
  'animate-break-after': {
    property: value => ({
      '--jumi-break-after': value,
      '--jumi-break-after-keyframes': 'jumi-break-after',
    }),
    values: breakAfter,
  },
  'animate-break-before': {
    property: value => ({
      '--jumi-break-before': value,
      '--jumi-break-before-keyframes': 'jumi-break-before',
    }),
    values: breakBefore,
  },
  'animate-break-inside': {
    property: value => ({
      '--jumi-break-inside': value,
      '--jumi-break-inside-keyframes': 'jumi-break-inside',
    }),
    values: breakInside,
  },
  'animate-caption-side': {
    property: value => ({
      '--jumi-caption-side': value,
      '--jumi-caption-side-keyframes': 'jumi-caption-side',
    }),
    values: captionSide,
  },
  'animate-caret-color': {
    key: 'caretColor',
    property: value => ({
      '--jumi-caret-color': value,
      '--jumi-caret-color-keyframes': 'jumi-caret-color',
    }),
    type: 'color',
  },
  'animate-clear': {
    property: value => ({
      '--jumi-clear': value,
      '--jumi-clear-keyframes': 'jumi-clear',
    }),
    values: clear,
  },
  'animate-clip-path': {
    property: value => ({
      '--jumi-clip-path': value,
      '--jumi-clip-path-keyframes': 'jumi-clip-path',
    }),
    values: clipPath,
  },
  'animate-clip-rule': {
    property: value => ({
      '--jumi-clip-rule': value,
      '--jumi-clip-rule-keyframes': 'jumi-clip-rule',
    }),
    values: clipRule,
  },
  'animate-color': {
    key: 'colors',
    property: value => ({
      '--jumi-color': value,
      '--jumi-color-keyframes': 'jumi-color',
    }),
    type: 'color',
  },
  'animate-color-interpolation': {
    property: value => ({
      '--jumi-color-interpolation': value,
      '--jumi-color-interpolation-keyframes': 'jumi-color-interpolation',
    }),
    values: colorInterpolation,
  },
  'animate-color-interpolation-filters': {
    property: value => ({
      '--jumi-color-interpolation-filters': value,
      '--jumi-color-interpolation-filters-keyframes': 'jumi-color-interpolation-filters',
    }),
    values: colorInterpolation,
  },
  'animate-color-scheme': {
    property: value => ({
      '--jumi-color-scheme': value,
      '--jumi-color-scheme-keyframes': 'jumi-color-scheme',
    }),
    values: colorScheme,
  },
  'animate-column-count': {
    property: value => ({
      '--jumi-column-count': value,
      '--jumi-column-count-keyframes': 'jumi-column-count',
    }),
    type: 'integer',
    values: empty.auto,
  },
  'animate-column-fill': {
    property: value => ({
      '--jumi-column-fill': value,
      '--jumi-column-fill-keyframes': 'jumi-column-fill',
    }),
    values: columnFill,
  },
  'animate-column-gap': {
    property: value => ({
      '--jumi-column-gap': value,
      '--jumi-gap-keyframes': 'jumi-gap',
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-column-rule': {
    property: value => ({
      '--jumi-column-rule': value,
      '--jumi-column-rule-keyframes': 'jumi-column-rule',
    }),
    type: ['line-width', 'length'],
    values: empty.none,
  },
  'animate-column-rule-color': {
    key: 'borderColor',
    property: value => ({
      '--jumi-column-rule-color': value,
      '--jumi-column-rule-color-keyframes': 'jumi-column-rule-color',
    }),
    type: 'color',
  },
  'animate-column-rule-style': {
    property: value => ({
      '--jumi-column-rule-style': value,
      '--jumi-column-rule-style-keyframes': 'jumi-column-rule-style',
    }),
    values: columnRuleStyle,
  },
  'animate-column-rule-width': {
    property: value => ({
      '--jumi-column-rule-width': value,
      '--jumi-column-rule-width-keyframes': 'jumi-column-rule-width',
    }),
    type: ['line-width', 'length'],
    values: columnRuleWidth,
  },
  'animate-column-span': {
    property: value => ({
      '--jumi-column-span': value,
      '--jumi-column-span-keyframes': 'jumi-column-span',
    }),
    type: 'integer',
    values: columnSpan,
  },
  'animate-column-width': {
    property: value => ({
      '--jumi-column-width': value,
      '--jumi-column-width-keyframes': 'jumi-column-width',
    }),
    type: ['length', 'percentage'],
    values: columnWidth,
  },
  'animate-columns': {
    property: value => ({
      '--jumi-columns': value,
      '--jumi-columns-keyframes': 'jumi-columns',
    }),
    type: ['line-width', 'length', 'integer'],
    values: empty.auto,
  },
  'animate-contain': {
    property: value => ({
      '--jumi-contain': value,
      '--jumi-contain-keyframes': 'jumi-contain',
    }),
    values: contain,
  },
  'animate-contain-intrinsic-block-size': {
    property: value => ({
      '--jumi-contain-intrinsic-block-size': value,
      '--jumi-contain-intrinsic-block-size-keyframes': 'jumi-contain-intrinsic-block-size',
    }),
    type: 'length',
    values: containIntrinsic,
  },
  'animate-contain-intrinsic-height': {
    property: value => ({
      '--jumi-contain-intrinsic-height': value,
      '--jumi-contain-intrinsic-height-keyframes': 'jumi-contain-intrinsic-height',
    }),
    type: 'length',
    values: containIntrinsic,
  },
  'animate-contain-intrinsic-inline-size': {
    property: value => ({
      '--jumi-contain-intrinsic-inline-size': value,
      '--jumi-contain-intrinsic-inline-size-keyframes': 'jumi-contain-intrinsic-inline-size',
    }),
    type: 'length',
    values: containIntrinsic,
  },
  'animate-contain-intrinsic-size': {
    property: value => ({
      '--jumi-contain-intrinsic-size': value,
      '--jumi-contain-intrinsic-size-keyframes': 'jumi-contain-intrinsic-size',
    }),
    type: 'length',
    values: empty.none,
  },
  'animate-contain-intrinsic-width': {
    property: value => ({
      '--jumi-contain-intrinsic-width': value,
      '--jumi-contain-intrinsic-width-keyframes': 'jumi-contain-intrinsic-width',
    }),
    type: 'length',
    values: containIntrinsic,
  },
  'animate-content': {
    property: value => ({
      '--jumi-content': value,
      '--jumi-content-keyframes': 'jumi-content',
    }),
    type: ['image', 'any'],
    values: content,
  },
  'animate-content-visibility': {
    property: value => ({
      '--jumi-content-visibility': value,
      '--jumi-content-visibility-keyframes': 'jumi-content-visibility',
    }),
    values: contentVisibility,
  },
  'animate-counter-increment': {
    property: value => ({
      '--jumi-counter-increment': value,
      '--jumi-counter-increment-keyframes': 'jumi-counter-increment',
    }),
    type: ['integer', 'any'],
    values: empty.none,
  },
  'animate-counter-reset': {
    property: value => ({
      '--jumi-counter-reset': value,
      '--jumi-counter-reset-keyframes': 'jumi-counter-reset',
    }),
    type: ['integer', 'any'],
    values: empty.none,
  },
  'animate-counter-set': {
    property: value => ({
      '--jumi-counter-set': value,
      '--jumi-counter-set-keyframes': 'jumi-counter-set',
    }),
    type: ['integer', 'any'],
    values: empty.none,
  },
  'animate-cursor': {
    property: value => ({
      '--jumi-cursor': value,
      '--jumi-cursor-keyframes': 'jumi-cursor',
    }),
    values: cursor,
  },
  'animate-cx': {
    property: value => ({
      '--jumi-cx': value,
      '--jumi-cx-keyframes': 'jumi-cx',
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-cy': {
    property: value => ({
      '--jumi-cy': value,
      '--jumi-cy-keyframes': 'jumi-cy',
    }),
    type: ['length', 'percentage'],
    values: empty.number,
  },
  'animate-d': {
    property: value => ({
      '--jumi-d': value,
      '--jumi-d-keyframes': 'jumi-d',
    }),
    values: empty.none,
  },
  'animate-display': {
    property: value => ({
      '--jumi-display': value,
      '--jumi-display-keyframes': 'jumi-display',
    }),
    values: display,
  },
  'animate-display-inside': {
    modifiers: displayOutside,
    property: (value, { modifier }) => ({
      '--jumi-display-inside': modifier === null ? value : `${modifier} ${value}`,
      '--jumi-display-keyframes': 'jumi-display',
    }),
    values: displayInside,
  },
  'animate-display-outside': {
    modifiers: displayInside,
    property: (value, { modifier }) => ({
      '--jumi-display-keyframes': 'jumi-display',
      '--jumi-display-outside': modifier === null ? value : `${value} ${modifier}`,
    }),
    values: displayOutside,
  },
  'animate-dominant-baseline': {
    property: value => ({
      '--jumi-dominant-baseline': value,
      '--jumi-dominant-baseline-keyframes': 'jumi-dominant-baseline',
    }),
    values: dominantBaseline,
  },
  'animate-empty-cells': {
    property: value => ({
      '--jumi-empty-cells': value,
      '--jumi-empty-cells-keyframes': 'jumi-empty-cells',
    }),
    values: emptyCells,
  },
  'animate-fill': {
    key: 'colors',
    property: value => ({
      '--jumi-fill': value,
    }),
    type: ['color', 'url', 'any'],
    values: fill,
  },
  'animate-fill-opacity': {
    key: 'opacity',
    property: value => ({
      '--jumi-fill-opacity': value,
    }),
    type: ['number', 'percentage'],
  },
  'animate-fill-rule': {
    property: value => ({
      '--jumi-fill-rule': value,
      '--jumi-fill-rule-keyframes': 'jumi-fill-rule',
    }),
    values: fillRule,
  },
  'animate-filter': {
    property: value => ({
      '--jumi-filter': value,
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    values: empty.none,
  },
  'animate-filter-blur': {
    key: 'blur',
    property: value => ({
      '--jumi-filter-blur': css('blur', value),
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    type: 'length',
  },
  'animate-filter-brightness': {
    key: 'brightness',
    property: value => ({
      '--jumi-filter-brightness': css('brightness', value),
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-contrast': {
    key: 'contrast',
    property: value => ({
      '--jumi-filter-contrast': css('contrast', value),
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-grayscale': {
    key: 'grayscale',
    property: value => ({
      '--jumi-filter-grayscale': css('grayscale', value),
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-hue-rotate': {
    key: 'hueRotate',
    property: value => ({
      '--jumi-filter-hue-rotate': 'hue-rotate(' + value + ')',
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    type: 'angle',
  },
  'animate-filter-invert': {
    key: 'invert',
    property: value => ({
      '--jumi-filter-invert': css('invert', value),
      '--jumi-filter-keyframes': 'jumi-filter',
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-opacity': {
    key: 'opacity',
    property: value => ({
      '--jumi-filter-keyframes': 'jumi-filter',
      '--jumi-filter-opacity': css('opacity', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-saturate': {
    key: 'saturate',
    property: value => ({
      '--jumi-filter-keyframes': 'jumi-filter',
      '--jumi-filter-saturate': css('saturate', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-sepia': {
    key: 'sepia',
    property: value => ({
      '--jumi-filter-keyframes': 'jumi-filter',
      '--jumi-filter-sepia': css('sepia', value),
    }),
    type: ['number', 'percentage'],
  },
  'animate-filter-url': {
    property: value => ({
      '--jumi-filter-keyframes': 'jumi-filter',
      '--jumi-filter-url': `url(${value})`,
    }),
    type: 'url',
    values: empty.string,
  },
  'animate-flex': {
    key: 'flex',
    property: value => ({
      '--jumi-flex': value,
      '--jumi-flex-keyframes': 'jumi-flex',
    }),
  },
  'animate-flex-basis': {
    key: 'flexBasis',
    property: value => ({
      '--jumi-flex-basis': value,
      '--jumi-flex-basis-keyframes': 'jumi-flex-basis',
    }),
  },
  'animate-flex-direction': {
    property: value => ({
      '--jumi-flex-direction': value,
      '--jumi-flex-direction-keyframes': 'jumi-flex-direction',
    }),
    values: flexDirection,
  },
  'animate-flex-flow': {
    property: value => ({
      '--jumi-flex-flow': value,
      '--jumi-flex-flow-keyframes': 'jumi-flex-flow',
    }),
    values: empty.string,
  },
  'animate-flex-grow': {
    key: 'flexGrow',
    property: value => ({
      '--jumi-flex-grow': value,
      '--jumi-flex-grow-keyframes': 'jumi-flex-grow',
    }),
  },
  'animate-flex-shrink': {
    key: 'flexShrink',
    property: value => ({
      '--jumi-flex-shrink': value,
      '--jumi-flex-shrink-keyframes': 'jumi-flex-shrink',
    }),
  },
  'animate-flex-wrap': {
    property: value => ({
      '--jumi-flex-wrap': value,
      '--jumi-flex-wrap-keyframes': 'jumi-flex-wrap',
    }),
    values: flexWrap,
  },
  'animate-float': {
    property: value => ({
      '--jumi-float': value,
      '--jumi-float-keyframes': 'jumi-float',
    }),
    values: float,
  },
  'animate-flood-color': {
    key: 'colors',
    property: value => ({
      '--jumi-flood-color': value,
      '--jumi-flood-color-keyframes': 'jumi-flood-color',
    }),
    type: 'color',
  },
  'animate-flood-opacity': {
    key: 'opacity',
    property: value => ({
      '--jumi-flood-opacity': value,
      '--jumi-flood-opacity-keyframes': 'jumi-flood-opacity',
    }),
    type: ['number', 'percentage'],
  },
  'animate-font-family': {
    property: value => ({
      '--jumi-font-family': value,
      '--jumi-font-family-keyframes': 'jumi-font-family',
    }),
    type: ['generic-name', 'family-name'],
    values: fontFamily,
  },
  'animate-font-feature-settings': {
    property: value => ({
      '--jumi-font-feature-settings': value,
      '--jumi-font-feature-settings-keyframes': 'jumi-font-feature-settings',
    }),
    type: ['integer', 'any'],
    values: fontFeatureSettings,
  },
  'animate-font-kerning': {
    property: value => ({
      '--jumi-font-kerning': value,
      '--jumi-font-kerning-keyframes': 'jumi-font-kerning',
    }),
    values: fontKerning,
  },
  'animate-font-size': {
    property: value => ({
      '--jumi-font-size': value,
      '--jumi-font-size-keyframes': 'jumi-font-size',
    }),
    values: fontSize,
  },
  'animate-font-size-adjust': {
    modifiers: fontSizeAdjustMetric,
    property: (value, { modifier }) => ({
      '--jumi-font-size-adjust': modifier === null ? value : `${value} ${modifier}`,
      '--jumi-font-size-adjust-keyframes': 'jumi-font-size-adjust',
    }),
    type: ['number', 'any'],
    values: fontSizeAdjust,
  },
  'animate-font-style': {
    property: (value, { modifier }) => ({
      '--jumi-font-style': modifier === null ? value : `${value} ${modifier}`,
      '--jumi-font-style-keyframes': 'jumi-font-style',
    }),
    values: fontStyle,
  },
  'animate-font-synthesis': {
    property: value => ({
      '--jumi-font-synthesis': value,
      '--jumi-font-synthesis-keyframes': 'jumi-font-synthesis',
    }),
    values: empty.none,
  },
  'animate-font-synthesis-position': {
    property: value => ({
      '--jumi-font-synthesis-position': value,
      '--jumi-font-synthesis-position-keyframes': 'jumi-font-synthesis-position',
    }),
    values: fontSynthesisPosition,
  },
  'animate-font-synthesis-small-caps': {
    property: value => ({
      '--jumi-font-synthesis-small-caps': value,
      '--jumi-font-synthesis-small-caps-keyframes': 'jumi-font-synthesis-small-caps',
    }),
    values: fontSynthesisSmallCaps,
  },
  'animate-font-synthesis-style': {
    property: value => ({
      '--jumi-font-synthesis-style': value,
      '--jumi-font-synthesis-style-keyframes': 'jumi-font-synthesis-style',
    }),
    values: fontSynthesisStyle,
  },
  'animate-font-synthesis-weight': {
    property: value => ({
      '--jumi-font-synthesis-weight': value,
      '--jumi-font-synthesis-weight-keyframes': 'jumi-font-synthesis-weight',
    }),
    values: fontSynthesisWeight,
  },
  'animate-font-variant': {
    property: value => ({
      '--jumi-font-variant': value,
      '--jumi-font-variant-keyframes': 'jumi-font-variant',
    }),
    values: empty.string,
  },
  'animate-font-variant-alternates': {
    property: value => ({
      '--jumi-font-variant-alternates': value,
      '--jumi-font-variant-alternates-keyframes': 'jumi-font-variant-alternates',
    }),
    values: fontVariantAlternates,
  },
  'animate-font-variant-caps': {
    property: value => ({
      '--jumi-font-variant-caps': value,
      '--jumi-font-variant-caps-keyframes': 'jumi-font-variant-caps',
    }),
    values: fontVariantCaps,
  },
  'animate-font-variant-east-asian': {
    modifiers: fontVariantEastAsianWidth,
    property: (value, { modifier }) => ({
      '--jumi-font-variant-east-asian': modifier === null ? value : `${value} ${modifier}`,
      '--jumi-font-variant-east-asian-keyframes': 'jumi-font-variant-east-asian',
    }),
    values: fontVariantEastAsian,
  },
  'animate-font-variant-ligatures': {
    property: value => ({
      '--jumi-font-variant-ligatures': value,
      '--jumi-font-variant-ligatures-keyframes': 'jumi-font-variant-ligatures',
    }),
    values: fontVariantLigatures,
  },
  'animate-font-variant-numeric': {
    property: value => ({
      '--jumi-font-variant-numeric': value,
      '--jumi-font-variant-numeric-keyframes': 'jumi-font-variant-numeric',
    }),
    values: fontVariantNumeric,
  },
  'animate-font-variant-position': {
    property: value => ({
      '--jumi-font-variant-position': value,
      '--jumi-font-variant-position-keyframes': 'jumi-font-variant-position',
    }),
    values: fontVariantPosition,
  },
  'animate-font-variation-settings': {
    property: value => ({
      '--jumi-font-variation-settings': value,
      '--jumi-font-variation-settings-keyframes': 'jumi-font-variation-settings',
    }),
    type: ['number', 'any'],
    values: empty.string,
  },
  'animate-font-weight': {
    property: value => ({
      '--jumi-font-weight': value,
      '--jumi-font-weight-keyframes': 'jumi-font-weight',
    }),
    type: 'number',
    values: fontWeight,
  },
  'animate-forced-color-adjust': {
    property: value => ({
      '--jumi-forced-color-adjust': value,
      '--jumi-forced-color-adjust-keyframes': 'jumi-forced-color-adjust',
    }),
    values: forcedColorAdjust,
  },
  'animate-gap': {
    key: 'gap',
    property: value => ({
      '--jumi-gap': value,
      '--jumi-gap-keyframes': 'jumi-gap',
    }),
  },
  'animate-height': {
    key: 'height',
    property: value => ({
      '--jumi-height': value,
      '--jumi-height-keyframes': 'jumi-height',
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage', 'any'],
  },
  'animate-image-rendering': {
    property: value => ({
      '--jumi-image-rendering': value,
      '--jumi-image-rendering-keyframes': 'jumi-image-rendering',
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
      '--jumi-inset-keyframes': 'jumi-inset',
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage', 'any'],
  },
  'animate-justify-content': {
    property: value => ({
      '--jumi-justify-content': value,
      '--jumi-justify-content-keyframes': 'jumi-justify-content',
    }),
    values: justifyContent,
  },
  'animate-justify-items': {
    property: value => ({
      '--jumi-justify-items': value,
      '--jumi-justify-items-keyframes': 'jumi-justify-items',
    }),
    values: justifyItems,
  },
  'animate-justify-self': {
    property: value => ({
      '--jumi-justify-self': value,
      '--jumi-justify-self-keyframes': 'jumi-justify-self',
    }),
    values: justifySelf,
  },
  'animate-left': {
    key: 'inset',
    property: value => ({
      '--jumi-left': value,
      '--jumi-left-keyframes': 'jumi-left',
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage', 'any'],
  },
  'animate-letter-spacing': {
    key: 'letterSpacing',
    property: value => ({
      '--jumi-letter-spacing': value,
      '--jumi-letter-spacing-keyframes': 'jumi-letter-spacing',
    }),
    type: ['length', 'percentage'],
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
      '--jumi-margin-keyframes': 'jumi-margin',
    }),
    supportsNegativeValues: true,
  },
  'animate-margin-block': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-block': value,
      '--jumi-margin-keyframes': 'jumi-margin',
    }),
    supportsNegativeValues: true,
  },
  'animate-margin-bottom': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-bottom': value,
      '--jumi-margin-keyframes': 'jumi-margin',
    }),
    supportsNegativeValues: true,
  },
  'animate-margin-inline': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-inline': value,
      '--jumi-margin-keyframes': 'jumi-margin',
    }),
    supportsNegativeValues: true,
  },
  'animate-margin-left': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-keyframes': 'jumi-margin',
      '--jumi-margin-left': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-margin-right': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-keyframes': 'jumi-margin',
      '--jumi-margin-right': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-margin-top': {
    key: 'margin',
    property: value => ({
      '--jumi-margin-keyframes': 'jumi-margin',
      '--jumi-margin-top': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-max-height': {
    key: 'maxHeight',
    property: value => ({
      '--jumi-max-height': value,
      '--jumi-max-height-keyframes': 'jumi-max-height',
    }),
    supportsNegativeValues: true,
  },
  'animate-max-width': {
    key: 'maxWidth',
    property: value => ({
      '--jumi-max-width': value,
      '--jumi-max-width-keyframes': 'jumi-max-width',
    }),
    supportsNegativeValues: true,
  },
  'animate-min-height': {
    key: 'minHeight',
    property: value => ({
      '--jumi-min-height': value,
      '--jumi-min-height-keyframes': 'jumi-min-height',
    }),
    supportsNegativeValues: true,
  },
  'animate-min-width': {
    key: 'minWidth',
    property: value => ({
      '--jumi-min-width': value,
      '--jumi-min-width-keyframes': 'jumi-min-width',
    }),
    supportsNegativeValues: true,
  },
  'animate-opacity': {
    key: 'opacity',
    property: value => ({
      '--jumi-opacity': value,
      '--jumi-opacity-keyframes': 'jumi-opacity',
    }),
  },
  'animate-order': {
    key: 'order',
    property: value => ({
      '--jumi-order': value,
      '--jumi-order-keyframes': 'jumi-order',
    }),
  },
  'animate-outline': {
    key: 'outlineWidth',
    property: value => ({
      '--jumi-outline-keyframes': 'jumi-outline',
      '--jumi-outline-width': value,
    }),
  },
  'animate-outline-color': {
    key: 'colors',
    property: value => ({
      '--jumi-outline-color': value,
      '--jumi-outline-keyframes': 'jumi-outline',
    }),
  },
  'animate-outline-offset': {
    key: 'outlineOffset',
    property: value => ({
      '--jumi-outline-keyframes': 'jumi-outline',
      '--jumi-outline-offset': value,
    }),
  },
  'animate-overflow': {
    property: value => ({
      '--jumi-overflow': value,
      '--jumi-overflow-keyframes': 'jumi-overflow',
    }),
    values: overflow,
  },
  'animate-overflow-x': {
    property: value => ({
      '--jumi-overflow-keyframes': 'jumi-overflow',
      '--jumi-overflow-x': value,
    }),
    values: overflow,
  },
  'animate-overflow-y': {
    property: value => ({
      '--jumi-overflow-keyframes': 'jumi-overflow',
      '--jumi-overflow-y': value,
    }),
    values: overflow,
  },
  'animate-padding': {
    key: 'padding',
    property: value => ({
      '--jumi-padding': value,
      '--jumi-padding-keyframes': 'jumi-padding',
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-block': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-block': value,
      '--jumi-padding-keyframes': 'jumi-padding',
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-bottom': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-bottom': value,
      '--jumi-padding-keyframes': 'jumi-padding',
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-inline': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-inline': value,
      '--jumi-padding-keyframes': 'jumi-padding',
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-left': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-keyframes': 'jumi-padding',
      '--jumi-padding-left': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-right': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-keyframes': 'jumi-padding',
      '--jumi-padding-right': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-padding-top': {
    key: 'padding',
    property: value => ({
      '--jumi-padding-keyframes': 'jumi-padding',
      '--jumi-padding-top': value,
    }),
    supportsNegativeValues: true,
  },
  'animate-position': {
    property: value => ({
      '--jumi-position': value,
      '--jumi-position-keyframes': 'jumi-position',
    }),
    values: position,
  },
  'animate-reveal-bottom': {
    key: 'borderWidth',
    property: value => ({
      '&::before': {
        '--jumi-width': value,
        'animation-name': 'reveal-bottom',
        'background-color': css('var', '--jumi-border-color'),
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
      '--jumi-right-keyframes': 'jumi-right',
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage', 'any'],
  },
  'animate-rotate': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate': css('rotate', value),
      '--jumi-rotate-angle': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'angle',
  },
  'animate-rotate-3d': {
    property: value => ({
      '--jumi-rotate-3d': css('rotate3d', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    values: empty.string,
  },
  'animate-rotate-3x': {
    property: value => ({
      '--jumi-rotate-3x': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    type: 'number',
    values: empty.string,
  },
  'animate-rotate-3y': {
    property: value => ({
      '--jumi-rotate-3y': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    type: 'number',
    values: empty.string,
  },
  'animate-rotate-3z': {
    property: value => ({
      '--jumi-rotate-3z': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    type: 'number',
    values: empty.string,
  },
  'animate-rotate-x': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-x': css('rotateX', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    type: 'angle',
  },
  'animate-rotate-y': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-y': css('rotateY', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    type: 'angle',
  },
  'animate-rotate-z': {
    key: 'rotate',
    property: value => ({
      '--jumi-rotate-z': css('rotateZ', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    type: 'angle',
  },
  'animate-row-gap': {
    property: value => ({
      '--jumi-gap-keyframes': 'jumi-gap',
      '--jumi-row-gap': value,
    }),
    values: empty.number,
  },
  'animate-scale': {
    key: 'scale',
    property: value => ({
      '--jumi-scale': css('scale', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
  },
  'animate-scale-3x': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-3x': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-3y': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-3y': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-3z': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-3z': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-x': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-x': css('scaleX', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-y': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-y': css('scaleY', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-scale-z': {
    key: 'scale',
    property: value => ({
      '--jumi-scale-z': css('scaleZ', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
    type: 'number',
  },
  'animate-skew': {
    key: 'skew',
    property: value => ({
      '--jumi-skew': css('skew', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-sx': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-sx': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-sy': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-sy': value,
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-x': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-x': css('skewX', value),
      '--jumi-transform-keyframes': 'jumi-transform',
    }),
    supportsNegativeValues: true,
  },
  'animate-skew-y': {
    key: 'skew',
    property: value => ({
      '--jumi-skew-y': css('skewY', value),
      '--jumi-transform-keyframes': 'jumi-transform',
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
  'animate-top': {
    key: 'inset',
    property: value => ({
      '--jumi-top': value,
      '--jumi-top-keyframes': 'jumi-top',
    }),
    supportsNegativeValues: true,
    type: ['length', 'percentage', 'any'],
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
      '--jumi-translate-3d': css('translate3d', value),
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
      '--jumi-translate-x': css('translateX', value),
    }),
    supportsNegativeValues: true,
    values: empty.string,
  },
  'animate-translate-y': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-y': css('translateY', value),
    }),
    supportsNegativeValues: true,
    values: empty.string,
  },
  'animate-translate-z': {
    property: value => ({
      '--jumi-transform-keyframes': 'jumi-transform',
      '--jumi-translate-z': css('translateZ', value),
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
  'animation-composition': {
    property: value => ({
      '--jumi-animation-composition': value,
    }),
    values: animationComposition,
  },
  'animation-delay': {
    property: value => ({
      '--jumi-animation-delay': value,
    }),
    values: animationDelay,
  },
  'animation-direction': {
    property: value => ({
      '--jumi-animation-direction': value,
    }),
    values: animationDirection,
  },
  'animation-duration': {
    modifiers,
    property: value => ({
      '--jumi-animation-duration': value,
    }),
    values: animationDuration,
  },
  'animation-fill-mode': {
    property: value => ({
      '--jumi-animation-fill-mode': value,
    }),
    values: animationFillMode,
  },
  'animation-iteration-count': {
    property: value => ({
      '--jumi-animation-iteration-count': value,
    }),
    type: 'number',
    values: animationIterationCount,
  },
  'animation-play-state': {
    property: value => ({
      '--jumi-animation-play-state': value,
    }),
    values: animationPlayState,
  },
  'animation-range': {
    property: value => ({
      '--jumi-animation-range': value,
    }),
    values: animationRange,
  },
  'animation-range-end': {
    property: value => ({
      '--jumi-animation-range-end': value,
    }),
    type: ['length', 'percentage', 'any'],
    values: animationRange,
  },
  'animation-range-end-length': {
    property: value => ({
      '--jumi-animation-range-end-length': value,
    }),
    type: ['length', 'percentage'],
    values: percentage,
  },
  'animation-range-end-name': {
    property: value => ({
      '--jumi-animation-range-end-name': value,
    }),
    values: animationRangeTimeline,
  },
  'animation-range-start': {
    property: value => ({
      '--jumi-animation-range-start': value,
    }),
    type: ['length', 'percentage', 'any'],
    values: animationRange,
  },
  'animation-range-start-length': {
    property: value => ({
      '--jumi-animation-range-start-length': value,
    }),
    type: ['length', 'percentage'],
    values: percentage,
  },
  'animation-range-start-name': {
    property: value => ({
      '--jumi-animation-range-start-name': value,
    }),
    values: animationRangeTimeline,
  },
  'animation-timeline': {
    property: value => ({
      '--jumi-animation-timeline': value,
    }),
    values: animationTimeline,
  },
  'animation-timeline-axis': {
    property: value => ({
      '--jumi-animation-timeline-axis': value,
    }),
    values: animationTimelineAxis,
  },
  'animation-timeline-inset-end': {
    property: value => ({
      '--jumi-animation-timeline-inset-end': value,
    }),
    type: 'length',
    values: animationTimelineInset,
  },
  'animation-timeline-inset-start': {
    property: value => ({
      '--jumi-animation-timeline-inset-start': value,
    }),
    type: 'length',
    values: animationTimelineInset,
  },
  'animation-timeline-scroller': {
    property: value => ({
      '--jumi-animation-timeline-scroller': value,
    }),
    type: 'length',
    values: animationTimelineScroller,
  },
  'animation-timing-function': {
    property: value => ({
      '--jumi-animation-timing-function': value,
    }),
    values: animationTimingFunction,
  },
}
