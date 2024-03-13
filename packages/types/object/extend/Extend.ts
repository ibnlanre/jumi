import { Intersect } from "@ibnlanre/types";

export type Extend<
  T extends Record<string, any>,
  U extends Record<string, any>
> = Intersect<{
  [K in keyof T | keyof U]: K extends keyof T
    ? T[K]
    : K extends keyof U
    ? U[K]
    : never;
}>;
