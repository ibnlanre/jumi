import { getValue } from "@/utilities";
import { describe, expect, test, vi } from "vitest";

describe("getValue", () => {
  const store = {
    foo: {
      bar: {
        baz: "Hello, World!",
      },
    },
  };

  const getValueMock = vi.fn(getValue);

  test("should return the value at the specified path", () => {
    const result = getValue(store, "foo.bar.baz");
    expect(result).toBe(store.foo.bar.baz);
  });

  test("should return undefined if the path does not exist", () => {
    const result = getValueMock(store, "foo.bar.qux");
    expect(result).toBeUndefined();
  });

  test("should return the default value if the path does not exist", () => {
    const result = getValueMock(store, "foo.bar.qux", ".");
    expect(result).toBeUndefined();
  });
});
