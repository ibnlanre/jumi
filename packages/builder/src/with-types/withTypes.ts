export function withTypes<
  Types extends Record<string, unknown>,
  const Key extends string = "with"
>() {
  return <U extends Record<string, unknown>>(input: U) => {
    return input as U & Record<Key, Types>;
  };
}
