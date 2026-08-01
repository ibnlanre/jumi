import type { Collection, GetMatchUtilities, MatchProperty } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { cssEffects } from '@/keyframes/effects'
import { cssProperties } from '@/keyframes/property'
import { alignContent } from '@/theme/align-content'
import { alignItems } from '@/theme/align-items'
import { alignSelf } from '@/theme/align-self'
import { alignmentBaseline } from '@/theme/alignment-baseline'
import { all } from '@/theme/all'
import { animationComposition } from '@/theme/animation-composition'
import { animationDirection } from '@/theme/animation-direction'
import { animationFillMode } from '@/theme/animation-fill-mode'
import { animationIterationCount } from '@/theme/animation-iteration-count'
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
import { gridAutoFlow, gridAutoFlowPacking } from '@/theme/grid-auto-flow'
import { gridSize } from '@/theme/grid-size'
import { hangingPunctuation } from '@/theme/hanging-punctuation'
import { hyphenateLimitChars, hyphenateLimitCharsProperties } from '@/theme/hyphenate-limit-chars'
import { hyphens } from '@/theme/hyphens'
import { imageOrientation } from '@/theme/image-orientation'
import { imageRendering } from '@/theme/image-rendering'
import { initialLetter, initialLetterPosition } from '@/theme/initial-letter'
import { inlineSize } from '@/theme/inline-size'
import { inset } from '@/theme/inset'
import { justifyContent } from '@/theme/justify-content'
import { justifyItems } from '@/theme/justify-items'
import { justifySelf } from '@/theme/justify-self'
import { lineBreak } from '@/theme/line-break'
import { listStylePosition } from '@/theme/list-style-position'
import { listStyleType } from '@/theme/list-style-type'
import { maskBorderRepeat } from '@/theme/mask-border-repeat'
import { maskClip } from '@/theme/mask-clip'
import { maskComposite } from '@/theme/mask-composite'
import { maskMode } from '@/theme/mask-mode'
import { maskOrigin } from '@/theme/mask-origin'
import { maskType } from '@/theme/mask-type'
import { maskBorderSlice } from '@/theme/maskBorderSlice'
import { mathDepth } from '@/theme/math-depth'
import { mathStyle } from '@/theme/math-style'
import { mixBlendMode } from '@/theme/mix-blend-mode'
import { objectFit } from '@/theme/object-fit'
import { objectPosition } from '@/theme/object-position'
import { offsetAnchor } from '@/theme/offset-anchor'
import { offsetPath } from '@/theme/offset-path'
import { offsetPosition } from '@/theme/offset-position'
import { offsetRotate } from '@/theme/offset-rotate'
import { originX, originY } from '@/theme/origin'
import { outlineStyle } from '@/theme/outline-style'
import { overflow } from '@/theme/overflow'
import { overflowAnchor } from '@/theme/overflow-anchor'
import { overflowClipMargin } from '@/theme/overflow-clip-margin'
import { overflowWrap } from '@/theme/overflow-wrap'
import { overscrollBehavior } from '@/theme/overscroll-behavior'
import { paintOrder } from '@/theme/paint-order'
import { percentage } from '@/theme/percentage'
import { position } from '@/theme/position'
import { rotate } from '@/theme/rotate'
import { textAlign } from '@/theme/text-align'
import { transformStyle } from '@/theme/transform-style'
import { transitionBehavior } from '@/theme/transition-behavior'
import { visibility } from '@/theme/visibility'

