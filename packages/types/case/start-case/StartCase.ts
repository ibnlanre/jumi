export type StartCase<T extends string> = Capitalize<Lowercase<T>>;

export type SnakeCase<T extends string> =
  T extends `${infer Start}${infer Rest}`
    ? `${Start extends Uppercase<Start>
        ? "_"
        : ""}${Lowercase<Start>}${SnakeCase<Rest>}`
    : "";

type Test = SnakeCase<"HelloWorld">;

export type CamelCase<T extends string> =
  T extends `${infer Start}_${infer Rest}`
    ? `${Lowercase<Start>}${CamelCase<Capitalize<Rest>>}`
    : T;

export type KebabCase<T extends string> = SnakeCase<T> extends infer S
  ? S extends string
    ? S extends `_${infer Rest}`
      ? Rest
      : S
    : never
  : never;

export type PascalCase<T extends string> = Capitalize<CamelCase<T>>;

export type UpperCase<T extends string> =
  T extends `${infer Start}${infer Rest}`
    ? `${Uppercase<Start>}${UpperCase<Rest>}`
    : "";

export type LowerCase<T extends string> =
  T extends `${infer Start}${infer Rest}`
    ? `${Lowercase<Start>}${LowerCase<Rest>}`
    : "";

export type Capitalize<T extends string> =
  T extends `${infer Start}${infer Rest}` ? `${Uppercase<Start>}${Rest}` : "";

export type Uncapitalize<T extends string> =
  T extends `${infer Start}${infer Rest}` ? `${Lowercase<Start>}${Rest}` : "";

export type SwapCase<T extends string> = T extends `${infer Start}${infer Rest}`
  ? `${Start extends Uppercase<Start>
      ? Lowercase<Start>
      : Uppercase<Start>}${SwapCase<Rest>}`
  : "";

export type TitleCase<T extends string> = Capitalize<Lowercase<T>>;

export type SentenceCase<T extends string> = Capitalize<Lowercase<T>>;

export type DotCase<T extends string> = SnakeCase<T> extends infer S
  ? S extends string
    ? S extends `_${infer Rest}`
      ? `.${Rest}`
      : S
    : never
  : never;

export type PathCase<T extends string> = SnakeCase<T> extends infer S
  ? S extends string
    ? S extends `_${infer Rest}`
      ? `/${Rest}`
      : S
    : never
  : never;

export type SlashCase<T extends string> = SnakeCase<T> extends infer S
  ? S extends string
    ? S extends `_${infer Rest}`
      ? `/${Rest}`
      : S
    : never
  : never;

export type CapitalCase<T extends string> = Capitalize<LowerCase<T>>;

export type HeaderCase<T extends string> = SnakeCase<T> extends infer S
  ? S extends string
    ? S extends `_${infer Rest}`
      ? `${Uppercase<Rest>}`
      : S
    : never
  : never;

export type ConstantCase<T extends string> = UpperCase<SnakeCase<T>>;
