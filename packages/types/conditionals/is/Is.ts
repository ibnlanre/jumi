export type Is<T, U> = T extends U ? (U extends T ? 1 : 0) : 0;
