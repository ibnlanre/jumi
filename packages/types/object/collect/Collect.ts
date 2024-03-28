import { Get, Paths, Unionize } from "@ibnlanre/types";

type ObjectHelper<
  ObjectType extends Record<string, any>,
  PickType extends Record<string, Paths<ObjectType>>
> = {
  [Key in keyof PickType]: Get<ObjectType, PickType[Key]>;
};

type ArrayHelper<
  ObjectType extends Record<string, any>,
  PickType extends Paths<ObjectType>[]
> = {
  [Key in PickType[number]]: Get<ObjectType, Key>;
};

type StringHelper<
  ObjectType extends Record<string, any>,
  PickType extends string
> = {
  [Key in PickType]: Get<ObjectType, Key>;
};

export type Collect<
  ObjectType extends Record<string, any>,
  PickType extends
    | Record<string, Paths<ObjectType>>
    | Paths<ObjectType>[]
    | Paths<ObjectType>
> = Unionize<
  PickType extends Paths<ObjectType>[]
    ? ArrayHelper<ObjectType, PickType>
    : PickType extends Record<string, Paths<ObjectType>>
    ? ObjectHelper<ObjectType, PickType>
    : PickType extends Paths<ObjectType>
    ? StringHelper<ObjectType, PickType>
    : never
>;
