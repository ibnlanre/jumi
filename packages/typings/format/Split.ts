import type { Separator } from "./Separator";
import type { SplitHelper } from "./SplitHelper";

export type Split<
  In extends string,
  Out extends Record<string, any> = {},
  Stream extends string = ""
> = In extends `${infer Part}${infer In}`
  ? Part extends Separator
    ? SplitHelper<`${Stream}${Part}`, In, Out, Part>
    : Split<In, Out, `${Stream}${Part}`>
  : In extends ""
  ? SplitHelper<Stream, In, Out, In>
  : never;
