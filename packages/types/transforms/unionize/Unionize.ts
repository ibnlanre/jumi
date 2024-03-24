import { Intersect } from "../intersect";
import { UnionToIntersection } from "../union-to-intersection";

export type Unionize<T> = Intersect<UnionToIntersection<T>>;
