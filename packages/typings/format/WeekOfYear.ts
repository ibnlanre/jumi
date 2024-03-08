import type { Number } from "@ibnlanre/typings";
import type { Add, Divide, Mod } from "ts-arithmetic";
import type { DayOfYear } from "./DayOfYear";

export type WeekOfYear<
  Year extends number,
  Month extends number,
  Day extends number
> = Divide<DayOfYear<Year, Month, Day>, 7> extends infer R extends number
  ? Number.Floor<Mod<Add<R, 1>, 53>, 1>
  : never;
