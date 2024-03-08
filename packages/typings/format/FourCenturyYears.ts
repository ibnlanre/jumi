import type { Divide } from "ts-arithmetic";

export type FourCenturyYears<Year extends number> = Divide<Year, 400>;
