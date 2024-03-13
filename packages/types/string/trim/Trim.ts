import { TrimEnd } from "../trim-end";
import { TrimStart } from "../trim-start";

export type Trim<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = TrimStart<TrimEnd<T, Count, Letter>, Count, Letter>;
