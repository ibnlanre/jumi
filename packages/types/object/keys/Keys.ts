export type Keys<ObjectType extends Record<string, any>> =
  keyof ObjectType extends undefined
    ? never
    : keyof ObjectType extends infer Keys extends string | number
    ? `${Keys}`
    : never;
