import { unset } from "..";

export type Preset<T extends unknown> = T extends []
  ? 1
  : T extends [infer head, ...infer rest]
  ? [unset] extends [head]
    ? Preset<rest>
    : 0
  : 0;
