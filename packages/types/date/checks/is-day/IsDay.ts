import { Pattern } from "@ibnlanre/types";

export type IsDay<T extends string> = Pattern<T, number, "-", "Z" | "T" | "">;
