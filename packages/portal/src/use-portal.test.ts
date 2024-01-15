import { renderHook, act } from "@testing-library/react";
import { expect, describe, afterEach, it } from "vitest";

import { usePortal, Portal } from "@/portal";

const store = new Portal();

afterEach(() => {
  store.clear();
});

describe("usePortal", () => {
  it("should return the initial state", () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() =>
      usePortal({ path: "test", initialState, store })
    );

    const [state] = result.current;
    expect(state).toEqual(initialState);
  });

  it("should update the state when the setter is called", () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() =>
      usePortal({ path: "test", initialState, store })
    );

    const [, setState] = result.current;
    act(() => {
      setState({ count: 1 });
    });

    const [newState] = result.current;
    expect(newState).toEqual({ count: 1 });
  });

  it("should retrieve the stored value from storage when the get method is provided", () => {
    const initialState = { count: 0 };
    localStorage.setItem("test", JSON.stringify({ count: 1 }));

    const { result } = renderHook(() =>
      usePortal({
        path: "test",
        initialState,
        store,
        options: {
          get: (value) => {
            const val = localStorage.getItem("test");
            return val ? JSON.parse(val) : value;
          },
        },
      })
    );

    const [state] = result.current;
    expect(state).toEqual({ count: 1 });
  });

  it("should persist the state to storage when the set method is provided", () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() =>
      usePortal({
        path: "test",
        initialState,
        store,
        options: {
          set: (value) => localStorage.setItem("test", JSON.stringify(value)),
          get: (value) => {
            const val = localStorage.getItem("test");
            return val ? JSON.parse(val) : value;
          },
        },
      })
    );

    const [, setState] = result.current;
    act(() => {
      setState({ count: 1 });
    });

    const val = localStorage.getItem("test");
    expect(val).toBe(JSON.stringify({ count: 1 }));
  });

  it("should not overwrite the stored value when the get and set method are provided", () => {
    const initialState = { count: 0 };
    localStorage.setItem("test", JSON.stringify({ count: 1 }));

    const { result } = renderHook(() =>
      usePortal({
        path: "test",
        initialState,
        store,
        options: {
          set: (value) => localStorage.setItem("test", JSON.stringify(value)),
          get: (value) => {
            const val = localStorage.getItem("test");
            return val ? JSON.parse(val) : value;
          },
        },
      })
    );

    const valBefore = localStorage.getItem("test");
    expect(valBefore).toEqual(JSON.stringify({ count: 1 }));

    const [, setState] = result.current;
    act(() => {
      setState({ count: 2 });
    });

    const valAfter = localStorage.getItem("test");
    expect(valAfter).toBe(JSON.stringify({ count: 2 }));
  });

  it("should select the specified data from the state", () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() =>
      usePortal({
        path: "test",
        initialState,
        store,
        options: {
          select: ({ count }) => count,
        },
      })
    );

    const [state] = result.current;
    expect(state).toEqual(0);
  });
});
