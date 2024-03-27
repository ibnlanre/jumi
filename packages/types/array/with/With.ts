import { Add } from "ts-arithmetic";
import { SliceFrom } from "../slice-from";
import { SliceTo } from "../slice-to";

export type With<A extends unknown[], T extends number, U> = [
  ...SliceTo<A, T>,
  U,
  ...SliceFrom<A, Add<T, 1>>
];
