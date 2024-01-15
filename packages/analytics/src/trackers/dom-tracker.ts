import { Options } from "types";
import { Tracker } from "./analytics";

export type Query =
  | keyof HTMLElementTagNameMap
  | keyof SVGElementTagNameMap
  | (string & {});
export interface TrackerProperties {
  [key: string]: any;
}
export type TrackCallback = (props: TrackerProperties) => void;
export type Instance = {
  track: Tracker;
};

export class DomTracker {
  protected instance: Instance;
  protected overrideEvent: string;

  protected afterTrackHandler: (options: Options) => void;
  protected eventHandler: (
    event: Event,
    element: Element,
    options: Options
  ) => void;

  constructor(instance: Instance, overrideEvent: string) {
    this.instance = instance;
    this.overrideEvent = overrideEvent;

    this.eventHandler = () => {};
    this.afterTrackHandler = () => {};
  }

  static createProperties = (
    properties: TrackerProperties | ((element: Element) => TrackerProperties),
    element: Element
  ): TrackerProperties => {
    if (typeof properties === "function") return properties(element);
    else return { ...properties };
  };

  track = (
    query: Query,
    eventName: string,
    properties: TrackerProperties = {},
    callback?: TrackCallback
  ): void => {
    const elements = document.querySelectorAll(query);

    if (!elements.length) {
      console.error(`The DOM query (${query}) returned 0 elements`);
    }

    elements.forEach((element) => {
      element.addEventListener(this.overrideEvent, (event) => {
        const options: TrackerProperties = {};
        const props = DomTracker.createProperties(properties, element);

        this.eventHandler(event, element, options);
        this.instance.track(eventName, props);
        this.afterTrackHandler(options);

        callback?.(props);
      });
    });
  };
}
