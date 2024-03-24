import { Join } from "../../array";
import { IsNever } from "../../conditionals";
import { LastOfUnion } from "../../transforms";
import { Replace } from "../replace";

type SplitHelper<
  S extends string,
  Delimiter extends string
> = S extends `${infer T}${Delimiter}${infer U}`
  ? [T, ...SplitHelper<U, Delimiter>]
  : [S];

type FinalSplit<
  S extends string,
  Delimiter extends string = "[/]"
> = SplitHelper<S, Delimiter>;

type DefaultOptions = {
  treatConsecutiveDelimitersAsOne: false;
  removeEmptyEntries: false;
};

export type Split<
  S extends string,
  Delimiter extends string = "",
  Options extends {
    treatConsecutiveDelimitersAsOne: boolean;
  } = DefaultOptions
> = LastOfUnion<Delimiter> extends infer L
  ? IsNever<L> extends 1
    ? Options["treatConsecutiveDelimitersAsOne"] extends true
      ? FinalSplit<Replace<S, "[/][/]", "[/]">>
      : FinalSplit<S>
    : L extends string
    ? Split<Join<SplitHelper<S, L>, "[/]">, Exclude<Delimiter, L>, Options>
    : never
  : never;

type SplitTest = Split<
  "foo bar baz",
  " " | "ba",
  { treatConsecutiveDelimitersAsOne: true }
>;
