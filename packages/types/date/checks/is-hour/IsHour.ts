import { Pattern } from "@ibnlanre/types";

export type IsHour<T extends string> = Pattern<T, number, "T", ":">;
