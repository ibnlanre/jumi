import { Dictionary, IsNever, NonEmptyArray } from "@ibnlanre/types";

const a = Symbol();
type a = string;

type EmptyObject = Dictionary<PropertyKey, never>;
type NonEmptyObject = Dictionary<PropertyKey, 8>;

interface NonEmptyObjectInterface extends EmptyObject {}

type Test<T extends NonEmptyObjectInterface> = T;

type X = keyof {};

type A = Test<{}>;
