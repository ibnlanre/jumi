import type { Property } from 'csstype'

import type { PropertyKeyframes } from '@/types'

export const propertyKeyframes: PropertyKeyframes = {
  '@keyframes jumi-accent-color': {
    to: {
      'accent-color': 'var(--jumi-accent-color)',
    },
  },
  '@keyframes jumi-align-content': {
    to: {
      'align-content': 'var(--jumi-align-content)',
    },
  },
  '@keyframes jumi-align-items': {
    to: {
      'align-items': 'var(--jumi-align-items)',
    },
  },
  '@keyframes jumi-align-self': {
    to: {
      'align-self': 'var(--jumi-align-self)',
    },
  },
  '@keyframes jumi-alignment-baseline': {
    to: {
      'alignment-baseline':
        'var(--jumi-alignment-baseline)' as Property.AlignmentBaseline,
    },
  },
  '@keyframes jumi-all': {
    to: {
      all: 'var(--jumi-all)' as Property.All,
    },
  },
  '@keyframes jumi-appearance': {
    to: {
      appearance: 'var(--jumi-appearance)' as Property.Appearance,
    },
  },
  '@keyframes jumi-backdrop-blur': {
    to: {
      'backdrop-filter': 'blur(var(--jumi-backdrop-blur))',
    },
  },
  '@keyframes jumi-backdrop-brightness': {
    to: {
      'backdrop-filter': 'brightness(var(--jumi-backdrop-brightness))',
    },
  },
  '@keyframes jumi-backdrop-contrast': {
    to: {
      'backdrop-filter': 'contrast(var(--jumi-backdrop-contrast))',
    },
  },
  '@keyframes jumi-backdrop-filter': {
    to: {
      'backdrop-filter': 'var(--jumi-backdrop-filter)',
    },
  },
  '@keyframes jumi-backdrop-grayscale': {
    to: {
      'backdrop-filter': 'grayscale(var(--jumi-backdrop-grayscale))',
    },
  },
  '@keyframes jumi-backdrop-hue-rotate': {
    to: {
      'backdrop-filter': 'hue-rotate(var(--jumi-backdrop-hue-rotate))',
    },
  },
  '@keyframes jumi-backdrop-invert': {
    to: {
      'backdrop-filter': 'invert(var(--jumi-backdrop-invert))',
    },
  },
  '@keyframes jumi-backdrop-opacity': {
    to: {
      'backdrop-filter': 'opacity(var(--jumi-backdrop-opacity))',
    },
  },
  '@keyframes jumi-backdrop-saturate': {
    to: {
      'backdrop-filter': 'saturate(var(--jumi-backdrop-saturate))',
    },
  },
  '@keyframes jumi-backdrop-sepia': {
    to: {
      'backdrop-filter': 'sepia(var(--jumi-backdrop-sepia))',
    },
  },
  '@keyframes jumi-background': {
    to: {
      background: 'var(--jumi-background)',
    },
  },
  '@keyframes jumi-background-color': {
    to: {
      'background-color': 'var(--jumi-background-color)',
    },
  },
  '@keyframes jumi-background-position': {
    to: {
      'background-position': 'var(--jumi-background-position)',
    },
  },
  '@keyframes jumi-background-size': {
    to: {
      'background-size': 'var(--jumi-background-size)',
    },
  },
  '@keyframes jumi-border-block-end-radius': {
    to: {
      'border-end-end-radius': 'var(--jumi-border-end-end-radius)',
      'border-end-start-radius': 'var(--jumi-border-end-start-radius)',
    },
  },
  '@keyframes jumi-border-block-end-width': {
    to: {
      'border-block-end-width': 'var(--jumi-border-block-end-width)',
    },
  },
  '@keyframes jumi-border-block-start-radius': {
    to: {
      'border-start-end-radius': 'var(--jumi-border-start-end-radius)',
      'border-start-start-radius': 'var(--jumi-border-start-start-radius)',
    },
  },
  '@keyframes jumi-border-block-start-width': {
    to: {
      'border-block-start-width': 'var(--jumi-border-block-start-width)',
    },
  },
  '@keyframes jumi-border-block-width': {
    to: {
      'border-block-end-width': 'var(--jumi-border-block-end-width)',
      'border-block-start-width': 'var(--jumi-border-block-start-width)',
    },
  },
  '@keyframes jumi-border-bottom-left-radius': {
    to: {
      'border-bottom-left-radius': 'var(--jumi-border-bottom-left-radius)',
    },
  },
  '@keyframes jumi-border-bottom-length': {
    from: {
      width: '0%',
    },
    to: {
      width: '100%',
    },
  },
  '@keyframes jumi-border-bottom-radius': {
    to: {
      'border-bottom-left-radius': 'var(--jumi-border-bottom-left-radius)',
      'border-bottom-right-radius': 'var(--jumi-border-bottom-right-radius)',
    },
  },
  '@keyframes jumi-border-bottom-right-radius': {
    to: {
      'border-bottom-right-radius': 'var(--jumi-border-bottom-right-radius)',
    },
  },
  '@keyframes jumi-border-bottom-width': {
    to: {
      'border-bottom-width': 'var(--jumi-border-bottom-width)',
    },
  },
  '@keyframes jumi-border-color': {
    to: {
      'border-color': 'var(--jumi-border-color)',
    },
  },
  '@keyframes jumi-border-end-end-radius': {
    to: {
      'border-end-end-radius': 'var(--jumi-border-end-end-radius)',
    },
  },
  '@keyframes jumi-border-end-start-radius': {
    to: {
      'border-end-start-radius': 'var(--jumi-border-end-start-radius)',
    },
  },
  '@keyframes jumi-border-inline-end-radius': {
    to: {
      'border-end-end-radius': 'var(--jumi-border-end-end-radius)',
      'border-start-end-radius': 'var(--jumi-border-start-end-radius)',
    },
  },
  '@keyframes jumi-border-inline-end-width': {
    to: {
      'border-inline-end-width': 'var(--jumi-border-inline-end-width)',
    },
  },
  '@keyframes jumi-border-inline-start-radius': {
    to: {
      'border-end-start-radius': 'var(--jumi-border-end-start-radius)',
      'border-start-start-radius': 'var(--jumi-border-start-start-radius)',
    },
  },
  '@keyframes jumi-border-inline-start-width': {
    to: {
      'border-inline-start-width': 'var(--jumi-border-inline-start-width)',
    },
  },
  '@keyframes jumi-border-inline-width': {
    to: {
      'border-inline-end-width': 'var(--jumi-border-inline-end-width)',
      'border-inline-start-width': 'var(--jumi-border-inline-start-width)',
    },
  },

  '@keyframes jumi-border-left-length': {
    from: {
      height: '0%',
    },
    to: {
      height: '100%',
    },
  },
  '@keyframes jumi-border-left-radius': {
    to: {
      'border-bottom-left-radius': 'var(--jumi-border-bottom-left-radius)',
      'border-top-left-radius': 'var(--jumi-border-top-left-radius)',
    },
  },
  '@keyframes jumi-border-left-width': {
    to: {
      'border-left-width': 'var(--jumi-border-left-width)',
    },
  },
  '@keyframes jumi-border-length': {
    from: {
      height: '0%',
      width: '0%',
    },
    to: {
      height: '100%',
      width: '100%',
    },
  },
  '@keyframes jumi-border-radius': {
    to: {
      'border-radius': 'var(--jumi-border-radius)',
    },
  },
  '@keyframes jumi-border-right-length': {
    from: {
      height: '0%',
    },
    to: {
      height: '100%',
    },
  },
  '@keyframes jumi-border-right-radius': {
    to: {
      'border-bottom-right-radius': 'var(--jumi-border-bottom-right-radius)',
      'border-top-right-radius': 'var(--jumi-border-top-right-radius)',
    },
  },
  '@keyframes jumi-border-right-width': {
    to: {
      'border-right-width': 'var(--jumi-border-right-width)',
    },
  },
  '@keyframes jumi-border-start-end-radius': {
    to: {
      'border-start-end-radius': 'var(--jumi-border-start-end-radius)',
    },
  },
  '@keyframes jumi-border-start-start-radius': {
    to: {
      'border-start-start-radius': 'var(--jumi-border-start-start-radius)',
    },
  },
  '@keyframes jumi-border-top-left-radius': {
    to: {
      'border-top-left-radius': 'var(--jumi-border-top-left-radius)',
    },
  },
  '@keyframes jumi-border-top-length': {
    from: {
      width: '0%',
    },
    to: {
      width: '100%',
    },
  },
  '@keyframes jumi-border-top-radius': {
    to: {
      'border-top-left-radius': 'var(--jumi-border-top-left-radius)',
      'border-top-right-radius': 'var(--jumi-border-top-right-radius)',
    },
  },
  '@keyframes jumi-border-top-right-radius': {
    to: {
      'border-top-right-radius': 'var(--jumi-border-top-right-radius)',
    },
  },
  '@keyframes jumi-border-top-width': {
    to: {
      'border-top-width': 'var(--jumi-border-top-width)',
    },
  },
  '@keyframes jumi-border-width': {
    to: {
      'border-width': 'var(--jumi-border-width)',
    },
  },
  '@keyframes jumi-bottom': {
    to: {
      bottom: 'var(--jumi-bottom)',
    },
  },
  '@keyframes jumi-box-shadow': {
    to: {
      'box-shadow': 'var(--jumi-box-shadow)',
    },
  },
  '@keyframes jumi-color': {
    to: {
      color: 'var(--jumi-color)',
    },
  },
  '@keyframes jumi-display': {
    to: {
      display: 'var(--jumi-display)' as Property.Display,
    },
  },
  '@keyframes jumi-fill': {
    to: {
      fill: 'var(--jumi-fill)',
    },
  },
  '@keyframes jumi-filter': {
    to: {
      filter: 'var(--jumi-filter)',
    },
  },
  '@keyframes jumi-flex': {
    to: {
      flex: 'var(--jumi-flex)',
    },
  },
  '@keyframes jumi-flex-basis': {
    to: {
      'flex-basis': 'var(--jumi-flex-basis)',
    },
  },
  '@keyframes jumi-flex-direction': {
    to: {
      'flex-direction': 'var(--jumi-flex-direction)' as Property.FlexDirection,
    },
  },
  '@keyframes jumi-flex-grow': {
    to: {
      'flex-grow': 'var(--jumi-flex-grow)',
    },
  },
  '@keyframes jumi-flex-shrink': {
    to: {
      'flex-shrink': 'var(--jumi-flex-shrink)',
    },
  },
  '@keyframes jumi-font-family': {
    to: {
      'font-family': 'var(--jumi-font-family)',
    },
  },
  '@keyframes jumi-font-size': {
    to: {
      'font-size': 'var(--jumi-font-size)',
    },
  },
  '@keyframes jumi-font-weight': {
    to: {
      'font-weight': 'var(--jumi-font-weight)',
    },
  },
  '@keyframes jumi-gap': {
    to: {
      gap: 'var(--jumi-gap)',
    },
  },
  '@keyframes jumi-height': {
    to: {
      height: 'var(--jumi-height)',
    },
  },
  '@keyframes jumi-inset': {
    to: {
      inset: 'var(--jumi-inset)',
    },
  },
  '@keyframes jumi-justify-content': {
    to: {
      'justify-content':
        'var(--jumi-justify-content)' as Property.JustifyContent,
    },
  },
  '@keyframes jumi-left': {
    to: {
      left: 'var(--jumi-left)',
    },
  },
  '@keyframes jumi-letter-spacing': {
    to: {
      'letter-spacing': 'var(--jumi-letter-spacing)',
    },
  },
  '@keyframes jumi-line-height': {
    to: {
      'line-height': 'var(--jumi-line-height)',
    },
  },
  '@keyframes jumi-margin': {
    to: {
      margin: 'var(--jumi-margin)',
    },
  },
  '@keyframes jumi-margin-block': {
    to: {
      'margin-bottom': 'var(--jumi-margin-block)',
      'margin-top': 'var(--jumi-margin-block)',
    },
  },
  '@keyframes jumi-margin-bottom': {
    to: {
      'margin-bottom': 'var(--jumi-margin-bottom)',
    },
  },
  '@keyframes jumi-margin-inline': {
    to: {
      'margin-left': 'var(--jumi-margin-inline)',
      'margin-right': 'var(--jumi-margin-inline)',
    },
  },
  '@keyframes jumi-margin-left': {
    to: {
      'margin-left': 'var(--jumi-margin-left)',
    },
  },
  '@keyframes jumi-margin-right': {
    to: {
      'margin-right': 'var(--jumi-margin-right)',
    },
  },
  '@keyframes jumi-margin-top': {
    to: {
      'margin-top': 'var(--jumi-margin-top)',
    },
  },
  '@keyframes jumi-max-height': {
    to: {
      'max-height': 'var(--jumi-max-height)',
    },
  },
  '@keyframes jumi-max-width': {
    to: {
      'max-width': 'var(--jumi-max-width)',
    },
  },
  '@keyframes jumi-min-height': {
    to: {
      'min-height': 'var(--jumi-min-height)',
    },
  },
  '@keyframes jumi-min-width': {
    to: {
      'min-width': 'var(--jumi-min-width)',
    },
  },
  '@keyframes jumi-opacity': {
    to: {
      opacity: 'var(--jumi-opacity)',
    },
  },
  '@keyframes jumi-order': {
    to: {
      order: 'var(--jumi-order)',
    },
  },
  '@keyframes jumi-outline': {
    to: {
      outline: 'var(--jumi-outline)',
    },
  },
  '@keyframes jumi-outline-color': {
    to: {
      'outline-color': 'var(--jumi-outline-color)',
    },
  },
  '@keyframes jumi-outline-offset': {
    to: {
      'outline-offset': 'var(--jumi-outline-offset)',
    },
  },
  '@keyframes jumi-outline-width': {
    to: {
      'outline-width': 'var(--jumi-outline-width)',
    },
  },
  '@keyframes jumi-overflow': {
    to: {
      overflow: 'var(--jumi-overflow)' as Property.Overflow,
    },
  },
  '@keyframes jumi-overflow-x': {
    to: {
      'overflow-x': 'var(--jumi-overflow-x)' as Property.OverflowX,
    },
  },
  '@keyframes jumi-overflow-y': {
    to: {
      'overflow-y': 'var(--jumi-overflow-y)' as Property.OverflowY,
    },
  },
  '@keyframes jumi-padding': {
    to: {
      padding: 'var(--jumi-padding)',
    },
  },
  '@keyframes jumi-padding-block': {
    to: {
      'padding-bottom': 'var(--jumi-padding-block)',
      'padding-top': 'var(--jumi-padding-block)',
    },
  },
  '@keyframes jumi-padding-bottom': {
    to: {
      'padding-bottom': 'var(--jumi-padding-bottom)',
    },
  },
  '@keyframes jumi-padding-inline': {
    to: {
      'padding-left': 'var(--jumi-padding-inline)',
      'padding-right': 'var(--jumi-padding-inline)',
    },
  },
  '@keyframes jumi-padding-left': {
    to: {
      'padding-left': 'var(--jumi-padding-left)',
    },
  },
  '@keyframes jumi-padding-right': {
    to: {
      'padding-right': 'var(--jumi-padding-right)',
    },
  },
  '@keyframes jumi-padding-top': {
    to: {
      'padding-top': 'var(--jumi-padding-top)',
    },
  },
  '@keyframes jumi-position': {
    to: {
      position: 'var(--jumi-position)' as Property.Position,
    },
  },
  '@keyframes jumi-right': {
    to: {
      right: 'var(--jumi-right)',
    },
  },
  '@keyframes jumi-shadow': {
    to: {
      'box-shadow': 'var(--jumi-shadow)',
    },
  },
  '@keyframes jumi-stroke': {
    to: {
      stroke: 'var(--jumi-stroke)',
    },
  },
  '@keyframes jumi-stroke-width': {
    to: {
      'stroke-width': 'var(--jumi-stroke-width)',
    },
  },
  '@keyframes jumi-text-align': {
    to: {
      'text-align': 'var(--jumi-text-align)' as Property.TextAlign,
    },
  },
  '@keyframes jumi-text-shadow': {
    to: {
      'text-shadow': 'var(--jumi-text-shadow)',
    },
  },
  '@keyframes jumi-top': {
    to: {
      top: 'var(--jumi-top)',
    },
  },
  '@keyframes jumi-width': {
    to: {
      width: 'var(--jumi-width)',
    },
  },
  '@keyframes jumi-z-index': {
    to: {
      'z-index': 'var(--jumi-z-index)',
    },
  },
}
