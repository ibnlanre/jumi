export type LeapYearCode<T extends string> = T extends
  | "04"
  | "08"
  | "12"
  | "16"
  | "20"
  | "24"
  | "28"
  ? 6
  : T extends "01" | "05" | "09" | "13" | "21" | "25" | "29"
  ? 4
  : T extends "02" | "06" | "10" | "14" | "22" | "26" | "30"
  ? 2
  : T extends "03" | "07" | "11" | "15" | "23" | "27" | "31"
  ? 0
  : never;
