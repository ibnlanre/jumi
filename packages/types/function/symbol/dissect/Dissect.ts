export type Dissect<T extends unknown> = T extends []
  ? []
  : T extends [infer head, ...infer rest]
  ? [void] extends [head]
    ? Dissect<rest>
    : [head, ...Dissect<rest>]
  : [];
