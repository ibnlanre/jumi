import { deepSort } from "@/utilities";
import { expect, describe, it, vi } from "vitest";

describe("deepSort", () => {
  it("should sort an object recursively by its keys", () => {
    const data = {
      name: "John",
      age: 30,
      address: {
        city: "New York",
        state: "NY",
        country: "USA",
        people: [
          {
            name: "Sofia",
            age: 25,
          },
          {
            name: "Nigel",
            age: 30,
          },
        ],
      },
      hobbies: ["reading", "coding", "gaming"],
    };

    const sortedData = deepSort(data);

    expect(sortedData).toEqual({
      address: {
        city: "New York",
        country: "USA",
        people: [
          {
            age: 25,
            name: "Sofia",
          },
          {
            age: 30,
            name: "Nigel",
          },
        ],
        state: "NY",
      },
      age: 30,
      hobbies: ["coding", "gaming", "reading"],
      name: "John",
    });
  });

  it("should sort an array recursively", () => {
    const data = [3, 1, [5, 4, 2], 6];

    const sortedData = deepSort(data);

    expect(sortedData).toEqual([[2, 4, 5], 1, 3, 6]);
  });

  it("should handle empty objects and arrays", () => {
    const data = {
      emptyObject: {},
      emptyArray: [],
    };

    const sortedData = deepSort(data);

    expect(sortedData).toEqual({
      emptyArray: [],
      emptyObject: {},
    });

    const emptyArray: any[] = [];
    expect(deepSort(emptyArray)).toEqual([]);

    const emptyObject = {};
    expect(deepSort(emptyObject)).toEqual({});
  });

  it("should preserve the order of keys with the same value", () => {
    const data = {
      a: 1,
      b: 2,
      c: 1,
    };

    const sortedData = deepSort(data);

    expect(sortedData).toEqual({
      a: 1,
      b: 2,
      c: 1,
    });
  });

  it("should handle different data types", () => {
    const data = {
      string: "hello",
      number: 42,
      boolean: true,
      nullValue: null,
      undefinedValue: undefined,
    };

    const sortedData = deepSort(data);

    expect(sortedData).toEqual({
      boolean: true,
      nullValue: null,
      number: 42,
      string: "hello",
      undefinedValue: undefined,
    });
  });

  it("should handle nested objects with the same value", () => {
    const data = {
      a: {
        a: 1,
        b: 2,
      },
      b: {
        a: 1,
        b: 2,
      },
    };

    const sortedData = deepSort(data);

    expect(sortedData).toEqual({
      a: {
        a: 1,
        b: 2,
      },
      b: {
        a: 1,
        b: 2,
      },
    });
  });

  it("should handle nested arrays with the same value", () => {
    const data = {
      a: [1, 2],
      b: [1, 2],
    };

    const sortedData = deepSort(data);

    expect(sortedData).toEqual({
      a: [1, 2],
      b: [1, 2],
    });
  });

  it("should handle strings", () => {
    const data = "hello";

    const sortedData = deepSort(data);
    expect(sortedData).toEqual("hello");
  });

  it("should handle numbers", () => {
    const data = 42;

    const sortedData = deepSort(data);
    expect(sortedData).toEqual(42);
  });

  it("should handle booleans", () => {
    const data = true;

    const sortedData = deepSort(data);
    expect(sortedData).toEqual(true);
  });

  it("should handle null", () => {
    const data = null;

    const sortedData = deepSort(data);
    expect(sortedData).toEqual(null);
  });

  it("should handle cyclic objects", () => {
    const data: any = {
      a: 1,
      b: 2,
    };

    data.c = data;

    const sortedData = deepSort(data);
    const result = {
      a: 1,
      b: 2,
      c: {
        a: 1,
        b: 2,
        c: expect.objectContaining({
          a: 1,
          b: 2,
          c: expect.anything()
        }),
      },
    };

    expect(sortedData).toEqual(result);
  });
});
