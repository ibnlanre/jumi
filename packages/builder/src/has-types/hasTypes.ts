import { HasTypes } from "@ibnlanre/builder";

export function hasTypes<Input extends Record<string, unknown>>(input: Input) {
  return function <
    Types extends Record<string, unknown> = {},
    const Key extends string = "has"
  >() {
    return input as HasTypes<Input, Types, Key>;
  };
}
