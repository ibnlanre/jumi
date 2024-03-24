import { IsNever, LastOfUnion } from "@ibnlanre/types";

type ReplaceHelper<
  Words extends string,
  Find extends string,
  With extends string
> = Words extends `${infer X}${Find}${infer U}`
  ? `${X}${With}${ReplaceHelper<U, Find, With>}`
  : Words;

export type Replace<
  Words extends string,
  Find extends string,
  With extends string
> = LastOfUnion<Find> extends infer L
  ? IsNever<L> extends 1
    ? Words
    : L extends string
    ? Replace<ReplaceHelper<Words, L, With>, Exclude<Find, L>, With>
    : Words
  : never;
