import { describe, expectTypeOf, test } from "vitest";
import { Set } from "./Set";

describe("Insert", () => {
  test("Add linear value", () => {
    type Result = Set<{ a: number; b: string }, "c", boolean>;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: number;
      b: string;
      c: boolean;
    }>();
  });

  test("Add nested value", () => {
    type c = { d: boolean };
    type Result = Set<{ a: number; b: string }, "c", c>;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: number;
      b: string;
      c: {
        d: boolean;
      };
    }>();
  });
});
