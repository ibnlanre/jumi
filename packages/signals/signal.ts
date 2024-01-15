import { Dispatch, SetStateAction, useEffect, useState } from "react";

const uuid = self.crypto.randomUUID();
const signalEvent = new Event(uuid);

/**
 * Represents a signal that maintains a current value and emits it to subscribers.
 * @template T The type of the initial value.
 */
class Sample<T> {
  /**
   * The current value of the signal.
   * @protected
   * @type {T}
   */
  protected state: T = undefined as T;

  /**
   * Whether to blame signal for causing a change.
   * @protected
   * @type {boolean}
   */
  protected blame: boolean = false;

  /**
   * The set of subscribers to the signal.
   * @protected
   * @type {Set<(data: T) => void>}
   */
  protected subscribers: Set<(data: T) => void> = new Set();

  /**
   * Creates a new signal with an optional initial value.
   * @param {T} [initialValue=undefined] The initial value of the signal.
   * @returns {Signal<T>} The new signal.
   */
  constructor(initialValue: T = undefined as T) {
    this.state = initialValue;
  }

  /**
   * Subscribes to changes in the signal.
   *
   * @param {Function} callback The callback function to execute when the signal changes.
   * @param {boolean} [immediate=true] Whether to run the callback immediately with the current state. Defaults to `true`.
   *
   * @description
   * When immediate is true, the callback will execute immediately with the current state.
   * When immediate is false or not provided, the callback will only execute after a change has occurred.
   *
   * @returns {Function} A function to unsubscribe the callback.
   */
  subscribe = (callback: (value: T) => void, immediate = true) => {
    const unsubscribe = () => {
      this.subscribers.delete(callback);
    };

    if (this.subscribers.has(callback)) return unsubscribe;
    if (immediate) callback(this.state);

    this.subscribers.add(callback);
    return unsubscribe;
  };

  /**
   * Subscribes to changes in the signal.
   *
   * @param {Function} callback The callback function to execute when the signal changes.
   */
  effect = (callback: (value: T) => void) => {
    useEffect(this.subscribe(callback), []);
  };
}

class Signal<T> extends Sample<T> {
  /**
   * Returns the current value of the signal.
   * @returns {T} The current value.
   */
  get value() {
    return this.state;
  }

  /**
   * Emits a new value to the signal and notifies subscribers.
   * @param {T} newValue The new value to emit.
   * @returns {void}
   */
  set value(newValue: T) {
    this.state = newValue;
    this.blame = true;
    self.dispatchEvent(signalEvent);
  }

  constructor(initialValue: T) {
    super(initialValue);
    self.addEventListener(uuid, () => {
      if (this.blame) {
        this.subscribers.forEach((fn) => fn(this.state));
        this.blame = false;
      }
    });
  }

  /**
   * Retrieves the current value of the signal and a setter function to update the value.
   * @returns {[T, Dispatch<SetStateAction<T>>]} The current value and a setter function.
   */
  use = () => {
    const setter: Dispatch<SetStateAction<T>> = (value) => {
      this.value =
        typeof value === "function"
          ? (value as (value: T) => T)(this.state)
          : (value as T);
    };

    return [this.state, setter] as [T, Dispatch<SetStateAction<T>>];
  };
}

class Computed<T> extends Sample<T> {
  /**
   * Returns the current value of the signal.
   * @returns {T} The current value.
   */
  get value() {
    return this.state;
  }

  /**
   * Creates a new signal with an optional initial value.
   * @param {T} [initialValue=undefined] The initial value of the signal.
   * @returns {Signal<T>} The new signal.
   */
  constructor(initialValue: () => T) {
    super(initialValue());
    self.addEventListener(uuid, () => {
      const value = initialValue();
      if (Object.is(value, this.state)) return;

      this.state = value;
      this.subscribers.forEach((fn) => fn(value));
    });
  }

  /**
   * Retrieves the current value of the signal
   * @returns {T} The current value.
   */
  use = () => {
    return [this.state];
  };
}

/**
 * Creates a new signal with an optional initial value.
 * @template T The type of the initial value.
 *
 * @param {T | () => T} [initialValue] The initial value of the signal or a function to generate the initial value.
 * @returns {Signal<T> | Computed<T>} The new signal.
 */
export function signal<T>(
  initialValue: T
): T extends () => infer U ? Computed<U> : Signal<T>;

export function signal<T>(initialValue: T | (() => T)) {
  return typeof initialValue === "function"
    ? new Computed(initialValue as () => T)
    : new Signal(initialValue as T);
}

signal.use = function useForceUpdate() {
  const [, setRender] = useState(0);

  useEffect(() => {
    const rerender = () => setRender((render) => ++render);
    self.addEventListener(uuid, rerender, { passive: true });

    return () => {
      self.removeEventListener(uuid, rerender);
    };
  }, []);
};
