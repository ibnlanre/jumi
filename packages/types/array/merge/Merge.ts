export type Merge<Left extends any[], Right extends any[]> = [
  ...Left,
  ...Right
];
