import { Fn } from "@ibnlanre/types";

export type ExtractRootKey<
  Text extends string,
  Delimiter extends string = "."
> = Text extends `${infer Segment}${Delimiter}${string}` ? Segment : Text;

export interface TExtractRootKey<
  Text extends string | void = void,
  Delimiter extends string | void = "."
> extends Fn {
  slot: [Text, Delimiter];
  data: ExtractRootKey<this[0], this[1]>;
}
