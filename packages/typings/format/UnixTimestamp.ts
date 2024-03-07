import { Add, Divide, Multiply, Subtract } from "ts-arithmetic";
import { Number, Object } from "@ibnlanre/typings";
import { DateFormat } from "./DateFormat";
import { Split } from "./Split";

export type UnixTimestamp<
  T extends DateFormat,
  Y extends number = Subtract<Number.ToNumber<T["year"]>, 1970>,
  D extends number = Multiply<Y, 365>,
  YearTillDate extends number = Add<
    Subtract<Number.ParseInt<Number.ToNumber<T["month"]>>, 1>,
    Number.ParseInt<Number.ToNumber<Object.Retrieve<T, "day">>>
  >,
  C = Number.ToNumber<T["month"]>
> = C

type NI = UnixTimestamp<Split<"2020-01-01T00:00:00Z">>;
//   ^?
