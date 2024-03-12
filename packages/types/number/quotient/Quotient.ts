import { Abs, Divide, Multiply } from "ts-arithmetic";

import { Floor } from "../floor";
import { Sign } from "../sign";
import { Trunc } from "../trunc";

type EuclideanDivision<
  Dividend extends number,
  Divisor extends number
> = Multiply<Sign<Divisor>, Floor<Divide<Dividend, Abs<Divisor>>>>;

type TruncatingDivision<
  Dividend extends number,
  Divisor extends number
> = Trunc<Divide<Dividend, Divisor>>;

type FlooredDivision<Dividend extends number, Divisor extends number> = Floor<
  Divide<Dividend, Divisor>
>;

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
