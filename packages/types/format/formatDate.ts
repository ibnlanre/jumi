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

type DateFormat = {
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  minute?: string;
  second?: string;
  millisecond?: string;
  timezone?: string;
};

type Checkmate<In extends string, Out extends DateFormat> = In extends "YYYY"
  ? "year" extends keyof Out
    ? Out["year"]
    : ""
  : In extends "MM"
  ? "month" extends keyof Out
    ? Out["month"]
    : ""
  : In extends "DD"
  ? "day" extends keyof Out
    ? Out["day"]
    : ""
  : In extends "hh"
  ? "hour" extends keyof Out
    ? Out["hour"]
    : ""
  : In extends "mm"
  ? "minute" extends keyof Out
    ? Out["minute"]
    : ""
  : In extends "ss"
  ? "second" extends keyof Out
    ? Out["second"]
    : ""
  : In extends "s"
  ? "millisecond" extends keyof Out
    ? Out["millisecond"]
    : ""
  : In extends "TZD"
  ? "timezone" extends keyof Out
    ? Out["timezone"]
    : ""
  : never;

type V = Checkmate<"YYYY", { month: "2022" }>;


