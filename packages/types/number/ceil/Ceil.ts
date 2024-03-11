import { Add, Mod, Subtract } from "ts-arithmetic";
import { Floor } from "../floor/Floor";

export type Ceil<
  T extends number,
  U extends number = Mod<T, 1>,
  R extends number = Subtract<T, U>
> = U extends 0 ? T : `${T}` extends `-${number}` ? R : Add<R, 1>;
type Test = Ceil<1.9>;

type Round<
  T extends number,
  R extends number = Add<T, Mod<T, 1>>
> = `${T}` extends `-${number}` ? Ceil<R> : Floor<R>;

type Trunc<T extends number> = Subtract<T, Mod<T, 1>>;
