import { Dictionary } from "@ibnlanre/types";

export type Keys<ObjectType extends Dictionary> =
  keyof ObjectType extends undefined
    ? never
    : keyof ObjectType extends infer Keys extends string | number
    ? `${Keys}`
    : never;
