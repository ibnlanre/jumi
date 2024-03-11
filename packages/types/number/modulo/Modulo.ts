import { Abs, Add, Divide, Mod, Multiply, Subtract } from "ts-arithmetic";
import { Floor } from "../floor";

type EuclideanDivisionHelper<
  Dividend extends number,
  Divisor extends number,
  AbsDivisor extends number = Abs<Divisor>
> = Mod<Add<Mod<Dividend, AbsDivisor>, AbsDivisor>, AbsDivisor>;

type EuclideanDivision<
  Dividend extends number,
  Divisor extends number
> = EuclideanDivisionHelper<Dividend, Divisor>;

type EuclideanKnuthianDivision<
  Dividend extends number,
  Divisor extends number
> = Subtract<Dividend, Multiply<Floor<Divide<Dividend, Divisor>>, Divisor>>;

type TruncatingDivision<Dividend extends number, Divisor extends number> = Mod<
  Dividend,
  Divisor
>;

type FlooredDivision<Dividend extends number, Divisor extends number> = Mod<
  Add<Mod<Dividend, Divisor>, Divisor>,
  Divisor
>;

/**
 * Returns the remainder of the division of `Dividend` by `Divisor`.
 *
 * @description
 * - If both dividend and divisor are positive, then all three definitions agree.
 * - If the dividend is positive and the divisor is negative, then the truncating and Euclidean definitions agree.
 * - If the dividend is negative and the divisor is positive, then the flooring and Euclidean definitions agree.
 * - If both dividend and divisor are negative, then the truncating and flooring definitions agree.
 */
export type Modulo<
  Dividend extends number,
  Divisor extends number,
  Type extends
    | "Euclidean"
    | "Euclidean-Knuthian"
    | "Truncating"
    | "Floored" = "Euclidean-Knuthian"
> = Type extends "Euclidean"
  ? EuclideanDivision<Dividend, Divisor>
  : Type extends "Euclidean-Knuthian"
  ? EuclideanKnuthianDivision<Dividend, Divisor>
  : Type extends "Truncating"
  ? TruncatingDivision<Dividend, Divisor>
  : Type extends "Floored"
  ? FlooredDivision<Dividend, Divisor>
  : never;

type a = Modulo<-5, 3, "Floored">;
