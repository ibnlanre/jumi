export type AbsIndex<
  Spread extends string[],
  T extends number,
  Length extends string[] = []
> = `${T}` extends `-${infer N extends number}`
  ? Spread["length"] extends N
    ? Length["length"]
    : Spread extends [infer Part extends string, ...infer Rest extends string[]]
    ? AbsIndex<Rest, T, [...Length, Part]>
    : never
  : T;
