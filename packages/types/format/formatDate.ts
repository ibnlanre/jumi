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

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I extends Record<string, any>
) => void
  ? Prettify<I>
  : never;

// type Prettify<T extends Record<string, string>> = {
//   [K in keyof T]: T[K];
// } & {};

type Separator = "-" | "T" | ":" | "." | "Z" | "+" | "";

type Add<T extends Record<string, any>, K extends string, V> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
};

const isoDate = "2022-01-01T00:00:00.000Z";
const isoDate2 = "2022-05-02";
const isoDate3 = "2024-01-01T23:35:56.000-00:00";

// type Z = Split<typeof isoDate>;
//   ^?
// type Y = Split<typeof isoDate2>;
//   ^?
// type X = Split<typeof isoDate3>;
//   ^?
