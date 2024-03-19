import { Length, TrimStart } from "@ibnlanre/types";
import { Divide, Pow, Subtract } from "ts-arithmetic";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Float<Value extends number, Decimal extends number> = Pow<
  10,
  Decimal
> extends infer Divisor extends number
  ? Divide<Value, Divisor>
  : never;

type Int<Input extends number> =
  `${Input}` extends `${infer R extends number}.${string}` ? R : Input;

type ParseIntHelper<
  Input extends string,
  Accumulator extends string = "",
  Decimal extends number = 0,
  NumberSize extends number = Length<Accumulator>
> = Input extends `${infer Head}${infer Input}`
  ? Head extends Digit
    ? ParseIntHelper<Input, `${Accumulator}${Head}`, Decimal>
    : Head extends "."
    ? ParseIntHelper<Input, Accumulator, NumberSize>
    : ParseIntHelper<Input, Accumulator, Decimal>
  : TrimStart<Accumulator> extends `${infer Input extends number}`
  ? Decimal extends 0
    ? Input
    : Float<Input, Subtract<NumberSize, Decimal>>
  : 0;

export type ParseInt<
  Input extends string | number | boolean,
  Output extends "Integer" | "Float" = "Float"
> = Input extends number
  ? Output extends "Float"
    ? Input
    : Int<Input>
  : Input extends string
  ? ParseIntHelper<Input> extends infer R extends number
    ? Output extends "Float"
      ? R
      : Int<R>
    : never
  : Input extends true
  ? 1
  : Input extends false
  ? 0
  : never;
