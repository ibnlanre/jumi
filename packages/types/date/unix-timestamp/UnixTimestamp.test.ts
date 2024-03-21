import { describe, expectTypeOf, it } from "vitest";
import { UnixTimestamp } from "./UnixTimestamp";

type DateFormat = {
  year: "2020";
  month: "02";
  day: "29";
  hour: "21";
  minute: "06";
  second: "09";
  millisecond: "999";
  timezone: "+00:00";
  timestamp: 0;
};

describe("UnixTimestamp", () => {
  it("should correctly infer the output type", () => {
    type Result = UnixTimestamp<DateFormat>;
    expectTypeOf<Result>().toEqualTypeOf<1583006769999>();
  });
});
