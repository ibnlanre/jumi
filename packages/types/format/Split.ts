import type { Break } from "./Break";

export type Split<
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = ""
> = In extends `${infer Part}${infer In}`
  ? Part extends Separator
    ? Break<`${Stream}${Part}`, In, Out, Part>
    : Split<In, Out, `${Stream}${Part}`>
  : In extends ""
  ? Break<Stream, In, Out, In>
  : never;
