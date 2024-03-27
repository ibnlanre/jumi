type Get<T extends unknown, Index extends number = 0> = T extends {
  [K in Index]: infer Head;
}
  ? Head
  : never;

interface FnImpl {
  args: unknown;
  slot: unknown;
  data: unknown;
}

interface FnArgs extends FnImpl {
  0: Get<this["args"], 0>;
  1: Get<this["args"], 1>;
  2: Get<this["args"], 2>;
  3: Get<this["args"], 3>;
  4: Get<this["args"], 4>;
  5: Get<this["args"], 5>;
  6: Get<this["args"], 6>;
  7: Get<this["args"], 7>;
  8: Get<this["args"], 8>;
  9: Get<this["args"], 9>;
}

export type Fn = FnArgs;
