import { IsUnion } from "@ibnlanre/types";

export type RequireValue<Value> = IsUnion<Value> extends 1
  ? Exclude<Value, undefined>
  : Value;
