export type IfNot<This, Then, Else = never> = This extends 0 | false
  ? Then
  : Else;
