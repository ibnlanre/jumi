export type Zip<A extends any[], B extends any[]> = A extends [
  infer HeadA,
  ...infer RestA
]
  ? B extends [infer HeadB, ...infer RestB]
    ? [[HeadA, HeadB], ...Zip<RestA, RestB>]
    : []
  : [];
