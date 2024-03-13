import { Split } from "../split";

export type Length<T extends string> = Split<T>["length"];
