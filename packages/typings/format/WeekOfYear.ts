import type { Number } from "@ibnlanre/typings";
import type { Add, Divide, Mod } from "ts-arithmetic";
import type { YearToDate } from "./YearToDate";

export type WeekOfYear<
  Year extends number,
  Month extends number,
  Day extends number
> = Divide<YearToDate<Year, Month, Day>, 7> extends infer R extends number
  ? Number.Floor<Mod<Add<R, 1>, 53>, 1>
  : never;
