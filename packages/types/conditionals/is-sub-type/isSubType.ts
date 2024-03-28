import { Fn, unset } from "@ibnlanre/types";

export type IsSubType<Left, Right> = Left extends Right ? 1 : 0;

export interface TIsSubType<
  Right extends unknown | unset = unset,
  Left extends unknown | unset = unset
> extends Fn {
  slot: [Right, Left];
  data: IsSubType<this[1], this[0]>;
}
