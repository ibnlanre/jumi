import { Config } from "types";

export const CONFIG: Omit<Config, "api"> = {
  tracking: {
    device: true,
    pageview: true,
    viewport: true,
    attributions: true,
    referrer: true,
    marketing: true,
    screenshot: false,
    
  },
  debug: false,
};
