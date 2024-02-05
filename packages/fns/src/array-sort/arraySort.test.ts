import { describe, expect, it } from "vitest";
import { arraySort } from "./arraySort";

describe("arraySort", () => {
  it("should correctly sort arrays of numbers", () => {
    const arr = [5, 2, 8, 1, 10];
    const sortedArr = arr.sort(arraySort);
    expect(sortedArr).toEqual([1, 2, 5, 8, 10]);
  });

  it("should correctly sort arrays of strings", () => {
    const arr = ["banana", "apple", "cherry", "date"];
    const sortedArr = arr.sort(arraySort);
    expect(sortedArr).toEqual(["apple", "banana", "cherry", "date"]);
  });

  it("should correctly sort arrays of objects", () => {
    const arr = [
      { name: "John", age: 30 },
      { name: "Alice", age: 25 },
      { name: "Bob", age: 35 },
    ];
    const sortedArr = arr.sort(arraySort);
    expect(sortedArr).toEqual([
      { name: "Alice", age: 25 },
      { name: "Bob", age: 35 },
      { name: "John", age: 30 },
    ]);
  });

  it("should correctly sort arrays of nested objects", () => {
    const arr = [
      { name: "John", age: 30, address: { city: "New York" } },
      { name: "Alice", age: 25, address: { city: "Los Angeles" } },
      { name: "Bob", age: 35, address: { city: "San Francisco" } },
    ];
    const sortedArr = arr.sort(arraySort);
    expect(sortedArr).toEqual([
      { name: "Alice", age: 25, address: { city: "Los Angeles" } },
      { name: "Bob", age: 35, address: { city: "San Francisco" } },
      { name: "John", age: 30, address: { city: "New York" } },
    ]);
  });

  it("should correctly sort arrays with mixed types", () => {
    const arr = [5, "apple", { name: "John" }, true, null];
    const sortedArr = arr.sort(arraySort);
    expect(sortedArr).toEqual([null, true, 5, "apple", { name: "John" }]);
  });
});
