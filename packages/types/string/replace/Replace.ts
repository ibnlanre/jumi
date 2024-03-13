export type Replace<
  S extends string,
  Find extends string,
  Replace extends string
> = S extends `${infer T}${Find}${infer U}` ? `${T}${Replace}${U}` : S;
