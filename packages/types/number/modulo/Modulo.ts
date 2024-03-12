import { Abs, Add, Divide, Mod, Multiply, Subtract } from "ts-arithmetic";
import { Floor } from "../floor";

type EuclideanMod<
  Dividend extends number,
  Divisor extends number
> = Abs<Divisor> extends infer R extends number
  ? Mod<Add<Mod<Dividend, R>, R>, R>
  : never;

type EuclideanKnuthianMod<
  Dividend extends number,
  Divisor extends number
> = Subtract<Dividend, Multiply<Floor<Divide<Dividend, Divisor>>, Divisor>>;

type TruncatingMod<Dividend extends number, Divisor extends number> = Mod<
  Dividend,
  Divisor
>;

type FlooredMod<Dividend extends number, Divisor extends number> = Mod<
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
  ? EuclideanMod<Dividend, Divisor>
  : Type extends "Euclidean-Knuthian"
  ? EuclideanKnuthianMod<Dividend, Divisor>
  : Type extends "Truncating"
  ? TruncatingMod<Dividend, Divisor>
  : Type extends "Floored"
  ? FlooredMod<Dividend, Divisor>
  : never;
