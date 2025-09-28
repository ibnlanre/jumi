import type { Property } from 'csstype'

import type { StandardPropertyKeyframesCollection } from '@/types'

import { css } from '@/helpers/css'

export const propertyKeyframes: StandardPropertyKeyframesCollection = {
  '@keyframes jumi-accent-color': {
    to: {
      'accent-color': css('var', '--jumi-accent-color'),
    },
  },
  '@keyframes jumi-align-content': {
    to: {
      'align-content': css('var', '--jumi-align-content'),
    },
  },
  '@keyframes jumi-align-items': {
    to: {
      'align-items': css('var', '--jumi-align-items'),
    },
  },
  '@keyframes jumi-align-self': {
    to: {
      'align-self': css('var', '--jumi-align-self'),
    },
  },
  '@keyframes jumi-alignment-baseline': {
    to: {
      'alignment-baseline':
        css('var', '--jumi-alignment-baseline') as Property.AlignmentBaseline,
    },
  },
  '@keyframes jumi-all': {
    to: {
      all: css('var', '--jumi-all') as Property.All,
    },
  },
  '@keyframes jumi-anchor-name': {
    to: {
      'anchor-name': css('var', '--jumi-anchor-name'),
    },
  },
  '@keyframes jumi-appearance': {
    to: {
      appearance: css('var', '--jumi-appearance') as Property.Appearance,
    },
  },
  '@keyframes jumi-aspect-ratio': {
    to: {
      'aspect-ratio': css('var', '--jumi-aspect-ratio'),
    },
  },
  '@keyframes jumi-backdrop-filter': {
    to: {
      'backdrop-filter': css('var', '--jumi-backdrop-filter'),
    },
  },
  '@keyframes jumi-backface-visibility': {
    to: {
      'backface-visibility':
        css('var', '--jumi-backface-visibility') as Property.BackfaceVisibility,
    },
  },
  '@keyframes jumi-background': {
    to: {
      background: css('var', '--jumi-background'),
    },
  },
  '@keyframes jumi-background-attachment': {
    to: {
      'background-attachment': css('var', '--jumi-background-attachment'),
    },
  },
  '@keyframes jumi-background-blend-mode': {
    to: {
      'background-blend-mode': css('var', '--jumi-background-blend-mode'),
    },
  },
  '@keyframes jumi-background-clip': {
    to: {
      'background-clip': css('var', '--jumi-background-clip'),
    },
  },
  '@keyframes jumi-background-color': {
    to: {
      'background-color': css('var', '--jumi-background-color'),
    },
  },
  '@keyframes jumi-background-image': {
    to: {
      'background-image': css('var', '--jumi-background-image'),
    },
  },
  '@keyframes jumi-background-origin': {
    to: {
      'background-origin': css('var', '--jumi-background-origin'),
    },
  },
  '@keyframes jumi-background-position': {
    to: {
      'background-position': css('var', '--jumi-background-position'),
    },
  },
  '@keyframes jumi-background-position-x': {
    to: {
      'background-position-x': css('var', '--jumi-background-position-x'),
    },
  },
  '@keyframes jumi-background-position-y': {
    to: {
      'background-position-y': css('var', '--jumi-background-position-y'),
    },
  },
  '@keyframes jumi-background-repeat': {
    to: {
      'background-repeat': css('var', '--jumi-background-repeat'),
    },
  },
  '@keyframes jumi-background-size': {
    to: {
      'background-size': css('var', '--jumi-background-size'),
    },
  },
  '@keyframes jumi-block-size': {
    to: {
      'block-size': css('var', '--jumi-block-size'),
    },
  },
  '@keyframes jumi-border': {
    to: {
      border: css('var', '--jumi-border'),
    },
  },
  '@keyframes jumi-border-block': {
    to: {
      'border-block': css('var', '--jumi-border-block'),
    },
  },
  '@keyframes jumi-border-block-color': {
    to: {
      'border-block-color': css('var', '--jumi-border-block-color'),
    },
  },
  '@keyframes jumi-border-block-end': {
    to: {
      'border-block-end': css('var', '--jumi-border-block-end'),
    },
  },
  '@keyframes jumi-border-block-end-color': {
    to: {
      'border-block-end-color': css('var', '--jumi-border-block-end-color'),
    },
  },
  '@keyframes jumi-border-block-end-style': {
    to: {
      'border-block-end-style': css('var', '--jumi-border-block-end-style') as Property.BorderBlockEndStyle,
    },
  },
  '@keyframes jumi-border-block-end-width': {
    to: {
      'border-block-end-width': css('var', '--jumi-border-block-end-width'),
    },
  },
  '@keyframes jumi-border-block-start': {
    to: {
      'border-block-start': css('var', '--jumi-border-block-start'),
    },
  },
  '@keyframes jumi-border-block-start-color': {
    to: {
      'border-block-start-color': css('var', '--jumi-border-block-start-color'),
    },
  },
  '@keyframes jumi-border-block-start-style': {
    to: {
      'border-block-start-style': css('var', '--jumi-border-block-start-style') as Property.BorderBlockStartStyle,
    },
  },
  '@keyframes jumi-border-block-start-width': {
    to: {
      'border-block-start-width': css('var', '--jumi-border-block-start-width'),
    },
  },
  '@keyframes jumi-border-block-style': {
    to: {
      'border-block-style': css('var', '--jumi-border-block-style') as Property.BorderBlockStyle,
    },
  },
  '@keyframes jumi-border-block-width': {
    to: {
      'border-block-width': css('var', '--jumi-border-block-width'),
    },
  },
  '@keyframes jumi-border-bottom': {
    to: {
      'border-bottom': css('var', '--jumi-border-bottom'),
    },
  },
  '@keyframes jumi-border-bottom-color': {
    to: {
      'border-bottom-color': css('var', '--jumi-border-bottom-color'),
    },
  },
  '@keyframes jumi-border-bottom-left-radius': {
    to: {
      'border-bottom-left-radius': css('var', '--jumi-border-bottom-left-radius'),
    },
  },
  '@keyframes jumi-border-bottom-right-radius': {
    to: {
      'border-bottom-right-radius': css('var', '--jumi-border-bottom-right-radius'),
    },
  },
  '@keyframes jumi-border-bottom-style': {
    to: {
      'border-bottom-style': css('var', '--jumi-border-bottom-style') as Property.BorderBottomStyle,
    },
  },
  '@keyframes jumi-border-bottom-width': {
    to: {
      'border-bottom-width': css('var', '--jumi-border-bottom-width'),
    },
  },
  '@keyframes jumi-border-collapse': {
    to: {
      'border-collapse': css('var', '--jumi-border-collapse') as Property.BorderCollapse,
    },
  },
  '@keyframes jumi-border-color': {
    to: {
      'border-color': css('var', '--jumi-border-color'),
    },
  },
  '@keyframes jumi-border-end-end-radius': {
    to: {
      'border-end-end-radius': css('var', '--jumi-border-end-end-radius'),
    },
  },
  '@keyframes jumi-border-end-start-radius': {
    to: {
      'border-end-start-radius': css('var', '--jumi-border-end-start-radius'),
    },
  },
  '@keyframes jumi-border-image': {
    to: {
      'border-image': css('var', '--jumi-border-image'),
    },
  },
  '@keyframes jumi-border-image-outset': {
    to: {
      'border-image-outset': css('var', '--jumi-border-image-outset'),
    },
  },
  '@keyframes jumi-border-image-repeat': {
    to: {
      'border-image-repeat': css('var', '--jumi-border-image-repeat'),
    },
  },
  '@keyframes jumi-border-image-slice': {
    to: {
      'border-image-slice': css('var', '--jumi-border-image-slice'),
    },
  },
  '@keyframes jumi-border-image-source': {
    to: {
      'border-image-source': css('var', '--jumi-border-image-source'),
    },
  },
  '@keyframes jumi-border-image-width': {
    to: {
      'border-image-width': css('var', '--jumi-border-image-width'),
    },
  },
  '@keyframes jumi-border-inline': {
    to: {
      'border-inline': css('var', '--jumi-border-inline'),
    },
  },
  '@keyframes jumi-border-inline-color': {
    to: {
      'border-inline-color': css('var', '--jumi-border-inline-color'),
    },
  },
  '@keyframes jumi-border-inline-end': {
    to: {
      'border-inline-end': css('var', '--jumi-border-inline-end'),
    },
  },
  '@keyframes jumi-border-inline-end-color': {
    to: {
      'border-inline-end-color': css('var', '--jumi-border-inline-end-color'),
    },
  },
  '@keyframes jumi-border-inline-end-style': {
    to: {
      'border-inline-end-style': css('var', '--jumi-border-inline-end-style') as Property.BorderInlineEndStyle,
    },
  },
  '@keyframes jumi-border-inline-end-width': {
    to: {
      'border-inline-end-width': css('var', '--jumi-border-inline-end-width'),
    },
  },
  '@keyframes jumi-border-inline-start': {
    to: {
      'border-inline-start': css('var', '--jumi-border-inline-start'),
    },
  },
  '@keyframes jumi-border-inline-start-color': {
    to: {
      'border-inline-start-color': css('var', '--jumi-border-inline-start-color'),
    },
  },
  '@keyframes jumi-border-inline-start-style': {
    to: {
      'border-inline-start-style': css('var', '--jumi-border-inline-start-style') as Property.BorderInlineStartStyle,
    },
  },
  '@keyframes jumi-border-inline-start-width': {
    to: {
      'border-inline-start-width': css('var', '--jumi-border-inline-start-width'),
    },
  },
  '@keyframes jumi-border-inline-style': {
    to: {
      'border-inline-style': css('var', '--jumi-border-inline-style') as Property.BorderInlineStyle,
    },
  },
  '@keyframes jumi-border-inline-width': {
    to: {
      'border-inline-width': css('var', '--jumi-border-inline-width'),
    },
  },
  '@keyframes jumi-border-left': {
    to: {
      'border-left': css('var', '--jumi-border-left'),
    },
  },
  '@keyframes jumi-border-left-color': {
    to: {
      'border-left-color': css('var', '--jumi-border-left-color'),
    },
  },
  '@keyframes jumi-border-left-style': {
    to: {
      'border-left-style': css('var', '--jumi-border-left-style') as Property.BorderLeftStyle,
    },
  },
  '@keyframes jumi-border-left-width': {
    to: {
      'border-left-width': css('var', '--jumi-border-left-width'),
    },
  },
  '@keyframes jumi-border-radius': {
    to: {
      'border-radius': css('var', '--jumi-border-radius'),
    },
  },
  '@keyframes jumi-border-right': {
    to: {
      'border-right': css('var', '--jumi-border-right'),
    },
  },
  '@keyframes jumi-border-right-color': {
    to: {
      'border-right-color': css('var', '--jumi-border-right-color'),
    },
  },
  '@keyframes jumi-border-right-style': {
    to: {
      'border-right-style': css('var', '--jumi-border-right-style') as Property.BorderRightStyle,
    },
  },
  '@keyframes jumi-border-right-width': {
    to: {
      'border-right-width': css('var', '--jumi-border-right-width'),
    },
  },
  '@keyframes jumi-border-spacing': {
    to: {
      'border-spacing': css('var', '--jumi-border-spacing'),
    },
  },
  '@keyframes jumi-border-start-end-radius': {
    to: {
      'border-start-end-radius': css('var', '--jumi-border-start-end-radius'),
    },
  },
  '@keyframes jumi-border-start-start-radius': {
    to: {
      'border-start-start-radius': css('var', '--jumi-border-start-start-radius'),
    },
  },
  '@keyframes jumi-border-style': {
    to: {
      'border-style': css('var', '--jumi-border-style'),
    },
  },
  '@keyframes jumi-border-top': {
    to: {
      'border-top': css('var', '--jumi-border-top'),
    },
  },
  '@keyframes jumi-border-top-color': {
    to: {
      'border-top-color': css('var', '--jumi-border-top-color'),
    },
  },
  '@keyframes jumi-border-top-left-radius': {
    to: {
      'border-top-left-radius': css('var', '--jumi-border-top-left-radius'),
    },
  },
  '@keyframes jumi-border-top-right-radius': {
    to: {
      'border-top-right-radius': css('var', '--jumi-border-top-right-radius'),
    },
  },
  '@keyframes jumi-border-top-style': {
    to: {
      'border-top-style': css('var', '--jumi-border-top-style') as Property.BorderTopStyle,
    },
  },
  '@keyframes jumi-border-top-width': {
    to: {
      'border-top-width': css('var', '--jumi-border-top-width'),
    },
  },
  '@keyframes jumi-border-width': {
    to: {
      'border-width': css('var', '--jumi-border-width'),
    },
  },
  '@keyframes jumi-bottom': {
    to: {
      bottom: css('var', '--jumi-bottom'),
    },
  },
  '@keyframes jumi-box-decoration-break': {
    to: {
      'box-decoration-break': css('var', '--jumi-box-decoration-break') as Property.BoxDecorationBreak,
    },
  },
  '@keyframes jumi-box-shadow': {
    to: {
      'box-shadow': css('var', '--jumi-box-shadow'),
    },
  },
  '@keyframes jumi-box-sizing': {
    to: {
      'box-sizing': css('var', '--jumi-box-sizing') as Property.BoxSizing,
    },
  },
  '@keyframes jumi-break-after': {
    to: {
      'break-after': css('var', '--jumi-break-after') as Property.BreakAfter,
    },
  },
  '@keyframes jumi-break-before': {
    to: {
      'break-before': css('var', '--jumi-break-before') as Property.BreakBefore,
    },
  },
  '@keyframes jumi-break-inside': {
    to: {
      'break-inside': css('var', '--jumi-break-inside') as Property.BreakInside,
    },
  },
  '@keyframes jumi-caption-side': {
    to: {
      'caption-side': css('var', '--jumi-caption-side') as Property.CaptionSide,
    },
  },
  '@keyframes jumi-caret-color': {
    to: {
      'caret-color': css('var', '--jumi-caret-color'),
    },
  },
  '@keyframes jumi-clear': {
    to: {
      clear: css('var', '--jumi-clear') as Property.Clear,
    },
  },
  '@keyframes jumi-clip-path': {
    to: {
      'clip-path': css('var', '--jumi-clip-path'),
    },
  },
  '@keyframes jumi-clip-rule': {
    to: {
      'clip-rule': css('var', '--jumi-clip-rule') as Property.ClipRule,
    },
  },
  '@keyframes jumi-color': {
    to: {
      color: css('var', '--jumi-color'),
    },
  },
  '@keyframes jumi-color-interpolation': {
    to: {
      'color-interpolation': css('var', '--jumi-color-interpolation') as Property.ColorInterpolation,
    },
  },
  '@keyframes jumi-color-interpolation-filters': {
    to: {
      'color-interpolation-filters': css('var', '--jumi-color-interpolation-filters'),
    },
  },
  '@keyframes jumi-color-scheme': {
    to: {
      'color-scheme': css('var', '--jumi-color-scheme'),
    },
  },
  '@keyframes jumi-column-count': {
    to: {
      'column-count': css('var', '--jumi-column-count') as Property.ColumnCount,
    },
  },
  '@keyframes jumi-column-fill': {
    to: {
      'column-fill': css('var', '--jumi-column-fill') as Property.ColumnFill,
    },
  },
  '@keyframes jumi-column-gap': {
    to: {
      'column-gap': css('var', '--jumi-column-gap'),
    },
  },
  '@keyframes jumi-column-rule': {
    to: {
      'column-rule': css('var', '--jumi-column-rule'),
    },
  },
  '@keyframes jumi-column-rule-color': {
    to: {
      'column-rule-color': css('var', '--jumi-column-rule-color'),
    },
  },
  '@keyframes jumi-column-rule-style': {
    to: {
      'column-rule-style': css('var', '--jumi-column-rule-style') as Property.ColumnRuleStyle,
    },
  },
  '@keyframes jumi-column-rule-width': {
    to: {
      'column-rule-width': css('var', '--jumi-column-rule-width'),
    },
  },
  '@keyframes jumi-column-span': {
    to: {
      'column-span': css('var', '--jumi-column-span') as Property.ColumnSpan,
    },
  },
  '@keyframes jumi-column-width': {
    to: {
      'column-width': css('var', '--jumi-column-width'),
    },
  },
  '@keyframes jumi-columns': {
    to: {
      columns: css('var', '--jumi-columns'),
    },
  },
  '@keyframes jumi-contain': {
    to: {
      contain: css('var', '--jumi-contain'),
    },
  },
  '@keyframes jumi-contain-intrinsic-block-size': {
    to: {
      'contain-intrinsic-block-size': css('var', '--jumi-contain-intrinsic-block-size'),
    },
  },
  '@keyframes jumi-contain-intrinsic-height': {
    to: {
      'contain-intrinsic-height': css('var', '--jumi-contain-intrinsic-height'),
    },
  },
  '@keyframes jumi-contain-intrinsic-inline-size': {
    to: {
      'contain-intrinsic-inline-size': css('var', '--jumi-contain-intrinsic-inline-size'),
    },
  },
  '@keyframes jumi-contain-intrinsic-size': {
    to: {
      'contain-intrinsic-size': css('var', '--jumi-contain-intrinsic-size'),
    },
  },
  '@keyframes jumi-contain-intrinsic-width': {
    to: {
      'contain-intrinsic-width': css('var', '--jumi-contain-intrinsic-width'),
    },
  },
  '@keyframes jumi-container-type': {
    to: {
      'container-type': css('var', '--jumi-container-type') as Property.ContainerType,
    },
  },
  '@keyframes jumi-content': {
    to: {
      content: css('var', '--jumi-content'),
    },
  },
  '@keyframes jumi-content-visibility': {
    to: {
      'content-visibility': css('var', '--jumi-content-visibility') as Property.ContentVisibility,
    },
  },
  '@keyframes jumi-counter-increment': {
    to: {
      'counter-increment': css('var', '--jumi-counter-increment'),
    },
  },
  '@keyframes jumi-counter-reset': {
    to: {
      'counter-reset': css('var', '--jumi-counter-reset'),
    },
  },
  '@keyframes jumi-counter-set': {
    to: {
      'counter-set': css('var', '--jumi-counter-set'),
    },
  },
  '@keyframes jumi-cursor': {
    to: {
      cursor: css('var', '--jumi-cursor'),
    },
  },
  '@keyframes jumi-cx': {
    to: {
      cx: css('var', '--jumi-cx'),
    },
  },
  '@keyframes jumi-cy': {
    to: {
      cy: css('var', '--jumi-cy'),
    },
  },
  '@keyframes jumi-d': {
    to: {
      d: css('var', '--jumi-d'),
    },
  },
  '@keyframes jumi-display': {
    to: {
      display: css('var', '--jumi-display') as Property.Display,
    },
  },
  '@keyframes jumi-dominant-baseline': {
    to: {
      'dominant-baseline': css('var', '--jumi-dominant-baseline') as Property.DominantBaseline,
    },
  },
  '@keyframes jumi-empty-cells': {
    to: {
      'empty-cells': css('var', '--jumi-empty-cells') as Property.EmptyCells,
    },
  },
  '@keyframes jumi-fill': {
    to: {
      fill: css('var', '--jumi-fill'),
    },
  },
  '@keyframes jumi-fill-opacity': {
    to: {
      'fill-opacity': css('var', '--jumi-fill-opacity'),
    },
  },
  '@keyframes jumi-fill-rule': {
    to: {
      'fill-rule': css('var', '--jumi-fill-rule') as Property.FillRule,
    },
  },
  '@keyframes jumi-filter': {
    to: {
      filter: css('var', '--jumi-filter'),
    },
  },
  '@keyframes jumi-flex': {
    to: {
      flex: css('var', '--jumi-flex'),
    },
  },
  '@keyframes jumi-flex-basis': {
    to: {
      'flex-basis': css('var', '--jumi-flex-basis'),
    },
  },
  '@keyframes jumi-flex-direction': {
    to: {
      'flex-direction': css('var', '--jumi-flex-direction') as Property.FlexDirection,
    },
  },
  '@keyframes jumi-flex-flow': {
    to: {
      'flex-flow': css('var', '--jumi-flex-flow'),
    },
  },
  '@keyframes jumi-flex-grow': {
    to: {
      'flex-grow': css('var', '--jumi-flex-grow'),
    },
  },
  '@keyframes jumi-flex-shrink': {
    to: {
      'flex-shrink': css('var', '--jumi-flex-shrink'),
    },
  },
  '@keyframes jumi-flex-wrap': {
    to: {
      'flex-wrap': css('var', '--jumi-flex-wrap') as Property.FlexWrap,
    },
  },
  '@keyframes jumi-float': {
    to: {
      float: css('var', '--jumi-float') as Property.Float,
    },
  },
  '@keyframes jumi-flood-color': {
    to: {
      'flood-color': css('var', '--jumi-flood-color'),
    },
  },
  '@keyframes jumi-flood-opacity': {
    to: {
      'flood-opacity': css('var', '--jumi-flood-opacity'),
    },
  },
  '@keyframes jumi-font': {
    to: {
      font: css('var', '--jumi-font'),
    },
  },
  '@keyframes jumi-font-family': {
    to: {
      'font-family': css('var', '--jumi-font-family'),
    },
  },
  '@keyframes jumi-font-feature-settings': {
    to: {
      'font-feature-settings': css('var', '--jumi-font-feature-settings'),
    },
  },
  '@keyframes jumi-font-kerning': {
    to: {
      'font-kerning': css('var', '--jumi-font-kerning') as Property.FontKerning,
    },
  },
  '@keyframes jumi-font-language-override': {
    to: {
      'font-language-override': css('var', '--jumi-font-language-override'),
    },
  },
  '@keyframes jumi-font-optical-sizing': {
    to: {
      'font-optical-sizing': css('var', '--jumi-font-optical-sizing') as Property.FontOpticalSizing,
    },
  },
  '@keyframes jumi-font-palette': {
    to: {
      'font-palette': css('var', '--jumi-font-palette'),
    },
  },
  '@keyframes jumi-font-size': {
    to: {
      'font-size': css('var', '--jumi-font-size'),
    },
  },
  '@keyframes jumi-font-size-adjust': {
    to: {
      'font-size-adjust': css('var', '--jumi-font-size-adjust'),
    },
  },
  '@keyframes jumi-font-style': {
    to: {
      'font-style': css('var', '--jumi-font-style'),
    },
  },
  '@keyframes jumi-font-synthesis': {
    to: {
      'font-synthesis': css('var', '--jumi-font-synthesis'),
    },
  },
  '@keyframes jumi-font-synthesis-small-caps': {
    to: {
      'font-synthesis-small-caps': css('var', '--jumi-font-synthesis-small-caps') as Property.FontSynthesisSmallCaps,
    },
  },
  '@keyframes jumi-font-synthesis-style': {
    to: {
      'font-synthesis-style': css('var', '--jumi-font-synthesis-style') as Property.FontSynthesisStyle,
    },
  },
  '@keyframes jumi-font-synthesis-weight': {
    to: {
      'font-synthesis-weight': css('var', '--jumi-font-synthesis-weight') as Property.FontSynthesisWeight,
    },
  },
  '@keyframes jumi-font-variant': {
    to: {
      'font-variant': css('var', '--jumi-font-variant'),
    },
  },
  '@keyframes jumi-font-variant-alternates': {
    to: {
      'font-variant-alternates': css('var', '--jumi-font-variant-alternates'),
    },
  },
  '@keyframes jumi-font-variant-caps': {
    to: {
      'font-variant-caps': css('var', '--jumi-font-variant-caps') as Property.FontVariantCaps,
    },
  },
  '@keyframes jumi-font-variant-east-asian': {
    to: {
      'font-variant-east-asian': css('var', '--jumi-font-variant-east-asian'),
    },
  },
  '@keyframes jumi-font-variant-emoji': {
    to: {
      'font-variant-emoji': css('var', '--jumi-font-variant-emoji') as Property.FontVariantEmoji,
    },
  },
  '@keyframes jumi-font-variant-ligatures': {
    to: {
      'font-variant-ligatures': css('var', '--jumi-font-variant-ligatures'),
    },
  },
  '@keyframes jumi-font-variant-numeric': {
    to: {
      'font-variant-numeric': css('var', '--jumi-font-variant-numeric'),
    },
  },
  '@keyframes jumi-font-variant-position': {
    to: {
      'font-variant-position': css('var', '--jumi-font-variant-position') as Property.FontVariantPosition,
    },
  },
  '@keyframes jumi-font-variation-settings': {
    to: {
      'font-variation-settings': css('var', '--jumi-font-variation-settings'),
    },
  },
  '@keyframes jumi-font-weight': {
    to: {
      'font-weight': css('var', '--jumi-font-weight'),
    },
  },
  '@keyframes jumi-forced-color-adjust': {
    to: {
      'forced-color-adjust': css('var', '--jumi-forced-color-adjust') as Property.ForcedColorAdjust,
    },
  },
  '@keyframes jumi-gap': {
    to: {
      gap: css('var', '--jumi-gap'),
    },
  },
  '@keyframes jumi-grid': {
    to: {
      grid: css('var', '--jumi-grid'),
    },
  },
  '@keyframes jumi-grid-area': {
    to: {
      'grid-area': css('var', '--jumi-grid-area'),
    },
  },
  '@keyframes jumi-grid-auto-columns': {
    to: {
      'grid-auto-columns': css('var', '--jumi-grid-auto-columns'),
    },
  },
  '@keyframes jumi-grid-auto-flow': {
    to: {
      'grid-auto-flow': css('var', '--jumi-grid-auto-flow'),
    },
  },
  '@keyframes jumi-grid-auto-rows': {
    to: {
      'grid-auto-rows': css('var', '--jumi-grid-auto-rows'),
    },
  },
  '@keyframes jumi-grid-column': {
    to: {
      'grid-column': css('var', '--jumi-grid-column'),
    },
  },
  '@keyframes jumi-grid-column-end': {
    to: {
      'grid-column-end': css('var', '--jumi-grid-column-end'),
    },
  },
  '@keyframes jumi-grid-column-start': {
    to: {
      'grid-column-start': css('var', '--jumi-grid-column-start'),
    },
  },
  '@keyframes jumi-grid-row': {
    to: {
      'grid-row': css('var', '--jumi-grid-row'),
    },
  },
  '@keyframes jumi-grid-row-end': {
    to: {
      'grid-row-end': css('var', '--jumi-grid-row-end'),
    },
  },
  '@keyframes jumi-grid-row-start': {
    to: {
      'grid-row-start': css('var', '--jumi-grid-row-start'),
    },
  },
  '@keyframes jumi-grid-template': {
    to: {
      'grid-template': css('var', '--jumi-grid-template'),
    },
  },
  '@keyframes jumi-grid-template-areas': {
    to: {
      'grid-template-areas': css('var', '--jumi-grid-template-areas'),
    },
  },
  '@keyframes jumi-grid-template-columns': {
    to: {
      'grid-template-columns': css('var', '--jumi-grid-template-columns'),
    },
  },
  '@keyframes jumi-grid-template-rows': {
    to: {
      'grid-template-rows': css('var', '--jumi-grid-template-rows'),
    },
  },
  '@keyframes jumi-hanging-punctuation': {
    to: {
      'hanging-punctuation': css('var', '--jumi-hanging-punctuation'),
    },
  },
  '@keyframes jumi-height': {
    to: {
      height: css('var', '--jumi-height'),
    },
  },
  '@keyframes jumi-hyphenate-character': {
    to: {
      'hyphenate-character': css('var', '--jumi-hyphenate-character'),
    },
  },
  '@keyframes jumi-hyphenate-limit-chars': {
    to: {
      'hyphenate-limit-chars': css('var', '--jumi-hyphenate-limit-chars'),
    },
  },
  '@keyframes jumi-hyphens': {
    to: {
      hyphens: css('var', '--jumi-hyphens') as Property.Hyphens,
    },
  },
  '@keyframes jumi-image-orientation': {
    to: {
      'image-orientation': css('var', '--jumi-image-orientation'),
    },
  },
  '@keyframes jumi-image-rendering': {
    to: {
      'image-rendering': css('var', '--jumi-image-rendering') as Property.ImageRendering,
    },
  },
  '@keyframes jumi-initial-letter': {
    to: {
      'initial-letter': css('var', '--jumi-initial-letter'),
    },
  },
  '@keyframes jumi-inline-size': {
    to: {
      'inline-size': css('var', '--jumi-inline-size'),
    },
  },
  '@keyframes jumi-inset': {
    to: {
      inset: css('var', '--jumi-inset'),
    },
  },
  '@keyframes jumi-inset-block': {
    to: {
      'inset-block': css('var', '--jumi-inset-block'),
    },
  },
  '@keyframes jumi-inset-block-end': {
    to: {
      'inset-block-end': css('var', '--jumi-inset-block-end'),
    },
  },
  '@keyframes jumi-inset-block-start': {
    to: {
      'inset-block-start': css('var', '--jumi-inset-block-start'),
    },
  },
  '@keyframes jumi-inset-inline': {
    to: {
      'inset-inline': css('var', '--jumi-inset-inline'),
    },
  },
  '@keyframes jumi-inset-inline-end': {
    to: {
      'inset-inline-end': css('var', '--jumi-inset-inline-end'),
    },
  },
  '@keyframes jumi-inset-inline-start': {
    to: {
      'inset-inline-start': css('var', '--jumi-inset-inline-start'),
    },
  },
  '@keyframes jumi-justify-content': {
    to: {
      'justify-content':
        css('var', '--jumi-justify-content'),
    },
  },
  '@keyframes jumi-justify-items': {
    to: {
      'justify-items': css('var', '--jumi-justify-items'),
    },
  },
  '@keyframes jumi-justify-self': {
    to: {
      'justify-self': css('var', '--jumi-justify-self'),
    },
  },
  '@keyframes jumi-left': {
    to: {
      left: css('var', '--jumi-left'),
    },
  },
  '@keyframes jumi-letter-spacing': {
    to: {
      'letter-spacing': css('var', '--jumi-letter-spacing'),
    },
  },
  '@keyframes jumi-lighting-color': {
    to: {
      'lighting-color': css('var', '--jumi-lighting-color'),
    },
  },
  '@keyframes jumi-line-break': {
    to: {
      'line-break': css('var', '--jumi-line-break') as Property.LineBreak,
    },
  },
  '@keyframes jumi-line-clamp': {
    to: {
      'line-clamp': css('var', '--jumi-line-clamp'),
    },
  },
  '@keyframes jumi-line-height': {
    to: {
      'line-height': css('var', '--jumi-line-height'),
    },
  },
  '@keyframes jumi-list-style': {
    to: {
      'list-style': css('var', '--jumi-list-style'),
    },
  },
  '@keyframes jumi-list-style-image': {
    to: {
      'list-style-image': css('var', '--jumi-list-style-image'),
    },
  },
  '@keyframes jumi-list-style-position': {
    to: {
      'list-style-position': css('var', '--jumi-list-style-position') as Property.ListStylePosition,
    },
  },
  '@keyframes jumi-list-style-type': {
    to: {
      'list-style-type': css('var', '--jumi-list-style-type'),
    },
  },
  '@keyframes jumi-margin': {
    to: {
      margin: css('var', '--jumi-margin'),
    },
  },
  '@keyframes jumi-margin-block': {
    to: {
      'margin-block': css('var', '--jumi-margin-block'),
    },
  },
  '@keyframes jumi-margin-block-end': {
    to: {
      'margin-block-end': css('var', '--jumi-margin-block-end'),
    },
  },
  '@keyframes jumi-margin-block-start': {
    to: {
      'margin-block-start': css('var', '--jumi-margin-block-start'),
    },
  },
  '@keyframes jumi-margin-bottom': {
    to: {
      'margin-bottom': css('var', '--jumi-margin-bottom'),
    },
  },
  '@keyframes jumi-margin-inline': {
    to: {
      'margin-inline': css('var', '--jumi-margin-inline'),
    },
  },
  '@keyframes jumi-margin-inline-end': {
    to: {
      'margin-inline-end': css('var', '--jumi-margin-inline-end'),
    },
  },
  '@keyframes jumi-margin-inline-start': {
    to: {
      'margin-inline-start': css('var', '--jumi-margin-inline-start'),
    },
  },
  '@keyframes jumi-margin-left': {
    to: {
      'margin-left': css('var', '--jumi-margin-left'),
    },
  },
  '@keyframes jumi-margin-right': {
    to: {
      'margin-right': css('var', '--jumi-margin-right'),
    },
  },
  '@keyframes jumi-margin-top': {
    to: {
      'margin-top': css('var', '--jumi-margin-top'),
    },
  },
  '@keyframes jumi-marker': {
    to: {
      marker: css('var', '--jumi-marker'),
    },
  },
  '@keyframes jumi-marker-end': {
    to: {
      'marker-end': css('var', '--jumi-marker-end'),
    },
  },
  '@keyframes jumi-marker-mid': {
    to: {
      'marker-mid': css('var', '--jumi-marker-mid'),
    },
  },
  '@keyframes jumi-marker-start': {
    to: {
      'marker-start': css('var', '--jumi-marker-start'),
    },
  },
  '@keyframes jumi-mask': {
    to: {
      mask: css('var', '--jumi-mask'),
    },
  },
  '@keyframes jumi-mask-border': {
    to: {
      'mask-border': css('var', '--jumi-mask-border'),
    },
  },
  '@keyframes jumi-mask-border-mode': {
    to: {
      'mask-border-mode': css('var', '--jumi-mask-border-mode') as Property.MaskBorderMode,
    },
  },
  '@keyframes jumi-mask-border-outset': {
    to: {
      'mask-border-outset': css('var', '--jumi-mask-border-outset'),
    },
  },
  '@keyframes jumi-mask-border-repeat': {
    to: {
      'mask-border-repeat': css('var', '--jumi-mask-border-repeat'),
    },
  },
  '@keyframes jumi-mask-border-slice': {
    to: {
      'mask-border-slice': css('var', '--jumi-mask-border-slice'),
    },
  },
  '@keyframes jumi-mask-border-source': {
    to: {
      'mask-border-source': css('var', '--jumi-mask-border-source'),
    },
  },
  '@keyframes jumi-mask-border-width': {
    to: {
      'mask-border-width': css('var', '--jumi-mask-border-width'),
    },
  },
  '@keyframes jumi-mask-clip': {
    to: {
      'mask-clip': css('var', '--jumi-mask-clip'),
    },
  },
  '@keyframes jumi-mask-composite': {
    to: {
      'mask-composite': css('var', '--jumi-mask-composite') as Property.MaskComposite,
    },
  },
  '@keyframes jumi-mask-image': {
    to: {
      'mask-image': css('var', '--jumi-mask-image'),
    },
  },
  '@keyframes jumi-mask-mode': {
    to: {
      'mask-mode': css('var', '--jumi-mask-mode') as Property.MaskMode,
    },
  },
  '@keyframes jumi-mask-origin': {
    to: {
      'mask-origin': css('var', '--jumi-mask-origin') as Property.MaskOrigin,
    },
  },
  '@keyframes jumi-mask-position': {
    to: {
      'mask-position': css('var', '--jumi-mask-position'),
    },
  },
  '@keyframes jumi-mask-repeat': {
    to: {
      'mask-repeat': css('var', '--jumi-mask-repeat'),
    },
  },
  '@keyframes jumi-mask-size': {
    to: {
      'mask-size': css('var', '--jumi-mask-size'),
    },
  },
  '@keyframes jumi-mask-type': {
    to: {
      'mask-type': css('var', '--jumi-mask-type') as Property.MaskType,
    },
  },
  '@keyframes jumi-math-depth': {
    to: {
      'math-depth': css('var', '--jumi-math-depth'),
    },
  },
  '@keyframes jumi-math-style': {
    to: {
      'math-style': css('var', '--jumi-math-style') as Property.MathStyle,
    },
  },
  '@keyframes jumi-max-block-size': {
    to: {
      'max-block-size': css('var', '--jumi-max-block-size'),
    },
  },
  '@keyframes jumi-max-height': {
    to: {
      'max-height': css('var', '--jumi-max-height'),
    },
  },
  '@keyframes jumi-max-inline-size': {
    to: {
      'max-inline-size': css('var', '--jumi-max-inline-size'),
    },
  },
  '@keyframes jumi-max-width': {
    to: {
      'max-width': css('var', '--jumi-max-width'),
    },
  },
  '@keyframes jumi-min-block-size': {
    to: {
      'min-block-size': css('var', '--jumi-min-block-size'),
    },
  },
  '@keyframes jumi-min-height': {
    to: {
      'min-height': css('var', '--jumi-min-height'),
    },
  },
  '@keyframes jumi-min-inline-size': {
    to: {
      'min-inline-size': css('var', '--jumi-min-inline-size'),
    },
  },
  '@keyframes jumi-min-width': {
    to: {
      'min-width': css('var', '--jumi-min-width'),
    },
  },
  '@keyframes jumi-mix-blend-mode': {
    to: {
      'mix-blend-mode': css('var', '--jumi-mix-blend-mode') as Property.MixBlendMode,
    },
  },
  '@keyframes jumi-object-fit': {
    to: {
      'object-fit': css('var', '--jumi-object-fit') as Property.ObjectFit,
    },
  },
  '@keyframes jumi-object-position': {
    to: {
      'object-position': css('var', '--jumi-object-position'),
    },
  },
  '@keyframes jumi-offset': {
    to: {
      offset: css('var', '--jumi-offset'),
    },
  },
  '@keyframes jumi-offset-anchor': {
    to: {
      'offset-anchor': css('var', '--jumi-offset-anchor'),
    },
  },
  '@keyframes jumi-offset-distance': {
    to: {
      'offset-distance': css('var', '--jumi-offset-distance'),
    },
  },
  '@keyframes jumi-offset-path': {
    to: {
      'offset-path': css('var', '--jumi-offset-path'),
    },
  },
  '@keyframes jumi-offset-position': {
    to: {
      'offset-position': css('var', '--jumi-offset-position'),
    },
  },
  '@keyframes jumi-offset-rotate': {
    to: {
      'offset-rotate': css('var', '--jumi-offset-rotate'),
    },
  },
  '@keyframes jumi-opacity': {
    to: {
      opacity: css('var', '--jumi-opacity'),
    },
  },
  '@keyframes jumi-order': {
    to: {
      order: css('var', '--jumi-order'),
    },
  },
  '@keyframes jumi-orphans': {
    to: {
      orphans: css('var', '--jumi-orphans'),
    },
  },
  '@keyframes jumi-outline': {
    to: {
      outline: css('var', '--jumi-outline'),
    },
  },
  '@keyframes jumi-outline-color': {
    to: {
      'outline-color': css('var', '--jumi-outline-color'),
    },
  },
  '@keyframes jumi-outline-offset': {
    to: {
      'outline-offset': css('var', '--jumi-outline-offset'),
    },
  },
  '@keyframes jumi-outline-style': {
    to: {
      'outline-style': css('var', '--jumi-outline-style'),
    },
  },
  '@keyframes jumi-outline-width': {
    to: {
      'outline-width': css('var', '--jumi-outline-width'),
    },
  },
  '@keyframes jumi-overflow': {
    to: {
      overflow: css('var', '--jumi-overflow'),
    },
  },
  '@keyframes jumi-overflow-anchor': {
    to: {
      'overflow-anchor': css('var', '--jumi-overflow-anchor') as Property.OverflowAnchor,
    },
  },
  '@keyframes jumi-overflow-block': {
    to: {
      'overflow-block': css('var', '--jumi-overflow-block') as Property.OverflowBlock,
    },
  },
  '@keyframes jumi-overflow-clip-margin': {
    to: {
      'overflow-clip-margin': css('var', '--jumi-overflow-clip-margin'),
    },
  },
  '@keyframes jumi-overflow-inline': {
    to: {
      'overflow-inline': css('var', '--jumi-overflow-inline') as Property.OverflowInline,
    },
  },
  '@keyframes jumi-overflow-wrap': {
    to: {
      'overflow-wrap': css('var', '--jumi-overflow-wrap') as Property.OverflowWrap,
    },
  },
  '@keyframes jumi-overflow-x': {
    to: {
      'overflow-x': css('var', '--jumi-overflow-x') as Property.OverflowX,
    },
  },
  '@keyframes jumi-overflow-y': {
    to: {
      'overflow-y': css('var', '--jumi-overflow-y') as Property.OverflowY,
    },
  },
  '@keyframes jumi-overscroll-behavior': {
    to: {
      'overscroll-behavior': css('var', '--jumi-overscroll-behavior'),
    },
  },
  '@keyframes jumi-overscroll-behavior-block': {
    to: {
      'overscroll-behavior-block': css('var', '--jumi-overscroll-behavior-block') as Property.OverscrollBehaviorBlock,
    },
  },
  '@keyframes jumi-overscroll-behavior-inline': {
    to: {
      'overscroll-behavior-inline': css('var', '--jumi-overscroll-behavior-inline') as Property.OverscrollBehaviorInline,
    },
  },
  '@keyframes jumi-overscroll-behavior-x': {
    to: {
      'overscroll-behavior-x': css('var', '--jumi-overscroll-behavior-x') as Property.OverscrollBehaviorX,
    },
  },
  '@keyframes jumi-overscroll-behavior-y': {
    to: {
      'overscroll-behavior-y': css('var', '--jumi-overscroll-behavior-y') as Property.OverscrollBehaviorY,
    },
  },
  '@keyframes jumi-padding': {
    to: {
      padding: css('var', '--jumi-padding'),
    },
  },
  '@keyframes jumi-padding-block': {
    to: {
      'padding-block': css('var', '--jumi-padding-block'),
    },
  },
  '@keyframes jumi-padding-block-end': {
    to: {
      'padding-block-end': css('var', '--jumi-padding-block-end'),
    },
  },
  '@keyframes jumi-padding-block-start': {
    to: {
      'padding-block-start': css('var', '--jumi-padding-block-start'),
    },
  },
  '@keyframes jumi-padding-bottom': {
    to: {
      'padding-bottom': css('var', '--jumi-padding-bottom'),
    },
  },
  '@keyframes jumi-padding-inline': {
    to: {
      'padding-inline': css('var', '--jumi-padding-inline'),
    },
  },
  '@keyframes jumi-padding-inline-end': {
    to: {
      'padding-inline-end': css('var', '--jumi-padding-inline-end'),
    },
  },
  '@keyframes jumi-padding-inline-start': {
    to: {
      'padding-inline-start': css('var', '--jumi-padding-inline-start'),
    },
  },
  '@keyframes jumi-padding-left': {
    to: {
      'padding-left': css('var', '--jumi-padding-left'),
    },
  },
  '@keyframes jumi-padding-right': {
    to: {
      'padding-right': css('var', '--jumi-padding-right'),
    },
  },
  '@keyframes jumi-padding-top': {
    to: {
      'padding-top': css('var', '--jumi-padding-top'),
    },
  },
  '@keyframes jumi-page': {
    to: {
      page: css('var', '--jumi-page'),
    },
  },
  '@keyframes jumi-paint-order': {
    to: {
      'paint-order': css('var', '--jumi-paint-order') as Property.PaintOrder,
    },
  },
  '@keyframes jumi-perspective': {
    to: {
      perspective: css('var', '--jumi-perspective'),
    },
  },
  '@keyframes jumi-perspective-origin': {
    to: {
      'perspective-origin': css('var', '--jumi-perspective-origin'),
    },
  },
  '@keyframes jumi-place-content': {
    to: {
      'place-content': css('var', '--jumi-place-content'),
    },
  },
  '@keyframes jumi-place-items': {
    to: {
      'place-items': css('var', '--jumi-place-items'),
    },
  },
  '@keyframes jumi-place-self': {
    to: {
      'place-self': css('var', '--jumi-place-self'),
    },
  },
  '@keyframes jumi-pointer-events': {
    to: {
      'pointer-events': css('var', '--jumi-pointer-events') as Property.PointerEvents,
    },
  },
  '@keyframes jumi-position': {
    to: {
      position: css('var', '--jumi-position') as Property.Position,
    },
  },
  '@keyframes jumi-position-anchor': {
    to: {
      'position-anchor': css('var', '--jumi-position-anchor'),
    },
  },
  '@keyframes jumi-position-area': {
    to: {
      'position-area': css('var', '--jumi-position-area'),
    },
  },
  '@keyframes jumi-position-try': {
    to: {
      'position-try': css('var', '--jumi-position-try'),
    },
  },
  '@keyframes jumi-position-try-fallbacks': {
    to: {
      'position-try-fallbacks': css('var', '--jumi-position-try-fallbacks'),
    },
  },
  '@keyframes jumi-position-try-order': {
    to: {
      'position-try-order': css('var', '--jumi-position-try-order'),
    },
  },
  '@keyframes jumi-print-color-adjust': {
    to: {
      'print-color-adjust': css('var', '--jumi-print-color-adjust') as Property.PrintColorAdjust,
    },
  },
  '@keyframes jumi-quotes': {
    to: {
      quotes: css('var', '--jumi-quotes'),
    },
  },
  '@keyframes jumi-r': {
    to: {
      r: css('var', '--jumi-r'),
    },
  },
  '@keyframes jumi-resize': {
    to: {
      resize: css('var', '--jumi-resize') as Property.Resize,
    },
  },
  '@keyframes jumi-right': {
    to: {
      right: css('var', '--jumi-right'),
    },
  },
  '@keyframes jumi-rotate': {
    to: {
      rotate: css('var', '--jumi-rotate'),
    },
  },
  '@keyframes jumi-row-gap': {
    to: {
      'row-gap': css('var', '--jumi-row-gap'),
    },
  },
  '@keyframes jumi-ruby-align': {
    to: {
      'ruby-align': css('var', '--jumi-ruby-align') as Property.RubyAlign,
    },
  },
  '@keyframes jumi-ruby-overhang': {
    to: {
      'ruby-overhang': css('var', '--jumi-ruby-overhang'),
    },
  },
  '@keyframes jumi-ruby-position': {
    to: {
      'ruby-position': css('var', '--jumi-ruby-position'),
    },
  },
  '@keyframes jumi-rx': {
    to: {
      rx: css('var', '--jumi-rx'),
    },
  },
  '@keyframes jumi-ry': {
    to: {
      ry: css('var', '--jumi-ry'),
    },
  },
  '@keyframes jumi-scale': {
    to: {
      scale: css('var', '--jumi-scale'),
    },
  },
  '@keyframes jumi-scroll-margin': {
    to: {
      'scroll-margin': css('var', '--jumi-scroll-margin'),
    },
  },
  '@keyframes jumi-scroll-margin-block': {
    to: {
      'scroll-margin-block': css('var', '--jumi-scroll-margin-block'),
    },
  },
  '@keyframes jumi-scroll-margin-block-end': {
    to: {
      'scroll-margin-block-end': css('var', '--jumi-scroll-margin-block-end'),
    },
  },
  '@keyframes jumi-scroll-margin-block-start': {
    to: {
      'scroll-margin-block-start': css('var', '--jumi-scroll-margin-block-start'),
    },
  },
  '@keyframes jumi-scroll-margin-bottom': {
    to: {
      'scroll-margin-bottom': css('var', '--jumi-scroll-margin-bottom'),
    },
  },
  '@keyframes jumi-scroll-margin-inline': {
    to: {
      'scroll-margin-inline': css('var', '--jumi-scroll-margin-inline'),
    },
  },
  '@keyframes jumi-scroll-margin-inline-end': {
    to: {
      'scroll-margin-inline-end': css('var', '--jumi-scroll-margin-inline-end'),
    },
  },
  '@keyframes jumi-scroll-margin-inline-start': {
    to: {
      'scroll-margin-inline-start': css('var', '--jumi-scroll-margin-inline-start'),
    },
  },
  '@keyframes jumi-scroll-margin-left': {
    to: {
      'scroll-margin-left': css('var', '--jumi-scroll-margin-left'),
    },
  },
  '@keyframes jumi-scroll-margin-right': {
    to: {
      'scroll-margin-right': css('var', '--jumi-scroll-margin-right'),
    },
  },
  '@keyframes jumi-scroll-margin-top': {
    to: {
      'scroll-margin-top': css('var', '--jumi-scroll-margin-top'),
    },
  },
  '@keyframes jumi-scroll-padding': {
    to: {
      'scroll-padding': css('var', '--jumi-scroll-padding'),
    },
  },
  '@keyframes jumi-scroll-padding-block': {
    to: {
      'scroll-padding-block': css('var', '--jumi-scroll-padding-block'),
    },
  },
  '@keyframes jumi-scroll-padding-block-end': {
    to: {
      'scroll-padding-block-end': css('var', '--jumi-scroll-padding-block-end'),
    },
  },
  '@keyframes jumi-scroll-padding-block-start': {
    to: {
      'scroll-padding-block-start': css('var', '--jumi-scroll-padding-block-start'),
    },
  },
  '@keyframes jumi-scroll-padding-bottom': {
    to: {
      'scroll-padding-bottom': css('var', '--jumi-scroll-padding-bottom'),
    },
  },
  '@keyframes jumi-scroll-padding-inline': {
    to: {
      'scroll-padding-inline': css('var', '--jumi-scroll-padding-inline'),
    },
  },
  '@keyframes jumi-scroll-padding-inline-end': {
    to: {
      'scroll-padding-inline-end': css('var', '--jumi-scroll-padding-inline-end'),
    },
  },
  '@keyframes jumi-scroll-padding-inline-start': {
    to: {
      'scroll-padding-inline-start': css('var', '--jumi-scroll-padding-inline-start'),
    },
  },
  '@keyframes jumi-scroll-padding-left': {
    to: {
      'scroll-padding-left': css('var', '--jumi-scroll-padding-left'),
    },
  },
  '@keyframes jumi-scroll-padding-right': {
    to: {
      'scroll-padding-right': css('var', '--jumi-scroll-padding-right'),
    },
  },
  '@keyframes jumi-scroll-padding-top': {
    to: {
      'scroll-padding-top': css('var', '--jumi-scroll-padding-top'),
    },
  },
  '@keyframes jumi-scroll-snap-align': {
    to: {
      'scroll-snap-align': css('var', '--jumi-scroll-snap-align'),
    },
  },
  '@keyframes jumi-scroll-snap-stop': {
    to: {
      'scroll-snap-stop': css('var', '--jumi-scroll-snap-stop') as Property.ScrollSnapStop,
    },
  },
  '@keyframes jumi-scroll-snap-type': {
    to: {
      'scroll-snap-type': css('var', '--jumi-scroll-snap-type'),
    },
  },
  '@keyframes jumi-scrollbar-color': {
    to: {
      'scrollbar-color': css('var', '--jumi-scrollbar-color'),
    },
  },
  '@keyframes jumi-scrollbar-gutter': {
    to: {
      'scrollbar-gutter': css('var', '--jumi-scrollbar-gutter'),
    },
  },
  '@keyframes jumi-scrollbar-width': {
    to: {
      'scrollbar-width': css('var', '--jumi-scrollbar-width') as Property.ScrollbarWidth,
    },
  },
  '@keyframes jumi-shape-image-threshold': {
    to: {
      'shape-image-threshold': css('var', '--jumi-shape-image-threshold'),
    },
  },
  '@keyframes jumi-shape-margin': {
    to: {
      'shape-margin': css('var', '--jumi-shape-margin'),
    },
  },
  '@keyframes jumi-shape-outside': {
    to: {
      'shape-outside': css('var', '--jumi-shape-outside'),
    },
  },
  '@keyframes jumi-shape-rendering': {
    to: {
      'shape-rendering': css('var', '--jumi-shape-rendering') as Property.ShapeRendering,
    },
  },
  '@keyframes jumi-stop-color': {
    to: {
      'stop-color': css('var', '--jumi-stop-color'),
    },
  },
  '@keyframes jumi-stop-opacity': {
    to: {
      'stop-opacity': css('var', '--jumi-stop-opacity'),
    },
  },
  '@keyframes jumi-stroke': {
    to: {
      stroke: css('var', '--jumi-stroke'),
    },
  },
  '@keyframes jumi-stroke-dasharray': {
    to: {
      'stroke-dasharray': css('var', '--jumi-stroke-dasharray'),
    },
  },
  '@keyframes jumi-stroke-dashoffset': {
    to: {
      'stroke-dashoffset': css('var', '--jumi-stroke-dashoffset'),
    },
  },
  '@keyframes jumi-stroke-linecap': {
    to: {
      'stroke-linecap': css('var', '--jumi-stroke-linecap') as Property.StrokeLinecap,
    },
  },
  '@keyframes jumi-stroke-linejoin': {
    to: {
      'stroke-linejoin': css('var', '--jumi-stroke-linejoin') as Property.StrokeLinejoin,
    },
  },
  '@keyframes jumi-stroke-miterlimit': {
    to: {
      'stroke-miterlimit': css('var', '--jumi-stroke-miterlimit'),
    },
  },
  '@keyframes jumi-stroke-opacity': {
    to: {
      'stroke-opacity': css('var', '--jumi-stroke-opacity'),
    },
  },
  '@keyframes jumi-stroke-width': {
    to: {
      'stroke-width': css('var', '--jumi-stroke-width'),
    },
  },
  '@keyframes jumi-tab-size': {
    to: {
      'tab-size': css('var', '--jumi-tab-size'),
    },
  },
  '@keyframes jumi-table-layout': {
    to: {
      'table-layout': css('var', '--jumi-table-layout') as Property.TableLayout,
    },
  },
  '@keyframes jumi-text-align': {
    to: {
      'text-align': css('var', '--jumi-text-align') as Property.TextAlign,
    },
  },
  '@keyframes jumi-text-align-last': {
    to: {
      'text-align-last': css('var', '--jumi-text-align-last') as Property.TextAlignLast,
    },
  },
  '@keyframes jumi-text-anchor': {
    to: {
      'text-anchor': css('var', '--jumi-text-anchor') as Property.TextAnchor,
    },
  },
  '@keyframes jumi-text-autospace': {
    to: {
      'text-autospace': css('var', '--jumi-text-autospace') as Property.MsTextAutospace,
    },
  },
  '@keyframes jumi-text-box': {
    to: {
      textbox: css('var', '--jumi-text-box'),
    },
  },
  '@keyframes jumi-text-box-edge': {
    to: {
      'text-box-edge': css('var', '--jumi-text-box-edge'),
    },
  },
  '@keyframes jumi-text-box-trim': {
    to: {
      'text-box-trim': css('var', '--jumi-text-box-trim'),
    },
  },
  '@keyframes jumi-text-combine-upright': {
    to: {
      'text-combine-upright': css('var', '--jumi-text-combine-upright'),
    },
  },
  '@keyframes jumi-text-decoration': {
    to: {
      'text-decoration': css('var', '--jumi-text-decoration'),
    },
  },
  '@keyframes jumi-text-decoration-color': {
    to: {
      'text-decoration-color': css('var', '--jumi-text-decoration-color'),
    },
  },
  '@keyframes jumi-text-decoration-line': {
    to: {
      'text-decoration-line': css('var', '--jumi-text-decoration-line'),
    },
  },
  '@keyframes jumi-text-decoration-skip-ink': {
    to: {
      'text-decoration-skip-ink': css('var', '--jumi-text-decoration-skip-ink') as Property.TextDecorationSkipInk,
    },
  },
  '@keyframes jumi-text-decoration-style': {
    to: {
      'text-decoration-style': css('var', '--jumi-text-decoration-style') as Property.TextDecorationStyle,
    },
  },
  '@keyframes jumi-text-decoration-thickness': {
    to: {
      'text-decoration-thickness': css('var', '--jumi-text-decoration-thickness'),
    },
  },
  '@keyframes jumi-text-emphasis': {
    to: {
      'text-emphasis': css('var', '--jumi-text-emphasis'),
    },
  },
  '@keyframes jumi-text-emphasis-color': {
    to: {
      'text-emphasis-color': css('var', '--jumi-text-emphasis-color'),
    },
  },
  '@keyframes jumi-text-emphasis-position': {
    to: {
      'text-emphasis-position': css('var', '--jumi-text-emphasis-position'),
    },
  },
  '@keyframes jumi-text-emphasis-style': {
    to: {
      'text-emphasis-style': css('var', '--jumi-text-emphasis-style'),
    },
  },
  '@keyframes jumi-text-indent': {
    to: {
      'text-indent': css('var', '--jumi-text-indent'),
    },
  },
  '@keyframes jumi-text-justify': {
    to: {
      'text-justify': css('var', '--jumi-text-justify') as Property.TextJustify,
    },
  },
  '@keyframes jumi-text-orientation': {
    to: {
      'text-orientation': css('var', '--jumi-text-orientation') as Property.TextOrientation,
    },
  },
  '@keyframes jumi-text-overflow': {
    to: {
      'text-overflow': css('var', '--jumi-text-overflow'),
    },
  },
  '@keyframes jumi-text-rendering': {
    to: {
      'text-rendering': css('var', '--jumi-text-rendering') as Property.TextRendering,
    },
  },
  '@keyframes jumi-text-shadow': {
    to: {
      'text-shadow': css('var', '--jumi-text-shadow'),
    },
  },
  '@keyframes jumi-text-transform': {
    to: {
      'text-transform': css('var', '--jumi-text-transform') as Property.TextTransform,
    },
  },
  '@keyframes jumi-text-underline-offset': {
    to: {
      'text-underline-offset': css('var', '--jumi-text-underline-offset'),
    },
  },
  '@keyframes jumi-text-underline-position': {
    to: {
      'text-underline-position': css('var', '--jumi-text-underline-position'),
    },
  },
  '@keyframes jumi-text-wrap': {
    to: {
      'text-wrap': css('var', '--jumi-text-wrap') as Property.TextWrap,
    },
  },
  '@keyframes jumi-text-wrap-mode': {
    to: {
      'text-wrap-mode': css('var', '--jumi-text-wrap-mode'),
    },
  },
  '@keyframes jumi-text-wrap-style': {
    to: {
      'text-wrap-style': css('var', '--jumi-text-wrap-style'),
    },
  },
  '@keyframes jumi-top': {
    to: {
      top: css('var', '--jumi-top'),
    },
  },
  '@keyframes jumi-transform': {
    to: {
      transform: css('var', '--jumi-transform'),
    },
  },
  '@keyframes jumi-transform-box': {
    to: {
      'transform-box': css('var', '--jumi-transform-box') as Property.TransformBox,
    },
  },
  '@keyframes jumi-transform-origin': {
    to: {
      'transform-origin': css('var', '--jumi-transform-origin'),
    },
  },
  '@keyframes jumi-transform-style': {
    to: {
      'transform-style': css('var', '--jumi-transform-style') as Property.TransformStyle,
    },
  },
  '@keyframes jumi-translate': {
    to: {
      translate: css('var', '--jumi-translate'),
    },
  },
  '@keyframes jumi-user-select': {
    to: {
      'user-select': css('var', '--jumi-user-select') as Property.UserSelect,
    },
  },
  '@keyframes jumi-vector-effect': {
    to: {
      'vector-effect': css('var', '--jumi-vector-effect') as Property.VectorEffect,
    },
  },
  '@keyframes jumi-vertical-align': {
    to: {
      'vertical-align': css('var', '--jumi-vertical-align'),
    },
  },
  '@keyframes jumi-view-timeline-inset': {
    to: {
      'view-timeline-inset': css('var', '--jumi-view-timeline-inset'),
    },
  },
  '@keyframes jumi-view-transition-class': {
    to: {
      'view-transition-class': css('var', '--jumi-view-transition-class'),
    },
  },
  '@keyframes jumi-view-transition-name': {
    to: {
      'view-transition-name': css('var', '--jumi-view-transition-name'),
    },
  },
  '@keyframes jumi-visibility': {
    to: {
      visibility: css('var', '--jumi-visibility') as Property.Visibility,
    },
  },
  '@keyframes jumi-white-space': {
    to: {
      'white-space': css('var', '--jumi-white-space'),
    },
  },
  '@keyframes jumi-white-space-collapse': {
    to: {
      'white-space-collapse': css('var', '--jumi-white-space-collapse') as Property.WhiteSpaceCollapse,
    },
  },
  '@keyframes jumi-widows': {
    to: {
      widows: css('var', '--jumi-widows'),
    },
  },
  '@keyframes jumi-width': {
    to: {
      width: css('var', '--jumi-width'),
    },
  },
  '@keyframes jumi-will-change': {
    to: {
      'will-change': css('var', '--jumi-will-change'),
    },
  },
  '@keyframes jumi-word-break': {
    to: {
      'word-break': css('var', '--jumi-word-break') as Property.WordBreak,
    },
  },
  '@keyframes jumi-word-spacing': {
    to: {
      'word-spacing': css('var', '--jumi-word-spacing'),
    },
  },
  '@keyframes jumi-writing-mode': {
    to: {
      'writing-mode': css('var', '--jumi-writing-mode') as Property.WritingMode,
    },
  },
  '@keyframes jumi-x': {
    to: {
      x: css('var', '--jumi-x'),
    },
  },
  '@keyframes jumi-y': {
    to: {
      y: css('var', '--jumi-y'),
    },
  },
  '@keyframes jumi-z-index': {
    to: {
      'z-index': css('var', '--jumi-z-index'),
    },
  },
}

type KeyframesCollection = {
  attributes: Record<string, string>
  names: string[]
}

const keyframes: KeyframesCollection = Object.keys(propertyKeyframes).reduce(
  (result, key) => {
    /** @type {[string, `jumi-${Attribute}`]} */
    const [keyframes, name] = key.split(' ')

    /** @type {`jumi-${Attribute}-keyframes`} */
    const variable = [name, keyframes.slice(1)].join('-')

    /** @type {Attribute} */
    const property = name.slice('jumi-'.length)

    result.names.push(css('var', `--${variable}`, 'none'))
    result.attributes[property] = property

    return result
  },
  { attributes: {}, names: [] } as KeyframesCollection,
)

export const animationName = keyframes.names.join(', ')
export const animationAttributes = keyframes.attributes
