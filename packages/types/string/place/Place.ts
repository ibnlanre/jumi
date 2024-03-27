import {
  IndexAt,
  IsNever,
  LastOfUnion,
  Length,
  Substring,
} from "@ibnlanre/types";

type PlaceHelper<
  Words extends string,
  Letter extends string,
  Index extends number
> = `${Substring<Words, 0, Index>}${Letter}${Substring<
  Words,
  Index,
  Length<Words>
>}`;

export type Place<
  Words extends string,
  Letter extends string,
  Index extends number
> = LastOfUnion<Index> extends infer L
  ? IsNever<L> extends 1
    ? Words
    : L extends number
    ? Place<
        PlaceHelper<Words, Letter, IndexAt<Length<Words>, L>>,
        Letter,
        Exclude<Index, L>
      >
    : Words
  : never;
