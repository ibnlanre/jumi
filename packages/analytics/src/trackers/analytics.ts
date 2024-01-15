import { version } from "../../package.json";
import { getDetails, date, object, browser } from "helpers";
import { Config, Data } from "types";

import { LinkTracker } from "./link-tracker";
import { TrackerProperties, TrackCallback, Query } from "./dom-tracker";
import { FormTracker } from "./form-tracker";
import { HeatmapTracker } from "./heatmap-tracker";

export type Tracker = (
  eventName: string,
  properties?: Record<string, any>,
  callback?: () => void
) => void;

type Track = (
  query: Query,
  event: string,
  properties?: TrackerProperties,
  callback?: TrackCallback
) => void;

export class Analytics {
  readonly config: Config;
  heatmapTracker: HeatmapTracker;

  trackLinks: Track;
  trackForms: Track;

  constructor(config: Config) {
    this.config = config;

    this.heatmapTracker = new HeatmapTracker({
      tracking: {
        clicks: config.tracking?.clicks,
        coldspots: config.tracking?.coldspots,
        hotspots: config.tracking?.hotspots,
        scrolls: config.tracking?.scrolls,
      },
    });

    if (config.tracking?.screenshot) {
      this.heatmapTracker.track();
    }

    const linkTracker = new LinkTracker({
      track: this.track,
    });
    this.trackLinks = linkTracker.track;

    const formTracker = new FormTracker({
      track: this.track,
    });
    this.trackForms = formTracker.track;
  }

  track: Tracker = async (eventName, properties = {}, callback) => {
    const { transport } = this.config;

    const data: Data = {
      id: object.generateGUID(),
      event: eventName,
      properties,
      version,
      time: date.timestamp(),
      details: await getDetails(this.config),
    };

    if (this.config.tracking?.screenshot) {
      const capture = await browser.getScreenCapture(this.heatmapTracker);
      data.screenshot = {
        data: capture,
        format: "image/png",
      };
    }

    if (this.config.debug) {
      const time = date.formatDate(new Date());
      console.log({ time, data });
    }

    if (transport) transport(data);
    else this.send(this.config.api, data, callback);
  };

  send = (url: string, data: Data, callback?: () => void) => {
    navigator.sendBeacon(url, JSON.stringify(data));
    callback?.();
  };
}
