import { Intersect } from "@/types";
import { Fn, unset } from "@ibnlanre/types";

type IsIntersectionHelper<Left, Right> = (<T>() => T extends Left & T
  ? 1
  : 0) extends <T>() => T extends Right & T ? 1 : 0
  ? 0
  : 1;

export type IsIntersection<Value> = IsIntersectionHelper<
  Value,
  Intersect<Value>
>;

export interface TIsIntersection<Value extends unknown | unset = unset>
  extends Fn {
  slot: [Value];
  data: IsIntersection<this[0]>;
}
