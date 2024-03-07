import { Sign } from "./Sign";
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


type Z = Split<"2022-01-01T00:00:00.000Z">;
//   ^?
type Y = Split<"1997-07-16T19:20:30+01:00">;
//   ^?
type X = Split<"2024-01-01T23:35:56.000-00:00">;
//   ^?
type W = Split<"2022-05-02">;
//   ^?

type Numbers = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Symbol = " " | "," | "." | "-" | ":" | "T" | "Z" | "+";

type FormatDate<
  In extends string,
  Format extends string,
  Stream extends string = ""
> = Format extends `${infer Part}${infer Format}`
  ? Part extends Symbol | Numbers
    ? FormatDate<In, Format, `${Stream}${Part}`>
    : FormatDate<In, Format, `${Stream}${Part}`>
  : Format extends `${infer Part}`
  ? Part extends Sign
    ? Split<In, {}, Stream>
    : never
  : never;

type A = FormatDate<"2022-01-01", "YYYY-MM-DDThh:mm:ss.sTZD">;
//   ^?




// type V = Checkmate<"YYYY", { year: "2022" }>;
// //   ^?
// type U = Checkmate<"MMMM", { month: "04" }>;
// //   ^?
