import { Number, Object } from "@ibnlanre/types";
import { Add, Divide, Mod, Multiply, Subtract } from "ts-arithmetic";

type GregorianWeekDays = {
  0: "Saturday";
  1: "Sunday";
  2: "Monday";
  3: "Tuesday";
  4: "Wednesday";
  5: "Thursday";
  6: "Friday";
};

type GregorianDayOfWeekHelper<
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
> = Number.Floor<Number.Modulo<Add<q, Add<ZDate, ZYear>>, 7>>;

type GregorianDayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string
> = GregorianDayOfWeekHelper<Year, Month, Day>;

type ISOWeekDays = {
  1: "Monday";
  2: "Tuesday";
  3: "Wednesday";
  4: "Thursday";
  5: "Friday";
  6: "Saturday";
  7: "Sunday";
};

export type ISODayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string
> = Add<Mod<Add<GregorianDayOfWeek<Year, Month, Day>, 5>, 7>, 1>;

type NorthAmericanWeekDays = {
  0: "Sunday";
  1: "Monday";
  2: "Tuesday";
  3: "Wednesday";
  4: "Thursday";
  5: "Friday";
  6: "Saturday";
};

type NorthAmericanDayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string
> = Number.Modulo<Subtract<GregorianDayOfWeek<Year, Month, Day>, 1>, 7>;

export type DayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string,
  Format extends "Gregorian" | "ISO" | "North_American" = "North_American"
> = Format extends "Gregorian"
  ? GregorianDayOfWeek<Year, Month, Day>
  : Format extends "ISO"
  ? ISODayOfWeek<Year, Month, Day>
  : NorthAmericanDayOfWeek<Year, Month, Day>;

export type WeekDay<
  Year extends string,
  Month extends string,
  Day extends string,
  Format extends "Gregorian" | "ISO" | "North_American" = "North_American"
> = Format extends "Gregorian"
  ? Object.Retrieve<GregorianWeekDays, GregorianDayOfWeek<Year, Month, Day>>
  : Format extends "ISO"
  ? Object.Retrieve<ISOWeekDays, ISODayOfWeek<Year, Month, Day>>
  : Object.Retrieve<
      NorthAmericanWeekDays,
      NorthAmericanDayOfWeek<Year, Month, Day>
    >;

type Test = WeekDay<"2019", "08", "10", "ISO">;
