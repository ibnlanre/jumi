export type Add<T extends Record<string, any>, K extends string, V> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
};
