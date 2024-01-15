import { Config, Details } from "types";
import { CONFIG } from "constants";

import { browser } from "./browser";
import { object } from "./object";

const {
  referringDomain,
  getBrowserName,
  getBrowserVersion,
  getDeviceType,
  getOS,
  getPlatform,
} = browser;

export const getDetails = (config: Config): Details => {
  const configuration = object.extendObject(CONFIG, config);

  const details: Details = {
    person: configuration.person,
    location: configuration.tracking?.location
      ? browser.getGeoLocation()
      : undefined,
    referral: configuration.tracking?.referrer
      ? {
          name: document.referrer,
          domain: referringDomain(),
        }
      : undefined,
    viewport: configuration.tracking?.viewport
      ? {
          width: screen.width,
          height: screen.height,
        }
      : undefined,
    page: configuration.tracking?.pageview
      ? {
          title: document.title,
          href: location.href,
          path: location.pathname,
          domain: location.hostname,
          protocol: location.protocol,
          search: location.search,
        }
      : undefined,
    device: configuration.tracking?.device
      ? {
          id: object.generateUUID(),
          type: getDeviceType(),
          browser: {
            name: getBrowserName(),
            version: getBrowserVersion(),
          },
          os: getOS(),
          platform: getPlatform(),
        }
      : undefined,
    marketing: configuration.tracking?.marketing
      ? browser.getMarketingParams()
      : undefined,
  };

  return object.stripEmptyProperties(details);
};
