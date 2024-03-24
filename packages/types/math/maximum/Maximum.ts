import { Max } from "ts-arithmetic";

export type Maximum<Numbers extends number[]> = Numbers extends [
  infer First extends number,
  ...infer Rest extends number[]
]
  ? Max<First, Maximum<Rest>>
  : 0;
