import { Intersect } from "@ibnlanre/types";

export type HasTypes<
  Input extends Record<string, unknown>,
  Types extends Record<string, any>,
  Key extends string = "has"
> = Intersect<
  Input & {
    [K in Key]?: Types;
  }
>;
