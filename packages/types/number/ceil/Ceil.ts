import { Add, Mod, Subtract } from "ts-arithmetic";
import { Floor } from "../floor";

type CeilHelper<
  T extends number,
  U extends number = Mod<T, 1>,
  R extends number = Subtract<T, U>
> = U extends 0 ? T : `${T}` extends `-${number}` ? R : Add<R, 1>;

export type Ceil<T extends number> = CeilHelper<T>;

type Trunc<T extends number> = Subtract<T, Mod<T, 1>>;
