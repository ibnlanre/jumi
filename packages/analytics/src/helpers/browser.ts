import html2canvas from "html2canvas";

import { UserAgentData } from "types";
import { CAMPAIGN_KEYWORDS, CRAWLERS, CLICK_IDENTIFIERS } from "constants";
import { object } from "./object";
import { HeatmapTracker } from "trackers/heatmap-tracker";

const getQueryParam = (url: string, param: string) => {
  const searchParams = new URLSearchParams(new URL(url).search);
  const paramValue = searchParams.get(param);

  if (paramValue !== null) {
    return decodeURIComponent(paramValue);
  } else {
    return "";
  }
};

const getCampaignParams = (defaultValue?: string) => {
  const params: Record<string, string> = {};

  for (const keyword of CAMPAIGN_KEYWORDS) {
    const kw = getQueryParam(document.URL, keyword);
    if (kw.length) params[keyword] = kw;
    else if (defaultValue !== undefined) {
      params[keyword] = defaultValue;
    }
  }
  return params;
};

const getClickParams = () => {
  const params: Record<string, string> = {};

  for (const identifier of CLICK_IDENTIFIERS) {
    const id = getQueryParam(document.URL, identifier);
    if (id.length) params[identifier] = id;
  }
  return params;
};

const getMarketingParams = () => {
  const campaigns = getCampaignParams();
  const clicks = getClickParams();

  return object.extendObject(campaigns, clicks);
};

const isBlockedUA = (ua: string) => {
  ua = ua.toLowerCase();
  return CRAWLERS.some((crawler) => ua.includes(crawler));
};

const getSearchEngine = (referrer: string) => {
  if (/https?:\/\/(.*)google.([^/?]*)/.test(referrer)) return "google";
  else if (/https?:\/\/(.*)bing.com/.test(referrer)) return "bing";
  else if (/https?:\/\/(.*)yahoo.com/.test(referrer)) return "yahoo";
  else if (/https?:\/\/(.*)duckduckgo.com/.test(referrer)) return "duckduckgo";
  else return null;
};

const getSearchInfo = (referrer: string) => {
  const search = getSearchEngine(referrer);
  const param = search === "yahoo" ? "p" : "q";
  const ret = {};

  if (search !== null) {
    ret["$search_engine"] = search;
    const keyword = getQueryParam(referrer, param);

    if (keyword.length) {
      ret["mp_keyword"] = keyword;
    }
  }

  return ret;
};

const getBrowserName = () => {
  const ua = navigator.userAgent;
  const vendor = navigator["vendor"];

  if ("userAgentData" in navigator) {
    const uad = navigator.userAgentData as UserAgentData;
    return uad.brands?.at(0)?.brand ?? "";
  }

  if (window["opera"] || ua.includes("OPR/")) {
    if (ua.includes("Mini")) return "Opera Mini";
    return "Opera";
  }
  if (/(BlackBerry|PlayBook|BB10)/i.test(ua)) return "BlackBerry";
  if (ua.includes("IEMobile") || ua.includes("WPDesktop")) {
    return "Internet Explorer Mobile";
  }
  if (ua.includes("SamsungBrowser/")) return "Samsung Internet";
  if (ua.includes("Edge") || ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("FBIOS")) return "Facebook Mobile";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("CriOS")) return "Chrome iOS";
  if (ua.includes("UCWEB") || ua.includes("UCBrowser")) return "UC Browser";
  if (ua.includes("FxiOS")) return "Firefox iOS";
  if (vendor.includes("Apple")) {
    if (ua.includes("Mobile")) return "Mobile Safari";
    return "Safari";
  }
  if (ua.includes("Android")) return "Android Mobile";
  if (ua.includes("Konqueror")) return "Konqueror";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("MSIE") || ua.includes("Trident/")) "Internet Explorer";
  if (ua.includes("Gecko")) return "Mozilla";

  return "";
};

