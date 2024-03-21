import { Pattern } from "@ibnlanre/types";

export type IsMinutes<T extends string> = Pattern<T, number, ":", ":">;
