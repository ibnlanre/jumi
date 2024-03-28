import { describe, expectTypeOf, test } from "vitest";
import { Dissect } from "./Dissect";

describe("Dissect", () => {
  test("should return an empty tuple when input is an empty tuple", () => {
    type Result = Dissect<[]>;
    expectTypeOf<Result>().toEqualTypeOf<[]>();
  });

  test("should reset the head of the tuple when it is void", () => {
    type Result = Dissect<[void, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<[2, 3]>();
  });

  test("should reset the head of the tuple when it is not void", () => {
    type Result = Dissect<[1, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3]>();
  });

  test("should reset multiple void values in the tuple", () => {
    type Result = Dissect<[void, 2, void, 4]>;
    expectTypeOf<Result>().toEqualTypeOf<[2, 4]>();
  });

  test("should handle nested tuples", () => {
    type Result = Dissect<[[void, 2], [3, 4], [void, 6]]>;
    expectTypeOf<Result>().toEqualTypeOf<[[void, 2], [3, 4], [void, 6]]>();
  });
});
