import { Split } from "@ibnlanre/types";

export type Length<T extends string> = Split<T>["length"];
