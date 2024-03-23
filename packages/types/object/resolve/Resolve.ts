import { ArbitraryKey, Combine, Get, Paths } from "@ibnlanre/types";

export type Resolve<
  Source extends Record<string, any>[] | Record<string, any>,
  Path extends Paths<Combine<Source>, Delimiter> | ArbitraryKey<number>,
  Delimiter extends string = "."
> = Get<Combine<Source>, Path, never, Delimiter>;
