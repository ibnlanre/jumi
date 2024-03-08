import { Intersect } from "@/types";

type Merge<
  T extends Record<string, any>,
  U extends Record<string, any>
> = Intersect<{
  [K in keyof T | keyof U]: K extends keyof T
    ? T[K]
    : K extends keyof U
    ? U[K]
    : never;
}>;

type Retrieve<
  Out extends Record<string, any>,
  In extends string,
  FallBack = string
> = In extends keyof Out ? NonNullable<Out[In]> : FallBack;

type ValueAt<T extends object, U extends number> = U extends keyof T
  ? T[U]
  : never;

export declare namespace Object {
  export { Merge, Retrieve, ValueAt };
}
