import type { AnimatableStandardPropertyType, GetMatchComponents, MatchComponents, MatchComponentsPropertyFunction } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { cssEffects } from '@/keyframes/effects'
import { alignContent } from '@/theme/align-content'
import { alignItems } from '@/theme/align-items'
import { alignSelf } from '@/theme/align-self'
import { alignmentBaseline } from '@/theme/alignment-baseline'
import { all } from '@/theme/all'
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
import { hyphenateLimitChars } from '@/theme/hyphenate-limit-chars'
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
import { stroke } from '@/theme/stroke'
import { textAlign } from '@/theme/text-align'
import { transformStyle } from '@/theme/transform-style'
import { visibility } from '@/theme/visibility'

export const getMatchTween: GetMatchComponents = (creator) => {
  const { color, effect, property, theme } = creator

  /**
   * Consume the keyword modifier into the value (e.g. `/block`, `/span`,
   * `/from-font`), then write the joined value to the attribute's variable.
   * Unlike the stop-based curry, the modifier is NOT registered as a keyframe
   * stop and NOT suffixed into the variable name.
   */
  const token = (
    attribute: AnimatableStandardPropertyType,
    order: 'append' | 'prepend' = 'append',
  ): MatchComponentsPropertyFunction => {
    const matcher = property(attribute)

    return (value, { modifier }) => {
      const composed = modifier
        ? order === 'prepend'
          ? join([modifier, value])
          : join([value, modifier])
        : value
      return matcher(composed, { modifier: null })
    }
  }

  /**
   * Wrap a value into a CSS function with comma-separated arguments
   * (e.g. `skew(10deg, 20deg)`). Space-separated multi-arg transform
   * functions are invalid, so the value's whitespace is joined with commas.
   */
  const args = (name: string) => (value: string) => css(name, value.split(/\s+/).join(', '))

  const matchTween: Partial<MatchComponents> = {
    'animate': {
      fn: (value) => {
        return ({
          [`--jumi-${value}-animation-name`]: effect(value),
        })
      },
      values: cssEffects,
    },
    'animate-accent-color': {
      fn: color('accent-color'),
      type: 'color',
      values: theme('accentColor'),
    },
    'animate-align-content': {
      fn: property('align-content'),
      type: ['any'],
      values: alignContent,
    },
    'animate-align-items': {
      fn: property('align-items'),
      type: ['any'],
      values: alignItems,
    },
    'animate-align-self': {
      fn: property('align-self'),
      type: ['any'],
      values: alignSelf,
    },
    'animate-alignment-baseline': {
      fn: property('alignment-baseline'),
      type: ['any'],
      values: alignmentBaseline,
    },
    'animate-all': {
      fn: property('all'),
      type: ['any'],
      values: all,
    },
    'animate-appearance': {
      fn: property('appearance'),
      type: ['any'],
      values: appearance,
    },
    'animate-aspect-ratio': {
      fn: property('aspect-ratio'),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-height': {
      fn: property('aspect-ratio', ['aspect-ratio-height']),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-aspect-ratio-width': {
      fn: property('aspect-ratio', ['aspect-ratio-width']),
      type: 'ratio',
      values: empty.auto,
    },
    'animate-backdrop-filter': {
      fn: property('backdrop-filter'),
      type: ['any'],
      values: empty.none,
    },
    'animate-backdrop-filter-blur': {
      fn: property('backdrop-filter', [['backdrop-filter-blur', value => css('blur', value)]]),
      type: 'length',
      values: theme('backdropBlur'),
    },
    'animate-backdrop-filter-brightness': {
      fn: property('backdrop-filter', [['backdrop-filter-brightness', value => css('brightness', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropBrightness'),
    },
    'animate-backdrop-filter-contrast': {
      fn: property('backdrop-filter', [['backdrop-filter-contrast', value => css('contrast', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropContrast'),
    },
    'animate-backdrop-filter-drop-shadow': {
      fn: property('backdrop-filter', [['backdrop-filter-drop-shadow', value => css('drop-shadow', value)]]),
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-backdrop-filter-drop-shadow-blur': {
      fn: property('backdrop-filter', ['backdrop-filter-drop-shadow-blur']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-color': {
      fn: color('backdrop-filter', ['backdrop-filter-drop-shadow-color']),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-backdrop-filter-drop-shadow-offset-x': {
      fn: property('backdrop-filter', ['backdrop-filter-drop-shadow-offset-x']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-drop-shadow-offset-y': {
      fn: property('backdrop-filter', ['backdrop-filter-drop-shadow-offset-y']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-backdrop-filter-grayscale': {
      fn: property('backdrop-filter', [['backdrop-filter-grayscale', value => css('grayscale', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropGrayscale'),
    },
    'animate-backdrop-filter-hue-rotate': {
      fn: property('backdrop-filter', [['backdrop-filter-hue-rotate', value => css('hue-rotate', value)]]),
      type: 'angle',
      values: theme('backdropHueRotate'),
    },
    'animate-backdrop-filter-invert': {
      fn: property('backdrop-filter', [['backdrop-filter-invert', value => css('invert', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropInvert'),
    },
    'animate-backdrop-filter-opacity': {
      fn: property('backdrop-filter', [['backdrop-filter-opacity', value => css('opacity', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropOpacity'),
    },
    'animate-backdrop-filter-saturate': {
      fn: property('backdrop-filter', [['backdrop-filter-saturate', value => css('saturate', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropSaturate'),
    },
    'animate-backdrop-filter-sepia': {
      fn: property('backdrop-filter', [['backdrop-filter-sepia', value => css('sepia', value)]]),
      type: ['number', 'percentage'],
      values: theme('backdropSepia'),
    },
    'animate-backdrop-filter-url': {
      fn: property('backdrop-filter', [['backdrop-filter-url', value => css('url', value)]]),
      type: 'url',
      values: empty.string,
    },
    'animate-backface-visibility': {
      fn: property('backface-visibility'),
      type: ['any'],
      values: backfaceVisibility,
    },
    'animate-background': {
      fn: color('background'),
      type: ['color', 'image', 'position', 'url', 'any'],
      values: empty.none,
    },
    'animate-background-attachment': {
      fn: property('background-attachment'),
      type: ['any'],
      values: backgroundAttachment,
    },
    'animate-background-blend-mode': {
      fn: property('background-blend-mode'),
      type: ['any'],
      values: mixBlendMode,
    },
    'animate-background-clip': {
      fn: property('background-clip'),
      type: ['any'],
      values: backgroundClip,
    },
    'animate-background-color': {
      fn: color('background-color'),
      type: 'color',
      values: theme('backgroundColor'),
    },
    'animate-background-image': {
      fn: property('background-image'),
      type: 'image',
      values: theme('backgroundImage'),
    },
    'animate-background-origin': {
      fn: property('background-origin'),
      type: ['any'],
      values: backgroundOrigin,
    },
    'animate-background-position': {
      fn: property('background-position'),
      type: ['position', 'percentage', 'length', 'any'],
      values: theme('backgroundPosition'),
    },
    'animate-background-position-x': {
      fn: property('background-position', ['background-position-x']),
      type: ['position', 'percentage', 'length', 'any'],
      values: empty.position,
    },
    'animate-background-position-x-edge': {
      fn: property('background-position', ['background-position-x-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-x-offset': {
      fn: property('background-position', ['background-position-x-offset']),
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-position-y': {
      fn: property('background-position', ['background-position-y']),
      type: ['position', 'percentage', 'length', 'any'],
      values: merge(objectPosition, percentage),
    },
    'animate-background-position-y-edge': {
      fn: property('background-position', ['background-position-y-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-background-position-y-offset': {
      fn: property('background-position', ['background-position-y-offset']),
      type: ['percentage', 'length'],
      values: percentage,
    },
    'animate-background-repeat': {
      fn: property('background-repeat'),
      type: ['any'],
      values: backgroundRepeat,
    },
    'animate-background-repeat-x': {
      fn: property('background-repeat', ['background-repeat-x']),
      type: ['any'],
      values: backgroundRepeatAxis,
    },
    'animate-background-repeat-y': {
      fn: property('background-repeat', ['background-repeat-y']),
      type: ['any'],
      values: backgroundRepeatAxis,
    },
    'animate-background-size': {
      fn: property('background-size'),
      type: ['length', 'percentage', 'any'],
      values: theme('backgroundSize'),
    },
    'animate-background-size-height': {
      fn: property('background-size', ['background-size-height']),
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-background-size-width': {
      fn: property('background-size', ['background-size-width']),
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-block-size': {
      fn: property('block-size'),
      type: ['length', 'percentage', 'any'],
      values: empty.auto,
    },
    'animate-border': {
      fn: property('border'),
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-border-block': {
      fn: property('border-block'),
      type: ['line-width', 'length', 'any'],
      values: theme('borderWidth'),
    },
    'animate-border-block-color': {
      fn: color('border-block-color', ['border-block-color']),
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-block-end-radius': {
      fn: property('border-radius', ['border-end-end-radius', 'border-end-start-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-block-end-width': {
      fn: property('border-block-end-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-start-radius': {
      fn: property('border-radius', ['border-start-end-radius', 'border-start-start-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-block-start-width': {
      fn: property('border-block-start-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-block-width': {
      fn: property('border-block-width', ['border-block-end-width', 'border-block-start-width']),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-bottom-left-radius': {
      fn: property('border-bottom-left-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-radius': {
      fn: property('border-radius', ['border-bottom-left-radius', 'border-bottom-right-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-right-radius': {
      fn: property('border-bottom-right-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-bottom-width': {
      fn: property('border-bottom-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-collapse': {
      fn: property('border-collapse'),
      type: ['any'],
      values: borderCollapse,
    },
    'animate-border-color': {
      fn: color('border-color'),
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-border-end-end-radius': {
      fn: property('border-end-end-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-end-start-radius': {
      fn: property('border-end-start-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-image': {
      fn: property('border-image'),
      type: 'image',
      values: empty.none,
    },
    'animate-border-image-outset': {
      fn: property('border-image-outset'),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-bottom': {
      fn: property('border-image-outset', ['border-image-outset-bottom']),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-left': {
      fn: property('border-image-outset', ['border-image-outset-left']),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-right': {
      fn: property('border-image-outset', ['border-image-outset-right']),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-top': {
      fn: property('border-image-outset', ['border-image-outset-top']),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-x': {
      fn: property('border-image-outset', ['border-image-outset-left', 'border-image-outset-right']),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-outset-y': {
      fn: property('border-image-outset', ['border-image-outset-bottom', 'border-image-outset-top']),
      type: ['number', 'length'],
      values: empty.number,
    },
    'animate-border-image-repeat': {
      fn: property('border-image-repeat'),
      type: ['any'],
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-x': {
      fn: property('border-image-repeat', ['border-image-repeat-x']),
      type: ['any'],
      values: borderImageRepeat,
    },
    'animate-border-image-repeat-y': {
      fn: property('border-image-repeat', ['border-image-repeat-y']),
      type: ['any'],
      values: borderImageRepeat,
    },
    'animate-border-inline-end-radius': {
      fn: property('border-radius', ['border-end-end-radius', 'border-start-end-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-inline-end-width': {
      fn: property('border-inline-end-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-start-radius': {
      fn: property('border-radius', ['border-end-start-radius', 'border-start-start-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-inline-start-width': {
      fn: property('border-inline-start-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-inline-width': {
      fn: property('border-inline-width', ['border-inline-end-width', 'border-inline-start-width']),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-left-radius': {
      fn: property('border-radius', ['border-bottom-left-radius', 'border-top-left-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-left-width': {
      fn: property('border-left-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-radius': {
      fn: property('border-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-right-radius': {
      fn: property('border-radius', ['border-bottom-right-radius', 'border-top-right-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-right-width': {
      fn: property('border-right-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-start-end-radius': {
      fn: property('border-start-end-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-start-start-radius': {
      fn: property('border-start-start-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-left-radius': {
      fn: property('border-top-left-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-radius': {
      fn: property('border-radius', ['border-top-left-radius', 'border-top-right-radius']),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-right-radius': {
      fn: property('border-top-right-radius'),
      type: ['length', 'percentage'],
      values: theme('borderRadius'),
    },
    'animate-border-top-width': {
      fn: property('border-top-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-border-width': {
      fn: property('border-width'),
      type: ['line-width', 'length'],
      values: theme('borderWidth'),
    },
    'animate-bottom': {
      fn: property('bottom'),
      supportsNegativeValues: true,
      type: ['number', 'length', 'percentage'],
      values: theme('inset', inset),
    },
    'animate-box-decoration-break': {
      fn: property('box-decoration-break'),
      type: ['any'],
      values: boxDecorationBreak,
    },
    'animate-box-shadow': {
      fn: property('box-shadow'),
      type: ['length', 'shadow', 'any'],
      values: theme('boxShadow'),
    },
    'animate-box-shadow-blur': {
      fn: property('box-shadow', ['box-shadow-blur']),
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-box-shadow-color': {
      fn: color('box-shadow', ['box-shadow-color']),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-box-shadow-offset-x': {
      fn: property('box-shadow', ['box-shadow-offset-x']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-offset-y': {
      fn: property('box-shadow', ['box-shadow-offset-y']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-box-shadow-spread': {
      fn: property('box-shadow', ['box-shadow-spread']),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-box-sizing': {
      fn: property('box-sizing'),
      type: ['any'],
      values: boxSizing,
    },
    'animate-break-after': {
      fn: property('break-after'),
      type: ['any'],
      values: breakAfter,
    },
    'animate-break-before': {
      fn: property('break-before'),
      type: ['any'],
      values: breakBefore,
    },
    'animate-break-inside': {
      fn: property('break-inside'),
      type: ['any'],
      values: breakInside,
    },
    'animate-caption-side': {
      fn: property('caption-side'),
      type: ['any'],
      values: captionSide,
    },
    'animate-caret-color': {
      fn: color('caret-color'),
      type: 'color',
      values: theme('caretColor'),
    },
    'animate-clear': {
      fn: property('clear'),
      type: ['any'],
      values: clear,
    },
    'animate-clip-path': {
      fn: property('clip-path'),
      type: ['any'],
      values: clipPath,
    },
    'animate-clip-rule': {
      fn: property('clip-rule'),
      type: ['any'],
      values: clipRule,
    },
    'animate-color': {
      fn: color('color'),
      type: 'color',
      values: theme('colors'),
    },
    'animate-color-interpolation': {
      fn: property('color-interpolation'),
      type: ['any'],
      values: colorInterpolation,
    },
    'animate-color-interpolation-filters': {
      fn: property('color-interpolation-filters'),
      type: ['any'],
      values: colorInterpolation,
    },
    'animate-color-scheme': {
      fn: property('color-scheme'),
      type: ['any'],
      values: colorScheme,
    },
    'animate-column-count': {
      fn: property('column-count'),
      type: 'integer',
      values: empty.auto,
    },
    'animate-column-fill': {
      fn: property('column-fill'),
      type: ['any'],
      values: columnFill,
    },
    'animate-column-gap': {
      fn: property('gap', ['column-gap']),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-column-rule': {
      fn: property('column-rule'),
      type: ['line-width', 'length'],
      values: empty.none,
    },
    'animate-column-rule-color': {
      fn: color('column-rule-color'),
      type: 'color',
      values: theme('borderColor'),
    },
    'animate-column-rule-style': {
      fn: property('column-rule-style'),
      type: ['any'],
      values: columnRuleStyle,
    },
    'animate-column-rule-width': {
      fn: property('column-rule-width'),
      type: ['line-width', 'length'],
      values: columnRuleWidth,
    },
    'animate-column-span': {
      fn: property('column-span'),
      type: 'integer',
      values: columnSpan,
    },
    'animate-column-width': {
      fn: property('column-width'),
      type: ['length', 'percentage'],
      values: columnWidth,
    },
    'animate-columns': {
      fn: property('columns'),
      type: ['line-width', 'length', 'integer'],
      values: empty.auto,
    },
    'animate-contain': {
      fn: property('contain'),
      type: ['any'],
      values: contain,
    },
    'animate-contain-intrinsic-block-size': {
      fn: property('contain-intrinsic-block-size'),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-height': {
      fn: property('contain-intrinsic-height'),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-inline-size': {
      fn: property('contain-intrinsic-inline-size'),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-contain-intrinsic-size': {
      fn: property('contain-intrinsic-size'),
      type: 'length',
      values: empty.none,
    },
    'animate-contain-intrinsic-width': {
      fn: property('contain-intrinsic-width'),
      type: 'length',
      values: containIntrinsic,
    },
    'animate-content': {
      fn: property('content'),
      type: ['image', 'any'],
      values: content,
    },
    'animate-content-visibility': {
      fn: property('content-visibility'),
      type: ['any'],
      values: contentVisibility,
    },
    'animate-counter-increment': {
      fn: property('counter-increment'),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-reset': {
      fn: property('counter-reset'),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-counter-set': {
      fn: property('counter-set'),
      type: ['integer', 'any'],
      values: empty.none,
    },
    'animate-cursor': {
      fn: property('cursor'),
      type: ['url', 'any'],
      values: cursor,
    },
    'animate-cx': {
      fn: property('cx'),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-cy': {
      fn: property('cy'),
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-d': {
      fn: property('d'),
      type: ['any'],
      values: empty.none,
    },
    'animate-display': {
      fn: property('display'),
      type: ['any'],
      values: display,
    },
    'animate-display-inside': {
      fn: token('display', 'prepend'),
      modifiers: displayOutside,
      type: ['any'],
      values: displayInside,
    },
    'animate-display-outside': {
      fn: token('display'),
      modifiers: displayInside,
      type: ['any'],
      values: displayOutside,
    },
    'animate-dominant-baseline': {
      fn: property('dominant-baseline'),
      type: ['any'],
      values: dominantBaseline,
    },
    'animate-empty-cells': {
      fn: property('empty-cells'),
      type: ['any'],
      values: emptyCells,
    },
    'animate-fill': {
      fn: color('fill', [], { paint: true }),
      type: ['color', 'url', 'any'],
      values: theme('colors', fill),
    },
    'animate-fill-opacity': {
      fn: property('fill-opacity'),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-fill-rule': {
      fn: property('fill-rule'),
      type: ['any'],
      values: fillRule,
    },
    'animate-filter': {
      fn: property('filter'),
      type: ['any'],
      values: empty.none,
    },
    'animate-filter-blur': {
      fn: property('filter', [['filter-blur', value => css('blur', value)]]),
      type: 'length',
      values: theme('blur'),
    },
    'animate-filter-brightness': {
      fn: property('filter', [['filter-brightness', value => css('brightness', value)]]),
      type: ['number', 'percentage'],
      values: theme('brightness'),
    },
    'animate-filter-contrast': {
      fn: property('filter', [['filter-contrast', value => css('contrast', value)]]),
      type: ['number', 'percentage'],
      values: theme('contrast'),
    },
    'animate-filter-drop-shadow': {
      fn: property('filter', [['filter-drop-shadow', value => css('drop-shadow', value)]]),
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-filter-drop-shadow-blur': {
      fn: property('filter', ['filter-drop-shadow-blur']),
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-filter-drop-shadow-color': {
      fn: color('filter', ['filter-drop-shadow-color']),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-filter-drop-shadow-offset-x': {
      fn: property('filter', ['filter-drop-shadow-offset-x']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-drop-shadow-offset-y': {
      fn: property('filter', ['filter-drop-shadow-offset-y']),
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-filter-grayscale': {
      fn: property('filter', [['filter-grayscale', value => css('grayscale', value)]]),
      type: ['number', 'percentage'],
      values: theme('grayscale'),
    },
    'animate-filter-hue-rotate': {
      fn: property('filter', [['filter-hue-rotate', value => css('hue-rotate', value)]]),
      type: 'angle',
      values: theme('hueRotate'),
    },
    'animate-filter-invert': {
      fn: property('filter', [['filter-invert', value => css('invert', value)]]),
      type: ['number', 'percentage'],
      values: theme('invert'),
    },
    'animate-filter-opacity': {
      fn: property('filter', [['filter-opacity', value => css('opacity', value)]]),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-filter-saturate': {
      fn: property('filter', [['filter-saturate', value => css('saturate', value)]]),
      type: ['number', 'percentage'],
      values: theme('saturate'),
    },
    'animate-filter-sepia': {
      fn: property('filter', [['filter-sepia', value => css('sepia', value)]]),
      type: ['number', 'percentage'],
      values: theme('sepia'),
    },
    'animate-filter-url': {
      fn: property('filter', [['filter-url', value => css('url', value)]]),
      type: 'url',
      values: empty.string,
    },
    'animate-flex': {
      fn: property('flex'),
      type: ['number', 'length', 'percentage', 'any'],
      values: theme('flex'),
    },
    'animate-flex-basis': {
      fn: property('flex-basis'),
      type: ['length', 'percentage', 'any'],
      values: theme('flexBasis'),
    },
    'animate-flex-direction': {
      fn: property('flex-direction'),
      type: ['any'],
      values: flexDirection,
    },
    'animate-flex-flow': {
      fn: property('flex-flow'),
      type: ['any'],
      values: empty.string,
    },
    'animate-flex-grow': {
      fn: property('flex-grow'),
      type: ['number', 'any'],
      values: theme('flexGrow'),
    },
    'animate-flex-shrink': {
      fn: property('flex-shrink'),
      type: ['number', 'any'],
      values: theme('flexShrink'),
    },
    'animate-flex-wrap': {
      fn: property('flex-wrap'),
      type: ['any'],
      values: flexWrap,
    },
    'animate-float': {
      fn: property('float'),
      type: ['any'],
      values: float,
    },
    'animate-flood-color': {
      fn: color('flood-color'),
      type: 'color',
      values: theme('colors'),
    },
    'animate-flood-opacity': {
      fn: property('flood-opacity'),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-font-family': {
      fn: property('font-family'),
      type: ['generic-name', 'family-name'],
      values: fontFamily,
    },
    'animate-font-feature-settings': {
      fn: property('font-feature-settings'),
      type: ['integer', 'any'],
      values: fontFeatureSettings,
    },
    'animate-font-kerning': {
      fn: property('font-kerning'),
      type: ['any'],
      values: fontKerning,
    },
    'animate-font-size': {
      fn: property('font-size'),
      type: ['absolute-size', 'relative-size', 'length', 'percentage', 'any'],
      values: fontSize,
    },
    'animate-font-size-adjust': {
      fn: token('font-size-adjust'),
      modifiers: fontSizeAdjustMetric,
      type: ['number', 'any'],
      values: fontSizeAdjust,
    },
    'animate-font-style': {
      fn: token('font-style'),
      modifiers: 'any',
      type: ['any'],
      values: fontStyle,
    },
    'animate-font-synthesis': {
      fn: property('font-synthesis'),
      type: ['any'],
      values: empty.none,
    },
    'animate-font-synthesis-small-caps': {
      fn: property('font-synthesis-small-caps'),
      type: ['any'],
      values: fontSynthesisSmallCaps,
    },
    'animate-font-synthesis-style': {
      fn: property('font-synthesis-style'),
      type: ['any'],
      values: fontSynthesisStyle,
    },
    'animate-font-synthesis-weight': {
      fn: property('font-synthesis-weight'),
      type: ['any'],
      values: fontSynthesisWeight,
    },
    'animate-font-variant': {
      fn: property('font-variant'),
      type: ['any'],
      values: empty.string,
    },
    'animate-font-variant-alternates': {
      fn: property('font-variant-alternates'),
      type: ['any'],
      values: fontVariantAlternates,
    },
    'animate-font-variant-caps': {
      fn: property('font-variant-caps'),
      type: ['any'],
      values: fontVariantCaps,
    },
    'animate-font-variant-east-asian': {
      fn: token('font-variant-east-asian'),
      modifiers: fontVariantEastAsianWidth,
      type: ['any'],
      values: fontVariantEastAsian,
    },
    'animate-font-variant-ligatures': {
      fn: property('font-variant-ligatures'),
      type: ['any'],
      values: fontVariantLigatures,
    },
    'animate-font-variant-numeric': {
      fn: property('font-variant-numeric'),
      type: ['any'],
      values: fontVariantNumeric,
    },
    'animate-font-variant-position': {
      fn: property('font-variant-position'),
      type: ['any'],
      values: fontVariantPosition,
    },
    'animate-font-variation-settings': {
      fn: property('font-variation-settings'),
      type: ['number', 'any'],
      values: empty.string,
    },
    'animate-font-weight': {
      fn: property('font-weight'),
      type: 'number',
      values: fontWeight,
    },
    'animate-forced-color-adjust': {
      fn: property('forced-color-adjust'),
      type: ['any'],
      values: forcedColorAdjust,
    },
    'animate-gap': {
      fn: property('gap'),
      type: ['length', 'percentage', 'any'],
      values: theme('gap'),
    },
    'animate-grid': {
      fn: property('grid'),
      type: ['any'],
      values: empty.string,
    },
    'animate-grid-auto-columns': {
      fn: property('grid-auto-columns'),
      type: ['length', 'percentage', 'any'],
      values: theme('gridAutoColumns'),
    },
    'animate-grid-auto-flow': {
      fn: token('grid-auto-flow'),
      modifiers: gridAutoFlowPacking,
      type: ['any'],
      values: gridAutoFlow,
    },
    'animate-grid-auto-rows': {
      fn: property('grid-auto-rows'),
      type: ['length', 'percentage', 'any'],
      values: theme('gridAutoRows'),
    },
    'animate-grid-column': {
      fn: property('grid-column'),
      type: ['any'],
      values: theme('gridColumn'),
    },
    'animate-grid-column-end': {
      fn: token('grid-column-end', 'prepend'),
      modifiers: 'any',
      type: ['any'],
      values: theme('gridColumnEnd'),
    },
    'animate-grid-column-start': {
      fn: token('grid-column-start', 'prepend'),
      modifiers: 'any',
      type: ['any'],
      values: theme('gridColumnStart'),
    },
    'animate-grid-row': {
      fn: property('grid-row'),
      type: ['any'],
      values: theme('gridRow'),
    },
    'animate-grid-row-end': {
      fn: token('grid-row-end', 'prepend'),
      modifiers: gridSize,
      type: ['any'],
      values: theme('gridRowEnd'),
    },
    'animate-grid-row-start': {
      fn: token('grid-row-start', 'prepend'),
      modifiers: gridSize,
      type: ['any'],
      values: theme('gridRowStart'),
    },
    'animate-grid-template-areas': {
      fn: property('grid-template-areas'),
      type: ['any'],
      values: empty.none,
    },
    'animate-grid-template-columns': {
      fn: property('grid-template-columns'),
      type: ['any'],
      values: theme('gridTemplateColumns'),
    },
    'animate-grid-template-rows': {
      fn: property('grid-template-rows'),
      type: ['any'],
      values: theme('gridTemplateRows'),
    },
    'animate-hanging-punctuation': {
      fn: property('hanging-punctuation'),
      type: ['any'],
      values: hangingPunctuation,
    },
    'animate-height': {
      fn: property('height'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('height'),
    },
    'animate-hyphenate-character': {
      fn: property('hyphenate-character'),
      type: ['any'],
      values: empty.auto,
    },
    'animate-hyphenate-limit-chars': {
      fn: property('hyphenate-limit-chars'),
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphenate-limit-chars-minimum-characters-after': {
      fn: property('hyphenate-limit-chars', ['hyphenate-limit-chars-minimum-characters-after']),
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphenate-limit-chars-minimum-characters-before': {
      fn: property('hyphenate-limit-chars', ['hyphenate-limit-chars-minimum-characters-before']),
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphenate-limit-chars-minimum-word-length': {
      fn: property('hyphenate-limit-chars', ['hyphenate-limit-chars-minimum-word-length']),
      type: ['number', 'any'],
      values: hyphenateLimitChars,
    },
    'animate-hyphens': {
      fn: property('hyphens'),
      type: ['any'],
      values: hyphens,
    },
    'animate-image-orientation': {
      fn: property('image-orientation'),
      type: ['angle', 'any'],
      values: imageOrientation,
    },
    'animate-image-rendering': {
      fn: property('image-rendering'),
      type: ['any'],
      values: imageRendering,
    },
    'animate-initial-letter': {
      fn: token('initial-letter'),
      modifiers: initialLetterPosition,
      type: ['number', 'integer', 'any'],
      values: initialLetter,
    },
    'animate-inline-size': {
      fn: property('inline-size'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: inlineSize,
    },
    'animate-inset': {
      fn: property('inset'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block': {
      fn: property('inset-block'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-end': {
      fn: property('inset-block-end'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-block-start': {
      fn: property('inset-block-start'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline': {
      fn: property('inset-inline'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-end': {
      fn: property('inset-inline-end'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-inset-inline-start': {
      fn: property('inset-inline-start'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-justify-content': {
      fn: property('justify-content'),
      type: ['any'],
      values: justifyContent,
    },
    'animate-justify-items': {
      fn: property('justify-items'),
      type: ['any'],
      values: justifyItems,
    },
    'animate-justify-self': {
      fn: property('justify-self'),
      type: ['any'],
      values: justifySelf,
    },
    'animate-left': {
      fn: property('left'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-letter-spacing': {
      fn: property('letter-spacing'),
      type: ['length', 'percentage'],
      values: theme('letterSpacing'),
    },
    'animate-lighting-color': {
      fn: color('lighting-color'),
      type: 'color',
      values: theme('colors'),
    },
    'animate-line-break': {
      fn: property('line-break'),
      type: ['any'],
      values: lineBreak,
    },
    'animate-line-clamp': {
      fn: property('line-clamp'),
      type: ['number', 'any'],
      values: empty.none,
    },
    'animate-line-height': {
      fn: property('line-height'),
      type: ['number', 'length', 'percentage'],
      values: theme('lineHeight'),
    },
    'animate-list-style': {
      fn: property('list-style'),
      type: ['any'],
      values: empty.none,
    },
    'animate-list-style-image': {
      fn: property('list-style-image'),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-list-style-position': {
      fn: property('list-style-position'),
      type: ['any'],
      values: listStylePosition,
    },
    'animate-list-style-type': {
      fn: property('list-style-type'),
      type: ['any'],
      values: listStyleType,
    },
    'animate-margin': {
      fn: property('margin'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-block': {
      fn: property('margin-block'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-block-end': {
      fn: property('margin-block-end'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-block-start': {
      fn: property('margin-block-start'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-bottom': {
      fn: property('margin-bottom'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-inline': {
      fn: property('margin-inline'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-inline-end': {
      fn: property('margin-inline-end'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-inline-start': {
      fn: property('margin-inline-start'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-left': {
      fn: property('margin-left'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-right': {
      fn: property('margin-right'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-margin-top': {
      fn: property('margin-top'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('margin'),
    },
    'animate-marker': {
      fn: property('marker'),
      type: ['url', 'any'],
      values: empty.none,
    },
    'animate-marker-end': {
      fn: property('marker-end'),
      type: ['url', 'any'],
      values: empty.none,
    },
    'animate-marker-mid': {
      fn: property('marker-mid'),
      type: ['url', 'any'],
      values: empty.none,
    },
    'animate-marker-start': {
      fn: property('marker-start'),
      type: ['url', 'any'],
      values: empty.none,
    },
    'animate-mask': {
      fn: property('mask'),
      type: ['any'],
      values: empty.none,
    },
    'animate-mask-border': {
      fn: property('mask-border'),
      type: ['any'],
      values: empty.none,
    },
    'animate-mask-border-mode': {
      fn: property('mask-border-mode'),
      type: ['any'],
      values: maskType,
    },
    'animate-mask-border-outset': {
      fn: property('mask-border-outset'),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-bottom': {
      fn: property('mask-border-outset', ['mask-border-outset-bottom']),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-left': {
      fn: property('mask-border-outset', ['mask-border-outset-left']),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-right': {
      fn: property('mask-border-outset', ['mask-border-outset-right']),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-top': {
      fn: property('mask-border-outset', ['mask-border-outset-top']),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-x': {
      fn: property('mask-border-outset', ['mask-border-outset-left', 'mask-border-outset-right']),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-outset-y': {
      fn: property('mask-border-outset', ['mask-border-outset-bottom', 'mask-border-outset-top']),
      supportsNegativeValues: true,
      type: 'length',
      values: theme('inset'),
    },
    'animate-mask-border-repeat': {
      fn: property('mask-border-repeat'),
      type: ['any'],
      values: maskBorderRepeat,
    },
    'animate-mask-border-slice': {
      fn: property('mask-border-slice'),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-bottom': {
      fn: property('mask-border-slice', ['mask-border-slice-bottom']),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-left': {
      fn: property('mask-border-slice', ['mask-border-slice-left']),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-right': {
      fn: property('mask-border-slice', ['mask-border-slice-right']),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-top': {
      fn: property('mask-border-slice', ['mask-border-slice-top']),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-x': {
      fn: property('mask-border-slice', ['mask-border-slice-left', 'mask-border-slice-right']),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-slice-y': {
      fn: property('mask-border-slice', ['mask-border-slice-bottom', 'mask-border-slice-top']),
      type: ['number', 'percentage', 'any'],
      values: theme('inset', maskBorderSlice),
    },
    'animate-mask-border-source': {
      fn: property('mask-border-source'),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-border-width': {
      fn: property('mask-border-width'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('borderWidth'),
    },
    'animate-mask-clip': {
      fn: property('mask-clip'),
      type: ['any'],
      values: maskClip,
    },
    'animate-mask-composite': {
      fn: property('mask-composite'),
      type: ['any'],
      values: maskComposite,
    },
    'animate-mask-image': {
      fn: property('mask-image'),
      type: ['url', 'image', 'any'],
      values: empty.none,
    },
    'animate-mask-mode': {
      fn: property('mask-mode'),
      type: ['any'],
      values: maskMode,
    },
    'animate-mask-origin': {
      fn: property('mask-origin'),
      type: ['any'],
      values: maskOrigin,
    },
    'animate-mask-position': {
      fn: property('mask-position'),
      type: ['length', 'percentage', 'position'],
      values: theme('backgroundPosition'),
    },
    'animate-mask-repeat': {
      fn: property('mask-repeat'),
      type: ['any'],
      values: backgroundRepeat,
    },
    'animate-mask-size': {
      fn: property('mask-size'),
      type: ['length', 'percentage'],
      values: theme('backgroundSize'),
    },
    'animate-mask-type': {
      fn: property('mask-type'),
      type: ['any'],
      values: maskType,
    },
    'animate-math-depth': {
      fn: property('math-depth'),
      supportsNegativeValues: true,
      type: 'integer',
      values: mathDepth,
    },
    'animate-math-depth-add': {
      fn: property('math-depth', [['math-depth-add', value => css('add', value)]]),
      supportsNegativeValues: true,
      type: 'integer',
      values: empty.number,
    },
    'animate-math-style': {
      fn: property('math-style'),
      type: ['any'],
      values: mathStyle,
    },
    'animate-max-block-size': {
      fn: property('max-block-size'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-height': {
      fn: property('max-height'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxHeight'),
    },
    'animate-max-inline-size': {
      fn: property('max-inline-size'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-max-width': {
      fn: property('max-width'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('maxWidth'),
    },
    'animate-min-block-size': {
      fn: property('min-block-size'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-height': {
      fn: property('min-height'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minHeight'),
    },
    'animate-min-inline-size': {
      fn: property('min-inline-size'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-min-width': {
      fn: property('min-width'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('minWidth'),
    },
    'animate-mix-blend-mode': {
      fn: property('mix-blend-mode'),
      type: ['any'],
      values: mixBlendMode,
    },
    'animate-object-fit': {
      fn: property('object-fit'),
      type: ['any'],
      values: objectFit,
    },
    'animate-object-position': {
      fn: property('object-position'),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition'),
    },
    'animate-object-position-x': {
      fn: property('object-position', ['object-position-x']),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-x-edge': {
      fn: property('object-position', ['object-position-x-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-x-offset': {
      fn: property('object-position', ['object-position-x-offset']),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-object-position-y': {
      fn: property('object-position', ['object-position-y']),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-object-position-y-edge': {
      fn: property('object-position', ['object-position-y-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-object-position-y-offset': {
      fn: property('object-position', ['object-position-y-offset']),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset': {
      fn: property('offset'),
      type: ['length', 'percentage', 'position', 'any'],
      values: offsetAnchor,
    },
    'animate-offset-anchor': {
      fn: property('offset-anchor'),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', empty.auto),
    },
    'animate-offset-anchor-x': {
      fn: property('offset-anchor', ['offset-anchor-x']),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-x-edge': {
      fn: property('offset-anchor', ['offset-anchor-x-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-x-offset': {
      fn: property('offset-anchor', ['offset-anchor-x-offset']),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-anchor-y': {
      fn: property('offset-anchor', ['offset-anchor-y']),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-anchor-y-edge': {
      fn: property('offset-anchor', ['offset-anchor-y-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-anchor-y-offset': {
      fn: property('offset-anchor', ['offset-anchor-y-offset']),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-distance': {
      fn: property('offset-distance'),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-path': {
      fn: property('offset-path'),
      type: ['any'],
      values: offsetPath,
    },
    'animate-offset-position': {
      fn: property('offset-position'),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('objectPosition', offsetPosition),
    },
    'animate-offset-position-x': {
      fn: property('offset-position', ['offset-position-x']),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-x-edge': {
      fn: property('offset-position', ['offset-position-x-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-x-offset': {
      fn: property('offset-position', ['offset-position-x-offset']),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-position-y': {
      fn: property('offset-position', ['offset-position-y']),
      type: ['length', 'percentage', 'position'],
      values: empty.position,
    },
    'animate-offset-position-y-edge': {
      fn: property('offset-position', ['offset-position-y-edge']),
      type: 'position',
      values: objectPosition,
    },
    'animate-offset-position-y-offset': {
      fn: property('offset-position', ['offset-position-y-offset']),
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animate-offset-rotate': {
      fn: property('offset-rotate'),
      type: ['angle', 'any'],
      values: theme('rotate', offsetRotate),
    },
    'animate-opacity': {
      fn: property('opacity'),
      type: ['number', 'percentage'],
      values: theme('opacity'),
    },
    'animate-order': {
      fn: property('order'),
      supportsNegativeValues: true,
      type: 'integer',
      values: theme('order'),
    },
    'animate-orphans': {
      fn: property('orphans'),
      type: 'integer',
      values: empty.number,
    },
    'animate-outline': {
      fn: color('outline'),
      type: ['line-width', 'length', 'color', 'any'],
      values: empty.none,
    },
    'animate-outline-color': {
      fn: color('outline', ['outline-color']),
      type: 'color',
      values: theme('outlineColor'),
    },
    'animate-outline-offset': {
      fn: property('outline', ['outline-offset']),
      type: 'length',
      values: theme('outlineOffset'),
    },
    'animate-outline-style': {
      fn: property('outline', ['outline-style']),
      type: ['any'],
      values: outlineStyle,
    },
    'animate-outline-width': {
      fn: property('outline', ['outline-width']),
      type: ['line-width'],
      values: theme('outlineWidth'),
    },
    'animate-overflow': {
      fn: property('overflow'),
      type: ['any'],
      values: overflow,
    },
    'animate-overflow-anchor': {
      fn: property('overflow-anchor'),
      type: ['any'],
      values: overflowAnchor,
    },
    'animate-overflow-block': {
      fn: property('overflow-block'),
      type: ['any'],
      values: overflow,
    },
    'animate-overflow-clip-margin': {
      fn: property('overflow-clip-margin'),
      supportsNegativeValues: true,
      type: ['length', 'any'],
      values: overflowClipMargin,
    },
    'animate-overflow-inline': {
      fn: property('overflow-inline'),
      type: ['any'],
      values: overflow,
    },
    'animate-overflow-wrap': {
      fn: property('overflow-wrap'),
      type: ['any'],
      values: overflowWrap,
    },
    'animate-overflow-x': {
      fn: property('overflow', ['overflow-x']),
      type: ['any'],
      values: overflow,
    },
    'animate-overflow-y': {
      fn: property('overflow', ['overflow-y']),
      type: ['any'],
      values: overflow,
    },
    'animate-overscroll-behavior': {
      fn: property('overscroll-behavior'),
      type: ['any'],
      values: empty.auto,
    },
    'animate-overscroll-behavior-block': {
      fn: property('overscroll-behavior-block'),
      type: ['any'],
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-inline': {
      fn: property('overscroll-behavior-inline'),
      type: ['any'],
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-x': {
      fn: property('overscroll-behavior-x'),
      type: ['any'],
      values: overscrollBehavior,
    },
    'animate-overscroll-behavior-y': {
      fn: property('overscroll-behavior-y'),
      type: ['any'],
      values: overscrollBehavior,
    },
    'animate-padding': {
      fn: property('padding'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-block': {
      fn: property('padding-block'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-block-end': {
      fn: property('padding-block-end'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-block-start': {
      fn: property('padding-block-start'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-bottom': {
      fn: property('padding-bottom'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-inline': {
      fn: property('padding-inline'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-inline-end': {
      fn: property('padding-inline-end'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-inline-start': {
      fn: property('padding-inline-start'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-left': {
      fn: property('padding-left'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-right': {
      fn: property('padding-right'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-padding-top': {
      fn: property('padding-top'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('padding'),
    },
    'animate-page': {
      fn: property('page'),
      type: ['any'],
      values: empty.auto,
    },
    'animate-paint-order': {
      fn: property('paint-order'),
      type: ['any'],
      values: paintOrder,
    },
    'animate-position': {
      fn: property('position'),
      type: ['any'],
      values: position,
    },
    'animate-right': {
      fn: property('right'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-rotate': {
      fn: property('rotate'),
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('rotate'),
    },
    'animate-rotate-3d': {
      fn: property('transform', [['rotate-3d', args('rotate3d')]]),
      type: ['angle', 'number', 'any'],
      values: empty.string,
    },
    'animate-rotate-angle': {
      fn: property('rotate', ['rotate-angle']),
      supportsNegativeValues: true,
      type: 'angle',
      values: theme('rotate'),
    },
    'animate-rotate-x': {
      fn: property('rotate', ['rotate-x']),
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-y': {
      fn: property('rotate', ['rotate-y']),
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-rotate-z': {
      fn: property('rotate', ['rotate-z']),
      supportsNegativeValues: true,
      type: 'number',
      values: rotate,
    },
    'animate-row-gap': {
      fn: property('gap', ['row-gap']),
      type: ['length', 'percentage', 'any'],
      values: empty.number,
    },
    'animate-scale': {
      fn: property('scale'),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-x': {
      fn: property('scale', ['scale-x']),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-y': {
      fn: property('scale', ['scale-y']),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-scale-z': {
      fn: property('scale', ['scale-z']),
      supportsNegativeValues: true,
      type: 'number',
      values: theme('scale'),
    },
    'animate-skew': {
      fn: property('transform', [['skew', args('skew')]]),
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('skew'),
    },
    'animate-skew-x': {
      fn: property('transform', ['skew-x']),
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('skew'),
    },
    'animate-skew-y': {
      fn: property('transform', ['skew-y']),
      supportsNegativeValues: true,
      type: ['angle', 'any'],
      values: theme('skew'),
    },
    'animate-stroke': {
      fn: color('stroke', [], { paint: true }),
      type: ['color', 'url', 'any'],
      values: theme('colors', stroke),
    },
    'animate-stroke-width': {
      fn: property('stroke-width'),
      type: ['length', 'percentage', 'number', 'any'],
      values: theme('strokeWidth'),
    },
    'animate-text-align': {
      fn: property('text-align'),
      type: ['any'],
      values: textAlign,
    },
    'animate-text-shadow': {
      fn: property('text-shadow'),
      type: ['length', 'shadow', 'any'],
      values: theme('dropShadow'),
    },
    'animate-text-shadow-blur': {
      fn: property('text-shadow', ['text-shadow-blur-radius']),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('blur'),
    },
    'animate-text-shadow-color': {
      fn: color('text-shadow', ['text-shadow-color']),
      type: 'color',
      values: theme('boxShadowColor'),
    },
    'animate-text-shadow-offset-x': {
      fn: property('text-shadow', ['text-shadow-offset-x']),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-text-shadow-offset-y': {
      fn: property('text-shadow', ['text-shadow-offset-y']),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('outlineOffset'),
    },
    'animate-top': {
      fn: property('top'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('inset', inset),
    },
    'animate-transform': {
      fn: property('transform'),
      type: ['any'],
      values: empty.string,
    },
    'animate-transform-origin': {
      fn: property('transform-origin'),
      type: ['length', 'percentage', 'position', 'any'],
      values: theme('transformOrigin'),
    },
    'animate-transform-origin-x': {
      fn: property('transform-origin', ['transform-origin-x']),
      type: ['length', 'percentage', 'position'],
      values: originX,
    },
    'animate-transform-origin-y': {
      fn: property('transform-origin', ['transform-origin-y']),
      type: ['length', 'percentage', 'position'],
      values: originY,
    },
    'animate-transform-origin-z': {
      fn: property('transform-origin', ['transform-origin-z']),
      supportsNegativeValues: true,
      type: ['length'],
      values: empty.number,
    },
    'animate-transform-style': {
      fn: property('transform', ['transform-style']),
      type: ['any'],
      values: transformStyle,
    },
    'animate-translate': {
      fn: property('translate'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('translate'),
    },
    'animate-translate-3d': {
      fn: property('transform', [['translate-3d', args('translate3d')]]),
      type: ['length', 'percentage', 'any'],
      values: empty.string,
    },
    'animate-translate-x': {
      fn: property('translate', ['translate-x']),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-y': {
      fn: property('translate', ['translate-y']),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-translate-z': {
      fn: property('translate', ['translate-z']),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: theme('translate'),
    },
    'animate-visibility': {
      fn: property('visibility'),
      type: ['any'],
      values: visibility,
    },
    'animate-width': {
      fn: property('width'),
      supportsNegativeValues: true,
      type: ['length', 'percentage', 'any'],
      values: theme('width'),
    },
    'animate-x': {
      fn: property('x'),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-y': {
      fn: property('y'),
      supportsNegativeValues: true,
      type: ['length', 'percentage'],
      values: empty.number,
    },
    'animate-z-index': {
      fn: property('z-index'),
      type: ['integer', 'any'],
      values: theme('zIndex'),
    },
  }

  return matchTween
}
