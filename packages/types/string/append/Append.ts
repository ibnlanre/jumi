import { Fn } from "@ibnlanre/types";

export type Append<
  Text extends string,
  Segment extends string
> = `${Text}${Segment}`;

export interface TAppend<
  Segment extends string | void = void,
  Text extends string | void = void
> extends Fn {
  slot: [Segment, Text];
  data: Append<this[1], this[0]>;
}
