import { Subtract } from "ts-arithmetic";

export type Subtraction<Numbers extends number[]> = Numbers extends [
  ...infer Rest extends number[],
  infer Last extends number
]
  ? Rest extends []
    ? Last
    : Subtract<Subtraction<Rest>, Last>
  : 1;
