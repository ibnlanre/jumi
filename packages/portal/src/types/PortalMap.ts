import type { PortalValue } from "./PortalValue";

/**
 * Represents a map of keys and values in the portal entries.
 * @template State The type of the state.
 * @template Path The type of the path.
 */
export type PortalMap<State, Path> = Map<Path, PortalValue<State>>;
