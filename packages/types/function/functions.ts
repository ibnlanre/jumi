import { Join, Range, SliceTo, With } from "../array";
import { Place } from "../string";

import { Apply, Call, Fn, ForEach, Pipe } from ".";
import { IForEach } from "./internals";
import { data, slot, unset } from "./symbol";

interface UpperCase<word extends string | unset = unset> extends Fn {
  [slot]: [word];
  [data]: Uppercase<this[0]>;
}

interface PlaceFn extends Fn {
  [data]: Place<this[0], this[1], this[2]>;
}

interface RangeFn<
  From extends number | unset = unset,
  To extends number | unset = unset
> extends Fn {
  [slot]: [From, To];
  [data]: Range<this[0], this[1]>;
}

interface SliceToFn<
  Array extends unknown[] | unset = unset,
  To extends number | unset = unset
> extends Fn {
  [slot]: [Array, To];
  [data]: SliceTo<this[0], this[1]>;
}

interface WithFn<
  Array extends unknown[] | unset = unset,
  Index extends number | unset = unset,
  Value extends unknown | unset = unset
> extends Fn {
  [slot]: [Array, Index, Value];
  [data]: With<this[0], this[1], this[2]>;
}

interface JoinFn<
  Array extends unknown[] | unset = unset,
  Separator extends string | unset = unset
> extends Fn {
  [slot]: [Array, Separator];
  [data]: Join<this[0], this[1]>;
}

type Test1 = Call<UpperCase<"hi">>;
type Test5 = Apply<UpperCase<"hi">, ["like"]>;
type Test4 = Map<UpperCase, ["hi", "hello"]>;
type Test6 = Pipe<"hello", [UpperCase]>;
type Test7 = Apply<PlaceFn, ["hello", "a", 2 | 4]>;

// type Test2 = ;
// type Test2 = [
//   RangeFn<1>,
//   SliceToFn<unset, 2>,
//   WithFn<unset, 0, "🔥">,
//   WithFn<unset, 1, "📜">,
//   JoinFn<unset, " HotScript ">
// ];

type Test2 = WithFn<[1, 2], 0, "🔥">;

type Test10 = Apply<WithFn, [[1, 2], 0, "🔥"]>;

type Test9 = Call<IForEach<WithFn, [[[1, 2], 0, "🔥"], [[1, 2], 1, "📜"]]>>;
type Test11 = Call<IForEach<UpperCase, [["hi"], ["hello"]]>>;

type Test = Pipe<
  7,
  [
    RangeFn<1>,
    SliceToFn<unset, 2>,
    WithFn<unset, 0, "🔥">,
    WithFn<unset, 1, "📜">,
    JoinFn<unset, " HotScript ">
  ]
>;
