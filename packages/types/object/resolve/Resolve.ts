import { ArbitraryKey, Combine, Dictionary, Get, Paths } from "@ibnlanre/types";

export type Resolve<
  Source extends Dictionary[] | Dictionary,
  Path extends
    | Paths<Source extends Dictionary[] ? Combine<Source> : Source, Delimiter>
    | ArbitraryKey<number>,
  Delimiter extends string = "."
> = Get<
  Source extends Dictionary[] ? Combine<Source> : Source,
  Path,
  never,
  Delimiter
>;
