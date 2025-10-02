type Delimiter = ', ' | '-' | '/' | '_' | '|' | (string & {})

type Filter<List extends Array<unknown>> = List extends []
  ? []
  : List extends [infer Head, ...infer Rest]
    ? Head extends ''
      ? Filter<Rest>
      : [Head, ...Filter<Rest>]
    : List extends Array<infer Item>
      ? Array<Item>
      : List

type Join<List extends string[], Separator extends Delimiter> = List extends []
  ? ''
  : List extends [infer Head extends string]
    ? Head
    : List extends [infer Head extends string, ...infer Rest extends string[]]
      ? `${Head}${Separator}${Join<Rest, Separator>}`
      : string

export function join<const List extends string[], Separator extends Delimiter = ' '>(
  list: List,
  separator: Separator = ' ' as Separator,
) {
  return list.filter(Boolean).join(separator) as Join<Filter<List>, Separator>
}
