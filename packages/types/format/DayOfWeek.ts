import { Number } from "@ibnlanre/types";
import { Add, Divide, Mod, Multiply, Subtract } from "ts-arithmetic";

type Days = {
  0: "Saturday";
  1: "Sunday";
  2: "Monday";
  3: "Tuesday";
  4: "Wednesday";
  5: "Thursday";
  6: "Friday";
};

type ISODays = {
  1: "Monday";
  2: "Tuesday";
  3: "Wednesday";
  4: "Thursday";
  5: "Friday";
  6: "Saturday";
  7: "Sunday";
};

export type DayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string,
  q extends number = Number.ToNumber<Day>,
  m extends number = Month extends "01" | "02"
    ? Add<Number.ToNumber<Month>, 12>
    : Number.ToNumber<Month>,
  k extends number = Month extends "01" | "02"
    ? Subtract<Number.ToNumber<Year>, 1>
    : Number.ToNumber<Year>,
  K extends number = Mod<k, 100>,
  J extends number = Number.Floor<Divide<k, 100>>,
  ZDate extends number = Number.Floor<Divide<Multiply<13, Add<m, 1>>, 5>>,
  ZYear extends number = Add<
    Subtract<Number.Floor<Divide<J, 4>>, Multiply<J, 2>>,
    Add<Number.Floor<Divide<K, 4>>, K>
  >
> = Number.Floor<
  Number.Modulo<Add<q, Add<ZDate, ZYear>>, 7>
> extends infer R extends number
  ? R
  : never;

type ISODayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string,
  h extends number = DayOfWeek<Year, Month, Day>
> = Add<Mod<Add<h, 5>, 7>, 1>;
