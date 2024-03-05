export type Prettify<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
} & {};
