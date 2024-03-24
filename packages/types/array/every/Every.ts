import { And, Bit } from "ts-arithmetic";

export type Every<Values extends Bit[]> = Values extends []
  ? 1
  : Values extends [infer Head extends Bit, ...infer Tail extends Bit[]]
  ? And<Head, Every<Tail>>
  : 0;