const getBrowserVersion = () => {
  const ua = navigator.userAgent;

  if ("userAgentData" in navigator) {
    const ua = navigator.userAgentData as UserAgentData;
    return ua.brands[0].version;
  }

  const browser = getBrowserName();
  const versionRegexs = {
    "Internet Explorer Mobile": /rv:(\d+(\.\d+)?)/,
    "Microsoft Edge": /Edge?\/(\d+(\.\d+)?)/,
    Chrome: /Chrome\/(\d+(\.\d+)?)/,
    "Chrome iOS": /CriOS\/(\d+(\.\d+)?)/,
    "UC Browser": /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
    Safari: /Version\/(\d+(\.\d+)?)/,
    "Mobile Safari": /Version\/(\d+(\.\d+)?)/,
    Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
    Firefox: /Firefox\/(\d+(\.\d+)?)/,
    "Firefox iOS": /FxiOS\/(\d+(\.\d+)?)/,
    Konqueror: /Konqueror:(\d+(\.\d+)?)/,
    BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
    "Android Mobile": /android\s(\d+(\.\d+)?)/,
    "Samsung Internet": /SamsungBrowser\/(\d+(\.\.\d+)?)/,
    "Internet Explorer": /(rv:|MSIE )(\d+(\.\d+)?)/,
    Mozilla: /rv:(\d+(\.\d+)?)/,
  };

  const regex = versionRegexs[browser];
  if (!regex) return undefined;
  if (!ua.match(regex)) return undefined;
};

const getGeoLocation = () => {
  const location = {
    latitude: 0,
    longitude: 0,
  };
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      location.latitude = position.coords.latitude;
      location.longitude = position.coords.longitude;
    });
  }
  return location;
};

const getDeviceType = () => {
  const ua = navigator.userAgent;

  // Check for Windows Phone or WPDesktop
  if (/Windows Phone|WPDesktop/i.test(ua)) return "Windows Phone";

  // Check for iPad
  if (/iPad/i.test(ua)) return "iPad";

  // Check for iPod Touch
  if (/iPod/i.test(ua)) return "iPod Touch";

  // Check for iPhone
  if (/iPhone/i.test(ua)) return "iPhone";

  // Check for MacBook
  if (/Mac/i.test(ua)) return "MacBook";

  // Check for BlackBerry, PlayBook, or BB10
  if (/(BlackBerry|PlayBook|BB10)/i.test(ua)) return "BlackBerry";

  // Check for Android
  if (/Android/i.test(ua)) return "Android";

  // Check for Desktop (assuming non-mobile, non-tablet, non-MacBook)
  if (!/(Mobile|Tablet|MacBook)/i.test(ua)) return "Desktop";
};

const getOS = () => {
  const ua = navigator.userAgent;

  if ("userAgentData" in navigator) {
    const ua = navigator.userAgentData as UserAgentData;
    return ua.platform;
  }

  if (/Windows/i.test(ua)) {
    if (/Phone/.test(ua) || /WPDesktop/.test(ua)) {
      return "Windows Phone";
    }
    return "Windows";
  }
  if (/(iPhone|iPad|iPod)/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/(BlackBerry|PlayBook|BB10)/i.test(ua)) {
    return "BlackBerry";
  }
  if (/Mac/i.test(ua)) return "Mac OS X";
  if (/Linux/.test(ua)) return "Linux";
  if (/CrOS/.test(ua)) return "Chrome OS";
};

const getPlatform = () => navigator["platform"];

const referringDomain = () => {
  try {
    const url = new URL(document.referrer);
    return url.hostname || "";
  } catch (error) {
    return "";
  }
};

const getScreenCapture = async (heatmapTracker: HeatmapTracker) => {
  const element = document.documentElement;
  const image = await html2canvas(element).then((canvas) => {
    heatmapTracker.draw(canvas)
    return canvas.toDataURL("image/png");
  });
  return image;
};

export const browser = {
  getScreenCapture,
  getCampaignParams,
  getClickParams,
  getQueryParam,
  getMarketingParams,
  isBlockedUA,
  getPlatform,
  getOS,
  getSearchEngine,
  getSearchInfo,
  getBrowserName,
  getBrowserVersion,
  getGeoLocation,
  referringDomain,
  getDeviceType,
};
