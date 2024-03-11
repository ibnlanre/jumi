import { Number } from "@ibnlanre/types";

export type DateFormat = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
  timezone: string;
  timestamp: number;
};

export type DateFormatAsNumbers = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  timezone: string;
  timestamp: number;
};

export type DateFormatToNumbers<T extends DateFormat> = {
  [K in keyof T]: K extends "timezone" ? T[K] : Number.ToNumber<T[K]>;
} extends infer R
  ? R extends DateFormatAsNumbers
    ? DateFormatAsNumbers
    : never
  : never;

export type BaseDateFormat = {
  year: "1970";
  month: "01";
  day: "01";
  hour: "00";
  minute: "00";
  second: "00";
  millisecond: "000";
  timezone: "+00:00";
  timestamp: 0;
};
