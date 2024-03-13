import { Length } from "../../length";
import { Slice } from "../../slice";

export type Place<
  T extends string,
  U extends string,
  Index extends number
> = `${Slice<T, 0, Index>}${U}${Slice<T, Index, Length<T>>}`;
