import { Gt, Subtract } from "ts-arithmetic";
import { Length } from "../length";

type ArrayOfLength<
  Length extends number,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : ArrayOfLength<Length, [any, ...Result]>;

type Test = ArrayOfLength<3>; // [any, any, any]

type RestOfArrayFrom<
  Array extends unknown[],
  Start extends number
> = Array extends [...ArrayOfLength<Start>, ...infer Rest] ? Rest : never;

type RestOfArrayTo<Array extends unknown[], End extends number> = Gt<
  End,
  Array["length"]
> extends 1
  ? never
  : Array extends [
      ...infer Rest,
      ...ArrayOfLength<Subtract<Array["length"], End>>
    ]
  ? Rest
  : never;

type Test2 = RestOfArrayTo<[1, 2, 3, 4], 3>;

type Slice<
  Array extends unknown[],
  Start extends number,
  End extends number
> = RestOfArrayTo<RestOfArrayFrom<Array, Start>, Subtract<End, Start>>;

type Test3 = Slice<[1, 2, 3, 4], 1, 4>; // [2, 3]
