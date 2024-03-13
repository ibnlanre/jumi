export type Has<T, K> = K extends keyof T ? 1 : 0;
