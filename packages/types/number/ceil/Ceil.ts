import { Add, Mod, Subtract } from "ts-arithmetic";

type CeilHelper<
  T extends number,
  U extends number = Mod<T, 1>,
  R extends number = Subtract<T, U>
> = U extends 0 ? T : `${T}` extends `-${number}` ? R : Add<R, 1>;

export type Ceil<T extends number> = CeilHelper<T>;
