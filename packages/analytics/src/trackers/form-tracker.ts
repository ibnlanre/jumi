import { Instance } from "./dom-tracker";
import { DomTracker } from "./dom-tracker";

export class FormTracker extends DomTracker {
  constructor(instance: Instance) {
    super(instance, "submit");
  }

  eventHandler = (event: Event, element: Element, options) => {
    options.element = element;
    event.preventDefault();
  };

  afterTrackHandler = (options) => {
    options.element.submit();
  };
}
