import { Data } from "./data";

export type Person = {
  name: string;
  group?: string[];
} & Record<string, any>;

export type Config = {
  api: string;
  debug?: boolean;
  transport?: (data: Data) => void;
  person?: Person;
  tracking?: {
    device?: boolean;
    location?: boolean;
    pageview?: boolean;
    screenshot?: boolean;
    hotspots?: boolean;
    coldspots?: boolean;
    clicks?: boolean;
    scrolls?: boolean;
    viewport?: boolean;
    attributions?: boolean;
    referrer?: boolean;
    marketing?: boolean;
    heatmap?: boolean;
  };
};
