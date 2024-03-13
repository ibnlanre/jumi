export type Prepend<
  Left extends string,
  Right extends string
> = `${Right}${Left}`;
