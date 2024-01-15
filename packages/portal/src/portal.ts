import { cookieStorage } from "@/cookies";
import {
  GetState,
  PortalMap,
  PortalValue,
  SetStore,
  StorageType,
} from "@/definition";

import { Dimension } from "./dimension";

export class Portal {
  private portalMap: PortalMap<any, any> = new Map();

  /**
   * Deletes the item with the specified path from the internal map.
   *
   * @template Path The type of the path.
   *
   * @param {any} path The path of the item to be deleted.
   * @returns {void}
   */
  private deleteItem = <Path>(path: Path) => {
    // Unsubscribe the observable associated with the item
    const subject = this.portalMap.get(path);
    if (subject) subject.observable.unsubscribe();

    try {
      // Delete the item from the internal map
      this.portalMap.delete(path);
    } catch (error) {
      console.error(error, `Error occurred while deleting ${path}`);
    }
  };

  /**
   * Removes the item with the specified path from the storage.
   *
   * @template Path The type of the path.
   *
   * @param {any} path The path of the item to be removed.
   * @param {StorageType} storageType The type of storage to remove the item from.
   *
   * @returns {void}
   */
  private deletePersistedItem = <Path extends string>(
    path: Path,
    storageType: StorageType
  ): void => {
    switch (storageType) {
      case "local":
        try {
          // Remove the path from localStorage
          if (typeof localStorage !== "undefined")
            localStorage.removeItem(path);
        } catch (error) {
          console.error(
            `Error occurred deleting ${path} from localStorage`,
            error
          );
        }
        break;

      case "session":
        try {
          // Remove the path from sessionStorage
          if (typeof sessionStorage !== "undefined")
            sessionStorage.removeItem(path);
        } catch (error) {
          console.error(
            `Error occurred deleting ${path} from sessionStorage`,
            error
          );
        }
        break;

      case "cookie":
        // Remove the path from document.cookie
        cookieStorage.removeItem(path);
        break;

      default:
        console.warn(`Invalid storage type: ${storageType}`);
        break;
    }
  };

  /**
   * A map of portal entries.
   * @type {PortalMap}
   */
  get entries() {
    const result: Record<string, any> = {};

    this.portalMap.forEach(({ observable }, key) => {
      result[key] = observable.value;
    });

    return result;
  }

  /**
   * Retrieves the item with the specified path from the portal storage.
   *
   * @description
   * If the item does not exist, a new item will be created with the specified path.
   * If the item exists, its value will be updated with the specified value.
   *
   * @template State The type of the state.
   * @template Path The type of the path.
   *
   * @param {string} path The path of the item to be retrieved.
   * @param {State} initialState The initial state of the item.
   *
   * @returns {PortalValue<State, Path>} The portal entry with the specified path, or a new portal entry if not found.
   */
  insertItem = <State, Path extends string>(
    path: Path,
    initialState: State,
    events: {
      set?: SetStore<State>;
      get?: GetState<State>;
    }
  ): PortalValue<State> => {
    if (this.portalMap.has(path)) {
      const subject = this.portalMap.get(path) as PortalValue<State>;

      if (!subject.get) subject.get = events.get;
      if (!subject.set) subject.set = events.set;

      return subject;
    }

    const subject = {
      observable: new Dimension(initialState),
      ...events,
    };
    this.portalMap.set(path, subject);

    return subject;
  };

  /**
   * Retrieves the value of a portal entry in the portal map.
   *
   * @template State The type of the state.
   * @template Path The type of the path.
   *
   * @param {Path} path The path of the portal entry.
   *
   * @returns {State | undefined} The value of the portal entry, or `undefined` if not found.
   */
  getItem = <State, Path>(path: Path): State | undefined => {
    try {
      const subject = this.portalMap.get(path);
      if (subject) return subject.observable.value;
    } catch (error) {
      console.error(error, `Error occured while getting ${path}:`);
    }
    return undefined;
  };

  /**
   * Sets the value of a portal entry in the portal map.
   *
   * @description
   * If the entry already exists, its value will be replaced with the new value.
   * If the entry does not exist, a `warning` would be displayed in the `console`.
   * Furthermore, a new entry would be created with the specified path.
   *
   * @template State The type of the state.
   * @template Path The type of the path.
   *
   * @param {Path} path The path of the portal entry.
   * @param {State} value The value to be set for the portal entry.
   *
   * @returns {void}
   */
  setItem = <State, Path>(path: Path, value: State): void => {
    try {
      if (this.portalMap.has(path)) {
        const originalValue = this.portalMap.get(path)!;
        originalValue.observable.set(value);
      } else {
        console.warn("The path:", path, "does not exist in portal entries");
        this.portalMap.set(path, {
          observable: new Dimension(value),
        });
      }
    } catch (error) {
      console.error(error, `Error occured while setting ${path}:`);
    }
  };

  /**
   * Checks if the specified path exists in the internal map.
   *
   * @template Path The type of the path.
   *
   * @param {any} path The path to check for existence.
   * @returns {boolean} `true` if the path exists in the internal map, otherwise `false`.
   */
  hasItem = <Path>(path: Path): boolean => {
    return this.portalMap.has(path);
  };

  /**
   * Removes an item from the portal entries and browser storage based on the specified path and storage types.
   *
   * @template Path The type of the path.
   *
   * @param {any} path The path of the item to remove.
   * @param {StorageType[]} [storageTypes] An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
   *
   * @returns {void}
   */
  removeItem = <Path extends string>(
    path: Path,
    storageTypes: Array<StorageType> = ["local", "session", "cookie"]
  ): void => {
    const removeFromStorageIterator = () => {
      for (const storageType of storageTypes) {
        this.deletePersistedItem(path, storageType);
      }
    };

    try {
      // Remove from application state
      this.deleteItem(path);

      // Remove from specified storage types, if provided
      if (storageTypes.length) {
        // Check if the DOM is mounted before executing the removal
        if (typeof window !== "undefined") removeFromStorageIterator();
        else {
          // Delay the removal until the DOM is mounted
          setTimeout(removeFromStorageIterator, 0);
        }
      }
    } catch (error) {
      console.error(error, `Error occured while removing ${path}:`);
    }
  };

  /**
   * Clears all entries from the portal.
   * @returns {void}
   */
  clear = (): void => {
    try {
      this.portalMap.forEach((value, path) => {
        this.removeItem(path);
      });
    } catch (error) {
      console.error(error, `Error occured while clearing portal`);
    }
  };
}
