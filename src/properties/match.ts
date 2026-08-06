import type { CssInJs, GetMatchUtilities, MatchProperty } from '@/types'

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
import { atStops } from '@/theme/at-stops'
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
      fn: (value, { modifier }) => {
        return ({
          '--jumi-accent-color': value,
          ...property('accent-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('accentColor'),
    },
    'animate-align-content': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-align-content': value,
          ...property('align-content', modifier, value),
        })
      },
      modifiers: atStops,
      values: alignContent,
    },
    'animate-align-items': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-align-items': value,
          ...property('align-items', modifier, value),
        })
      },
      modifiers: atStops,
      values: alignItems,
    },
    'animate-align-self': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-align-self': value,
          ...property('align-self', modifier, value),
        })
      },
      modifiers: atStops,
      values: alignSelf,
    },
    'animate-alignment-baseline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-alignment-baseline': value,
          ...property('alignment-baseline', modifier, value),
        })
      },
      modifiers: atStops,
      values: alignmentBaseline,
    },
    'animate-all': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-all': value,
          ...property('all', modifier, value),
        })
      },
      modifiers: atStops,
      values: all,
    },
    'animate-appearance': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-appearance': value,
          ...property('appearance', modifier, value),
        })
      },
      modifiers: atStops,
      values: appearance,
    },
    'animate-aspect-ratio': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-aspect-ratio': value,
          ...property('aspect-ratio', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-height': {
      fn: (value, { modifier }) => {
        return ({
          ...property('aspect-ratio', modifier, value),
          '--jumi-aspect-ratio-height': value,
        })
      },
      modifiers: atStops,
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-width': {
      fn: (value, { modifier }) => {
        return ({
          ...property('aspect-ratio', modifier, value),
          '--jumi-aspect-ratio-width': value,
        })
      },
      modifiers: atStops,
      type: 'ratio',
      values: empty.auto,
    },
    'animate-backdrop-filter': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-backdrop-filter': value,
          ...property('backdrop-filter', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-backdrop-filter-blur': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-blur': css('blur', value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: theme('backdropBlur'),
    },
    'animate-backdrop-filter-brightness': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-brightness': css('brightness', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropBrightness'),
    },
    'animate-backdrop-filter-contrast': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-contrast': css('contrast', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropContrast'),
    },
    'animate-backdrop-filter-drop-shadow': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-drop-shadow': css('drop-shadow', value),
        })
      },
      modifiers: atStops,
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-backdrop-filter-drop-shadow-blur': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-drop-shadow-blur': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-color': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-drop-shadow-color': value,
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-backdrop-filter-drop-shadow-offset-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-drop-shadow-offset-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-offset-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-drop-shadow-offset-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-grayscale': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-grayscale': css('grayscale', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropGrayscale'),
    },
    'animate-backdrop-filter-hue-rotate': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-hue-rotate': css('hue-rotate', value),
        })
      },
      modifiers: atStops,
      type: 'angle',
      values: theme('backdropHueRotate'),
    },
    'animate-backdrop-filter-invert': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-invert': css('invert', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropInvert'),
    },
    'animate-backdrop-filter-opacity': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-opacity': css('opacity', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropOpacity'),
    },
    'animate-backdrop-filter-saturate': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-saturate': css('saturate', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropSaturate'),
    },
    'animate-backdrop-filter-sepia': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-sepia': css('sepia', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('backdropSepia'),
    },
    'animate-backdrop-filter-url': {
      fn: (value, { modifier }) => {
        return ({
          ...property('backdrop-filter', modifier, value),
          '--jumi-backdrop-filter-url': css('url', value),
        })
      },
      modifiers: atStops,
      type: 'url',
      values: empty.string,
    },
    'animate-backface-visibility': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-backface-visibility': value,
          ...property('backface-visibility', modifier, value),
        })
      },
      modifiers: atStops,
      values: backfaceVisibility,
    },
    'animate-background': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background': value,
          ...property('background', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['color', 'image', 'position', 'url', 'any'],
      values: empty.none,
    },
    'animate-background-attachment': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-attachment': value,
          ...property('background-attachment', modifier, value),
        })
      },
      modifiers: atStops,
      values: backgroundAttachment,
    },
    'animate-background-blend-mode': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-blend-mode': value,
          ...property('background-blend-mode', modifier, value),
        })
      },
      modifiers: atStops,
      values: mixBlendMode,
    },
    'animate-background-clip': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-clip': value,
          ...property('background-clip', modifier, value),
        })
      },
      modifiers: atStops,
      values: backgroundClip,
    },
    'animate-background-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-color': value,
          ...property('background-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('backgroundColor'),
    },
    'animate-background-image': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-image': value,
          ...property('background-image', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'image',
      values: theme('backgroundImage'),
    },
    'animate-background-origin': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-origin': value,
          ...property('background-origin', modifier, value),
        })
      },
      modifiers: atStops,
      values: backgroundOrigin,
    },
    'animate-background-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-position': value,
          ...property('background-position', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['position', 'percentage', 'length', 'any'],
      values: theme('backgroundPosition'),
    },
    'animate-background-position-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-position', modifier, value),
          '--jumi-background-position-x': value,
        })
      },
      modifiers: atStops,
      type: ['position', 'percentage', 'length', 'any'],
      values: empty.position,
    },
    'animate-background-position-x-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-position', modifier, value),
          '--jumi-background-position-x-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-x-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-position', modifier, value),
          '--jumi-background-position-x-offset': value,
        })
      },
      modifiers: atStops,
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-position-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-position', modifier, value),
          '--jumi-background-position-y': value,
        })
      },
      modifiers: atStops,
      type: ['position', 'percentage', 'length', 'any'],
      values: merge(objectPosition, percentage),
    },
    'animate-background-position-y-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-position', modifier, value),
          '--jumi-background-position-y-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-y-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-position', modifier, value),
          '--jumi-background-position-y-offset': value,
        })
      },
      modifiers: atStops,
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-repeat': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-repeat': value,
          ...property('background-repeat', modifier, value),
        })
      },
      modifiers: atStops,
      values: backgroundRepeat,
    },
    'animate-background-repeat-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-repeat', modifier, value),
          '--jumi-background-repeat-x': value,
        })
      },
      modifiers: atStops,
      values: backgroundRepeatAxis,
    },
    'animate-background-repeat-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-repeat', modifier, value),
          '--jumi-background-repeat-y': value,
        })
      },
      modifiers: atStops,
      values: backgroundRepeatAxis,
    },
    'animate-background-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-background-size': value,
          ...property('background-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: theme('backgroundSize'),
    },
    'animate-background-size-height': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-size', modifier, value),
          '--jumi-background-size-height': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-background-size-width': {
      fn: (value, { modifier }) => {
        return ({
          ...property('background-size', modifier, value),
          '--jumi-background-size-width': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-block-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-block-size': value,
          ...property('block-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: empty.auto,
    },
    'animate-border': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border': value,
          ...property('border', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-border-block': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-block': value,
          ...property('border-block', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('borderWidth'),
    },
    'animate-border-block-color': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-block-color', modifier, value),
          '--jumi-border-block-color': value,
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-block-end-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-end-end-radius': value,
          '--jumi-border-end-start-radius': value,
          ...property('border-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-block-end-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-block-end-width': value,
          ...property('border-block-end-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-start-radius': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-radius', modifier, value),
          '--jumi-border-start-end-radius': value,
          '--jumi-border-start-start-radius': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-block-start-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-block-start-width': value,
          ...property('border-block-start-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-block-end-width': value,
          '--jumi-border-block-start-width': value,
          ...property('border-block-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-bottom-left-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-bottom-left-radius': value,
          ...property('border-bottom-left-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-bottom-left-radius': value,
          '--jumi-border-bottom-right-radius': value,
          ...property('border-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-right-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-bottom-right-radius': value,
          ...property('border-bottom-right-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-bottom-width': value,
          ...property('border-bottom-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-collapse': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-collapse': value,
          ...property('border-collapse', modifier, value),
        })
      },
      modifiers: atStops,
      values: borderCollapse,
    },
    'animate-border-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-color': value,
          ...property('border-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-end-end-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-end-end-radius': value,
          ...property('border-end-end-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-end-start-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-end-start-radius': value,
          ...property('border-end-start-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-image': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-image': value,
          ...property('border-image', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'image',
      values: empty.none,
    },
    'animate-border-image-outset': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-image-outset': value,
          ...property('border-image-outset', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-bottom': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-outset', modifier, value),
          '--jumi-border-image-outset-bottom': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-left': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-outset', modifier, value),
          '--jumi-border-image-outset-left': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-right': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-outset', modifier, value),
          '--jumi-border-image-outset-right': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-top': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-outset', modifier, value),
          '--jumi-border-image-outset-top': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-outset', modifier, value),
          '--jumi-border-image-outset-left': value,
          '--jumi-border-image-outset-right': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-outset', modifier, value),
          '--jumi-border-image-outset-bottom': value,
          '--jumi-border-image-outset-top': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-repeat': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-image-repeat': value,
          ...property('border-image-repeat', modifier, value),
        })
      },
      modifiers: atStops,
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-repeat', modifier, value),
          '--jumi-border-image-repeat-x': value,
        })
      },
      modifiers: atStops,
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-image-repeat', modifier, value),
          '--jumi-border-image-repeat-y': value,
        })
      },
      modifiers: atStops,
      values: borderImageRepeat,
    },
    'animate-border-inline-end-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-end-end-radius': value,
          ...property('border-radius', modifier, value),
          '--jumi-border-start-end-radius': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-inline-end-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-inline-end-width': value,
          ...property('border-inline-end-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-start-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-end-start-radius': value,
          ...property('border-radius', modifier, value),
          '--jumi-border-start-start-radius': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-inline-start-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-inline-start-width': value,
          ...property('border-inline-start-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-inline-end-width': value,
          '--jumi-border-inline-start-width': value,
          ...property('border-inline-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-left-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-bottom-left-radius': value,
          ...property('border-radius', modifier, value),
          '--jumi-border-top-left-radius': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-left-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-left-width': value,
          ...property('border-left-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-radius': value,
          ...property('border-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-right-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-bottom-right-radius': value,
          ...property('border-radius', modifier, value),
          '--jumi-border-top-right-radius': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-right-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-right-width': value,
          ...property('border-right-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-start-end-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-start-end-radius': value,
          ...property('border-start-end-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-start-start-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-start-start-radius': value,
          ...property('border-start-start-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-left-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-top-left-radius': value,
          ...property('border-top-left-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-radius': {
      fn: (value, { modifier }) => {
        return ({
          ...property('border-radius', modifier, value),
          '--jumi-border-top-left-radius': value,
          '--jumi-border-top-right-radius': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-right-radius': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-top-right-radius': value,
          ...property('border-top-right-radius', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-top-width': value,
          ...property('border-top-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-border-width': value,
          ...property('border-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-bottom': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-bottom': value,
          ...property('bottom', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['number', 'length', 'percentage'],
      values: theme('inset', inset),
    },
    'animate-box-decoration-break': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-box-decoration-break': value,
          ...property('box-decoration-break', modifier, value),
        })
      },
      modifiers: atStops,
      values: boxDecorationBreak,
    },
    'animate-box-shadow': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-box-shadow': value,
          ...property('box-shadow', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'shadow', 'any'],
      values: theme('boxShadow'),
    },
    'animate-box-shadow-blur': {
      fn: (value, { modifier }) => {
        return ({
          ...property('box-shadow', modifier, value),
          '--jumi-box-shadow-blur': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-box-shadow-color': {
      fn: (value, { modifier }) => {
        return ({
          ...property('box-shadow', modifier, value),
          '--jumi-box-shadow-color': value,
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-box-shadow-offset-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('box-shadow', modifier, value),
          '--jumi-box-shadow-offset-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-offset-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('box-shadow', modifier, value),
          '--jumi-box-shadow-offset-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-spread': {
      fn: (value, { modifier }) => {
        return ({
          ...property('box-shadow', modifier, value),
          '--jumi-box-shadow-spread': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-sizing': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-box-sizing': value,
          ...property('box-sizing', modifier, value),
        })
      },
      modifiers: atStops,
      values: boxSizing,
    },
    'animate-break-after': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-break-after': value,
          ...property('break-after', modifier, value),
        })
      },
      modifiers: atStops,
      values: breakAfter,
    },
    'animate-break-before': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-break-before': value,
          ...property('break-before', modifier, value),
        })
      },
      modifiers: atStops,
      values: breakBefore,
    },
    'animate-break-inside': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-break-inside': value,
          ...property('break-inside', modifier, value),
        })
      },
      modifiers: atStops,
      values: breakInside,
    },
    'animate-caption-side': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-caption-side': value,
          ...property('caption-side', modifier, value),
        })
      },
      modifiers: atStops,
      values: captionSide,
    },
    'animate-caret-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-caret-color': value,
          ...property('caret-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('caretColor'),
    },
    'animate-clear': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-clear': value,
          ...property('clear', modifier, value),
        })
      },
      modifiers: atStops,
      values: clear,
    },
    'animate-clip-path': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-clip-path': value,
          ...property('clip-path', modifier, value),
        })
      },
      modifiers: atStops,
      values: clipPath,
    },
    'animate-clip-rule': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-clip-rule': value,
          ...property('clip-rule', modifier, value),
        })
      },
      modifiers: atStops,
      values: clipRule,
    },
    'animate-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-color': value,
          ...property('color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('colors'),
    },
    'animate-color-interpolation': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-color-interpolation': value,
          ...property('color-interpolation', modifier, value),
        })
      },
      modifiers: atStops,
      values: colorInterpolation,
    },
    'animate-color-interpolation-filters': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-color-interpolation-filters': value,
          ...property('color-interpolation-filters', modifier, value),
        })
      },
      modifiers: atStops,
      values: colorInterpolation,
    },
    'animate-color-scheme': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-color-scheme': value,
          ...property('color-scheme', modifier, value),
        })
      },
      modifiers: atStops,
      values: colorScheme,
    },
    'animate-column-count': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-count': value,
          ...property('column-count', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'integer',
      values: empty.auto,
    },
    'animate-column-fill': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-fill': value,
          ...property('column-fill', modifier, value),
        })
      },
      modifiers: atStops,
      values: columnFill,
    },
    'animate-column-gap': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-gap': value,
          ...property('gap', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-column-rule': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-rule': value,
          ...property('column-rule', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-column-rule-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-rule-color': value,
          ...property('column-rule-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-column-rule-style': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-rule-style': value,
          ...property('column-rule-style', modifier, value),
        })
      },
      modifiers: atStops,
      values: columnRuleStyle,
    },
    'animate-column-rule-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-rule-width': value,
          ...property('column-rule-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length'],
      values: columnRuleWidth,
    },
    'animate-column-span': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-span': value,
          ...property('column-span', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'integer',
      values: columnSpan,
    },
    'animate-column-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-column-width': value,
          ...property('column-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: columnWidth,
    },
    'animate-columns': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-columns': value,
          ...property('columns', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length', 'integer'],
      values: empty.auto,
    },
    'animate-contain': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-contain': value,
          ...property('contain', modifier, value),
        })
      },
      modifiers: atStops,
      values: contain,
    },
    'animate-contain-intrinsic-block-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-contain-intrinsic-block-size': value,
          ...property('contain-intrinsic-block-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-height': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-contain-intrinsic-height': value,
          ...property('contain-intrinsic-height', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-inline-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-contain-intrinsic-inline-size': value,
          ...property('contain-intrinsic-inline-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-contain-intrinsic-size': value,
          ...property('contain-intrinsic-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: empty.none,
    },
    'animate-contain-intrinsic-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-contain-intrinsic-width': value,
          ...property('contain-intrinsic-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: containIntrinsic,
    },
    'animate-content': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-content': value,
          ...property('content', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['image', 'any'],
      values: content,
    },
    'animate-content-visibility': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-content-visibility': value,
          ...property('content-visibility', modifier, value),
        })
      },
      modifiers: atStops,
      values: contentVisibility,
    },
    'animate-counter-increment': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-counter-increment': value,
          ...property('counter-increment', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-reset': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-counter-reset': value,
          ...property('counter-reset', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-set': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-counter-set': value,
          ...property('counter-set', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-cursor': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-cursor': value,
          ...property('cursor', modifier, value),
        })
      },
      modifiers: atStops,
      values: cursor,
    },
    'animate-cx': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-cx': value,
          ...property('cx', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-cy': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-cy': value,
          ...property('cy', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-d': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-d': value,
          ...property('d', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-display': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-display': value,
          ...property('display', modifier, value),
        })
      },
      modifiers: atStops,
      values: display,
    },
    'animate-display-inside': {
      fn: (value, { modifier }) => {
        return ({
          ...property('display', modifier, value),
          '--jumi-display-inside': modifier ? join([modifier, value]) : value,
        })
      },
      modifiers: merge(displayOutside, atStops),
      values: displayInside,
    },
    'animate-display-outside': {
      fn: (value, { modifier }) => {
        return ({
          ...property('display', modifier, value),
          '--jumi-display-outside': modifier ? join([value, modifier]) : value,
        })
      },
      modifiers: merge(displayInside, atStops),
      values: displayOutside,
    },
    'animate-dominant-baseline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-dominant-baseline': value,
          ...property('dominant-baseline', modifier, value),
        })
      },
      modifiers: atStops,
      values: dominantBaseline,
    },
    'animate-empty-cells': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-empty-cells': value,
          ...property('empty-cells', modifier, value),
        })
      },
      modifiers: atStops,
      values: emptyCells,
    },
    'animate-fill': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-fill': value,
          ...property('fill', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['color', 'url', 'any'],
      values: theme('colors', fill),
    },
    'animate-fill-opacity': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-fill-opacity': value,
          ...property('fill-opacity', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-fill-rule': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-fill-rule': value,
          ...property('fill-rule', modifier, value),
        })
      },
      modifiers: atStops,
      values: fillRule,
    },
    'animate-filter': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-filter': value,
          ...property('filter', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-filter-blur': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-blur': css('blur', value),
        })
      },
      modifiers: atStops,
      type: 'length',
      values: theme('blur'),
    },
    'animate-filter-brightness': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-brightness': css('brightness', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('brightness'),
    },
    'animate-filter-contrast': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-contrast': css('contrast', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('contrast'),
    },
    'animate-filter-drop-shadow': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-drop-shadow': css('drop-shadow', value),
        })
      },
      modifiers: atStops,
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-filter-drop-shadow-blur': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-drop-shadow-blur': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-filter-drop-shadow-color': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-drop-shadow-color': value,
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-filter-drop-shadow-offset-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-drop-shadow-offset-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-drop-shadow-offset-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-drop-shadow-offset-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-grayscale': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-grayscale': css('grayscale', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('grayscale'),
    },
    'animate-filter-hue-rotate': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-hue-rotate': 'hue-rotate(' + value + ')',
        })
      },
      modifiers: atStops,
      type: 'angle',
      values: theme('hueRotate'),
    },
    'animate-filter-invert': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-invert': css('invert', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('invert'),
    },
    'animate-filter-opacity': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-opacity': css('opacity', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-filter-saturate': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-saturate': css('saturate', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('saturate'),
    },
    'animate-filter-sepia': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-sepia': css('sepia', value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('sepia'),
    },
    'animate-filter-url': {
      fn: (value, { modifier }) => {
        return ({
          ...property('filter', modifier, value),
          '--jumi-filter-url': css('url', value),
        })
      },
      modifiers: atStops,
      type: 'url',
      values: empty.string,
    },
    'animate-flex': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex': value,
          ...property('flex', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('flex'),
    },
    'animate-flex-basis': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex-basis': value,
          ...property('flex-basis', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: theme('flexBasis'),
    },
    'animate-flex-direction': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex-direction': value,
          ...property('flex-direction', modifier, value),
        })
      },
      modifiers: atStops,
      values: flexDirection,
    },
    'animate-flex-flow': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex-flow': value,
          ...property('flex-flow', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.string,
    },
    'animate-flex-grow': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex-grow': value,
          ...property('flex-grow', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'any'],
      values: theme('flexGrow'),
    },
    'animate-flex-shrink': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex-shrink': value,
          ...property('flex-shrink', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'any'],
      values: theme('flexShrink'),
    },
    'animate-flex-wrap': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flex-wrap': value,
          ...property('flex-wrap', modifier, value),
        })
      },
      modifiers: atStops,
      values: flexWrap,
    },
    'animate-float': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-float': value,
          ...property('float', modifier, value),
        })
      },
      modifiers: atStops,
      values: float,
    },
    'animate-flood-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flood-color': value,
          ...property('flood-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('colors'),
    },
    'animate-flood-opacity': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-flood-opacity': value,
          ...property('flood-opacity', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-font-family': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-family': value,
          ...property('font-family', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['generic-name', 'family-name'],
      values: fontFamily,
    },
    'animate-font-feature-settings': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-feature-settings': value,
          ...property('font-feature-settings', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['integer', 'any'],
      values: fontFeatureSettings,
    },
    'animate-font-kerning': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-kerning': value,
          ...property('font-kerning', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontKerning,
    },
    'animate-font-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-size': value,
          ...property('font-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['absolute-size', 'relative-size', 'length', 'percentage', 'any'],
      values: fontSize,
    },
    'animate-font-size-adjust': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-size-adjust': modifier ? join([value, modifier]) : value,
          ...property('font-size-adjust', modifier, value),
        })
      },
      modifiers: merge(fontSizeAdjustMetric, atStops),
      type: ['number', 'any'],
      values: fontSizeAdjust,
    },
    'animate-font-style': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-style': modifier ? join([value, modifier]) : value,
          ...property('font-style', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontStyle,
    },
    'animate-font-synthesis': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-synthesis': value,
          ...property('font-synthesis', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-font-synthesis-small-caps': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-synthesis-small-caps': value,
          ...property('font-synthesis-small-caps', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontSynthesisSmallCaps,
    },
    'animate-font-synthesis-style': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-synthesis-style': value,
          ...property('font-synthesis-style', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontSynthesisStyle,
    },
    'animate-font-synthesis-weight': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-synthesis-weight': value,
          ...property('font-synthesis-weight', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontSynthesisWeight,
    },
    'animate-font-variant': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant': value,
          ...property('font-variant', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.string,
    },
    'animate-font-variant-alternates': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant-alternates': value,
          ...property('font-variant-alternates', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontVariantAlternates,
    },
    'animate-font-variant-caps': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant-caps': value,
          ...property('font-variant-caps', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontVariantCaps,
    },
    'animate-font-variant-east-asian': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant-east-asian': modifier ? join([value, modifier]) : value,
          ...property('font-variant-east-asian', modifier, value),
        })
      },
      modifiers: merge(fontVariantEastAsianWidth, atStops),
      values: fontVariantEastAsian,
    },
    'animate-font-variant-ligatures': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant-ligatures': value,
          ...property('font-variant-ligatures', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontVariantLigatures,
    },
    'animate-font-variant-numeric': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant-numeric': value,
          ...property('font-variant-numeric', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontVariantNumeric,
    },
    'animate-font-variant-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variant-position': value,
          ...property('font-variant-position', modifier, value),
        })
      },
      modifiers: atStops,
      values: fontVariantPosition,
    },
    'animate-font-variation-settings': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-variation-settings': value,
          ...property('font-variation-settings', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'any'],
      values: empty.string,
    },
    'animate-font-weight': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-font-weight': value,
          ...property('font-weight', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'number',
      values: fontWeight,
    },
    'animate-forced-color-adjust': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-forced-color-adjust': value,
          ...property('forced-color-adjust', modifier, value),
        })
      },
      modifiers: atStops,
      values: forcedColorAdjust,
    },
    'animate-gap': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-gap': value,
          ...property('gap', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: theme('gap'),
    },
    'animate-grid': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid': value,
          ...property('grid', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.string,
    },
    'animate-grid-auto-columns': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-auto-columns': value,
          ...property('grid-auto-columns', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: theme('gridAutoColumns'),
    },
    'animate-grid-auto-flow': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-auto-flow': modifier ? join([value, modifier]) : value,
          ...property('grid-auto-flow', modifier, value),
        })
      },
      modifiers: merge(gridAutoFlowPacking, atStops),
      values: gridAutoFlow,
    },
    'animate-grid-auto-rows': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-auto-rows': value,
          ...property('grid-auto-rows', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: theme('gridAutoRows'),
    },
    'animate-grid-column': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-column': value,
          ...property('grid-column', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('gridColumn'),
    },
    'animate-grid-column-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-column-end': modifier ? join([modifier, value]) : value,
          ...property('grid-column-end', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('gridColumnEnd'),
    },
    'animate-grid-column-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-column-start': modifier ? join([modifier, value]) : value,
          ...property('grid-column-start', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('gridColumnStart'),
    },
    'animate-grid-row': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-row': value,
          ...property('grid-row', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('gridRow'),
    },
    'animate-grid-row-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-row-end': modifier ? join([modifier, value]) : value,
          ...property('grid-row-end', modifier, value),
        })
      },
      modifiers: merge(gridSize, atStops),
      values: theme('gridRowEnd'),
    },
    'animate-grid-row-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-row-start': modifier ? join([modifier, value]) : value,
          ...property('grid-row-start', modifier, value),
        })
      },
      modifiers: merge(gridSize, atStops),
      values: theme('gridRowStart'),
    },
    'animate-grid-template-areas': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-template-areas': value,
          ...property('grid-template-areas', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-grid-template-columns': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-template-columns': value,
          ...property('grid-template-columns', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['any'],
      values: theme('gridTemplateColumns'),
    },
    'animate-grid-template-rows': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-grid-template-rows': value,
          ...property('grid-template-rows', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['any'],
      values: theme('gridTemplateRows'),
    },
    'animate-hanging-punctuation': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-hanging-punctuation': value,
          ...property('hanging-punctuation', modifier, value),
        })
      },
      modifiers: atStops,
      values: hangingPunctuation,
    },
    'animate-height': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-height': value,
          ...property('height', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('height'),
    },
    'animate-hyphenate-character': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-hyphenate-character': value,
          ...property('hyphenate-character', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.auto,
    },
    'animate-hyphenate-limit-chars': {
      fn: (value, { modifier }) => {
        const hyphenateLimitChars: CssInJs = {
          ...property('hyphenate-limit-chars', modifier, value),
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
      modifiers: merge(hyphenateLimitCharsProperties, atStops),
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphens': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-hyphens': value,
          ...property('hyphens', modifier, value),
        })
      },
      modifiers: atStops,
      values: hyphens,
    },
    'animate-image-orientation': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-image-orientation': value,
          ...property('image-orientation', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['angle', 'any'],
      values: imageOrientation,
    },
    'animate-image-rendering': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-image-rendering': value,
          ...property('image-rendering', modifier, value),
        })
      },
      modifiers: atStops,
      values: imageRendering,
    },
    'animate-initial-letter': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-initial-letter': modifier ? join([value, modifier]) : value,
          ...property('initial-letter', modifier, value),
        })
      },
      modifiers: merge(initialLetterPosition, atStops),
      type: ['number', 'integer', 'any'],
      values: initialLetter,
    },
    'animate-inline-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inline-size': value,
          ...property('inline-size', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: inlineSize,
    },
    'animate-inset': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset': value,
          ...property('inset', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset-block': value,
          ...property('inset-block', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset-block-end': value,
          ...property('inset-block-end', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset-block-start': value,
          ...property('inset-block-start', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset-inline': value,
          ...property('inset-inline', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset-inline-end': value,
          ...property('inset-inline-end', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-inset-inline-start': value,
          ...property('inset-inline-start', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-justify-content': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-justify-content': value,
          ...property('justify-content', modifier, value),
        })
      },
      modifiers: atStops,
      values: justifyContent,
    },
    'animate-justify-items': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-justify-items': value,
          ...property('justify-items', modifier, value),
        })
      },
      modifiers: atStops,
      values: justifyItems,
    },
    'animate-justify-self': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-justify-self': value,
          ...property('justify-self', modifier, value),
        })
      },
      modifiers: atStops,
      values: justifySelf,
    },
    'animate-left': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-left': value,
          ...property('left', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-letter-spacing': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-letter-spacing': value,
          ...property('letter-spacing', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('letterSpacing'),
    },
    'animate-lighting-color': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-lighting-color': value,
          ...property('lighting-color', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('colors'),
    },
    'animate-line-break': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-line-break': value,
          ...property('line-break', modifier, value),
        })
      },
      modifiers: atStops,
      values: lineBreak,
    },
    'animate-line-clamp': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-line-clamp': value,
          ...property('line-clamp', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'any'],
      values: empty.none,
    },
    'animate-line-height': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-line-height': value,
          ...property('line-height', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'length', 'percentage'],
      values: theme('lineHeight'),
    },
    'animate-list-style': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-list-style': value,
          ...property('list-style', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-list-style-image': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-list-style-image': value,
          ...property('list-style-image', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-list-style-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-list-style-position': value,
          ...property('list-style-position', modifier, value),
        })
      },
      modifiers: atStops,
      values: listStylePosition,
    },
    'animate-list-style-type': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-list-style-type': value,
          ...property('list-style-type', modifier, value),
        })
      },
      modifiers: atStops,
      values: listStyleType,
    },
    'animate-margin': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin': value,
          ...property('margin', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-block': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-block': value,
          ...property('margin-block', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-block-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-block-end': value,
          ...property('margin-block-end', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-block-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-block-start': value,
          ...property('margin-block-start', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-bottom': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-bottom': value,
          ...property('margin-bottom', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-inline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-inline': value,
          ...property('margin-inline', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-inline-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-inline-end': value,
          ...property('margin-inline-end', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-inline-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-inline-start': value,
          ...property('margin-inline-start', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-left': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-left': value,
          ...property('margin-left', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-right': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-right': value,
          ...property('margin-right', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-top': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-margin-top': value,
          ...property('margin-top', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-marker': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-marker': value,
          ...property('marker', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-marker-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-marker-end': value,
          ...property('marker-end', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-marker-mid': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-marker-mid': value,
          ...property('marker-mid', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-marker-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-marker-start': value,
          ...property('marker-start', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-mask': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask': value,
          ...property('mask', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-mask-border': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border': value,
          ...property('mask-border', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.none,
    },
    'animate-mask-border-mode': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border-mode': value,
          ...property('mask-border-mode', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskType,
    },
    'animate-mask-border-outset': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border-outset': value,
          ...property('mask-border-outset', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-bottom': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-outset', modifier, value),
          '--jumi-mask-border-outset-bottom': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-left': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-outset', modifier, value),
          '--jumi-mask-border-outset-left': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-right': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-outset', modifier, value),
          '--jumi-mask-border-outset-right': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-top': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-outset', modifier, value),
          '--jumi-mask-border-outset-top': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-outset', modifier, value),
          '--jumi-mask-border-outset-left': value,
          '--jumi-mask-border-outset-right': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-outset', modifier, value),
          '--jumi-mask-border-outset-bottom': value,
          '--jumi-mask-border-outset-top': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-repeat': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border-repeat': value,
          ...property('mask-border-repeat', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskBorderRepeat,
    },
    'animate-mask-border-slice': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border-slice': value,
          ...property('mask-border-slice', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-bottom': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-slice', modifier, value),
          '--jumi-mask-border-slice-bottom': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-left': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-slice', modifier, value),
          '--jumi-mask-border-slice-left': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-right': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-slice', modifier, value),
          '--jumi-mask-border-slice-right': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-top': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-slice', modifier, value),
          '--jumi-mask-border-slice-top': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-slice', modifier, value),
          '--jumi-mask-border-slice-left': value,
          '--jumi-mask-border-slice-right': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('mask-border-slice', modifier, value),
          '--jumi-mask-border-slice-bottom': value,
          '--jumi-mask-border-slice-top': value,
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-source': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border-source': value,
          ...property('mask-border-source', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-border-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-border-width': value,
          ...property('mask-border-width', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('borderWidth'),
    },
    'animate-mask-clip': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-clip': value,
          ...property('mask-clip', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskClip,
    },
    'animate-mask-composite': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-composite': value,
          ...property('mask-composite', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskComposite,
    },
    'animate-mask-image': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-image': value,
          ...property('mask-image', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-mode': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-mode': value,
          ...property('mask-mode', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskMode,
    },
    'animate-mask-origin': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-origin': value,
          ...property('mask-origin', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskOrigin,
    },
    'animate-mask-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-position': value,
          ...property('mask-position', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
    },
    'animate-mask-repeat': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-repeat': value,
          ...property('mask-repeat', modifier, value),
        })
      },
      modifiers: atStops,
      values: backgroundRepeat,
    },
    'animate-mask-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-size': value,
          ...property('mask-size', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-mask-type': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mask-type': value,
          ...property('mask-type', modifier, value),
        })
      },
      modifiers: atStops,
      values: maskType,
    },
    'animate-math-depth': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-math-depth': value,
          ...property('math-depth', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'integer',
      values: mathDepth,
    },
    'animate-math-depth-add': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-math-depth': `add(${value})`,
          ...property('math-depth', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'integer',
      values: empty.number,
    },
    'animate-math-style': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-math-style': value,
          ...property('math-style', modifier, value),
        })
      },
      modifiers: atStops,
      values: mathStyle,
    },
    'animate-max-block-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-max-block-size': value,
          ...property('max-block-size', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-height': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-max-height': value,
          ...property('max-height', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-inline-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-max-inline-size': value,
          ...property('max-inline-size', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-max-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-max-width': value,
          ...property('max-width', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-min-block-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-min-block-size': value,
          ...property('min-block-size', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-height': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-min-height': value,
          ...property('min-height', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-inline-size': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-min-inline-size': value,
          ...property('min-inline-size', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-min-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-min-width': value,
          ...property('min-width', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-mix-blend-mode': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-mix-blend-mode': value,
          ...property('mix-blend-mode', modifier, value),
        })
      },
      modifiers: atStops,
      values: mixBlendMode,
    },
    'animate-object-fit': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-object-fit': value,
          ...property('object-fit', modifier, value),
        })
      },
      modifiers: atStops,
      values: objectFit,
    },
    'animate-object-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-object-position': value,
          ...property('object-position', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition'),
    },
    'animate-object-position-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('object-position', modifier, value),
          '--jumi-object-position-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-x-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('object-position', modifier, value),
          '--jumi-object-position-x-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-x-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('object-position', modifier, value),
          '--jumi-object-position-x-offset': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-object-position-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('object-position', modifier, value),
          '--jumi-object-position-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-y-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('object-position', modifier, value),
          '--jumi-object-position-y-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-y-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('object-position', modifier, value),
          '--jumi-object-position-y-offset': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-offset': value,
          ...property('offset', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position', 'any'],
      values: offsetAnchor,
    },
    'animate-offset-anchor': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-offset-anchor': value,
          ...property('offset-anchor', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', empty.auto),
    },
    'animate-offset-anchor-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-anchor', modifier, value),
          '--jumi-offset-anchor-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-x-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-anchor', modifier, value),
          '--jumi-offset-anchor-x-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-x-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-anchor', modifier, value),
          '--jumi-offset-anchor-x-offset': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-anchor-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-anchor', modifier, value),
          '--jumi-offset-anchor-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-y-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-anchor', modifier, value),
          '--jumi-offset-anchor-y-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-y-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-anchor', modifier, value),
          '--jumi-offset-anchor-y-offset': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-distance': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-offset-distance': value,
          ...property('offset-distance', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-path': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-offset-path': value,
          ...property('offset-path', modifier, value),
        })
      },
      modifiers: atStops,
      values: offsetPath,
    },
    'animate-offset-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-offset-position': value,
          ...property('offset-position', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', offsetPosition),
    },
    'animate-offset-position-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-position', modifier, value),
          '--jumi-offset-position-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-x-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-position', modifier, value),
          '--jumi-offset-position-x-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-x-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-position', modifier, value),
          '--jumi-offset-position-x-offset': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-position-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-position', modifier, value),
          '--jumi-offset-position-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-y-edge': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-position', modifier, value),
          '--jumi-offset-position-y-edge': value,
        })
      },
      modifiers: atStops,
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-y-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('offset-position', modifier, value),
          '--jumi-offset-position-y-offset': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-rotate': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-offset-rotate': value,
          ...property('offset-rotate', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['angle', 'any'],
      values: theme('rotate', offsetRotate),
    },
    'animate-opacity': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-opacity': value,
          ...property('opacity', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-order': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-order': value,
          ...property('order', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'integer',
      values: theme('order'),
    },
    'animate-orphans': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-orphans': value,
          ...property('orphans', modifier, value),
        })
      },
      modifiers: atStops,
      type: 'integer',
      values: empty.number,
    },
    'animate-outline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-outline': value,
          ...property('outline', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['line-width', 'length', 'color', 'any'],
      values: empty.none,
    },
    'animate-outline-color': {
      fn: (value, { modifier }) => {
        return ({
          ...property('outline', modifier, value),
          '--jumi-outline-color': value,
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('outlineColor'),
    },
    'animate-outline-offset': {
      fn: (value, { modifier }) => {
        return ({
          ...property('outline', modifier, value),
          '--jumi-outline-offset': value,
        })
      },
      modifiers: atStops,
      type: 'length',
      values: theme('outlineOffset'),
    },
    'animate-outline-style': {
      fn: (value, { modifier }) => {
        return ({
          ...property('outline', modifier, value),
          '--jumi-outline-style': value,
        })
      },
      modifiers: atStops,
      values: outlineStyle,
    },
    'animate-outline-width': {
      fn: (value, { modifier }) => {
        return ({
          ...property('outline', modifier, value),
          '--jumi-outline-width': value,
        })
      },
      modifiers: atStops,
      type: ['line-width'],
      values: theme('outlineWidth'),
    },
    'animate-overflow': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overflow': value,
          ...property('overflow', modifier, value),
        })
      },
      modifiers: atStops,
      values: overflow,
    },
    'animate-overflow-anchor': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overflow-anchor': value,
          ...property('overflow-anchor', modifier, value),
        })
      },
      modifiers: atStops,
      values: overflowAnchor,
    },
    'animate-overflow-block': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overflow-block': value,
          ...property('overflow-block', modifier, value),
        })
      },
      modifiers: atStops,
      values: overflow,
    },
    'animate-overflow-clip-margin': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overflow-clip-margin': value,
          ...property('overflow-clip-margin', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'any'],
      values: overflowClipMargin,
    },
    'animate-overflow-inline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overflow-inline': value,
          ...property('overflow-inline', modifier, value),
        })
      },
      modifiers: atStops,
      values: overflow,
    },
    'animate-overflow-wrap': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overflow-wrap': value,
          ...property('overflow-wrap', modifier, value),
        })
      },
      modifiers: atStops,
      values: overflowWrap,
    },
    'animate-overflow-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('overflow', modifier, value),
          '--jumi-overflow-x': value,
        })
      },
      modifiers: atStops,
      values: overflow,
    },
    'animate-overflow-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('overflow', modifier, value),
          '--jumi-overflow-y': value,
        })
      },
      modifiers: atStops,
      values: overflow,
    },
    'animate-overscroll-behavior': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overscroll-behavior': value,
          ...property('overscroll-behavior', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.auto,
    },
    'animate-overscroll-behavior-block': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overscroll-behavior-block': value,
          ...property('overscroll-behavior-block', modifier, value),
        })
      },
      modifiers: atStops,
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-inline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overscroll-behavior-inline': value,
          ...property('overscroll-behavior-inline', modifier, value),
        })
      },
      modifiers: atStops,
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-x': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overscroll-behavior-x': value,
          ...property('overscroll-behavior-x', modifier, value),
        })
      },
      modifiers: atStops,
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-y': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-overscroll-behavior-y': value,
          ...property('overscroll-behavior-y', modifier, value),
        })
      },
      modifiers: atStops,
      values: overscrollBehavior,
    },
    'animate-padding': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding': value,
          ...property('padding', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-block': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-block': value,
          ...property('padding-block', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-block-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-block-end': value,
          ...property('padding-block-end', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-block-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-block-start': value,
          ...property('padding-block-start', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-bottom': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-bottom': value,
          ...property('padding-bottom', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-inline': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-inline': value,
          ...property('padding-inline', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-inline-end': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-inline-end': value,
          ...property('padding-inline-end', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-inline-start': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-inline-start': value,
          ...property('padding-inline-start', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-left': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-left': value,
          ...property('padding-left', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-right': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-right': value,
          ...property('padding-right', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-top': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-padding-top': value,
          ...property('padding-top', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-page': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-page': value,
          ...property('page', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.auto,
    },
    'animate-paint-order': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-paint-order': value,
          ...property('paint-order', modifier, value),
        })
      },
      modifiers: atStops,
      values: paintOrder,
    },
    'animate-position': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-position': value,
          ...property('position', modifier, value),
        })
      },
      modifiers: atStops,
      values: position,
    },
    'animate-right': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-right': value,
          ...property('right', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-rotate': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-rotate': value,
          ...property('rotate', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('rotate'),
    },
    'animate-rotate-3d': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-rotate-3d': css('rotate3d', value),
          ...property('transform', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.string,
    },
    'animate-rotate-angle': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-rotate-angle': value,
          ...property('rotate', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'angle',
      values: theme('rotate'),
    },
    'animate-rotate-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('rotate', modifier, value),
          '--jumi-rotate-x': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('rotate', modifier, value),
          '--jumi-rotate-y': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-z': {
      fn: (value, { modifier }) => {
        return ({
          ...property('rotate', modifier, value),
          '--jumi-rotate-z': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-row-gap': {
      fn: (value, { modifier }) => {
        return ({
          ...property('gap', modifier, value),
          '--jumi-row-gap': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: empty.number,
    },
    'animate-scale': {
      fn: (value, { modifier }) => {
        return {
          '--jumi-scale': value,
          ...property('scale', modifier, value),
        }
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('scale', modifier, value),
          '--jumi-scale-x': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('scale', modifier, value),
          '--jumi-scale-y': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-z': {
      fn: (value, { modifier }) => {
        return ({
          ...property('scale', modifier, value),
          '--jumi-scale-z': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-skew': {
      fn: (value, { modifier }) => {
        const [x, y] = value.split(/\s+/)
        return {
          ...property('transform', modifier, value),
          '--jumi-skew-x': x ?? value,
          '--jumi-skew-y': y ?? x ?? value,
        }
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('skew'),
    },
    'animate-skew-x': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-skew-x': value,
          ...property('transform', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('skew'),
    },
    'animate-skew-y': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-skew-y': value,
          ...property('transform', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('skew'),
    },
    'animate-stroke': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-stroke': value,
          ...property('stroke', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('colors'),
    },
    'animate-stroke-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-stroke-width': value,
          ...property('stroke-width', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'number', 'any'],
      values: theme('strokeWidth'),
    },
    'animate-text-align': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-text-align': value,
          ...property('text-align', modifier, value),
        })
      },
      modifiers: atStops,
      values: textAlign,
    },
    'animate-text-shadow': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-text-shadow': value,
          ...property('text-shadow', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('dropShadow'),
    },
    'animate-text-shadow-blur': {
      fn: (value, { modifier }) => {
        return ({
          ...property('text-shadow', modifier, value),
          '--jumi-text-shadow-blur-radius': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-text-shadow-color': {
      fn: (value, { modifier }) => {
        return ({
          ...property('text-shadow', modifier, value),
          '--jumi-text-shadow-color': value,
        })
      },
      modifiers: atStops,
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-text-shadow-offset-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('text-shadow', modifier, value),
          '--jumi-text-shadow-offset-x': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-text-shadow-offset-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('text-shadow', modifier, value),
          '--jumi-text-shadow-offset-y': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-top': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-top': value,
          ...property('top', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-transform': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-transform': value,
          ...property('transform', modifier, value),
        })
      },
      modifiers: atStops,
      values: empty.string,
    },
    'animate-transform-origin': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-transform-origin': value,
          ...property('transform-origin', modifier, value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('transformOrigin'),
    },
    'animate-transform-origin-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('transform-origin', modifier, value),
          '--jumi-transform-origin-x': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: originX,
    },
    'animate-transform-origin-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('transform-origin', modifier, value),
          '--jumi-transform-origin-y': value,
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'position'],
      values: originY,
    },
    'animate-transform-origin-z': {
      fn: (value, { modifier }) => {
        return ({
          ...property('transform-origin', modifier, value),
          '--jumi-transform-origin-z': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length'],
      values: empty.number,
    },
    'animate-transform-style': {
      fn: (value, { modifier }) => {
        return ({
          ...property('transform', modifier, value),
          '--jumi-transform-style': value,
        })
      },
      modifiers: atStops,
      values: transformStyle,
    },
    'animate-translate': {
      fn: (value, { modifier }) => {
        return {
          '--jumi-translate': value,
          ...property('translate', modifier, value),
        }
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      values: theme('translate'),
    },
    'animate-translate-3d': {
      fn: (value, { modifier }) => {
        return ({
          ...property('transform', modifier, value),
          '--jumi-translate-3d': css('translate3d', value),
        })
      },
      modifiers: atStops,
      type: ['length', 'percentage', 'any'],
      values: empty.string,
    },
    'animate-translate-x': {
      fn: (value, { modifier }) => {
        return ({
          ...property('translate', modifier, value),
          '--jumi-translate-x': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-y': {
      fn: (value, { modifier }) => {
        return ({
          ...property('translate', modifier, value),
          '--jumi-translate-y': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-z': {
      fn: (value, { modifier }) => {
        return ({
          ...property('translate', modifier, value),
          '--jumi-translate-z': value,
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-visibility': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-visibility': value,
          ...property('visibility', modifier, value),
        })
      },
      modifiers: atStops,
      values: visibility,
    },
    'animate-width': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-width': value,
          ...property('width', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('width'),
    },
    'animate-x': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-x': value,
          ...property('x', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-y': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-y': value,
          ...property('y', modifier, value),
        })
      },
      modifiers: atStops,
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-z-index': {
      fn: (value, { modifier }) => {
        return ({
          '--jumi-z-index': value,
          ...property('z-index', modifier, value),
        })
      },
      modifiers: atStops,
      values: theme('zIndex'),
    },
    'animation-composition': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-composition': value }
        return { [`--jumi-${modifier}-animation-composition`]: value }
      },
      modifiers,
      values: animationComposition,
    },
    'animation-delay': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-delay': value }
        return { [`--jumi-${modifier}-animation-delay`]: value }
      },
      modifiers,
      values: theme('transitionDelay'),
    },
    'animation-direction': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-direction': value }
        return { [`--jumi-${modifier}-animation-direction`]: value }
      },
      modifiers,
      values: animationDirection,
    },
    'animation-duration': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-duration': value }
        return { [`--jumi-${modifier}-animation-duration`]: value }
      },
      modifiers,
      values: theme('transitionDuration'),
    },
    'animation-fill-mode': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-fill-mode': value }
        return { [`--jumi-${modifier}-animation-fill-mode`]: value }
      },
      modifiers,
      values: animationFillMode,
    },
    'animation-iteration-count': {
      fn: (value, { modifier }) => {
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
      fn: (value, { modifier }) => {
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
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-timeline': value }
        return { [`--jumi-${modifier}-animation-timeline`]: value }
      },
      modifiers,
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
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-timing-function': value }
        return { [`--jumi-${modifier}-animation-timing-function`]: value }
      },
      modifiers,
      values: animationTimingFunction,
    },
    'animations': {
      fn: () => creator.animations,
      values: empty.string,
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
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-delay': value }) }
        return { [`--jumi-${modifier}-transition-delay`]: value }
      },
      modifiers: cssProperties,
      values: theme('transitionDelay'),
    },
    'transition-duration': {
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-duration': value }) }
        return { [`--jumi-${modifier}-transition-duration`]: value }
      },
      modifiers: cssProperties,
      values: theme('transitionDuration'),
    },
    'transition-property': {
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-property': value }) }
        return { [`--jumi-${modifier}-transition-property`]: motion(modifier) }
      },
      modifiers: cssProperties,
      values: empty.string,
    },
    'transition-timing-function': {
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-timing-function': value }) }
        return { [`--jumi-${modifier}-transition-timing-function`]: value }
      },
      modifiers: cssProperties,
      values: animationTimingFunction,
    },
    'transitions': {
      fn: () => creator.transitions,
      values: empty.string,
    },
  }

  return matchProperties
}
