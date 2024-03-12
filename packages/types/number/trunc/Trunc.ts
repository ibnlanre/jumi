import { Mod, Subtract } from "ts-arithmetic";

export type Trunc<T extends number> = Subtract<T, Mod<T, 1>>;
