import { Pattern } from "@ibnlanre/types";

export type IsMonth<T extends string> = Pattern<T, number, "-", "Z" | "-" | "">;
