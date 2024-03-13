export type Paths<
  Base extends Record<string, any>,
  Delimiter extends string = "."
> = Base extends Record<infer Key extends string | number, any>
  ? {
      [K in Key]: Base[K] extends Record<string, any>
        ? `${K}` | `${K}${Delimiter}${Paths<Base[K], Delimiter>}`
        : `${K}`;
    }[Key]
  : never;
