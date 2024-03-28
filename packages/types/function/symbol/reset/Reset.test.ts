import { describe, expectTypeOf, test } from "vitest";
import type { Reset } from "./Reset";

describe("Reset", () => {
  test("should return the value when S is an empty tuple", () => {
    type Result = Reset<[], [1, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3]>();
  });

  test("should return the state when V is an empty tuple", () => {
    type Result = Reset<[1, 2, 3], []>;
    expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3]>();
  });

  test("should combine the state and value tuples", () => {
    type Result = Reset<[1, 2, 3], [4, 5, 6]>;
    expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3, 4, 5, 6]>();
  });

  test("should void the head of the state tuple", () => {
    type Result = Reset<[void, 2, 3], [4, 5, 6]>;
    expectTypeOf<Result>().toEqualTypeOf<[4, 2, 3, 5, 6]>();
  });

  test("should handle empty tuples as input", () => {
    type Result = Reset<[], []>;
    expectTypeOf<Result>().toEqualTypeOf<[]>();
  });
});
