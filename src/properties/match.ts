import type { Api, Collection, MatchProperty, MatchPropertyValue, TailwindTheme } from '@/types'

import { create } from '@/helpers/create'
import { css } from '@/helpers/css'
import { merge } from '@/helpers/merge'
import { animationModifiers } from '@/keyframes/property'
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
import { effects } from '@/theme/effects'
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
import { outlineStyle } from '@/theme/outline-style'
import { overflow } from '@/theme/overflow'
import { overflowAnchor } from '@/theme/overflow-anchor'
import { overflowClipMargin } from '@/theme/overflow-clip-margin'
import { overflowWrap } from '@/theme/overflow-wrap'
import { overscrollBehavior } from '@/theme/overscroll-behavior'
import { paintOrder } from '@/theme/paint-order'
import { percentage } from '@/theme/percentage'
import { position } from '@/theme/position'
import { textAlign } from '@/theme/text-align'
import { textShadow } from '@/theme/text-shadow'
import { transformStyle } from '@/theme/transform-style'
import { visibility } from '@/theme/visibility'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getMatchProperties(api: Api): Collection<MatchPropertyValue> {
  function getValues<const Values extends Collection>(key: TailwindTheme, values?: Values) {
    return flattenColorPalette(merge(values, api.theme(key)))
  }

  const matchProperties: Partial<MatchProperty> = {
    'animate': {
      property: value => ({
        '--jumi-animation': create.effect(value),
      }),
      values: effects,
    },
    'animate-accent-color': {
      property: value => ({
        '--jumi-accent-color': value,
        '--jumi-accent-color-keyframes': create.animation('accent-color'),
      }),
      type: 'color',
      values: getValues('accentColor'),
    },
    'animate-align-content': {
      property: value => ({
        '--jumi-align-content': value,
        '--jumi-align-content-keyframes': create.animation('align-content'),
      }),
      values: alignContent,
    },
    'animate-align-items': {
      property: value => ({
        '--jumi-align-items': value,
        '--jumi-align-items-keyframes': create.animation('align-items'),
      }),
      values: alignItems,
    },
    'animate-align-self': {
      property: value => ({
        '--jumi-align-self': value,
        '--jumi-align-self-keyframes': create.animation('align-self'),
      }),
      values: alignSelf,
    },
    'animate-alignment-baseline': {
      property: value => ({
        '--jumi-alignment-baseline': value,
        '--jumi-alignment-baseline-keyframes': create.animation('alignment-baseline'),
      }),
      values: alignmentBaseline,
    },
    'animate-all': {
      property: value => ({
        '--jumi-all': value,
        '--jumi-all-keyframes': create.animation('all'),
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
        '--jumi-appearance-keyframes': create.animation('appearance'),
      }),
      values: appearance,
    },
    'animate-aspect-ratio': {
      property: value => ({
        '--jumi-aspect-ratio': value,
        '--jumi-aspect-ratio-keyframes': create.animation('aspect-ratio'),
      }),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-height': {
      property: value => ({
        '--jumi-aspect-ratio-height': value,
        '--jumi-aspect-ratio-keyframes': create.animation('aspect-ratio'),
      }),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-width': {
      property: value => ({
        '--jumi-aspect-ratio-keyframes': create.animation('aspect-ratio'),
        '--jumi-aspect-ratio-width': value,
      }),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-backdrop-blur': {
      property: value => ({
        '--jumi-backdrop-blur': css('blur', value),
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: 'length',
      values: getValues('backdropBlur'),
    },
    'animate-backdrop-brightness': {
      property: value => ({
        '--jumi-backdrop-brightness': css('brightness', value),
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropBrightness'),
    },
    'animate-backdrop-contrast': {
      property: value => ({
        '--jumi-backdrop-contrast': css('contrast', value),
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropContrast'),
    },
    'animate-backdrop-drop-shadow': {
      property: value => ({
        '--jumi-backdrop-drop-shadow': css('drop-shadow', value),
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: ['length', 'shadow', 'any'],
      values: empty.none,
    },
    'animate-backdrop-drop-shadow-blur': {
      property: value => ({
        '--jumi-backdrop-drop-shadow-blur': value,
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: ['length', 'percentage'],
      values: empty.length,
    },
    'animate-backdrop-drop-shadow-color': {
      property: value => ({
        '--jumi-backdrop-drop-shadow-color': value,
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: 'color',
      values: getValues('boxShadowColor'),
    },
    'animate-backdrop-drop-shadow-offset-x': {
      property: value => ({
        '--jumi-backdrop-drop-shadow-offset-x': value,
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-backdrop-drop-shadow-offset-y': {
      property: value => ({
        '--jumi-backdrop-drop-shadow-offset-y': value,
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-backdrop-filter': {
      property: value => ({
        '--jumi-backdrop-filter': value,
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
      }),
      values: empty.none,
    },
    'animate-backdrop-grayscale': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-grayscale': css('grayscale', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropGrayscale'),
    },
    'animate-backdrop-hue-rotate': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-hue-rotate': css('hue-rotate', value),
      }),
      type: 'angle',
      values: getValues('backdropHueRotate'),
    },
    'animate-backdrop-invert': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-invert': css('invert', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropInvert'),
    },
    'animate-backdrop-opacity': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-opacity': css('opacity', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropOpacity'),
    },
    'animate-backdrop-saturate': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-saturate': css('saturate', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropSaturate'),
    },
    'animate-backdrop-sepia': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-sepia': css('sepia', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('backdropSepia'),
    },
    'animate-backdrop-url': {
      property: value => ({
        '--jumi-backdrop-filter-keyframes': create.animation('backdrop-filter'),
        '--jumi-backdrop-url': css('url', value),
      }),
      type: 'url',
      values: empty.string,
    },
    'animate-backface-visibility': {
      property: value => ({
        '--jumi-backface-visibility': value,
        '--jumi-backface-visibility-keyframes': create.animation('backface-visibility'),
      }),
      values: backfaceVisibility,
    },
    'animate-background': {
      property: value => ({
        '--jumi-background': value,
        '--jumi-background-keyframes': create.animation('background'),
      }),
      type: ['color', 'image', 'position', 'url', 'any'],
      values: empty.none,
    },
    'animate-background-attachment': {
      property: value => ({
        '--jumi-background-attachment': value,
        '--jumi-background-attachment-keyframes': create.animation('background-attachment'),
      }),
      values: backgroundAttachment,
    },
    'animate-background-blend-mode': {
      property: value => ({
        '--jumi-background-blend-mode': value,
        '--jumi-background-blend-mode-keyframes': create.animation('background-blend-mode'),
      }),
      values: mixBlendMode,
    },
    'animate-background-clip': {
      property: value => ({
        '--jumi-background-clip': value,
        '--jumi-background-clip-keyframes': create.animation('background-clip'),
      }),
      values: backgroundClip,
    },
    'animate-background-color': {
      property: value => ({
        '--jumi-background-color': value,
        '--jumi-background-color-keyframes': create.animation('background-color'),
      }),
      type: 'color',
      values: getValues('backgroundColor'),
    },
    'animate-background-image': {
      property: value => ({
        '--jumi-background-image': value,
        '--jumi-background-image-keyframes': create.animation('background-image'),
      }),
      type: 'image',
      values: getValues('backgroundImage'),
    },
    'animate-background-origin': {
      property: value => ({
        '--jumi-background-origin': value,
        '--jumi-background-origin-keyframes': create.animation('background-origin'),
      }),
      values: backgroundOrigin,
    },
    'animate-background-position': {
      property: value => ({
        '--jumi-background-position': value,
        '--jumi-background-position-keyframes': create.animation('background-position'),
      }),
      type: ['position', 'percentage', 'length', 'any'],
      values: getValues('backgroundPosition'),
    },
    'animate-background-position-x': {
      property: value => ({
        '--jumi-background-position-keyframes': create.animation('background-position'),
        '--jumi-background-position-x': value,
      }),
      type: ['position', 'percentage', 'length', 'any'],
      values: empty.position,
    },
    'animate-background-position-x-edge': {
      property: value => ({
        '--jumi-background-position-keyframes': create.animation('background-position'),
        '--jumi-background-position-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-x-offset': {
      property: value => ({
        '--jumi-background-position-keyframes': create.animation('background-position'),
        '--jumi-background-position-x-offset': value,
      }),
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-position-y': {
      property: value => ({
        '--jumi-background-position-keyframes': create.animation('background-position'),
        '--jumi-background-position-y': value,
      }),
      type: ['position', 'percentage', 'length', 'any'],
      values: merge(objectPosition, percentage),
    },
    'animate-background-position-y-edge': {
      property: value => ({
        '--jumi-background-position-keyframes': create.animation('background-position'),
        '--jumi-background-position-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-y-offset': {
      property: value => ({
        '--jumi-background-position-keyframes': create.animation('background-position'),
        '--jumi-background-position-y-offset': value,
      }),
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-repeat': {
      property: value => ({
        '--jumi-background-repeat': value,
        '--jumi-background-repeat-keyframes': create.animation('background-repeat'),
      }),
      values: backgroundRepeat,
    },
    'animate-background-repeat-x': {
      property: value => ({
        '--jumi-background-repeat-keyframes': create.animation('background-repeat'),
        '--jumi-background-repeat-x': value,
      }),
      values: backgroundRepeatAxis,
    },
    'animate-background-repeat-y': {
      property: value => ({
        '--jumi-background-repeat-keyframes': create.animation('background-repeat'),
        '--jumi-background-repeat-y': value,
      }),
      values: backgroundRepeatAxis,
    },
    'animate-background-size': {
      property: value => ({
        '--jumi-background-size': value,
        '--jumi-background-size-keyframes': create.animation('background-size'),
      }),
      values: getValues('backgroundSize'),
    },
    'animate-background-size-height': {
      property: value => ({
        '--jumi-background-size-height': value,
        '--jumi-background-size-keyframes': create.animation('background-size'),
      }),
      type: ['length', 'percentage'],
      values: getValues('backgroundSize'),
    },
    'animate-background-size-width': {
      property: value => ({
        '--jumi-background-size-keyframes': create.animation('background-size'),
        '--jumi-background-size-width': value,
      }),
      type: ['length', 'percentage'],
      values: getValues('backgroundSize'),
    },
    'animate-block-size': {
      property: value => ({
        '--jumi-block-size': value,
        '--jumi-block-size-keyframes': create.animation('block-size'),
      }),
      type: ['length', 'percentage', 'any'],
      values: empty.auto,
    },
    'animate-border': {
      property: value => ({
        '--jumi-border': value,
        '--jumi-border-keyframes': create.animation('border'),
      }),
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-border-block': {
      property: value => ({
        '--jumi-border-block': value,
        '--jumi-border-block-keyframes': create.animation('border-block'),
      }),
      values: getValues('borderWidth'),
    },
    'animate-border-block-end-radius': {
      property: value => ({
        '--jumi-border-end-end-radius': value,
        '--jumi-border-end-start-radius': value,
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-block-end-width': {
      property: value => ({
        '--jumi-border-block-end-width': value,
        '--jumi-border-block-end-width-keyframes': create.animation('border-block-end-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-block-start-radius': {
      property: value => ({
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
        '--jumi-border-start-end-radius': value,
        '--jumi-border-start-start-radius': value,
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-block-start-width': {
      property: value => ({
        '--jumi-border-block-start-width': value,
        '--jumi-border-block-start-width-keyframes': create.animation('border-block-start-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-block-width': {
      property: value => ({
        '--jumi-border-block-end-width': value,
        '--jumi-border-block-start-width': value,
        '--jumi-border-block-width-keyframes': create.animation('border-block-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-bottom-left-radius': {
      property: value => ({
        '--jumi-border-bottom-left-radius': value,
        '--jumi-border-bottom-left-radius-keyframes': create.animation('border-bottom-left-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-bottom-radius': {
      property: value => ({
        '--jumi-border-bottom-left-radius': value,
        '--jumi-border-bottom-right-radius': value,
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-bottom-right-radius': {
      property: value => ({
        '--jumi-border-bottom-right-radius': value,
        '--jumi-border-bottom-right-radius-keyframes': create.animation('border-bottom-right-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-bottom-width': {
      property: value => ({
        '--jumi-border-bottom-width': value,
        '--jumi-border-bottom-width-keyframes': create.animation('border-bottom-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-collapse': {
      property: value => ({
        '--jumi-border-collapse': value,
        '--jumi-border-collapse-keyframes': create.animation('border-collapse'),
      }),
      values: borderCollapse,
    },
    'animate-border-color': {
      property: value => ({
        '--jumi-border-color': value,
        '--jumi-border-color-keyframes': create.animation('border-color'),
      }),
      type: 'color',
      values: getValues('borderColor'),
    },
    'animate-border-end-end-radius': {
      property: value => ({
        '--jumi-border-end-end-radius': value,
        '--jumi-border-end-end-radius-keyframes': create.animation('border-end-end-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-end-start-radius': {
      property: value => ({
        '--jumi-border-end-start-radius': value,
        '--jumi-border-end-start-radius-keyframes': create.animation('border-end-start-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-image': {
      property: value => ({
        '--jumi-border-image': value,
        '--jumi-border-image-keyframes': create.animation('border-image'),
      }),
      type: 'image',
      values: empty.none,
    },
    'animate-border-image-outset': {
      property: value => ({
        '--jumi-border-image-outset': value,
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-bottom': {
      property: value => ({
        '--jumi-border-image-outset-bottom': value,
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-left': {
      property: value => ({
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
        '--jumi-border-image-outset-left': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-right': {
      property: value => ({
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
        '--jumi-border-image-outset-right': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-top': {
      property: value => ({
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
        '--jumi-border-image-outset-top': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-x': {
      property: value => ({
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
        '--jumi-border-image-outset-left': value,
        '--jumi-border-image-outset-right': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-y': {
      property: value => ({
        '--jumi-border-image-outset-bottom': value,
        '--jumi-border-image-outset-keyframes': create.animation('border-image-outset'),
        '--jumi-border-image-outset-top': value,
      }),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-repeat': {
      property: value => ({
        '--jumi-border-image-repeat': value,
        '--jumi-border-image-repeat-keyframes': create.animation('border-image-repeat'),
      }),
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-x': {
      property: value => ({
        '--jumi-border-image-repeat-keyframes': create.animation('border-image-repeat'),
        '--jumi-border-image-repeat-x': value,
      }),
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-y': {
      property: value => ({
        '--jumi-border-image-repeat-keyframes': create.animation('border-image-repeat'),
        '--jumi-border-image-repeat-y': value,
      }),
      values: borderImageRepeat,
    },
    'animate-border-inline-end-radius': {
      property: value => ({
        '--jumi-border-end-end-radius': value,
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
        '--jumi-border-start-end-radius': value,
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-inline-end-width': {
      property: value => ({
        '--jumi-border-inline-end-width': value,
        '--jumi-border-inline-end-width-keyframes': create.animation('border-inline-end-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-inline-start-radius': {
      property: value => ({
        '--jumi-border-end-start-radius': value,
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
        '--jumi-border-start-start-radius': value,
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-inline-start-width': {
      property: value => ({
        '--jumi-border-inline-start-width': value,
        '--jumi-border-inline-start-width-keyframes': create.animation('border-inline-start-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-inline-width': {
      property: value => ({
        '--jumi-border-inline-end-width': value,
        '--jumi-border-inline-start-width': value,
        '--jumi-border-inline-width-keyframes': create.animation('border-inline-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-left-radius': {
      property: value => ({
        '--jumi-border-bottom-left-radius': value,
        '--jumi-border-keyframes': create.animation('border-radius'),
        '--jumi-border-top-left-radius': value,
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-left-width': {
      property: value => ({
        '--jumi-border-left-width': value,
        '--jumi-border-left-width-keyframes': create.animation('border-left-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-radius': {
      property: value => ({
        '--jumi-border-radius': value,
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-right-radius': {
      property: value => ({
        '--jumi-border-bottom-right-radius': value,
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
        '--jumi-border-top-right-radius': value,
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-right-width': {
      property: value => ({
        '--jumi-border-right-width': value,
        '--jumi-border-right-width-keyframes': create.animation('border-right-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-start-end-radius': {
      property: value => ({
        '--jumi-border-start-end-radius': value,
        '--jumi-border-start-end-radius-keyframes': create.animation('border-start-end-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-start-start-radius': {
      property: value => ({
        '--jumi-border-start-start-radius': value,
        '--jumi-border-start-start-radius-keyframes': create.animation('border-start-start-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-top-left-radius': {
      property: value => ({
        '--jumi-border-top-left-radius': value,
        '--jumi-border-top-left-radius-keyframes': create.animation('border-top-left-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-top-radius': {
      property: value => ({
        '--jumi-border-radius-keyframes': create.animation('border-radius'),
        '--jumi-border-top-left-radius': value,
        '--jumi-border-top-right-radius': value,
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-top-right-radius': {
      property: value => ({
        '--jumi-border-top-right-radius': value,
        '--jumi-border-top-right-radius-keyframes': create.animation('border-top-right-radius'),
      }),
      values: getValues('borderRadius'),
    },
    'animate-border-top-width': {
      property: value => ({
        '--jumi-border-top-width': value,
        '--jumi-border-top-width-keyframes': create.animation('border-top-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-border-width': {
      property: value => ({
        '--jumi-border-width': value,
        '--jumi-border-width-keyframes': create.animation('border-width'),
      }),
      type: ['line-width', 'length'],
      values: getValues('borderWidth'),
    },
    'animate-bottom': {
      property: value => ({
        '--jumi-bottom': value,
        '--jumi-bottom-keyframes': create.animation('bottom'),
      }),
      supportsNegativeValues: true,
      type: ['number', 'length', 'percentage'],
      values: getValues('inset', inset),
    },
    'animate-box-decoration-break': {
      property: value => ({
        '--jumi-box-decoration-break': value,
        '--jumi-box-decoration-break-keyframes': create.animation('box-decoration-break'),
      }),
      values: boxDecorationBreak,
    },
    'animate-box-shadow': {
      property: value => ({
        '--jumi-box-shadow': value,
        '--jumi-box-shadow-keyframes': create.animation('box-shadow'),
      }),
      type: ['length', 'shadow', 'any'],
      values: getValues('boxShadow'),
    },
    'animate-box-shadow-blur': {
      property: value => ({
        '--jumi-box-shadow-blur': value,
        '--jumi-box-shadow-keyframes': create.animation('box-shadow'),
      }),
      type: ['length', 'percentage'],
      values: getValues('blur'),
    },
    'animate-box-shadow-color': {
      property: value => ({
        '--jumi-box-shadow-color': value,
        '--jumi-box-shadow-keyframes': create.animation('box-shadow'),
      }),
      type: 'color',
      values: getValues('boxShadowColor'),
    },
    'animate-box-shadow-inset': {
      property: value => ({
        '--jumi-box-shadow-inset': value,
        '--jumi-box-shadow-inset-keyframes': create.animation('box-shadow-inset'),
      }),
      type: ['length', 'shadow', 'any'],
      values: getValues('boxShadow'),
    },
    'animate-box-shadow-inset-blur': {
      property: value => ({
        '--jumi-box-shadow-inset-blur': value,
        '--jumi-box-shadow-inset-keyframes': create.animation('box-shadow-inset'),
      }),
      type: ['length', 'percentage'],
      values: getValues('blur'),
    },
    'animate-box-shadow-inset-color': {
      property: value => ({
        '--jumi-box-shadow-inset-color': value,
        '--jumi-box-shadow-inset-keyframes': create.animation('box-shadow-inset'),
      }),
      type: 'color',
      values: getValues('boxShadowColor'),
    },
    'animate-box-shadow-inset-offset-x': {
      property: value => ({
        '--jumi-box-shadow-inset-keyframes': create.animation('box-shadow-inset'),
        '--jumi-box-shadow-inset-offset-x': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-shadow-inset-offset-y': {
      property: value => ({
        '--jumi-box-shadow-inset-keyframes': create.animation('box-shadow-inset'),
        '--jumi-box-shadow-inset-offset-y': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-shadow-inset-spread': {
      property: value => ({
        '--jumi-box-shadow-inset-keyframes': create.animation('box-shadow-inset'),
        '--jumi-box-shadow-inset-spread': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-shadow-offset-x': {
      property: value => ({
        '--jumi-box-shadow-keyframes': create.animation('box-shadow'),
        '--jumi-box-shadow-offset-x': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-shadow-offset-y': {
      property: value => ({
        '--jumi-box-shadow-keyframes': create.animation('box-shadow'),
        '--jumi-box-shadow-offset-y': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-shadow-spread': {
      property: value => ({
        '--jumi-box-shadow-keyframes': create.animation('box-shadow'),
        '--jumi-box-shadow-spread': value,
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-sizing': {
      property: value => ({
        '--jumi-box-sizing': value,
        '--jumi-box-sizing-keyframes': create.animation('box-sizing'),
      }),
      values: boxSizing,
    },
    'animate-break-after': {
      property: value => ({
        '--jumi-break-after': value,
        '--jumi-break-after-keyframes': create.animation('break-after'),
      }),
      values: breakAfter,
    },
    'animate-break-before': {
      property: value => ({
        '--jumi-break-before': value,
        '--jumi-break-before-keyframes': create.animation('break-before'),
      }),
      values: breakBefore,
    },
    'animate-break-inside': {
      property: value => ({
        '--jumi-break-inside': value,
        '--jumi-break-inside-keyframes': create.animation('break-inside'),
      }),
      values: breakInside,
    },
    'animate-caption-side': {
      property: value => ({
        '--jumi-caption-side': value,
        '--jumi-caption-side-keyframes': create.animation('caption-side'),
      }),
      values: captionSide,
    },
    'animate-caret-color': {
      property: value => ({
        '--jumi-caret-color': value,
        '--jumi-caret-color-keyframes': create.animation('caret-color'),
      }),
      type: 'color',
      values: getValues('caretColor'),
    },
    'animate-clear': {
      property: value => ({
        '--jumi-clear': value,
        '--jumi-clear-keyframes': create.animation('clear'),
      }),
      values: clear,
    },
    'animate-clip-path': {
      property: value => ({
        '--jumi-clip-path': value,
        '--jumi-clip-path-keyframes': create.animation('clip-path'),
      }),
      values: clipPath,
    },
    'animate-clip-rule': {
      property: value => ({
        '--jumi-clip-rule': value,
        '--jumi-clip-rule-keyframes': create.animation('clip-rule'),
      }),
      values: clipRule,
    },
    'animate-color': {
      property: value => ({
        '--jumi-color': value,
        '--jumi-color-keyframes': create.animation('color'),
      }),
      type: 'color',
      values: getValues('colors'),
    },
    'animate-color-interpolation': {
      property: value => ({
        '--jumi-color-interpolation': value,
        '--jumi-color-interpolation-keyframes': create.animation('color-interpolation'),
      }),
      values: colorInterpolation,
    },
    'animate-color-interpolation-filters': {
      property: value => ({
        '--jumi-color-interpolation-filters': value,
        '--jumi-color-interpolation-filters-keyframes': create.animation('color-interpolation-filters'),
      }),
      values: colorInterpolation,
    },
    'animate-color-scheme': {
      property: value => ({
        '--jumi-color-scheme': value,
        '--jumi-color-scheme-keyframes': create.animation('color-scheme'),
      }),
      values: colorScheme,
    },
    'animate-column-count': {
      property: value => ({
        '--jumi-column-count': value,
        '--jumi-column-count-keyframes': create.animation('column-count'),
      }),
      type: 'integer',
      values: empty.auto,
    },
    'animate-column-fill': {
      property: value => ({
        '--jumi-column-fill': value,
        '--jumi-column-fill-keyframes': create.animation('column-fill'),
      }),
      values: columnFill,
    },
    'animate-column-gap': {
      property: value => ({
        '--jumi-column-gap': value,
        '--jumi-gap-keyframes': create.animation('gap'),
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-column-rule': {
      property: value => ({
        '--jumi-column-rule': value,
        '--jumi-column-rule-keyframes': create.animation('column-rule'),
      }),
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-column-rule-color': {
      property: value => ({
        '--jumi-column-rule-color': value,
        '--jumi-column-rule-color-keyframes': create.animation('column-rule-color'),
      }),
      type: 'color',
      values: getValues('borderColor'),
    },
    'animate-column-rule-style': {
      property: value => ({
        '--jumi-column-rule-style': value,
        '--jumi-column-rule-style-keyframes': create.animation('column-rule-style'),
      }),
      values: columnRuleStyle,
    },
    'animate-column-rule-width': {
      property: value => ({
        '--jumi-column-rule-width': value,
        '--jumi-column-rule-width-keyframes': create.animation('column-rule-width'),
      }),
      type: ['line-width', 'length'],
      values: columnRuleWidth,
    },
    'animate-column-span': {
      property: value => ({
        '--jumi-column-span': value,
        '--jumi-column-span-keyframes': create.animation('column-span'),
      }),
      type: 'integer',
      values: columnSpan,
    },
    'animate-column-width': {
      property: value => ({
        '--jumi-column-width': value,
        '--jumi-column-width-keyframes': create.animation('column-width'),
      }),
      type: ['length', 'percentage'],
      values: columnWidth,
    },
    'animate-columns': {
      property: value => ({
        '--jumi-columns': value,
        '--jumi-columns-keyframes': create.animation('columns'),
      }),
      type: ['line-width', 'length', 'integer'],
      values: empty.auto,
    },
    'animate-contain': {
      property: value => ({
        '--jumi-contain': value,
        '--jumi-contain-keyframes': create.animation('contain'),
      }),
      values: contain,
    },
    'animate-contain-intrinsic-block-size': {
      property: value => ({
        '--jumi-contain-intrinsic-block-size': value,
        '--jumi-contain-intrinsic-block-size-keyframes': create.animation('contain-intrinsic-block-size'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-height': {
      property: value => ({
        '--jumi-contain-intrinsic-height': value,
        '--jumi-contain-intrinsic-height-keyframes': create.animation('contain-intrinsic-height'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-inline-size': {
      property: value => ({
        '--jumi-contain-intrinsic-inline-size': value,
        '--jumi-contain-intrinsic-inline-size-keyframes': create.animation('contain-intrinsic-inline-size'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-size': {
      property: value => ({
        '--jumi-contain-intrinsic-size': value,
        '--jumi-contain-intrinsic-size-keyframes': create.animation('contain-intrinsic-size'),
      }),
      type: 'length',
      values: empty.none,
    },
    'animate-contain-intrinsic-width': {
      property: value => ({
        '--jumi-contain-intrinsic-width': value,
        '--jumi-contain-intrinsic-width-keyframes': create.animation('contain-intrinsic-width'),
      }),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-content': {
      property: value => ({
        '--jumi-content': value,
        '--jumi-content-keyframes': create.animation('content'),
      }),
      type: ['image', 'any'],
      values: content,
    },
    'animate-content-visibility': {
      property: value => ({
        '--jumi-content-visibility': value,
        '--jumi-content-visibility-keyframes': create.animation('content-visibility'),
      }),
      values: contentVisibility,
    },
    'animate-counter-increment': {
      property: value => ({
        '--jumi-counter-increment': value,
        '--jumi-counter-increment-keyframes': create.animation('counter-increment'),
      }),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-reset': {
      property: value => ({
        '--jumi-counter-reset': value,
        '--jumi-counter-reset-keyframes': create.animation('counter-reset'),
      }),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-set': {
      property: value => ({
        '--jumi-counter-set': value,
        '--jumi-counter-set-keyframes': create.animation('counter-set'),
      }),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-cursor': {
      property: value => ({
        '--jumi-cursor': value,
        '--jumi-cursor-keyframes': create.animation('cursor'),
      }),
      values: cursor,
    },
    'animate-cx': {
      property: value => ({
        '--jumi-cx': value,
        '--jumi-cx-keyframes': create.animation('cx'),
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-cy': {
      property: value => ({
        '--jumi-cy': value,
        '--jumi-cy-keyframes': create.animation('cy'),
      }),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-d': {
      property: value => ({
        '--jumi-d': value,
        '--jumi-d-keyframes': create.animation('d'),
      }),
      values: empty.none,
    },
    'animate-display': {
      property: value => ({
        '--jumi-display': value,
        '--jumi-display-keyframes': create.animation('display'),
      }),
      values: display,
    },
    'animate-display-inside': {
      modifiers: displayOutside,
      property: (value, { modifier }) => ({
        '--jumi-display-inside': modifier === null ? value : `${modifier} ${value}`,
        '--jumi-display-keyframes': create.animation('display'),
      }),
      values: displayInside,
    },
    'animate-display-outside': {
      modifiers: displayInside,
      property: (value, { modifier }) => ({
        '--jumi-display-keyframes': create.animation('display'),
        '--jumi-display-outside': modifier === null ? value : `${value} ${modifier}`,
      }),
      values: displayOutside,
    },
    'animate-dominant-baseline': {
      property: value => ({
        '--jumi-dominant-baseline': value,
        '--jumi-dominant-baseline-keyframes': create.animation('dominant-baseline'),
      }),
      values: dominantBaseline,
    },
    'animate-empty-cells': {
      property: value => ({
        '--jumi-empty-cells': value,
        '--jumi-empty-cells-keyframes': create.animation('empty-cells'),
      }),
      values: emptyCells,
    },
    'animate-fill': {
      property: value => ({
        '--jumi-fill': value,
        '--jumi-fill-keyframes': create.animation('fill'),
      }),
      type: ['color', 'url', 'any'],
      values: getValues('colors', fill),
    },
    'animate-fill-opacity': {
      property: value => ({
        '--jumi-fill-opacity': value,
        '--jumi-fill-opacity-keyframes': create.animation('fill-opacity'),
      }),
      type: ['number', 'percentage'],
      values: getValues('opacity'),
    },
    'animate-fill-rule': {
      property: value => ({
        '--jumi-fill-rule': value,
        '--jumi-fill-rule-keyframes': create.animation('fill-rule'),
      }),
      values: fillRule,
    },
    'animate-filter': {
      property: value => ({
        '--jumi-filter': value,
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      values: empty.none,
    },
    'animate-filter-blur': {
      property: value => ({
        '--jumi-filter-blur': css('blur', value),
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: 'length',
      values: getValues('blur'),
    },
    'animate-filter-brightness': {
      property: value => ({
        '--jumi-filter-brightness': css('brightness', value),
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['number', 'percentage'],
      values: getValues('brightness'),
    },
    'animate-filter-contrast': {
      property: value => ({
        '--jumi-filter-contrast': css('contrast', value),
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['number', 'percentage'],
      values: getValues('contrast'),
    },
    'animate-filter-drop-shadow': {
      property: value => ({
        '--jumi-filter-drop-shadow': css('drop-shadow', value),
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['length', 'shadow', 'any'],
      values: empty.none,
    },
    'animate-filter-drop-shadow-blur': {
      property: value => ({
        '--jumi-filter-drop-shadow-blur': value,
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['length', 'percentage'],
      values: empty.length,
    },
    'animate-filter-drop-shadow-color': {
      property: value => ({
        '--jumi-filter-drop-shadow-color': value,
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: 'color',
      values: getValues('boxShadowColor'),
    },
    'animate-filter-drop-shadow-offset-x': {
      property: value => ({
        '--jumi-filter-drop-shadow-offset-x': value,
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-filter-drop-shadow-offset-y': {
      property: value => ({
        '--jumi-filter-drop-shadow-offset-y': value,
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-filter-grayscale': {
      property: value => ({
        '--jumi-filter-grayscale': css('grayscale', value),
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['number', 'percentage'],
      values: getValues('grayscale'),
    },
    'animate-filter-hue-rotate': {
      property: value => ({
        '--jumi-filter-hue-rotate': 'hue-rotate(' + value + ')',
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: 'angle',
      values: getValues('hueRotate'),
    },
    'animate-filter-invert': {
      property: value => ({
        '--jumi-filter-invert': css('invert', value),
        '--jumi-filter-keyframes': create.animation('filter'),
      }),
      type: ['number', 'percentage'],
      values: getValues('invert'),
    },
    'animate-filter-opacity': {
      property: value => ({
        '--jumi-filter-keyframes': create.animation('filter'),
        '--jumi-filter-opacity': css('opacity', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('opacity'),
    },
    'animate-filter-saturate': {
      property: value => ({
        '--jumi-filter-keyframes': create.animation('filter'),
        '--jumi-filter-saturate': css('saturate', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('saturate'),
    },
    'animate-filter-sepia': {
      property: value => ({
        '--jumi-filter-keyframes': create.animation('filter'),
        '--jumi-filter-sepia': css('sepia', value),
      }),
      type: ['number', 'percentage'],
      values: getValues('sepia'),
    },
    'animate-filter-url': {
      property: value => ({
        '--jumi-filter-keyframes': create.animation('filter'),
        '--jumi-filter-url': `url(${value})`,
      }),
      type: 'url',
      values: empty.string,
    },
    'animate-flex': {
      property: value => ({
        '--jumi-flex': value,
        '--jumi-flex-keyframes': create.animation('flex'),
      }),
      values: getValues('flex'),
    },
    'animate-flex-basis': {
      property: value => ({
        '--jumi-flex-basis': value,
        '--jumi-flex-basis-keyframes': create.animation('flex-basis'),
      }),
      values: getValues('flexBasis'),
    },
    'animate-flex-direction': {
      property: value => ({
        '--jumi-flex-direction': value,
        '--jumi-flex-direction-keyframes': create.animation('flex-direction'),
      }),
      values: flexDirection,
    },
    'animate-flex-flow': {
      property: value => ({
        '--jumi-flex-flow': value,
        '--jumi-flex-flow-keyframes': create.animation('flex-flow'),
      }),
      values: empty.string,
    },
    'animate-flex-grow': {
      property: value => ({
        '--jumi-flex-grow': value,
        '--jumi-flex-grow-keyframes': create.animation('flex-grow'),
      }),
      values: getValues('flexGrow'),
    },
    'animate-flex-shrink': {
      property: value => ({
        '--jumi-flex-shrink': value,
        '--jumi-flex-shrink-keyframes': create.animation('flex-shrink'),
      }),
      values: getValues('flexShrink'),
    },
    'animate-flex-wrap': {
      property: value => ({
        '--jumi-flex-wrap': value,
        '--jumi-flex-wrap-keyframes': create.animation('flex-wrap'),
      }),
      values: flexWrap,
    },
    'animate-float': {
      property: value => ({
        '--jumi-float': value,
        '--jumi-float-keyframes': create.animation('float'),
      }),
      values: float,
    },
    'animate-flood-color': {
      property: value => ({
        '--jumi-flood-color': value,
        '--jumi-flood-color-keyframes': create.animation('flood-color'),
      }),
      type: 'color',
      values: getValues('colors'),
    },
    'animate-flood-opacity': {
      property: value => ({
        '--jumi-flood-opacity': value,
        '--jumi-flood-opacity-keyframes': create.animation('flood-opacity'),
      }),
      type: ['number', 'percentage'],
      values: getValues('opacity'),
    },
    'animate-font-family': {
      property: value => ({
        '--jumi-font-family': value,
        '--jumi-font-family-keyframes': create.animation('font-family'),
      }),
      type: ['generic-name', 'family-name'],
      values: fontFamily,
    },
    'animate-font-feature-settings': {
      property: value => ({
        '--jumi-font-feature-settings': value,
        '--jumi-font-feature-settings-keyframes': create.animation('font-feature-settings'),
      }),
      type: ['integer', 'any'],
      values: fontFeatureSettings,
    },
    'animate-font-kerning': {
      property: value => ({
        '--jumi-font-kerning': value,
        '--jumi-font-kerning-keyframes': create.animation('font-kerning'),
      }),
      values: fontKerning,
    },
    'animate-font-size': {
      property: value => ({
        '--jumi-font-size': value,
        '--jumi-font-size-keyframes': create.animation('font-size'),
      }),
      values: fontSize,
    },
    'animate-font-size-adjust': {
      modifiers: fontSizeAdjustMetric,
      property: (value, { modifier }) => ({
        '--jumi-font-size-adjust': modifier === null ? value : `${value} ${modifier}`,
        '--jumi-font-size-adjust-keyframes': create.animation('font-size-adjust'),
      }),
      type: ['number', 'any'],
      values: fontSizeAdjust,
    },
    'animate-font-style': {
      property: (value, { modifier }) => ({
        '--jumi-font-style': modifier === null ? value : `${value} ${modifier}`,
        '--jumi-font-style-keyframes': create.animation('font-style'),
      }),
      values: fontStyle,
    },
    'animate-font-synthesis': {
      property: value => ({
        '--jumi-font-synthesis': value,
        '--jumi-font-synthesis-keyframes': create.animation('font-synthesis'),
      }),
      values: empty.none,
    },
    'animate-font-synthesis-position': {
      property: value => ({
        '--jumi-font-synthesis-position': value,
        '--jumi-font-synthesis-position-keyframes': create.animation('font-synthesis-position'),
      }),
      values: fontSynthesisPosition,
    },
    'animate-font-synthesis-small-caps': {
      property: value => ({
        '--jumi-font-synthesis-small-caps': value,
        '--jumi-font-synthesis-small-caps-keyframes': create.animation('font-synthesis-small-caps'),
      }),
      values: fontSynthesisSmallCaps,
    },
    'animate-font-synthesis-style': {
      property: value => ({
        '--jumi-font-synthesis-style': value,
        '--jumi-font-synthesis-style-keyframes': create.animation('font-synthesis-style'),
      }),
      values: fontSynthesisStyle,
    },
    'animate-font-synthesis-weight': {
      property: value => ({
        '--jumi-font-synthesis-weight': value,
        '--jumi-font-synthesis-weight-keyframes': create.animation('font-synthesis-weight'),
      }),
      values: fontSynthesisWeight,
    },
    'animate-font-variant': {
      property: value => ({
        '--jumi-font-variant': value,
        '--jumi-font-variant-keyframes': create.animation('font-variant'),
      }),
      values: empty.string,
    },
    'animate-font-variant-alternates': {
      property: value => ({
        '--jumi-font-variant-alternates': value,
        '--jumi-font-variant-alternates-keyframes': create.animation('font-variant-alternates'),
      }),
      values: fontVariantAlternates,
    },
    'animate-font-variant-caps': {
      property: value => ({
        '--jumi-font-variant-caps': value,
        '--jumi-font-variant-caps-keyframes': create.animation('font-variant-caps'),
      }),
      values: fontVariantCaps,
    },
    'animate-font-variant-east-asian': {
      modifiers: fontVariantEastAsianWidth,
      property: (value, { modifier }) => ({
        '--jumi-font-variant-east-asian': modifier === null ? value : `${value} ${modifier}`,
        '--jumi-font-variant-east-asian-keyframes': create.animation('font-variant-east-asian'),
      }),
      values: fontVariantEastAsian,
    },
    'animate-font-variant-ligatures': {
      property: value => ({
        '--jumi-font-variant-ligatures': value,
        '--jumi-font-variant-ligatures-keyframes': create.animation('font-variant-ligatures'),
      }),
      values: fontVariantLigatures,
    },
    'animate-font-variant-numeric': {
      property: value => ({
        '--jumi-font-variant-numeric': value,
        '--jumi-font-variant-numeric-keyframes': create.animation('font-variant-numeric'),
      }),
      values: fontVariantNumeric,
    },
    'animate-font-variant-position': {
      property: value => ({
        '--jumi-font-variant-position': value,
        '--jumi-font-variant-position-keyframes': create.animation('font-variant-position'),
      }),
      values: fontVariantPosition,
    },
    'animate-font-variation-settings': {
      property: value => ({
        '--jumi-font-variation-settings': value,
        '--jumi-font-variation-settings-keyframes': create.animation('font-variation-settings'),
      }),
      type: ['number', 'any'],
      values: empty.string,
    },
    'animate-font-weight': {
      property: value => ({
        '--jumi-font-weight': value,
        '--jumi-font-weight-keyframes': create.animation('font-weight'),
      }),
      type: 'number',
      values: fontWeight,
    },
    'animate-forced-color-adjust': {
      property: value => ({
        '--jumi-forced-color-adjust': value,
        '--jumi-forced-color-adjust-keyframes': create.animation('forced-color-adjust'),
      }),
      values: forcedColorAdjust,
    },
    'animate-gap': {
      property: value => ({
        '--jumi-gap': value,
        '--jumi-gap-keyframes': create.animation('gap'),
      }),
      values: getValues('gap'),
    },
    'animate-grid': {
      property: value => ({
        '--jumi-grid': value,
        '--jumi-grid-keyframes': create.animation('grid'),
      }),
      values: empty.string,
    },
    'animate-grid-auto-columns': {
      property: value => ({
        '--jumi-grid-auto-columns': value,
        '--jumi-grid-auto-columns-keyframes': create.animation('grid-auto-columns'),
      }),
      values: getValues('gridAutoColumns'),
    },
    'animate-grid-auto-flow': {
      modifiers: gridAutoFlowPacking,
      property: (value, { modifier }) => ({
        '--jumi-grid-auto-flow': modifier === null ? value : `${value} ${modifier}`,
        '--jumi-grid-auto-flow-keyframes': create.animation('grid-auto-flow'),
      }),
      values: gridAutoFlow,
    },
    'animate-grid-auto-rows': {
      property: value => ({
        '--jumi-grid-auto-rows': value,
        '--jumi-grid-auto-rows-keyframes': create.animation('grid-auto-rows'),
      }),
      values: getValues('gridAutoRows'),
    },
    'animate-grid-column': {
      property: value => ({
        '--jumi-grid-column': value,
        '--jumi-grid-column-keyframes': create.animation('grid-column'),
      }),
      values: getValues('gridColumn'),
    },
    'animate-grid-column-end': {
      property: (value, { modifier }) => ({
        '--jumi-grid-column-end': modifier === null ? value : `${modifier} value`,
        '--jumi-grid-column-end-keyframes': create.animation('grid-column-end'),
      }),
      values: getValues('gridColumnEnd'),
    },
    'animate-grid-column-start': {
      property: (value, { modifier }) => ({
        '--jumi-grid-column-start': modifier === null ? value : `${modifier} value`,
        '--jumi-grid-column-start-keyframes': create.animation('grid-column-start'),
      }),
      values: getValues('gridColumnStart'),
    },
    'animate-grid-row': {
      property: value => ({
        '--jumi-grid-row': value,
        '--jumi-grid-row-keyframes': create.animation('grid-row'),
      }),
      values: getValues('gridRow'),
    },
    'animate-grid-row-end': {
      modifiers: gridSize,
      property: (value, { modifier }) => ({
        '--jumi-grid-row-end': modifier === null ? value : `${modifier} value`,
        '--jumi-grid-row-end-keyframes': create.animation('grid-row-end'),
      }),
      values: getValues('gridRowEnd'),
    },
    'animate-grid-row-start': {
      modifiers: gridSize,
      property: (value, { modifier }) => ({
        '--jumi-grid-row-start': modifier === null ? value : `${modifier} value`,
        '--jumi-grid-row-start-keyframes': create.animation('grid-row-start'),
      }),
      values: getValues('gridRowStart'),
    },
    'animate-grid-template-areas': {
      property: value => ({
        '--jumi-grid-template-areas': value,
        '--jumi-grid-template-areas-keyframes': create.animation('grid-template-areas'),
      }),
      values: empty.none,
    },
    'animate-grid-template-columns': {
      property: value => ({
        '--jumi-grid-template-columns': value,
        '--jumi-grid-template-columns-keyframes': create.animation('grid-template-columns'),
      }),
      values: getValues('gridTemplateColumns'),
    },
    'animate-grid-template-rows': {
      property: value => ({
        '--jumi-grid-template-rows': value,
        '--jumi-grid-template-rows-keyframes': create.animation('grid-template-rows'),
      }),
      values: getValues('gridTemplateRows'),
    },
    'animate-hanging-punctuation': {
      property: value => ({
        '--jumi-hanging-punctuation': value,
        '--jumi-hanging-punctuation-keyframes': create.animation('hanging-punctuation'),
      }),
      values: hangingPunctuation,
    },
    'animate-height': {
      property: value => ({
        '--jumi-height': value,
        '--jumi-height-keyframes': create.animation('height'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: getValues('height'),
    },
    'animate-hyphenate-character': {
      property: value => ({
        '--jumi-hyphenate-character': value,
        '--jumi-hyphenate-character-keyframes': create.animation('hyphenate-character'),
      }),
      values: empty.auto,
    },
    'animate-hyphenate-limit-chars': {
      modifiers: hyphenateLimitCharsProperties,
      property: (value) => {
        const hyphenateLimitChars: Collection<string> = {
          '--jumi-hyphenate-limit-chars-keyframes': create.animation('hyphenate-limit-chars'),
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
        '--jumi-hyphens-keyframes': create.animation('hyphens'),
      }),
      values: hyphens,
    },
    'animate-image-orientation': {
      property: value => ({
        '--jumi-image-orientation': value,
        '--jumi-image-orientation-keyframes': create.animation('image-orientation'),
      }),
      type: ['angle', 'any'],
      values: imageOrientation,
    },
    'animate-image-rendering': {
      property: value => ({
        '--jumi-image-rendering': value,
        '--jumi-image-rendering-keyframes': create.animation('image-rendering'),
      }),
      values: imageRendering,
    },
    'animate-initial-letter': {
      modifiers: initialLetterPosition,
      property: (value, { modifier }) => ({
        '--jumi-initial-letter': modifier === null ? value : `${value} ${modifier}`,
        '--jumi-initial-letter-keyframes': create.animation('initial-letter'),
      }),
      type: ['number', 'integer', 'any'],
      values: initialLetter,
    },
    'animate-inline-size': {
      property: value => ({
        '--jumi-inline-size': value,
        '--jumi-inline-size-keyframes': create.animation('inline-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: inlineSize,
    },
    'animate-inset': {
      property: value => ({
        '--jumi-inset': value,
        '--jumi-inset-keyframes': create.animation('inset'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-inset-block': {
      property: value => ({
        '--jumi-inset-block': value,
        '--jumi-inset-block-keyframes': create.animation('inset-block'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-inset-block-end': {
      property: value => ({
        '--jumi-inset-block-end': value,
        '--jumi-inset-block-end-keyframes': create.animation('inset-block-end'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-inset-block-start': {
      property: value => ({
        '--jumi-inset-block-start': value,
        '--jumi-inset-block-start-keyframes': create.animation('inset-block-start'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-inset-inline': {
      property: value => ({
        '--jumi-inset-inline': value,
        '--jumi-inset-inline-keyframes': create.animation('inset-inline'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-inset-inline-end': {
      property: value => ({
        '--jumi-inset-inline-end': value,
        '--jumi-inset-inline-end-keyframes': create.animation('inset-inline-end'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-inset-inline-start': {
      property: value => ({
        '--jumi-inset-inline-start': value,
        '--jumi-inset-inline-start-keyframes': create.animation('inset-inline-start'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-justify-content': {
      property: value => ({
        '--jumi-justify-content': value,
        '--jumi-justify-content-keyframes': create.animation('justify-content'),
      }),
      values: justifyContent,
    },
    'animate-justify-items': {
      property: value => ({
        '--jumi-justify-items': value,
        '--jumi-justify-items-keyframes': create.animation('justify-items'),
      }),
      values: justifyItems,
    },
    'animate-justify-self': {
      property: value => ({
        '--jumi-justify-self': value,
        '--jumi-justify-self-keyframes': create.animation('justify-self'),
      }),
      values: justifySelf,
    },
    'animate-left': {
      property: value => ({
        '--jumi-left': value,
        '--jumi-left-keyframes': create.animation('left'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-letter-spacing': {
      property: value => ({
        '--jumi-letter-spacing': value,
        '--jumi-letter-spacing-keyframes': create.animation('letter-spacing'),
      }),
      type: ['length', 'percentage'],
      values: getValues('letterSpacing'),
    },
    'animate-lighting-color': {
      property: value => ({
        '--jumi-lighting-color': value,
        '--jumi-lighting-color-keyframes': create.animation('lighting-color'),
      }),
      type: 'color',
      values: getValues('colors'),
    },
    'animate-line-break': {
      property: value => ({
        '--jumi-line-break': value,
        '--jumi-line-break-keyframes': create.animation('line-break'),
      }),
      values: lineBreak,
    },
    'animate-line-clamp': {
      property: value => ({
        '--jumi-line-clamp': value,
        '--jumi-line-clamp-keyframes': create.animation('line-clamp'),
      }),
      type: ['number', 'any'],
      values: empty.none,
    },
    'animate-line-height': {
      property: value => ({
        '--jumi-line-height': value,
        '--jumi-line-height-keyframes': create.animation('line-height'),
      }),
      type: ['number', 'length', 'percentage'],
      values: getValues('lineHeight'),
    },
    'animate-list-style': {
      property: value => ({
        '--jumi-list-style': value,
        '--jumi-list-style-keyframes': create.animation('list-style'),
      }),
      values: empty.none,
    },
    'animate-list-style-image': {
      property: value => ({
        '--jumi-list-style-image': value,
        '--jumi-list-style-image-keyframes': create.animation('list-style-image'),
      }),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-list-style-position': {
      property: value => ({
        '--jumi-list-style-position': value,
        '--jumi-list-style-position-keyframes': create.animation('list-style-position'),
      }),
      values: listStylePosition,
    },
    'animate-list-style-type': {
      property: value => ({
        '--jumi-list-style-type': value,
        '--jumi-list-style-type-keyframes': create.animation('list-style-type'),
      }),
      values: listStyleType,
    },
    'animate-margin': {
      property: value => ({
        '--jumi-margin': value,
        '--jumi-margin-keyframes': create.animation('margin'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-block': {
      property: value => ({
        '--jumi-margin-block': value,
        '--jumi-margin-block-keyframes': create.animation('margin-block'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-block-end': {
      property: value => ({
        '--jumi-margin-block-end': value,
        '--jumi-margin-block-end-keyframes': create.animation('margin-block-end'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-block-start': {
      property: value => ({
        '--jumi-margin-block-start': value,
        '--jumi-margin-block-start-keyframes': create.animation('margin-block-start'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-bottom': {
      property: value => ({
        '--jumi-margin-bottom': value,
        '--jumi-margin-bottom-keyframes': create.animation('margin-bottom'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-inline': {
      property: value => ({
        '--jumi-margin-inline': value,
        '--jumi-margin-inline-keyframes': create.animation('margin-inline'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-inline-end': {
      property: value => ({
        '--jumi-margin-inline-end': value,
        '--jumi-margin-inline-end-keyframes': create.animation('margin-inline-end'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-inline-start': {
      property: value => ({
        '--jumi-margin-inline-start': value,
        '--jumi-margin-inline-start-keyframes': create.animation('margin-inline-start'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-left': {
      property: value => ({
        '--jumi-margin-left': value,
        '--jumi-margin-left-keyframes': create.animation('margin-left'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-right': {
      property: value => ({
        '--jumi-margin-right': value,
        '--jumi-margin-right-keyframes': create.animation('margin-right'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-margin-top': {
      property: value => ({
        '--jumi-margin-top': value,
        '--jumi-margin-top-keyframes': create.animation('margin-top'),
      }),
      supportsNegativeValues: true,
      values: getValues('margin'),
    },
    'animate-marker': {
      property: value => ({
        '--jumi-marker': value,
        '--jumi-marker-keyframes': create.animation('marker'),
      }),
      values: empty.none,
    },
    'animate-marker-end': {
      property: value => ({
        '--jumi-marker-end': value,
        '--jumi-marker-end-keyframes': create.animation('marker-end'),
      }),
      values: empty.none,
    },
    'animate-marker-mid': {
      property: value => ({
        '--jumi-marker-mid': value,
        '--jumi-marker-mid-keyframes': create.animation('marker-mid'),
      }),
      values: empty.none,
    },
    'animate-marker-start': {
      property: value => ({
        '--jumi-marker-start': value,
        '--jumi-marker-start-keyframes': create.animation('marker-start'),
      }),
      values: empty.none,
    },
    'animate-mask': {
      property: value => ({
        '--jumi-mask': value,
        '--jumi-mask-keyframes': create.animation('mask'),
      }),
      values: empty.none,
    },
    'animate-mask-border': {
      property: value => ({
        '--jumi-mask-border': value,
        '--jumi-mask-border-keyframes': create.animation('mask-border'),
      }),
      values: empty.none,
    },
    'animate-mask-border-mode': {
      property: value => ({
        '--jumi-mask-border-mode': value,
        '--jumi-mask-border-mode-keyframes': create.animation('mask-border-mode'),
      }),
      values: maskType,
    },
    'animate-mask-border-outset': {
      property: value => ({
        '--jumi-mask-border-outset': value,
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-outset-bottom': {
      property: value => ({
        '--jumi-mask-border-outset-bottom': value,
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-outset-left': {
      property: value => ({
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
        '--jumi-mask-border-outset-left': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-outset-right': {
      property: value => ({
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
        '--jumi-mask-border-outset-right': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-outset-top': {
      property: value => ({
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
        '--jumi-mask-border-outset-top': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-outset-x': {
      property: value => ({
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
        '--jumi-mask-border-outset-left': value,
        '--jumi-mask-border-outset-right': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-outset-y': {
      property: value => ({
        '--jumi-mask-border-outset-bottom': value,
        '--jumi-mask-border-outset-keyframes': create.animation('mask-border-outset'),
        '--jumi-mask-border-outset-top': value,
      }),
      supportsNegativeValues: true,
      type: 'length',
      values: getValues('inset'),
    },
    'animate-mask-border-repeat': {
      property: value => ({
        '--jumi-mask-border-repeat': value,
        '--jumi-mask-border-repeat-keyframes': create.animation('mask-border-repeat'),
      }),
      values: maskBorderRepeat,
    },
    'animate-mask-border-slice': {
      property: value => ({
        '--jumi-mask-border-slice': value,
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-bottom': {
      property: value => ({
        '--jumi-mask-border-slice-bottom': value,
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-left': {
      property: value => ({
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
        '--jumi-mask-border-slice-left': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-right': {
      property: value => ({
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
        '--jumi-mask-border-slice-right': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-top': {
      property: value => ({
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
        '--jumi-mask-border-slice-top': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-x': {
      property: value => ({
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
        '--jumi-mask-border-slice-left': value,
        '--jumi-mask-border-slice-right': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-y': {
      property: value => ({
        '--jumi-mask-border-slice-bottom': value,
        '--jumi-mask-border-slice-keyframes': create.animation('mask-border-slice'),
        '--jumi-mask-border-slice-top': value,
      }),
      type: ['number', 'percentage', 'any'],
      values: getValues('inset', maskBorderSlice),
    },
    'animate-mask-border-source': {
      property: value => ({
        '--jumi-mask-border-source': value,
        '--jumi-mask-border-source-keyframes': create.animation('mask-border-source'),
      }),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-border-width': {
      property: value => ({
        '--jumi-mask-border-width': value,
        '--jumi-mask-border-width-keyframes': create.animation('mask-border-width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('borderWidth'),
    },
    'animate-mask-clip': {
      property: value => ({
        '--jumi-mask-clip': value,
        '--jumi-mask-clip-keyframes': create.animation('mask-clip'),
      }),
      values: maskClip,
    },
    'animate-mask-composite': {
      property: value => ({
        '--jumi-mask-composite': value,
        '--jumi-mask-composite-keyframes': create.animation('mask-composite'),
      }),
      values: maskComposite,
    },
    'animate-mask-image': {
      property: value => ({
        '--jumi-mask-image': value,
        '--jumi-mask-image-keyframes': create.animation('mask-image'),
      }),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-mode': {
      property: value => ({
        '--jumi-mask-mode': value,
        '--jumi-mask-mode-keyframes': create.animation('mask-mode'),
      }),
      values: maskMode,
    },
    'animate-mask-origin': {
      property: value => ({
        '--jumi-mask-origin': value,
        '--jumi-mask-origin-keyframes': create.animation('mask-origin'),
      }),
      values: maskOrigin,
    },
    'animate-mask-position': {
      property: value => ({
        '--jumi-mask-position': value,
        '--jumi-mask-position-keyframes': create.animation('mask-position'),
      }),
      type: ['length', 'percentage', 'position'],
    },
    'animate-mask-repeat': {
      property: value => ({
        '--jumi-mask-repeat': value,
        '--jumi-mask-repeat-keyframes': create.animation('mask-repeat'),
      }),
      values: backgroundRepeat,
    },
    'animate-mask-size': {
      property: value => ({
        '--jumi-mask-size': value,
        '--jumi-mask-size-keyframes': create.animation('mask-size'),
      }),
      type: ['length', 'percentage'],
      values: getValues('backgroundSize'),
    },
    'animate-mask-type': {
      property: value => ({
        '--jumi-mask-type': value,
        '--jumi-mask-type-keyframes': create.animation('mask-type'),
      }),
      values: maskType,
    },
    'animate-math-depth': {
      property: value => ({
        '--jumi-math-depth': value,
        '--jumi-math-depth-keyframes': create.animation('math-depth'),
      }),
      supportsNegativeValues: true,
      type: 'integer',
      values: mathDepth,
    },
    'animate-math-depth-add': {
      property: value => ({
        '--jumi-math-depth': `add(${value})`,
        '--jumi-math-depth-keyframes': create.animation('math-depth'),
      }),
      supportsNegativeValues: true,
      type: 'integer',
      values: empty.number,
    },
    'animate-math-style': {
      property: value => ({
        '--jumi-math-style': value,
        '--jumi-math-style-keyframes': create.animation('math-style'),
      }),
      values: mathStyle,
    },
    'animate-max-block-size': {
      property: value => ({
        '--jumi-max-block-size': value,
        '--jumi-max-block-size-keyframes': create.animation('max-block-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('maxHeight'),
    },
    'animate-max-height': {
      property: value => ({
        '--jumi-max-height': value,
        '--jumi-max-height-keyframes': create.animation('max-height'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('maxHeight'),
    },
    'animate-max-inline-size': {
      property: value => ({
        '--jumi-max-inline-size': value,
        '--jumi-max-inline-size-keyframes': create.animation('max-inline-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('maxWidth'),
    },
    'animate-max-width': {
      property: value => ({
        '--jumi-max-width': value,
        '--jumi-max-width-keyframes': create.animation('max-width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('maxWidth'),
    },
    'animate-min-block-size': {
      property: value => ({
        '--jumi-min-block-size': value,
        '--jumi-min-block-size-keyframes': create.animation('min-block-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('minHeight'),
    },
    'animate-min-height': {
      property: value => ({
        '--jumi-min-height': value,
        '--jumi-min-height-keyframes': create.animation('min-height'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('minHeight'),
    },
    'animate-min-inline-size': {
      property: value => ({
        '--jumi-min-inline-size': value,
        '--jumi-min-inline-size-keyframes': create.animation('min-inline-size'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('minWidth'),
    },
    'animate-min-width': {
      property: value => ({
        '--jumi-min-width': value,
        '--jumi-min-width-keyframes': create.animation('min-width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('minWidth'),
    },
    'animate-mix-blend-mode': {
      property: value => ({
        '--jumi-mix-blend-mode': value,
        '--jumi-mix-blend-mode-keyframes': create.animation('mix-blend-mode'),
      }),
      values: mixBlendMode,
    },
    'animate-object-fit': {
      property: value => ({
        '--jumi-object-fit': value,
        '--jumi-object-fit-keyframes': create.animation('object-fit'),
      }),
      values: objectFit,
    },
    'animate-object-position': {
      property: value => ({
        '--jumi-object-position': value,
        '--jumi-object-position-keyframes': create.animation('object-position'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: getValues('objectPosition'),
    },
    'animate-object-position-x': {
      property: value => ({
        '--jumi-object-position-keyframes': create.animation('object-position'),
        '--jumi-object-position-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-x-edge': {
      property: value => ({
        '--jumi-object-position-keyframes': create.animation('object-position'),
        '--jumi-object-position-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-x-offset': {
      property: value => ({
        '--jumi-object-position-keyframes': create.animation('object-position'),
        '--jumi-object-position-x-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-object-position-y': {
      property: value => ({
        '--jumi-object-position-keyframes': create.animation('object-position'),
        '--jumi-object-position-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-y-edge': {
      property: value => ({
        '--jumi-object-position-keyframes': create.animation('object-position'),
        '--jumi-object-position-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-y-offset': {
      property: value => ({
        '--jumi-object-position-keyframes': create.animation('object-position'),
        '--jumi-object-position-y-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset': {
      property: value => ({
        '--jumi-offset': value,
        '--jumi-offset-keyframes': create.animation('offset'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: offsetAnchor,
    },
    'animate-offset-anchor': {
      property: value => ({
        '--jumi-offset-anchor': value,
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: getValues('objectPosition', empty.auto),
    },
    'animate-offset-anchor-x': {
      property: value => ({
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
        '--jumi-offset-anchor-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-x-edge': {
      property: value => ({
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
        '--jumi-offset-anchor-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-x-offset': {
      property: value => ({
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
        '--jumi-offset-anchor-x-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-anchor-y': {
      property: value => ({
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
        '--jumi-offset-anchor-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-y-edge': {
      property: value => ({
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
        '--jumi-offset-anchor-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-y-offset': {
      property: value => ({
        '--jumi-offset-anchor-keyframes': create.animation('offset-anchor'),
        '--jumi-offset-anchor-y-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-distance': {
      property: value => ({
        '--jumi-offset-distance': value,
        '--jumi-offset-distance-keyframes': create.animation('offset-distance'),
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-path': {
      property: value => ({
        '--jumi-offset-path': value,
        '--jumi-offset-path-keyframes': create.animation('offset-path'),
      }),
      values: offsetPath,
    },
    'animate-offset-position': {
      property: value => ({
        '--jumi-offset-position': value,
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
      }),
      type: ['length', 'percentage', 'position', 'any'],
      values: getValues('objectPosition', offsetPosition),
    },
    'animate-offset-position-x': {
      property: value => ({
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
        '--jumi-offset-position-x': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-x-edge': {
      property: value => ({
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
        '--jumi-offset-position-x-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-x-offset': {
      property: value => ({
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
        '--jumi-offset-position-x-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-position-y': {
      property: value => ({
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
        '--jumi-offset-position-y': value,
      }),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-y-edge': {
      property: value => ({
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
        '--jumi-offset-position-y-edge': value,
      }),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-y-offset': {
      property: value => ({
        '--jumi-offset-position-keyframes': create.animation('offset-position'),
        '--jumi-offset-position-y-offset': value,
      }),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-rotate': {
      property: value => ({
        '--jumi-offset-rotate': value,
        '--jumi-offset-rotate-keyframes': create.animation('offset-rotate'),
      }),
      type: ['angle', 'any'],
      values: getValues('rotate', offsetRotate),
    },
    'animate-opacity': {
      property: value => ({
        '--jumi-opacity': value,
        '--jumi-opacity-keyframes': create.animation('opacity'),
      }),
      type: ['number', 'percentage'],
      values: getValues('opacity'),
    },
    'animate-order': {
      property: value => ({
        '--jumi-order': value,
        '--jumi-order-keyframes': create.animation('order'),
      }),
      supportsNegativeValues: true,
      type: 'integer',
      values: getValues('order'),
    },
    'animate-orphans': {
      property: value => ({
        '--jumi-orphans': value,
        '--jumi-orphans-keyframes': create.animation('orphans'),
      }),
      type: 'integer',
      values: empty.number,
    },
    'animate-outline': {
      property: value => ({
        '--jumi-outline': value,
        '--jumi-outline-keyframes': create.animation('outline'),
      }),
      type: ['line-width', 'length', 'color', 'any'],
      values: empty.none,
    },
    'animate-outline-color': {
      property: value => ({
        '--jumi-outline-color': value,
        '--jumi-outline-keyframes': create.animation('outline'),
      }),
      type: 'color',
      values: getValues('outlineColor'),
    },
    'animate-outline-offset': {
      property: value => ({
        '--jumi-outline-keyframes': create.animation('outline'),
        '--jumi-outline-offset': value,
      }),
      type: 'length',
      values: getValues('outlineOffset'),
    },
    'animate-outline-style': {
      property: value => ({
        '--jumi-outline-keyframes': create.animation('outline'),
        '--jumi-outline-style': value,
      }),
      values: outlineStyle,
    },
    'animate-outline-width': {
      property: value => ({
        '--jumi-outline-keyframes': create.animation('outline'),
        '--jumi-outline-width': value,
      }),
      type: ['line-width'],
      values: getValues('outlineWidth'),
    },
    'animate-overflow': {
      property: value => ({
        '--jumi-overflow': value,
        '--jumi-overflow-keyframes': create.animation('overflow'),
      }),
      values: overflow,
    },
    'animate-overflow-anchor': {
      property: value => ({
        '--jumi-overflow-anchor': value,
        '--jumi-overflow-anchor-keyframes': create.animation('overflow-anchor'),
      }),
      values: overflowAnchor,
    },
    'animate-overflow-block': {
      property: value => ({
        '--jumi-overflow-block': value,
        '--jumi-overflow-block-keyframes': create.animation('overflow-block'),
      }),
      values: overflow,
    },
    'animate-overflow-clip-margin': {
      property: value => ({
        '--jumi-overflow-clip-margin': value,
        '--jumi-overflow-clip-margin-keyframes': create.animation('overflow-clip-margin'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'any'],
      values: overflowClipMargin,
    },
    'animate-overflow-inline': {
      property: value => ({
        '--jumi-overflow-inline': value,
        '--jumi-overflow-inline-keyframes': create.animation('overflow-inline'),
      }),
      values: overflow,
    },
    'animate-overflow-wrap': {
      property: value => ({
        '--jumi-overflow-wrap': value,
        '--jumi-overflow-wrap-keyframes': create.animation('overflow-wrap'),
      }),
      values: overflowWrap,
    },
    'animate-overflow-x': {
      property: value => ({
        '--jumi-overflow-keyframes': create.animation('overflow'),
        '--jumi-overflow-x': value,
      }),
      values: overflow,
    },
    'animate-overflow-y': {
      property: value => ({
        '--jumi-overflow-keyframes': create.animation('overflow'),
        '--jumi-overflow-y': value,
      }),
      values: overflow,
    },
    'animate-overscroll-behavior': {
      property: value => ({
        '--jumi-overscroll-behavior': value,
        '--jumi-overscroll-behavior-keyframes': create.animation('overscroll-behavior'),
      }),
      values: empty.auto,
    },
    'animate-overscroll-behavior-block': {
      property: value => ({
        '--jumi-overscroll-behavior-block': value,
        '--jumi-overscroll-behavior-block-keyframes': create.animation('overscroll-behavior-block'),
      }),
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-inline': {
      property: value => ({
        '--jumi-overscroll-behavior-inline': value,
        '--jumi-overscroll-behavior-inline-keyframes': create.animation('overscroll-behavior-inline'),
      }),
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-x': {
      property: value => ({
        '--jumi-overscroll-behavior-x': value,
        '--jumi-overscroll-behavior-x-keyframes': create.animation('overscroll-behavior-x'),
      }),
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-y': {
      property: value => ({
        '--jumi-overscroll-behavior-y': value,
        '--jumi-overscroll-behavior-y-keyframes': create.animation('overscroll-behavior-y'),
      }),
      values: overscrollBehavior,
    },
    'animate-padding': {
      property: value => ({
        '--jumi-padding': value,
        '--jumi-padding-keyframes': create.animation('padding'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-block': {
      property: value => ({
        '--jumi-padding-block': value,
        '--jumi-padding-block-keyframes': create.animation('padding-block'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-block-end': {
      property: value => ({
        '--jumi-padding-block-end': value,
        '--jumi-padding-block-end-keyframes': create.animation('padding-block-end'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-block-start': {
      property: value => ({
        '--jumi-padding-block-start': value,
        '--jumi-padding-block-start-keyframes': create.animation('padding-block-start'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-bottom': {
      property: value => ({
        '--jumi-padding-bottom': value,
        '--jumi-padding-bottom-keyframes': create.animation('padding-bottom'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-inline': {
      property: value => ({
        '--jumi-padding-inline': value,
        '--jumi-padding-inline-keyframes': create.animation('padding-inline'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-inline-end': {
      property: value => ({
        '--jumi-padding-inline-end': value,
        '--jumi-padding-inline-end-keyframes': create.animation('padding-inline-end'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-inline-start': {
      property: value => ({
        '--jumi-padding-inline-start': value,
        '--jumi-padding-inline-start-keyframes': create.animation('padding-inline-start'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-left': {
      property: value => ({
        '--jumi-padding-left': value,
        '--jumi-padding-left-keyframes': create.animation('padding-left'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-right': {
      property: value => ({
        '--jumi-padding-right': value,
        '--jumi-padding-right-keyframes': create.animation('padding-right'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-padding-top': {
      property: value => ({
        '--jumi-padding-top': value,
        '--jumi-padding-top-keyframes': create.animation('padding-top'),
      }),
      supportsNegativeValues: true,
      values: getValues('padding'),
    },
    'animate-page': {
      property: value => ({
        '--jumi-page': value,
        '--jumi-page-keyframes': create.animation('page'),
      }),
      values: empty.auto,
    },
    'animate-paint-order': {
      property: value => ({
        '--jumi-paint-order': value,
        '--jumi-paint-order-keyframes': create.animation('paint-order'),
      }),
      values: paintOrder,
    },
    'animate-position': {
      property: value => ({
        '--jumi-position': value,
        '--jumi-position-keyframes': create.animation('position'),
      }),
      values: position,
    },
    'animate-right': {
      property: value => ({
        '--jumi-right': value,
        '--jumi-right-keyframes': create.animation('right'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-rotate': {
      property: value => ({
        '--jumi-rotate': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      type: 'angle',
      values: getValues('rotate'),
    },
    'animate-rotate-3d': {
      property: value => ({
        '--jumi-rotate-3d': css('rotate3d', value),
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      values: empty.string,
    },
    'animate-rotate-x': {
      property: value => ({
        '--jumi-rotate': value,
        '--jumi-rotate-x': '1',
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      type: 'angle',
      values: getValues('rotate'),
    },
    'animate-rotate-y': {
      property: value => ({
        '--jumi-rotate': value,
        '--jumi-rotate-y': '1',
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      type: 'angle',
      values: getValues('rotate'),
    },
    'animate-row-gap': {
      property: value => ({
        '--jumi-gap-keyframes': create.animation('gap'),
        '--jumi-row-gap': value,
      }),
      values: empty.number,
    },
    'animate-scale': {
      property: (value) => {
        const [x, y] = value.split(/\s+/)
        return {
          '--jumi-scale-x': x ?? value,
          '--jumi-scale-y': y ?? x ?? value,
          '--jumi-transform-keyframes': create.animation('transform'),
        }
      },
      supportsNegativeValues: true,
      values: getValues('scale'),
    },
    'animate-scale-x': {
      property: value => ({
        '--jumi-scale-x': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: getValues('scale'),
    },
    'animate-scale-y': {
      property: value => ({
        '--jumi-scale-y': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: getValues('scale'),
    },
    'animate-scale-z': {
      property: value => ({
        '--jumi-scale-z': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      type: 'number',
      values: getValues('scale'),
    },
    'animate-skew': {
      property: (value) => {
        const [x, y] = value.split(/\s+/)
        return {
          '--jumi-skew-x': x ?? value,
          '--jumi-skew-y': y ?? x ?? value,
          '--jumi-transform-keyframes': create.animation('transform'),
        }
      },
      supportsNegativeValues: true,
      values: getValues('skew'),
    },
    'animate-skew-x': {
      property: value => ({
        '--jumi-skew-x': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      values: getValues('skew'),
    },
    'animate-skew-y': {
      property: value => ({
        '--jumi-skew-y': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      supportsNegativeValues: true,
      values: getValues('skew'),
    },
    'animate-stroke': {
      property: value => ({
        '--jumi-stroke': value,
        '--jumi-stroke-keyframes': create.animation('stroke'),
      }),
      values: getValues('colors'),
    },
    'animate-stroke-width': {
      property: value => ({
        '--jumi-stroke-width': value,
        '--jumi-stroke-width-keyframes': create.animation('stroke-width'),
      }),
      values: getValues('strokeWidth'),
    },
    'animate-text-align': {
      property: value => ({
        '--jumi-text-align': value,
        '--jumi-text-align-keyframes': create.animation('text-align'),
      }),
      values: textAlign,
    },
    'animate-text-shadow': {
      property: value => ({
        '--jumi-text-shadow': value,
        '--jumi-text-shadow-keyframes': create.animation('text-shadow'),
      }),
      values: textShadow,
    },
    'animate-top': {
      property: value => ({
        '--jumi-top': value,
        '--jumi-top-keyframes': create.animation('top'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('inset', inset),
    },
    'animate-transform': {
      property: value => ({
        '--jumi-transform': value,
        '--jumi-transform-keyframes': create.animation('transform'),
      }),
      values: empty.none,
    },
    'animate-transform-style': {
      property: value => ({
        '--jumi-transform-keyframes': create.animation('transform'),
        '--jumi-transform-style': value,
      }),
      values: transformStyle,
    },
    'animate-translate-3d': {
      property: value => ({
        '--jumi-transform-keyframes': create.animation('transform'),
        '--jumi-translate-3d': css('translate3d', value),
      }),
      type: ['length', 'percentage', 'any'],
      values: empty.string,
    },
    'animate-translate-x': {
      property: value => ({
        '--jumi-transform-keyframes': create.animation('transform'),
        '--jumi-translate-x': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-translate-y': {
      property: value => ({
        '--jumi-transform-keyframes': create.animation('transform'),
        '--jumi-translate-y': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-translate-z': {
      property: value => ({
        '--jumi-transform-keyframes': create.animation('transform'),
        '--jumi-translate-z': value,
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.string,
    },
    'animate-visibility': {
      property: value => ({
        '--jumi-visibility': value,
        '--jumi-visibility-keyframes': create.animation('visibility'),
      }),
      values: visibility,
    },
    'animate-width': {
      property: value => ({
        '--jumi-width': value,
        '--jumi-width-keyframes': create.animation('width'),
      }),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: getValues('width'),
    },
    'animate-z-index': {
      property: value => ({
        '--jumi-z-index': value,
        '--jumi-z-index-keyframes': create.animation('z-index'),
      }),
      values: getValues('zIndex'),
    },
    'animation-composition': {
      property: value => ({
        '--jumi-animation-composition': value,
      }),
      values: animationComposition,
    },
    'animation-delay': {
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-delay': value }
        return { [`--jumi-${modifier}-animation-delay`]: value }
      },
      values: animationDelay,
    },
    'animation-direction': {
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-direction': value }
        return { [`--jumi-${modifier}-animation-direction`]: value }
      },
      values: animationDirection,
    },
    'animation-duration': {
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-duration': value }
        return { [`--jumi-${modifier}-animation-duration`]: value }
      },
      values: animationDuration,
    },
    'animation-fill-mode': {
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-fill-mode': value }
        return { [`--jumi-${modifier}-animation-fill-mode`]: value }
      },
      values: animationFillMode,
    },
    'animation-iteration-count': {
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-iteration-count': value }
        return { [`--jumi-${modifier}-animation-iteration-count`]: value }
      },
      type: 'number',
      values: animationIterationCount,
    },
    'animation-play-state': {
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-play-state': value }
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
      modifiers: animationModifiers,
      property: (value, { modifier }) => {
        if (modifier === null) return { '--jumi-animation-timing-function': value }
        return { [`--jumi-${modifier}-animation-timing-function`]: value }
      },
      values: animationTimingFunction,
    },
  }

  return matchProperties
}
