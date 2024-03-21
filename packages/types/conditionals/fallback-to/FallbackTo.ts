import { RequireValue } from "@ibnlanre/types";

export type FallbackTo<
  ActualValue,
  FallbackValue,
  PreventableValue = undefined
> = ActualValue extends PreventableValue
  ? FallbackValue
  : RequireValue<ActualValue>;
