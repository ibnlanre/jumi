import { Number, Object } from "@ibnlanre/typings";
import { Add, Multiply, Subtract } from "ts-arithmetic";
import { DateFormat } from "./DateFormat";
import { Split } from "./Split";

export type UnixTimestamp<
  T extends DateFormat,
  Epoch extends number = Subtract<Number.ToNumber<T["year"]>, 1970>,
  Days extends number = Multiply<Epoch, 365>,
  YearToDate extends number = Add<
    Multiply<Subtract<Number.ToNumber<T["month"]>, 1>, 30>,
    Number.ToNumber<Object.Retrieve<T, "day">>
  >,
  EpochToDate extends number = Add<Days, YearToDate>
> = Multiply<EpochToDate, 86400>;

type NI = UnixTimestamp<Split<"2024-03-07T00:00:00Z">>;
//   ^?
