export type Get<
  Out extends object,
  In extends keyof Out | (string & {}),
  FallBack = never
> = In extends keyof Out ? NonNullable<Out[In]> : FallBack;
