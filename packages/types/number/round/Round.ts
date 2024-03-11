import { Abs, Add, Mod, Multiply, Subtract } from "ts-arithmetic";

import { Floor } from "../floor";
import { Sign } from "../sign";

export type Round<
  Value extends number,
  MidPointRounding extends "AwayFromZero" | "ToEven" = "ToEven"
> = MidPointRounding extends "AwayFromZero"
  ? Multiply<Sign<Value>, Floor<Add<Abs<Value>, 0.5>>>
  : Floor<Subtract<Add<Value, 0.5>, Mod<Floor<Add<Value, 0.5>>, 1>>>;
