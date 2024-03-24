import { Serializable, Split, Stringify } from "@ibnlanre/types";

export type Length<T extends Serializable> = Split<Stringify<T>>["length"];
