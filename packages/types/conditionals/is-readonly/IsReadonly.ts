export type IsReadonly<T> = Readonly<T> extends T ? true : false;
