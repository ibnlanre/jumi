import { Fn } from "../../fn";
import { Apply } from "../apply";

export type Pipe<arg extends unknown, fns extends Fn[]> = (Fn & {
  data: fns extends [infer head extends Fn, ...infer rest extends Fn[]]
    ? Pipe<Apply<head, [arg]>, rest>
    : arg;
})["data"];
