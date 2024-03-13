import { Join } from "../../array/join";
import { UnionToTuple } from "../../transforms/union-to-tuple";

type Serializable = string | number | boolean | null;

type ArrayToString<T extends any[]> = `[${Join<T>}]`;

type ObjectToString<T extends Record<string, any>> = Join<
  UnionToTuple<
    {
      [K in keyof T]: `${Stringify<K>}: ${Stringify<T[K]>}`;
    }[keyof T]
  >,
  ", "
>;

export type Stringify<T> = T extends string
  ? T
  : T extends Serializable
  ? `${T}`
  : T extends any[]
  ? ArrayToString<T>
  : T extends Record<string, any>
  ? ObjectToString<T>
  : never;
