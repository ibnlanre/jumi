import { Floor, Fn, Sign } from "@ibnlanre/types";
import { Abs, Add, Mod, Multiply, Subtract } from "ts-arithmetic";

export type Round<
  Value extends number,
  MidPointRounding extends "AwayFromZero" | "ToEven" = "ToEven"
> = MidPointRounding extends "AwayFromZero"
  ? Multiply<Sign<Value>, Floor<Add<Abs<Value>, 0.5>>>
  : Floor<Subtract<Add<Value, 0.5>, Mod<Floor<Add<Value, 0.5>>, 1>>>;

export interface TRound<
  Value extends number | void = void,
  MidPointRounding extends "AwayFromZero" | "ToEven" | void = "ToEven"
> extends Fn {
  slot: [Value, MidPointRounding];
  data: Round<this[0], this[1]>;
}
