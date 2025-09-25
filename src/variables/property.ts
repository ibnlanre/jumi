import type { Attribute, Collection, PropertyVariables } from '@/types'

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
import { boxShadow } from '@/composition/box-shadow'
import { boxShadowInset } from '@/composition/box-shadow-inset'
import { columnRule } from '@/composition/column-rule'
import { columns } from '@/composition/columns'
import { filter } from '@/composition/filter'
import { filterDropShadow } from '@/composition/filter-drop-shadow'
import { flex } from '@/composition/flex'
import { flexFlow } from '@/composition/flex-flow'
import { font } from '@/composition/font'
import { fontSynthesis } from '@/composition/font-synthesis'
import { grid } from '@/composition/grid'
import { gridColumn } from '@/composition/grid-column'
import { gridRow } from '@/composition/grid-row'
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
import { offsetPositionX, offsetPositionY } from '@/composition/offset-position'
import { outline } from '@/composition/outline'
import { overflow } from '@/composition/overflow'
import { overscrollBehavior } from '@/composition/overscroll-behavior'
import { padding } from '@/composition/padding'
import { paddingBlock } from '@/composition/padding-block'
import { paddingInline } from '@/composition/padding-inline'
import { textShadow } from '@/composition/text-shadow'
import {
  matrix,
  matrix3d,
  perspective,
  rotate3d,
  scale3d,
  skew,
  transform,
  translate,
  translate3d,
} from '@/composition/transform'
import { css } from '@/helpers/css'

