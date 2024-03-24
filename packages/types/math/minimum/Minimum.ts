import { Min } from "ts-arithmetic";

export type Minimum<Numbers extends number[]> = Numbers extends [
  ...infer Rest extends number[],
  infer Last extends number
]
  ? Rest extends []
    ? Last
    : Min<Minimum<Rest>, Last>
  : 0;
