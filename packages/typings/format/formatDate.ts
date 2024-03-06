import { Slice } from "../string";
import { Split } from "./Split";

type DayJSFormat =
  | "LLL"
  | "LL"
  | "L"
  | "LT"
  | "LTS"
  | "LTSO"
  | "LTZ"
  | "LZ"
  | "LLL"
  | "LLL"
  | "LLLT"
  | "LLLL"
  | "LLLLL";

type Sign = "M" | "D" | "Y" | "h" | "m" | "s" | "A" | "Z" | "S" | "T" | "O";

type ExplicitFormat<T extends string> = T extends "LLL"
  ? "MMM. DD, YYYY"
  : T extends "LL"
  ? "MMM. DD, YYYY"
  : T extends "L"
  ? "MM/DD/YYYY"
  : T extends "LT"
  ? "h:mm A"
  : T extends "LTS"
  ? "h:mm:ss A"
  : T extends "LTSO"
  ? "h:mm:ss A"
  : T extends "LTZ"
  ? "h:mm:ss A"
  : T extends "LZ"
  ? "h:mm:ss A"
  : T extends "LLL"
  ? "MMM. DD, YYYY"
  : T extends "LLL"
  ? "MMM. DD, YYYY"
  : T extends "LLLT"
  ? "MMM. DD, YYYY h:mm A"
  : T extends "LLLL"
  ? "MMMM DD, YYYY h:mm A"
  : T extends "LLLLL"
  ? "MMMM DD, YYYY h:mm A"
  : never;

// export type FormatDate = {
//   <T extends DayJSFormat>(In: ConfigType, format: T): string | null;
//   (In: ConfigType): string | null;
// };

// YYYY-MM-DDThh:mm:ss.sTZD

type Merge<
  T extends Record<string, string>,
  U extends Record<string, string>
> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? T[K]
    : K extends keyof U
    ? U[K]
    : never;
};

type Z = Split<"2022-01-01T00:00:00.000Z">;
//   ^?
type Y = Split<"1997-07-16T19:20:30+01:00">;
//   ^?
type X = Split<"2024-01-01T23:35:56.000-00:00">;
//   ^?
type W = Split<"2022-05-02">;
//   ^?

type Space =
  | " "
  | ","
  | "."
  | "-"
  | ":"
  | "T"
  | "Z"
  | "+"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

type FormatDate<
  In extends string,
  Format extends string,
  Stream extends string = ""
> = Format extends `${infer Part}${infer Format}`
  ? Part extends Space
    ? FormatDate<In, Format, `${Stream}${Part}`>
    : FormatDate<In, Format, `${Stream}${Part}`>
  : Format extends `${infer Part}`
  ? Part extends Sign
    ? Split<In, {}, Stream>
    : never
  : never;

type A = FormatDate<"2022-01-01T00:00:00.000Z", "YYYY-MM-DDThh:mm:ss.sTZD">;
//   ^?

type DateFormat = Partial<{
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
  timezone: string;
}>;

type Retrieve<
  Out extends Record<string, any>,
  In extends string
> = In extends keyof Out ? NonNullable<Out[In]> : "";

type Month = {
  "01": "January";
  "02": "February";
  "03": "March";
  "04": "April";
  "05": "May";
  "06": "June";
  "07": "July";
  "08": "August";
  "09": "September";
  "10": "October";
  "11": "November";
  "12": "December";
};

type Day = {
  "01": "Sunday";
  "02": "Monday";
  "03": "Tuesday";
  "04": "Wednesday";
  "05": "Thursday";
  "06": "Friday";
  "07": "Saturday";
};

type XY = Retrieve<{ year: 3 }, "year">;

type StripZero<T extends string> = T extends `0${infer U}` ? U : T;

