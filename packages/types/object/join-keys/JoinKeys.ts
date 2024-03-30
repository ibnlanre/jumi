export type JoinKeys<
  RootKey extends string,
  Key extends string,
  Delimiter extends string = "."
> = RootKey extends "" ? Key : `${RootKey}${Delimiter}${Key}`;
