export type If<This, Then, Else = never> = This extends 1 | true ? Then : Else;
