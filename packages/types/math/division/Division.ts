import { Divide } from "ts-arithmetic";

export type Division<Numbers extends number[]> = Numbers extends [
  ...infer Rest extends number[],
  infer Last extends number
]
  ? Rest extends []
    ? Last
    : Divide<Division<Rest>, Last>
  : 1;
