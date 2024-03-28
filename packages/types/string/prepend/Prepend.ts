import { Fn } from "@ibnlanre/types";

export type Prepend<
  Text extends string,
  Segment extends string
> = `${Segment}${Text}`;

export interface TPrepend<
  Segment extends string | void = void,
  Text extends string | void = void
> extends Fn {
  slot: [Segment, Text];
  data: Prepend<this[1], this[0]>;
}
