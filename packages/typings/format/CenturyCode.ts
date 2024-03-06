export type CenturyCode<T extends string> = T extends "17"
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