type Checkmate<In extends string, Out extends DateFormat> = In extends "YY"
  ? Slice<Retrieve<Out, "year">, 2, 4>
  : In extends "YYYY"
  ? Retrieve<Out, "year">
  : In extends "M"
  ? StripZero<Retrieve<Out, "month">>
  : In extends "MM"
  ? Retrieve<Out, "month">
  : In extends "MMM"
  ? Slice<Retrieve<Month, Retrieve<Out, "month">>, 0, 3>
  : In extends "MMMM"
  ? Retrieve<Month, Retrieve<Out, "month">>
  : In extends "D"
  ? StripZero<Retrieve<Out, "day">>
  : In extends "DD"
  ? Retrieve<Out, "day">
  : In extends "hh"
  ? Retrieve<Out, "hour">
  : In extends "mm"
  ? Retrieve<Out, "minute">
  : In extends "ss"
  ? Retrieve<Out, "second">
  : In extends "s"
  ? Retrieve<Out, "second">
  : In extends "TZD"
  ? Retrieve<Out, "timezone">
  : never;

type V = Checkmate<"YYYY", { year: "2022" }>;
//   ^?
type U = Checkmate<"MMMM", { month: "04" }>;
//   ^?

// DayOfTheWeek = (Year Code + Month Code + Century Code + Date Number - Leap Year Code) mod 7

type EuclideanDivision<A, B> = A extends B
  ? B extends A
    ? true
    : false
  : false;

type AtTerminus<A extends number, B extends number> = A extends 0
  ? true
  : B extends 0
  ? true
  : false;

type GenerateTuple<L extends number, T extends any[] = []> = T extends {
  length: L;
}
  ? T
  : GenerateTuple<L, [...T, any]>;

type Length<T extends any[]> = T extends { length: infer L extends number }
  ? L
  : never;

type Subtract<A extends number, B extends number> = GenerateTuple<A> extends [
  ...infer U,
  ...GenerateTuple<B>
]
  ? Length<U>
  : never;

type LT<A extends number, B extends number> = AtTerminus<A, B> extends true
  ? EuclideanDivision<A, B> extends true
    ? false
    : A extends 0
    ? true
    : false
  : LT<Subtract<A, 1>, Subtract<B, 1>>;

type Add<A extends number, B extends number> = Length<
  [...GenerateTuple<A>, ...GenerateTuple<B>]
>;

type MultiAdd<
  N extends number,
  A extends number,
  I extends number
> = I extends 0 ? A : MultiAdd<N, Add<N, A>, Subtract<I, 1>>;

type MultiSub<N extends number, D extends number, Q extends number> = LT<
  N,
  D
> extends true
  ? Q
  : MultiSub<Subtract<N, D>, D, Add<Q, 1>>;

type Multiply<A extends number, B extends number> = MultiAdd<A, 0, B>;
type Divide<A extends number, B extends number> = MultiSub<A, B, 0>;

type Modulo<A extends number, B extends number> = LT<A, B> extends true
  ? A
  : Modulo<Subtract<A, B>, B>;

type CenturyCode<T extends string> = T extends "17"
  ? 4
  : T extends "18"
  ? 2
  : T extends "19"
  ? 0
  : T extends "20"
  ? 6
  : T extends "21"
  ? 4
  : T extends "22"
  ? 2
  : T extends "23"
  ? 0
  : never;

type LeapYearCode<T extends string> = T extends "00" | "04" | "08" | "12" | "16"
  ? 6
  : T extends "01" | "05" | "09" | "13"
  ? 4
  : T extends "02" | "06" | "10" | "14"
  ? 2
  : T extends "03" | "07" | "11" | "15"
  ? 0
  : never;

type YearCode<T extends string> = T extends `${infer R extends number}`
  ? Modulo<R, 4>
  : "";

type MonthCode<T extends string> = T extends "01" | "10"
  ? 0
  : T extends "05"
  ? 1
  : T extends "08"
  ? 2
  : T extends "02" | "03" | "11"
  ? 3
  : T extends "06"
  ? 4
  : T extends "09" | "12"
  ? 5
  : T extends "04" | "07"
  ? 6
  : "";

