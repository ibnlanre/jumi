import { Interject } from "../interject";

export type Resect<
  Left extends unknown = [],
  Right extends unknown = []
> = Left extends []
  ? Interject<Right>
  : Right extends []
  ? Interject<Left>
  : Left extends [infer Ls, ...infer Lv]
  ? Right extends [infer Rs, ...infer Rv]
    ? [void] extends [Ls]
      ? [void] extends [Rs]
        ? Resect<Lv, Rv>
        : [Rs, ...Resect<Lv, Rv>]
      : [Ls, ...Resect<Lv, Right>]
    : []
  : [];
