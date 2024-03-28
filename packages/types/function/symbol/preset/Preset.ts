export type Preset<T extends unknown> = T extends []
  ? 0
  : T extends [infer head, ...infer rest]
  ? [void] extends [head]
    ? 1
    : Preset<rest>
  : 0;
