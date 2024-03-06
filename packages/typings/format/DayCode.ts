export type DayCode<T extends string> = T extends "01" | "10" | "20" | "28"
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
