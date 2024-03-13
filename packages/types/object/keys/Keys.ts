export type Keys<Object extends object> = Object extends Record<
  infer Key extends string | number,
  any
>
  ? `${Key}`
  : never;
