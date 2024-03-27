import { Add } from "ts-arithmetic";

export type Range<Start extends number, End extends number> = Start extends End
  ? [Start]
  : [Start, ...Range<Add<Start, 1>, End>];
