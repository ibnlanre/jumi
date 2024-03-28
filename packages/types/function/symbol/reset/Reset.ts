import { unset } from "..";
import { Dissect } from "../dissect";

export type Reset<S extends unknown = [], V extends unknown = []> = Dissect<
  S extends []
    ? V
    : V extends []
    ? S
    : S extends [infer Hs, ...infer Rs]
    ? V extends [infer Hv, ...infer Rv]
      ? [unset] extends [Hs]
        ? [unset] extends [Hv]
          ? Reset<Rs, Rv>
          : [Hv, ...Reset<Rs, Rv>]
        : [Hs, ...Reset<Rs, V>]
      : []
    : []
>;
