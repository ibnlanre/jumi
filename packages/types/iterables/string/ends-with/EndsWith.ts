export type EndsWith<
  T extends string,
  U extends string
> = T extends `${string}${U}` ? 1 : 0;
