import { Fn, IsNever, Join, LastOfUnion, Replace } from "@ibnlanre/types";

type SplitHelper<
  Text extends string,
  Delimiter extends string
> = Text extends `${infer T}${Delimiter}${infer U}`
  ? [T, ...SplitHelper<U, Delimiter>]
  : [Text];

type FinalSplit<
  Text extends string,
  Delimiter extends string = "<>"
> = SplitHelper<Text, Delimiter>;

type DefaultOptions = {
  treatConsecutiveDelimitersAsOne: false;
  removeEmptyEntries: false;
};

export type Split<
  Text extends string,
  Delimiter extends string = "",
  Options extends {
    treatConsecutiveDelimitersAsOne: boolean;
  } = DefaultOptions
> = LastOfUnion<Delimiter> extends infer L
  ? IsNever<L> extends 1
    ? Options["treatConsecutiveDelimitersAsOne"] extends true
      ? FinalSplit<Replace<Text, "<><>", "<>">>
      : FinalSplit<Text>
    : L extends string
    ? Split<Join<SplitHelper<Text, L>, "<>">, Exclude<Delimiter, L>, Options>
    : never
  : never;

export interface TSplit<
  Delimiter extends string | void = void,
  Text extends string | void = void,
  Options extends {
    treatConsecutiveDelimitersAsOne: boolean;
  } | void = DefaultOptions
> extends Fn {
  slot: [Delimiter, Text, Options];
  data: Split<this[1], this[0], this[2]>;
}
