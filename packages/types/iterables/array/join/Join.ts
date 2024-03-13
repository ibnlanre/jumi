import { Stringify } from "../../stringify";

// export type Join<
//   T extends any[],
//   Delimiter extends string = ",",
//   U extends string = ""
// > = T extends [infer Head extends string, ...infer Tail extends any[]]
//   ? Join<
//       Tail,
//       Delimiter,
//       U extends "" ? Stringify<Head> : `${U}${Delimiter}${Stringify<Head>}`
//     >
//   : U;

type Join<T extends any[], Separator extends string = ","> = T extends [
  infer Head,
  ...infer Rest
]
  ? Rest extends []
    ? Head
    : `${Stringify<Head>}${Separator}${Join<Rest, Separator>}`
  : "";
