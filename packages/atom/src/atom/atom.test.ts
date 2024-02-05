import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, expectTypeOf } from "vitest";
import { StrictMode } from "react";

import { atom } from "@/atom";

describe("atom", () => {
  const initialState = 0;

  const numberAtom = atom({
    state: initialState,
    context: {
      type: "number",
    },
  });

  test("should return the state and setState", () => {
    const { result } = renderHook(() => numberAtom.use());

    const [state, setState] = result.current;

    expect(setState).toBeInstanceOf(Function);
    expectTypeOf(state).toBeNumber();
    expect(state).toBe(0);
  });

  test("should update the state", () => {
    const { result } = renderHook(() => numberAtom.use());

    const [, setState] = result.current;
    act(() => {
      setState(10);
    });

    const [newState] = result.current;
    expect(newState).toBe(10);
  });

  test("should retrieve the context from an array destructure", () => {
    const { result } = renderHook(() => numberAtom.use());
    const [, { type }] = result.current;
    expect(type).toEqual("number");
  });

  test("should retrieve the context from an object destructure", () => {
    const { result } = renderHook(() => numberAtom.use());
    const { type } = result.current;
    expect(type).toEqual("number");
  });

  test("should retrieve the name from the key", () => {
    const { result } = renderHook(() =>
      numberAtom.use({
        key: "number",
      })
    );
    const { number, setNumber } = result.current;

    expect(number).toEqual(10);
    expect(setNumber).toBeInstanceOf(Function);

    act(() => {
      setNumber(20);
    });

    const [newNumber] = result.current;
    expect(newNumber).toBe(20);
  });
});

describe.concurrent.each([
  ["atom.use without strict mode", undefined],
  ["atom.use with strict mode", StrictMode],
])(`%s`, (description, wrapper) => {
  const use = vi.fn((value, dep: number) => {});
  const numberAtom = atom({
    state: 4,
    events: {
      use,
    },
  });

  test.each([
    ["should not run the use method if enabled is false", 0, 0, false],
    ["should run the use method if enabled is true", 0, 1, true],
    [
      "should not rerun the use method if the argument is the same",
      0,
      1,
      undefined,
    ],
    [
      "should rerun the use method if the state changes to a new value",
      1,
      2,
      undefined,
    ],
    [
      "should run the use method if the state changes to a previous value",
      0,
      3,
      undefined,
    ],
  ])(`%s`, (condition, state, expected, enabled) => {
    renderHook(
      () => {
        numberAtom.use({
          useArgs: [state],
          enabled,
        });
      },
      {
        wrapper,
      }
    );
    expect(use).toHaveBeenCalledTimes(expected);
  });
});
