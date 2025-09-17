import type { PropertiesHyphen } from 'csstype'
import type {
  CSSRuleObject,
  KeyValuePair,
  RecursiveKeyValuePair,
  ThemeConfig,
  ValueType,
} from 'tailwindcss/types/config'

import type { AnimationName } from '@/theme/animation-name'

export type AddProperty = {
  [K in AddPropertyKeys as `.${K}`]?: Utility
}

export type AddPropertyKeys = 'animate'

export type AnimationKeyframes = {
  [K in AnimationName as `@keyframes ${K}`]?: Keyframes
}

export type KeyframeDefinition = Record<string, Record<string, any>>

export type Keyframes = Record<string, PropertiesHyphen>

export type MatchProperty = {
  [K in MatchPropertyKeys]: MatchPropertyValue
}

export type MatchPropertyKeys = 'animate' | `animate-${Property}`

export interface MatchPropertyValue extends Partial<Options> {
  key?: keyof ThemeConfig
  property: (value: string) => CSSRuleObject
}

export interface Options {
  modifiers: 'any' | KeyValuePair<string, string>
  respectImportant: boolean
  respectPrefix: boolean
  supportsNegativeValues: boolean
  type: ValueType | ValueType[]
  values: KeyValuePair<string, string>
}

export type Property
  = | 'accent-color'
    | 'align-content'
    | 'align-items'
    | 'align-self'
    | 'alignment-baseline'
    | 'all'
    | 'appearance'
    | 'aspect-ratio'
    | 'backdrop-blur'
    | 'backdrop-brightness'
    | 'backdrop-contrast'
    | 'backdrop-filter'
    | 'backdrop-grayscale'
    | 'backdrop-hue-rotate'
    | 'backdrop-invert'
    | 'backdrop-opacity'
    | 'backdrop-saturate'
    | 'backdrop-sepia'
    | 'background'
    | 'background-clip'
    | 'background-color'
    | 'background-image'
    | 'background-origin'
    | 'background-position'
    | 'background-size'
    | 'border-block-end-length' // bottom
    | 'border-block-end-radius' // bottom
    | 'border-block-end-width' // bottom
    | 'border-block-length' // top-bottom
    | 'border-block-start-length' // top
    | 'border-block-start-radius' // top
    | 'border-block-start-width' // top
    | 'border-block-width' // top-bottom
    | 'border-bottom-left-radius'
    | 'border-bottom-length'
    | 'border-bottom-radius'
    | 'border-bottom-right-radius'
    | 'border-bottom-width'
    | 'border-color'
    | 'border-end-end-radius' // bottom-right
    | 'border-end-start-radius' // bottom-left
    | 'border-inline-end-length' // right
    | 'border-inline-end-radius' // right
    | 'border-inline-end-width' // right
    | 'border-inline-length' // left-right
    | 'border-inline-start-length' // left
    | 'border-inline-start-radius' // left
    | 'border-inline-start-width' // left
    | 'border-inline-width' // left-right
    | 'border-left-length'
    | 'border-left-radius'
    | 'border-left-width'
    | 'border-length'
    | 'border-radius'
    | 'border-right-length'
    | 'border-right-radius'
    | 'border-right-width'
    | 'border-start-end-radius' // top-right
    | 'border-start-start-radius' // top-left
    | 'border-style'
    | 'border-top-left-radius'
    | 'border-top-length'
    | 'border-top-radius'
    | 'border-top-right-radius'
    | 'border-top-width'
    | 'border-width'
    | 'bottom'
    | 'box-shadow'
    | 'caret-color'
    | 'color'
    | 'column-count'
    | 'column-gap'
    | 'column-width'
    | 'columns'
    | 'composition'
    | 'contrast'
    | 'cursor'
    | 'delay'
    | 'direction'
    | 'display'
    | 'drop-shadow'
    | 'duration'
    | 'fill'
    | 'fill-mode'
    | 'filter'
    | 'flex'
    | 'flex-basis'
    | 'flex-direction'
    | 'flex-flow'
    | 'flex-grow'
    | 'flex-shrink'
    | 'flex-wrap'
    | 'font-family'
    | 'font-size'
    | 'font-smoothing'
    | 'font-style'
    | 'font-variant-numeric'
    | 'font-weight'
    | 'gap'
    | 'grid-auto-columns'
    | 'grid-auto-flow'
    | 'grid-auto-rows'
    | 'grid-column'
    | 'grid-column-end'
    | 'grid-column-start'
    | 'grid-row'
    | 'grid-row-end'
    | 'grid-row-start'
    | 'grid-template-columns'
    | 'grid-template-rows'
    | 'height'
    | 'inset'
    | 'inset-block'
    | 'inset-block-end'
    | 'inset-block-start'
    | 'inset-bottom'
    | 'inset-inline'
    | 'inset-inline-end'
    | 'inset-inline-start'
    | 'inset-left'
    | 'inset-right'
    | 'inset-top'
    | 'isolation'
    | 'iteration-count'
    | 'justify-content'
    | 'justify-items'
    | 'justify-self'
    | 'left'
    | 'letter-spacing'
    | 'line-height'
    | 'list-style-type'
    | 'margin'
    | 'margin-block'
    | 'margin-block-end'
    | 'margin-block-start'
    | 'margin-bottom'
    | 'margin-inline'
    | 'margin-inline-end'
    | 'margin-inline-start'
    | 'margin-left'
    | 'margin-right'
    | 'margin-top'
    | 'matrix3d'
    | 'matrix'
    | 'max-height'
    | 'max-width'
    | 'min-height'
    | 'min-width'
    | 'object-fit'
    | 'object-position'
    | 'opacity'
    | 'order'
    | 'outline'
    | 'outline-color'
    | 'outline-offset'
    | 'outline-style'
    | 'outline-width'
    | 'overflow'
    | 'overflow-x'
    | 'overflow-y'
    | 'padding'
    | 'padding-block'
    | 'padding-block-end'
    | 'padding-block-start'
    | 'padding-bottom'
    | 'padding-inline'
    | 'padding-inline-end'
    | 'padding-inline-start'
    | 'padding-left'
    | 'padding-right'
    | 'padding-top'
    | 'perspective'
    | 'perspective-origin'
    | 'place-content'
    | 'place-items'
    | 'place-self'
    | 'play-state'
    | 'position'
    | 'range'
    | 'range-end'
    | 'range-end-length'
    | 'range-end-name'
    | 'range-start'
    | 'range-start-length'
    | 'range-start-name'
    | 'resize'
    | 'right'
    | 'rotate'
    | 'rotate-3d'
    | 'rotate-3x'
    | 'rotate-3y'
    | 'rotate-3z'
    | 'rotate-x'
    | 'rotate-y'
    | 'rotate-z'
    | 'scale'
    | 'scale-3d'
    | 'scale-3x'
    | 'scale-3y'
    | 'scale-3z'
    | 'scale-sx'
    | 'scale-sy'
    | 'scale-x'
    | 'scale-y'
    | 'scale-z'
    | 'scroll-margin'
    | 'scroll-margin-block'
    | 'scroll-margin-block-end'
    | 'scroll-margin-block-start'
    | 'scroll-margin-bottom'
    | 'scroll-margin-inline'
    | 'scroll-margin-inline-end'
    | 'scroll-margin-inline-start'
    | 'scroll-margin-left'
    | 'scroll-margin-right'
    | 'scroll-margin-top'
    | 'scroll-padding'
    | 'scroll-padding-block'
    | 'scroll-padding-block-end'
    | 'scroll-padding-block-start'
    | 'scroll-padding-bottom'
    | 'scroll-padding-inline'
    | 'scroll-padding-inline-end'
    | 'scroll-padding-inline-start'
    | 'scroll-padding-left'
    | 'scroll-padding-right'
    | 'scroll-padding-top'
    | 'shadow'
    | 'shape-outside'
    | 'skew'
    | 'skew-sx'
    | 'skew-sy'
    | 'skew-x'
    | 'skew-y'
    | 'space'
    | 'space-x'
    | 'space-y'
    | 'stroke'
    | 'stroke-dasharray'
    | 'stroke-dashoffset'
    | 'stroke-width'
    | 'table-layout'
    | 'text-align'
    | 'text-decoration-color'
    | 'text-decoration-thickness'
    | 'text-indent'
    | 'text-shadow'
    | 'text-transform'
    | 'timeline'
    | 'timeline-axis'
    | 'timeline-inset'
    | 'timeline-inset-end'
    | 'timeline-inset-start'
    | 'timeline-scroller'
    | 'timing-function'
    | 'top'
    | 'transform'
    | 'transform-origin'
    | 'transform-style'
    | 'transition'
    | 'transition-delay'
    | 'transition-duration'
    | 'transition-property'
    | 'transition-timing-function'
    | 'translate'
    | 'translate-3d'
    | 'translate-3x'
    | 'translate-3y'
    | 'translate-3z'
    | 'translate-sx'
    | 'translate-sy'
    | 'translate-x'
    | 'translate-y'
    | 'translate-z'
    | 'user-drag'
    | 'user-select'
    | 'vertical-align'
    | 'visibility'
    | 'white-space'
    | 'width'
    | 'word-break'
    | 'z-index'

export type PropertyKeyframes = {
  [K in Property as `@keyframes jumi-${K}`]?: Keyframes
}

export type Utility = RecursiveKeyValuePair<string, null | string | string[]>
