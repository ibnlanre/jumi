type Merge<T extends Record<string, any>, U extends Record<string, any>> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? T[K]
    : K extends keyof U
    ? U[K]
    : never;
};

type Retrieve<
  Out extends Record<string, any>,
  In extends string,
  FallBack = ""
> = In extends keyof Out ? NonNullable<Out[In]> : FallBack;

export declare namespace Object {
  export { Merge, Retrieve };
}
