import { UnionToTuple } from "@ibnlanre/types";

export type IsUnion<T> = [T] extends UnionToTuple<T> ? 0 : 1;
