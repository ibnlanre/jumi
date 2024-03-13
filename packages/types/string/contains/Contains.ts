export type Contains<
  T extends string,
  U extends string
> = T extends `${string}${U}${string}` ? 1 : 0;
