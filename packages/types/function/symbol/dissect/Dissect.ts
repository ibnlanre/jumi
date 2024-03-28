import { unset } from "..";

export type Dissect<T extends unknown> = T extends []
  ? []
  : T extends [infer head, ...infer rest]
  ? [unset] extends [head]
    ? Dissect<rest>
    : [head, ...Dissect<rest>]
  : [];
