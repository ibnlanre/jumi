import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * The composed value reads the two **resolved** components, not the four authoring ones.
 *
 * That is the reshape, and it is why the four no longer appear in this entry's `dependencies`: `<position>` will
 * not take two edge-plus-offset pairs, so `center 0 center 0` is a value the property rejects — measured — while
 * the resolved pair computes. The authoring components are still public and are still what the resolver reads;
 * they are declared as the family's authoring surface rather than as this composition's parts, because one list
 * cannot say both without saying the composition reads something it does not.
 */
export const offsetAnchor = join(
  [
    css('var', '--jumi-offset-anchor-x-position'),
    css('var', '--jumi-offset-anchor-y-position'),
  ],
  ' ',
)

/**
 * The per-axis authoring groups, kept as the surface an author addresses through `animate-offset-anchor-x`.
 *
 * Their composition is the edge beside its offset, which is the pair `<position>` takes per axis — the shape the
 * whole property does not accept twice.
 */
export const offsetAnchorX = join(
  [
    css('var', '--jumi-offset-anchor-x-edge'),
    css('var', '--jumi-offset-anchor-x-offset'),
  ],
  ' ',
)

export const offsetAnchorY = join(
  [
    css('var', '--jumi-offset-anchor-y-edge'),
    css('var', '--jumi-offset-anchor-y-offset'),
  ],
  ' ',
)
