import { isAtomStateFunction } from "@/utilities/isAtomStateFunction";
import { describe, expect, test } from "vitest";

describe("isAtomStateFunction", () => {
  test("isAtomStateFunction should return true for a valid AtomState function", () => {
    const atomStateFunction = (properties: { foo: string }) => "bar";
    expect(isAtomStateFunction(atomStateFunction)).toBe(true);
  });

  test("isAtomStateFunction should return false for a non-function value", () => {
    const nonFunctionValue = "not a function";
    expect(isAtomStateFunction(nonFunctionValue)).toBe(false);
  });

  test.fails("isAtomStateFunction should return false for a function with incorrect signature", () => {
    const incorrectSignatureFunction = (state: string) => state.length;
    expect(isAtomStateFunction(incorrectSignatureFunction)).toBe(false);
  });
});
