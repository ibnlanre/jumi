import type { Push } from "../../iterables/push";
import type { LastOf } from "../last-of";

export type UnionToTuple<T, L = LastOf<T>, N = Exclude<T, L>> = [L] extends [
  never
]
  ? []
  : Push<UnionToTuple<N>, L>;
