import { Options } from "types";
import { Instance, TrackerProperties } from "./dom-tracker";
import { DomTracker } from "./dom-tracker";

export class LinkTracker extends DomTracker {
  constructor(instance: Instance) {
    super(instance, "click");
  }

  createProperties = (
    properties: TrackerProperties | ((element: Element) => TrackerProperties),
    element: Element
  ) => {
    const linkElement = element as HTMLAnchorElement;
    const props = DomTracker.createProperties(properties, element);
    if (linkElement.href) {
      props["url"] = linkElement.href;
    }
    return props;
  };

  eventHandler = (event: Event, element: Element, options) => {
    const clickEvent = event as MouseEvent;
    const linkElement = element as HTMLAnchorElement;

    options.new_tab =
      clickEvent?.which === 2 ||
      clickEvent.metaKey ||
      clickEvent.ctrlKey ||
      linkElement.target === "_blank";
    options.href = linkElement.href || linkElement.getAttribute("href");

    if (!options.new_tab) event.preventDefault();
  };

  afterTrackHandler = (options: Options) => {
    if (options.new_tab) return;
    if (options.href) location.href = options.href;
  };
}
