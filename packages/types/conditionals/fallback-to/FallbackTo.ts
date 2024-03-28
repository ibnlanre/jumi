import { Fn, RequireValue, unset } from "@ibnlanre/types";

export type FallbackTo<
  ActualValue,
  FallbackValue,
  PreventableValue = undefined
> = ActualValue extends PreventableValue
  ? FallbackValue
  : RequireValue<ActualValue>;

export interface TFallbackTo<
  FallbackValue extends unknown | unset = unset,
  ActualValue extends unknown | unset = unset,
  PreventableValue extends unknown | undefined = undefined
> extends Fn {
  slot: [FallbackValue, ActualValue, PreventableValue];
  data: FallbackTo<this[1], this[0], this[2]>;
}
