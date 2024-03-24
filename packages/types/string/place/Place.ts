import { IndexAt, Length, Substring } from "@ibnlanre/types";

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
> = PlaceHelper<Words, Letter, IndexAt<Length<Words>, Index>>;
