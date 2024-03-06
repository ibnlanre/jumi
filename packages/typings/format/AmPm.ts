import { HourClock } from "./HourClock";

export type AmPm<T extends string> = T extends keyof HourClock ? "PM" : "AM";
