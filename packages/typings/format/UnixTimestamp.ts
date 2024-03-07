import { Number, Object } from "@ibnlanre/typings";
import { Add, Multiply, Subtract } from "ts-arithmetic";

import { DateFormat } from "./DateFormat";

export type UnixTimestamp<
  T extends Partial<DateFormat>,
  Epoch extends number = Subtract<Number.ToNumber<T["year"]>, 1970>,
  Days extends number = Multiply<Epoch, 365>,
  YearToDate extends number = Add<
    Multiply<Subtract<Number.ToNumber<T["month"]>, 1>, 30>,
    Number.ToNumber<Object.Retrieve<T, "day">>
  >,
  EpochToDate extends number = Add<Days, YearToDate>
> = Multiply<EpochToDate, 86400>;