type DayCode<T extends string> = T extends "01" | "10" | "20" | "28"
  ? 0
  : T extends "02" | "11" | "21"
  ? 1
  : T extends "03" | "12" | "22"
  ? 2
  : T extends "04" | "13" | "23"
  ? 3
  : T extends "05" | "14" | "24"
  ? 4
  : T extends "06" | "15" | "25"
  ? 5
  : T extends "07" | "16" | "26"
  ? 6
  : T extends "08" | "17" | "27"
  ? 0
  : T extends "09" | "18" | "28"
  ? 1
  : T extends "19" | "29"
  ? 2
  : T extends "30"
  ? 3
  : T extends "31"
  ? 4
  : "";

type DayOfTheWeekHelper<YCode extends string, MCode, DCode, CCode, LCode> = Modulo<
  Subtract<Add<Add<Add<ParseInt<YCode>, MCode>, DCode>, CCode>, LCode>,
  7
>;

type DayOfTheWeek<
  Year extends string,
  Month extends string,
  Day extends string
> = DayOfTheWeekHelper<
  YearCode<Slice<Year, 2, 4>>,
  MonthCode<Month>,
  DayCode<Day>,
  CenturyCode<Slice<Year, 0, 2>>,
  LeapYearCode<Slice<Year, 2, 4>>
>;

// [YearCode<Slice<Year, 2, 4>>, MonthCode<Month>, DayCode<Day>];
//   Modulo<
//   // `${YearCode<Slice<Year, 2, 4>>}${MonthCode<Month>}${DayCode<Day>}`,
//   9,
//   7
// >;

type AA = Number<YearCode<Slice<"2022", 2, 4>>>;
//   ^?

type Number<T extends any> = T extends string
  ? ParseInt<T>
  : T extends true
  ? 1
  : T extends false
  ? 0
  : T extends any[]
  ? Number<Join<T, "">>
  : T extends number
  ? T
  : never;

type ParseInt<
  T extends string,
  U extends string = ""
> = T extends `${infer R}${infer N}`
  ? R extends "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    ? ParseInt<N, `${U}${R}`>
    : ParseInt<N, U>
  : U extends `${infer R extends number}`
  ? R
  : never;

type BBC = ParseInt<"34529">;
//   ^?

type UI = Modulo<9, 5>;

type Join<
  T extends any[],
  Delimiter extends string = ",",
  U extends string = ""
> = T extends [infer Head, ...infer Tail]
  ? Join<
      Tail,
      Delimiter,
      U extends "" ? Stringify<Head> : `${U}${Delimiter}${Stringify<Head>}`
    >
  : U;

type StringifyObject<T extends Record<string, any>> = Join<
  UnionToTuple<
    {
      [K in keyof T]: `${Stringify<K>}: ${Stringify<T[K]>}`;
    }[keyof T]
  >,
  ", "
>;

type AAB = StringifyObject<{
  year: "2022";
  month: "01";
  day: "01";
  hour: "00";
  minute: "00";
  second: "00";
  millisecond: "000";
  timezone: "Z";
}>;

type Stringify<T extends any> = T extends string
  ? T
  : T extends number
  ? `${T}`
  : T extends boolean
  ? `${T}`
  : T extends any[]
  ? `[${Join<T>}]`
  : T extends Record<string, any>
  ? StringifyObject<T>
  : T extends null
  ? "null"
  : never;

type BB = Stringify<{
  year: "2022";
  month: "01";
  day: "01";
  hour: "00";
  minute: "00";
  second: "00";
  millisecond: "000";
  timezone: "Z";
}>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

type Push<T extends any[], V> = [...T, V];

type UnionToTuple<T, L = LastOf<T>, N = Exclude<T, L>> = [L] extends [never]
  ? []
  : Push<UnionToTuple<N>, L>;
