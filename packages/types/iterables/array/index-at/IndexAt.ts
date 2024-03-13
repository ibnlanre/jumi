import { Indices } from "../indices";

type IndexAtHelper<
  Value extends any[],
  Index extends number,
  Stock extends any[] = []
> = `${Index}` extends `-${infer N extends number}`
  ? Value["length"] extends N
    ? Stock["length"]
    : Value extends [infer Part extends any, ...infer Rest extends any[]]
    ? IndexAtHelper<Rest, Index, [...Stock, Part]>
    : never
  : Index extends Indices<Value>
  ? Index
  : never;

export type IndexAt<Value extends any[], Index extends number> = IndexAtHelper<
  Value,
  Index
>;
