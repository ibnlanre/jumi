import { useEffect, useState } from "react";

import { Sample } from "./sample";
import { Signal } from "./signal";

export type Composite = Signal<any> | Computed<any, any>;
export type CompositeArray = Array<Composite>;

export function computed<Value, const DependencyList extends CompositeArray>(
  dependencyList: DependencyList,
  initialValue: (...args: DependencyList) => Value
): Computed<Value, DependencyList> {
  return new Computed(dependencyList, initialValue);
}

export class Computed<
  Value,
  const DependencyList extends CompositeArray
> extends Sample<Value> {
  /**
   * Returns the current value of the signal.
   * @returns {Value} The current value.
   */
  get value() {
    return this.state;
  }

  /**
   * Creates a new signal with an optional initial value.
   * @param {Value} [initialValue] The initial value of the signal.
   * @returns {Signal<Value>} The new signal.
   */
  constructor(
    dependencyList: DependencyList,
    initialValue: (...args: DependencyList) => Value
  ) {
    super(initialValue(...dependencyList));
    dependencyList.forEach((dependency) => {
      dependency.subscribe(() => {
        this.state = initialValue(...dependencyList);
      });
    });
  }

  /**
   * Retrieves the current value of the signal
   * @returns {Value} The current value.
   */
  use = <Select>(
    selector: (state: Value) => Select = (state) => state as unknown as Select
  ) => {
    const [state, setState] = useState(this.state);
    useEffect(this.subscribe(setState), []);
    return [selector(state)];
  };
}
