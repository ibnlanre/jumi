import { describe, expectTypeOf, test } from "vitest";

import { unset } from "..";
import { Preset } from "./Dissect";

describe("Preset", () => {
  test("should return an empty tuple when input is an empty tuple", () => {
    type Result = Preset<[]>;
    expectTypeOf<Result>().toEqualTypeOf<[]>();
  });

  test("should reset the head of the tuple when it is unset", () => {
    type Result = Preset<[unset, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<[2, 3]>();
  });

  test("should reset the head of the tuple when it is not unset", () => {
    type Result = Preset<[1, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3]>();
  });

  test("should reset multiple unset values in the tuple", () => {
    type Result = Preset<[unset, 2, unset, 4]>;
    expectTypeOf<Result>().toEqualTypeOf<[2, 4]>();
  });

  test("should handle nested tuples", () => {
    type Result = Preset<[[unset, 2], [3, 4], [unset, 6]]>;
    expectTypeOf<Result>().toEqualTypeOf<[[unset, 2], [3, 4], [unset, 6]]>();
  });
});
