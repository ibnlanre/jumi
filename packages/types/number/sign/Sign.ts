export type Sign<T extends number> = `${T}` extends `-${number}` ? -1 : 1;
