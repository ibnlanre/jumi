export type Shift<T extends any[]> = T extends [any, ...infer U] ? U : never;
