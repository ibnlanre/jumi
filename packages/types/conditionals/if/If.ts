export type If<This, Then, Else> = This extends 1 | true ? Then : Else;
