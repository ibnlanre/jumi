type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Paths<Base, Delimiter extends string = "."> = Base extends Record<
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

type Parse<Key extends string | number> =
  Key extends `${infer Value extends number}` ? Value : Key;

type Shear<
  T extends string,
  K extends string | number | symbol,
  Delimiter extends string = "."
> = T extends `${K extends string | number ? K : never}${Delimiter}${infer R}`
  ? Parse<R>
  : T;

type Indexable =
  | Array<any>
  | ReadonlyArray<any>
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

type Structures =
  | Map<any, any>
  | ReadonlyMap<any, any>
  | WeakMap<object, any>
  | Set<any>
  | ReadonlySet<any>
  | WeakSet<object>;

type Derivatives = Promise<any> | Function | Error | RegExp | Date;

type Value<
  T extends Record<string, any>,
  Key extends keyof T,
  Path extends Paths<T, Delimiter> | (string & {}),
  Delimiter extends string
> = T[Key] extends Record<string, any>
  ? T[Key] extends Indexable | Structures | Derivatives
    ? T[Key]
    : SelectiveDeepPartial<T[Key], Shear<Path, Key, Delimiter>, Delimiter>
  : T[Key];

type SelectiveDeepPartial<
  T extends Record<string, any>,
  Path extends Paths<T, Delimiter> | (string & {}),
  Delimiter extends string = "."
> = Prettify<
  {
    [K in Exclude<keyof T, Path>]: Value<T, K, Path, Delimiter>;
  } & {
    [K in Extract<keyof T, Path>]?: Value<T, K, Path, Delimiter>;
  }
>;

type SelectivePartial<
  T extends Record<string, any>,
  K extends keyof T
> = Prettify<Partial<T> & Omit<T, K>>;

type Options = {
  useIframe: boolean;
  useShadowDom: {
    v0: boolean;
    v1: boolean;
  };
};

type Test0 = SelectivePartial<Options, "useIframe">;
//   ^?

type Test1 = SelectiveDeepPartial<Options, "useShadowDom_v1", "_">;
//   ^?

type Test2 = SelectiveDeepPartial<Options, "useIframe" | "useShadowDom.v0">;
//   ^?

type Test3 = SelectiveDeepPartial<Options, "useIframe">;
//   ^?
