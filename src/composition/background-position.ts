import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * The property reads the **resolved** axis leaves, one per axis, which is the subject the browser interpolates.
 *
 * Edge and offset remain authoring vocabulary: they are what an author writes and what the resolver normalizes from,
 * and they are deliberately not part of this composition — a registered execution leaf that fell back into the
 * authoring composition with `var(--leaf, var(--axis))` would be the two-way model D.3.7 exists to prevent.
 *
 * The two-value form is also the shape the resolved subject was measured in: `scripts/research/d3-resolved-axis.mjs`
 * compared exactly this composition against the browser interpolating the authored positions.
 */
export const backgroundPosition = join(
  [
    css('var', '--jumi-background-position-x-position'),
    css('var', '--jumi-background-position-y-position'),
  ],
  ' ',
)

/** The x axis as authoring state: the edge and the offset an author writes, composed for their own slots. */
export const backgroundPositionX = join(
  [
    css('var', '--jumi-background-position-x-edge'),
    css('var', '--jumi-background-position-x-offset'),
  ],
  ' ',
)

/** The y axis as authoring state: the edge and the offset an author writes, composed for their own slots. */
export const backgroundPositionY = join(
  [
    css('var', '--jumi-background-position-y-edge'),
    css('var', '--jumi-background-position-y-offset'),
  ],
  ' ',
)
