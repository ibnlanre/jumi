import { Intersect } from "@ibnlanre/types";

export type Merge<
  Source extends Record<string, any>,
  Target extends Record<string, any>
> = Intersect<
  {
    [Key in keyof Source as Key extends keyof Target
      ? never
      : Key]: Source[Key];
  } & {
    [Key in keyof Target as Key extends keyof Source
      ? never
      : Key]: Target[Key];
  } & {
    [Key in keyof Source & keyof Target]: Source[Key] extends Record<
      string,
      any
    >
      ? Target[Key] extends Record<string, any>
        ? Merge<Source[Key], Target[Key]>
        : Target[Key]
      : Target[Key];
  }
>;
