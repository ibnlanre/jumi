import { Fn, unset } from "@ibnlanre/types";
import { And } from "ts-arithmetic";

type IsExactTypeHelper<Left, Right> = [Right] extends [Left] ? 1 : 0;

export type IsExactType<Left, Right> = And<
  IsExactTypeHelper<Left, Right>,
  IsExactTypeHelper<Right, Left>
>;

export interface TIsExactType<
  Left extends unknown | unset = unset,
  Right extends unknown | unset = unset
> extends Fn {
  slot: [Left, Right];
  data: IsExactType<this[0], this[1]>;
}
