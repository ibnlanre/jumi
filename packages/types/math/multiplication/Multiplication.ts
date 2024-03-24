import { Multiply } from "ts-arithmetic";

export type Multiplication<Numbers extends number[]> = Numbers extends [
  infer First extends number,
  ...infer Rest extends number[]
]
  ? Multiply<First, Multiplication<Rest>>
  : 1;
