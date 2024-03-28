import { Fn, RequireValue } from "@ibnlanre/types";

export type FallbackTo<
  ActualValue,
  FallbackValue,
  PreventableValue = undefined
> = ActualValue extends PreventableValue
  ? FallbackValue
  : RequireValue<ActualValue>;

export interface TFallbackTo<
  FallbackValue extends unknown | void = void,
  ActualValue extends unknown | void = void,
  PreventableValue extends unknown | undefined = undefined
> extends Fn {
  slot: [FallbackValue, ActualValue, PreventableValue];
  data: FallbackTo<this[1], this[0], this[2]>;
}
