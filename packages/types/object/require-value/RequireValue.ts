import { IsNever } from "@ibnlanre/types";

export type RequireValue<Value> = Exclude<Value, undefined> extends infer Value
  ? IsNever<Value> extends 1
    ? undefined
    : Value
  : never;
