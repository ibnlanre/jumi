import type { Parse } from "./Parse";

export type Shear<
  T extends string,
  K extends string | number | symbol,
  Delimiter extends string = "."
> = T extends `${K extends string | number ? K : never}${Delimiter}${infer R}`
  ? Parse<R>
  : T;
