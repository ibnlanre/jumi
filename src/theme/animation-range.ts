/**
 * The `<timeline-range-name>` namespace — `entry`, `cover`, `contain`, `exit` and their crossings.
 *
 * Named for the concept an author chooses, not for the grammar slot it fills. This set is the
 * vocabulary for a *half* of a range as well as for a whole one, and it deliberately holds no
 * `normal`: a half has to be a complete value, and measured, `normal` joined to an offset on one
 * side only (`0% normal 100%`, `normal 0% 100%`) is not a legal `animation-range` at all — the
 * declaration is dropped whole and the motion loses its range silently. An absent name is how a
 * half says "no named range", and absence is the default.
 */
export const animationRangeName = {
  'contain': 'contain',
  'cover': 'cover',
  'entry': 'entry',
  'entry-crossing': 'entry-crossing',
  'exit': 'exit',
  'exit-crossing': 'exit-crossing',
} as const

/**
 * A whole range: the same names, plus the keyword that means "the timeline's default range".
 *
 * `animation-range-cover` reads as the range it is — the motion runs while the subject crosses the
 * viewport — where `animation-range-calculated-value` or a two-token spelling would have read as
 * grammar. Anything with an offset in it is the arbitrary form: `animation-range-[entry_0%_cover_25%]`.
 */
export const animationRange = {
  DEFAULT: 'normal',
  ...animationRangeName,
} as const
