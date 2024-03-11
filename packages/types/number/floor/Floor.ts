import { Mod, Subtract } from "ts-arithmetic";

export type Floor<
  T extends number,
  U extends number = Mod<T, 1>,
  R extends number = Subtract<T, U>
> = U extends 0 ? T : `${T}` extends `-${number}` ? Subtract<R, 1> : R;
