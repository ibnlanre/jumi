import { Number, Object, String } from "@ibnlanre/types";
import { Add } from "ts-arithmetic";

import { DateFormat } from "./DateFormat";

export type BuddhistEraSymbols = "BB" | "BBBB";

export type BuddhistEra<
  In extends string,
  Out extends DateFormat,
  Year extends string = Object.Retrieve<Out, "year">,
  BuddhistYear extends number = Add<Number.ToNumber<Year>, 543>
> = In extends "BB"
  ? String.Slice<String.ToString<BuddhistYear>, 2, 4>
  : In extends "BBBB"
  ? String.ToString<BuddhistYear>
  : never;
