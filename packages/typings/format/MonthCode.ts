export type MonthCode<T extends string> = T extends "01" | "10"
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
