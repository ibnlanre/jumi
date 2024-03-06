import { Mod } from "ts-arithmetic";

export type YearCode<T extends string> = T extends `${infer R extends number}`
  ? Mod<R, 4>
  : "";
