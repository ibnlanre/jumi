import type { Dispatch, SetStateAction } from "react";

/**
 * Represents the result of the usePortal hook.
 * @template State The type of the state.
 */
export type PortalState<State, Data = State> = [
  Data,
  Dispatch<SetStateAction<State>>
];
