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
