export type Parse<Key extends string | number> =
  Key extends `${infer Value extends number}` ? Value : Key;
