import { And } from "ts-arithmetic";

type IsExactTypeHelper<Left, Right> = [Right] extends [Left] ? 1 : 0;

export type IsExactType<T, U> = And<
  IsExactTypeHelper<T, U>,
  IsExactTypeHelper<U, T>
>;
