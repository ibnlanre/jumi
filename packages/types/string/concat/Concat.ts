export type Concat<
  Left extends string,
  Right extends string
> = `${Left}${Right}`;
