import { expectTypeOf, test } from "vitest";
import { Add } from "./Add";

test("Add type", () => {
  type Input = { a: number; b: string };
  type Result = Add<Input, "c", boolean>;

  expectTypeOf<Result>().toEqualTypeOf<{ a: number; b: string; c: boolean }>();
});
