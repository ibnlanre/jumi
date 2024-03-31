// interface UpperCase<word extends string | unset = unset> extends Fn {
//   [slot]: [word];
//   [data]: Uppercase<this[0]>;
// }

import {
  Pipe,
  TAdd,
  TAddition,
  TJoin,
  TMap,
  TParseInt,
  TPrepend,
  TRange,
  TSliceTo,
  TSplit,
  TStringify,
  TWith,
} from "@ibnlanre/types";

// interface PlaceFn extends Fn {
//   [data]: Place<this[0], this[1], this[2]>;
// }

// interface SliceToFn<
//   Array extends unknown[] | unset = unset,
//   To extends number | unset = unset
// > extends Fn {
//   [slot]: [Array, To];
//   [data]: SliceTo<this[0], this[1]>;
// }

// interface WithFn<
//   Array extends unknown[] | unset = unset,
//   Index extends number | unset = unset,
//   Value extends unknown | unset = unset
// > extends Fn {
//   [slot]: [Array, Index, Value];
//   [data]: With<this[0], this[1], this[2]>;
// }

// type Test1 = Call<UpperCase<"hi">>;
// type Test5 = Apply<UpperCase<"hi">, ["like"]>;
// type Test4 = Map<UpperCase, ["hi", "hello"]>;
// type Test6 = Pipe<"hello", [UpperCase]>;
// type Test7 = Apply<PlaceFn, ["hello", "a", 2 | 4]>;

// // type Test2 = ;
// // type Test2 = [
// //   RangeFn<1>,
// //   SliceToFn<unset, 2>,
// //   WithFn<unset, 0, "🔥">,
// //   WithFn<unset, 1, "📜">,
// //   JoinFn<unset, " HotScript ">
// // ];

// type Test2 = WithFn<[1, 2], 0, "🔥">;

// type Test10 = Apply<WithFn, [[1, 2], 0, "🔥"]>;

// type Test9 = Call<IForEach<WithFn, [[[1, 2], 0, "🔥"], [[1, 2], 1, "📜"]]>>;
// type Test11 = Call<IForEach<UpperCase, [["hi"], ["hello"]]>>;

type Test1 = Pipe<
  7,
  [TRange<1>, TSliceTo<2>, TWith<0, "🔥">, TWith<1, "📜">, TJoin<" HotScript ">]
>;

type Test2 = Pipe<
  //  ^? 62
  [1, 2, 3, 4],
  [
    TMap<TAdd<3>>, // [4, 5, 6, 7]
    TMap<TStringify>, // ["4", "5", "6", "7"]
    TMap<TPrepend<"1">>, // ["14", "15", "16", "17"]
    TMap<TParseInt>, // [14, 15, 16, 17]
    TAddition // 62
  ]
>;
