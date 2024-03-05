import type { Parse } from "./Parse";

export type Paths<Base, Delimiter extends string = "."> = Base extends Record<
  infer Key extends string | number,
  infer Value
>
  ? Parse<
      {
        [K in Key]: K extends string | number
          ? Extract<Value, Base[K]> extends Record<string, any>
            ? `${K}` | `${K}${Delimiter}${Paths<Base[K], Delimiter>}`
            : `${Key}`
          : never;
      }[Key]
    >
  : never;