export const propertyVariables: Record<Attribute, Partial<PropertyVariables>> = {
  'accent-color': {
    '--jumi-accent-color': 'auto',
  },
  'align-content': {
    '--jumi-align-content': 'normal',
  },
  'align-items': {
    '--jumi-align-items': 'normal',
  },
  'align-self': {
    '--jumi-align-self': 'auto',
  },
  'alignment-baseline': {
    '--jumi-alignment-baseline': 'baseline',
  },
  'all': {
    '--jumi-all': 'initial',
  },
  'appearance': {
    '--jumi-appearance': 'none',
  },
  'aspect-ratio': {
    '--jumi-aspect-ratio': aspectRatio,
    '--jumi-aspect-ratio-height': 'auto',
    '--jumi-aspect-ratio-width': 'auto',
  },
  'backdrop-filter': {
    '--jumi-backdrop-blur': 'blur(0)',
    '--jumi-backdrop-brightness': 'brightness(1)',
    '--jumi-backdrop-contrast': 'contrast(1)',
    '--jumi-backdrop-drop-shadow': backdropFilterDropShadow,
    '--jumi-backdrop-drop-shadow-blur': '0',
    '--jumi-backdrop-drop-shadow-color': 'transparent',
    '--jumi-backdrop-drop-shadow-offset-x': '0',
    '--jumi-backdrop-drop-shadow-offset-y': '0',
    '--jumi-backdrop-filter': backdropFilter,
    '--jumi-backdrop-grayscale': 'grayscale(0)',
    '--jumi-backdrop-hue-rotate': 'hue-rotate(0deg)',
    '--jumi-backdrop-invert': 'invert(0)',
    '--jumi-backdrop-opacity': 'opacity(1)',
    '--jumi-backdrop-saturate': 'saturate(1)',
    '--jumi-backdrop-sepia': 'sepia(0)',
    '--jumi-backdrop-url': 'url()',
  },
  'backface-visibility': {
    '--jumi-backface-visibility': 'visible',
  },
  'background': {
    '--jumi-background': background,
    '--jumi-background-attachment': 'scroll',
    '--jumi-background-clip': 'border-box',
    '--jumi-background-color': 'transparent',
    '--jumi-background-image': 'none',
    '--jumi-background-origin': 'padding-box',
    '--jumi-background-position': backgroundPosition,
    '--jumi-background-position-x': backgroundPositionX,
    '--jumi-background-position-x-edge': 'left',
    '--jumi-background-position-x-offset': '0%',
    '--jumi-background-position-y': backgroundPositionY,
    '--jumi-background-position-y-edge': 'top',
    '--jumi-background-position-y-offset': '0%',
    '--jumi-background-repeat': backgroundRepeat,
    '--jumi-background-repeat-x': 'repeat',
    '--jumi-background-repeat-y': 'repeat',
    '--jumi-background-size': backgroundSize,
    '--jumi-background-size-height': 'auto',
    '--jumi-background-size-width': 'auto',
  },
  'background-attachment': {
    '--jumi-background-attachment': 'scroll',
  },
  'background-blend-mode': {
    '--jumi-background-blend-mode': 'normal',
  },
  'background-clip': {
    '--jumi-background-clip': 'border-box',
  },
  'background-color': {
    '--jumi-background-color': 'transparent',
  },
  'background-image': {
    '--jumi-background-image': 'none',
  },
  'background-origin': {
    '--jumi-background-origin': 'padding-box',
  },
  'background-position': {
    '--jumi-background-position': backgroundPosition,
    '--jumi-background-position-x': backgroundPositionX,
    '--jumi-background-position-x-edge': 'left',
    '--jumi-background-position-x-offset': '0%',
    '--jumi-background-position-y': backgroundPositionY,
    '--jumi-background-position-y-edge': 'top',
    '--jumi-background-position-y-offset': '0%',
  },
  'background-repeat': {
    '--jumi-background-repeat': backgroundRepeat,
    '--jumi-background-repeat-x': 'repeat',
    '--jumi-background-repeat-y': 'repeat',
  },
  'background-size': {
    '--jumi-background-size': backgroundSize,
    '--jumi-background-size-height': 'auto',
    '--jumi-background-size-width': 'auto',
  },
  'block-size': {
    '--jumi-block-size': 'auto',
  },
  'border': {
    '--jumi-border': border,
    '--jumi-border-collapse': 'separate',
    '--jumi-border-color': 'currentColor',
    '--jumi-border-radius': '0',
    '--jumi-border-style': 'none',
    '--jumi-border-width': 'medium',
  },
  'border-block': {
    '--jumi-border-block': 'none',
  },
  'border-block-color': {
    '--jumi-border-block-color': 'currentColor',
  },
  'border-block-end': {
    '--jumi-border-block-end': borderBlockEnd,
    '--jumi-border-block-end-color': 'currentColor',
    '--jumi-border-block-end-radius': '0',
    '--jumi-border-block-end-style': 'none',
    '--jumi-border-block-end-width': 'medium',
  },
  'border-block-end-color': {
    '--jumi-border-block-end-color': 'currentColor',
  },
  'border-block-end-style': {
    '--jumi-border-block-end-style': 'none',
  },
  'border-block-end-width': {
    '--jumi-border-block-end-width': 'medium',
  },
  'border-block-start': {
    '--jumi-border-block-start': borderBlockStart,
    '--jumi-border-block-start-color': 'currentColor',
    '--jumi-border-block-start-radius': '0',
    '--jumi-border-block-start-style': 'none',
    '--jumi-border-block-start-width': 'medium',
  },
  'border-block-start-color': {
    '--jumi-border-block-start-color': 'currentColor',
  },
  'border-block-start-style': {
    '--jumi-border-block-start-style': 'none',
  },
  'border-block-start-width': {
    '--jumi-border-block-start-width': 'medium',
  },
  'border-block-style': {
    '--jumi-border-block-style': 'none',
  },
  'border-block-width': {
    '--jumi-border-block-width': 'medium',
  },
  'border-bottom': {
    '--jumi-border-bottom': borderBottom,
    '--jumi-border-bottom-color': 'currentColor',
    '--jumi-border-bottom-left-radius': '0',
    '--jumi-border-bottom-radius': '0',
    '--jumi-border-bottom-right-radius': '0',
    '--jumi-border-bottom-style': 'none',
    '--jumi-border-bottom-width': 'medium',
  },
  'border-bottom-color': {
    '--jumi-border-bottom-color': 'currentColor',
  },
  'border-bottom-left-radius': {
    '--jumi-border-bottom-left-radius': '0',
  },
  'border-bottom-right-radius': {
    '--jumi-border-bottom-right-radius': '0',
  },
  'border-bottom-style': {
    '--jumi-border-bottom-style': 'none',
  },
  'border-bottom-width': {
    '--jumi-border-bottom-width': 'medium',
  },
  'border-collapse': {
    '--jumi-border-collapse': 'separate',
  },
  'border-color': {
    '--jumi-border-color': 'currentColor',
  },
  'border-end-end-radius': {
    '--jumi-border-end-end-radius': '0',
  },
  'border-end-start-radius': {
    '--jumi-border-end-start-radius': '0',
  },
  'border-image': {
    '--jumi-border-image': borderImage,
    '--jumi-border-image-outset': borderImageOutset,
    '--jumi-border-image-outset-bottom': '0',
    '--jumi-border-image-outset-left': '0',
    '--jumi-border-image-outset-right': '0',
    '--jumi-border-image-outset-top': '0',
    '--jumi-border-image-outset-x': borderImageOutsetX,
    '--jumi-border-image-outset-y': borderImageOutsetY,
    '--jumi-border-image-repeat': borderImageRepeat,
    '--jumi-border-image-repeat-x': 'stretch',
    '--jumi-border-image-repeat-y': 'stretch',
    '--jumi-border-image-slice': '100%',
    '--jumi-border-image-source': 'none',
    '--jumi-border-image-width': '1',
  },
  'border-image-outset': {
    '--jumi-border-image-outset': borderImageOutset,
    '--jumi-border-image-outset-bottom': '0',
    '--jumi-border-image-outset-left': '0',
    '--jumi-border-image-outset-right': '0',
    '--jumi-border-image-outset-top': '0',
    '--jumi-border-image-outset-x': borderImageOutsetX,
    '--jumi-border-image-outset-y': borderImageOutsetY,
  },
  'border-image-repeat': {
    '--jumi-border-image-repeat': borderImageRepeat,
    '--jumi-border-image-repeat-x': 'stretch',
    '--jumi-border-image-repeat-y': 'stretch',
  },
  'border-image-slice': {
    '--jumi-border-image-slice': '100%',
  },
  'border-image-source': {
    '--jumi-border-image-source': 'none',
  },
  'border-image-width': {
    '--jumi-border-image-width': '1',
  },
  'border-inline': {
    '--jumi-border-inline-end-radius': '0',
    '--jumi-border-inline-end-width': 'medium',
    '--jumi-border-inline-start-radius': '0',
    '--jumi-border-inline-start-width': 'medium',
    '--jumi-border-inline-width': 'medium',
  },
  'border-inline-color': {
    '--jumi-border-inline-color': 'currentColor',
  },
  'border-inline-end': {
    '--jumi-border-inline-end': borderInlineEnd,
  },
  'border-inline-end-color': {
    '--jumi-border-inline-end-color': 'currentColor',
  },
  'border-inline-end-style': {
    '--jumi-border-inline-end-style': 'none',
  },
  'border-inline-end-width': {
    '--jumi-border-inline-end-width': 'medium',
  },
  'border-inline-start': {
    '--jumi-border-inline-start': borderInlineStart,
  },
  'border-inline-start-color': {
    '--jumi-border-inline-start-color': 'currentColor',
  },
  'border-inline-start-style': {
    '--jumi-border-inline-start-style': 'none',
  },
  'border-inline-start-width': {
    '--jumi-border-inline-start-width': 'medium',
  },
  'border-inline-style': {
    '--jumi-border-inline-style': 'none',
  },
  'border-inline-width': {
    '--jumi-border-inline-width': 'medium',
  },
  'border-left': {
    '--jumi-border-left': borderLeft,
    '--jumi-border-left-radius': '0',
    '--jumi-border-left-style': 'none',
    '--jumi-border-left-width': 'medium',
  },
  'border-left-color': {
    '--jumi-border-left-color': 'currentColor',
  },
  'border-left-style': {
    '--jumi-border-left-style': 'none',
  },
  'border-left-width': {
    '--jumi-border-left-width': 'medium',
  },
  'border-radius': {
    '--jumi-border-end-end-radius': '0',
    '--jumi-border-end-start-radius': '0',
    '--jumi-border-radius': borderRadius,
    '--jumi-border-start-end-radius': '0',
    '--jumi-border-start-start-radius': '0',
  },
  'border-right': {
    '--jumi-border-right': borderRight,
    '--jumi-border-right-radius': '0',
    '--jumi-border-right-style': 'none',
    '--jumi-border-right-width': 'medium',
  },
  'border-right-color': {
    '--jumi-border-right-color': 'currentColor',
  },
  'border-right-style': {
    '--jumi-border-right-style': 'none',
  },
  'border-right-width': {
    '--jumi-border-right-width': 'medium',
  },
  'border-spacing': {
    '--jumi-border-spacing': '0',
  },
  'border-start-end-radius': {
    '--jumi-border-start-end-radius': '0',
  },
  'border-start-start-radius': {
    '--jumi-border-start-start-radius': '0',
  },
  'border-style': {
    '--jumi-border-style': 'none',
  },
  'border-top': {
    '--jumi-border-top': borderTop,
    '--jumi-border-top-left-radius': '0',
    '--jumi-border-top-radius': '0',
    '--jumi-border-top-right-radius': '0',
    '--jumi-border-top-style': 'none',
    '--jumi-border-top-width': 'medium',
  },
  'border-top-color': {
    '--jumi-border-top-color': 'currentColor',
  },
  'border-top-left-radius': {
    '--jumi-border-top-left-radius': '0',
  },
  'border-top-right-radius': {
    '--jumi-border-top-right-radius': '0',
  },
  'border-top-style': {
    '--jumi-border-top-style': 'none',
  },
  'border-top-width': {
    '--jumi-border-top-width': 'medium',
  },
  'border-width': {
    '--jumi-border-width': 'medium',
  },
  'bottom': {
    '--jumi-bottom': 'auto',
  },
  'box-decoration-break': {
    '--jumi-box-decoration-break': 'slice',
  },
  'box-shadow': {
    '--jumi-box-shadow': boxShadow,
    '--jumi-box-shadow-blur': '0',
    '--jumi-box-shadow-color': 'transparent',
    '--jumi-box-shadow-inset': boxShadowInset,
    '--jumi-box-shadow-inset-blur': '0',
    '--jumi-box-shadow-inset-color': 'transparent',
    '--jumi-box-shadow-inset-offset-x': '0',
    '--jumi-box-shadow-inset-offset-y': '0',
    '--jumi-box-shadow-inset-opacity': '1',
    '--jumi-box-shadow-inset-spread': '0',
    '--jumi-box-shadow-offset-x': '0',
    '--jumi-box-shadow-offset-y': '0',
    '--jumi-box-shadow-opacity': '1',
    '--jumi-box-shadow-spread': '0',
  },
  'box-shadow-inset': {
    '--jumi-box-shadow-inset': boxShadowInset,
  },
  'box-sizing': {
    '--jumi-box-sizing': 'content-box',
  },
  'break-after': {
    '--jumi-break-after': 'auto',
  },
  'break-before': {
    '--jumi-break-before': 'auto',
  },
  'break-inside': {
    '--jumi-break-inside': 'auto',
  },
  'caption-side': {
    '--jumi-caption-side': 'top',
  },
  'caret-color': {
    '--jumi-caret-color': 'auto',
  },
  'clear': {
    '--jumi-clear': 'none',
  },
  'clip-path': {
    '--jumi-clip-path': 'none',
  },
  'clip-rule': {
    '--jumi-clip-rule': 'nonzero',
  },
  'color': {
    '--jumi-color': 'canvastext',
  },
  'color-interpolation': {
    '--jumi-color-interpolation': 'auto',
  },
  'color-interpolation-filters': {
    '--jumi-color-interpolation-filters': 'linearRGB',
  },
  'color-scheme': {
    '--jumi-color-scheme': 'normal',
  },
  'column-count': {
    '--jumi-column-count': 'auto',
  },
  'column-fill': {
    '--jumi-column-fill': 'balance',
  },
  'column-gap': {
    '--jumi-column-gap': 'normal',
  },
  'column-rule': {
    '--jumi-column-rule': columnRule,
    '--jumi-column-rule-color': 'medium',
    '--jumi-column-rule-style': 'none',
    '--jumi-column-rule-width': 'currentColor',
  },
  'column-rule-color': {
    '--jumi-column-rule-color': 'currentColor',
  },
  'column-rule-style': {
    '--jumi-column-rule-style': 'none',
  },
  'column-rule-width': {
    '--jumi-column-rule-width': 'medium',
  },
  'column-span': {
    '--jumi-column-span': 'none',
  },
  'column-width': {
    '--jumi-column-width': 'auto',
  },
  'columns': {
    '--jumi-columns': columns,
  },
  'contain': {
    '--jumi-contain': 'none',
  },
  'contain-intrinsic-block-size': {
    '--jumi-contain-intrinsic-block-size': 'none',
  },
  'contain-intrinsic-height': {
    '--jumi-contain-intrinsic-height': 'none',
  },
  'contain-intrinsic-inline-size': {
    '--jumi-contain-intrinsic-inline-size': 'none',
  },
  'contain-intrinsic-size': {
    '--jumi-contain-intrinsic-size': 'none',
  },
  'contain-intrinsic-width': {
    '--jumi-contain-intrinsic-width': 'none',
  },
  'content': {
    '--jumi-content': 'normal',
  },
  'content-visibility': {
    '--jumi-content-visibility': 'visible',
  },
  'counter-increment': {
    '--jumi-counter-increment': 'none',
  },
  'counter-reset': {
    '--jumi-counter-reset': 'none',
  },
  'counter-set': {
    '--jumi-counter-set': 'none',
  },
  'cursor': {
    '--jumi-cursor': 'auto',
  },
  'cx': {
    '--jumi-cx': '0',
  },
  'cy': {
    '--jumi-cy': '0',
  },
  'd': {
    '--jumi-d': 'none',
  },
  'display': {
    '--jumi-display': 'inline',
    '--jumi-display-inside': 'flow',
    '--jumi-display-outside': 'block',
  },
  'dominant-baseline': {
    '--jumi-dominant-baseline': 'auto',
  },
  'empty-cells': {
    '--jumi-empty-cells': 'show',
  },
  'fill': {
    '--jumi-fill': 'black',
    '--jumi-fill-opacity': '1',
    '--jumi-fill-rule': 'nonzero',
  },
  'fill-opacity': {
    '--jumi-fill-opacity': '1',
  },
  'fill-rule': {
    '--jumi-fill-rule': 'nonzero',
  },
  'filter': {
    '--jumi-filter': filter,
    '--jumi-filter-blur': css('blur', '0'),
    '--jumi-filter-brightness': css('brightness', '1'),
    '--jumi-filter-contrast': css('contrast', '1'),
    '--jumi-filter-drop-shadow': filterDropShadow,
    '--jumi-filter-drop-shadow-blur': '0',
    '--jumi-filter-drop-shadow-color': 'transparent',
    '--jumi-filter-drop-shadow-offset-x': '0',
    '--jumi-filter-drop-shadow-offset-y': '0',
    '--jumi-filter-drop-shadow-opacity': '1',
    '--jumi-filter-grayscale': css('grayscale', '0'),
    '--jumi-filter-hue-rotate': css('hue-rotate', '0deg'),
    '--jumi-filter-invert': css('invert', '0'),
    '--jumi-filter-opacity': css('opacity', '1'),
    '--jumi-filter-saturate': css('saturate', '1'),
    '--jumi-filter-sepia': css('sepia', '0'),
    '--jumi-filter-url': css('url'),
  },
  'flex': {
    '--jumi-flex': flex,
    '--jumi-flex-basis': 'auto',
    '--jumi-flex-direction': 'row',
    '--jumi-flex-flow': flexFlow,
    '--jumi-flex-grow': '0',
    '--jumi-flex-shrink': '1',
    '--jumi-flex-wrap': 'nowrap',
  },
  'flex-basis': {
    '--jumi-flex-basis': 'auto',
  },
  'flex-direction': {
    '--jumi-flex-direction': 'row',
  },
  'flex-flow': {
    '--jumi-flex-flow': flexFlow,
  },
  'flex-grow': {
    '--jumi-flex-grow': '0',
  },
  'flex-shrink': {
    '--jumi-flex-shrink': '1',
  },
  'flex-wrap': {
    '--jumi-flex-wrap': 'nowrap',
  },
  'float': {
    '--jumi-float': 'none',
  },
  'flood-color': {
    '--jumi-flood-color': 'black',
  },
  'flood-opacity': {
    '--jumi-flood-opacity': '1',
  },
  'font': {
    '--jumi-font': font,
    '--jumi-font-family': 'inherit',
    '--jumi-font-feature-settings': 'normal',
    '--jumi-font-kerning': 'auto',
    '--jumi-font-language-override': 'normal',
    '--jumi-font-optical-sizing': 'auto',
    '--jumi-font-palette': 'normal',
    '--jumi-font-size': 'medium',
    '--jumi-font-size-adjust': 'none',
    '--jumi-font-style': 'normal',
    '--jumi-font-synthesis': fontSynthesis,
    '--jumi-font-synthesis-position': 'none',
    '--jumi-font-synthesis-small-caps': 'auto',
    '--jumi-font-synthesis-style': 'auto',
    '--jumi-font-synthesis-weight': 'auto',
    '--jumi-font-variant': 'normal',
    '--jumi-font-variant-alternates': 'normal',
    '--jumi-font-variant-caps': 'normal',
    '--jumi-font-variant-east-asian': 'normal',
    '--jumi-font-variant-emoji': 'normal',
    '--jumi-font-variant-ligatures': 'normal',
    '--jumi-font-variant-numeric': 'normal',
    '--jumi-font-variant-position': 'normal',
    '--jumi-font-variation-settings': 'normal',
    '--jumi-font-weight': 'normal',
  },
  'font-family': {
    '--jumi-font-family': 'inherit',
  },
  'font-feature-settings': {
    '--jumi-font-feature-settings': 'normal',
  },
  'font-kerning': {
    '--jumi-font-kerning': 'auto',
  },
  'font-language-override': {
    '--jumi-font-language-override': 'normal',
  },
  'font-optical-sizing': {
    '--jumi-font-optical-sizing': 'auto',
  },
  'font-palette': {
    '--jumi-font-palette': 'normal',
  },
  'font-size': {
    '--jumi-font-size': 'medium',
  },
  'font-size-adjust': {
    '--jumi-font-size-adjust': 'none',
  },
  'font-style': {
    '--jumi-font-style': 'normal',
  },
  'font-synthesis': {
    '--jumi-font-synthesis': fontSynthesis,
  },
  'font-synthesis-position': {
    '--jumi-font-synthesis-position': 'none',
  },
  'font-synthesis-small-caps': {
    '--jumi-font-synthesis-small-caps': 'auto',
  },
  'font-synthesis-style': {
    '--jumi-font-synthesis-style': 'auto',
  },
  'font-synthesis-weight': {
    '--jumi-font-synthesis-weight': 'auto',
  },
  'font-variant': {
    '--jumi-font-variant': 'normal',
  },
  'font-variant-alternates': {
    '--jumi-font-variant-alternates': 'normal',
  },
  'font-variant-caps': {
    '--jumi-font-variant-caps': 'normal',
  },
  'font-variant-east-asian': {
    '--jumi-font-variant-east-asian': 'normal',
  },
  'font-variant-emoji': {
    '--jumi-font-variant-emoji': 'normal',
  },
  'font-variant-ligatures': {
    '--jumi-font-variant-ligatures': 'normal',
  },
  'font-variant-numeric': {
    '--jumi-font-variant-numeric': 'normal',
  },
  'font-variant-position': {
    '--jumi-font-variant-position': 'normal',
  },
  'font-variation-settings': {
    '--jumi-font-variation-settings': 'normal',
  },
  'font-weight': {
    '--jumi-font-weight': 'normal',
  },
  'forced-color-adjust': {
    '--jumi-forced-color-adjust': 'auto',
  },
  'gap': {
    '--jumi-gap': '0',
  },
  'grid': {
    '--jumi-grid': grid,
    '--jumi-grid-auto-columns': 'auto',
    '--jumi-grid-auto-flow': 'row',
    '--jumi-grid-auto-rows': 'auto',
    '--jumi-grid-column': gridColumn,
    '--jumi-grid-column-end': 'auto',
    '--jumi-grid-column-start': 'auto',
    '--jumi-grid-row': gridRow,
    '--jumi-grid-row-end': 'auto',
    '--jumi-grid-row-start': 'auto',
    '--jumi-grid-template-areas': 'none',
    '--jumi-grid-template-columns': 'none',
    '--jumi-grid-template-rows': 'none',
  },
  'grid-auto-columns': {
    '--jumi-grid-auto-columns': 'auto',
  },
  'grid-auto-flow': {
    '--jumi-grid-auto-flow': 'row',
  },
  'grid-auto-rows': {
    '--jumi-grid-auto-rows': 'auto',
  },
  'grid-column': {
    '--jumi-grid-column': gridColumn,
  },
  'grid-column-end': {
    '--jumi-grid-column-end': 'auto',
  },
  'grid-column-start': {
    '--jumi-grid-column-start': 'auto',
  },
  'grid-row': {
    '--jumi-grid-row': gridRow,
  },
  'grid-row-end': {
    '--jumi-grid-row-end': 'auto',
  },
  'grid-row-start': {
    '--jumi-grid-row-start': 'auto',
  },
  'grid-template-areas': {
    '--jumi-grid-template-areas': 'none',
  },
  'grid-template-columns': {
    '--jumi-grid-template-columns': 'none',
  },
  'grid-template-rows': {
    '--jumi-grid-template-rows': 'none',
  },
  'hanging-punctuation': {
    '--jumi-hanging-punctuation': 'none',
  },
  'height': {
    '--jumi-height': 'auto',
  },
  'hyphenate-character': {
    '--jumi-hyphenate-character': 'auto',
  },
  'hyphenate-limit-chars': {
    '--jumi-hyphenate-limit-chars': hyphenateLimitChars,
    '--jumi-hyphenate-limit-minimum-characters-after': 'auto',
    '--jumi-hyphenate-limit-minimum-characters-before': 'auto',
    '--jumi-hyphenate-limit-minimum-word-length': 'auto',
  },
  'hyphens': {
    '--jumi-hyphens': 'manual',
  },
  'image-orientation': {
    '--jumi-image-orientation': 'from-image',
  },
  'image-rendering': {
    '--jumi-image-rendering': 'auto',
  },
  'initial-letter': {
    '--jumi-initial-letter': 'normal',
  },
  'inline-size': {
    '--jumi-inline-size': 'auto',
  },
  'inset': {
    '--jumi-inset': inset,
    '--jumi-inset-block': insetBlock,
    '--jumi-inset-block-end': 'auto',
    '--jumi-inset-block-start': 'auto',
    '--jumi-inset-inline': insetInline,
    '--jumi-inset-inline-end': 'auto',
    '--jumi-inset-inline-start': 'auto',
  },
  'inset-block': {
    '--jumi-inset-block': insetBlock,
  },
  'inset-block-end': {
    '--jumi-inset-block-end': 'auto',
  },
  'inset-block-start': {
    '--jumi-inset-block-start': 'auto',
  },
  'inset-inline': {
    '--jumi-inset-inline': insetInline,
  },
  'inset-inline-end': {
    '--jumi-inset-inline-end': 'auto',
  },
  'inset-inline-start': {
    '--jumi-inset-inline-start': 'auto',
  },
  'justify-content': {
    '--jumi-justify-content': 'normal',
  },
  'justify-items': {
    '--jumi-justify-items': 'legacy',
  },
  'justify-self': {
    '--jumi-justify-self': 'auto',
  },
  'left': {
    '--jumi-left': 'auto',
  },
  'letter-spacing': {
    '--jumi-letter-spacing': 'normal',
  },
  'lighting-color': {
    '--jumi-lighting-color': 'white',
  },
  'line-break': {
    '--jumi-line-break': 'auto',
  },
  'line-clamp': {
    '--jumi-line-clamp': 'none',
  },
  'line-height': {
    '--jumi-line-height': 'normal',
  },
  'list-style': {
    '--jumi-list-style': listStyle,
    '--jumi-list-style-image': 'none',
    '--jumi-list-style-position': 'outside',
    '--jumi-list-style-type': 'disc',
  },
  'list-style-image': {
    '--jumi-list-style-image': 'none',
  },
  'list-style-position': {
    '--jumi-list-style-position': 'outside',
  },
  'list-style-type': {
    '--jumi-list-style-type': 'disc',
  },
  'margin': {
    '--jumi-margin': margin,
    '--jumi-margin-block': marginBlock,
    '--jumi-margin-block-end': '0',
    '--jumi-margin-block-start': '0',
    '--jumi-margin-bottom': '0',
    '--jumi-margin-inline': marginInline,
    '--jumi-margin-inline-end': '0',
    '--jumi-margin-inline-start': '0',
    '--jumi-margin-left': '0',
    '--jumi-margin-right': '0',
    '--jumi-margin-top': '0',
  },
  'margin-block': {
    '--jumi-margin-block': marginBlock,
  },
  'margin-block-end': {
    '--jumi-margin-block-end': '0',
  },
  'margin-block-start': {
    '--jumi-margin-block-start': '0',
  },
  'margin-bottom': {
    '--jumi-margin-bottom': '0',
  },
  'margin-inline': {
    '--jumi-margin-inline': marginInline,
  },
  'margin-inline-end': {
    '--jumi-margin-inline-end': '0',
  },
  'margin-inline-start': {
    '--jumi-margin-inline-start': '0',
  },
  'margin-left': {
    '--jumi-margin-left': '0',
  },
  'margin-right': {
    '--jumi-margin-right': '0',
  },
  'margin-top': {
    '--jumi-margin-top': '0',
  },
  'marker': {
    '--jumi-marker': marker,
    '--jumi-marker-end': 'none',
    '--jumi-marker-mid': 'none',
    '--jumi-marker-start': 'none',
  },
  'marker-end': {
    '--jumi-marker-end': 'none',
  },
  'marker-mid': {
    '--jumi-marker-mid': 'none',
  },
  'marker-start': {
    '--jumi-marker-start': 'none',
  },
  'mask': {
    '--jumi-mask': 'none',
  },
  'mask-border': {
    '--jumi-mask-border': 'none',
  },
  'mask-border-mode': {
    '--jumi-mask-border-mode': 'alpha',
  },
  'mask-border-outset': {
    '--jumi-mask-border-outset': maskBorderOutset,
    '--jumi-mask-border-outset-bottom': '0',
    '--jumi-mask-border-outset-left': '0',
    '--jumi-mask-border-outset-right': '0',
    '--jumi-mask-border-outset-top': '0',
    '--jumi-mask-border-outset-x': maskBorderOutsetX,
    '--jumi-mask-border-outset-y': maskBorderOutsetY,
  },
  'mask-border-repeat': {
    '--jumi-mask-border-repeat': maskBorderRepeat,
    '--jumi-mask-border-repeat-x': 'stretch',
    '--jumi-mask-border-repeat-y': 'stretch',
  },
  'mask-border-slice': {
    '--jumi-mask-border-slice': maskBorderSlice,
    '--jumi-mask-border-slice-bottom': '0',
    '--jumi-mask-border-slice-left': '0',
    '--jumi-mask-border-slice-right': '0',
    '--jumi-mask-border-slice-top': '0',
    '--jumi-mask-border-slice-x': maskBorderSliceX,
    '--jumi-mask-border-slice-y': maskBorderSliceY,
  },
  'mask-border-source': {
    '--jumi-mask-border-source': 'none',
  },
  'mask-border-width': {
    '--jumi-mask-border-width': 'auto',
  },
  'mask-clip': {
    '--jumi-mask-clip': 'border-box',
  },
  'mask-composite': {
    '--jumi-mask-composite': 'add',
  },
  'mask-image': {
    '--jumi-mask-image': 'none',
  },
  'mask-mode': {
    '--jumi-mask-mode': 'match-source',
  },
  'mask-origin': {
    '--jumi-mask-origin': 'border-box',
  },
  'mask-position': {
    '--jumi-mask-position': maskPosition,
    '--jumi-mask-position-x': '0%',
    '--jumi-mask-position-y': '0%',
  },
  'mask-repeat': {
    '--jumi-mask-repeat': 'repeat',
  },
  'mask-size': {
    '--jumi-mask-size': 'auto',
  },
  'mask-type': {
    '--jumi-mask-type': 'luminance',
  },
  'math-depth': {
    '--jumi-math-depth': '0',
    '--jumi-math-depth-add': '0',
  },
  'math-style': {
    '--jumi-math-style': 'normal',
  },
  'max-block-size': {
    '--jumi-max-block-size': 'none',
  },
  'max-height': {
    '--jumi-max-height': 'none',
  },
  'max-inline-size': {
    '--jumi-max-inline-size': 'none',
  },
  'max-width': {
    '--jumi-max-width': 'none',
  },
  'min-block-size': {
    '--jumi-min-block-size': '0',
  },
  'min-height': {
    '--jumi-min-height': 'auto',
  },
  'min-inline-size': {
    '--jumi-min-inline-size': '0',
  },
  'min-width': {
    '--jumi-min-width': 'auto',
  },
  'mix-blend-mode': {
    '--jumi-mix-blend-mode': 'normal',
  },
  'object-fit': {
    '--jumi-object-fit': 'fill',
  },
  'object-position': {
    '--jumi-object-position': objectPosition,
    '--jumi-object-position-x': objectPositionX,
    '--jumi-object-position-x-edge': 'left',
    '--jumi-object-position-x-offset': '50%',
    '--jumi-object-position-y': objectPositionY,
    '--jumi-object-position-y-edge': 'top',
    '--jumi-object-position-y-offset': '50%',
  },
  'offset': {
    '--jumi-offset': 'none',
    '--jumi-offset-anchor': offsetAnchor,
    '--jumi-offset-anchor-x': offsetAnchorX,
    '--jumi-offset-anchor-x-edge': 'center',
    '--jumi-offset-anchor-x-offset': '0',
    '--jumi-offset-anchor-y': offsetAnchorY,
    '--jumi-offset-anchor-y-edge': 'center',
    '--jumi-offset-anchor-y-offset': '0',
    '--jumi-offset-distance': '0',
    '--jumi-offset-path': 'none',
    '--jumi-offset-position': 'normal',
    '--jumi-offset-position-x': offsetPositionX,
    '--jumi-offset-position-x-edge': 'left',
    '--jumi-offset-position-x-offset': '50%',
    '--jumi-offset-position-y': offsetPositionY,
    '--jumi-offset-position-y-edge': 'top',
    '--jumi-offset-position-y-offset': '50%',
    '--jumi-offset-rotate': 'auto',
  },
  'offset-anchor': {
    '--jumi-offset-anchor': offsetAnchor,
  },
  'offset-distance': {
    '--jumi-offset-distance': '0',
  },
  'offset-path': {
    '--jumi-offset-path': 'none',
  },
  'offset-position': {
    '--jumi-offset-position': 'normal',
  },
  'offset-rotate': {
    '--jumi-offset-rotate': 'auto',
  },
  'opacity': {
    '--jumi-opacity': '1',
  },
  'order': {
    '--jumi-order': '0',
  },
  'orphans': {
    '--jumi-orphans': '2',
  },
  'outline': {
    '--jumi-outline': outline,
    '--jumi-outline-color': 'currentColor',
    '--jumi-outline-offset': '0',
    '--jumi-outline-style': 'none',
    '--jumi-outline-width': 'medium',
  },
  'outline-offset': {
    '--jumi-outline-offset': '0',
  },
  'overflow': {
    '--jumi-overflow': overflow,
    '--jumi-overflow-anchor': 'auto',
    '--jumi-overflow-block': 'auto',
    '--jumi-overflow-clip-margin': '0px',
    '--jumi-overflow-inline': 'auto',
    '--jumi-overflow-wrap': 'normal',
    '--jumi-overflow-x': 'visible',
    '--jumi-overflow-y': 'visible',
  },
  'overflow-anchor': {
    '--jumi-overflow-anchor': 'auto',
  },
  'overflow-block': {
    '--jumi-overflow-block': 'auto',
  },
  'overflow-clip-margin': {
    '--jumi-overflow-clip-margin': '0px',
  },
  'overflow-inline': {
    '--jumi-overflow-inline': 'auto',
  },
  'overflow-wrap': {
    '--jumi-overflow-wrap': 'normal',
  },
  'overscroll-behavior': {
    '--jumi-overscroll-behavior': overscrollBehavior,
    '--jumi-overscroll-behavior-block': 'auto',
    '--jumi-overscroll-behavior-inline': 'auto',
    '--jumi-overscroll-behavior-x': 'auto',
    '--jumi-overscroll-behavior-y': 'auto',
  },
  'overscroll-behavior-block': {
    '--jumi-overscroll-behavior-block': 'auto',
  },
  'overscroll-behavior-inline': {
    '--jumi-overscroll-behavior-inline': 'auto',
  },
  'overscroll-behavior-x': {
    '--jumi-overscroll-behavior-x': 'auto',
  },
  'overscroll-behavior-y': {
    '--jumi-overscroll-behavior-y': 'auto',
  },
  'padding': {
    '--jumi-padding': padding,
    '--jumi-padding-block': paddingBlock,
    '--jumi-padding-block-end': '0',
    '--jumi-padding-block-start': '0',
    '--jumi-padding-bottom': '0',
    '--jumi-padding-inline': paddingInline,
    '--jumi-padding-inline-end': '0',
    '--jumi-padding-inline-start': '0',
    '--jumi-padding-left': '0',
    '--jumi-padding-right': '0',
    '--jumi-padding-top': '0',
  },
  'padding-block': {
    '--jumi-padding-block': paddingBlock,
  },
  'padding-block-end': {
    '--jumi-padding-block-end': '0',
  },
  'padding-block-start': {
    '--jumi-padding-block-start': '0',
  },
  'padding-bottom': {
    '--jumi-padding-bottom': '0',
  },
  'padding-inline': {
    '--jumi-padding-inline': paddingInline,
  },
  'padding-inline-end': {
    '--jumi-padding-inline-end': '0',
  },
  'padding-inline-start': {
    '--jumi-padding-inline-start': '0',
  },
  'padding-left': {
    '--jumi-padding-left': '0',
  },
  'padding-right': {
    '--jumi-padding-right': '0',
  },
  'padding-top': {
    '--jumi-padding-top': '0',
  },
  'page': {
    '--jumi-page': 'auto',
  },
  'paint-order': {
    '--jumi-paint-order': 'normal',
  },
  'perspective-origin': {
    '--jumi-perspective-origin': 'center',
  },
  'place-content': {
    '--jumi-place-content': 'normal',
  },
  'place-items': {
    '--jumi-place-items': 'normal',
  },
  'place-self': {
    '--jumi-place-self': 'auto',
  },
  'position': {
    '--jumi-position': 'static',
  },
  'resize': {
    '--jumi-resize': 'none',
  },
  'right': {
    '--jumi-right': 'auto',
  },
  'row-gap': {
    '--jumi-row-gap': '0',
  },
  'scroll-margin': {
    '--jumi-scroll-margin': '0',
    '--jumi-scroll-margin-block': '0',
    '--jumi-scroll-margin-block-end': '0',
    '--jumi-scroll-margin-block-start': '0',
    '--jumi-scroll-margin-bottom': '0',
    '--jumi-scroll-margin-inline': '0',
    '--jumi-scroll-margin-inline-end': '0',
    '--jumi-scroll-margin-inline-start': '0',
    '--jumi-scroll-margin-left': '0',
    '--jumi-scroll-margin-right': '0',
    '--jumi-scroll-margin-top': '0',
  },
  'scroll-margin-block': {
    '--jumi-scroll-margin-block': '0',
  },
  'scroll-margin-block-end': {
    '--jumi-scroll-margin-block-end': '0',
  },
  'scroll-margin-block-start': {
    '--jumi-scroll-margin-block-start': '0',
  },
  'scroll-margin-bottom': {
    '--jumi-scroll-margin-bottom': '0',
  },
  'scroll-margin-inline': {
    '--jumi-scroll-margin-inline': '0',
  },
  'scroll-margin-inline-end': {
    '--jumi-scroll-margin-inline-end': '0',
  },
  'scroll-margin-inline-start': {
    '--jumi-scroll-margin-inline-start': '0',
  },
  'scroll-margin-left': {
    '--jumi-scroll-margin-left': '0',
  },
  'scroll-margin-right': {
    '--jumi-scroll-margin-right': '0',
  },
  'scroll-margin-top': {
    '--jumi-scroll-margin-top': '0',
  },
  'scroll-padding': {
    '--jumi-scroll-padding': '0',
    '--jumi-scroll-padding-block': '0',
    '--jumi-scroll-padding-block-end': '0',
    '--jumi-scroll-padding-block-start': '0',
    '--jumi-scroll-padding-bottom': '0',
    '--jumi-scroll-padding-inline': '0',
    '--jumi-scroll-padding-inline-end': '0',
    '--jumi-scroll-padding-inline-start': '0',
    '--jumi-scroll-padding-left': '0',
    '--jumi-scroll-padding-right': '0',
    '--jumi-scroll-padding-top': '0',
  },
  'scroll-padding-block': {
    '--jumi-scroll-padding-block': '0',
  },
  'scroll-padding-block-end': {
    '--jumi-scroll-padding-block-end': '0',
  },
  'scroll-padding-block-start': {
    '--jumi-scroll-padding-block-start': '0',
  },
  'scroll-padding-bottom': {
    '--jumi-scroll-padding-bottom': '0',
  },
  'scroll-padding-inline': {
    '--jumi-scroll-padding-inline': '0',
  },
  'scroll-padding-inline-end': {
    '--jumi-scroll-padding-inline-end': '0',
  },
  'scroll-padding-inline-start': {
    '--jumi-scroll-padding-inline-start': '0',
  },
  'scroll-padding-left': {
    '--jumi-scroll-padding-left': '0',
  },
  'scroll-padding-right': {
    '--jumi-scroll-padding-right': '0',
  },
  'scroll-padding-top': {
    '--jumi-scroll-padding-top': '0',
  },
  'shape-outside': {
    '--jumi-shape-outside': 'none',
  },
  'stroke': {
    '--jumi-stroke': 'none',
  },
  'stroke-dasharray': {
    '--jumi-stroke-dasharray': 'none',
  },
  'stroke-dashoffset': {
    '--jumi-stroke-dashoffset': '0',
  },
  'stroke-linecap': {
    '--jumi-stroke-linecap': 'butt',
  },
  'stroke-linejoin': {
    '--jumi-stroke-linejoin': 'miter',
  },
  'stroke-miterlimit': {
    '--jumi-stroke-miterlimit': '4',
  },
  'stroke-opacity': {
    '--jumi-stroke-opacity': '1',
  },
  'stroke-width': {
    '--jumi-stroke-width': '1px',
  },
  'table-layout': {
    '--jumi-table-layout': 'auto',
  },
  'text-align': {
    '--jumi-text-align': 'baseline',
  },
  'text-align-last': {
    '--jumi-text-align-last': 'auto',
  },
  'text-anchor': {
    '--jumi-text-anchor': 'start',
  },
  'text-autospace': {
    '--jumi-text-autospace': 'normal',
  },
  'text-box': {
    '--jumi-text-box': 'normal',
  },
  'text-box-edge': {
    '--jumi-text-box-edge': 'leading',
  },
  'text-box-trim': {
    '--jumi-text-box-trim': 'none',
  },
  'text-combine-upright': {
    '--jumi-text-combine-upright': 'none',
  },
  'text-decoration': {
    '--jumi-text-decoration': 'none',
    '--jumi-text-decoration-color': 'currentColor',
    '--jumi-text-decoration-line': 'none',
    '--jumi-text-decoration-skip-ink': 'auto',
    '--jumi-text-decoration-style': 'solid',
    '--jumi-text-decoration-thickness': 'auto',
  },
  'text-decoration-color': {
    '--jumi-text-decoration-color': 'currentColor',
  },
  'text-decoration-line': {
    '--jumi-text-decoration-line': 'none',
  },
  'text-decoration-skip-ink': {
    '--jumi-text-decoration-skip-ink': 'auto',
  },
  'text-decoration-style': {
    '--jumi-text-decoration-style': 'solid',
  },
  'text-decoration-thickness': {
    '--jumi-text-decoration-thickness': 'auto',
  },
  'text-emphasis': {
    '--jumi-text-emphasis': 'none',
    '--jumi-text-emphasis-color': 'currentColor',
    '--jumi-text-emphasis-position': 'over right',
    '--jumi-text-emphasis-style': 'none',
  },
  'text-emphasis-color': {
    '--jumi-text-emphasis-color': 'currentColor',
  },
  'text-emphasis-position': {
    '--jumi-text-emphasis-position': 'over right',
  },
  'text-emphasis-style': {
    '--jumi-text-emphasis-style': 'none',
  },
  'text-indent': {
    '--jumi-text-indent': '0',
  },
  'text-justify': {
    '--jumi-text-justify': 'auto',
  },
  'text-orientation': {
    '--jumi-text-orientation': 'mixed',
  },
  'text-overflow': {
    '--jumi-text-overflow': 'clip',
  },
  'text-rendering': {
    '--jumi-text-rendering': 'auto',
  },
  'text-shadow': {
    '--jumi-text-shadow': textShadow,
  },
  'text-transform': {
    '--jumi-text-transform': 'none',
  },
  'text-underline-offset': {
    '--jumi-text-underline-offset': 'auto',
  },
  'text-underline-position': {
    '--jumi-text-underline-position': 'auto',
  },
  'text-wrap': {
    '--jumi-text-wrap': 'wrap',
  },
  'text-wrap-mode': {
    '--jumi-text-wrap-mode': 'wrap',
  },
  'text-wrap-style': {
    '--jumi-text-wrap-style': 'auto',
  },
  'top': {
    '--jumi-top': 'auto',
  },
  'transform': {
    '--jumi-matrix': matrix,
    '--jumi-matrix-3d': matrix3d,
    '--jumi-matrix-a': '1',
    '--jumi-matrix-a1': '1',
    '--jumi-matrix-a2': '0',
    '--jumi-matrix-a3': '0',
    '--jumi-matrix-a4': '0',
    '--jumi-matrix-b': '0',
    '--jumi-matrix-b1': '0',
    '--jumi-matrix-b2': '1',
    '--jumi-matrix-b3': '0',
    '--jumi-matrix-b4': '0',
    '--jumi-matrix-c': '0',
    '--jumi-matrix-c1': '0',
    '--jumi-matrix-c2': '0',
    '--jumi-matrix-c3': '1',
    '--jumi-matrix-c4': '0',
    '--jumi-matrix-d': '1',
    '--jumi-matrix-d1': '0',
    '--jumi-matrix-d2': '0',
    '--jumi-matrix-d3': '0',
    '--jumi-matrix-d4': '1',
    '--jumi-matrix-tx': '0',
    '--jumi-matrix-ty': '0',
    '--jumi-perspective': perspective,
    '--jumi-rotate': '0deg',
    '--jumi-rotate-3d': rotate3d,
    '--jumi-rotate-x': '0',
    '--jumi-rotate-y': '0',
    '--jumi-rotate-z': '1',
    '--jumi-scale': '1',
    '--jumi-scale-3d': scale3d,
    '--jumi-scale-x': '1',
    '--jumi-scale-y': '1',
    '--jumi-scale-z': '1',
    '--jumi-skew': skew,
    '--jumi-skew-x': '0deg',
    '--jumi-skew-y': '0deg',
    '--jumi-transform': transform,
    '--jumi-translate': '0px',
    '--jumi-translate-3d': translate3d,
    '--jumi-translate-x': translate,
    '--jumi-translate-y': translate,
    '--jumi-translate-z': '0px',
  },
  'transform-box': {
    '--jumi-transform-box': 'view-box',
  },
  'transform-origin': {
    '--jumi-transform-origin': 'center',
  },
  'transform-origin-x': {
    '--jumi-transform-origin-x': '50%',
  },
  'transform-origin-y': {
    '--jumi-transform-origin-y': '50%',
  },
  'transform-origin-z': {
    '--jumi-transform-origin-z': '0px',
  },
  'transform-style': {
    '--jumi-transform-style': 'flat',
  },
  'user-drag': {
    '--jumi-user-drag': 'auto',
  },
  'user-select': {
    '--jumi-user-select': 'auto',
  },
  'vertical-align': {
    '--jumi-vertical-align': 'baseline',
  },
  'visibility': {
    '--jumi-visibility': 'visible',
  },
  'white-space': {
    '--jumi-white-space': 'normal',
  },
  'width': {
    '--jumi-width': 'auto',
  },
  'word-break': {
    '--jumi-word-break': 'normal',
  },
  'z-index': {
    '--jumi-z-index': 'auto',
  },
}
