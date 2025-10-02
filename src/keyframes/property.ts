import type { Property } from 'csstype'

import type { AnimatableStandardPropertyType, KeyframesVariableReference, StandardPropertyKeyframesCollection } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const propertyKeyframes: StandardPropertyKeyframesCollection = {
  'accent-color': {
    '@keyframes jumi-accent-color': {
      to: {
        'accent-color': css('var', '--jumi-accent-color'),
      },
    },
  },
  'align-content': {
    '@keyframes jumi-align-content': {
      to: {
        'align-content': css('var', '--jumi-align-content'),
      },
    },
  },
  'align-items': {
    '@keyframes jumi-align-items': {
      to: {
        'align-items': css('var', '--jumi-align-items'),
      },
    },
  },
  'align-self': {
    '@keyframes jumi-align-self': {
      to: {
        'align-self': css('var', '--jumi-align-self'),
      },
    },
  },
  'alignment-baseline': {
    '@keyframes jumi-alignment-baseline': {
      to: {
        'alignment-baseline':
        css('var', '--jumi-alignment-baseline') as Property.AlignmentBaseline,
      },
    },
  },
  'all': {
    '@keyframes jumi-all': {
      to: {
        all: css('var', '--jumi-all') as Property.All,
      },
    },
  },
  'anchor-name': {
    '@keyframes jumi-anchor-name': {
      to: {
        'anchor-name': css('var', '--jumi-anchor-name'),
      },
    },
  },
  'appearance': {
    '@keyframes jumi-appearance': {
      to: {
        appearance: css('var', '--jumi-appearance') as Property.Appearance,
      },
    },
  },
  'aspect-ratio': {
    '@keyframes jumi-aspect-ratio': {
      to: {
        'aspect-ratio': css('var', '--jumi-aspect-ratio'),
      },
    },
  },
  'backdrop-filter': {
    '@keyframes jumi-backdrop-filter': {
      to: {
        'backdrop-filter': css('var', '--jumi-backdrop-filter'),
      },
    },
  },
  'backface-visibility': {
    '@keyframes jumi-backface-visibility': {
      to: {
        'backface-visibility':
        css('var', '--jumi-backface-visibility') as Property.BackfaceVisibility,
      },
    },
  },
  'background': {
    '@keyframes jumi-background': {
      to: {
        background: css('var', '--jumi-background'),
      },
    },
  },
  'background-attachment': {
    '@keyframes jumi-background-attachment': {
      to: {
        'background-attachment': css('var', '--jumi-background-attachment'),
      },
    },
  },
  'background-blend-mode': {
    '@keyframes jumi-background-blend-mode': {
      to: {
        'background-blend-mode': css('var', '--jumi-background-blend-mode'),
      },
    },
  },
  'background-clip': {
    '@keyframes jumi-background-clip': {
      to: {
        'background-clip': css('var', '--jumi-background-clip'),
      },
    },
  },
  'background-color': {
    '@keyframes jumi-background-color': {
      to: {
        'background-color': css('var', '--jumi-background-color'),
      },
    },
  },
  'background-image': {
    '@keyframes jumi-background-image': {
      to: {
        'background-image': css('var', '--jumi-background-image'),
      },
    },
  },
  'background-origin': {
    '@keyframes jumi-background-origin': {
      to: {
        'background-origin': css('var', '--jumi-background-origin'),
      },
    },
  },
  'background-position': {
    '@keyframes jumi-background-position': {
      to: {
        'background-position': css('var', '--jumi-background-position'),
      },
    },
  },
  'background-position-x': {
    '@keyframes jumi-background-position-x': {
      to: {
        'background-position-x': css('var', '--jumi-background-position-x'),
      },
    },
  },
  'background-position-y': {
    '@keyframes jumi-background-position-y': {
      to: {
        'background-position-y': css('var', '--jumi-background-position-y'),
      },
    },
  },
  'background-repeat': {
    '@keyframes jumi-background-repeat': {
      to: {
        'background-repeat': css('var', '--jumi-background-repeat'),
      },
    },
  },
  'background-size': {
    '@keyframes jumi-background-size': {
      to: {
        'background-size': css('var', '--jumi-background-size'),
      },
    },
  },
  'block-size': {
    '@keyframes jumi-block-size': {
      to: {
        'block-size': css('var', '--jumi-block-size'),
      },
    },
  },
  'border': {
    '@keyframes jumi-border': {
      to: {
        border: css('var', '--jumi-border'),
      },
    },
  },
  'border-block': {
    '@keyframes jumi-border-block': {
      to: {
        'border-block': css('var', '--jumi-border-block'),
      },
    },
  },
  'border-block-color': {
    '@keyframes jumi-border-block-color': {
      to: {
        'border-block-color': css('var', '--jumi-border-block-color'),
      },
    },
  },
  'border-block-end': {
    '@keyframes jumi-border-block-end': {
      to: {
        'border-block-end': css('var', '--jumi-border-block-end'),
      },
    },
  },
  'border-block-end-color': {
    '@keyframes jumi-border-block-end-color': {
      to: {
        'border-block-end-color': css('var', '--jumi-border-block-end-color'),
      },
    },
  },
  'border-block-end-style': {
    '@keyframes jumi-border-block-end-style': {
      to: {
        'border-block-end-style': css('var', '--jumi-border-block-end-style') as Property.BorderBlockEndStyle,
      },
    },
  },
  'border-block-end-width': {
    '@keyframes jumi-border-block-end-width': {
      to: {
        'border-block-end-width': css('var', '--jumi-border-block-end-width'),
      },
    },
  },
  'border-block-start': {
    '@keyframes jumi-border-block-start': {
      to: {
        'border-block-start': css('var', '--jumi-border-block-start'),
      },
    },
  },
  'border-block-start-color': {
    '@keyframes jumi-border-block-start-color': {
      to: {
        'border-block-start-color': css('var', '--jumi-border-block-start-color'),
      },
    },
  },
  'border-block-start-style': {
    '@keyframes jumi-border-block-start-style': {
      to: {
        'border-block-start-style': css('var', '--jumi-border-block-start-style') as Property.BorderBlockStartStyle,
      },
    },
  },
  'border-block-start-width': {
    '@keyframes jumi-border-block-start-width': {
      to: {
        'border-block-start-width': css('var', '--jumi-border-block-start-width'),
      },
    },
  },
  'border-block-style': {
    '@keyframes jumi-border-block-style': {
      to: {
        'border-block-style': css('var', '--jumi-border-block-style') as Property.BorderBlockStyle,
      },
    },
  },
  'border-block-width': {
    '@keyframes jumi-border-block-width': {
      to: {
        'border-block-width': css('var', '--jumi-border-block-width'),
      },
    },
  },
  'border-bottom': {
    '@keyframes jumi-border-bottom': {
      to: {
        'border-bottom': css('var', '--jumi-border-bottom'),
      },
    },
  },
  'border-bottom-color': {
    '@keyframes jumi-border-bottom-color': {
      to: {
        'border-bottom-color': css('var', '--jumi-border-bottom-color'),
      },
    },
  },
  'border-bottom-left-radius': {
    '@keyframes jumi-border-bottom-left-radius': {
      to: {
        'border-bottom-left-radius': css('var', '--jumi-border-bottom-left-radius'),
      },
    },
  },
  'border-bottom-right-radius': {
    '@keyframes jumi-border-bottom-right-radius': {
      to: {
        'border-bottom-right-radius': css('var', '--jumi-border-bottom-right-radius'),
      },
    },
  },
  'border-bottom-style': {
    '@keyframes jumi-border-bottom-style': {
      to: {
        'border-bottom-style': css('var', '--jumi-border-bottom-style') as Property.BorderBottomStyle,
      },
    },
  },
  'border-bottom-width': {
    '@keyframes jumi-border-bottom-width': {
      to: {
        'border-bottom-width': css('var', '--jumi-border-bottom-width'),
      },
    },
  },
  'border-collapse': {
    '@keyframes jumi-border-collapse': {
      to: {
        'border-collapse': css('var', '--jumi-border-collapse') as Property.BorderCollapse,
      },
    },
  },
  'border-color': {
    '@keyframes jumi-border-color': {
      to: {
        'border-color': css('var', '--jumi-border-color'),
      },
    },
  },
  'border-end-end-radius': {
    '@keyframes jumi-border-end-end-radius': {
      to: {
        'border-end-end-radius': css('var', '--jumi-border-end-end-radius'),
      },
    },
  },
  'border-end-start-radius': {
    '@keyframes jumi-border-end-start-radius': {
      to: {
        'border-end-start-radius': css('var', '--jumi-border-end-start-radius'),
      },
    },
  },
  'border-image': {
    '@keyframes jumi-border-image': {
      to: {
        'border-image': css('var', '--jumi-border-image'),
      },
    },
  },
  'border-image-outset': {
    '@keyframes jumi-border-image-outset': {
      to: {
        'border-image-outset': css('var', '--jumi-border-image-outset'),
      },
    },
  },
  'border-image-repeat': {
    '@keyframes jumi-border-image-repeat': {
      to: {
        'border-image-repeat': css('var', '--jumi-border-image-repeat'),
      },
    },
  },
  'border-image-slice': {
    '@keyframes jumi-border-image-slice': {
      to: {
        'border-image-slice': css('var', '--jumi-border-image-slice'),
      },
    },
  },
  'border-image-source': {
    '@keyframes jumi-border-image-source': {
      to: {
        'border-image-source': css('var', '--jumi-border-image-source'),
      },
    },
  },
  'border-image-width': {
    '@keyframes jumi-border-image-width': {
      to: {
        'border-image-width': css('var', '--jumi-border-image-width'),
      },
    },
  },
  'border-inline': {
    '@keyframes jumi-border-inline': {
      to: {
        'border-inline': css('var', '--jumi-border-inline'),
      },
    },
  },
  'border-inline-color': {
    '@keyframes jumi-border-inline-color': {
      to: {
        'border-inline-color': css('var', '--jumi-border-inline-color'),
      },
    },
  },
  'border-inline-end': {
    '@keyframes jumi-border-inline-end': {
      to: {
        'border-inline-end': css('var', '--jumi-border-inline-end'),
      },
    },
  },
  'border-inline-end-color': {
    '@keyframes jumi-border-inline-end-color': {
      to: {
        'border-inline-end-color': css('var', '--jumi-border-inline-end-color'),
      },
    },
  },
  'border-inline-end-style': {
    '@keyframes jumi-border-inline-end-style': {
      to: {
        'border-inline-end-style': css('var', '--jumi-border-inline-end-style') as Property.BorderInlineEndStyle,
      },
    },
  },
  'border-inline-end-width': {
    '@keyframes jumi-border-inline-end-width': {
      to: {
        'border-inline-end-width': css('var', '--jumi-border-inline-end-width'),
      },
    },
  },
  'border-inline-start': {
    '@keyframes jumi-border-inline-start': {
      to: {
        'border-inline-start': css('var', '--jumi-border-inline-start'),
      },
    },
  },
  'border-inline-start-color': {
    '@keyframes jumi-border-inline-start-color': {
      to: {
        'border-inline-start-color': css('var', '--jumi-border-inline-start-color'),
      },
    },
  },
  'border-inline-start-style': {
    '@keyframes jumi-border-inline-start-style': {
      to: {
        'border-inline-start-style': css('var', '--jumi-border-inline-start-style') as Property.BorderInlineStartStyle,
      },
    },
  },
  'border-inline-start-width': {
    '@keyframes jumi-border-inline-start-width': {
      to: {
        'border-inline-start-width': css('var', '--jumi-border-inline-start-width'),
      },
    },
  },
  'border-inline-style': {
    '@keyframes jumi-border-inline-style': {
      to: {
        'border-inline-style': css('var', '--jumi-border-inline-style') as Property.BorderInlineStyle,
      },
    },
  },
  'border-inline-width': {
    '@keyframes jumi-border-inline-width': {
      to: {
        'border-inline-width': css('var', '--jumi-border-inline-width'),
      },
    },
  },
  'border-left': {
    '@keyframes jumi-border-left': {
      to: {
        'border-left': css('var', '--jumi-border-left'),
      },
    },
  },
  'border-left-color': {
    '@keyframes jumi-border-left-color': {
      to: {
        'border-left-color': css('var', '--jumi-border-left-color'),
      },
    },
  },
  'border-left-style': {
    '@keyframes jumi-border-left-style': {
      to: {
        'border-left-style': css('var', '--jumi-border-left-style') as Property.BorderLeftStyle,
      },
    },
  },
  'border-left-width': {
    '@keyframes jumi-border-left-width': {
      to: {
        'border-left-width': css('var', '--jumi-border-left-width'),
      },
    },
  },
  'border-radius': {
    '@keyframes jumi-border-radius': {
      to: {
        'border-radius': css('var', '--jumi-border-radius'),
      },
    },
  },
  'border-right': {
    '@keyframes jumi-border-right': {
      to: {
        'border-right': css('var', '--jumi-border-right'),
      },
    },
  },
  'border-right-color': {
    '@keyframes jumi-border-right-color': {
      to: {
        'border-right-color': css('var', '--jumi-border-right-color'),
      },
    },
  },
  'border-right-style': {
    '@keyframes jumi-border-right-style': {
      to: {
        'border-right-style': css('var', '--jumi-border-right-style') as Property.BorderRightStyle,
      },
    },
  },
  'border-right-width': {
    '@keyframes jumi-border-right-width': {
      to: {
        'border-right-width': css('var', '--jumi-border-right-width'),
      },
    },
  },
  'border-spacing': {
    '@keyframes jumi-border-spacing': {
      to: {
        'border-spacing': css('var', '--jumi-border-spacing'),
      },
    },
  },
  'border-start-end-radius': {
    '@keyframes jumi-border-start-end-radius': {
      to: {
        'border-start-end-radius': css('var', '--jumi-border-start-end-radius'),
      },
    },
  },
  'border-start-start-radius': {
    '@keyframes jumi-border-start-start-radius': {
      to: {
        'border-start-start-radius': css('var', '--jumi-border-start-start-radius'),
      },
    },
  },
  'border-style': {
    '@keyframes jumi-border-style': {
      to: {
        'border-style': css('var', '--jumi-border-style'),
      },
    },
  },
  'border-top': {
    '@keyframes jumi-border-top': {
      to: {
        'border-top': css('var', '--jumi-border-top'),
      },
    },
  },
  'border-top-color': {
    '@keyframes jumi-border-top-color': {
      to: {
        'border-top-color': css('var', '--jumi-border-top-color'),
      },
    },
  },
  'border-top-left-radius': {
    '@keyframes jumi-border-top-left-radius': {
      to: {
        'border-top-left-radius': css('var', '--jumi-border-top-left-radius'),
      },
    },
  },
  'border-top-right-radius': {
    '@keyframes jumi-border-top-right-radius': {
      to: {
        'border-top-right-radius': css('var', '--jumi-border-top-right-radius'),
      },
    },
  },
  'border-top-style': {
    '@keyframes jumi-border-top-style': {
      to: {
        'border-top-style': css('var', '--jumi-border-top-style') as Property.BorderTopStyle,
      },
    },
  },
  'border-top-width': {
    '@keyframes jumi-border-top-width': {
      to: {
        'border-top-width': css('var', '--jumi-border-top-width'),
      },
    },
  },
  'border-width': {
    '@keyframes jumi-border-width': {
      to: {
        'border-width': css('var', '--jumi-border-width'),
      },
    },
  },
  'bottom': {
    '@keyframes jumi-bottom': {
      to: {
        bottom: css('var', '--jumi-bottom'),
      },
    },
  },
  'box-decoration-break': {
    '@keyframes jumi-box-decoration-break': {
      to: {
        'box-decoration-break': css('var', '--jumi-box-decoration-break') as Property.BoxDecorationBreak,
      },
    },
  },
  'box-shadow': {
    '@keyframes jumi-box-shadow': {
      to: {
        'box-shadow': css('var', '--jumi-box-shadow'),
      },
    },
  },
  'box-sizing': {
    '@keyframes jumi-box-sizing': {
      to: {
        'box-sizing': css('var', '--jumi-box-sizing') as Property.BoxSizing,
      },
    },
  },
  'break-after': {
    '@keyframes jumi-break-after': {
      to: {
        'break-after': css('var', '--jumi-break-after') as Property.BreakAfter,
      },
    },
  },
  'break-before': {
    '@keyframes jumi-break-before': {
      to: {
        'break-before': css('var', '--jumi-break-before') as Property.BreakBefore,
      },
    },
  },
  'break-inside': {
    '@keyframes jumi-break-inside': {
      to: {
        'break-inside': css('var', '--jumi-break-inside') as Property.BreakInside,
      },
    },
  },
  'caption-side': {
    '@keyframes jumi-caption-side': {
      to: {
        'caption-side': css('var', '--jumi-caption-side') as Property.CaptionSide,
      },
    },
  },
  'caret-color': {
    '@keyframes jumi-caret-color': {
      to: {
        'caret-color': css('var', '--jumi-caret-color'),
      },
    },
  },
  'clear': {
    '@keyframes jumi-clear': {
      to: {
        clear: css('var', '--jumi-clear') as Property.Clear,
      },
    },
  },
  'clip-path': {
    '@keyframes jumi-clip-path': {
      to: {
        'clip-path': css('var', '--jumi-clip-path'),
      },
    },
  },
  'clip-rule': {
    '@keyframes jumi-clip-rule': {
      to: {
        'clip-rule': css('var', '--jumi-clip-rule') as Property.ClipRule,
      },
    },
  },
  'color': {
    '@keyframes jumi-color': {
      to: {
        color: css('var', '--jumi-color'),
      },
    },
  },
  'color-interpolation': {
    '@keyframes jumi-color-interpolation': {
      to: {
        'color-interpolation': css('var', '--jumi-color-interpolation') as Property.ColorInterpolation,
      },
    },
  },
  'color-interpolation-filters': {
    '@keyframes jumi-color-interpolation-filters': {
      to: {
        'color-interpolation-filters': css('var', '--jumi-color-interpolation-filters'),
      },
    },
  },
  'color-scheme': {
    '@keyframes jumi-color-scheme': {
      to: {
        'color-scheme': css('var', '--jumi-color-scheme'),
      },
    },
  },
  'column-count': {
    '@keyframes jumi-column-count': {
      to: {
        'column-count': css('var', '--jumi-column-count') as Property.ColumnCount,
      },
    },
  },
  'column-fill': {
    '@keyframes jumi-column-fill': {
      to: {
        'column-fill': css('var', '--jumi-column-fill') as Property.ColumnFill,
      },
    },
  },
  'column-gap': {
    '@keyframes jumi-column-gap': {
      to: {
        'column-gap': css('var', '--jumi-column-gap'),
      },
    },
  },
  'column-rule': {
    '@keyframes jumi-column-rule': {
      to: {
        'column-rule': css('var', '--jumi-column-rule'),
      },
    },
  },
  'column-rule-color': {
    '@keyframes jumi-column-rule-color': {
      to: {
        'column-rule-color': css('var', '--jumi-column-rule-color'),
      },
    },
  },
  'column-rule-style': {
    '@keyframes jumi-column-rule-style': {
      to: {
        'column-rule-style': css('var', '--jumi-column-rule-style') as Property.ColumnRuleStyle,
      },
    },
  },
  'column-rule-width': {
    '@keyframes jumi-column-rule-width': {
      to: {
        'column-rule-width': css('var', '--jumi-column-rule-width'),
      },
    },
  },
  'column-span': {
    '@keyframes jumi-column-span': {
      to: {
        'column-span': css('var', '--jumi-column-span') as Property.ColumnSpan,
      },
    },
  },
  'column-width': {
    '@keyframes jumi-column-width': {
      to: {
        'column-width': css('var', '--jumi-column-width'),
      },
    },
  },
  'columns': {
    '@keyframes jumi-columns': {
      to: {
        columns: css('var', '--jumi-columns'),
      },
    },
  },
  'contain': {
    '@keyframes jumi-contain': {
      to: {
        contain: css('var', '--jumi-contain'),
      },
    },
  },
  'contain-intrinsic-block-size': {
    '@keyframes jumi-contain-intrinsic-block-size': {
      to: {
        'contain-intrinsic-block-size': css('var', '--jumi-contain-intrinsic-block-size'),
      },
    },
  },
  'contain-intrinsic-height': {
    '@keyframes jumi-contain-intrinsic-height': {
      to: {
        'contain-intrinsic-height': css('var', '--jumi-contain-intrinsic-height'),
      },
    },
  },
  'contain-intrinsic-inline-size': {
    '@keyframes jumi-contain-intrinsic-inline-size': {
      to: {
        'contain-intrinsic-inline-size': css('var', '--jumi-contain-intrinsic-inline-size'),
      },
    },
  },
  'contain-intrinsic-size': {
    '@keyframes jumi-contain-intrinsic-size': {
      to: {
        'contain-intrinsic-size': css('var', '--jumi-contain-intrinsic-size'),
      },
    },
  },
  'contain-intrinsic-width': {
    '@keyframes jumi-contain-intrinsic-width': {
      to: {
        'contain-intrinsic-width': css('var', '--jumi-contain-intrinsic-width'),
      },
    },
  },
  'container-type': {
    '@keyframes jumi-container-type': {
      to: {
        'container-type': css('var', '--jumi-container-type') as Property.ContainerType,
      },
    },
  },
  'content': {
    '@keyframes jumi-content': {
      to: {
        content: css('var', '--jumi-content'),
      },
    },
  },
  'content-visibility': {
    '@keyframes jumi-content-visibility': {
      to: {
        'content-visibility': css('var', '--jumi-content-visibility') as Property.ContentVisibility,
      },
    },
  },
  'counter-increment': {
    '@keyframes jumi-counter-increment': {
      to: {
        'counter-increment': css('var', '--jumi-counter-increment'),
      },
    },
  },
  'counter-reset': {
    '@keyframes jumi-counter-reset': {
      to: {
        'counter-reset': css('var', '--jumi-counter-reset'),
      },
    },
  },
  'counter-set': {
    '@keyframes jumi-counter-set': {
      to: {
        'counter-set': css('var', '--jumi-counter-set'),
      },
    },
  },
  'cursor': {
    '@keyframes jumi-cursor': {
      to: {
        cursor: css('var', '--jumi-cursor'),
      },
    },
  },
  'cx': {
    '@keyframes jumi-cx': {
      to: {
        cx: css('var', '--jumi-cx'),
      },
    },
  },
  'cy': {
    '@keyframes jumi-cy': {
      to: {
        cy: css('var', '--jumi-cy'),
      },
    },
  },
  'd': {
    '@keyframes jumi-d': {
      to: {
        d: css('var', '--jumi-d'),
      },
    },
  },
  'display': {
    '@keyframes jumi-display': {
      to: {
        display: css('var', '--jumi-display') as Property.Display,
      },
    },
  },
  'dominant-baseline': {
    '@keyframes jumi-dominant-baseline': {
      to: {
        'dominant-baseline': css('var', '--jumi-dominant-baseline') as Property.DominantBaseline,
      },
    },
  },
  'empty-cells': {
    '@keyframes jumi-empty-cells': {
      to: {
        'empty-cells': css('var', '--jumi-empty-cells') as Property.EmptyCells,
      },
    },
  },
  'fill': {
    '@keyframes jumi-fill': {
      to: {
        fill: css('var', '--jumi-fill'),
      },
    },
  },
  'fill-opacity': {
    '@keyframes jumi-fill-opacity': {
      to: {
        'fill-opacity': css('var', '--jumi-fill-opacity'),
      },
    },
  },
  'fill-rule': {
    '@keyframes jumi-fill-rule': {
      to: {
        'fill-rule': css('var', '--jumi-fill-rule') as Property.FillRule,
      },
    },
  },
  'filter': {
    '@keyframes jumi-filter': {
      to: {
        filter: css('var', '--jumi-filter'),
      },
    },
  },
  'flex': {
    '@keyframes jumi-flex': {
      to: {
        flex: css('var', '--jumi-flex'),
      },
    },
  },
  'flex-basis': {
    '@keyframes jumi-flex-basis': {
      to: {
        'flex-basis': css('var', '--jumi-flex-basis'),
      },
    },
  },
  'flex-direction': {
    '@keyframes jumi-flex-direction': {
      to: {
        'flex-direction': css('var', '--jumi-flex-direction') as Property.FlexDirection,
      },
    },
  },
  'flex-flow': {
    '@keyframes jumi-flex-flow': {
      to: {
        'flex-flow': css('var', '--jumi-flex-flow'),
      },
    },
  },
  'flex-grow': {
    '@keyframes jumi-flex-grow': {
      to: {
        'flex-grow': css('var', '--jumi-flex-grow'),
      },
    },
  },
  'flex-shrink': {
    '@keyframes jumi-flex-shrink': {
      to: {
        'flex-shrink': css('var', '--jumi-flex-shrink'),
      },
    },
  },
  'flex-wrap': {
    '@keyframes jumi-flex-wrap': {
      to: {
        'flex-wrap': css('var', '--jumi-flex-wrap') as Property.FlexWrap,
      },
    },
  },
  'float': {
    '@keyframes jumi-float': {
      to: {
        float: css('var', '--jumi-float') as Property.Float,
      },
    },
  },
  'flood-color': {
    '@keyframes jumi-flood-color': {
      to: {
        'flood-color': css('var', '--jumi-flood-color'),
      },
    },
  },
  'flood-opacity': {
    '@keyframes jumi-flood-opacity': {
      to: {
        'flood-opacity': css('var', '--jumi-flood-opacity'),
      },
    },
  },
  'font': {
    '@keyframes jumi-font': {
      to: {
        font: css('var', '--jumi-font'),
      },
    },
  },
  'font-family': {
    '@keyframes jumi-font-family': {
      to: {
        'font-family': css('var', '--jumi-font-family'),
      },
    },
  },
  'font-feature-settings': {
    '@keyframes jumi-font-feature-settings': {
      to: {
        'font-feature-settings': css('var', '--jumi-font-feature-settings'),
      },
    },
  },
  'font-kerning': {
    '@keyframes jumi-font-kerning': {
      to: {
        'font-kerning': css('var', '--jumi-font-kerning') as Property.FontKerning,
      },
    },
  },
  'font-language-override': {
    '@keyframes jumi-font-language-override': {
      to: {
        'font-language-override': css('var', '--jumi-font-language-override'),
      },
    },
  },
  'font-optical-sizing': {
    '@keyframes jumi-font-optical-sizing': {
      to: {
        'font-optical-sizing': css('var', '--jumi-font-optical-sizing') as Property.FontOpticalSizing,
      },
    },
  },
  'font-palette': {
    '@keyframes jumi-font-palette': {
      to: {
        'font-palette': css('var', '--jumi-font-palette'),
      },
    },
  },
  'font-size': {
    '@keyframes jumi-font-size': {
      to: {
        'font-size': css('var', '--jumi-font-size'),
      },
    },
  },
  'font-size-adjust': {
    '@keyframes jumi-font-size-adjust': {
      to: {
        'font-size-adjust': css('var', '--jumi-font-size-adjust'),
      },
    },
  },
  'font-style': {
    '@keyframes jumi-font-style': {
      to: {
        'font-style': css('var', '--jumi-font-style'),
      },
    },
  },
  'font-synthesis': {
    '@keyframes jumi-font-synthesis': {
      to: {
        'font-synthesis': css('var', '--jumi-font-synthesis'),
      },
    },
  },
  'font-synthesis-small-caps': {
    '@keyframes jumi-font-synthesis-small-caps': {
      to: {
        'font-synthesis-small-caps': css('var', '--jumi-font-synthesis-small-caps') as Property.FontSynthesisSmallCaps,
      },
    },
  },
  'font-synthesis-style': {
    '@keyframes jumi-font-synthesis-style': {
      to: {
        'font-synthesis-style': css('var', '--jumi-font-synthesis-style') as Property.FontSynthesisStyle,
      },
    },
  },
  'font-synthesis-weight': {
    '@keyframes jumi-font-synthesis-weight': {
      to: {
        'font-synthesis-weight': css('var', '--jumi-font-synthesis-weight') as Property.FontSynthesisWeight,
      },
    },
  },
  'font-variant': {
    '@keyframes jumi-font-variant': {
      to: {
        'font-variant': css('var', '--jumi-font-variant'),
      },
    },
  },
  'font-variant-alternates': {
    '@keyframes jumi-font-variant-alternates': {
      to: {
        'font-variant-alternates': css('var', '--jumi-font-variant-alternates'),
      },
    },
  },
  'font-variant-caps': {
    '@keyframes jumi-font-variant-caps': {
      to: {
        'font-variant-caps': css('var', '--jumi-font-variant-caps') as Property.FontVariantCaps,
      },
    },
  },
  'font-variant-east-asian': {
    '@keyframes jumi-font-variant-east-asian': {
      to: {
        'font-variant-east-asian': css('var', '--jumi-font-variant-east-asian'),
      },
    },
  },
  'font-variant-emoji': {
    '@keyframes jumi-font-variant-emoji': {
      to: {
        'font-variant-emoji': css('var', '--jumi-font-variant-emoji') as Property.FontVariantEmoji,
      },
    },
  },
  'font-variant-ligatures': {
    '@keyframes jumi-font-variant-ligatures': {
      to: {
        'font-variant-ligatures': css('var', '--jumi-font-variant-ligatures'),
      },
    },
  },
  'font-variant-numeric': {
    '@keyframes jumi-font-variant-numeric': {
      to: {
        'font-variant-numeric': css('var', '--jumi-font-variant-numeric'),
      },
    },
  },
  'font-variant-position': {
    '@keyframes jumi-font-variant-position': {
      to: {
        'font-variant-position': css('var', '--jumi-font-variant-position') as Property.FontVariantPosition,
      },
    },
  },
  'font-variation-settings': {
    '@keyframes jumi-font-variation-settings': {
      to: {
        'font-variation-settings': css('var', '--jumi-font-variation-settings'),
      },
    },
  },
  'font-weight': {
    '@keyframes jumi-font-weight': {
      to: {
        'font-weight': css('var', '--jumi-font-weight'),
      },
    },
  },
  'forced-color-adjust': {
    '@keyframes jumi-forced-color-adjust': {
      to: {
        'forced-color-adjust': css('var', '--jumi-forced-color-adjust') as Property.ForcedColorAdjust,
      },
    },
  },
  'gap': {
    '@keyframes jumi-gap': {
      to: {
        gap: css('var', '--jumi-gap'),
      },
    },
  },
  'grid': {
    '@keyframes jumi-grid': {
      to: {
        grid: css('var', '--jumi-grid'),
      },
    },
  },
  'grid-area': {
    '@keyframes jumi-grid-area': {
      to: {
        'grid-area': css('var', '--jumi-grid-area'),
      },
    },
  },
  'grid-auto-columns': {
    '@keyframes jumi-grid-auto-columns': {
      to: {
        'grid-auto-columns': css('var', '--jumi-grid-auto-columns'),
      },
    },
  },
  'grid-auto-flow': {
    '@keyframes jumi-grid-auto-flow': {
      to: {
        'grid-auto-flow': css('var', '--jumi-grid-auto-flow'),
      },
    },
  },
  'grid-auto-rows': {
    '@keyframes jumi-grid-auto-rows': {
      to: {
        'grid-auto-rows': css('var', '--jumi-grid-auto-rows'),
      },
    },
  },
  'grid-column': {
    '@keyframes jumi-grid-column': {
      to: {
        'grid-column': css('var', '--jumi-grid-column'),
      },
    },
  },
  'grid-column-end': {
    '@keyframes jumi-grid-column-end': {
      to: {
        'grid-column-end': css('var', '--jumi-grid-column-end'),
      },
    },
  },
  'grid-column-start': {
    '@keyframes jumi-grid-column-start': {
      to: {
        'grid-column-start': css('var', '--jumi-grid-column-start'),
      },
    },
  },
  'grid-row': {
    '@keyframes jumi-grid-row': {
      to: {
        'grid-row': css('var', '--jumi-grid-row'),
      },
    },
  },
  'grid-row-end': {
    '@keyframes jumi-grid-row-end': {
      to: {
        'grid-row-end': css('var', '--jumi-grid-row-end'),
      },
    },
  },
  'grid-row-start': {
    '@keyframes jumi-grid-row-start': {
      to: {
        'grid-row-start': css('var', '--jumi-grid-row-start'),
      },
    },
  },
  'grid-template': {
    '@keyframes jumi-grid-template': {
      to: {
        'grid-template': css('var', '--jumi-grid-template'),
      },
    },
  },
  'grid-template-areas': {
    '@keyframes jumi-grid-template-areas': {
      to: {
        'grid-template-areas': css('var', '--jumi-grid-template-areas'),
      },
    },
  },
  'grid-template-columns': {
    '@keyframes jumi-grid-template-columns': {
      to: {
        'grid-template-columns': css('var', '--jumi-grid-template-columns'),
      },
    },
  },
  'grid-template-rows': {
    '@keyframes jumi-grid-template-rows': {
      to: {
        'grid-template-rows': css('var', '--jumi-grid-template-rows'),
      },
    },
  },
  'hanging-punctuation': {
    '@keyframes jumi-hanging-punctuation': {
      to: {
        'hanging-punctuation': css('var', '--jumi-hanging-punctuation'),
      },
    },
  },
  'height': {
    '@keyframes jumi-height': {
      to: {
        height: css('var', '--jumi-height'),
      },
    },
  },
  'hyphenate-character': {
    '@keyframes jumi-hyphenate-character': {
      to: {
        'hyphenate-character': css('var', '--jumi-hyphenate-character'),
      },
    },
  },
  'hyphenate-limit-chars': {
    '@keyframes jumi-hyphenate-limit-chars': {
      to: {
        'hyphenate-limit-chars': css('var', '--jumi-hyphenate-limit-chars'),
      },
    },
  },
  'hyphens': {
    '@keyframes jumi-hyphens': {
      to: {
        hyphens: css('var', '--jumi-hyphens') as Property.Hyphens,
      },
    },
  },
  'image-orientation': {
    '@keyframes jumi-image-orientation': {
      to: {
        'image-orientation': css('var', '--jumi-image-orientation'),
      },
    },
  },
  'image-rendering': {
    '@keyframes jumi-image-rendering': {
      to: {
        'image-rendering': css('var', '--jumi-image-rendering') as Property.ImageRendering,
      },
    },
  },
  'initial-letter': {
    '@keyframes jumi-initial-letter': {
      to: {
        'initial-letter': css('var', '--jumi-initial-letter'),
      },
    },
  },
  'inline-size': {
    '@keyframes jumi-inline-size': {
      to: {
        'inline-size': css('var', '--jumi-inline-size'),
      },
    },
  },
  'inset': {
    '@keyframes jumi-inset': {
      to: {
        inset: css('var', '--jumi-inset'),
      },
    },
  },
  'inset-block': {
    '@keyframes jumi-inset-block': {
      to: {
        'inset-block': css('var', '--jumi-inset-block'),
      },
    },
  },
  'inset-block-end': {
    '@keyframes jumi-inset-block-end': {
      to: {
        'inset-block-end': css('var', '--jumi-inset-block-end'),
      },
    },
  },
  'inset-block-start': {
    '@keyframes jumi-inset-block-start': {
      to: {
        'inset-block-start': css('var', '--jumi-inset-block-start'),
      },
    },
  },
  'inset-inline': {
    '@keyframes jumi-inset-inline': {
      to: {
        'inset-inline': css('var', '--jumi-inset-inline'),
      },
    },
  },
  'inset-inline-end': {
    '@keyframes jumi-inset-inline-end': {
      to: {
        'inset-inline-end': css('var', '--jumi-inset-inline-end'),
      },
    },
  },
  'inset-inline-start': {
    '@keyframes jumi-inset-inline-start': {
      to: {
        'inset-inline-start': css('var', '--jumi-inset-inline-start'),
      },
    },
  },
  'justify-content': {
    '@keyframes jumi-justify-content': {
      to: {
        'justify-content':
        css('var', '--jumi-justify-content'),
      },
    },
  },
  'justify-items': {
    '@keyframes jumi-justify-items': {
      to: {
        'justify-items': css('var', '--jumi-justify-items'),
      },
    },
  },
  'justify-self': {
    '@keyframes jumi-justify-self': {
      to: {
        'justify-self': css('var', '--jumi-justify-self'),
      },
    },
  },
  'left': {
    '@keyframes jumi-left': {
      to: {
        left: css('var', '--jumi-left'),
      },
    },
  },
  'letter-spacing': {
    '@keyframes jumi-letter-spacing': {
      to: {
        'letter-spacing': css('var', '--jumi-letter-spacing'),
      },
    },
  },
  'lighting-color': {
    '@keyframes jumi-lighting-color': {
      to: {
        'lighting-color': css('var', '--jumi-lighting-color'),
      },
    },
  },
  'line-break': {
    '@keyframes jumi-line-break': {
      to: {
        'line-break': css('var', '--jumi-line-break') as Property.LineBreak,
      },
    },
  },
  'line-clamp': {
    '@keyframes jumi-line-clamp': {
      to: {
        'line-clamp': css('var', '--jumi-line-clamp'),
      },
    },
  },
  'line-height': {
    '@keyframes jumi-line-height': {
      to: {
        'line-height': css('var', '--jumi-line-height'),
      },
    },
  },
  'list-style': {
    '@keyframes jumi-list-style': {
      to: {
        'list-style': css('var', '--jumi-list-style'),
      },
    },
  },
  'list-style-image': {
    '@keyframes jumi-list-style-image': {
      to: {
        'list-style-image': css('var', '--jumi-list-style-image'),
      },
    },
  },
  'list-style-position': {
    '@keyframes jumi-list-style-position': {
      to: {
        'list-style-position': css('var', '--jumi-list-style-position') as Property.ListStylePosition,
      },
    },
  },
  'list-style-type': {
    '@keyframes jumi-list-style-type': {
      to: {
        'list-style-type': css('var', '--jumi-list-style-type'),
      },
    },
  },
  'margin': {
    '@keyframes jumi-margin': {
      to: {
        margin: css('var', '--jumi-margin'),
      },
    },
  },
  'margin-block': {
    '@keyframes jumi-margin-block': {
      to: {
        'margin-block': css('var', '--jumi-margin-block'),
      },
    },
  },
  'margin-block-end': {
    '@keyframes jumi-margin-block-end': {
      to: {
        'margin-block-end': css('var', '--jumi-margin-block-end'),
      },
    },
  },
  'margin-block-start': {
    '@keyframes jumi-margin-block-start': {
      to: {
        'margin-block-start': css('var', '--jumi-margin-block-start'),
      },
    },
  },
  'margin-bottom': {
    '@keyframes jumi-margin-bottom': {
      to: {
        'margin-bottom': css('var', '--jumi-margin-bottom'),
      },
    },
  },
  'margin-inline': {
    '@keyframes jumi-margin-inline': {
      to: {
        'margin-inline': css('var', '--jumi-margin-inline'),
      },
    },
  },
  'margin-inline-end': {
    '@keyframes jumi-margin-inline-end': {
      to: {
        'margin-inline-end': css('var', '--jumi-margin-inline-end'),
      },
    },
  },
  'margin-inline-start': {
    '@keyframes jumi-margin-inline-start': {
      to: {
        'margin-inline-start': css('var', '--jumi-margin-inline-start'),
      },
    },
  },
  'margin-left': {
    '@keyframes jumi-margin-left': {
      to: {
        'margin-left': css('var', '--jumi-margin-left'),
      },
    },
  },
  'margin-right': {
    '@keyframes jumi-margin-right': {
      to: {
        'margin-right': css('var', '--jumi-margin-right'),
      },
    },
  },
  'margin-top': {
    '@keyframes jumi-margin-top': {
      to: {
        'margin-top': css('var', '--jumi-margin-top'),
      },
    },
  },
  'marker': {
    '@keyframes jumi-marker': {
      to: {
        marker: css('var', '--jumi-marker'),
      },
    },
  },
  'marker-end': {
    '@keyframes jumi-marker-end': {
      to: {
        'marker-end': css('var', '--jumi-marker-end'),
      },
    },
  },
  'marker-mid': {
    '@keyframes jumi-marker-mid': {
      to: {
        'marker-mid': css('var', '--jumi-marker-mid'),
      },
    },
  },
  'marker-start': {
    '@keyframes jumi-marker-start': {
      to: {
        'marker-start': css('var', '--jumi-marker-start'),
      },
    },
  },
  'mask': {
    '@keyframes jumi-mask': {
      to: {
        mask: css('var', '--jumi-mask'),
      },
    },
  },
  'mask-border': {
    '@keyframes jumi-mask-border': {
      to: {
        'mask-border': css('var', '--jumi-mask-border'),
      },
    },
  },
  'mask-border-mode': {
    '@keyframes jumi-mask-border-mode': {
      to: {
        'mask-border-mode': css('var', '--jumi-mask-border-mode') as Property.MaskBorderMode,
      },
    },
  },
  'mask-border-outset': {
    '@keyframes jumi-mask-border-outset': {
      to: {
        'mask-border-outset': css('var', '--jumi-mask-border-outset'),
      },
    },
  },
  'mask-border-repeat': {
    '@keyframes jumi-mask-border-repeat': {
      to: {
        'mask-border-repeat': css('var', '--jumi-mask-border-repeat'),
      },
    },
  },
  'mask-border-slice': {
    '@keyframes jumi-mask-border-slice': {
      to: {
        'mask-border-slice': css('var', '--jumi-mask-border-slice'),
      },
    },
  },
  'mask-border-source': {
    '@keyframes jumi-mask-border-source': {
      to: {
        'mask-border-source': css('var', '--jumi-mask-border-source'),
      },
    },
  },
  'mask-border-width': {
    '@keyframes jumi-mask-border-width': {
      to: {
        'mask-border-width': css('var', '--jumi-mask-border-width'),
      },
    },
  },
  'mask-clip': {
    '@keyframes jumi-mask-clip': {
      to: {
        'mask-clip': css('var', '--jumi-mask-clip'),
      },
    },
  },
  'mask-composite': {
    '@keyframes jumi-mask-composite': {
      to: {
        'mask-composite': css('var', '--jumi-mask-composite') as Property.MaskComposite,
      },
    },
  },
  'mask-image': {
    '@keyframes jumi-mask-image': {
      to: {
        'mask-image': css('var', '--jumi-mask-image'),
      },
    },
  },
  'mask-mode': {
    '@keyframes jumi-mask-mode': {
      to: {
        'mask-mode': css('var', '--jumi-mask-mode') as Property.MaskMode,
      },
    },
  },
  'mask-origin': {
    '@keyframes jumi-mask-origin': {
      to: {
        'mask-origin': css('var', '--jumi-mask-origin') as Property.MaskOrigin,
      },
    },
  },
  'mask-position': {
    '@keyframes jumi-mask-position': {
      to: {
        'mask-position': css('var', '--jumi-mask-position'),
      },
    },
  },
  'mask-repeat': {
    '@keyframes jumi-mask-repeat': {
      to: {
        'mask-repeat': css('var', '--jumi-mask-repeat'),
      },
    },
  },
  'mask-size': {
    '@keyframes jumi-mask-size': {
      to: {
        'mask-size': css('var', '--jumi-mask-size'),
      },
    },
  },
  'mask-type': {
    '@keyframes jumi-mask-type': {
      to: {
        'mask-type': css('var', '--jumi-mask-type') as Property.MaskType,
      },
    },
  },
  'math-depth': {
    '@keyframes jumi-math-depth': {
      to: {
        'math-depth': css('var', '--jumi-math-depth'),
      },
    },
  },
  'math-style': {
    '@keyframes jumi-math-style': {
      to: {
        'math-style': css('var', '--jumi-math-style') as Property.MathStyle,
      },
    },
  },
  'max-block-size': {
    '@keyframes jumi-max-block-size': {
      to: {
        'max-block-size': css('var', '--jumi-max-block-size'),
      },
    },
  },
  'max-height': {
    '@keyframes jumi-max-height': {
      to: {
        'max-height': css('var', '--jumi-max-height'),
      },
    },
  },
  'max-inline-size': {
    '@keyframes jumi-max-inline-size': {
      to: {
        'max-inline-size': css('var', '--jumi-max-inline-size'),
      },
    },
  },
  'max-width': {
    '@keyframes jumi-max-width': {
      to: {
        'max-width': css('var', '--jumi-max-width'),
      },
    },
  },
  'min-block-size': {
    '@keyframes jumi-min-block-size': {
      to: {
        'min-block-size': css('var', '--jumi-min-block-size'),
      },
    },
  },
  'min-height': {
    '@keyframes jumi-min-height': {
      to: {
        'min-height': css('var', '--jumi-min-height'),
      },
    },
  },
  'min-inline-size': {
    '@keyframes jumi-min-inline-size': {
      to: {
        'min-inline-size': css('var', '--jumi-min-inline-size'),
      },
    },
  },
  'min-width': {
    '@keyframes jumi-min-width': {
      to: {
        'min-width': css('var', '--jumi-min-width'),
      },
    },
  },
  'mix-blend-mode': {
    '@keyframes jumi-mix-blend-mode': {
      to: {
        'mix-blend-mode': css('var', '--jumi-mix-blend-mode') as Property.MixBlendMode,
      },
    },
  },
  'object-fit': {
    '@keyframes jumi-object-fit': {
      to: {
        'object-fit': css('var', '--jumi-object-fit') as Property.ObjectFit,
      },
    },
  },
  'object-position': {
    '@keyframes jumi-object-position': {
      to: {
        'object-position': css('var', '--jumi-object-position'),
      },
    },
  },
  'offset': {
    '@keyframes jumi-offset': {
      to: {
        offset: css('var', '--jumi-offset'),
      },
    },
  },
  'offset-anchor': {
    '@keyframes jumi-offset-anchor': {
      to: {
        'offset-anchor': css('var', '--jumi-offset-anchor'),
      },
    },
  },
  'offset-distance': {
    '@keyframes jumi-offset-distance': {
      to: {
        'offset-distance': css('var', '--jumi-offset-distance'),
      },
    },
  },
  'offset-path': {
    '@keyframes jumi-offset-path': {
      to: {
        'offset-path': css('var', '--jumi-offset-path'),
      },
    },
  },
  'offset-position': {
    '@keyframes jumi-offset-position': {
      to: {
        'offset-position': css('var', '--jumi-offset-position'),
      },
    },
  },
  'offset-rotate': {
    '@keyframes jumi-offset-rotate': {
      to: {
        'offset-rotate': css('var', '--jumi-offset-rotate'),
      },
    },
  },
  'opacity': {
    '@keyframes jumi-opacity': {
      to: {
        opacity: css('var', '--jumi-opacity'),
      },
    },
  },
  'order': {
    '@keyframes jumi-order': {
      to: {
        order: css('var', '--jumi-order'),
      },
    },
  },
  'orphans': {
    '@keyframes jumi-orphans': {
      to: {
        orphans: css('var', '--jumi-orphans'),
      },
    },
  },
  'outline': {
    '@keyframes jumi-outline': {
      to: {
        outline: css('var', '--jumi-outline'),
      },
    },
  },
  'outline-color': {
    '@keyframes jumi-outline-color': {
      to: {
        'outline-color': css('var', '--jumi-outline-color'),
      },
    },
  },
  'outline-offset': {
    '@keyframes jumi-outline-offset': {
      to: {
        'outline-offset': css('var', '--jumi-outline-offset'),
      },
    },
  },
  'outline-style': {
    '@keyframes jumi-outline-style': {
      to: {
        'outline-style': css('var', '--jumi-outline-style'),
      },
    },
  },
  'outline-width': {
    '@keyframes jumi-outline-width': {
      to: {
        'outline-width': css('var', '--jumi-outline-width'),
      },
    },
  },
  'overflow': {
    '@keyframes jumi-overflow': {
      to: {
        overflow: css('var', '--jumi-overflow'),
      },
    },
  },
  'overflow-anchor': {
    '@keyframes jumi-overflow-anchor': {
      to: {
        'overflow-anchor': css('var', '--jumi-overflow-anchor') as Property.OverflowAnchor,
      },
    },
  },
  'overflow-block': {
    '@keyframes jumi-overflow-block': {
      to: {
        'overflow-block': css('var', '--jumi-overflow-block') as Property.OverflowBlock,
      },
    },
  },
  'overflow-clip-margin': {
    '@keyframes jumi-overflow-clip-margin': {
      to: {
        'overflow-clip-margin': css('var', '--jumi-overflow-clip-margin'),
      },
    },
  },
  'overflow-inline': {
    '@keyframes jumi-overflow-inline': {
      to: {
        'overflow-inline': css('var', '--jumi-overflow-inline') as Property.OverflowInline,
      },
    },
  },
  'overflow-wrap': {
    '@keyframes jumi-overflow-wrap': {
      to: {
        'overflow-wrap': css('var', '--jumi-overflow-wrap') as Property.OverflowWrap,
      },
    },
  },
  'overflow-x': {
    '@keyframes jumi-overflow-x': {
      to: {
        'overflow-x': css('var', '--jumi-overflow-x') as Property.OverflowX,
      },
    },
  },
  'overflow-y': {
    '@keyframes jumi-overflow-y': {
      to: {
        'overflow-y': css('var', '--jumi-overflow-y') as Property.OverflowY,
      },
    },
  },
  'overscroll-behavior': {
    '@keyframes jumi-overscroll-behavior': {
      to: {
        'overscroll-behavior': css('var', '--jumi-overscroll-behavior'),
      },
    },
  },
  'overscroll-behavior-block': {
    '@keyframes jumi-overscroll-behavior-block': {
      to: {
        'overscroll-behavior-block': css('var', '--jumi-overscroll-behavior-block') as Property.OverscrollBehaviorBlock,
      },
    },
  },
  'overscroll-behavior-inline': {
    '@keyframes jumi-overscroll-behavior-inline': {
      to: {
        'overscroll-behavior-inline': css('var', '--jumi-overscroll-behavior-inline') as Property.OverscrollBehaviorInline,
      },
    },
  },
  'overscroll-behavior-x': {
    '@keyframes jumi-overscroll-behavior-x': {
      to: {
        'overscroll-behavior-x': css('var', '--jumi-overscroll-behavior-x') as Property.OverscrollBehaviorX,
      },
    },
  },
  'overscroll-behavior-y': {
    '@keyframes jumi-overscroll-behavior-y': {
      to: {
        'overscroll-behavior-y': css('var', '--jumi-overscroll-behavior-y') as Property.OverscrollBehaviorY,
      },
    },
  },
  'padding': {
    '@keyframes jumi-padding': {
      to: {
        padding: css('var', '--jumi-padding'),
      },
    },
  },
  'padding-block': {
    '@keyframes jumi-padding-block': {
      to: {
        'padding-block': css('var', '--jumi-padding-block'),
      },
    },
  },
  'padding-block-end': {
    '@keyframes jumi-padding-block-end': {
      to: {
        'padding-block-end': css('var', '--jumi-padding-block-end'),
      },
    },
  },
  'padding-block-start': {
    '@keyframes jumi-padding-block-start': {
      to: {
        'padding-block-start': css('var', '--jumi-padding-block-start'),
      },
    },
  },
  'padding-bottom': {
    '@keyframes jumi-padding-bottom': {
      to: {
        'padding-bottom': css('var', '--jumi-padding-bottom'),
      },
    },
  },
  'padding-inline': {
    '@keyframes jumi-padding-inline': {
      to: {
        'padding-inline': css('var', '--jumi-padding-inline'),
      },
    },
  },
  'padding-inline-end': {
    '@keyframes jumi-padding-inline-end': {
      to: {
        'padding-inline-end': css('var', '--jumi-padding-inline-end'),
      },
    },
  },
  'padding-inline-start': {
    '@keyframes jumi-padding-inline-start': {
      to: {
        'padding-inline-start': css('var', '--jumi-padding-inline-start'),
      },
    },
  },
  'padding-left': {
    '@keyframes jumi-padding-left': {
      to: {
        'padding-left': css('var', '--jumi-padding-left'),
      },
    },
  },
  'padding-right': {
    '@keyframes jumi-padding-right': {
      to: {
        'padding-right': css('var', '--jumi-padding-right'),
      },
    },
  },
  'padding-top': {
    '@keyframes jumi-padding-top': {
      to: {
        'padding-top': css('var', '--jumi-padding-top'),
      },
    },
  },
  'page': {
    '@keyframes jumi-page': {
      to: {
        page: css('var', '--jumi-page'),
      },
    },
  },
  'paint-order': {
    '@keyframes jumi-paint-order': {
      to: {
        'paint-order': css('var', '--jumi-paint-order') as Property.PaintOrder,
      },
    },
  },
  'perspective': {
    '@keyframes jumi-perspective': {
      to: {
        perspective: css('var', '--jumi-perspective'),
      },
    },
  },
  'perspective-origin': {
    '@keyframes jumi-perspective-origin': {
      to: {
        'perspective-origin': css('var', '--jumi-perspective-origin'),
      },
    },
  },
  'place-content': {
    '@keyframes jumi-place-content': {
      to: {
        'place-content': css('var', '--jumi-place-content'),
      },
    },
  },
  'place-items': {
    '@keyframes jumi-place-items': {
      to: {
        'place-items': css('var', '--jumi-place-items'),
      },
    },
  },
  'place-self': {
    '@keyframes jumi-place-self': {
      to: {
        'place-self': css('var', '--jumi-place-self'),
      },
    },
  },
  'pointer-events': {
    '@keyframes jumi-pointer-events': {
      to: {
        'pointer-events': css('var', '--jumi-pointer-events') as Property.PointerEvents,
      },
    },
  },
  'position': {
    '@keyframes jumi-position': {
      to: {
        position: css('var', '--jumi-position') as Property.Position,
      },
    },
  },
  'position-anchor': {
    '@keyframes jumi-position-anchor': {
      to: {
        'position-anchor': css('var', '--jumi-position-anchor'),
      },
    },
  },
  'position-area': {
    '@keyframes jumi-position-area': {
      to: {
        'position-area': css('var', '--jumi-position-area'),
      },
    },
  },
  'position-try': {
    '@keyframes jumi-position-try': {
      to: {
        'position-try': css('var', '--jumi-position-try'),
      },
    },
  },
  'position-try-fallbacks': {
    '@keyframes jumi-position-try-fallbacks': {
      to: {
        'position-try-fallbacks': css('var', '--jumi-position-try-fallbacks'),
      },
    },
  },
  'position-try-order': {
    '@keyframes jumi-position-try-order': {
      to: {
        'position-try-order': css('var', '--jumi-position-try-order'),
      },
    },
  },
  'print-color-adjust': {
    '@keyframes jumi-print-color-adjust': {
      to: {
        'print-color-adjust': css('var', '--jumi-print-color-adjust') as Property.PrintColorAdjust,
      },
    },
  },
  'quotes': {
    '@keyframes jumi-quotes': {
      to: {
        quotes: css('var', '--jumi-quotes'),
      },
    },
  },
  'r': {
    '@keyframes jumi-r': {
      to: {
        r: css('var', '--jumi-r'),
      },
    },
  },
  'resize': {
    '@keyframes jumi-resize': {
      to: {
        resize: css('var', '--jumi-resize') as Property.Resize,
      },
    },
  },
  'right': {
    '@keyframes jumi-right': {
      to: {
        right: css('var', '--jumi-right'),
      },
    },
  },
  'rotate': {
    '@keyframes jumi-rotate': {
      to: {
        rotate: css('var', '--jumi-rotate'),
      },
    },
  },
  'row-gap': {
    '@keyframes jumi-row-gap': {
      to: {
        'row-gap': css('var', '--jumi-row-gap'),
      },
    },
  },
  'ruby-align': {
    '@keyframes jumi-ruby-align': {
      to: {
        'ruby-align': css('var', '--jumi-ruby-align') as Property.RubyAlign,
      },
    },
  },
  'ruby-overhang': {
    '@keyframes jumi-ruby-overhang': {
      to: {
        'ruby-overhang': css('var', '--jumi-ruby-overhang'),
      },
    },
  },
  'ruby-position': {
    '@keyframes jumi-ruby-position': {
      to: {
        'ruby-position': css('var', '--jumi-ruby-position'),
      },
    },
  },
  'rx': {
    '@keyframes jumi-rx': {
      to: {
        rx: css('var', '--jumi-rx'),
      },
    },
  },
  'ry': {
    '@keyframes jumi-ry': {
      to: {
        ry: css('var', '--jumi-ry'),
      },
    },
  },
  'scale': {
    '@keyframes jumi-scale': {
      to: {
        scale: css('var', '--jumi-scale'),
      },
    },
  },
  'scroll-margin': {
    '@keyframes jumi-scroll-margin': {
      to: {
        'scroll-margin': css('var', '--jumi-scroll-margin'),
      },
    },
  },
  'scroll-margin-block': {
    '@keyframes jumi-scroll-margin-block': {
      to: {
        'scroll-margin-block': css('var', '--jumi-scroll-margin-block'),
      },
    },
  },
  'scroll-margin-block-end': {
    '@keyframes jumi-scroll-margin-block-end': {
      to: {
        'scroll-margin-block-end': css('var', '--jumi-scroll-margin-block-end'),
      },
    },
  },
  'scroll-margin-block-start': {
    '@keyframes jumi-scroll-margin-block-start': {
      to: {
        'scroll-margin-block-start': css('var', '--jumi-scroll-margin-block-start'),
      },
    },
  },
  'scroll-margin-bottom': {
    '@keyframes jumi-scroll-margin-bottom': {
      to: {
        'scroll-margin-bottom': css('var', '--jumi-scroll-margin-bottom'),
      },
    },
  },
  'scroll-margin-inline': {
    '@keyframes jumi-scroll-margin-inline': {
      to: {
        'scroll-margin-inline': css('var', '--jumi-scroll-margin-inline'),
      },
    },
  },
  'scroll-margin-inline-end': {
    '@keyframes jumi-scroll-margin-inline-end': {
      to: {
        'scroll-margin-inline-end': css('var', '--jumi-scroll-margin-inline-end'),
      },
    },
  },
  'scroll-margin-inline-start': {
    '@keyframes jumi-scroll-margin-inline-start': {
      to: {
        'scroll-margin-inline-start': css('var', '--jumi-scroll-margin-inline-start'),
      },
    },
  },
  'scroll-margin-left': {
    '@keyframes jumi-scroll-margin-left': {
      to: {
        'scroll-margin-left': css('var', '--jumi-scroll-margin-left'),
      },
    },
  },
  'scroll-margin-right': {
    '@keyframes jumi-scroll-margin-right': {
      to: {
        'scroll-margin-right': css('var', '--jumi-scroll-margin-right'),
      },
    },
  },
  'scroll-margin-top': {
    '@keyframes jumi-scroll-margin-top': {
      to: {
        'scroll-margin-top': css('var', '--jumi-scroll-margin-top'),
      },
    },
  },
  'scroll-padding': {
    '@keyframes jumi-scroll-padding': {
      to: {
        'scroll-padding': css('var', '--jumi-scroll-padding'),
      },
    },
  },
  'scroll-padding-block': {
    '@keyframes jumi-scroll-padding-block': {
      to: {
        'scroll-padding-block': css('var', '--jumi-scroll-padding-block'),
      },
    },
  },
  'scroll-padding-block-end': {
    '@keyframes jumi-scroll-padding-block-end': {
      to: {
        'scroll-padding-block-end': css('var', '--jumi-scroll-padding-block-end'),
      },
    },
  },
  'scroll-padding-block-start': {
    '@keyframes jumi-scroll-padding-block-start': {
      to: {
        'scroll-padding-block-start': css('var', '--jumi-scroll-padding-block-start'),
      },
    },
  },
  'scroll-padding-bottom': {
    '@keyframes jumi-scroll-padding-bottom': {
      to: {
        'scroll-padding-bottom': css('var', '--jumi-scroll-padding-bottom'),
      },
    },
  },
  'scroll-padding-inline': {
    '@keyframes jumi-scroll-padding-inline': {
      to: {
        'scroll-padding-inline': css('var', '--jumi-scroll-padding-inline'),
      },
    },
  },
  'scroll-padding-inline-end': {
    '@keyframes jumi-scroll-padding-inline-end': {
      to: {
        'scroll-padding-inline-end': css('var', '--jumi-scroll-padding-inline-end'),
      },
    },
  },
  'scroll-padding-inline-start': {
    '@keyframes jumi-scroll-padding-inline-start': {
      to: {
        'scroll-padding-inline-start': css('var', '--jumi-scroll-padding-inline-start'),
      },
    },
  },
  'scroll-padding-left': {
    '@keyframes jumi-scroll-padding-left': {
      to: {
        'scroll-padding-left': css('var', '--jumi-scroll-padding-left'),
      },
    },
  },
  'scroll-padding-right': {
    '@keyframes jumi-scroll-padding-right': {
      to: {
        'scroll-padding-right': css('var', '--jumi-scroll-padding-right'),
      },
    },
  },
  'scroll-padding-top': {
    '@keyframes jumi-scroll-padding-top': {
      to: {
        'scroll-padding-top': css('var', '--jumi-scroll-padding-top'),
      },
    },
  },
  'scroll-snap-align': {
    '@keyframes jumi-scroll-snap-align': {
      to: {
        'scroll-snap-align': css('var', '--jumi-scroll-snap-align'),
      },
    },
  },
  'scroll-snap-stop': {
    '@keyframes jumi-scroll-snap-stop': {
      to: {
        'scroll-snap-stop': css('var', '--jumi-scroll-snap-stop') as Property.ScrollSnapStop,
      },
    },
  },
  'scroll-snap-type': {
    '@keyframes jumi-scroll-snap-type': {
      to: {
        'scroll-snap-type': css('var', '--jumi-scroll-snap-type'),
      },
    },
  },
  'scrollbar-color': {
    '@keyframes jumi-scrollbar-color': {
      to: {
        'scrollbar-color': css('var', '--jumi-scrollbar-color'),
      },
    },
  },
  'scrollbar-gutter': {
    '@keyframes jumi-scrollbar-gutter': {
      to: {
        'scrollbar-gutter': css('var', '--jumi-scrollbar-gutter'),
      },
    },
  },
  'scrollbar-width': {
    '@keyframes jumi-scrollbar-width': {
      to: {
        'scrollbar-width': css('var', '--jumi-scrollbar-width') as Property.ScrollbarWidth,
      },
    },
  },
  'shape-image-threshold': {
    '@keyframes jumi-shape-image-threshold': {
      to: {
        'shape-image-threshold': css('var', '--jumi-shape-image-threshold'),
      },
    },
  },
  'shape-margin': {
    '@keyframes jumi-shape-margin': {
      to: {
        'shape-margin': css('var', '--jumi-shape-margin'),
      },
    },
  },
  'shape-outside': {
    '@keyframes jumi-shape-outside': {
      to: {
        'shape-outside': css('var', '--jumi-shape-outside'),
      },
    },
  },
  'shape-rendering': {
    '@keyframes jumi-shape-rendering': {
      to: {
        'shape-rendering': css('var', '--jumi-shape-rendering') as Property.ShapeRendering,
      },
    },
  },
  'stop-color': {
    '@keyframes jumi-stop-color': {
      to: {
        'stop-color': css('var', '--jumi-stop-color'),
      },
    },
  },
  'stop-opacity': {
    '@keyframes jumi-stop-opacity': {
      to: {
        'stop-opacity': css('var', '--jumi-stop-opacity'),
      },
    },
  },
  'stroke': {
    '@keyframes jumi-stroke': {
      to: {
        stroke: css('var', '--jumi-stroke'),
      },
    },
  },
  'stroke-dasharray': {
    '@keyframes jumi-stroke-dasharray': {
      to: {
        'stroke-dasharray': css('var', '--jumi-stroke-dasharray'),
      },
    },
  },
  'stroke-dashoffset': {
    '@keyframes jumi-stroke-dashoffset': {
      to: {
        'stroke-dashoffset': css('var', '--jumi-stroke-dashoffset'),
      },
    },
  },
  'stroke-linecap': {
    '@keyframes jumi-stroke-linecap': {
      to: {
        'stroke-linecap': css('var', '--jumi-stroke-linecap') as Property.StrokeLinecap,
      },
    },
  },
  'stroke-linejoin': {
    '@keyframes jumi-stroke-linejoin': {
      to: {
        'stroke-linejoin': css('var', '--jumi-stroke-linejoin') as Property.StrokeLinejoin,
      },
    },
  },
  'stroke-miterlimit': {
    '@keyframes jumi-stroke-miterlimit': {
      to: {
        'stroke-miterlimit': css('var', '--jumi-stroke-miterlimit'),
      },
    },
  },
  'stroke-opacity': {
    '@keyframes jumi-stroke-opacity': {
      to: {
        'stroke-opacity': css('var', '--jumi-stroke-opacity'),
      },
    },
  },
  'stroke-width': {
    '@keyframes jumi-stroke-width': {
      to: {
        'stroke-width': css('var', '--jumi-stroke-width'),
      },
    },
  },
  'tab-size': {
    '@keyframes jumi-tab-size': {
      to: {
        'tab-size': css('var', '--jumi-tab-size'),
      },
    },
  },
  'table-layout': {
    '@keyframes jumi-table-layout': {
      to: {
        'table-layout': css('var', '--jumi-table-layout') as Property.TableLayout,
      },
    },
  },
  'text-align': {
    '@keyframes jumi-text-align': {
      to: {
        'text-align': css('var', '--jumi-text-align') as Property.TextAlign,
      },
    },
  },
  'text-align-last': {
    '@keyframes jumi-text-align-last': {
      to: {
        'text-align-last': css('var', '--jumi-text-align-last') as Property.TextAlignLast,
      },
    },
  },
  'text-anchor': {
    '@keyframes jumi-text-anchor': {
      to: {
        'text-anchor': css('var', '--jumi-text-anchor') as Property.TextAnchor,
      },
    },
  },
  'text-autospace': {
    '@keyframes jumi-text-autospace': {
      to: {
        'text-autospace': css('var', '--jumi-text-autospace') as Property.MsTextAutospace,
      },
    },
  },
  'text-box': {
    '@keyframes jumi-text-box': {
      to: {
        textbox: css('var', '--jumi-text-box'),
      },
    },
  },
  'text-box-edge': {
    '@keyframes jumi-text-box-edge': {
      to: {
        'text-box-edge': css('var', '--jumi-text-box-edge'),
      },
    },
  },
  'text-box-trim': {
    '@keyframes jumi-text-box-trim': {
      to: {
        'text-box-trim': css('var', '--jumi-text-box-trim'),
      },
    },
  },
  'text-combine-upright': {
    '@keyframes jumi-text-combine-upright': {
      to: {
        'text-combine-upright': css('var', '--jumi-text-combine-upright'),
      },
    },
  },
  'text-decoration': {
    '@keyframes jumi-text-decoration': {
      to: {
        'text-decoration': css('var', '--jumi-text-decoration'),
      },
    },
  },
  'text-decoration-color': {
    '@keyframes jumi-text-decoration-color': {
      to: {
        'text-decoration-color': css('var', '--jumi-text-decoration-color'),
      },
    },
  },
  'text-decoration-line': {
    '@keyframes jumi-text-decoration-line': {
      to: {
        'text-decoration-line': css('var', '--jumi-text-decoration-line'),
      },
    },
  },
  'text-decoration-skip-ink': {
    '@keyframes jumi-text-decoration-skip-ink': {
      to: {
        'text-decoration-skip-ink': css('var', '--jumi-text-decoration-skip-ink') as Property.TextDecorationSkipInk,
      },
    },
  },
  'text-decoration-style': {
    '@keyframes jumi-text-decoration-style': {
      to: {
        'text-decoration-style': css('var', '--jumi-text-decoration-style') as Property.TextDecorationStyle,
      },
    },
  },
  'text-decoration-thickness': {
    '@keyframes jumi-text-decoration-thickness': {
      to: {
        'text-decoration-thickness': css('var', '--jumi-text-decoration-thickness'),
      },
    },
  },
  'text-emphasis': {
    '@keyframes jumi-text-emphasis': {
      to: {
        'text-emphasis': css('var', '--jumi-text-emphasis'),
      },
    },
  },
  'text-emphasis-color': {
    '@keyframes jumi-text-emphasis-color': {
      to: {
        'text-emphasis-color': css('var', '--jumi-text-emphasis-color'),
      },
    },
  },
  'text-emphasis-position': {
    '@keyframes jumi-text-emphasis-position': {
      to: {
        'text-emphasis-position': css('var', '--jumi-text-emphasis-position'),
      },
    },
  },
  'text-emphasis-style': {
    '@keyframes jumi-text-emphasis-style': {
      to: {
        'text-emphasis-style': css('var', '--jumi-text-emphasis-style'),
      },
    },
  },
  'text-indent': {
    '@keyframes jumi-text-indent': {
      to: {
        'text-indent': css('var', '--jumi-text-indent'),
      },
    },
  },
  'text-justify': {
    '@keyframes jumi-text-justify': {
      to: {
        'text-justify': css('var', '--jumi-text-justify') as Property.TextJustify,
      },
    },
  },
  'text-orientation': {
    '@keyframes jumi-text-orientation': {
      to: {
        'text-orientation': css('var', '--jumi-text-orientation') as Property.TextOrientation,
      },
    },
  },
  'text-overflow': {
    '@keyframes jumi-text-overflow': {
      to: {
        'text-overflow': css('var', '--jumi-text-overflow'),
      },
    },
  },
  'text-rendering': {
    '@keyframes jumi-text-rendering': {
      to: {
        'text-rendering': css('var', '--jumi-text-rendering') as Property.TextRendering,
      },
    },
  },
  'text-shadow': {
    '@keyframes jumi-text-shadow': {
      to: {
        'text-shadow': css('var', '--jumi-text-shadow'),
      },
    },
  },
  'text-transform': {
    '@keyframes jumi-text-transform': {
      to: {
        'text-transform': css('var', '--jumi-text-transform') as Property.TextTransform,
      },
    },
  },
  'text-underline-offset': {
    '@keyframes jumi-text-underline-offset': {
      to: {
        'text-underline-offset': css('var', '--jumi-text-underline-offset'),
      },
    },
  },
  'text-underline-position': {
    '@keyframes jumi-text-underline-position': {
      to: {
        'text-underline-position': css('var', '--jumi-text-underline-position'),
      },
    },
  },
  'text-wrap': {
    '@keyframes jumi-text-wrap': {
      to: {
        'text-wrap': css('var', '--jumi-text-wrap') as Property.TextWrap,
      },
    },
  },
  'text-wrap-mode': {
    '@keyframes jumi-text-wrap-mode': {
      to: {
        'text-wrap-mode': css('var', '--jumi-text-wrap-mode'),
      },
    },
  },
  'text-wrap-style': {
    '@keyframes jumi-text-wrap-style': {
      to: {
        'text-wrap-style': css('var', '--jumi-text-wrap-style'),
      },
    },
  },
  'top': {
    '@keyframes jumi-top': {
      to: {
        top: css('var', '--jumi-top'),
      },
    },
  },
  'transform': {
    '@keyframes jumi-transform': {
      to: {
        transform: css('var', '--jumi-transform'),
      },
    },
  },
  'transform-box': {
    '@keyframes jumi-transform-box': {
      to: {
        'transform-box': css('var', '--jumi-transform-box') as Property.TransformBox,
      },
    },
  },
  'transform-origin': {
    '@keyframes jumi-transform-origin': {
      to: {
        'transform-origin': css('var', '--jumi-transform-origin'),
      },
    },
  },
  'transform-style': {
    '@keyframes jumi-transform-style': {
      to: {
        'transform-style': css('var', '--jumi-transform-style') as Property.TransformStyle,
      },
    },
  },
  'translate': {
    '@keyframes jumi-translate': {
      to: {
        translate: css('var', '--jumi-translate'),
      },
    },
  },
  'user-select': {
    '@keyframes jumi-user-select': {
      to: {
        'user-select': css('var', '--jumi-user-select') as Property.UserSelect,
      },
    },
  },
  'vector-effect': {
    '@keyframes jumi-vector-effect': {
      to: {
        'vector-effect': css('var', '--jumi-vector-effect') as Property.VectorEffect,
      },
    },
  },
  'vertical-align': {
    '@keyframes jumi-vertical-align': {
      to: {
        'vertical-align': css('var', '--jumi-vertical-align'),
      },
    },
  },
  'view-timeline-inset': {
    '@keyframes jumi-view-timeline-inset': {
      to: {
        'view-timeline-inset': css('var', '--jumi-view-timeline-inset'),
      },
    },
  },
  'view-transition-class': {
    '@keyframes jumi-view-transition-class': {
      to: {
        'view-transition-class': css('var', '--jumi-view-transition-class'),
      },
    },
  },
  'view-transition-name': {
    '@keyframes jumi-view-transition-name': {
      to: {
        'view-transition-name': css('var', '--jumi-view-transition-name'),
      },
    },
  },
  'visibility': {
    '@keyframes jumi-visibility': {
      to: {
        visibility: css('var', '--jumi-visibility') as Property.Visibility,
      },
    },
  },
  'white-space': {
    '@keyframes jumi-white-space': {
      to: {
        'white-space': css('var', '--jumi-white-space'),
      },
    },
  },
  'white-space-collapse': {
    '@keyframes jumi-white-space-collapse': {
      to: {
        'white-space-collapse': css('var', '--jumi-white-space-collapse') as Property.WhiteSpaceCollapse,
      },
    },
  },
  'widows': {
    '@keyframes jumi-widows': {
      to: {
        widows: css('var', '--jumi-widows'),
      },
    },
  },
  'width': {
    '@keyframes jumi-width': {
      to: {
        width: css('var', '--jumi-width'),
      },
    },
  },
  'will-change': {
    '@keyframes jumi-will-change': {
      to: {
        'will-change': css('var', '--jumi-will-change'),
      },
    },
  },
  'word-break': {
    '@keyframes jumi-word-break': {
      to: {
        'word-break': css('var', '--jumi-word-break') as Property.WordBreak,
      },
    },
  },
  'word-spacing': {
    '@keyframes jumi-word-spacing': {
      to: {
        'word-spacing': css('var', '--jumi-word-spacing'),
      },
    },
  },
  'writing-mode': {
    '@keyframes jumi-writing-mode': {
      to: {
        'writing-mode': css('var', '--jumi-writing-mode') as Property.WritingMode,
      },
    },
  },
  'x': {
    '@keyframes jumi-x': {
      to: {
        x: css('var', '--jumi-x'),
      },
    },
  },
  'y': {
    '@keyframes jumi-y': {
      to: {
        y: css('var', '--jumi-y'),
      },
    },
  },
  'z-index': {
    '@keyframes jumi-z-index': {
      to: {
        'z-index': css('var', '--jumi-z-index'),
      },
    },
  },
}

type Keyframes = {
  collection: PropertyCollection
  names: PropertyNames
  variables: Array<KeyframesVariableReference>
}
type PropertyCollection = Partial<Record<AnimatableStandardPropertyType, AnimatableStandardPropertyType>>
type PropertyNames = Array<AnimatableStandardPropertyType>

const propertyKeys = Object.keys(propertyKeyframes) as PropertyNames
const keyframes = propertyKeys.reduce(
  (result, property) => {
    const variable = css('var', `--jumi-${property}-keyframes`, 'none')
    result.variables.push(variable)

    result.collection[property] = property
    result.names.push(property)

    return result
  },
  { collection: {}, names: [], variables: [] } as Keyframes,
)

export const propertyNames = keyframes.names
export const propertyCollection = keyframes.collection
export const propertyVariableReferences = join(keyframes.variables, ', ')
