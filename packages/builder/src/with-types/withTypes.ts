export function withTypes<Types extends Record<string, unknown>>() {
  return <U extends Record<string, unknown>>(input: U) => {
    return input as U & {
      types: Types;
    };
  };
}
