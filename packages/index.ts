type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};











// type Test5 = DeepPartial<Options>;

type Options = {
  useIframe: boolean;
  useShadowDom: {
    v0: boolean;
    v1: boolean;
  };
};

// type Test0 = SelectivePartial<Options, "useIframe">;
//   ^?

// type Test1 = SelectiveDeepPartial<Options, "useShadowDom_v1", "_">;
//   ^?

// type Test2 = SelectiveDeepPartial<Options, "useIframe" | "useShadowDom.v0">;
//   ^?

// type Test3 = SelectiveDeepPartial<Options, "useIframe">;
//   ^?

type Abs<T extends number> = `${T}` extends `-${infer U extends number}`
  ? U
  : T;

type Test4 = Abs<-1>;
