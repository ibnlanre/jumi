import { describe, expectTypeOf, test } from "vitest";
import { Insert } from "./Insert";

describe("Insert", () => {
  test("Add linear value", () => {
    type Result = Insert<{ a: number; b: string }, "c", boolean>;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: number;
      b: string;
      c: boolean;
    }>();
  });

  test("Add nested value", () => {
    type c = { d: boolean };
    type Result = Insert<{ a: number; b: string }, "c", c>;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: number;
      b: string;
      c: {
        d: boolean;
      };
    }>();
  });
});
