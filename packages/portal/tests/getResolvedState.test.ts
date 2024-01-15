import { getResolvedState } from "@/utilities";
import { describe, expect, test } from "vitest";

describe("getResolvedState", () => {
  test("should return the initial state if it is not a function", () => {
    const initialState = 0;
    const resolvedState = getResolvedState(initialState);
    expect(resolvedState).toBe(initialState);
  });

  test("should return the result of the initial state function if it is a function", () => {
    const initialState = () => 10;
    const resolvedState = getResolvedState(initialState);
    expect(resolvedState).toBe(10);
  });
});
