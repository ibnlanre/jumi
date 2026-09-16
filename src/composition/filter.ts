import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const filter = join(
  [
    css('var', '--jumi-filter-blur'),
    css('var', '--jumi-filter-brightness'),
    css('var', '--jumi-filter-contrast'),
    css('var', '--jumi-filter-grayscale'),
    css('var', '--jumi-filter-hue-rotate'),
    css('var', '--jumi-filter-invert'),
    css('var', '--jumi-filter-saturate'),
    css('var', '--jumi-filter-sepia'),
    css('var', '--jumi-filter-opacity'),
    css('var', '--jumi-filter-drop-shadow'),
    // The url slot is the one slot a phrase can fill whose value nothing read before, so an authored
    // url filter used to reach the chain not at all. It carries a fallback for a reason narrower than it
    // first appeared: measured 2026-09-16, `grayscale(1) url()` and `grayscale(1) url(#missing)` both
    // resolve with the url inert — an unresolved url is **ignored**, not fatal — while
    // `grayscale(1) var(--unset)` voids the whole declaration and computes to `none`. So the hazard is a
    // read that references nothing, and `opacity(1)` is the identity that keeps the chain valid when no
    // phrase wrote the slot.
    css('var', '--jumi-filter-url', css('opacity', '1')),
  ],
  ' ',
)
