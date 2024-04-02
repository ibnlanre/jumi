/**
 * Forces windening but keeps the structure e.g. ["a","b"] => [string, string]
 *
 */
type WidenStructure<T> = T extends string
  ? string
  : never | T extends number
  ? number
  : never | T extends bigint
  ? bigint
  : never | T extends boolean
  ? boolean
  : never | unknown extends T
  ? unknown
  : never | T extends any[]
  ? T extends [infer Head, ...infer Tail]
    ? [WidenStructure<Head>, ...WidenStructure<Tail>]
    : []
  :
      | never
      | {
          [K in keyof T]: T[K] extends Function ? T[K] : WidenStructure<T[K]>;
        };

type A = WidenStructure<["a", "b"]>; // [string, string]

declare const lambda: unique symbol;

/**
 * Declares basic lambda function with an unique symbol
 * to force other interfaces extending from this type
 */
interface Lambda<Args = unknown, Return = unknown> {
  args: Args;
  return: Return;
  [lambda]: never;
}

/**
 * Composes two Lambda type functions and returns a new lambda function
 * JS-equivalent:
 *  const compose = (a,b) => (arg) => a(b(arg))
 *
 */
interface Compose<
  A extends Lambda<WidenStructure<Return<B>>>,
  B extends Lambda<any, Args<A>>,
  I extends Args<B> = Args<B>
> extends Lambda {
  args: I;
  inner: Call<B, Args<this>>;
  return: this["inner"] extends Args<A> ? Call<A, this["inner"]> : never;
}

/**
 * Gets return type value from a Lambda type function
 */
type Call<M extends Lambda, T extends Args<M>> = (M & {
  args: T;
})["return"];

/**
 * Extracts the argument from a lambda function
 */
type Args<M extends Lambda> = M["args"];

type Return<M extends Lambda> = M["return"];

// Test
interface UpperCase extends Lambda<string> {
  return: Uppercase<Args<this>>;
}
interface LowerCase extends Lambda<string> {
  return: Lowercase<Args<this>>;
}

type Test = Call<UpperCase, "asd">; // "ASD"
type ComposeTest = Call<Compose<LowerCase, UpperCase>, "asdasd">; // "asdasd"
