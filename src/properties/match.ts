import type { Collection, CssInJs, GetMatchUtilities, MatchProperty } from '@/types'

import { assemble } from '@/helpers/assemble'
import { getCreator } from '@/helpers/create'
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
import { visibility } from '@/theme/visibility'

export const getMatchUtilities: GetMatchUtilities = (api) => {
  const creator = getCreator(api)
  const modifiers = merge(cssProperties, cssEffects)
  const { effect, property, theme } = creator

  const matchProperties: Partial<MatchProperty> = {
    'animate': {
      property: value => ({
        [`--jumi-${value}-animation`]: effect(value),
      }),
      values: cssEffects,
    },
    'animate-accent-color': {
      property: value => ({
        '--jumi-accent-color': value,
        '--jumi-accent-color-property': property('accent-color'),
      }),
      type: 'color',
      values: theme('accentColor'),
    },
    'animate-align-content': {
      property: value => ({
        '--jumi-align-content': value,
        '--jumi-align-content-property': property('align-content'),
      }),
      values: alignContent,
    },
    'animate-align-items': {
      property: value => ({
        '--jumi-align-items': value,
        '--jumi-align-items-property': property('align-items'),
      }),
      values: alignItems,
    },
    'animate-align-self': {
      property: value => ({
        '--jumi-align-self': value,
        '--jumi-align-self-property': property('align-self'),
      }),
      values: alignSelf,
    },
    'animate-alignment-baseline': {
      property: value => ({
        '--jumi-alignment-baseline': value,
        '--jumi-alignment-baseline-property': property('alignment-baseline'),
      }),
      values: alignmentBaseline,
    },
    'animate-all': {
      property: value => ({
        '--jumi-all': value,
        '--jumi-all-property': property('all'),
      }),
      values: all,
    },
    'animate-appearance': {
      property: value => ({
        '--jumi-appearance': value,
        '--jumi-appearance-property': property('appearance'),
      }),
      values: appearance,
    },
    'animate-aspect-ratio': {
      property: value => ({
        '--jumi-aspect-ratio': value,
        '--jumi-aspect-ratio-property': property('aspect-ratio'),
      }),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-height': {
      property: value => ({
        '--jumi-aspect-ratio-height': value,
        '--jumi-aspect-ratio-property': property('aspect-ratio'),
      }),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-width': {
      property: value => ({
        '--jumi-aspect-ratio-property': property('aspect-ratio'),
        '--jumi-aspect-ratio-width': value,
      }),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-backdrop-filter': {
      property: value => ({
        '--jumi-backdrop-filter': value,
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      values: empty.none,
    },
    'animate-backdrop-filter-blur': {
      property: value => ({
        '--jumi-backdrop-filter-blur': css('blur', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: 'length',
      values: theme('backdropBlur'),
    },
    'animate-backdrop-filter-brightness': {
      property: value => ({
        '--jumi-backdrop-filter-brightness': css('brightness', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropBrightness'),
    },
    'animate-backdrop-filter-contrast': {
      property: value => ({
        '--jumi-backdrop-filter-contrast': css('contrast', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropContrast'),
    },
    'animate-backdrop-filter-drop-shadow': {
      property: value => ({
        '--jumi-backdrop-filter-drop-shadow': css('drop-shadow', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-backdrop-filter-drop-shadow-blur': {
      property: value => ({
        '--jumi-backdrop-filter-drop-shadow-blur': value,
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-color': {
      property: value => ({
        '--jumi-backdrop-filter-drop-shadow-color': value,
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-backdrop-filter-drop-shadow-offset-x': {
      property: value => ({
        '--jumi-backdrop-filter-drop-shadow-offset-x': value,
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-offset-y': {
      property: value => ({
        '--jumi-backdrop-filter-drop-shadow-offset-y': value,
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-grayscale': {
      property: value => ({
        '--jumi-backdrop-filter-grayscale': css('grayscale', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropGrayscale'),
    },
    'animate-backdrop-filter-hue-rotate': {
      property: value => ({
        '--jumi-backdrop-filter-hue-rotate': css('hue-rotate', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: 'angle',
      values: theme('backdropHueRotate'),
    },
    'animate-backdrop-filter-invert': {
      property: value => ({
        '--jumi-backdrop-filter-invert': css('invert', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropInvert'),
    },
    'animate-backdrop-filter-opacity': {
      property: value => ({
        '--jumi-backdrop-filter-opacity': css('opacity', value),
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropOpacity'),
    },
    'animate-backdrop-filter-saturate': {
      property: value => ({
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
        '--jumi-backdrop-filter-saturate': css('saturate', value),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropSaturate'),
    },
    'animate-backdrop-filter-sepia': {
      property: value => ({
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
        '--jumi-backdrop-filter-sepia': css('sepia', value),
      }),
      type: ['number', 'percentage'],
      values: theme('backdropSepia'),
    },
    'animate-backdrop-filter-url': {
      property: value => ({
        '--jumi-backdrop-filter-property': property('backdrop-filter'),
        '--jumi-backdrop-filter-url': css('url', value),
      }),
      type: 'url',
      values: empty.string,
    },
    'animate-backface-visibility': {
      property: value => ({
        '--jumi-backface-visibility': value,
        '--jumi-backface-visibility-property': property('backface-visibility'),
      }),
      values: backfaceVisibility,
    },
    'animate-background': {
      property: value => ({
        '--jumi-background': value,
        '--jumi-background-property': property('background'),
      }),
      type: ['color', 'image', 'position', 'url', 'any'],
      values: empty.none,
    },
    'animate-background-attachment': {
      property: value => ({
        '--jumi-background-attachment': value,
        '--jumi-background-attachment-property': property('background-attachment'),
      }),
      values: backgroundAttachment,
    },
    'animate-background-blend-mode': {
      property: value => ({
        '--jumi-background-blend-mode': value,
        '--jumi-background-blend-mode-property': property('background-blend-mode'),
      }),
      values: mixBlendMode,
    },
    'animate-background-clip': {
      property: value => ({
        '--jumi-background-clip': value,
        '--jumi-background-clip-property': property('background-clip'),
      }),
      values: backgroundClip,
    },
    'animate-background-color': {
      property: value => ({
        '--jumi-background-color': value,
        '--jumi-background-color-property': property('background-color'),
      }),
      type: 'color',
      values: theme('backgroundColor'),
    },
    'animate-background-image': {
      property: value => ({
        '--jumi-background-image': value,
        '--jumi-background-image-property': property('background-image'),
      }),
      type: 'image',
      values: theme('backgroundImage'),
    },
    'animate-background-origin': {
      property: value => ({
        '--jumi-background-origin': value,
        '--jumi-background-origin-property': property('background-origin'),
      }),
      values: backgroundOrigin,
    },
    'animate-background-position': {
      property: value => ({
        '--jumi-background-position': value,
        '--jumi-background-position-property': property('background-position'),
      }),
      type: ['position', 'percentage', 'length', 'any'],
      values: theme('backgroundPosition'),
    },
    'animate-background-position-x': {
      property: value => ({
        '--jumi-background-position-property': property('background-position'),
        '--jumi-background-position-x': value,
      }),
      type: ['position', 'percentage', 'length', 'any'],
      values: empty.position,
    },
    'animate-background-position-x-edge': {
      property: value => ({
        '--jumi-background-position-property': property('background-position'),
        '--jumi-background-position-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-x-offset': {
      property: value => ({
        '--jumi-background-position-property': property('background-position'),
        '--jumi-background-position-x-offset': value,
      }),
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-position-y': {
      property: value => ({
        '--jumi-background-position-property': property('background-position'),
        '--jumi-background-position-y': value,
      }),
      type: ['position', 'percentage', 'length', 'any'],
      values: merge(objectPosition, percentage),
    },
    'animate-background-position-y-edge': {
      property: value => ({
        '--jumi-background-position-property': property('background-position'),
        '--jumi-background-position-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-y-offset': {
      property: value => ({
        '--jumi-background-position-property': property('background-position'),
        '--jumi-background-position-y-offset': value,
      }),
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-repeat': {
      property: value => ({
        '--jumi-background-repeat': value,
        '--jumi-background-repeat-property': property('background-repeat'),
      }),
      values: backgroundRepeat,
    },
    'animate-background-repeat-x': {
      property: value => ({
        '--jumi-background-repeat-property': property('background-repeat'),
        '--jumi-background-repeat-x': value,
      }),
      values: backgroundRepeatAxis,
    },
    'animate-background-repeat-y': {
      property: value => ({
        '--jumi-background-repeat-property': property('background-repeat'),
        '--jumi-background-repeat-y': value,
      }),
      values: backgroundRepeatAxis,
    },
    'animate-background-size': {
      property: value => ({
        '--jumi-background-size': value,
        '--jumi-background-size-property': property('background-size'),
      }),
      values: theme('backgroundSize'),
    },
    'animate-background-size-height': {
      property: value => ({
        '--jumi-background-size-height': value,
        '--jumi-background-size-property': property('background-size'),
      }),
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-background-size-width': {
      property: value => ({
        '--jumi-background-size-property': property('background-size'),
        '--jumi-background-size-width': value,
      }),
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-block-size': {
      property: value => ({
        '--jumi-block-size': value,
        '--jumi-block-size-property': property('block-size'),
      }),
      type: ['length', 'percentage', 'any'],
      values: empty.auto,
    },
    'animate-border': {
      property: value => ({
        '--jumi-border': value,
        '--jumi-border-property': property('border'),
      }),
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-border-block': {
      property: value => ({
        '--jumi-border-block': value,
        '--jumi-border-block-property': property('border-block'),
      }),
      values: theme('borderWidth'),
    },
    'animate-border-block-color': {
      property: value => ({
        '--jumi-border-block-color': value,
      }),
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-block-end-radius': {
      property: value => ({
        '--jumi-border-end-end-radius': value,
        '--jumi-border-end-start-radius': value,
        '--jumi-border-radius-property': property('border-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-block-end-width': {
      property: value => ({
        '--jumi-border-block-end-width': value,
        '--jumi-border-block-end-width-property': property('border-block-end-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-start-radius': {
      property: value => ({
        '--jumi-border-radius-property': property('border-radius'),
        '--jumi-border-start-end-radius': value,
        '--jumi-border-start-start-radius': value,
      }),
      values: theme('borderRadius'),
    },
    'animate-border-block-start-width': {
      property: value => ({
        '--jumi-border-block-start-width': value,
        '--jumi-border-block-start-width-property': property('border-block-start-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-width': {
      property: value => ({
        '--jumi-border-block-end-width': value,
        '--jumi-border-block-start-width': value,
        '--jumi-border-block-width-property': property('border-block-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-bottom-left-radius': {
      property: value => ({
        '--jumi-border-bottom-left-radius': value,
        '--jumi-border-bottom-left-radius-property': property('border-bottom-left-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-bottom-radius': {
      property: value => ({
        '--jumi-border-bottom-left-radius': value,
        '--jumi-border-bottom-right-radius': value,
        '--jumi-border-radius-property': property('border-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-bottom-right-radius': {
      property: value => ({
        '--jumi-border-bottom-right-radius': value,
        '--jumi-border-bottom-right-radius-property': property('border-bottom-right-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-bottom-width': {
      property: value => ({
        '--jumi-border-bottom-width': value,
        '--jumi-border-bottom-width-property': property('border-bottom-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-collapse': {
      property: value => ({
        '--jumi-border-collapse': value,
        '--jumi-border-collapse-property': property('border-collapse'),
      }),
      values: borderCollapse,
    },
    'animate-border-color': {
      property: value => ({
        '--jumi-border-color': value,
        '--jumi-border-color-property': property('border-color'),
      }),
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-end-end-radius': {
      property: value => ({
        '--jumi-border-end-end-radius': value,
        '--jumi-border-end-end-radius-property': property('border-end-end-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-end-start-radius': {
      property: value => ({
        '--jumi-border-end-start-radius': value,
        '--jumi-border-end-start-radius-property': property('border-end-start-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-image': {
      property: value => ({
        '--jumi-border-image': value,
        '--jumi-border-image-property': property('border-image'),
      }),
      type: 'image',
      values: empty.none,
    },
    'animate-border-image-outset': {
      property: value => ({
        '--jumi-border-image-outset': value,
        '--jumi-border-image-outset-property': property('border-image-outset'),
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-bottom': {
      property: value => ({
        '--jumi-border-image-outset-bottom': value,
        '--jumi-border-image-outset-property': property('border-image-outset'),
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-left': {
      property: value => ({
        '--jumi-border-image-outset-left': value,
        '--jumi-border-image-outset-property': property('border-image-outset'),
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-right': {
      property: value => ({
        '--jumi-border-image-outset-property': property('border-image-outset'),
        '--jumi-border-image-outset-right': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-top': {
      property: value => ({
        '--jumi-border-image-outset-property': property('border-image-outset'),
        '--jumi-border-image-outset-top': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-x': {
      property: value => ({
        '--jumi-border-image-outset-left': value,
        '--jumi-border-image-outset-property': property('border-image-outset'),
        '--jumi-border-image-outset-right': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-y': {
      property: value => ({
        '--jumi-border-image-outset-bottom': value,
        '--jumi-border-image-outset-property': property('border-image-outset'),
        '--jumi-border-image-outset-top': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-repeat': {
      property: value => ({
        '--jumi-border-image-repeat': value,
        '--jumi-border-image-repeat-property': property('border-image-repeat'),
      }),
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-x': {
      property: value => ({
        '--jumi-border-image-repeat-property': property('border-image-repeat'),
        '--jumi-border-image-repeat-x': value,
      }),
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-y': {
      property: value => ({
        '--jumi-border-image-repeat-property': property('border-image-repeat'),
        '--jumi-border-image-repeat-y': value,
      }),
      values: borderImageRepeat,
    },
    'animate-border-inline-end-radius': {
      property: value => ({
        '--jumi-border-end-end-radius': value,
        '--jumi-border-radius-property': property('border-radius'),
        '--jumi-border-start-end-radius': value,
      }),
      values: theme('borderRadius'),
    },
    'animate-border-inline-end-width': {
      property: value => ({
        '--jumi-border-inline-end-width': value,
        '--jumi-border-inline-end-width-property': property('border-inline-end-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-start-radius': {
      property: value => ({
        '--jumi-border-end-start-radius': value,
        '--jumi-border-radius-property': property('border-radius'),
        '--jumi-border-start-start-radius': value,
      }),
      values: theme('borderRadius'),
    },
    'animate-border-inline-start-width': {
      property: value => ({
        '--jumi-border-inline-start-width': value,
        '--jumi-border-inline-start-width-property': property('border-inline-start-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-width': {
      property: value => ({
        '--jumi-border-inline-end-width': value,
        '--jumi-border-inline-start-width': value,
        '--jumi-border-inline-width-property': property('border-inline-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-left-radius': {
      property: value => ({
        '--jumi-border-bottom-left-radius': value,
        '--jumi-border-property': property('border-radius'),
        '--jumi-border-top-left-radius': value,
      }),
      values: theme('borderRadius'),
    },
    'animate-border-left-width': {
      property: value => ({
        '--jumi-border-left-width': value,
        '--jumi-border-left-width-property': property('border-left-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-radius': {
      property: value => ({
        '--jumi-border-radius': value,
        '--jumi-border-radius-property': property('border-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-right-radius': {
      property: value => ({
        '--jumi-border-bottom-right-radius': value,
        '--jumi-border-radius-property': property('border-radius'),
        '--jumi-border-top-right-radius': value,
      }),
      values: theme('borderRadius'),
    },
    'animate-border-right-width': {
      property: value => ({
        '--jumi-border-right-width': value,
        '--jumi-border-right-width-property': property('border-right-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-start-end-radius': {
      property: value => ({
        '--jumi-border-start-end-radius': value,
        '--jumi-border-start-end-radius-property': property('border-start-end-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-start-start-radius': {
      property: value => ({
        '--jumi-border-start-start-radius': value,
        '--jumi-border-start-start-radius-property': property('border-start-start-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-top-left-radius': {
      property: value => ({
        '--jumi-border-top-left-radius': value,
        '--jumi-border-top-left-radius-property': property('border-top-left-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-top-radius': {
      property: value => ({
        '--jumi-border-radius-property': property('border-radius'),
        '--jumi-border-top-left-radius': value,
        '--jumi-border-top-right-radius': value,
      }),
      values: theme('borderRadius'),
    },
    'animate-border-top-right-radius': {
      property: value => ({
        '--jumi-border-top-right-radius': value,
        '--jumi-border-top-right-radius-property': property('border-top-right-radius'),
      }),
      values: theme('borderRadius'),
    },
    'animate-border-top-width': {
      property: value => ({
        '--jumi-border-top-width': value,
        '--jumi-border-top-width-property': property('border-top-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-width': {
      property: value => ({
        '--jumi-border-width': value,
        '--jumi-border-width-property': property('border-width'),
      }),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-bottom': {
      property: value => ({
        '--jumi-bottom': value,
        '--jumi-bottom-property': property('bottom'),
      }),
      supportsNegativeValues: true,
      type: ['number', 'length', 'percentage'],
      values: theme('inset', inset),
    },
    'animate-box-decoration-break': {
      property: value => ({
        '--jumi-box-decoration-break': value,
        '--jumi-box-decoration-break-property': property('box-decoration-break'),
      }),
      values: boxDecorationBreak,
    },
    'animate-box-shadow': {
      property: value => ({
        '--jumi-box-shadow': value,
        '--jumi-box-shadow-property': property('box-shadow'),
      }),
      type: ['length', 'shadow', 'any'],
      values: theme('boxShadow'),
    },
    'animate-box-shadow-blur': {
      property: value => ({
        '--jumi-box-shadow-blur': value,
        '--jumi-box-shadow-property': property('box-shadow'),
      }),
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-box-shadow-color': {
      property: value => ({
        '--jumi-box-shadow-color': value,
        '--jumi-box-shadow-property': property('box-shadow'),
      }),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-box-shadow-offset-x': {
      property: value => ({
        '--jumi-box-shadow-offset-x': value,
        '--jumi-box-shadow-property': property('box-shadow'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-offset-y': {
      property: value => ({
        '--jumi-box-shadow-offset-y': value,
        '--jumi-box-shadow-property': property('box-shadow'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-spread': {
      property: value => ({
        '--jumi-box-shadow-property': property('box-shadow'),
        '--jumi-box-shadow-spread': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-sizing': {
      property: value => ({
        '--jumi-box-sizing': value,
        '--jumi-box-sizing-property': property('box-sizing'),
      }),
      values: boxSizing,
    },
    'animate-break-after': {
      property: value => ({
        '--jumi-break-after': value,
        '--jumi-break-after-property': property('break-after'),
      }),
      values: breakAfter,
    },
    'animate-break-before': {
      property: value => ({
        '--jumi-break-before': value,
        '--jumi-break-before-property': property('break-before'),
      }),
      values: breakBefore,
    },
    'animate-break-inside': {
      property: value => ({
        '--jumi-break-inside': value,
        '--jumi-break-inside-property': property('break-inside'),
      }),
      values: breakInside,
    },
    'animate-caption-side': {
      property: value => ({
        '--jumi-caption-side': value,
        '--jumi-caption-side-property': property('caption-side'),
      }),
      values: captionSide,
    },
    'animate-caret-color': {
      property: value => ({
        '--jumi-caret-color': value,
        '--jumi-caret-color-property': property('caret-color'),
      }),
      type: 'color',
      values: theme('caretColor'),
    },
    'animate-clear': {
      property: value => ({
        '--jumi-clear': value,
        '--jumi-clear-property': property('clear'),
      }),
      values: clear,
    },
    'animate-clip-path': {
      property: value => ({
        '--jumi-clip-path': value,
        '--jumi-clip-path-property': property('clip-path'),
      }),
      values: clipPath,
    },
    'animate-clip-rule': {
      property: value => ({
        '--jumi-clip-rule': value,
        '--jumi-clip-rule-property': property('clip-rule'),
      }),
      values: clipRule,
    },
    'animate-color': {
      property: value => ({
        '--jumi-color': value,
        '--jumi-color-property': property('color'),
      }),
      type: 'color',
      values: theme('colors'),
    },
    'animate-color-interpolation': {
      property: value => ({
        '--jumi-color-interpolation': value,
        '--jumi-color-interpolation-property': property('color-interpolation'),
      }),
      values: colorInterpolation,
    },
    'animate-color-interpolation-filters': {
      property: value => ({
        '--jumi-color-interpolation-filters': value,
        '--jumi-color-interpolation-filters-property': property('color-interpolation-filters'),
      }),
      values: colorInterpolation,
    },
    'animate-color-scheme': {
      property: value => ({
        '--jumi-color-scheme': value,
        '--jumi-color-scheme-property': property('color-scheme'),
      }),
      values: colorScheme,
    },
    'animate-column-count': {
      property: value => ({
        '--jumi-column-count': value,
        '--jumi-column-count-property': property('column-count'),
      }),
      type: 'integer',
      values: empty.auto,
    },
    'animate-column-fill': {
      property: value => ({
        '--jumi-column-fill': value,
        '--jumi-column-fill-property': property('column-fill'),
      }),
      values: columnFill,
    },
    'animate-column-gap': {
      property: value => ({
        '--jumi-column-gap': value,
        '--jumi-gap-property': property('gap'),
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-column-rule': {
      property: value => ({
        '--jumi-column-rule': value,
        '--jumi-column-rule-property': property('column-rule'),
      }),
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-column-rule-color': {
      property: value => ({
        '--jumi-column-rule-color': value,
        '--jumi-column-rule-color-property': property('column-rule-color'),
      }),
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-column-rule-style': {
      property: value => ({
        '--jumi-column-rule-style': value,
        '--jumi-column-rule-style-property': property('column-rule-style'),
      }),
      values: columnRuleStyle,
    },
    'animate-column-rule-width': {
      property: value => ({
        '--jumi-column-rule-width': value,
        '--jumi-column-rule-width-property': property('column-rule-width'),
      }),
      type: ['line-width', 'length'],
      values: columnRuleWidth,
    },
    'animate-column-span': {
      property: value => ({
        '--jumi-column-span': value,
        '--jumi-column-span-property': property('column-span'),
      }),
      type: 'integer',
      values: columnSpan,
    },
    'animate-column-width': {
      property: value => ({
        '--jumi-column-width': value,
        '--jumi-column-width-property': property('column-width'),
      }),
      type: ['length', 'percentage'],
      values: columnWidth,
    },
    'animate-columns': {
      property: value => ({
        '--jumi-columns': value,
        '--jumi-columns-property': property('columns'),
      }),
      type: ['line-width', 'length', 'integer'],
      values: empty.auto,
    },
    'animate-contain': {
      property: value => ({
        '--jumi-contain': value,
        '--jumi-contain-property': property('contain'),
      }),
      values: contain,
    },
    'animate-contain-intrinsic-block-size': {
      property: value => ({
        '--jumi-contain-intrinsic-block-size': value,
        '--jumi-contain-intrinsic-block-size-property': property('contain-intrinsic-block-size'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-height': {
      property: value => ({
        '--jumi-contain-intrinsic-height': value,
        '--jumi-contain-intrinsic-height-property': property('contain-intrinsic-height'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-inline-size': {
      property: value => ({
        '--jumi-contain-intrinsic-inline-size': value,
        '--jumi-contain-intrinsic-inline-size-property': property('contain-intrinsic-inline-size'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-size': {
      property: value => ({
        '--jumi-contain-intrinsic-size': value,
        '--jumi-contain-intrinsic-size-property': property('contain-intrinsic-size'),
      }),
      type: 'length',
      values: empty.none,
    },
    'animate-contain-intrinsic-width': {
      property: value => ({
        '--jumi-contain-intrinsic-width': value,
        '--jumi-contain-intrinsic-width-property': property('contain-intrinsic-width'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-content': {
      property: value => ({
        '--jumi-content': value,
        '--jumi-content-property': property('content'),
      }),
      type: ['image', 'any'],
      values: content,
    },
    'animate-content-visibility': {
      property: value => ({
        '--jumi-content-visibility': value,
        '--jumi-content-visibility-property': property('content-visibility'),
      }),
      values: contentVisibility,
    },
    'animate-counter-increment': {
      property: value => ({
        '--jumi-counter-increment': value,
        '--jumi-counter-increment-property': property('counter-increment'),
      }),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-reset': {
      property: value => ({
        '--jumi-counter-reset': value,
        '--jumi-counter-reset-property': property('counter-reset'),
      }),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-set': {
      property: value => ({
        '--jumi-counter-set': value,
        '--jumi-counter-set-property': property('counter-set'),
      }),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-cursor': {
      property: value => ({
        '--jumi-cursor': value,
        '--jumi-cursor-property': property('cursor'),
      }),
      values: cursor,
    },
    'animate-cx': {
      property: value => ({
        '--jumi-cx': value,
        '--jumi-cx-property': property('cx'),
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-cy': {
      property: value => ({
        '--jumi-cy': value,
        '--jumi-cy-property': property('cy'),
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-d': {
      property: value => ({
        '--jumi-d': value,
        '--jumi-d-property': property('d'),
      }),
      values: empty.none,
    },
    'animate-display': {
      property: value => ({
        '--jumi-display': value,
        '--jumi-display-property': property('display'),
      }),
      values: display,
    },
    'animate-display-inside': {
      modifiers: displayOutside,
      property: (value, { modifier }) => ({
        '--jumi-display-inside': modifier ? join([modifier, value]) : value,
        '--jumi-display-property': property('display'),
      }),
      values: displayInside,
    },
    'animate-display-outside': {
      modifiers: displayInside,
      property: (value, { modifier }) => ({
        '--jumi-display-outside': modifier ? join([value, modifier]) : value,
        '--jumi-display-property': property('display'),
      }),
      values: displayOutside,
    },
    'animate-dominant-baseline': {
      property: value => ({
        '--jumi-dominant-baseline': value,
        '--jumi-dominant-baseline-property': property('dominant-baseline'),
      }),
      values: dominantBaseline,
    },
    'animate-empty-cells': {
      property: value => ({
        '--jumi-empty-cells': value,
        '--jumi-empty-cells-property': property('empty-cells'),
      }),
      values: emptyCells,
    },
    'animate-fill': {
      property: value => ({
        '--jumi-fill': value,
        '--jumi-fill-property': property('fill'),
      }),
      type: ['color', 'url', 'any'],
      values: theme('colors', fill),
    },
    'animate-fill-opacity': {
      property: value => ({
        '--jumi-fill-opacity': value,
        '--jumi-fill-opacity-property': property('fill-opacity'),
      }),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-fill-rule': {
      property: value => ({
        '--jumi-fill-rule': value,
        '--jumi-fill-rule-property': property('fill-rule'),
      }),
      values: fillRule,
    },
    'animate-filter': {
      property: value => ({
        '--jumi-filter': value,
        '--jumi-filter-property': property('filter'),
      }),
      values: empty.none,
    },
    'animate-filter-blur': {
      property: value => ({
        '--jumi-filter-blur': css('blur', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: 'length',
      values: theme('blur'),
    },
    'animate-filter-brightness': {
      property: value => ({
        '--jumi-filter-brightness': css('brightness', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('brightness'),
    },
    'animate-filter-contrast': {
      property: value => ({
        '--jumi-filter-contrast': css('contrast', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('contrast'),
    },
    'animate-filter-drop-shadow': {
      property: value => ({
        '--jumi-filter-drop-shadow': css('drop-shadow', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-filter-drop-shadow-blur': {
      property: value => ({
        '--jumi-filter-drop-shadow-blur': value,
        '--jumi-filter-property': property('filter'),
      }),
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-filter-drop-shadow-color': {
      property: value => ({
        '--jumi-filter-drop-shadow-color': value,
        '--jumi-filter-property': property('filter'),
      }),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-filter-drop-shadow-offset-x': {
      property: value => ({
        '--jumi-filter-drop-shadow-offset-x': value,
        '--jumi-filter-property': property('filter'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-drop-shadow-offset-y': {
      property: value => ({
        '--jumi-filter-drop-shadow-offset-y': value,
        '--jumi-filter-property': property('filter'),
      }),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-grayscale': {
      property: value => ({
        '--jumi-filter-grayscale': css('grayscale', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('grayscale'),
    },
    'animate-filter-hue-rotate': {
      property: value => ({
        '--jumi-filter-hue-rotate': 'hue-rotate(' + value + ')',
        '--jumi-filter-property': property('filter'),
      }),
      type: 'angle',
      values: theme('hueRotate'),
    },
    'animate-filter-invert': {
      property: value => ({
        '--jumi-filter-invert': css('invert', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('invert'),
    },
    'animate-filter-opacity': {
      property: value => ({
        '--jumi-filter-opacity': css('opacity', value),
        '--jumi-filter-property': property('filter'),
      }),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-filter-saturate': {
      property: value => ({
        '--jumi-filter-property': property('filter'),
        '--jumi-filter-saturate': css('saturate', value),
      }),
      type: ['number', 'percentage'],
      values: theme('saturate'),
    },
    'animate-filter-sepia': {
      property: value => ({
        '--jumi-filter-property': property('filter'),
        '--jumi-filter-sepia': css('sepia', value),
      }),
      type: ['number', 'percentage'],
      values: theme('sepia'),
    },
    'animate-filter-url': {
      property: value => ({
        '--jumi-filter-property': property('filter'),
        '--jumi-filter-url': css('url', value),
      }),
      type: 'url',
      values: empty.string,
    },
    'animate-flex': {
      property: value => ({
        '--jumi-flex': value,
        '--jumi-flex-property': property('flex'),
      }),
      values: theme('flex'),
    },
    'animate-flex-basis': {
      property: value => ({
        '--jumi-flex-basis': value,
        '--jumi-flex-basis-property': property('flex-basis'),
      }),
      values: theme('flexBasis'),
    },
    'animate-flex-direction': {
      property: value => ({
        '--jumi-flex-direction': value,
        '--jumi-flex-direction-property': property('flex-direction'),
      }),
      values: flexDirection,
    },
    'animate-flex-flow': {
      property: value => ({
        '--jumi-flex-flow': value,
        '--jumi-flex-flow-property': property('flex-flow'),
      }),
      values: empty.string,
    },
    'animate-flex-grow': {
      property: value => ({
        '--jumi-flex-grow': value,
        '--jumi-flex-grow-property': property('flex-grow'),
      }),
      values: theme('flexGrow'),
    },
    'animate-flex-shrink': {
      property: value => ({
        '--jumi-flex-shrink': value,
        '--jumi-flex-shrink-property': property('flex-shrink'),
      }),
      values: theme('flexShrink'),
    },
    'animate-flex-wrap': {
      property: value => ({
        '--jumi-flex-wrap': value,
        '--jumi-flex-wrap-property': property('flex-wrap'),
      }),
      values: flexWrap,
    },
    'animate-float': {
      property: value => ({
        '--jumi-float': value,
        '--jumi-float-property': property('float'),
      }),
      values: float,
    },
    'animate-flood-color': {
      property: value => ({
        '--jumi-flood-color': value,
        '--jumi-flood-color-property': property('flood-color'),
      }),
      type: 'color',
      values: theme('colors'),
    },
    'animate-flood-opacity': {
      property: value => ({
        '--jumi-flood-opacity': value,
        '--jumi-flood-opacity-property': property('flood-opacity'),
      }),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-font-family': {
      property: value => ({
        '--jumi-font-family': value,
        '--jumi-font-family-property': property('font-family'),
      }),
      type: ['generic-name', 'family-name'],
      values: fontFamily,
    },
    'animate-font-feature-settings': {
      property: value => ({
        '--jumi-font-feature-settings': value,
        '--jumi-font-feature-settings-property': property('font-feature-settings'),
      }),
      type: ['integer', 'any'],
      values: fontFeatureSettings,
    },
    'animate-font-kerning': {
      property: value => ({
        '--jumi-font-kerning': value,
        '--jumi-font-kerning-property': property('font-kerning'),
      }),
      values: fontKerning,
    },
    'animate-font-size': {
      property: value => ({
        '--jumi-font-size': value,
        '--jumi-font-size-property': property('font-size'),
      }),
      values: fontSize,
    },
    'animate-font-size-adjust': {
      modifiers: fontSizeAdjustMetric,
      property: (value, { modifier }) => ({
        '--jumi-font-size-adjust': modifier ? join([value, modifier]) : value,
        '--jumi-font-size-adjust-property': property('font-size-adjust'),
      }),
      type: ['number', 'any'],
      values: fontSizeAdjust,
    },
    'animate-font-style': {
      property: (value, { modifier }) => ({
        '--jumi-font-style': modifier ? join([value, modifier]) : value,
        '--jumi-font-style-property': property('font-style'),
      }),
      values: fontStyle,
    },
    'animate-font-synthesis': {
      property: value => ({
        '--jumi-font-synthesis': value,
        '--jumi-font-synthesis-property': property('font-synthesis'),
      }),
      values: empty.none,
    },
    'animate-font-synthesis-small-caps': {
      property: value => ({
        '--jumi-font-synthesis-small-caps': value,
        '--jumi-font-synthesis-small-caps-property': property('font-synthesis-small-caps'),
      }),
      values: fontSynthesisSmallCaps,
    },
    'animate-font-synthesis-style': {
      property: value => ({
        '--jumi-font-synthesis-style': value,
        '--jumi-font-synthesis-style-property': property('font-synthesis-style'),
      }),
      values: fontSynthesisStyle,
    },
    'animate-font-synthesis-weight': {
      property: value => ({
        '--jumi-font-synthesis-weight': value,
        '--jumi-font-synthesis-weight-property': property('font-synthesis-weight'),
      }),
      values: fontSynthesisWeight,
    },
    'animate-font-variant': {
      property: value => ({
        '--jumi-font-variant': value,
        '--jumi-font-variant-property': property('font-variant'),
      }),
      values: empty.string,
    },
    'animate-font-variant-alternates': {
      property: value => ({
        '--jumi-font-variant-alternates': value,
        '--jumi-font-variant-alternates-property': property('font-variant-alternates'),
      }),
      values: fontVariantAlternates,
    },
    'animate-font-variant-caps': {
      property: value => ({
        '--jumi-font-variant-caps': value,
        '--jumi-font-variant-caps-property': property('font-variant-caps'),
      }),
      values: fontVariantCaps,
    },
    'animate-font-variant-east-asian': {
      modifiers: fontVariantEastAsianWidth,
      property: (value, { modifier }) => ({
        '--jumi-font-variant-east-asian': modifier ? join([value, modifier]) : value,
        '--jumi-font-variant-east-asian-property': property('font-variant-east-asian'),
      }),
      values: fontVariantEastAsian,
    },
    'animate-font-variant-ligatures': {
      property: value => ({
        '--jumi-font-variant-ligatures': value,
        '--jumi-font-variant-ligatures-property': property('font-variant-ligatures'),
      }),
      values: fontVariantLigatures,
    },
    'animate-font-variant-numeric': {
      property: value => ({
        '--jumi-font-variant-numeric': value,
        '--jumi-font-variant-numeric-property': property('font-variant-numeric'),
      }),
      values: fontVariantNumeric,
    },
    'animate-font-variant-position': {
      property: value => ({
        '--jumi-font-variant-position': value,
        '--jumi-font-variant-position-property': property('font-variant-position'),
      }),
      values: fontVariantPosition,
    },
    'animate-font-variation-settings': {
      property: value => ({
        '--jumi-font-variation-settings': value,
        '--jumi-font-variation-settings-property': property('font-variation-settings'),
      }),
      type: ['number', 'any'],
      values: empty.string,
    },
    'animate-font-weight': {
      property: value => ({
        '--jumi-font-weight': value,
        '--jumi-font-weight-property': property('font-weight'),
      }),
      type: 'number',
      values: fontWeight,
    },
    'animate-forced-color-adjust': {
      property: value => ({
        '--jumi-forced-color-adjust': value,
        '--jumi-forced-color-adjust-property': property('forced-color-adjust'),
      }),
      values: forcedColorAdjust,
    },
    'animate-gap': {
      property: value => ({
        '--jumi-gap': value,
        '--jumi-gap-property': property('gap'),
      }),
      values: theme('gap'),
    },
    'animate-grid': {
      property: value => ({
        '--jumi-grid': value,
        '--jumi-grid-property': property('grid'),
      }),
      values: empty.string,
    },
    'animate-grid-auto-columns': {
      property: value => ({
        '--jumi-grid-auto-columns': value,
        '--jumi-grid-auto-columns-property': property('grid-auto-columns'),
      }),
      values: theme('gridAutoColumns'),
    },
    'animate-grid-auto-flow': {
      modifiers: gridAutoFlowPacking,
      property: (value, { modifier }) => ({
        '--jumi-grid-auto-flow': modifier ? join([value, modifier]) : value,
        '--jumi-grid-auto-flow-property': property('grid-auto-flow'),
      }),
      values: gridAutoFlow,
    },
    'animate-grid-auto-rows': {
      property: value => ({
        '--jumi-grid-auto-rows': value,
        '--jumi-grid-auto-rows-property': property('grid-auto-rows'),
      }),
      values: theme('gridAutoRows'),
    },
    'animate-grid-column': {
      property: value => ({
        '--jumi-grid-column': value,
        '--jumi-grid-column-property': property('grid-column'),
      }),
      values: theme('gridColumn'),
    },
    'animate-grid-column-end': {
      property: (value, { modifier }) => ({
        '--jumi-grid-column-end': modifier ? join([modifier, value]) : value,
        '--jumi-grid-column-end-property': property('grid-column-end'),
      }),
      values: theme('gridColumnEnd'),
    },
    'animate-grid-column-start': {
      property: (value, { modifier }) => ({
        '--jumi-grid-column-start': modifier ? join([modifier, value]) : value,
        '--jumi-grid-column-start-property': property('grid-column-start'),
      }),
      values: theme('gridColumnStart'),
    },
    'animate-grid-row': {
      property: value => ({
        '--jumi-grid-row': value,
        '--jumi-grid-row-property': property('grid-row'),
      }),
      values: theme('gridRow'),
    },
    'animate-grid-row-end': {
      modifiers: gridSize,
      property: (value, { modifier }) => ({
        '--jumi-grid-row-end': modifier ? join([modifier, value]) : value,
        '--jumi-grid-row-end-property': property('grid-row-end'),
      }),
      values: theme('gridRowEnd'),
    },
    'animate-grid-row-start': {
      modifiers: gridSize,
      property: (value, { modifier }) => ({
        '--jumi-grid-row-start': modifier ? join([modifier, value]) : value,
        '--jumi-grid-row-start-property': property('grid-row-start'),
      }),
      values: theme('gridRowStart'),
    },
    'animate-grid-template-areas': {
      property: value => ({
        '--jumi-grid-template-areas': value,
        '--jumi-grid-template-areas-property': property('grid-template-areas'),
      }),
      values: empty.none,
    },
    'animate-grid-template-columns': {
      property: value => ({
        '--jumi-grid-template-columns': value,
        '--jumi-grid-template-columns-property': property('grid-template-columns'),
      }),
      values: theme('gridTemplateColumns'),
    },
    'animate-grid-template-rows': {
      property: value => ({
        '--jumi-grid-template-rows': value,
        '--jumi-grid-template-rows-property': property('grid-template-rows'),
      }),
      values: theme('gridTemplateRows'),
    },
    'animate-hanging-punctuation': {
      property: value => ({
        '--jumi-hanging-punctuation': value,
        '--jumi-hanging-punctuation-property': property('hanging-punctuation'),
      }),
      values: hangingPunctuation,
    },
    'animate-height': {
      property: value => ({
        '--jumi-height': value,
        '--jumi-height-property': property('height'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('height'),
    },
    'animate-hyphenate-character': {
      property: value => ({
        '--jumi-hyphenate-character': value,
        '--jumi-hyphenate-character-property': property('hyphenate-character'),
      }),
      values: empty.auto,
    },
    'animate-hyphenate-limit-chars': {
      modifiers: hyphenateLimitCharsProperties,
      property: (value) => {
        const hyphenateLimitChars: Collection<string> = {
          '--jumi-hyphenate-limit-chars-property': property('hyphenate-limit-chars'),
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
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphens': {
      property: value => ({
        '--jumi-hyphens': value,
        '--jumi-hyphens-property': property('hyphens'),
      }),
      values: hyphens,
    },
    'animate-image-orientation': {
      property: value => ({
        '--jumi-image-orientation': value,
        '--jumi-image-orientation-property': property('image-orientation'),
      }),
      type: ['angle', 'any'],
      values: imageOrientation,
    },
    'animate-image-rendering': {
      property: value => ({
        '--jumi-image-rendering': value,
        '--jumi-image-rendering-property': property('image-rendering'),
      }),
      values: imageRendering,
    },
    'animate-initial-letter': {
      modifiers: initialLetterPosition,
      property: (value, { modifier }) => ({
        '--jumi-initial-letter': modifier ? join([value, modifier]) : value,
        '--jumi-initial-letter-property': property('initial-letter'),
      }),
      type: ['number', 'integer', 'any'],
      values: initialLetter,
    },
    'animate-inline-size': {
      property: value => ({
        '--jumi-inline-size': value,
        '--jumi-inline-size-property': property('inline-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: inlineSize,
    },
    'animate-inset': {
      property: value => ({
        '--jumi-inset': value,
        '--jumi-inset-property': property('inset'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block': {
      property: value => ({
        '--jumi-inset-block': value,
        '--jumi-inset-block-property': property('inset-block'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-end': {
      property: value => ({
        '--jumi-inset-block-end': value,
        '--jumi-inset-block-end-property': property('inset-block-end'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-start': {
      property: value => ({
        '--jumi-inset-block-start': value,
        '--jumi-inset-block-start-property': property('inset-block-start'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline': {
      property: value => ({
        '--jumi-inset-inline': value,
        '--jumi-inset-inline-property': property('inset-inline'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-end': {
      property: value => ({
        '--jumi-inset-inline-end': value,
        '--jumi-inset-inline-end-property': property('inset-inline-end'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-start': {
      property: value => ({
        '--jumi-inset-inline-start': value,
        '--jumi-inset-inline-start-property': property('inset-inline-start'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-justify-content': {
      property: value => ({
        '--jumi-justify-content': value,
        '--jumi-justify-content-property': property('justify-content'),
      }),
      values: justifyContent,
    },
    'animate-justify-items': {
      property: value => ({
        '--jumi-justify-items': value,
        '--jumi-justify-items-property': property('justify-items'),
      }),
      values: justifyItems,
    },
    'animate-justify-self': {
      property: value => ({
        '--jumi-justify-self': value,
        '--jumi-justify-self-property': property('justify-self'),
      }),
      values: justifySelf,
    },
    'animate-left': {
      property: value => ({
        '--jumi-left': value,
        '--jumi-left-property': property('left'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-letter-spacing': {
      property: value => ({
        '--jumi-letter-spacing': value,
        '--jumi-letter-spacing-property': property('letter-spacing'),
      }),
      type: ['length', 'percentage'],
      values: theme('letterSpacing'),
    },
    'animate-lighting-color': {
      property: value => ({
        '--jumi-lighting-color': value,
        '--jumi-lighting-color-property': property('lighting-color'),
      }),
      type: 'color',
      values: theme('colors'),
    },
    'animate-line-break': {
      property: value => ({
        '--jumi-line-break': value,
        '--jumi-line-break-property': property('line-break'),
      }),
      values: lineBreak,
    },
    'animate-line-clamp': {
      property: value => ({
        '--jumi-line-clamp': value,
        '--jumi-line-clamp-property': property('line-clamp'),
      }),
      type: ['number', 'any'],
      values: empty.none,
    },
    'animate-line-height': {
      property: value => ({
        '--jumi-line-height': value,
        '--jumi-line-height-property': property('line-height'),
      }),
      type: ['number', 'length', 'percentage'],
      values: theme('lineHeight'),
    },
    'animate-list-style': {
      property: value => ({
        '--jumi-list-style': value,
        '--jumi-list-style-property': property('list-style'),
      }),
      values: empty.none,
    },
    'animate-list-style-image': {
      property: value => ({
        '--jumi-list-style-image': value,
        '--jumi-list-style-image-property': property('list-style-image'),
      }),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-list-style-position': {
      property: value => ({
        '--jumi-list-style-position': value,
        '--jumi-list-style-position-property': property('list-style-position'),
      }),
      values: listStylePosition,
    },
    'animate-list-style-type': {
      property: value => ({
        '--jumi-list-style-type': value,
        '--jumi-list-style-type-property': property('list-style-type'),
      }),
      values: listStyleType,
    },
    'animate-margin': {
      property: value => ({
        '--jumi-margin': value,
        '--jumi-margin-property': property('margin'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-block': {
      property: value => ({
        '--jumi-margin-block': value,
        '--jumi-margin-block-property': property('margin-block'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-block-end': {
      property: value => ({
        '--jumi-margin-block-end': value,
        '--jumi-margin-block-end-property': property('margin-block-end'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-block-start': {
      property: value => ({
        '--jumi-margin-block-start': value,
        '--jumi-margin-block-start-property': property('margin-block-start'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-bottom': {
      property: value => ({
        '--jumi-margin-bottom': value,
        '--jumi-margin-bottom-property': property('margin-bottom'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-inline': {
      property: value => ({
        '--jumi-margin-inline': value,
        '--jumi-margin-inline-property': property('margin-inline'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-inline-end': {
      property: value => ({
        '--jumi-margin-inline-end': value,
        '--jumi-margin-inline-end-property': property('margin-inline-end'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-inline-start': {
      property: value => ({
        '--jumi-margin-inline-start': value,
        '--jumi-margin-inline-start-property': property('margin-inline-start'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-left': {
      property: value => ({
        '--jumi-margin-left': value,
        '--jumi-margin-left-property': property('margin-left'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-right': {
      property: value => ({
        '--jumi-margin-right': value,
        '--jumi-margin-right-property': property('margin-right'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-margin-top': {
      property: value => ({
        '--jumi-margin-top': value,
        '--jumi-margin-top-property': property('margin-top'),
      }),
      supportsNegativeValues: true,
      values: theme('margin'),
    },
    'animate-marker': {
      property: value => ({
        '--jumi-marker': value,
        '--jumi-marker-property': property('marker'),
      }),
      values: empty.none,
    },
    'animate-marker-end': {
      property: value => ({
        '--jumi-marker-end': value,
        '--jumi-marker-end-property': property('marker-end'),
      }),
      values: empty.none,
    },
    'animate-marker-mid': {
      property: value => ({
        '--jumi-marker-mid': value,
        '--jumi-marker-mid-property': property('marker-mid'),
      }),
      values: empty.none,
    },
    'animate-marker-start': {
      property: value => ({
        '--jumi-marker-start': value,
        '--jumi-marker-start-property': property('marker-start'),
      }),
      values: empty.none,
    },
    'animate-mask': {
      property: value => ({
        '--jumi-mask': value,
        '--jumi-mask-property': property('mask'),
      }),
      values: empty.none,
    },
    'animate-mask-border': {
      property: value => ({
        '--jumi-mask-border': value,
        '--jumi-mask-border-property': property('mask-border'),
      }),
      values: empty.none,
    },
    'animate-mask-border-mode': {
      property: value => ({
        '--jumi-mask-border-mode': value,
        '--jumi-mask-border-mode-property': property('mask-border-mode'),
      }),
      values: maskType,
    },
    'animate-mask-border-outset': {
      property: value => ({
        '--jumi-mask-border-outset': value,
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-bottom': {
      property: value => ({
        '--jumi-mask-border-outset-bottom': value,
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-left': {
      property: value => ({
        '--jumi-mask-border-outset-left': value,
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-right': {
      property: value => ({
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
        '--jumi-mask-border-outset-right': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-top': {
      property: value => ({
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
        '--jumi-mask-border-outset-top': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-x': {
      property: value => ({
        '--jumi-mask-border-outset-left': value,
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
        '--jumi-mask-border-outset-right': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-y': {
      property: value => ({
        '--jumi-mask-border-outset-bottom': value,
        '--jumi-mask-border-outset-property': property('mask-border-outset'),
        '--jumi-mask-border-outset-top': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-repeat': {
      property: value => ({
        '--jumi-mask-border-repeat': value,
        '--jumi-mask-border-repeat-property': property('mask-border-repeat'),
      }),
      values: maskBorderRepeat,
    },
    'animate-mask-border-slice': {
      property: value => ({
        '--jumi-mask-border-slice': value,
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-bottom': {
      property: value => ({
        '--jumi-mask-border-slice-bottom': value,
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-left': {
      property: value => ({
        '--jumi-mask-border-slice-left': value,
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-right': {
      property: value => ({
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
        '--jumi-mask-border-slice-right': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-top': {
      property: value => ({
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
        '--jumi-mask-border-slice-top': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-x': {
      property: value => ({
        '--jumi-mask-border-slice-left': value,
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
        '--jumi-mask-border-slice-right': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-y': {
      property: value => ({
        '--jumi-mask-border-slice-bottom': value,
        '--jumi-mask-border-slice-property': property('mask-border-slice'),
        '--jumi-mask-border-slice-top': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-source': {
      property: value => ({
        '--jumi-mask-border-source': value,
        '--jumi-mask-border-source-property': property('mask-border-source'),
      }),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-border-width': {
      property: value => ({
        '--jumi-mask-border-width': value,
        '--jumi-mask-border-width-property': property('mask-border-width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('borderWidth'),
    },
    'animate-mask-clip': {
      property: value => ({
        '--jumi-mask-clip': value,
        '--jumi-mask-clip-property': property('mask-clip'),
      }),
      values: maskClip,
    },
    'animate-mask-composite': {
      property: value => ({
        '--jumi-mask-composite': value,
        '--jumi-mask-composite-property': property('mask-composite'),
      }),
      values: maskComposite,
    },
    'animate-mask-image': {
      property: value => ({
        '--jumi-mask-image': value,
        '--jumi-mask-image-property': property('mask-image'),
      }),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-mode': {
      property: value => ({
        '--jumi-mask-mode': value,
        '--jumi-mask-mode-property': property('mask-mode'),
      }),
      values: maskMode,
    },
    'animate-mask-origin': {
      property: value => ({
        '--jumi-mask-origin': value,
        '--jumi-mask-origin-property': property('mask-origin'),
      }),
      values: maskOrigin,
    },
    'animate-mask-position': {
      property: value => ({
        '--jumi-mask-position': value,
        '--jumi-mask-position-property': property('mask-position'),
      }),
      type: ['length', 'percentage', 'position'],
    },
    'animate-mask-repeat': {
      property: value => ({
        '--jumi-mask-repeat': value,
        '--jumi-mask-repeat-property': property('mask-repeat'),
      }),
      values: backgroundRepeat,
    },
    'animate-mask-size': {
      property: value => ({
        '--jumi-mask-size': value,
        '--jumi-mask-size-property': property('mask-size'),
      }),
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-mask-type': {
      property: value => ({
        '--jumi-mask-type': value,
        '--jumi-mask-type-property': property('mask-type'),
      }),
      values: maskType,
    },
    'animate-math-depth': {
      property: value => ({
        '--jumi-math-depth': value,
        '--jumi-math-depth-property': property('math-depth'),
      }),
      supportsNegativeValues: true,
      type: 'integer',
      values: mathDepth,
    },
    'animate-math-depth-add': {
      property: value => ({
        '--jumi-math-depth': `add(${value})`,
        '--jumi-math-depth-property': property('math-depth'),
      }),
      supportsNegativeValues: true,
      type: 'integer',
      values: empty.number,
    },
    'animate-math-style': {
      property: value => ({
        '--jumi-math-style': value,
        '--jumi-math-style-property': property('math-style'),
      }),
      values: mathStyle,
    },
    'animate-max-block-size': {
      property: value => ({
        '--jumi-max-block-size': value,
        '--jumi-max-block-size-property': property('max-block-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-height': {
      property: value => ({
        '--jumi-max-height': value,
        '--jumi-max-height-property': property('max-height'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-inline-size': {
      property: value => ({
        '--jumi-max-inline-size': value,
        '--jumi-max-inline-size-property': property('max-inline-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-max-width': {
      property: value => ({
        '--jumi-max-width': value,
        '--jumi-max-width-property': property('max-width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-min-block-size': {
      property: value => ({
        '--jumi-min-block-size': value,
        '--jumi-min-block-size-property': property('min-block-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-height': {
      property: value => ({
        '--jumi-min-height': value,
        '--jumi-min-height-property': property('min-height'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-inline-size': {
      property: value => ({
        '--jumi-min-inline-size': value,
        '--jumi-min-inline-size-property': property('min-inline-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-min-width': {
      property: value => ({
        '--jumi-min-width': value,
        '--jumi-min-width-property': property('min-width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-mix-blend-mode': {
      property: value => ({
        '--jumi-mix-blend-mode': value,
        '--jumi-mix-blend-mode-property': property('mix-blend-mode'),
      }),
      values: mixBlendMode,
    },
    'animate-object-fit': {
      property: value => ({
        '--jumi-object-fit': value,
        '--jumi-object-fit-property': property('object-fit'),
      }),
      values: objectFit,
    },
    'animate-object-position': {
      property: value => ({
        '--jumi-object-position': value,
        '--jumi-object-position-property': property('object-position'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition'),
    },
    'animate-object-position-x': {
      property: value => ({
        '--jumi-object-position-property': property('object-position'),
        '--jumi-object-position-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-x-edge': {
      property: value => ({
        '--jumi-object-position-property': property('object-position'),
        '--jumi-object-position-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-x-offset': {
      property: value => ({
        '--jumi-object-position-property': property('object-position'),
        '--jumi-object-position-x-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-object-position-y': {
      property: value => ({
        '--jumi-object-position-property': property('object-position'),
        '--jumi-object-position-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-y-edge': {
      property: value => ({
        '--jumi-object-position-property': property('object-position'),
        '--jumi-object-position-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-y-offset': {
      property: value => ({
        '--jumi-object-position-property': property('object-position'),
        '--jumi-object-position-y-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset': {
      property: value => ({
        '--jumi-offset': value,
        '--jumi-offset-property': property('offset'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: offsetAnchor,
    },
    'animate-offset-anchor': {
      property: value => ({
        '--jumi-offset-anchor': value,
        '--jumi-offset-anchor-property': property('offset-anchor'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', empty.auto),
    },
    'animate-offset-anchor-x': {
      property: value => ({
        '--jumi-offset-anchor-property': property('offset-anchor'),
        '--jumi-offset-anchor-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-x-edge': {
      property: value => ({
        '--jumi-offset-anchor-property': property('offset-anchor'),
        '--jumi-offset-anchor-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-x-offset': {
      property: value => ({
        '--jumi-offset-anchor-property': property('offset-anchor'),
        '--jumi-offset-anchor-x-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-anchor-y': {
      property: value => ({
        '--jumi-offset-anchor-property': property('offset-anchor'),
        '--jumi-offset-anchor-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-y-edge': {
      property: value => ({
        '--jumi-offset-anchor-property': property('offset-anchor'),
        '--jumi-offset-anchor-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-y-offset': {
      property: value => ({
        '--jumi-offset-anchor-property': property('offset-anchor'),
        '--jumi-offset-anchor-y-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-distance': {
      property: value => ({
        '--jumi-offset-distance': value,
        '--jumi-offset-distance-property': property('offset-distance'),
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-path': {
      property: value => ({
        '--jumi-offset-path': value,
        '--jumi-offset-path-property': property('offset-path'),
      }),
      values: offsetPath,
    },
    'animate-offset-position': {
      property: value => ({
        '--jumi-offset-position': value,
        '--jumi-offset-position-property': property('offset-position'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', offsetPosition),
    },
    'animate-offset-position-x': {
      property: value => ({
        '--jumi-offset-position-property': property('offset-position'),
        '--jumi-offset-position-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-x-edge': {
      property: value => ({
        '--jumi-offset-position-property': property('offset-position'),
        '--jumi-offset-position-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-x-offset': {
      property: value => ({
        '--jumi-offset-position-property': property('offset-position'),
        '--jumi-offset-position-x-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-position-y': {
      property: value => ({
        '--jumi-offset-position-property': property('offset-position'),
        '--jumi-offset-position-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-y-edge': {
      property: value => ({
        '--jumi-offset-position-property': property('offset-position'),
        '--jumi-offset-position-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-y-offset': {
      property: value => ({
        '--jumi-offset-position-property': property('offset-position'),
        '--jumi-offset-position-y-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-rotate': {
      property: value => ({
        '--jumi-offset-rotate': value,
        '--jumi-offset-rotate-property': property('offset-rotate'),
      }),
      type: ['angle', 'any'],
      values: theme('rotate', offsetRotate),
    },
    'animate-opacity': {
      property: value => ({
        '--jumi-opacity': value,
        '--jumi-opacity-property': property('opacity'),
      }),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-order': {
      property: value => ({
        '--jumi-order': value,
        '--jumi-order-property': property('order'),
      }),
      supportsNegativeValues: true,
      type: 'integer',
      values: theme('order'),
    },
    'animate-orphans': {
      property: value => ({
        '--jumi-orphans': value,
        '--jumi-orphans-property': property('orphans'),
      }),
      type: 'integer',
      values: empty.number,
    },
    'animate-outline': {
      property: value => ({
        '--jumi-outline': value,
        '--jumi-outline-property': property('outline'),
      }),
      type: ['line-width', 'length', 'color', 'any'],
      values: empty.none,
    },
    'animate-outline-color': {
      property: value => ({
        '--jumi-outline-color': value,
        '--jumi-outline-property': property('outline'),
      }),
      type: 'color',
      values: theme('outlineColor'),
    },
    'animate-outline-offset': {
      property: value => ({
        '--jumi-outline-offset': value,
        '--jumi-outline-property': property('outline'),
      }),
      type: 'length',
      values: theme('outlineOffset'),
    },
    'animate-outline-style': {
      property: value => ({
        '--jumi-outline-property': property('outline'),
        '--jumi-outline-style': value,
      }),
      values: outlineStyle,
    },
    'animate-outline-width': {
      property: value => ({
        '--jumi-outline-property': property('outline'),
        '--jumi-outline-width': value,
      }),
      type: ['line-width'],
      values: theme('outlineWidth'),
    },
    'animate-overflow': {
      property: value => ({
        '--jumi-overflow': value,
        '--jumi-overflow-property': property('overflow'),
      }),
      values: overflow,
    },
    'animate-overflow-anchor': {
      property: value => ({
        '--jumi-overflow-anchor': value,
        '--jumi-overflow-anchor-property': property('overflow-anchor'),
      }),
      values: overflowAnchor,
    },
    'animate-overflow-block': {
      property: value => ({
        '--jumi-overflow-block': value,
        '--jumi-overflow-block-property': property('overflow-block'),
      }),
      values: overflow,
    },
    'animate-overflow-clip-margin': {
      property: value => ({
        '--jumi-overflow-clip-margin': value,
        '--jumi-overflow-clip-margin-property': property('overflow-clip-margin'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'any'],
      values: overflowClipMargin,
    },
    'animate-overflow-inline': {
      property: value => ({
        '--jumi-overflow-inline': value,
        '--jumi-overflow-inline-property': property('overflow-inline'),
      }),
      values: overflow,
    },
    'animate-overflow-wrap': {
      property: value => ({
        '--jumi-overflow-wrap': value,
        '--jumi-overflow-wrap-property': property('overflow-wrap'),
      }),
      values: overflowWrap,
    },
    'animate-overflow-x': {
      property: value => ({
        '--jumi-overflow-property': property('overflow'),
        '--jumi-overflow-x': value,
      }),
      values: overflow,
    },
    'animate-overflow-y': {
      property: value => ({
        '--jumi-overflow-property': property('overflow'),
        '--jumi-overflow-y': value,
      }),
      values: overflow,
    },
    'animate-overscroll-behavior': {
      property: value => ({
        '--jumi-overscroll-behavior': value,
        '--jumi-overscroll-behavior-property': property('overscroll-behavior'),
      }),
      values: empty.auto,
    },
    'animate-overscroll-behavior-block': {
      property: value => ({
        '--jumi-overscroll-behavior-block': value,
        '--jumi-overscroll-behavior-block-property': property('overscroll-behavior-block'),
      }),
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-inline': {
      property: value => ({
        '--jumi-overscroll-behavior-inline': value,
        '--jumi-overscroll-behavior-inline-property': property('overscroll-behavior-inline'),
      }),
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-x': {
      property: value => ({
        '--jumi-overscroll-behavior-x': value,
        '--jumi-overscroll-behavior-x-property': property('overscroll-behavior-x'),
      }),
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-y': {
      property: value => ({
        '--jumi-overscroll-behavior-y': value,
        '--jumi-overscroll-behavior-y-property': property('overscroll-behavior-y'),
      }),
      values: overscrollBehavior,
    },
    'animate-padding': {
      property: value => ({
        '--jumi-padding': value,
        '--jumi-padding-property': property('padding'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-block': {
      property: value => ({
        '--jumi-padding-block': value,
        '--jumi-padding-block-property': property('padding-block'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-block-end': {
      property: value => ({
        '--jumi-padding-block-end': value,
        '--jumi-padding-block-end-property': property('padding-block-end'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-block-start': {
      property: value => ({
        '--jumi-padding-block-start': value,
        '--jumi-padding-block-start-property': property('padding-block-start'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-bottom': {
      property: value => ({
        '--jumi-padding-bottom': value,
        '--jumi-padding-bottom-property': property('padding-bottom'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-inline': {
      property: value => ({
        '--jumi-padding-inline': value,
        '--jumi-padding-inline-property': property('padding-inline'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-inline-end': {
      property: value => ({
        '--jumi-padding-inline-end': value,
        '--jumi-padding-inline-end-property': property('padding-inline-end'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-inline-start': {
      property: value => ({
        '--jumi-padding-inline-start': value,
        '--jumi-padding-inline-start-property': property('padding-inline-start'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-left': {
      property: value => ({
        '--jumi-padding-left': value,
        '--jumi-padding-left-property': property('padding-left'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-right': {
      property: value => ({
        '--jumi-padding-right': value,
        '--jumi-padding-right-property': property('padding-right'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-padding-top': {
      property: value => ({
        '--jumi-padding-top': value,
        '--jumi-padding-top-property': property('padding-top'),
      }),
      supportsNegativeValues: true,
      values: theme('padding'),
    },
    'animate-page': {
      property: value => ({
        '--jumi-page': value,
        '--jumi-page-property': property('page'),
      }),
      values: empty.auto,
    },
    'animate-paint-order': {
      property: value => ({
        '--jumi-paint-order': value,
        '--jumi-paint-order-property': property('paint-order'),
      }),
      values: paintOrder,
    },
    'animate-position': {
      property: value => ({
        '--jumi-position': value,
        '--jumi-position-property': property('position'),
      }),
      values: position,
    },
    'animate-right': {
      property: value => ({
        '--jumi-right': value,
        '--jumi-right-property': property('right'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-rotate': {
      property: value => ({
        '--jumi-rotate': value,
        '--jumi-rotate-property': property('rotate'),
      }),
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('rotate'),
    },
    'animate-rotate-3d': {
      property: value => ({
        '--jumi-rotate-3d': css('rotate3d', value),
        '--jumi-transform-property': property('transform'),
      }),
      values: empty.string,
    },
    'animate-rotate-angle': {
      property: value => ({
        '--jumi-rotate-angle': value,
        '--jumi-rotate-property': property('rotate'),
      }),
      supportsNegativeValues: true,
      type: 'angle',
      values: theme('rotate'),
    },
    'animate-rotate-x': {
      property: value => ({
        '--jumi-rotate-property': property('rotate'),
        '--jumi-rotate-x': value,
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-y': {
      property: value => ({
        '--jumi-rotate-property': property('rotate'),
        '--jumi-rotate-y': value,
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-z': {
      property: value => ({
        '--jumi-rotate-property': property('rotate'),
        '--jumi-rotate-z': value,
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-row-gap': {
      property: value => ({
        '--jumi-gap-property': property('gap'),
        '--jumi-row-gap': value,
      }),
      values: empty.number,
    },
    'animate-scale': {
      property: (value) => {
        return {
          '--jumi-scale': value,
          '--jumi-scale-property': property('scale'),
        }
      },
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-x': {
      property: value => ({
        '--jumi-scale-property': property('scale'),
        '--jumi-scale-x': value,
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-y': {
      property: value => ({
        '--jumi-scale-property': property('scale'),
        '--jumi-scale-y': value,
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-z': {
      property: value => ({
        '--jumi-scale-property': property('scale'),
        '--jumi-scale-z': value,
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-skew': {
      property: (value) => {
        const [x, y] = value.split(/\s+/)
        return {
          '--jumi-skew-x': x ?? value,
          '--jumi-skew-y': y ?? x ?? value,
          '--jumi-transform-property': property('transform'),
        }
      },
      supportsNegativeValues: true,
      values: theme('skew'),
    },
    'animate-skew-x': {
      property: value => ({
        '--jumi-skew-x': value,
        '--jumi-transform-property': property('transform'),
      }),
      supportsNegativeValues: true,
      values: theme('skew'),
    },
    'animate-skew-y': {
      property: value => ({
        '--jumi-skew-y': value,
        '--jumi-transform-property': property('transform'),
      }),
      supportsNegativeValues: true,
      values: theme('skew'),
    },
    'animate-stroke': {
      property: value => ({
        '--jumi-stroke': value,
        '--jumi-stroke-property': property('stroke'),
      }),
      values: theme('colors'),
    },
    'animate-stroke-width': {
      property: value => ({
        '--jumi-stroke-width': value,
        '--jumi-stroke-width-property': property('stroke-width'),
      }),
      values: theme('strokeWidth'),
    },
    'animate-text-align': {
      property: value => ({
        '--jumi-text-align': value,
        '--jumi-text-align-property': property('text-align'),
      }),
      values: textAlign,
    },
    'animate-text-shadow': {
      property: value => ({
        '--jumi-text-shadow': value,
        '--jumi-text-shadow-property': property('text-shadow'),
      }),
      values: theme('dropShadow'),
    },
    'animate-text-shadow-blur': {
      property: value => ({
        '--jumi-text-shadow-blur-radius': value,
        '--jumi-text-shadow-property': property('text-shadow'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-text-shadow-color': {
      property: value => ({
        '--jumi-text-shadow-color': value,
        '--jumi-text-shadow-property': property('text-shadow'),
      }),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-text-shadow-offset-x': {
      property: value => ({
        '--jumi-text-shadow-offset-x': value,
        '--jumi-text-shadow-property': property('text-shadow'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-text-shadow-offset-y': {
      property: value => ({
        '--jumi-text-shadow-offset-y': value,
        '--jumi-text-shadow-property': property('text-shadow'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-top': {
      property: value => ({
        '--jumi-top': value,
        '--jumi-top-property': property('top'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-transform': {
      property: value => ({
        '--jumi-transform': value,
        '--jumi-transform-property': property('transform'),
      }),
      values: empty.string,
    },
    'animate-transform-origin': {
      property: value => ({
        '--jumi-transform-origin': value,
        '--jumi-transform-origin-property': property('transform-origin'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('transformOrigin'),
    },
    'animate-transform-origin-x': {
      property: value => ({
        '--jumi-transform-origin-property': property('transform-origin'),
        '--jumi-transform-origin-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: originX,
    },
    'animate-transform-origin-y': {
      property: value => ({
        '--jumi-transform-origin-property': property('transform-origin'),
        '--jumi-transform-origin-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: originY,
    },
    'animate-transform-origin-z': {
      property: value => ({
        '--jumi-transform-origin-property': property('transform-origin'),
        '--jumi-transform-origin-z': value,
      }),
      supportsNegativeValues: true,
      type: ['length'],
      values: empty.number,
    },
    'animate-transform-style': {
      property: value => ({
        '--jumi-transform-property': property('transform'),
        '--jumi-transform-style': value,
      }),
      values: transformStyle,
    },
    'animate-translate': {
      property: (value) => {
        return {
          '--jumi-translate': value,
          '--jumi-translate-property': property('translate'),
        }
      },
      supportsNegativeValues: true,
      values: theme('translate'),
    },
    'animate-translate-3d': {
      property: value => ({
        '--jumi-transform-property': property('transform'),
        '--jumi-translate-3d': css('translate3d', value),
      }),
      type: ['length', 'percentage', 'any'],
      values: empty.string,
    },
    'animate-translate-x': {
      property: value => ({
        '--jumi-translate-property': property('translate'),
        '--jumi-translate-x': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-y': {
      property: value => ({
        '--jumi-translate-property': property('translate'),
        '--jumi-translate-y': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-z': {
      property: value => ({
        '--jumi-translate-property': property('translate'),
        '--jumi-translate-z': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-visibility': {
      property: value => ({
        '--jumi-visibility': value,
        '--jumi-visibility-property': property('visibility'),
      }),
      values: visibility,
    },
    'animate-width': {
      property: value => ({
        '--jumi-width': value,
        '--jumi-width-property': property('width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('width'),
    },
    'animate-x': {
      property: value => ({
        '--jumi-transform-property': property('x'),
        '--jumi-x': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-y': {
      property: value => ({
        '--jumi-transform-property': property('y'),
        '--jumi-y': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-z-index': {
      property: value => ({
        '--jumi-z-index': value,
        '--jumi-z-index-property': property('z-index'),
      }),
      values: theme('zIndex'),
    },
    'animation-composition': {
      property: value => ({
        '--jumi-animation-composition': value,
      }),
      values: animationComposition,
    },
    'animation-delay': {
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-delay': value }
        return { [`--jumi-${modifier}-animation-delay`]: value }
      },
      values: theme('transitionDelay'),
    },
    'animation-direction': {
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-direction': value }
        return { [`--jumi-${modifier}-animation-direction`]: value }
      },
      values: animationDirection,
    },
    'animation-duration': {
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-duration': value }
        return { [`--jumi-${modifier}-animation-duration`]: value }
      },
      values: theme('transitionDuration'),
    },
    'animation-fill-mode': {
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-fill-mode': value }
        return { [`--jumi-${modifier}-animation-fill-mode`]: value }
      },
      values: animationFillMode,
    },
    'animation-iteration-count': {
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-iteration-count': value }
        return { [`--jumi-${modifier}-animation-iteration-count`]: value }
      },
      type: 'number',
      values: animationIterationCount,
    },
    'animation-name': {
      property: value => ({
        '--jumi-animation-name': value,
      }),
      values: empty.none,
    },
    'animation-play-state': {
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-play-state': value }
        return { [`--jumi-${modifier}-animation-play-state`]: value }
      },
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
    'animation-range-end-offset': {
      property: value => ({
        '--jumi-animation-range-end-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-end-timeline': {
      property: value => ({
        '--jumi-animation-range-end-timeline': value,
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
    'animation-range-start-offset': {
      property: value => ({
        '--jumi-animation-range-start-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-start-timeline': {
      property: value => ({
        '--jumi-animation-range-start-timeline': value,
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
      modifiers,
      property: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-timing-function': value }
        return { [`--jumi-${modifier}-animation-timing-function`]: value }
      },
      values: animationTimingFunction,
    },
    'jumi': {
      property: () => {
        const properties = creator.properties.map(keyframe('property'))
        const effects = creator.effects.map(keyframe('animation'))
        const variables = properties.concat(effects).join(', ')

        return ['animation'].concat(creator.properties).reduce(
          (acc, attribute) => merge(acc, assemble(attribute)),
          { animation: variables } as CssInJs,
        )
      },
      values: { DEFAULT: '' },
    },
  }

  return matchProperties
}

export function keyframe(type: 'animation' | 'property') {
  return (attribute: string) => {
    const variable = join(['--jumi', attribute, type], '-')
    return css('var', variable, 'none')
  }
}
