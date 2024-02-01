import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";

import { portal } from "@/portal";

describe("portal.use", () => {
  const path = "is-open";
  const initialState = { isOpen: true };

  it("should return the portal state", () => {
    const { result } = renderHook(() =>
      portal.use(path, { state: initialState })
    );
    const [state] = result.current;
    expect(state).toMatchObject(initialState);
  });

  it("should update the portal state", () => {
    const { result } = renderHook(() =>
      portal.use(path, { state: initialState })
    );
    const [, setState] = result.current;

    act(() => {
      setState({ isOpen: false });
    });

    const [{ isOpen }] = result.current;
    expect(isOpen).toBe(false);
  });

  it("should return the correct value for a given path", () => {
    const { result } = renderHook(() => portal.use("count", { state: 0 }));

    const [count, setCount] = result.current;
    expect(count).toBe(0);

    act(() => {
      setCount(1);
    });

    const [newCount] = result.current;
    expect(newCount).toBe(1);
  });

  it("should return the correct type selected", () => {
    const { result } = renderHook(() =>
      portal.use("name", {
        state: "John",
        select: (state) => (state === "John" ? 5 : 10),
      })
    );

    const [name, setName] = result.current;
    expectTypeOf(name).toEqualTypeOf<number>();
    expect(name).toBe(5);

    act(() => {
      setName("Jane");
    });

    const [newName] = result.current;
    expectTypeOf(name).toEqualTypeOf<number>();
    expect(newName).toBe(10);
  });
});

describe("portal.local", () => {
  afterEach(() => {
    localStorage.clear();
  });

  localStorage.setItem("foo", JSON.stringify("baz"));

  it("should set initial state from local storage", () => {
    const { result } = renderHook(() => portal.local("foo"));

    const [state] = result.current;
    expect(state).toEqual("baz");
  });

  it("should set local storage on state change", () => {
    const { result } = renderHook(() => portal.local("foo"));
    const [, setState] = result.current;

    act(() => {
      setState("qux");
    });

    const [newState] = result.current;

    expect(newState).toEqual("qux");
    expect(localStorage.getItem("foo")).toBe(JSON.stringify("qux"));
  });
});

describe("portal.make", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should make a custom portal with the provided store", () => {
    const userStore = {
      name: "John Doe",
      email: "johndoe@jmail.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    };

    const userPortal = portal.make(userStore);
    expect(userPortal).toBeDefined();
  });

  it("should update the state of the portal using portal.local", () => {
    const userStore = {
      name: "John Doe",
      email: "johndoe@jmail.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    };

    const userPortal = portal.make(userStore);
    const { result, unmount } = renderHook(() => userPortal.local("name"));

    const [user, setUser] = result.current;
    expect(user).toBe("John Doe");

    act(() => {
      setUser("Jane Doe");
    });

    const [newUser] = result.current;
    expect(newUser).toBe("Jane Doe");

    unmount();
  });

  it("should update the state of the portal using portal.session with custom initial state", () => {
    const userStore = {
      name: "John Doe",
      email: "johndoe@jmail.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    };

    sessionStorage.setItem("oh-my", JSON.stringify("uncle"));

    const userPortal = portal.make(userStore);
    const { result } = renderHook(() =>
      userPortal.session("name", {
        key: "oh-my",
      })
    );

    const [state, setState] = result.current;

    expect(state).toBe("uncle");
    expect(sessionStorage.getItem("oh-my")).toBe(JSON.stringify("uncle"));

    act(() => {
      setState("hello");
    });

    const [newState] = result.current;

    expect(newState).toBe("hello");
    expect(sessionStorage.getItem("oh-my")).toBe(JSON.stringify("hello"));
  });
});
