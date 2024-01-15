import { getComputedState } from "@/utilities";
import { describe, expect, test } from "vitest";

describe("getComputedState", () => {
  test("should return the initial state if it is not a function", () => {
    const initialState = 0;
    const previousState = 10;

    const computedState = getComputedState(initialState, previousState);

    expect(computedState).toBe(initialState);
  });

  test("should return the computed state if the initial state is a function", () => {
    const initialState = (prevState: number) => prevState + 1;
    const previousState = 10;

    const computedState = getComputedState(initialState, previousState);

    expect(computedState).toBe(previousState + 1);
  });
});
