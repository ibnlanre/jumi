import { shallowEqual } from "@/utilities";
import { describe, expect, test } from "vitest";

describe("shallowEqual", () => {
  test("should return true for equal objects", () => {
    const obj1 = { foo: "bar", baz: 123 };
    const obj2 = { foo: "bar", baz: 123 };
    expect(shallowEqual(obj1, obj2)).toBe(true);
  });

  test("should return false for unequal objects", () => {
    const obj1 = { foo: "bar", baz: 123 };
    const obj2 = { foo: "bar", baz: 456 };
    expect(shallowEqual(obj1, obj2)).toBe(false);
  });

  test("should return true for equal arrays", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    expect(shallowEqual(arr1, arr2)).toBe(true);
  });

  test("should return false for unequal arrays", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 4];
    expect(shallowEqual(arr1, arr2)).toBe(false);
  });

  test("should return true for equal primitive values", () => {
    expect(shallowEqual("foo", "foo")).toBe(true);
    expect(shallowEqual(123, 123)).toBe(true);
    expect(shallowEqual(true, true)).toBe(true);
  });

  test("should return false for unequal primitive values", () => {
    expect(shallowEqual("foo", "bar")).toBe(false);
    expect(shallowEqual(123, 456)).toBe(false);
    expect(shallowEqual(true, false)).toBe(false);
  });

  test("should return false for objects with different number of keys", () => {
    const obj1 = { foo: "bar", baz: 123 };
    const obj2 = { foo: "bar" };
    expect(shallowEqual(obj1, obj2)).toBe(false);
  });

  test("should return false for objects with different keys", () => {
    const obj1 = { foo: "bar", baz: 123 };
    const obj2 = { foo: "bar", qux: 456 };
    expect(shallowEqual(obj1, obj2)).toBe(false);
  });
});
