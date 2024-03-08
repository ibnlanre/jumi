import type { Divide } from "ts-arithmetic";

export type CenturyYears<Year extends number> = Divide<Year, 100>;
