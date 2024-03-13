export type FromEntries<T extends any[][]> = {
  [K in T[number][0]]: Extract<T[number], [K, any]>[1];
};
