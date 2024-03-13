import { Stringify } from "../../string/stringify";

export type Join<T extends any[], Separator extends string = ""> = T extends [
  infer Head,
  ...infer Rest
]
  ? Rest extends []
    ? Head
    : `${Stringify<Head>}${Separator}${Join<Rest, Separator>}`
  : "";
