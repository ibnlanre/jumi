export type StartsWith<
  T extends string,
  U extends string
> = T extends `${U}${string}` ? 1 : 0;
