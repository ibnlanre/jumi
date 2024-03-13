import { describe, expectTypeOf, it } from "vitest";
import type { IndexAt } from "./IndexAt";

describe("IndexAt", () => {
  it("should correctly get the value at the specified index", () => {
    type Arr = [1, "hello", true];
    expectTypeOf<IndexAt<Arr, 0>>().toEqualTypeOf<0>();
    expectTypeOf<IndexAt<Arr, 1>>().toEqualTypeOf<1>();
    expectTypeOf<IndexAt<Arr, 2>>().toEqualTypeOf<2>();
  });

  it("should correctly get the value at the specified negative index", () => {
    type Arr = [1, "hello", true];
    expectTypeOf<IndexAt<Arr, -1>>().toEqualTypeOf<2>();
    expectTypeOf<IndexAt<Arr, -2>>().toEqualTypeOf<1>();
    expectTypeOf<IndexAt<Arr, -3>>().toEqualTypeOf<0>();
  });

  it("should throw an error for an out-of-bounds index", () => {
    type Arr = [1, "hello", true];
    expectTypeOf<IndexAt<Arr, 3>>().toBeNever();
    expectTypeOf<IndexAt<Arr, -4>>().toBeNever();
  });
});
