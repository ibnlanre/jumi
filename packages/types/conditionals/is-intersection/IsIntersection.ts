import { Intersect } from "@/types";

type IsIntersectionHelper<Left, Right> = (<T>() => T extends Left & T
  ? 1
  : 0) extends <T>() => T extends Right & T ? 1 : 0
  ? 0
  : 1;

export type IsIntersection<Value> = IsIntersectionHelper<
  Value,
  Intersect<Value>
>;
