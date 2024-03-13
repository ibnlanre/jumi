export type Concat<Left extends any[], Right extends any[]> = [
  ...Left,
  ...Right
];
