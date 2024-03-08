import type { Number, Object } from "@ibnlanre/typings";
import type { Add, Divide, Multiply, Subtract } from "ts-arithmetic";

import type { CenturyYears } from "./CenturyYears";
import type { DateFormat } from "./DateFormat";
import type { DaysInMonth } from "./DaysInMonth";
import type { FourCenturyYears } from "./FourCenturyYears";

export type UnixTimestamp<
  T extends Partial<DateFormat>,
  Epoch extends number = Subtract<
    Number.ToNumber<Object.Retrieve<T, "year">>,
    1970
  >,
  LeapYears extends number = Subtract<
    Add<Divide<Epoch, 4>, FourCenturyYears<Epoch>>,
    CenturyYears<Epoch>
  >,
  Days extends number = Add<Multiply<Epoch, 365>, LeapYears>,
  YearToDate extends number = Add<
    Multiply<
      Subtract<Number.ToNumber<Object.Retrieve<T, "month">>, 1>,
      DaysInMonth<
        Number.ToNumber<Object.Retrieve<T, "month">>,
        Number.ToNumber<Object.Retrieve<T, "year">>
      >
    >,
    Number.ToNumber<Object.Retrieve<T, "day">>
  >,
  EpochToDate extends number = Add<Days, YearToDate>
> = Multiply<EpochToDate, 86400000>;
