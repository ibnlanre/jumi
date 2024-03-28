import { Fn, Serializable } from "@ibnlanre/types";

export type EndsWith<
  Text extends string,
  Segment extends Serializable
> = Text extends `${string}${Segment}` ? 1 : 0;

export interface TEndsWith<
  Segment extends Serializable | void = void,
  Text extends string | void = void
> extends Fn {
  slot: [Segment, Text];
  data: EndsWith<this[1], this[0]>;
}
