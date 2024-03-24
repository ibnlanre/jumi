export type IsExactType<Left, Right> = [Right] extends [Left] ? 1 : 0;
