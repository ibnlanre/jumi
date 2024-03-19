export type ArbitraryKey<T = undefined> = Exclude<T | (string & {}), undefined>;
