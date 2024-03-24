import { Add } from "ts-arithmetic";

export type Addition<Numbers extends number[]> = Numbers extends [
  infer First extends number,
  ...infer Rest extends number[]
]
  ? Add<First, Addition<Rest>>
  : 0;
