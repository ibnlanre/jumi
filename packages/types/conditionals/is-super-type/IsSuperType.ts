export type IsSuperType<Left, Right> = Right extends Left ? 1 : 0;
