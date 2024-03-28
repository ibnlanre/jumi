import { Fn, unset } from "@ibnlanre/types";

export type IsSuperType<Left, Right> = Right extends Left ? 1 : 0;

export interface TIsSuperType<
  Right extends unknown | unset = unset,
  Left extends unknown | unset = unset
> extends Fn {
  slot: [Right, Left];
  data: IsSuperType<this[1], this[0]>;
}
