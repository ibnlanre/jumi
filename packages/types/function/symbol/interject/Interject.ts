export type Interject<T extends unknown> = T extends []
  ? []
  : T extends [infer head, ...infer rest]
  ? [void] extends [head]
    ? Interject<rest>
    : [head, ...Interject<rest>]
  : [];
