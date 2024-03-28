import { Fn } from "@ibnlanre/types";

import { EuclideanDivision } from "./EuclideanDivision";
import { FlooredDivision } from "./FlooredDivision";
import { TruncatingDivision } from "./TruncatingDivision";

export type Quotient<
  Dividend extends number,
  Divisor extends number,
  Type extends "Euclidean" | "Truncating" | "Floored" = "Truncating"
> = Type extends "Euclidean"
  ? EuclideanDivision<Dividend, Divisor>
  : Type extends "Truncating"
  ? TruncatingDivision<Dividend, Divisor>
  : Type extends "Floored"
  ? FlooredDivision<Dividend, Divisor>
  : never;

export interface TQuotient<
  Divisor extends number | void = void,
  Dividend extends number | void = void,
  Type extends "Euclidean" | "Truncating" | "Floored" | void = "Truncating"
> extends Fn {
  slot: [Divisor, Dividend, Type];
  data: Quotient<this[1], this[0], this[2]>;
}
