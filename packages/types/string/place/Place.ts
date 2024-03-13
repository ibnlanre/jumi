import { Slice } from "../../array/slice";
import { Length } from "../length";

export type Place<
  T extends string,
  U extends string,
  Index extends number
> = `${Slice<T, 0, Index>}${U}${Slice<T, Index, Length<T>>}`;