export const getMatchUtilities: GetMatchUtilities = (creator) => {
  const { effect, motion, property, theme } = creator
  const modifiers = merge(cssProperties, cssEffects)

  const matchProperties: Partial<MatchProperty> = {
    'animate': {
      fn: (value) => {
        return ({
          [`--jumi-${value}-animation-name`]: effect(value),
        })
      },
      values: cssEffects,
    },
    'animate-accent-color': {
      fn: (value) => {
        return ({
          '--jumi-accent-color': value,
          '--jumi-accent-color-animation-name': property('accent-color', value),
        })
      },
      type: 'color',
      values: theme('accentColor'),
    },
    'animate-align-content': {
      fn: (value) => {
        return ({
          '--jumi-align-content': value,
          '--jumi-align-content-animation-name': property('align-content', value),
        })
      },
      values: alignContent,
    },
    'animate-align-items': {
      fn: (value) => {
        return ({
          '--jumi-align-items': value,
          '--jumi-align-items-animation-name': property('align-items', value),
        })
      },
      values: alignItems,
    },
    'animate-align-self': {
      fn: (value) => {
        return ({
          '--jumi-align-self': value,
          '--jumi-align-self-animation-name': property('align-self', value),
        })
      },
      values: alignSelf,
    },
    'animate-alignment-baseline': {
      fn: (value) => {
        return ({
          '--jumi-alignment-baseline': value,
          '--jumi-alignment-baseline-animation-name': property('alignment-baseline', value),
        })
      },
      values: alignmentBaseline,
    },
    'animate-all': {
      fn: (value) => {
        return ({
          '--jumi-all': value,
          '--jumi-all-animation-name': property('all', value),
        })
      },
      values: all,
    },
    'animate-appearance': {
      fn: (value) => {
        return ({
          '--jumi-appearance': value,
          '--jumi-appearance-animation-name': property('appearance', value),
        })
      },
      values: appearance,
    },
    'animate-aspect-ratio': {
      fn: (value) => {
        return ({
          '--jumi-aspect-ratio': value,
          '--jumi-aspect-ratio-animation-name': property('aspect-ratio', value),
        })
      },
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-height': {
      fn: (value) => {
        return ({
          '--jumi-aspect-ratio-animation-name': property('aspect-ratio', value),
          '--jumi-aspect-ratio-height': value,
        })
      },
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-width': {
      fn: (value) => {
        return ({
          '--jumi-aspect-ratio-animation-name': property('aspect-ratio', value),
          '--jumi-aspect-ratio-width': value,
        })
      },
      type: 'ratio',
      values: empty.auto,
    },
    'animate-backdrop-filter': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter': value,
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
        })
      },
      values: empty.none,
    },
    'animate-backdrop-filter-blur': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-blur': css('blur', value),
        })
      },
      type: 'length',
      values: theme('backdropBlur'),
    },
    'animate-backdrop-filter-brightness': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-brightness': css('brightness', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropBrightness'),
    },
    'animate-backdrop-filter-contrast': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-contrast': css('contrast', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropContrast'),
    },
    'animate-backdrop-filter-drop-shadow': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-drop-shadow': css('drop-shadow', value),
        })
      },
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-backdrop-filter-drop-shadow-blur': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-drop-shadow-blur': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-color': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-drop-shadow-color': value,
        })
      },
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-backdrop-filter-drop-shadow-offset-x': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-drop-shadow-offset-x': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-offset-y': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-drop-shadow-offset-y': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-grayscale': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-grayscale': css('grayscale', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropGrayscale'),
    },
    'animate-backdrop-filter-hue-rotate': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-hue-rotate': css('hue-rotate', value),
        })
      },
      type: 'angle',
      values: theme('backdropHueRotate'),
    },
    'animate-backdrop-filter-invert': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-invert': css('invert', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropInvert'),
    },
    'animate-backdrop-filter-opacity': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-opacity': css('opacity', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropOpacity'),
    },
    'animate-backdrop-filter-saturate': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-saturate': css('saturate', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropSaturate'),
    },
    'animate-backdrop-filter-sepia': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-sepia': css('sepia', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('backdropSepia'),
    },
    'animate-backdrop-filter-url': {
      fn: (value) => {
        return ({
          '--jumi-backdrop-filter-animation-name': property('backdrop-filter', value),
          '--jumi-backdrop-filter-url': css('url', value),
        })
      },
      type: 'url',
      values: empty.string,
    },
    'animate-backface-visibility': {
      fn: (value) => {
        return ({
          '--jumi-backface-visibility': value,
          '--jumi-backface-visibility-animation-name': property('backface-visibility', value),
        })
      },
      values: backfaceVisibility,
    },
    'animate-background': {
      fn: (value) => {
        return ({
          '--jumi-background': value,
          '--jumi-background-animation-name': property('background', value),
        })
      },
      type: ['color', 'image', 'position', 'url', 'any'],
      values: empty.none,
    },
    'animate-background-attachment': {
      fn: (value) => {
        return ({
          '--jumi-background-attachment': value,
          '--jumi-background-attachment-animation-name': property('background-attachment', value),
        })
      },
      values: backgroundAttachment,
    },
    'animate-background-blend-mode': {
      fn: (value) => {
        return ({
          '--jumi-background-blend-mode': value,
          '--jumi-background-blend-mode-animation-name': property('background-blend-mode', value),
        })
      },
      values: mixBlendMode,
    },
    'animate-background-clip': {
      fn: (value) => {
        return ({
          '--jumi-background-clip': value,
          '--jumi-background-clip-animation-name': property('background-clip', value),
        })
      },
      values: backgroundClip,
    },
    'animate-background-color': {
      fn: (value) => {
        return ({
          '--jumi-background-color': value,
          '--jumi-background-color-animation-name': property('background-color', value),
        })
      },
      type: 'color',
      values: theme('backgroundColor'),
    },
    'animate-background-image': {
      fn: (value) => {
        return ({
          '--jumi-background-image': value,
          '--jumi-background-image-animation-name': property('background-image', value),
        })
      },
      type: 'image',
      values: theme('backgroundImage'),
    },
    'animate-background-origin': {
      fn: (value) => {
        return ({
          '--jumi-background-origin': value,
          '--jumi-background-origin-animation-name': property('background-origin', value),
        })
      },
      values: backgroundOrigin,
    },
    'animate-background-position': {
      fn: (value) => {
        return ({
          '--jumi-background-position': value,
          '--jumi-background-position-animation-name': property('background-position', value),
        })
      },
      type: ['position', 'percentage', 'length', 'any'],
      values: theme('backgroundPosition'),
    },
    'animate-background-position-x': {
      fn: (value) => {
        return ({
          '--jumi-background-position-animation-name': property('background-position', value),
          '--jumi-background-position-x': value,
        })
      },
      type: ['position', 'percentage', 'length', 'any'],
      values: empty.position,
    },
    'animate-background-position-x-edge': {
      fn: (value) => {
        return ({
          '--jumi-background-position-animation-name': property('background-position', value),
          '--jumi-background-position-x-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-x-offset': {
      fn: (value) => {
        return ({
          '--jumi-background-position-animation-name': property('background-position', value),
          '--jumi-background-position-x-offset': value,
        })
      },
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-position-y': {
      fn: (value) => {
        return ({
          '--jumi-background-position-animation-name': property('background-position', value),
          '--jumi-background-position-y': value,
        })
      },
      type: ['position', 'percentage', 'length', 'any'],
      values: merge(objectPosition, percentage),
    },
    'animate-background-position-y-edge': {
      fn: (value) => {
        return ({
          '--jumi-background-position-animation-name': property('background-position', value),
          '--jumi-background-position-y-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-y-offset': {
      fn: (value) => {
        return ({
          '--jumi-background-position-animation-name': property('background-position', value),
          '--jumi-background-position-y-offset': value,
        })
      },
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-repeat': {
      fn: (value) => {
        return ({
          '--jumi-background-repeat': value,
          '--jumi-background-repeat-animation-name': property('background-repeat', value),
        })
      },
      values: backgroundRepeat,
    },
    'animate-background-repeat-x': {
      fn: (value) => {
        return ({
          '--jumi-background-repeat-animation-name': property('background-repeat', value),
          '--jumi-background-repeat-x': value,
        })
      },
      values: backgroundRepeatAxis,
    },
    'animate-background-repeat-y': {
      fn: (value) => {
        return ({
          '--jumi-background-repeat-animation-name': property('background-repeat', value),
          '--jumi-background-repeat-y': value,
        })
      },
      values: backgroundRepeatAxis,
    },
    'animate-background-size': {
      fn: (value) => {
        return ({
          '--jumi-background-size': value,
          '--jumi-background-size-animation-name': property('background-size', value),
        })
      },
      values: theme('backgroundSize'),
    },
    'animate-background-size-height': {
      fn: (value) => {
        return ({
          '--jumi-background-size-animation-name': property('background-size', value),
          '--jumi-background-size-height': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-background-size-width': {
      fn: (value) => {
        return ({
          '--jumi-background-size-animation-name': property('background-size', value),
          '--jumi-background-size-width': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-block-size': {
      fn: (value) => {
        return ({
          '--jumi-block-size': value,
          '--jumi-block-size-animation-name': property('block-size', value),
        })
      },
      type: ['length', 'percentage', 'any'],
      values: empty.auto,
    },
    'animate-border': {
      fn: (value) => {
        return ({
          '--jumi-border': value,
          '--jumi-border-animation-name': property('border', value),
        })
      },
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-border-block': {
      fn: (value) => {
        return ({
          '--jumi-border-block': value,
          '--jumi-border-block-animation-name': property('border-block', value),
        })
      },
      values: theme('borderWidth'),
    },
    'animate-border-block-color': {
      fn: (value) => {
        return ({
          '--jumi-border-block-animation-name': property('border-block-color', value),
          '--jumi-border-block-color': value,
        })
      },
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-block-end-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-end-end-radius': value,
          '--jumi-border-end-start-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-block-end-width': {
      fn: (value) => {
        return ({
          '--jumi-border-block-end-width': value,
          '--jumi-border-block-end-width-animation-name': property('border-block-end-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-start-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-radius-animation-name': property('border-radius', value),
          '--jumi-border-start-end-radius': value,
          '--jumi-border-start-start-radius': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-block-start-width': {
      fn: (value) => {
        return ({
          '--jumi-border-block-start-width': value,
          '--jumi-border-block-start-width-animation-name': property('border-block-start-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-width': {
      fn: (value) => {
        return ({
          '--jumi-border-block-end-width': value,
          '--jumi-border-block-start-width': value,
          '--jumi-border-block-width-animation-name': property('border-block-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-bottom-left-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-bottom-left-radius': value,
          '--jumi-border-bottom-left-radius-animation-name': property('border-bottom-left-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-bottom-left-radius': value,
          '--jumi-border-bottom-right-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-right-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-bottom-right-radius': value,
          '--jumi-border-bottom-right-radius-animation-name': property('border-bottom-right-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-width': {
      fn: (value) => {
        return ({
          '--jumi-border-bottom-width': value,
          '--jumi-border-bottom-width-animation-name': property('border-bottom-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-collapse': {
      fn: (value) => {
        return ({
          '--jumi-border-collapse': value,
          '--jumi-border-collapse-animation-name': property('border-collapse', value),
        })
      },
      values: borderCollapse,
    },
    'animate-border-color': {
      fn: (value) => {
        return ({
          '--jumi-border-color': value,
          '--jumi-border-color-animation-name': property('border-color', value),
        })
      },
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-end-end-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-end-end-radius': value,
          '--jumi-border-end-end-radius-animation-name': property('border-end-end-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-end-start-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-end-start-radius': value,
          '--jumi-border-end-start-radius-animation-name': property('border-end-start-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-image': {
      fn: (value) => {
        return ({
          '--jumi-border-image': value,
          '--jumi-border-image-animation-name': property('border-image', value),
        })
      },
      type: 'image',
      values: empty.none,
    },
    'animate-border-image-outset': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset': value,
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-bottom': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
          '--jumi-border-image-outset-bottom': value,
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-left': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
          '--jumi-border-image-outset-left': value,
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-right': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
          '--jumi-border-image-outset-right': value,
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-top': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
          '--jumi-border-image-outset-top': value,
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-x': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
          '--jumi-border-image-outset-left': value,
          '--jumi-border-image-outset-right': value,
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-y': {
      fn: (value) => {
        return ({
          '--jumi-border-image-outset-animation-name': property('border-image-outset', value),
          '--jumi-border-image-outset-bottom': value,
          '--jumi-border-image-outset-top': value,
        })
      },
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-repeat': {
      fn: (value) => {
        return ({
          '--jumi-border-image-repeat': value,
          '--jumi-border-image-repeat-animation-name': property('border-image-repeat', value),
        })
      },
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-x': {
      fn: (value) => {
        return ({
          '--jumi-border-image-repeat-animation-name': property('border-image-repeat', value),
          '--jumi-border-image-repeat-x': value,
        })
      },
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-y': {
      fn: (value) => {
        return ({
          '--jumi-border-image-repeat-animation-name': property('border-image-repeat', value),
          '--jumi-border-image-repeat-y': value,
        })
      },
      values: borderImageRepeat,
    },
    'animate-border-inline-end-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-end-end-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
          '--jumi-border-start-end-radius': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-inline-end-width': {
      fn: (value) => {
        return ({
          '--jumi-border-inline-end-width': value,
          '--jumi-border-inline-end-width-animation-name': property('border-inline-end-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-start-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-end-start-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
          '--jumi-border-start-start-radius': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-inline-start-width': {
      fn: (value) => {
        return ({
          '--jumi-border-inline-start-width': value,
          '--jumi-border-inline-start-width-animation-name': property('border-inline-start-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-width': {
      fn: (value) => {
        return ({
          '--jumi-border-inline-end-width': value,
          '--jumi-border-inline-start-width': value,
          '--jumi-border-inline-width-animation-name': property('border-inline-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-left-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-bottom-left-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
          '--jumi-border-top-left-radius': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-left-width': {
      fn: (value) => {
        return ({
          '--jumi-border-left-width': value,
          '--jumi-border-left-width-animation-name': property('border-left-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-right-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-bottom-right-radius': value,
          '--jumi-border-radius-animation-name': property('border-radius', value),
          '--jumi-border-top-right-radius': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-right-width': {
      fn: (value) => {
        return ({
          '--jumi-border-right-width': value,
          '--jumi-border-right-width-animation-name': property('border-right-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-start-end-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-start-end-radius': value,
          '--jumi-border-start-end-radius-animation-name': property('border-start-end-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-start-start-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-start-start-radius': value,
          '--jumi-border-start-start-radius-animation-name': property('border-start-start-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-left-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-top-left-radius': value,
          '--jumi-border-top-left-radius-animation-name': property('border-top-left-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-radius-animation-name': property('border-radius', value),
          '--jumi-border-top-left-radius': value,
          '--jumi-border-top-right-radius': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-right-radius': {
      fn: (value) => {
        return ({
          '--jumi-border-top-right-radius': value,
          '--jumi-border-top-right-radius-animation-name': property('border-top-right-radius', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-width': {
      fn: (value) => {
        return ({
          '--jumi-border-top-width': value,
          '--jumi-border-top-width-animation-name': property('border-top-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-width': {
      fn: (value) => {
        return ({
          '--jumi-border-width': value,
          '--jumi-border-width-animation-name': property('border-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-bottom': {
      fn: (value) => {
        return ({
          '--jumi-bottom': value,
          '--jumi-bottom-animation-name': property('bottom', value),
        })
      },
      supportsNegativeValues: true,
      type: ['number', 'length', 'percentage'],
      values: theme('inset', inset),
    },
    'animate-box-decoration-break': {
      fn: (value) => {
        return ({
          '--jumi-box-decoration-break': value,
          '--jumi-box-decoration-break-animation-name': property('box-decoration-break', value),
        })
      },
      values: boxDecorationBreak,
    },
    'animate-box-shadow': {
      fn: (value) => {
        return ({
          '--jumi-box-shadow': value,
          '--jumi-box-shadow-animation-name': property('box-shadow', value),
        })
      },
      type: ['length', 'shadow', 'any'],
      values: theme('boxShadow'),
    },
    'animate-box-shadow-blur': {
      fn: (value) => {
        return ({
          '--jumi-box-shadow-animation-name': property('box-shadow', value),
          '--jumi-box-shadow-blur': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-box-shadow-color': {
      fn: (value) => {
        return ({
          '--jumi-box-shadow-animation-name': property('box-shadow', value),
          '--jumi-box-shadow-color': value,
        })
      },
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-box-shadow-offset-x': {
      fn: (value) => {
        return ({
          '--jumi-box-shadow-animation-name': property('box-shadow', value),
          '--jumi-box-shadow-offset-x': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-offset-y': {
      fn: (value) => {
        return ({
          '--jumi-box-shadow-animation-name': property('box-shadow', value),
          '--jumi-box-shadow-offset-y': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-spread': {
      fn: (value) => {
        return ({
          '--jumi-box-shadow-animation-name': property('box-shadow', value),
          '--jumi-box-shadow-spread': value,
        })
      },
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-sizing': {
      fn: (value) => {
        return ({
          '--jumi-box-sizing': value,
          '--jumi-box-sizing-animation-name': property('box-sizing', value),
        })
      },
      values: boxSizing,
    },
    'animate-break-after': {
      fn: (value) => {
        return ({
          '--jumi-break-after': value,
          '--jumi-break-after-animation-name': property('break-after', value),
        })
      },
      values: breakAfter,
    },
    'animate-break-before': {
      fn: (value) => {
        return ({
          '--jumi-break-before': value,
          '--jumi-break-before-animation-name': property('break-before', value),
        })
      },
      values: breakBefore,
    },
    'animate-break-inside': {
      fn: (value) => {
        return ({
          '--jumi-break-inside': value,
          '--jumi-break-inside-animation-name': property('break-inside', value),
        })
      },
      values: breakInside,
    },
    'animate-caption-side': {
      fn: (value) => {
        return ({
          '--jumi-caption-side': value,
          '--jumi-caption-side-animation-name': property('caption-side', value),
        })
      },
      values: captionSide,
    },
    'animate-caret-color': {
      fn: (value) => {
        return ({
          '--jumi-caret-color': value,
          '--jumi-caret-color-animation-name': property('caret-color', value),
        })
      },
      type: 'color',
      values: theme('caretColor'),
    },
    'animate-clear': {
      fn: (value) => {
        return ({
          '--jumi-clear': value,
          '--jumi-clear-animation-name': property('clear', value),
        })
      },
      values: clear,
    },
    'animate-clip-path': {
      fn: (value) => {
        return ({
          '--jumi-clip-path': value,
          '--jumi-clip-path-animation-name': property('clip-path', value),
        })
      },
      values: clipPath,
    },
    'animate-clip-rule': {
      fn: (value) => {
        return ({
          '--jumi-clip-rule': value,
          '--jumi-clip-rule-animation-name': property('clip-rule', value),
        })
      },
      values: clipRule,
    },
    'animate-color': {
      fn: (value) => {
        return ({
          '--jumi-color': value,
          '--jumi-color-animation-name': property('color', value),
        })
      },
      type: 'color',
      values: theme('colors'),
    },
    'animate-color-interpolation': {
      fn: (value) => {
        return ({
          '--jumi-color-interpolation': value,
          '--jumi-color-interpolation-animation-name': property('color-interpolation', value),
        })
      },
      values: colorInterpolation,
    },
    'animate-color-interpolation-filters': {
      fn: (value) => {
        return ({
          '--jumi-color-interpolation-filters': value,
          '--jumi-color-interpolation-filters-animation-name': property('color-interpolation-filters', value),
        })
      },
      values: colorInterpolation,
    },
    'animate-color-scheme': {
      fn: (value) => {
        return ({
          '--jumi-color-scheme': value,
          '--jumi-color-scheme-animation-name': property('color-scheme', value),
        })
      },
      values: colorScheme,
    },
    'animate-column-count': {
      fn: (value) => {
        return ({
          '--jumi-column-count': value,
          '--jumi-column-count-animation-name': property('column-count', value),
        })
      },
      type: 'integer',
      values: empty.auto,
    },
    'animate-column-fill': {
      fn: (value) => {
        return ({
          '--jumi-column-fill': value,
          '--jumi-column-fill-animation-name': property('column-fill', value),
        })
      },
      values: columnFill,
    },
    'animate-column-gap': {
      fn: (value) => {
        return ({
          '--jumi-column-gap': value,
          '--jumi-gap-animation-name': property('gap', value),
        })
      },
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-column-rule': {
      fn: (value) => {
        return ({
          '--jumi-column-rule': value,
          '--jumi-column-rule-animation-name': property('column-rule', value),
        })
      },
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-column-rule-color': {
      fn: (value) => {
        return ({
          '--jumi-column-rule-color': value,
          '--jumi-column-rule-color-animation-name': property('column-rule-color', value),
        })
      },
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-column-rule-style': {
      fn: (value) => {
        return ({
          '--jumi-column-rule-style': value,
          '--jumi-column-rule-style-animation-name': property('column-rule-style', value),
        })
      },
      values: columnRuleStyle,
    },
    'animate-column-rule-width': {
      fn: (value) => {
        return ({
          '--jumi-column-rule-width': value,
          '--jumi-column-rule-width-animation-name': property('column-rule-width', value),
        })
      },
      type: ['line-width', 'length'],
      values: columnRuleWidth,
    },
    'animate-column-span': {
      fn: (value) => {
        return ({
          '--jumi-column-span': value,
          '--jumi-column-span-animation-name': property('column-span', value),
        })
      },
      type: 'integer',
      values: columnSpan,
    },
    'animate-column-width': {
      fn: (value) => {
        return ({
          '--jumi-column-width': value,
          '--jumi-column-width-animation-name': property('column-width', value),
        })
      },
      type: ['length', 'percentage'],
      values: columnWidth,
    },
    'animate-columns': {
      fn: (value) => {
        return ({
          '--jumi-columns': value,
          '--jumi-columns-animation-name': property('columns', value),
        })
      },
      type: ['line-width', 'length', 'integer'],
      values: empty.auto,
    },
    'animate-contain': {
      fn: (value) => {
        return ({
          '--jumi-contain': value,
          '--jumi-contain-animation-name': property('contain', value),
        })
      },
      values: contain,
    },
    'animate-contain-intrinsic-block-size': {
      fn: (value) => {
        return ({
          '--jumi-contain-intrinsic-block-size': value,
          '--jumi-contain-intrinsic-block-size-animation-name': property('contain-intrinsic-block-size', value),
        })
      },
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-height': {
      fn: (value) => {
        return ({
          '--jumi-contain-intrinsic-height': value,
          '--jumi-contain-intrinsic-height-animation-name': property('contain-intrinsic-height', value),
        })
      },
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-inline-size': {
      fn: (value) => {
        return ({
          '--jumi-contain-intrinsic-inline-size': value,
          '--jumi-contain-intrinsic-inline-size-animation-name': property('contain-intrinsic-inline-size', value),
        })
      },
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-size': {
      fn: (value) => {
        return ({
          '--jumi-contain-intrinsic-size': value,
          '--jumi-contain-intrinsic-size-animation-name': property('contain-intrinsic-size', value),
        })
      },
      type: 'length',
      values: empty.none,
    },
    'animate-contain-intrinsic-width': {
      fn: (value) => {
        return ({
          '--jumi-contain-intrinsic-width': value,
          '--jumi-contain-intrinsic-width-animation-name': property('contain-intrinsic-width', value),
        })
      },
      type: 'length',
      values: containIntrinsic,
    },
    'animate-content': {
      fn: (value) => {
        return ({
          '--jumi-content': value,
          '--jumi-content-animation-name': property('content', value),
        })
      },
      type: ['image', 'any'],
      values: content,
    },
    'animate-content-visibility': {
      fn: (value) => {
        return ({
          '--jumi-content-visibility': value,
          '--jumi-content-visibility-animation-name': property('content-visibility', value),
        })
      },
      values: contentVisibility,
    },
    'animate-counter-increment': {
      fn: (value) => {
        return ({
          '--jumi-counter-increment': value,
          '--jumi-counter-increment-animation-name': property('counter-increment', value),
        })
      },
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-reset': {
      fn: (value) => {
        return ({
          '--jumi-counter-reset': value,
          '--jumi-counter-reset-animation-name': property('counter-reset', value),
        })
      },
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-set': {
      fn: (value) => {
        return ({
          '--jumi-counter-set': value,
          '--jumi-counter-set-animation-name': property('counter-set', value),
        })
      },
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-cursor': {
      fn: (value) => {
        return ({
          '--jumi-cursor': value,
          '--jumi-cursor-animation-name': property('cursor', value),
        })
      },
      values: cursor,
    },
    'animate-cx': {
      fn: (value) => {
        return ({
          '--jumi-cx': value,
          '--jumi-cx-animation-name': property('cx', value),
        })
      },
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-cy': {
      fn: (value) => {
        return ({
          '--jumi-cy': value,
          '--jumi-cy-animation-name': property('cy', value),
        })
      },
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-d': {
      fn: (value) => {
        return ({
          '--jumi-d': value,
          '--jumi-d-animation-name': property('d', value),
        })
      },
      values: empty.none,
    },
    'animate-display': {
      fn: (value) => {
        return ({
          '--jumi-display': value,
          '--jumi-display-animation-name': property('display', value),
        })
      },
      values: display,
    },
    'animate-display-inside': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-display-animation-name': property('display', value),
          '--jumi-display-inside': modifier ? join([modifier, value]) : value,
        })
      },
      modifiers: displayOutside,
      values: displayInside,
    },
    'animate-display-outside': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-display-animation-name': property('display', value),
          '--jumi-display-outside': modifier ? join([value, modifier]) : value,
        })
      },
      modifiers: displayInside,
      values: displayOutside,
    },
    'animate-dominant-baseline': {
      fn: (value) => {
        return ({
          '--jumi-dominant-baseline': value,
          '--jumi-dominant-baseline-animation-name': property('dominant-baseline', value),
        })
      },
      values: dominantBaseline,
    },
    'animate-empty-cells': {
      fn: (value) => {
        return ({
          '--jumi-empty-cells': value,
          '--jumi-empty-cells-animation-name': property('empty-cells', value),
        })
      },
      values: emptyCells,
    },
    'animate-fill': {
      fn: (value) => {
        return ({
          '--jumi-fill': value,
          '--jumi-fill-animation-name': property('fill', value),
        })
      },
      type: ['color', 'url', 'any'],
      values: theme('colors', fill),
    },
    'animate-fill-opacity': {
      fn: (value) => {
        return ({
          '--jumi-fill-opacity': value,
          '--jumi-fill-opacity-animation-name': property('fill-opacity', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-fill-rule': {
      fn: (value) => {
        return ({
          '--jumi-fill-rule': value,
          '--jumi-fill-rule-animation-name': property('fill-rule', value),
        })
      },
      values: fillRule,
    },
    'animate-filter': {
      fn: (value) => {
        return ({
          '--jumi-filter': value,
          '--jumi-filter-animation-name': property('filter', value),
        })
      },
      values: empty.none,
    },
    'animate-filter-blur': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-blur': css('blur', value),
        })
      },
      type: 'length',
      values: theme('blur'),
    },
    'animate-filter-brightness': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-brightness': css('brightness', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('brightness'),
    },
    'animate-filter-contrast': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-contrast': css('contrast', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('contrast'),
    },
    'animate-filter-drop-shadow': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-drop-shadow': css('drop-shadow', value),
        })
      },
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-filter-drop-shadow-blur': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-drop-shadow-blur': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-filter-drop-shadow-color': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-drop-shadow-color': value,
        })
      },
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-filter-drop-shadow-offset-x': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-drop-shadow-offset-x': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-drop-shadow-offset-y': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-drop-shadow-offset-y': value,
        })
      },
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-grayscale': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-grayscale': css('grayscale', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('grayscale'),
    },
    'animate-filter-hue-rotate': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-hue-rotate': 'hue-rotate(' + value + ')',
        })
      },
      type: 'angle',
      values: theme('hueRotate'),
    },
    'animate-filter-invert': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-invert': css('invert', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('invert'),
    },
    'animate-filter-opacity': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-opacity': css('opacity', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-filter-saturate': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-saturate': css('saturate', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('saturate'),
    },
    'animate-filter-sepia': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-sepia': css('sepia', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('sepia'),
    },
    'animate-filter-url': {
      fn: (value) => {
        return ({
          '--jumi-filter-animation-name': property('filter', value),
          '--jumi-filter-url': css('url', value),
        })
      },
      type: 'url',
      values: empty.string,
    },
    'animate-flex': {
      fn: (value) => {
        return ({
          '--jumi-flex': value,
          '--jumi-flex-animation-name': property('flex', value),
        })
      },
      values: theme('flex'),
    },
    'animate-flex-basis': {
      fn: (value) => {
        return ({
          '--jumi-flex-basis': value,
          '--jumi-flex-basis-animation-name': property('flex-basis', value),
        })
      },
      values: theme('flexBasis'),
    },
    'animate-flex-direction': {
      fn: (value) => {
        return ({
          '--jumi-flex-direction': value,
          '--jumi-flex-direction-animation-name': property('flex-direction', value),
        })
      },
      values: flexDirection,
    },
    'animate-flex-flow': {
      fn: (value) => {
        return ({
          '--jumi-flex-flow': value,
          '--jumi-flex-flow-animation-name': property('flex-flow', value),
        })
      },
      values: empty.string,
    },
    'animate-flex-grow': {
      fn: (value) => {
        return ({
          '--jumi-flex-grow': value,
          '--jumi-flex-grow-animation-name': property('flex-grow', value),
        })
      },
      values: theme('flexGrow'),
    },
    'animate-flex-shrink': {
      fn: (value) => {
        return ({
          '--jumi-flex-shrink': value,
          '--jumi-flex-shrink-animation-name': property('flex-shrink', value),
        })
      },
      values: theme('flexShrink'),
    },
    'animate-flex-wrap': {
      fn: (value) => {
        return ({
          '--jumi-flex-wrap': value,
          '--jumi-flex-wrap-animation-name': property('flex-wrap', value),
        })
      },
      values: flexWrap,
    },
    'animate-float': {
      fn: (value) => {
        return ({
          '--jumi-float': value,
          '--jumi-float-animation-name': property('float', value),
        })
      },
      values: float,
    },
    'animate-flood-color': {
      fn: (value) => {
        return ({
          '--jumi-flood-color': value,
          '--jumi-flood-color-animation-name': property('flood-color', value),
        })
      },
      type: 'color',
      values: theme('colors'),
    },
    'animate-flood-opacity': {
      fn: (value) => {
        return ({
          '--jumi-flood-opacity': value,
          '--jumi-flood-opacity-animation-name': property('flood-opacity', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-font-family': {
      fn: (value) => {
        return ({
          '--jumi-font-family': value,
          '--jumi-font-family-animation-name': property('font-family', value),
        })
      },
      type: ['generic-name', 'family-name'],
      values: fontFamily,
    },
    'animate-font-feature-settings': {
      fn: (value) => {
        return ({
          '--jumi-font-feature-settings': value,
          '--jumi-font-feature-settings-animation-name': property('font-feature-settings', value),
        })
      },
      type: ['integer', 'any'],
      values: fontFeatureSettings,
    },
    'animate-font-kerning': {
      fn: (value) => {
        return ({
          '--jumi-font-kerning': value,
          '--jumi-font-kerning-animation-name': property('font-kerning', value),
        })
      },
      values: fontKerning,
    },
    'animate-font-size': {
      fn: (value) => {
        return ({
          '--jumi-font-size': value,
          '--jumi-font-size-animation-name': property('font-size', value),
        })
      },
      values: fontSize,
    },
    'animate-font-size-adjust': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-font-size-adjust': modifier ? join([value, modifier]) : value,
          '--jumi-font-size-adjust-animation-name': property('font-size-adjust', value),
        })
      },
      modifiers: fontSizeAdjustMetric,
      type: ['number', 'any'],
      values: fontSizeAdjust,
    },
    'animate-font-style': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-font-style': modifier ? join([value, modifier]) : value,
          '--jumi-font-style-animation-name': property('font-style', value),
        })
      },
      values: fontStyle,
    },
    'animate-font-synthesis': {
      fn: (value) => {
        return ({
          '--jumi-font-synthesis': value,
          '--jumi-font-synthesis-animation-name': property('font-synthesis', value),
        })
      },
      values: empty.none,
    },
    'animate-font-synthesis-small-caps': {
      fn: (value) => {
        return ({
          '--jumi-font-synthesis-small-caps': value,
          '--jumi-font-synthesis-small-caps-animation-name': property('font-synthesis-small-caps', value),
        })
      },
      values: fontSynthesisSmallCaps,
    },
    'animate-font-synthesis-style': {
      fn: (value) => {
        return ({
          '--jumi-font-synthesis-style': value,
          '--jumi-font-synthesis-style-animation-name': property('font-synthesis-style', value),
        })
      },
      values: fontSynthesisStyle,
    },
    'animate-font-synthesis-weight': {
      fn: (value) => {
        return ({
          '--jumi-font-synthesis-weight': value,
          '--jumi-font-synthesis-weight-animation-name': property('font-synthesis-weight', value),
        })
      },
      values: fontSynthesisWeight,
    },
    'animate-font-variant': {
      fn: (value) => {
        return ({
          '--jumi-font-variant': value,
          '--jumi-font-variant-animation-name': property('font-variant', value),
        })
      },
      values: empty.string,
    },
    'animate-font-variant-alternates': {
      fn: (value) => {
        return ({
          '--jumi-font-variant-alternates': value,
          '--jumi-font-variant-alternates-animation-name': property('font-variant-alternates', value),
        })
      },
      values: fontVariantAlternates,
    },
    'animate-font-variant-caps': {
      fn: (value) => {
        return ({
          '--jumi-font-variant-caps': value,
          '--jumi-font-variant-caps-animation-name': property('font-variant-caps', value),
        })
      },
      values: fontVariantCaps,
    },
    'animate-font-variant-east-asian': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-font-variant-east-asian': modifier ? join([value, modifier]) : value,
          '--jumi-font-variant-east-asian-animation-name': property('font-variant-east-asian', value),
        })
      },
      modifiers: fontVariantEastAsianWidth,
      values: fontVariantEastAsian,
    },
    'animate-font-variant-ligatures': {
      fn: (value) => {
        return ({
          '--jumi-font-variant-ligatures': value,
          '--jumi-font-variant-ligatures-animation-name': property('font-variant-ligatures', value),
        })
      },
      values: fontVariantLigatures,
    },
    'animate-font-variant-numeric': {
      fn: (value) => {
        return ({
          '--jumi-font-variant-numeric': value,
          '--jumi-font-variant-numeric-animation-name': property('font-variant-numeric', value),
        })
      },
      values: fontVariantNumeric,
    },
    'animate-font-variant-position': {
      fn: (value) => {
        return ({
          '--jumi-font-variant-position': value,
          '--jumi-font-variant-position-animation-name': property('font-variant-position', value),
        })
      },
      values: fontVariantPosition,
    },
    'animate-font-variation-settings': {
      fn: (value) => {
        return ({
          '--jumi-font-variation-settings': value,
          '--jumi-font-variation-settings-animation-name': property('font-variation-settings', value),
        })
      },
      type: ['number', 'any'],
      values: empty.string,
    },
    'animate-font-weight': {
      fn: (value) => {
        return ({
          '--jumi-font-weight': value,
          '--jumi-font-weight-animation-name': property('font-weight', value),
        })
      },
      type: 'number',
      values: fontWeight,
    },
    'animate-forced-color-adjust': {
      fn: (value) => {
        return ({
          '--jumi-forced-color-adjust': value,
          '--jumi-forced-color-adjust-animation-name': property('forced-color-adjust', value),
        })
      },
      values: forcedColorAdjust,
    },
    'animate-gap': {
      fn: (value) => {
        return ({
          '--jumi-gap': value,
          '--jumi-gap-animation-name': property('gap', value),
        })
      },
      values: theme('gap'),
    },
    'animate-grid': {
      fn: (value) => {
        return ({
          '--jumi-grid': value,
          '--jumi-grid-animation-name': property('grid', value),
        })
      },
      values: empty.string,
    },
    'animate-grid-auto-columns': {
      fn: (value) => {
        return ({
          '--jumi-grid-auto-columns': value,
          '--jumi-grid-auto-columns-animation-name': property('grid-auto-columns', value),
        })
      },
      values: theme('gridAutoColumns'),
    },
    'animate-grid-auto-flow': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-grid-auto-flow': modifier ? join([value, modifier]) : value,
          '--jumi-grid-auto-flow-animation-name': property('grid-auto-flow', value),
        })
      },
      modifiers: gridAutoFlowPacking,
      values: gridAutoFlow,
    },
    'animate-grid-auto-rows': {
      fn: (value) => {
        return ({
          '--jumi-grid-auto-rows': value,
          '--jumi-grid-auto-rows-animation-name': property('grid-auto-rows', value),
        })
      },
      values: theme('gridAutoRows'),
    },
    'animate-grid-column': {
      fn: (value) => {
        return ({
          '--jumi-grid-column': value,
          '--jumi-grid-column-animation-name': property('grid-column', value),
        })
      },
      values: theme('gridColumn'),
    },
    'animate-grid-column-end': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-grid-column-end': modifier ? join([modifier, value]) : value,
          '--jumi-grid-column-end-animation-name': property('grid-column-end', value),
        })
      },
      values: theme('gridColumnEnd'),
    },
    'animate-grid-column-start': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-grid-column-start': modifier ? join([modifier, value]) : value,
          '--jumi-grid-column-start-animation-name': property('grid-column-start', value),
        })
      },
      values: theme('gridColumnStart'),
    },
    'animate-grid-row': {
      fn: (value) => {
        return ({
          '--jumi-grid-row': value,
          '--jumi-grid-row-animation-name': property('grid-row', value),
        })
      },
      values: theme('gridRow'),
    },
    'animate-grid-row-end': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-grid-row-end': modifier ? join([modifier, value]) : value,
          '--jumi-grid-row-end-animation-name': property('grid-row-end', value),
        })
      },
      modifiers: gridSize,
      values: theme('gridRowEnd'),
    },
    'animate-grid-row-start': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-grid-row-start': modifier ? join([modifier, value]) : value,
          '--jumi-grid-row-start-animation-name': property('grid-row-start', value),
        })
      },
      modifiers: gridSize,
      values: theme('gridRowStart'),
    },
    'animate-grid-template-areas': {
      fn: (value) => {
        return ({
          '--jumi-grid-template-areas': value,
          '--jumi-grid-template-areas-animation-name': property('grid-template-areas', value),
        })
      },
      values: empty.none,
    },
    'animate-grid-template-columns': {
      fn: (value) => {
        return ({
          '--jumi-grid-template-columns': value,
          '--jumi-grid-template-columns-animation-name': property('grid-template-columns', value),
        })
      },
      values: theme('gridTemplateColumns'),
    },
    'animate-grid-template-rows': {
      fn: (value) => {
        return ({
          '--jumi-grid-template-rows': value,
          '--jumi-grid-template-rows-animation-name': property('grid-template-rows', value),
        })
      },
      values: theme('gridTemplateRows'),
    },
    'animate-hanging-punctuation': {
      fn: (value) => {
        return ({
          '--jumi-hanging-punctuation': value,
          '--jumi-hanging-punctuation-animation-name': property('hanging-punctuation', value),
        })
      },
      values: hangingPunctuation,
    },
    'animate-height': {
      fn: (value) => {
        return ({
          '--jumi-height': value,
          '--jumi-height-animation-name': property('height', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('height'),
    },
    'animate-hyphenate-character': {
      fn: (value) => {
        return ({
          '--jumi-hyphenate-character': value,
          '--jumi-hyphenate-character-animation-name': property('hyphenate-character', value),
        })
      },
      values: empty.auto,
    },
    'animate-hyphenate-limit-chars': {
      fn: (value) => {
        const hyphenateLimitChars: Collection<string> = {
          '--jumi-hyphenate-limit-chars-animation-name': property('hyphenate-limit-chars', value),
        }

        switch (value) {
          case 'minimum-characters-after': {
            return merge(hyphenateLimitChars, {
              '--jumi-hyphenate-limit-minimum-characters-after': value,
            })
          }
          case 'minimum-characters-before': {
            return merge(hyphenateLimitChars, {
              '--jumi-hyphenate-limit-minimum-characters-before': value,
            })
          }
          case 'minimum-word-length': {
            return merge(hyphenateLimitChars, {
              '--jumi-hyphenate-limit-minimum-word-length': value,
            })
          }
          default: {
            return merge(hyphenateLimitChars, {
              '--jumi-hyphenate-limit-chars': value,
            })
          }
        }
      },
      modifiers: hyphenateLimitCharsProperties,
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphens': {
      fn: (value) => {
        return ({
          '--jumi-hyphens': value,
          '--jumi-hyphens-animation-name': property('hyphens', value),
        })
      },
      values: hyphens,
    },
    'animate-image-orientation': {
      fn: (value) => {
        return ({
          '--jumi-image-orientation': value,
          '--jumi-image-orientation-animation-name': property('image-orientation', value),
        })
      },
      type: ['angle', 'any'],
      values: imageOrientation,
    },
    'animate-image-rendering': {
      fn: (value) => {
        return ({
          '--jumi-image-rendering': value,
          '--jumi-image-rendering-animation-name': property('image-rendering', value),
        })
      },
      values: imageRendering,
    },
    'animate-initial-letter': {
      fn: (value, { modifier = '' }) => {
        return ({
          '--jumi-initial-letter': modifier ? join([value, modifier]) : value,
          '--jumi-initial-letter-animation-name': property('initial-letter', value),
        })
      },
      modifiers: initialLetterPosition,
      type: ['number', 'integer', 'any'],
      values: initialLetter,
    },
    'animate-inline-size': {
      fn: (value) => {
        return ({
          '--jumi-inline-size': value,
          '--jumi-inline-size-animation-name': property('inline-size', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: inlineSize,
    },
    'animate-inset': {
      fn: (value) => {
        return ({
          '--jumi-inset': value,
          '--jumi-inset-animation-name': property('inset', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block': {
      fn: (value) => {
        return ({
          '--jumi-inset-block': value,
          '--jumi-inset-block-animation-name': property('inset-block', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-end': {
      fn: (value) => {
        return ({
          '--jumi-inset-block-end': value,
          '--jumi-inset-block-end-animation-name': property('inset-block-end', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-start': {
      fn: (value) => {
        return ({
          '--jumi-inset-block-start': value,
          '--jumi-inset-block-start-animation-name': property('inset-block-start', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline': {
      fn: (value) => {
        return ({
          '--jumi-inset-inline': value,
          '--jumi-inset-inline-animation-name': property('inset-inline', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-end': {
      fn: (value) => {
        return ({
          '--jumi-inset-inline-end': value,
          '--jumi-inset-inline-end-animation-name': property('inset-inline-end', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-start': {
      fn: (value) => {
        return ({
          '--jumi-inset-inline-start': value,
          '--jumi-inset-inline-start-animation-name': property('inset-inline-start', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-justify-content': {
      fn: (value) => {
        return ({
          '--jumi-justify-content': value,
          '--jumi-justify-content-animation-name': property('justify-content', value),
        })
      },
      values: justifyContent,
    },
    'animate-justify-items': {
      fn: (value) => {
        return ({
          '--jumi-justify-items': value,
          '--jumi-justify-items-animation-name': property('justify-items', value),
        })
      },
      values: justifyItems,
    },
    'animate-justify-self': {
      fn: (value) => {
        return ({
          '--jumi-justify-self': value,
          '--jumi-justify-self-animation-name': property('justify-self', value),
        })
      },
      values: justifySelf,
    },
    'animate-left': {
      fn: (value) => {
        return ({
          '--jumi-left': value,
          '--jumi-left-animation-name': property('left', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-letter-spacing': {
      fn: (value) => {
        return ({
          '--jumi-letter-spacing': value,
          '--jumi-letter-spacing-animation-name': property('letter-spacing', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('letterSpacing'),
    },
    'animate-lighting-color': {
      fn: (value) => {
        return ({
          '--jumi-lighting-color': value,
          '--jumi-lighting-color-animation-name': property('lighting-color', value),
        })
      },
      type: 'color',
      values: theme('colors'),
    },
    'animate-line-break': {
      fn: (value) => {
        return ({
          '--jumi-line-break': value,
          '--jumi-line-break-animation-name': property('line-break', value),
        })
      },
      values: lineBreak,
    },
    'animate-line-clamp': {
      fn: (value) => {
        return ({
          '--jumi-line-clamp': value,
          '--jumi-line-clamp-animation-name': property('line-clamp', value),
        })
      },
      type: ['number', 'any'],
      values: empty.none,
    },
    'animate-line-height': {
      fn: (value) => {
        return ({
          '--jumi-line-height': value,
          '--jumi-line-height-animation-name': property('line-height', value),
        })
      },
      type: ['number', 'length', 'percentage'],
      values: theme('lineHeight'),
    },
    'animate-list-style': {
      fn: (value) => {
        return ({
          '--jumi-list-style': value,
          '--jumi-list-style-animation-name': property('list-style', value),
        })
      },
      values: empty.none,
    },
    'animate-list-style-image': {
      fn: (value) => {
        return ({
          '--jumi-list-style-image': value,
          '--jumi-list-style-image-animation-name': property('list-style-image', value),
        })
      },
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-list-style-position': {
      fn: (value) => {
        return ({
          '--jumi-list-style-position': value,
          '--jumi-list-style-position-animation-name': property('list-style-position', value),
        })
      },
      values: listStylePosition,
    },
    'animate-list-style-type': {
      fn: (value) => {
        return ({
          '--jumi-list-style-type': value,
          '--jumi-list-style-type-animation-name': property('list-style-type', value),
        })
      },
      values: listStyleType,
    },
    'animate-margin': {
      fn: (value) => {
        return ({
          '--jumi-margin': value,
          '--jumi-margin-animation-name': property('margin', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-block': {
      fn: (value) => {
        return ({
          '--jumi-margin-block': value,
          '--jumi-margin-block-animation-name': property('margin-block', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-block-end': {
      fn: (value) => {
        return ({
          '--jumi-margin-block-end': value,
          '--jumi-margin-block-end-animation-name': property('margin-block-end', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-block-start': {
      fn: (value) => {
        return ({
          '--jumi-margin-block-start': value,
          '--jumi-margin-block-start-animation-name': property('margin-block-start', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-bottom': {
      fn: (value) => {
        return ({
          '--jumi-margin-bottom': value,
          '--jumi-margin-bottom-animation-name': property('margin-bottom', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-inline': {
      fn: (value) => {
        return ({
          '--jumi-margin-inline': value,
          '--jumi-margin-inline-animation-name': property('margin-inline', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-inline-end': {
      fn: (value) => {
        return ({
          '--jumi-margin-inline-end': value,
          '--jumi-margin-inline-end-animation-name': property('margin-inline-end', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-inline-start': {
      fn: (value) => {
        return ({
          '--jumi-margin-inline-start': value,
          '--jumi-margin-inline-start-animation-name': property('margin-inline-start', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-left': {
      fn: (value) => {
        return ({
          '--jumi-margin-left': value,
          '--jumi-margin-left-animation-name': property('margin-left', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-right': {
      fn: (value) => {
        return ({
          '--jumi-margin-right': value,
          '--jumi-margin-right-animation-name': property('margin-right', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-top': {
      fn: (value) => {
        return ({
          '--jumi-margin-top': value,
          '--jumi-margin-top-animation-name': property('margin-top', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-marker': {
      fn: (value) => {
        return ({
          '--jumi-marker': value,
          '--jumi-marker-animation-name': property('marker', value),
        })
      },
      values: empty.none,
    },
    'animate-marker-end': {
      fn: (value) => {
        return ({
          '--jumi-marker-end': value,
          '--jumi-marker-end-animation-name': property('marker-end', value),
        })
      },
      values: empty.none,
    },
    'animate-marker-mid': {
      fn: (value) => {
        return ({
          '--jumi-marker-mid': value,
          '--jumi-marker-mid-animation-name': property('marker-mid', value),
        })
      },
      values: empty.none,
    },
    'animate-marker-start': {
      fn: (value) => {
        return ({
          '--jumi-marker-start': value,
          '--jumi-marker-start-animation-name': property('marker-start', value),
        })
      },
      values: empty.none,
    },
    'animate-mask': {
      fn: (value) => {
        return ({
          '--jumi-mask': value,
          '--jumi-mask-animation-name': property('mask', value),
        })
      },
      values: empty.none,
    },
    'animate-mask-border': {
      fn: (value) => {
        return ({
          '--jumi-mask-border': value,
          '--jumi-mask-border-animation-name': property('mask-border', value),
        })
      },
      values: empty.none,
    },
    'animate-mask-border-mode': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-mode': value,
          '--jumi-mask-border-mode-animation-name': property('mask-border-mode', value),
        })
      },
      values: maskType,
    },
    'animate-mask-border-outset': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset': value,
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-bottom': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
          '--jumi-mask-border-outset-bottom': value,
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-left': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
          '--jumi-mask-border-outset-left': value,
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-right': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
          '--jumi-mask-border-outset-right': value,
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-top': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
          '--jumi-mask-border-outset-top': value,
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-x': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
          '--jumi-mask-border-outset-left': value,
          '--jumi-mask-border-outset-right': value,
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-y': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-outset-animation-name': property('mask-border-outset', value),
          '--jumi-mask-border-outset-bottom': value,
          '--jumi-mask-border-outset-top': value,
        })
      },
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-repeat': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-repeat': value,
          '--jumi-mask-border-repeat-animation-name': property('mask-border-repeat', value),
        })
      },
      values: maskBorderRepeat,
    },
    'animate-mask-border-slice': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice': value,
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-bottom': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
          '--jumi-mask-border-slice-bottom': value,
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-left': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
          '--jumi-mask-border-slice-left': value,
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-right': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
          '--jumi-mask-border-slice-right': value,
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-top': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
          '--jumi-mask-border-slice-top': value,
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-x': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
          '--jumi-mask-border-slice-left': value,
          '--jumi-mask-border-slice-right': value,
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-y': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-slice-animation-name': property('mask-border-slice', value),
          '--jumi-mask-border-slice-bottom': value,
          '--jumi-mask-border-slice-top': value,
        })
      },
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-source': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-source': value,
          '--jumi-mask-border-source-animation-name': property('mask-border-source', value),
        })
      },
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-border-width': {
      fn: (value) => {
        return ({
          '--jumi-mask-border-width': value,
          '--jumi-mask-border-width-animation-name': property('mask-border-width', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('borderWidth'),
    },
    'animate-mask-clip': {
      fn: (value) => {
        return ({
          '--jumi-mask-clip': value,
          '--jumi-mask-clip-animation-name': property('mask-clip', value),
        })
      },
      values: maskClip,
    },
    'animate-mask-composite': {
      fn: (value) => {
        return ({
          '--jumi-mask-composite': value,
          '--jumi-mask-composite-animation-name': property('mask-composite', value),
        })
      },
      values: maskComposite,
    },
    'animate-mask-image': {
      fn: (value) => {
        return ({
          '--jumi-mask-image': value,
          '--jumi-mask-image-animation-name': property('mask-image', value),
        })
      },
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-mode': {
      fn: (value) => {
        return ({
          '--jumi-mask-mode': value,
          '--jumi-mask-mode-animation-name': property('mask-mode', value),
        })
      },
      values: maskMode,
    },
    'animate-mask-origin': {
      fn: (value) => {
        return ({
          '--jumi-mask-origin': value,
          '--jumi-mask-origin-animation-name': property('mask-origin', value),
        })
      },
      values: maskOrigin,
    },
    'animate-mask-position': {
      fn: (value) => {
        return ({
          '--jumi-mask-position': value,
          '--jumi-mask-position-animation-name': property('mask-position', value),
        })
      },
      type: ['length', 'percentage', 'position'],
    },
    'animate-mask-repeat': {
      fn: (value) => {
        return ({
          '--jumi-mask-repeat': value,
          '--jumi-mask-repeat-animation-name': property('mask-repeat', value),
        })
      },
      values: backgroundRepeat,
    },
    'animate-mask-size': {
      fn: (value) => {
        return ({
          '--jumi-mask-size': value,
          '--jumi-mask-size-animation-name': property('mask-size', value),
        })
      },
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-mask-type': {
      fn: (value) => {
        return ({
          '--jumi-mask-type': value,
          '--jumi-mask-type-animation-name': property('mask-type', value),
        })
      },
      values: maskType,
    },
    'animate-math-depth': {
      fn: (value) => {
        return ({
          '--jumi-math-depth': value,
          '--jumi-math-depth-animation-name': property('math-depth', value),
        })
      },
      supportsNegativeValues: true,
      type: 'integer',
      values: mathDepth,
    },
    'animate-math-depth-add': {
      fn: (value) => {
        return ({
          '--jumi-math-depth': `add(${value})`,
          '--jumi-math-depth-animation-name': property('math-depth', value),
        })
      },
      supportsNegativeValues: true,
      type: 'integer',
      values: empty.number,
    },
    'animate-math-style': {
      fn: (value) => {
        return ({
          '--jumi-math-style': value,
          '--jumi-math-style-animation-name': property('math-style', value),
        })
      },
      values: mathStyle,
    },
    'animate-max-block-size': {
      fn: (value) => {
        return ({
          '--jumi-max-block-size': value,
          '--jumi-max-block-size-animation-name': property('max-block-size', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-height': {
      fn: (value) => {
        return ({
          '--jumi-max-height': value,
          '--jumi-max-height-animation-name': property('max-height', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-inline-size': {
      fn: (value) => {
        return ({
          '--jumi-max-inline-size': value,
          '--jumi-max-inline-size-animation-name': property('max-inline-size', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-max-width': {
      fn: (value) => {
        return ({
          '--jumi-max-width': value,
          '--jumi-max-width-animation-name': property('max-width', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-min-block-size': {
      fn: (value) => {
        return ({
          '--jumi-min-block-size': value,
          '--jumi-min-block-size-animation-name': property('min-block-size', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-height': {
      fn: (value) => {
        return ({
          '--jumi-min-height': value,
          '--jumi-min-height-animation-name': property('min-height', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-inline-size': {
      fn: (value) => {
        return ({
          '--jumi-min-inline-size': value,
          '--jumi-min-inline-size-animation-name': property('min-inline-size', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-min-width': {
      fn: (value) => {
        return ({
          '--jumi-min-width': value,
          '--jumi-min-width-animation-name': property('min-width', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-mix-blend-mode': {
      fn: (value) => {
        return ({
          '--jumi-mix-blend-mode': value,
          '--jumi-mix-blend-mode-animation-name': property('mix-blend-mode', value),
        })
      },
      values: mixBlendMode,
    },
    'animate-object-fit': {
      fn: (value) => {
        return ({
          '--jumi-object-fit': value,
          '--jumi-object-fit-animation-name': property('object-fit', value),
        })
      },
      values: objectFit,
    },
    'animate-object-position': {
      fn: (value) => {
        return ({
          '--jumi-object-position': value,
          '--jumi-object-position-animation-name': property('object-position', value),
        })
      },
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition'),
    },
    'animate-object-position-x': {
      fn: (value) => {
        return ({
          '--jumi-object-position-animation-name': property('object-position', value),
          '--jumi-object-position-x': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-x-edge': {
      fn: (value) => {
        return ({
          '--jumi-object-position-animation-name': property('object-position', value),
          '--jumi-object-position-x-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-x-offset': {
      fn: (value) => {
        return ({
          '--jumi-object-position-animation-name': property('object-position', value),
          '--jumi-object-position-x-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-object-position-y': {
      fn: (value) => {
        return ({
          '--jumi-object-position-animation-name': property('object-position', value),
          '--jumi-object-position-y': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-y-edge': {
      fn: (value) => {
        return ({
          '--jumi-object-position-animation-name': property('object-position', value),
          '--jumi-object-position-y-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-y-offset': {
      fn: (value) => {
        return ({
          '--jumi-object-position-animation-name': property('object-position', value),
          '--jumi-object-position-y-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset': {
      fn: (value) => {
        return ({
          '--jumi-offset': value,
          '--jumi-offset-animation-name': property('offset', value),
        })
      },
      type: ['length', 'percentage', 'position', 'any'],
      values: offsetAnchor,
    },
    'animate-offset-anchor': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor': value,
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
        })
      },
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', empty.auto),
    },
    'animate-offset-anchor-x': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
          '--jumi-offset-anchor-x': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-x-edge': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
          '--jumi-offset-anchor-x-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-x-offset': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
          '--jumi-offset-anchor-x-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-anchor-y': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
          '--jumi-offset-anchor-y': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-y-edge': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
          '--jumi-offset-anchor-y-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-y-offset': {
      fn: (value) => {
        return ({
          '--jumi-offset-anchor-animation-name': property('offset-anchor', value),
          '--jumi-offset-anchor-y-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-distance': {
      fn: (value) => {
        return ({
          '--jumi-offset-distance': value,
          '--jumi-offset-distance-animation-name': property('offset-distance', value),
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-path': {
      fn: (value) => {
        return ({
          '--jumi-offset-path': value,
          '--jumi-offset-path-animation-name': property('offset-path', value),
        })
      },
      values: offsetPath,
    },
    'animate-offset-position': {
      fn: (value) => {
        return ({
          '--jumi-offset-position': value,
          '--jumi-offset-position-animation-name': property('offset-position', value),
        })
      },
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', offsetPosition),
    },
    'animate-offset-position-x': {
      fn: (value) => {
        return ({
          '--jumi-offset-position-animation-name': property('offset-position', value),
          '--jumi-offset-position-x': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-x-edge': {
      fn: (value) => {
        return ({
          '--jumi-offset-position-animation-name': property('offset-position', value),
          '--jumi-offset-position-x-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-x-offset': {
      fn: (value) => {
        return ({
          '--jumi-offset-position-animation-name': property('offset-position', value),
          '--jumi-offset-position-x-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-position-y': {
      fn: (value) => {
        return ({
          '--jumi-offset-position-animation-name': property('offset-position', value),
          '--jumi-offset-position-y': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-y-edge': {
      fn: (value) => {
        return ({
          '--jumi-offset-position-animation-name': property('offset-position', value),
          '--jumi-offset-position-y-edge': value,
        })
      },
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-y-offset': {
      fn: (value) => {
        return ({
          '--jumi-offset-position-animation-name': property('offset-position', value),
          '--jumi-offset-position-y-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-rotate': {
      fn: (value) => {
        return ({
          '--jumi-offset-rotate': value,
          '--jumi-offset-rotate-animation-name': property('offset-rotate', value),
        })
      },
      type: ['angle', 'any'],
      values: theme('rotate', offsetRotate),
    },
    'animate-opacity': {
      fn: (value) => {
        return ({
          '--jumi-opacity': value,
          '--jumi-opacity-animation-name': property('opacity', value),
        })
      },
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-order': {
      fn: (value) => {
        return ({
          '--jumi-order': value,
          '--jumi-order-animation-name': property('order', value),
        })
      },
      supportsNegativeValues: true,
      type: 'integer',
      values: theme('order'),
    },
    'animate-orphans': {
      fn: (value) => {
        return ({
          '--jumi-orphans': value,
          '--jumi-orphans-animation-name': property('orphans', value),
        })
      },
      type: 'integer',
      values: empty.number,
    },
    'animate-outline': {
      fn: (value) => {
        return ({
          '--jumi-outline': value,
          '--jumi-outline-animation-name': property('outline', value),
        })
      },
      type: ['line-width', 'length', 'color', 'any'],
      values: empty.none,
    },
    'animate-outline-color': {
      fn: (value) => {
        return ({
          '--jumi-outline-animation-name': property('outline', value),
          '--jumi-outline-color': value,
        })
      },
      type: 'color',
      values: theme('outlineColor'),
    },
    'animate-outline-offset': {
      fn: (value) => {
        return ({
          '--jumi-outline-animation-name': property('outline', value),
          '--jumi-outline-offset': value,
        })
      },
      type: 'length',
      values: theme('outlineOffset'),
    },
    'animate-outline-style': {
      fn: (value) => {
        return ({
          '--jumi-outline-animation-name': property('outline', value),
          '--jumi-outline-style': value,
        })
      },
      values: outlineStyle,
    },
    'animate-outline-width': {
      fn: (value) => {
        return ({
          '--jumi-outline-animation-name': property('outline', value),
          '--jumi-outline-width': value,
        })
      },
      type: ['line-width'],
      values: theme('outlineWidth'),
    },
    'animate-overflow': {
      fn: (value) => {
        return ({
          '--jumi-overflow': value,
          '--jumi-overflow-animation-name': property('overflow', value),
        })
      },
      values: overflow,
    },
    'animate-overflow-anchor': {
      fn: (value) => {
        return ({
          '--jumi-overflow-anchor': value,
          '--jumi-overflow-anchor-animation-name': property('overflow-anchor', value),
        })
      },
      values: overflowAnchor,
    },
    'animate-overflow-block': {
      fn: (value) => {
        return ({
          '--jumi-overflow-block': value,
          '--jumi-overflow-block-animation-name': property('overflow-block', value),
        })
      },
      values: overflow,
    },
    'animate-overflow-clip-margin': {
      fn: (value) => {
        return ({
          '--jumi-overflow-clip-margin': value,
          '--jumi-overflow-clip-margin-animation-name': property('overflow-clip-margin', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'any'],
      values: overflowClipMargin,
    },
    'animate-overflow-inline': {
      fn: (value) => {
        return ({
          '--jumi-overflow-inline': value,
          '--jumi-overflow-inline-animation-name': property('overflow-inline', value),
        })
      },
      values: overflow,
    },
    'animate-overflow-wrap': {
      fn: (value) => {
        return ({
          '--jumi-overflow-wrap': value,
          '--jumi-overflow-wrap-animation-name': property('overflow-wrap', value),
        })
      },
      values: overflowWrap,
    },
    'animate-overflow-x': {
      fn: (value) => {
        return ({
          '--jumi-overflow-animation-name': property('overflow', value),
          '--jumi-overflow-x': value,
        })
      },
      values: overflow,
    },
    'animate-overflow-y': {
      fn: (value) => {
        return ({
          '--jumi-overflow-animation-name': property('overflow', value),
          '--jumi-overflow-y': value,
        })
      },
      values: overflow,
    },
    'animate-overscroll-behavior': {
      fn: (value) => {
        return ({
          '--jumi-overscroll-behavior': value,
          '--jumi-overscroll-behavior-animation-name': property('overscroll-behavior', value),
        })
      },
      values: empty.auto,
    },
    'animate-overscroll-behavior-block': {
      fn: (value) => {
        return ({
          '--jumi-overscroll-behavior-block': value,
          '--jumi-overscroll-behavior-block-animation-name': property('overscroll-behavior-block', value),
        })
      },
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-inline': {
      fn: (value) => {
        return ({
          '--jumi-overscroll-behavior-inline': value,
          '--jumi-overscroll-behavior-inline-animation-name': property('overscroll-behavior-inline', value),
        })
      },
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-x': {
      fn: (value) => {
        return ({
          '--jumi-overscroll-behavior-x': value,
          '--jumi-overscroll-behavior-x-animation-name': property('overscroll-behavior-x', value),
        })
      },
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-y': {
      fn: (value) => {
        return ({
          '--jumi-overscroll-behavior-y': value,
          '--jumi-overscroll-behavior-y-animation-name': property('overscroll-behavior-y', value),
        })
      },
      values: overscrollBehavior,
    },
    'animate-padding': {
      fn: (value) => {
        return ({
          '--jumi-padding': value,
          '--jumi-padding-animation-name': property('padding', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-block': {
      fn: (value) => {
        return ({
          '--jumi-padding-block': value,
          '--jumi-padding-block-animation-name': property('padding-block', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-block-end': {
      fn: (value) => {
        return ({
          '--jumi-padding-block-end': value,
          '--jumi-padding-block-end-animation-name': property('padding-block-end', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-block-start': {
      fn: (value) => {
        return ({
          '--jumi-padding-block-start': value,
          '--jumi-padding-block-start-animation-name': property('padding-block-start', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-bottom': {
      fn: (value) => {
        return ({
          '--jumi-padding-bottom': value,
          '--jumi-padding-bottom-animation-name': property('padding-bottom', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-inline': {
      fn: (value) => {
        return ({
          '--jumi-padding-inline': value,
          '--jumi-padding-inline-animation-name': property('padding-inline', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-inline-end': {
      fn: (value) => {
        return ({
          '--jumi-padding-inline-end': value,
          '--jumi-padding-inline-end-animation-name': property('padding-inline-end', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-inline-start': {
      fn: (value) => {
        return ({
          '--jumi-padding-inline-start': value,
          '--jumi-padding-inline-start-animation-name': property('padding-inline-start', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-left': {
      fn: (value) => {
        return ({
          '--jumi-padding-left': value,
          '--jumi-padding-left-animation-name': property('padding-left', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-right': {
      fn: (value) => {
        return ({
          '--jumi-padding-right': value,
          '--jumi-padding-right-animation-name': property('padding-right', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-top': {
      fn: (value) => {
        return ({
          '--jumi-padding-top': value,
          '--jumi-padding-top-animation-name': property('padding-top', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-page': {
      fn: (value) => {
        return ({
          '--jumi-page': value,
          '--jumi-page-animation-name': property('page', value),
        })
      },
      values: empty.auto,
    },
    'animate-paint-order': {
      fn: (value) => {
        return ({
          '--jumi-paint-order': value,
          '--jumi-paint-order-animation-name': property('paint-order', value),
        })
      },
      values: paintOrder,
    },
    'animate-position': {
      fn: (value) => {
        return ({
          '--jumi-position': value,
          '--jumi-position-animation-name': property('position', value),
        })
      },
      values: position,
    },
    'animate-right': {
      fn: (value) => {
        return ({
          '--jumi-right': value,
          '--jumi-right-animation-name': property('right', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-rotate': {
      fn: (value) => {
        return ({
          '--jumi-rotate': value,
          '--jumi-rotate-animation-name': property('rotate', value),
        })
      },
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('rotate'),
    },
    'animate-rotate-3d': {
      fn: (value) => {
        return ({
          '--jumi-rotate-3d': css('rotate3d', value),
          '--jumi-transform-animation-name': property('transform', value),
        })
      },
      values: empty.string,
    },
    'animate-rotate-angle': {
      fn: (value) => {
        return ({
          '--jumi-rotate-angle': value,
          '--jumi-rotate-animation-name': property('rotate', value),
        })
      },
      supportsNegativeValues: true,
      type: 'angle',
      values: theme('rotate'),
    },
    'animate-rotate-x': {
      fn: (value) => {
        return ({
          '--jumi-rotate-animation-name': property('rotate', value),
          '--jumi-rotate-x': value,
        })
      },
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-y': {
      fn: (value) => {
        return ({
          '--jumi-rotate-animation-name': property('rotate', value),
          '--jumi-rotate-y': value,
        })
      },
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-z': {
      fn: (value) => {
        return ({
          '--jumi-rotate-animation-name': property('rotate', value),
          '--jumi-rotate-z': value,
        })
      },
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-row-gap': {
      fn: (value) => {
        return ({
          '--jumi-gap-animation-name': property('gap', value),
          '--jumi-row-gap': value,
        })
      },
      values: empty.number,
    },
    'animate-scale': {
      fn: (value) => {
        return {
          '--jumi-scale': value,
          '--jumi-scale-animation-name': property('scale', value),
        }
      },
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-x': {
      fn: (value) => {
        return ({
          '--jumi-scale-animation-name': property('scale', value),
          '--jumi-scale-x': value,
        })
      },
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-y': {
      fn: (value) => {
        return ({
          '--jumi-scale-animation-name': property('scale', value),
          '--jumi-scale-y': value,
        })
      },
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-z': {
      fn: (value) => {
        return ({
          '--jumi-scale-animation-name': property('scale', value),
          '--jumi-scale-z': value,
        })
      },
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-skew': {
      fn: (value) => {
        const [x, y] = value.split(/\s+/)
        return {
          '--jumi-skew-animation-name': property('transform', value),
          '--jumi-skew-x': x ?? value,
          '--jumi-skew-y': y ?? x ?? value,
        }
      },
      supportsNegativeValues: true,
      values: theme('skew'),
    },
    'animate-skew-x': {
      fn: (value) => {
        return ({
          '--jumi-skew-x': value,
          '--jumi-transform-animation-name': property('transform', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('skew'),
    },
    'animate-skew-y': {
      fn: (value) => {
        return ({
          '--jumi-skew-y': value,
          '--jumi-transform-animation-name': property('transform', value),
        })
      },
      supportsNegativeValues: true,
      values: theme('skew'),
    },
    'animate-stroke': {
      fn: (value) => {
        return ({
          '--jumi-stroke': value,
          '--jumi-stroke-animation-name': property('stroke', value),
        })
      },
      values: theme('colors'),
    },
    'animate-stroke-width': {
      fn: (value) => {
        return ({
          '--jumi-stroke-width': value,
          '--jumi-stroke-width-animation-name': property('stroke-width', value),
        })
      },
      values: theme('strokeWidth'),
    },
    'animate-text-align': {
      fn: (value) => {
        return ({
          '--jumi-text-align': value,
          '--jumi-text-align-animation-name': property('text-align', value),
        })
      },
      values: textAlign,
    },
    'animate-text-shadow': {
      fn: (value) => {
        return ({
          '--jumi-text-shadow': value,
          '--jumi-text-shadow-animation-name': property('text-shadow', value),
        })
      },
      values: theme('dropShadow'),
    },
    'animate-text-shadow-blur': {
      fn: (value) => {
        return ({
          '--jumi-text-shadow-animation-name': property('text-shadow', value),
          '--jumi-text-shadow-blur-radius': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-text-shadow-color': {
      fn: (value) => {
        return ({
          '--jumi-text-shadow-animation-name': property('text-shadow', value),
          '--jumi-text-shadow-color': value,
        })
      },
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-text-shadow-offset-x': {
      fn: (value) => {
        return ({
          '--jumi-text-shadow-animation-name': property('text-shadow', value),
          '--jumi-text-shadow-offset-x': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-text-shadow-offset-y': {
      fn: (value) => {
        return ({
          '--jumi-text-shadow-animation-name': property('text-shadow', value),
          '--jumi-text-shadow-offset-y': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-top': {
      fn: (value) => {
        return ({
          '--jumi-top': value,
          '--jumi-top-animation-name': property('top', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-transform': {
      fn: (value) => {
        return ({
          '--jumi-transform': value,
          '--jumi-transform-animation-name': property('transform', value),
        })
      },
      values: empty.string,
    },
    'animate-transform-origin': {
      fn: (value) => {
        return ({
          '--jumi-transform-origin': value,
          '--jumi-transform-origin-animation-name': property('transform-origin', value),
        })
      },
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('transformOrigin'),
    },
    'animate-transform-origin-x': {
      fn: (value) => {
        return ({
          '--jumi-transform-origin-animation-name': property('transform-origin', value),
          '--jumi-transform-origin-x': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: originX,
    },
    'animate-transform-origin-y': {
      fn: (value) => {
        return ({
          '--jumi-transform-origin-animation-name': property('transform-origin', value),
          '--jumi-transform-origin-y': value,
        })
      },
      type: ['length', 'percentage', 'position'],
      values: originY,
    },
    'animate-transform-origin-z': {
      fn: (value) => {
        return ({
          '--jumi-transform-origin-animation-name': property('transform-origin', value),
          '--jumi-transform-origin-z': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length'],
      values: empty.number,
    },
    'animate-transform-style': {
      fn: (value) => {
        return ({
          '--jumi-transform-animation-name': property('transform', value),
          '--jumi-transform-style': value,
        })
      },
      values: transformStyle,
    },
    'animate-translate': {
      fn: (value) => {
        return {
          '--jumi-translate': value,
          '--jumi-translate-animation-name': property('translate', value),
        }
      },
      supportsNegativeValues: true,
      values: theme('translate'),
    },
    'animate-translate-3d': {
      fn: (value) => {
        return ({
          '--jumi-transform-animation-name': property('transform', value),
          '--jumi-translate-3d': css('translate3d', value),
        })
      },
      type: ['length', 'percentage', 'any'],
      values: empty.string,
    },
    'animate-translate-x': {
      fn: (value) => {
        return ({
          '--jumi-translate-animation-name': property('translate', value),
          '--jumi-translate-x': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-y': {
      fn: (value) => {
        return ({
          '--jumi-translate-animation-name': property('translate', value),
          '--jumi-translate-y': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-z': {
      fn: (value) => {
        return ({
          '--jumi-translate-animation-name': property('translate', value),
          '--jumi-translate-z': value,
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-visibility': {
      fn: (value) => {
        return ({
          '--jumi-visibility': value,
          '--jumi-visibility-animation-name': property('visibility', value),
        })
      },
      values: visibility,
    },
    'animate-width': {
      fn: (value) => {
        return ({
          '--jumi-width': value,
          '--jumi-width-animation-name': property('width', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('width'),
    },
    'animate-x': {
      fn: (value) => {
        return ({
          '--jumi-x': value,
          '--jumi-x-animation-name': property('x', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-y': {
      fn: (value) => {
        return ({
          '--jumi-y': value,
          '--jumi-y-animation-name': property('y', value),
        })
      },
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-z-index': {
      fn: (value) => {
        return ({
          '--jumi-z-index': value,
          '--jumi-z-index-animation-name': property('z-index', value),
        })
      },
      values: theme('zIndex'),
    },
    'animation-composition': {
      fn: (value) => {
        return ({
          '--jumi-animation-composition': value,
        })
      },
      values: animationComposition,
    },
    'animation-delay': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-delay': value }
        return { [`--jumi-${modifier}-animation-delay`]: value }
      },
      modifiers,
      values: theme('transitionDelay'),
    },
    'animation-direction': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-direction': value }
        return { [`--jumi-${modifier}-animation-direction`]: value }
      },
      modifiers,
      values: animationDirection,
    },
    'animation-duration': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-duration': value }
        return { [`--jumi-${modifier}-animation-duration`]: value }
      },
      modifiers,
      values: theme('transitionDuration'),
    },
    'animation-fill-mode': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-fill-mode': value }
        return { [`--jumi-${modifier}-animation-fill-mode`]: value }
      },
      modifiers,
      values: animationFillMode,
    },
    'animation-iteration-count': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-iteration-count': value }
        return { [`--jumi-${modifier}-animation-iteration-count`]: value }
      },
      modifiers,
      type: 'number',
      values: animationIterationCount,
    },
    'animation-name': {
      fn: (value) => {
        return ({
          '--jumi-animation-name': value,
        })
      },
      values: empty.none,
    },
    'animation-play-state': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-play-state': value }
        return { [`--jumi-${modifier}-animation-play-state`]: value }
      },
      modifiers,
      values: animationPlayState,
    },
    'animation-range': {
      fn: (value) => {
        return ({
          '--jumi-animation-range': value,
        })
      },
      values: animationRange,
    },
    'animation-range-end': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-end': value,
        })
      },
      type: ['length', 'percentage', 'any'],
      values: animationRange,
    },
    'animation-range-end-offset': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-end-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-end-timeline': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-end-timeline': value,
        })
      },
      values: animationRangeTimeline,
    },
    'animation-range-start': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-start': value,
        })
      },
      type: ['length', 'percentage', 'any'],
      values: animationRange,
    },
    'animation-range-start-offset': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-start-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-start-timeline': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-start-timeline': value,
        })
      },
      values: animationRangeTimeline,
    },
    'animation-timeline': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline': value,
        })
      },
      values: animationTimeline,
    },
    'animation-timeline-axis': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-axis': value,
        })
      },
      values: animationTimelineAxis,
    },
    'animation-timeline-inset-end': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-inset-end': value,
        })
      },
      type: 'length',
      values: animationTimelineInset,
    },
    'animation-timeline-inset-start': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-inset-start': value,
        })
      },
      type: 'length',
      values: animationTimelineInset,
    },
    'animation-timeline-scroller': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-scroller': value,
        })
      },
      type: 'length',
      values: animationTimelineScroller,
    },
    'animation-timing-function': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { '--jumi-animation-timing-function': value }
        return { [`--jumi-${modifier}-animation-timing-function`]: value }
      },
      modifiers,
      values: animationTimingFunction,
    },
    'animations': {
      fn: () => creator.animations,
      values: { DEFAULT: '' },
    },
    'transition-behavior': {
      fn: (value) => {
        return ({
          '--jumi-transition-behavior': value,
        })
      },
      values: transitionBehavior,
    },
    'transition-delay': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-delay': value }) }
        return { [`--jumi-${modifier}-transition-delay`]: value }
      },
      modifiers: cssProperties,
      values: theme('transitionDelay'),
    },
    'transition-duration': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-duration': value }) }
        return { [`--jumi-${modifier}-transition-duration`]: value }
      },
      modifiers: cssProperties,
      values: theme('transitionDuration'),
    },
    'transition-property': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-property': value }) }
        return { [`--jumi-${modifier}-transition-property`]: motion(modifier) }
      },
      modifiers: cssProperties,
      values: { DEFAULT: '' },
    },
    'transition-timing-function': {
      fn: (value, { modifier = '' }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-timing-function': value }) }
        return { [`--jumi-${modifier}-transition-timing-function`]: value }
      },
      modifiers: cssProperties,
      values: animationTimingFunction,
    },
    'transitions': {
      fn: () => creator.transitions,
      values: { DEFAULT: '' },
    },
  }

  return matchProperties
}
