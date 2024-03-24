import { Bit, Or } from "ts-arithmetic";

export type Some<Values extends Bit[]> = Values extends []
  ? 0
  : Values extends [infer Head extends Bit, ...infer Tail extends Bit[]]
  ? Or<Head, Some<Tail>>
  : 0;
