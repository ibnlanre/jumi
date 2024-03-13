import { Split } from "../string/split";

export type Length<T extends string> = Split<T>["length"];
