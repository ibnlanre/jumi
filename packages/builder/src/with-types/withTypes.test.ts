import { describe, expect, test } from "vitest";
import { withTypes } from "./withTypes";

describe("withTypes", () => {
  test("should add types to the input object", () => {
    const input = { value: "test" };
    const result = withTypes<{ type: string }>()(input);

    expect(result).toEqual({ value: "test", with: { type: "string" } });
  });
});
